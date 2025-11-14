import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
  arrayRemove,
  setDoc, // setDoc을 import 합니다.
} from "firebase/firestore";

const getClientSideS3Url = (key) => {
  if (!key) return "";
  return `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;
};

export const useChat = (chatRoomId, initialOtherUser, passedListingId) => {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState(initialOtherUser);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [listingDetails, setListingDetails] = useState(null);
  const [currentListingId, setCurrentListingId] = useState(null);
  const [chatRoomData, setChatRoomData] = useState(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!chatRoomId) return;
    const chatRoomRef = doc(db, "chatrooms", chatRoomId);
    const unsubscribe = onSnapshot(chatRoomRef, (doc) => {
      if (doc.exists()) {
        setChatRoomData(doc.data());
      } else {
        setChatRoomData(null);
      }
    });
    return () => unsubscribe();
  }, [chatRoomId]);

  useEffect(() => {
    if (initialOtherUser || !chatRoomId || !session?.user?.id) {
      return;
    }

    const fetchOtherUser = async () => {
      const chatRoomDocRef = doc(db, "chatrooms", chatRoomId);
      const docSnap = await getDoc(chatRoomDocRef);

      if (docSnap.exists()) {
        const chatRoomData = docSnap.data();
        const otherUserId = chatRoomData.participants.find(
          (id) => id !== session.user.id
        );

        if (otherUserId) {
          try {
            const userResponse = await fetch(`/api/users/${otherUserId}`);
            if (userResponse.ok) {
              const userData = await userResponse.json();
              setOtherUser(userData);
            } else {
              console.error("상대방 사용자 정보를 가져오는 데 실패했습니다.");
            }
          } catch (error) {
            console.error("상대방 사용자 정보 조회 중 에러 발생:", error);
          }
        }
      }
    };

    fetchOtherUser();
  }, [chatRoomId, session?.user?.id, initialOtherUser]);

  useEffect(() => {
    if (passedListingId) {
      setCurrentListingId(passedListingId);
      return;
    }
    if (chatRoomId) {
      const chatRoomDocRef = doc(db, "chatrooms", chatRoomId);
      getDoc(chatRoomDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          setCurrentListingId(docSnap.data().listingId);
        }
      });
    }
  }, [chatRoomId, passedListingId]);

  useEffect(() => {
    if (currentListingId) {
      const fetchListingDetails = async () => {
        try {
          const response = await fetch(`/api/listings/${currentListingId}`);
          if (response.ok) {
            const data = await response.json();
            setListingDetails(data);
          } else {
            console.error("상품 정보를 가져오는 데 실패했습니다:", response.statusText);
            setListingDetails(null);
          }
        } catch (error) {
          console.error("상품 정보를 가져오는 중 에러 발생:", error);
          setListingDetails(null);
        }
      };
      fetchListingDetails();
    } else {
      setListingDetails(null);
    }
  }, [currentListingId]);

  useEffect(() => {
    if (!chatRoomId || !session?.user?.id) return;

    const chatRoomRef = doc(db, "chatrooms", chatRoomId);
    const userId = session.user.id;

    const updateLastRead = () => {
      if (document.visibilityState === "visible") {
        // updateDoc을 setDoc으로 변경하여 문서가 없어도 오류가 발생하지 않도록 합니다.
        setDoc(
          chatRoomRef,
          { lastRead: { [userId]: serverTimestamp() } },
          { merge: true }
        );
      }
    };

    const messagesCollection = collection(
      db,
      "chatrooms",
      chatRoomId,
      "messages"
    );
    const q = query(messagesCollection, orderBy("timestamp", "asc"));

    const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        if (data.type === "image" && data.imageKey) {
          return {
            id: doc.id,
            ...data,
            imageUrl: getClientSideS3Url(data.imageKey),
          };
        }
        return {
          id: doc.id,
          ...data,
        };
      });
      setMessages(msgs);
      updateLastRead();
    });

    updateLastRead();
    document.addEventListener("visibilitychange", updateLastRead);

    return () => {
      unsubscribeMessages();
      document.removeEventListener("visibilitychange", updateLastRead);
      setMessages([]);
    };
  }, [chatRoomId, session?.user?.id]);

  const handleSendMessage = useCallback(
    async (e) => {
      e.preventDefault();
      if (newMessage.trim() === "" || !chatRoomId || !session?.user?.id) return;

      const chatRoomRef = doc(db, "chatrooms", chatRoomId);

      try {
        const chatRoomSnap = await getDoc(chatRoomRef);
        if (chatRoomSnap.exists()) {
          const chatRoomData = chatRoomSnap.data();
          const otherUserId = chatRoomData.participants.find(
            (p) => p !== session.user.id
          );

          if (otherUserId && chatRoomData.hiddenFor?.includes(otherUserId)) {
            // updateDoc을 setDoc으로 변경합니다.
            await setDoc(
              chatRoomRef,
              { hiddenFor: arrayRemove(otherUserId) },
              { merge: true }
            );
            console.log(
              `채팅방 ${chatRoomId}을(를) 사용자 ${otherUserId}에 대해 다시 활성화했습니다.`
            );
          }
        }
      } catch (error) {
        console.error("상대방의 채팅방 숨김 해제 중 오류 발생:", error);
      }

      const messagesCollection = collection(
        db,
        "chatrooms",
        chatRoomId,
        "messages"
      );
      await addDoc(messagesCollection, {
        type: "text",
        text: newMessage,
        senderId: session.user.id,
        timestamp: serverTimestamp(),
      });

      // updateDoc을 setDoc으로 변경합니다.
      await setDoc(
        chatRoomRef,
        {
          lastMessageTimestamp: serverTimestamp(),
          lastMessageSenderId: session.user.id,
          lastMessage: newMessage,
        },
        { merge: true }
      );

      setNewMessage("");
    },
    [chatRoomId, newMessage, session, otherUser, currentListingId]
  );

  const handleImageUpload = useCallback(
    async (file) => {
      if (!chatRoomId || !session?.user?.id) return;
      setUploading(true);

      try {
        const response = await fetch("/api/upload/presigned", {
          method: "POST",
          body: JSON.stringify({ fileName: file.name, fileType: file.type }),
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error("Presigned URL 생성 실패");

        const { url, key } = await response.json();

        const upload = await fetch(url, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        if (!upload.ok) throw new Error("S3 업로드 실패");

        const messagesCollection = collection(
          db,
          "chatrooms",
          chatRoomId,
          "messages"
        );
        await addDoc(messagesCollection, {
          type: "image",
          imageKey: key,
          senderId: session.user.id,
          timestamp: serverTimestamp(),
        });

        const chatRoomRef = doc(db, "chatrooms", chatRoomId);
        // updateDoc을 setDoc으로 변경합니다.
        await setDoc(
          chatRoomRef,
          {
            lastMessageTimestamp: serverTimestamp(),
            lastMessageSenderId: session.user.id,
            lastMessage: "사진",
          },
          { merge: true }
        );
      } catch (error) {
        console.error("이미지 업로드 중 오류 발생: ", error);
        alert("이미지 업로드에 실패했습니다.");
      } finally {
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [chatRoomId, session]
  );

  const handleFileSelect = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) {
        handleImageUpload(file);
      }
    },
    [handleImageUpload]
  );

  const handleSendLocation = useCallback(
    async (location) => {
      if (!chatRoomId || !session?.user?.id || !location) return;

      const messagesCollection = collection(
        db,
        "chatrooms",
        chatRoomId,
        "messages"
      );
      await addDoc(messagesCollection, {
        type: "location",
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        addressName: location.addressName,
        senderId: session.user.id,
        timestamp: serverTimestamp(),
      });

      const chatRoomRef = doc(db, "chatrooms", chatRoomId);
      // updateDoc을 setDoc으로 변경합니다.
      await setDoc(
        chatRoomRef,
        {
          lastMessageTimestamp: serverTimestamp(),
          lastMessageSenderId: session.user.id,
          lastMessage: location.addressName,
        },
        { merge: true }
      );
    },
    [chatRoomId, session]
  );

  return {
    session,
    status,
    messages,
    newMessage,
    setNewMessage,
    otherUser,
    uploading,
    fileInputRef,
    messagesEndRef,
    handleSendMessage,
    handleFileSelect,
    handleSendLocation,
    listingDetails,
    chatRoomData,
  };
};
