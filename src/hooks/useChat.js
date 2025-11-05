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
  // S3 버킷 이름과 리전 정보를 환경 변수에서 가져와 완전한 URL을 구성합니다.
  return `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;
};

/**
 * 채팅방 관련 모든 로직을 관리하는 커스텀 훅입니다.
 * 이 훅은 메시지 전송, 수신, 이미지 업로드, 실시간 업데이트 등 채팅방의 핵심 기능들을 캡슐화합니다.
 * UI 컴포넌트로부터 비즈니스 로직을 분리하여 코드의 재사용성과 유지보수성을 높이는 것을 목표로 합니다.
 * @param {string} chatRoomId - 현재 참여하고 있는 채팅방의 고유 ID.
 * @param {object} initialOtherUser - 채팅 상대방의 초기 정보 객체.
 * @returns {object} 채팅 UI 컴포넌트에 필요한 상태(state)와 핸들러 함수들을 담은 객체.
 */
export const useChat = (chatRoomId, initialOtherUser) => {
  // --- 상태(State) 및 훅(Hooks) 초기화 ---

  // useSession: NextAuth를 통해 현재 사용자의 로그인 상태 및 세션 정보를 가져옵니다.
  const { data: session, status } = useSession();
  // messages: 채팅방의 메시지 목록을 저장하는 상태입니다.
  const [messages, setMessages] = useState([]);
  // newMessage: 사용자가 입력창에 입력하는 새 메시지의 텍스트를 관리하는 상태입니다.
  const [newMessage, setNewMessage] = useState("");
  // otherUser: 채팅 상대방의 정보를 저장하는 상태입니다.
  const [otherUser, setOtherUser] = useState(initialOtherUser);
  // uploading: 이미지 업로드 진행 상태를 나타내는 boolean 값입니다. (true이면 업로드 중)
  const [uploading, setUploading] = useState(false);
  // fileInputRef: '이미지 첨부' 버튼 클릭 시 실제 파일 input 엘리먼트를 트리거하기 위해 사용됩니다.
  const fileInputRef = useRef(null);
  // messagesEndRef: 새 메시지가 추가될 때 채팅 목록의 맨 아래로 부드럽게 스크롤하기 위해 사용됩니다.
  const messagesEndRef = useRef(null);

  // --- 사이드 이펙트 (useEffect) --- //

  // [메시지 자동 스크롤]
  // messages 상태가 업데이트될 때마다 (즉, 새 메시지가 오거나 기존 메시지가 로드될 때)
  // 채팅창을 맨 아래로 스크롤하여 최신 메시지를 보여줍니다.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]); // messages 배열이 변경될 때마다 이 effect가 실행됩니다.

  // [Firestore 메시지 실시간 구독]
  // chatRoomId가 유효할 때, Firestore 데이터베이스에 연결하여 해당 채팅방의 메시지를 실시간으로 가져옵니다.
  useEffect(() => {
    // chatRoomId가 없으면 (아직 로딩 중이거나 유효하지 않은 경우) 함수를 즉시 종료합니다.
    if (!chatRoomId) return;

    // Firestore에서 'chatrooms' 컬렉션 안의 특정 chatRoomId 문서 내부에 있는 'messages' 서브컬렉션을 참조합니다.
    const messagesCollection = collection(db, "chatrooms", chatRoomId, "messages");
    // 메시지를 'timestamp'(타임스탬프) 필드를 기준으로 오름차순(시간순)으로 정렬하는 쿼리를 생성합니다.
    const q = query(messagesCollection, orderBy("timestamp", "asc"));

    // onSnapshot 함수는 쿼리 결과를 실시간으로 수신 대기합니다.
    // 데이터베이스에 변경이 생길 때마다 (새 메시지 추가, 수정, 삭제 등) 이 콜백 함수가 실행됩니다.
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      // querySnapshot.docs는 쿼리 결과에 해당하는 모든 문서(메시지)의 배열입니다.
      const msgs = querySnapshot.docs.map((doc) => {
        const data = doc.data(); // 각 문서의 데이터를 가져옵니다.
        // 메시지 타입이 'image'이고 'imageKey' 필드가 존재하는 경우,
        // S3 키를 전체 URL로 변환하여 'imageUrl' 필드를 추가합니다.
        if (data.type === "image" && data.imageKey) {
          return {
            id: doc.id, // 문서의 고유 ID
            ...data, // 기존 데이터
            imageUrl: getClientSideS3Url(data.imageKey), // S3 URL 생성
          };
        }
        // 이미지 메시지가 아닌 경우, 데이터를 그대로 반환합니다.
        return {
          id: doc.id,
          ...data,
        };
      });
      // 가져온 메시지 배열로 'messages' 상태를 업데이트합니다.
      setMessages(msgs);
    });

    // 컴포넌트가 언마운트될 때 (예: 사용자가 채팅방을 나갈 때)
    // onSnapshot 리스너를 정리(unsubscribe)하여 메모리 누수를 방지합니다.
    return () => unsubscribe();
  }, [chatRoomId]); // chatRoomId가 변경될 때만 이 effect를 재실행합니다.

  // [마지막 읽은 시간 업데이트]
  // 사용자가 채팅방에 들어왔을 때, 해당 사용자의 '마지막으로 읽은 시간'을 현재 시간으로 업데이트합니다.
  // 이를 통해 상대방에게 내가 어디까지 메시지를 읽었는지 알려줄 수 있습니다.
  useEffect(() => {
    // chatRoomId나 사용자 ID가 없으면 실행하지 않습니다.
    if (!chatRoomId || !session?.user?.id) return;
    // 업데이트할 채팅방 문서의 참조를 가져옵니다.
    const chatRoomRef = doc(db, "chatrooms", chatRoomId);
    const userId = session.user.id;
    // chatRoom 문서를 업데이트합니다.
    // 'lastRead' 맵 필드에 현재 사용자 ID를 키로, 서버의 현재 시간을 값으로 설정합니다.
    // 예: { lastRead: { 'user123': (server timestamp) } }
    updateDoc(chatRoomRef, { [`lastRead.${userId}`]: serverTimestamp() });
  }, [chatRoomId, session?.user?.id]); // chatRoomId 또는 사용자 ID가 변경될 때만 실행됩니다.

  // --- 핸들러 함수 (이벤트 처리) --- //

  /**
   * 사용자가 입력한 텍스트 메시지를 Firestore에 전송하는 함수입니다.
   * useCallback을 사용하여 chatRoomId, newMessage, session이 변경되지 않는 한 함수를 재생성하지 않도록 최적화합니다.
   */
  const handleSendMessage = useCallback(
    async (e) => {
      e.preventDefault(); // form의 기본 제출 동작(페이지 새로고침)을 막습니다.
      // 메시지가 비어있거나, chatRoomId 또는 사용자 ID가 없으면 전송하지 않습니다.
      if (newMessage.trim() === "" || !chatRoomId || !session?.user?.id) return;

      // 메시지를 추가할 Firestore 컬렉션의 참조를 가져옵니다.
      const messagesCollection = collection(db, "chatrooms", chatRoomId, "messages");
      // 새 메시지 문서를 추가합니다.
      await addDoc(messagesCollection, {
        type: "text", // 메시지 타입
        text: newMessage, // 메시지 내용
        senderId: session.user.id, // 보낸 사람 ID
        timestamp: serverTimestamp(), // 서버 시간 기준 타임스탬프
      });

      // 채팅방 목록에 표시될 마지막 메시지 정보를 업데이트합니다.
      const chatRoomRef = doc(db, "chatrooms", chatRoomId);
      await updateDoc(chatRoomRef, {
        lastMessageTimestamp: serverTimestamp(), // 마지막 메시지 시간
        lastMessageSenderId: session.user.id, // 마지막 메시지 보낸 사람
        lastMessage: newMessage, // 마지막 메시지 내용
      });

      // 메시지 전송 후 입력창을 비웁니다.
      setNewMessage("");
    },
    [chatRoomId, newMessage, session] // 의존성 배열
  );

  /**
   * 선택된 이미지 파일을 S3에 업로드하고, 해당 이미지 정보를 Firestore에 메시지로 전송하는 함수입니다.
   */
  const handleImageUpload = useCallback(
    async (file) => {
      // 필수 정보가 없으면 업로드를 중단합니다.
      if (!chatRoomId || !session?.user?.id) return;
      setUploading(true); // 업로드 상태를 true로 설정하여 UI에 로딩 표시를 할 수 있습니다.

      try {
        // [1단계: Presigned URL 요청]
        // 클라이언트에서 직접 AWS 자격증명을 사용하지 않고 안전하게 파일을 업로드하기 위해
        // 우리 서버에 'Presigned URL'을 요청합니다. 이 URL은 제한된 시간 동안만 유효한 업로드 전용 URL입니다.
        const response = await fetch("/api/upload/presigned", {
          method: "POST",
          body: JSON.stringify({ fileName: file.name, fileType: file.type }),
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error("Presigned URL 생성 실패");

        const { url, key } = await response.json(); // 서버로부터 받은 Presigned URL과 파일의 S3 키

        // [2단계: S3에 파일 업로드]
        // 받은 Presigned URL을 사용하여 파일을 S3 버킷에 직접 업로드합니다.
        const upload = await fetch(url, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        if (!upload.ok) throw new Error("S3 업로드 실패");

        // [3단계: Firestore에 메시지 저장]
        // 업로드가 성공하면, 이미지의 전체 URL 대신 S3 객체 'key'를 Firestore에 저장합니다.
        // 이는 URL 구조가 변경될 경우에 유연하게 대처할 수 있게 해줍니다.
        const messagesCollection = collection(db, "chatrooms", chatRoomId, "messages");
        await addDoc(messagesCollection, {
          type: "image",
          imageKey: key, // S3 객체 키 저장
          senderId: session.user.id,
          timestamp: serverTimestamp(),
        });

        // 채팅방의 마지막 메시지 정보를 '사진'으로 업데이트합니다.
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
        // 업로드가 성공하든 실패하든, 업로드 상태를 false로 되돌립니다.
        setUploading(false);
        // 파일 입력 필드의 값을 초기화하여 동일한 파일을 다시 선택할 수 있도록 합니다.
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [chatRoomId, session] // 의존성 배열
  );

  /**
   * 파일 input 엘리먼트의 'change' 이벤트를 처리하는 함수입니다.
   * 사용자가 파일을 선택하면 `handleImageUpload` 함수를 호출합니다.
   */
  const handleFileSelect = useCallback(
    (e) => {
      const file = e.target.files?.[0]; // 선택된 파일 가져오기
      if (file) {
        handleImageUpload(file); // 이미지 업로드 처리 함수 호출
      }
    },
    [handleImageUpload] // 의존성 배열
  );

  /**
   * 위치 정보를 받아 Firestore에 메시지로 전송하는 함수입니다.
   */
  const handleSendLocation = useCallback(
    async (location) => {
      // 필수 정보가 없으면 전송을 중단합니다.
      if (!chatRoomId || !session?.user?.id || !location) return;

      // 메시지를 추가할 Firestore 컬렉션의 참조를 가져옵니다.
      const messagesCollection = collection(db, "chatrooms", chatRoomId, "messages");
      // 새 위치 메시지 문서를 추가합니다.
      await addDoc(messagesCollection, {
        type: "location", // 메시지 타입
        location: {
          latitude: location.latitude, // 위도
          longitude: location.longitude, // 경도
        },
        addressName: location.addressName, // 주소 이름
        senderId: session.user.id, // 보낸 사람 ID
        timestamp: serverTimestamp(), // 서버 시간 기준 타임스탬프
      });

      // 채팅방 목록에 표시될 마지막 메시지 정보를 주소 이름으로 업데이트합니다.
      const chatRoomRef = doc(db, "chatrooms", chatRoomId);
      await updateDoc(chatRoomRef, {
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSenderId: session.user.id,
        lastMessage: location.addressName,
      });
    },
    [chatRoomId, session] // 의존성 배열
  );

  // --- 반환 값 --- //
  // 이 훅을 사용하는 컴포넌트에게 필요한 상태와 함수들을 객체 형태로 반환합니다.
  return {
    session, // 현재 사용자 세션 정보
    status, // 세션 로딩 상태 ('loading', 'authenticated', 'unauthenticated')
    messages, // 메시지 목록
    newMessage, // 현재 입력 중인 새 메시지 텍스트
    setNewMessage, // newMessage 상태를 업데이트하는 함수
    otherUser, // 채팅 상대방 정보
    uploading, // 이미지 업로드 진행 상태
    fileInputRef, // 파일 input 엘리먼트에 대한 ref
    messagesEndRef, // 메시지 목록 끝에 대한 ref
    handleSendMessage, // 텍스트 메시지 전송 함수
    handleFileSelect, // 파일 선택 처리 함수
    handleSendLocation, // 위치 전송 함수
  };
};