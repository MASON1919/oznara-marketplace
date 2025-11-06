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
} from "firebase/firestore";

/**
 * 클라이언트(브라우저) 환경에서 S3 객체 키를 전체 URL로 변환하는 헬퍼 함수.
 * 이 함수는 브라우저에서 실행되므로, NEXT_PUBLIC_ 접두사가 붙은 환경 변수가 필요합니다.
 * @param {string} key - S3 객체 키 (예: 'images/abc.png')
 * @returns {string} - 전체 S3 URL
 */
const getClientSideS3Url = (key) => {
  return `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;
};

/**
 * 채팅방 관련 모든 로직을 관리하는 커스텀 훅입니다.
 * UI 컴포넌트로부터 로직을 분리하여 코드의 재사용성과 유지보수성을 높입니다.
 * @param {string} chatRoomId - 현재 채팅방의 ID
 * @returns {object} 채팅 UI에 필요한 상태와 핸들러 함수들을 담은 객체
 */
export const useChat = (chatRoomId, initialOtherUser) => {
  // --- 상태 및 훅 초기화 ---
  const { data: session, status } = useSession(); // NextAuth 세션 정보
  const [messages, setMessages] = useState([]); // 메시지 목록 상태
  const [newMessage, setNewMessage] = useState(""); // 새로 입력된 메시지 텍스트 상태
  const [otherUser, setOtherUser] = useState(initialOtherUser); // 채팅 상대방 정보 상태를 initialOtherUser로 초기화
  const [uploading, setUploading] = useState(false); // 이미지 업로드 상태
  const fileInputRef = useRef(null); // 파일 입력(input) DOM 요소를 위한 ref
  const messagesEndRef = useRef(null); // 메시지 목록의 맨 아래를 참조하기 위한 ref

  // --- 사이드 이펙트 (useEffect) --- //

  // 메시지 목록이 업데이트될 때마다 맨 아래로 자동 스크롤합니다.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Firestore로부터 메시지 목록을 실시간으로 가져옵니다.
  useEffect(() => {
    if (!chatRoomId) return; // 채팅방 ID가 없으면 아무것도 하지 않음

    // 해당 채팅방의 messages 서브컬렉션을 참조합니다.
    const messagesCollection = collection(db, "chatrooms", chatRoomId, "messages");
    // timestamp 필드를 기준으로 오름차순 정렬하여 쿼리합니다.
    const q = query(messagesCollection, orderBy("timestamp", "asc"));

    // onSnapshot으로 컬렉션의 변화를 실시간으로 감지합니다.
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        // *** 변경점 ***
        // Firestore에 imageKey만 저장하고, 클라이언트에서 전체 URL을 생성합니다.
        // 따라서 이미지 메시지인 경우, 화면에 보여주기 직전에 전체 URL을 만들어줍니다.
        if (data.type === "image" && data.imageKey) {
          return {
            id: doc.id,
            ...data,
            imageUrl: getClientSideS3Url(data.imageKey), // S3 키를 전체 URL로 변환
          };
        }
        return {
          id: doc.id,
          ...data,
        };
      });
      setMessages(msgs); // 메시지 상태 업데이트
    });

    // 컴포넌트가 언마운트될 때 실시간 리스너를 정리(unsubscribe)합니다.
    return () => unsubscribe();
  }, [chatRoomId]);

  // 채팅방 진입 시 마지막 읽은 시간을 업데이트합니다.
  useEffect(() => {
    if (!chatRoomId || !session?.user?.id) return;
    const chatRoomRef = doc(db, "chatrooms", chatRoomId);
    const userId = session.user.id;
    // 컴포넌트 마운트 시 한 번만 업데이트
    updateDoc(chatRoomRef, { [`lastRead.${userId}`]: serverTimestamp() });
  }, [chatRoomId, session?.user?.id]); // chatRoomId 또는 session.user.id가 변경될 때만 실행

  // --- 핸들러 함수 --- //

  /** 텍스트 메시지를 전송하는 함수 */
  const handleSendMessage = useCallback(
    async (e) => {
      e.preventDefault();
      if (newMessage.trim() === "" || !chatRoomId || !session?.user?.id) return;

      const messagesCollection = collection(db, "chatrooms", chatRoomId, "messages");
      await addDoc(messagesCollection, {
        type: "text",
        text: newMessage,
        senderId: session.user.id,
        timestamp: serverTimestamp(),
      });

      // 채팅방 정보 업데이트
      const chatRoomRef = doc(db, "chatrooms", chatRoomId);
      await updateDoc(chatRoomRef, {
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSenderId: session.user.id,
        lastMessage: newMessage,
      });

      setNewMessage("");
    },
    [chatRoomId, newMessage, session]
  );

  /** 이미지를 S3에 업로드하고 이미지 메시지를 전송하는 함수 */
  const handleImageUpload = useCallback(
    async (file) => {
      if (!chatRoomId || !session?.user?.id) return;
      setUploading(true);
      try {
        // 1. 서버에 Presigned URL 요청
        const response = await fetch("/api/upload/presigned", {
          method: "POST",
          body: JSON.stringify({ fileName: file.name, fileType: file.type }),
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error("Presigned URL 생성 실패");

        const { url, key } = await response.json();

        // 2. Presigned URL을 사용해 S3에 직접 파일 업로드
        const upload = await fetch(url, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        if (!upload.ok) throw new Error("S3 업로드 실패");

        // *** 변경점 ***
        // 3. 업로드 완료 후, Firestore에 이미지 URL 대신 'key'를 저장합니다.
        const messagesCollection = collection(db, "chatrooms", chatRoomId, "messages");
        await addDoc(messagesCollection, {
          type: "image",
          imageKey: key, // S3 객체 키 저장
          senderId: session.user.id,
          timestamp: serverTimestamp(),
        });

        // 채팅방 정보 업데이트
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

  /** 파일 선택 이벤트를 처리하는 함수 */
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

      const messagesCollection = collection(db, "chatrooms", chatRoomId, "messages");
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

      // 채팅방 정보 업데이트
      const chatRoomRef = doc(db, "chatrooms", chatRoomId);
      await updateDoc(chatRoomRef, {
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSenderId: session.user.id,
        lastMessage: location.addressName,
      });
    },
    [chatRoomId, session]
  );

  // --- 반환 값 --- //
  // UI 컴포넌트에서 사용할 상태와 함수들을 반환합니다.
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
  };
};