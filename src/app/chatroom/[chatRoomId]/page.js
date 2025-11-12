// 이 파일은 웹 브라우저(클라이언트)에서 실행되는 코드입니다.
'use client';

// React에서 필요한 기능들을 가져옵니다.
// `useState`: 변수를 만들고 관리하는 기능 (예: 채팅방 ID, 모달 열림 여부)
// `useEffect`: 화면이 처음 나타나거나 특정 상황이 바뀔 때 어떤 작업을 하는 기능
// `use`: 새로운 기능으로, 아직 준비되지 않은 정보(약속)를 기다렸다가 꺼내주는 기능
import { useState, useEffect, use } from 'react';

// 채팅과 관련된 모든 복잡한 기능(메시지 가져오기, 보내기 등)을 모아둔 `useChat`이라는 도우미 훅을 가져옵니다.
import { useChat } from '@/hooks/useChat';

// 화면 디자인을 위한 카드(Card) 형태의 UI 부품들을 가져옵니다.
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

// 웹 주소(URL)에서 추가 정보를 읽어오는 Next.js의 도우미 훅을 가져옵니다.
import { useSearchParams } from 'next/navigation';

// 채팅방 화면을 구성하는 작은 부품(컴포넌트)들을 가져옵니다.
import ChatHeader from "@/components/chat/ChatHeader"; // 채팅방 상단 제목 부분
import MessageList from "@/components/chat/MessageList"; // 메시지 목록 부분
import MessageInput from "@/components/chat/MessageInput"; // 메시지 입력창 부분
import LocationPickerModal from '@/components/chat/LocationPickerModal'; // 위치 선택 팝업창 부분

/**
 * 이 파일은 개별 채팅방 화면을 보여주는 페이지입니다.
 * 
 * 이 페이지는 직접 복잡한 계산이나 데이터 처리를 하기보다는,
 * 화면의 전체적인 틀(레이아웃)을 만들고,
 * `useChat`이라는 똑똑한 도우미 훅으로부터 필요한 정보와 기능들을 받아와서
 * 각 화면 부품(ChatHeader, MessageList, MessageInput 등)에 전달해주는
 * 일종의 "지휘자" 또는 "조립 공장" 역할을 합니다.
 * 
 * @param {object} props - Next.js가 이 페이지에 전달해주는 정보들
 * @param {Promise<object>} props.params - 웹 주소에서 가져온 정보(예: 채팅방 ID)인데, 
 *                                        바로 쓸 수 없고 잠시 기다려야 하는 "약속" 같은 상태로 전달됩니다.
 */
export default function ChatPage({ params: paramsPromise }) { // `params`라는 이름 대신 `paramsPromise`라고 부르겠습니다.
  // --- 화면에서 사용할 변수(State)와 도우미 기능(Hook)들을 준비하는 곳 ---

  // `use()` 훅을 사용해서 `paramsPromise` (아직 준비되지 않은 정보의 "약속")를 기다렸다가,
  // 실제 정보(`params` 객체)를 꺼내옵니다. 
  // 이 `use()` 훅 덕분에 정보가 완전히 준비될 때까지 이 페이지는 잠시 멈춰서 기다립니다.
  const params = use(paramsPromise);

  // 웹 주소에서 가져온 채팅방 ID(`chatRoomId`)를 저장할 변수입니다.
  // 처음에는 비어있다가, 정보가 준비되면 채워집니다.
  const [resolvedChatRoomId, setResolvedChatRoomId] = useState(null);

  // 웹 주소 뒤에 붙는 `?key=value` 형태의 추가 정보(쿼리 파라미터)를 읽어오는 도우미입니다.
  const searchParams = useSearchParams();
  
  // `otherUser`라는 이름으로 전달된 쿼리 파라미터 값을 가져옵니다.
  // (이 정보는 보통 `ChatButton`에서 채팅방을 열 때 상대방 정보를 미리 넘겨줍니다.)
  const otherUserParam = searchParams.get('otherUser');
  const listingId = searchParams.get('listingId');
  
  // 가져온 `otherUserParam`이 있다면, JSON 형태의 문자열을 실제 JavaScript 객체로 변환합니다.
  // 이 정보는 `useChat` 도우미 훅에 전달되어, 채팅방에 들어서자마자 상대방 정보를 보여주는 데 쓰입니다.
  const initialOtherUser = otherUserParam ? JSON.parse(decodeURIComponent(otherUserParam)) : null;

  // `useChat`이라는 똑똑한 도우미 훅을 호출해서,
  // 채팅방을 만드는 데 필요한 모든 정보(메시지 목록, 내 세션 정보 등)와 기능(메시지 보내기, 파일 보내기 등)을 한 번에 가져옵니다.
  // 이렇게 하면 이 페이지는 복잡한 채팅 로직을 직접 다룰 필요 없이, 가져온 기능들을 사용하기만 하면 됩니다.
  const {
    session,          // 현재 로그인한 내 정보
    status,           // 내 로그인 상태 (로딩 중, 로그인됨, 로그인 안 됨 등)
    router,           // 페이지 이동을 도와주는 도우미
    messages,         // 채팅방의 모든 메시지 목록 (실시간으로 업데이트됨)
    newMessage,       // 내가 지금 입력하고 있는 메시지 내용
    setNewMessage,    // `newMessage` 변수를 바꾸는 기능
    otherUser,        // 채팅 상대방의 정보
    uploading,        // 파일(사진 등)을 올리는 중인지 여부
    fileInputRef,     // 파일 선택 버튼을 숨겨두고 대신 클릭하게 할 때 쓰는 참조
    messagesEndRef,   // 메시지 목록이 길어질 때 자동으로 맨 아래로 스크롤하기 위한 참조
    handleSendMessage,// 메시지를 보내는 기능
    handleFileSelect, // 파일을 선택했을 때 처리하는 기능
    handleSendLocation, // 위치 정보를 보내는 기능
    listingDetails,   // 현재 채팅방과 연결된 상품의 상세 정보
  } = useChat(resolvedChatRoomId, initialOtherUser, listingId); // 채팅방 ID, 초기 상대방 정보, 상품 ID를 `useChat` 훅에 전달합니다.

  // 위치 선택 팝업창(모달)이 열려있는지 닫혀있는지 상태를 관리하는 변수입니다.
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // --- 특정 상황이 발생했을 때 실행되는 작업들 (Side Effects) ---

  // 이 페이지가 처음 나타나거나, 웹 주소에서 가져온 정보(`params`)가 바뀔 때 실행됩니다.
  useEffect(() => {
    // `params` 객체 안에 `chatRoomId`가 있다면,
    // 그 값을 `resolvedChatRoomId` 변수에 저장합니다.
    if (params.chatRoomId) {
      setResolvedChatRoomId(params.chatRoomId);
    }
  }, [params]); // `params` 정보가 바뀔 때마다 이 작업이 다시 실행됩니다.

  // 내 로그인 상태(`status`)를 계속 지켜보다가,
  // 만약 로그인되지 않은 상태(`unauthenticated`)가 되면 로그인 페이지로 이동시킵니다.
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]); // `status`나 `router`가 바뀔 때마다 이 작업이 다시 실행됩니다.


  // --- 화면을 보여주기 전에 특정 조건을 확인하는 부분 ---
  // 정보가 완전히 준비되기 전에는 사용자에게 로딩 중임을 알려줍니다.

  // 채팅방 ID가 아직 준비되지 않았다면 로딩 메시지를 보여줍니다.
  if (!resolvedChatRoomId) {
    return <div>채팅방 정보를 불러오는 중...</div>;
  }
  // 내 로그인 상태가 '로딩 중'이거나 '로그인 안 됨' 상태라면 로딩 메시지를 보여줍니다.
  if (status === 'loading' || status === 'unauthenticated') {
    return <div>사용자 세션 로딩 중...</div>;
  }
  
  // 내 세션 정보가 없다면 로딩 메시지를 보여줍니다.
  if (!session) {
    return <div>Loading...</div>;
  }

  /**
   * 위치 선택 팝업창에서 위치를 선택하고 '위치 전송' 버튼을 눌렀을 때 실행되는 기능입니다.
   * @param {object} location - 선택된 위치의 상세 정보 (위도, 경도, 주소 등)
   */
  const onSendLocation = (location) => {
    handleSendLocation(location); // `useChat` 훅의 위치 전송 기능을 호출합니다.
    setIsLocationModalOpen(false); // 위치 선택 팝업창을 닫습니다.
  };

  // --- 실제 화면을 그리는 부분 (UI 렌더링) ---
  // 이 페이지는 가져온 정보와 기능들을 각 화면 부품에 전달하여 최종 화면을 조립합니다.
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto w-full">
      <Card className="w-full h-full flex flex-col">
        <CardHeader>
          {/* [수정] ChatHeader에 chatRoomId prop을 전달합니다. */}
          <ChatHeader otherUser={otherUser} listing={listingDetails} chatRoomId={resolvedChatRoomId} />
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto p-4">
          {/* 메시지 목록 부분: 모든 메시지를 시간 순서대로 보여줍니다. */}
          <MessageList 
            messages={messages} 
            session={session} 
            otherUser={otherUser} 
            messagesEndRef={messagesEndRef} 
          />
        </CardContent>
        <CardFooter className="p-4">
          {/* 메시지 입력창 부분: 텍스트 입력, 파일 첨부, 위치 전송, 메시지 보내기 버튼 등이 있습니다. */}
          <MessageInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleSendMessage={handleSendMessage}
            handleFileSelect={handleFileSelect}
            uploading={uploading}
            fileInputRef={fileInputRef}
            setIsLocationModalOpen={setIsLocationModalOpen}
          />
        </CardFooter>
      </Card>
      {/* 위치 선택 팝업창: '위치 전송' 버튼을 누르면 나타납니다. */}
      <LocationPickerModal 
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSendLocation={onSendLocation}
      />
    </div>
  );
}
