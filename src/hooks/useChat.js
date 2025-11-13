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
} from "firebase/firestore";

const getClientSideS3Url = (key) => {
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
  const [chatRoomData, setChatRoomData] = useState(null); // [추가] 채팅방 데이터 상태

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // [추가] 채팅방 문서 실시간 구독
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

  // [로직 보강] otherUser 정보가 없을 때 Firestore에서 조회
  useEffect(() => {
    // initialOtherUser가 있거나, chatRoomId 또는 세션 정보가 없으면 실행하지 않음
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
            // 사용자 정보를 가져오는 API 호출
            const userResponse = await fetch(`/api/users/${otherUserId}`);
            if (userResponse.ok) {
              const userData = await userResponse.json();
              setOtherUser(userData); // 상태 업데이트
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


  // 1단계 로직: currentListingId 확정
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

  // 2단계 로직: 확정된 currentListingId로 제품 정보 조회
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

  // Firestore 메시지 실시간 구독 및 마지막 읽은 시간 업데이트 통합 로직
  useEffect(() => {
    if (!chatRoomId || !session?.user?.id) return;

    const chatRoomRef = doc(db, "chatrooms", chatRoomId);
    const userId = session.user.id;

    // lastRead 타임스탬프를 업데이트하는 함수
    const updateLastRead = () => {
      // 탭이 활성화 상태일 때만 업데이트
      if (document.visibilityState === 'visible') {
        updateDoc(chatRoomRef, { [`lastRead.${userId}`]: serverTimestamp() });
      }
    };

    // 1. 메시지 컬렉션 구독 설정
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
      // 2. 새 메시지 도착 시, 탭이 활성화 상태라면 lastRead 업데이트
      updateLastRead();
    });

    // 3. 컴포넌트 마운트 시 또는 chatRoomId/session 변경 시 즉시 업데이트
    updateLastRead();

    // 4. 탭 활성화 상태 변경 시 업데이트 이벤트 리스너 추가
    document.addEventListener('visibilitychange', updateLastRead);

    // 클린업 함수: 구독 및 이벤트 리스너 해제
    return () => {
      unsubscribeMessages();
      document.removeEventListener('visibilitychange', updateLastRead);
      setMessages([]); // [추가] 컴포넌트 언마운트 시 메시지 목록 초기화
    };
  }, [chatRoomId, session?.user?.id]);



  const handleSendMessage = useCallback(
    async (e) => {
      e.preventDefault();
      if (newMessage.trim() === "" || !chatRoomId || !session?.user?.id) return;

      const chatRoomRef = doc(db, "chatrooms", chatRoomId);

      // [추가] 메시지 보내기 전, 상대방이 채팅을 숨겼는지 확인하고 숨김 해제
      try {
        const chatRoomSnap = await getDoc(chatRoomRef);
        if (chatRoomSnap.exists()) {
          const chatRoomData = chatRoomSnap.data();
          const otherUserId = chatRoomData.participants.find(p => p !== session.user.id);

          if (otherUserId && chatRoomData.hiddenFor?.includes(otherUserId)) {
            // 상대방의 숨김 상태를 해제합니다.
            await updateDoc(chatRoomRef, {
              hiddenFor: arrayRemove(otherUserId)
            });
            // TODO: 여기에 상대방에게 새로운 메시지가 왔다는 푸시 알림을 보내는 로직을 추가할 수 있습니다.
            console.log(`채팅방 ${chatRoomId}을(를) 사용자 ${otherUserId}에 대해 다시 활성화했습니다.`);
          }
        }
      } catch (error) {
        console.error("상대방의 채팅방 숨김 해제 중 오류 발생:", error);
        // 오류가 발생하더라도 메시지 전송은 계속 시도합니다.
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

      await updateDoc(chatRoomRef, {
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSenderId: session.user.id,
        lastMessage: newMessage,
      });

      setNewMessage("");
    },
    [chatRoomId, newMessage, session, otherUser, currentListingId] // 의존성 배열 업데이트
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
        await updateDoc(chatRoomRef, {
          lastMessageTimestamp: serverTimestamp(),
          lastMessageSenderId: session.user.id,
          lastMessage: "사진",
        });
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
      await updateDoc(chatRoomRef, {
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSenderId: session.user.id,
        lastMessage: location.addressName,
      });
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
    chatRoomData, // [추가]
  };
};