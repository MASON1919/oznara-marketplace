'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { useSearchParams } from 'next/navigation'; // ADD THIS IMPORT

import ChatHeader from "@/components/chat/ChatHeader";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import LocationPickerModal from '@/components/chat/LocationPickerModal';

/**
 * 채팅방 페이지 컴포넌트입니다.
 * 이 컴포넌트는 UI의 전체적인 구조(레이아웃)를 담당하고,
 * 실제 데이터와 로직은 `useChat` 훅으로부터 받아옵니다.
 */
export default function ChatPage({ params }) {
  // --- 상태 및 훅 초기화 ---

  // Next.js의 동적 라우트 파라미터 `[chatRoomId]`를 상태로 관리합니다.
  // 파라미터가 비동기적으로 해결될 수 있는 경우를 대비합니다.
  const [resolvedChatRoomId, setResolvedChatRoomId] = useState(null);
  const searchParams = useSearchParams(); // ADD THIS
  const otherUserParam = searchParams.get('otherUser'); // ADD THIS
  const initialOtherUser = otherUserParam ? JSON.parse(otherUserParam) : null; // ADD THIS

  // `useChat` 훅을 호출하여 채팅에 필요한 모든 데이터와 함수를 가져옵니다。
  // 이를 통해 UI와 로직이 분리됩니다.
  const {
    session,
    status,
    router,
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
  } = useChat(resolvedChatRoomId, initialOtherUser); // MODIFY THIS LINE

  // --- 사이드 이펙트 ---

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // 컴포넌트가 마운트되거나 params가 변경될 때 chatRoomId를 상태에 설정합니다.
  useEffect(() => {
    Promise.resolve(params)
      .then(resolved => {
        setResolvedChatRoomId(resolved.chatRoomId);
      })
      .catch(error => {
        console.error("Error resolving params:", error);
      });
  }, [params]);


  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);


  // --- 조건부 렌더링 ---
  // chatRoomId가 아직 해결되지 않았다면 로딩 메시지를 표시합니다。
  if (!resolvedChatRoomId) {
    return <div>채팅방 정보를 불러오는 중...</div>;
  }
  // 세션 로딩 중일 때 로딩 메시지를 표시합니다。
  if (status === 'loading' || status === 'unauthenticated') {
    return <div>사용자 세션 로딩 중...</div>;
  }
  
  if (!session) {
    return <div>Loading...</div>;
  }

  const onSendLocation = (location) => {
    handleSendLocation(location);
    setIsLocationModalOpen(false);
  };

  // --- UI 렌더링 ---
  // 모든 데이터와 로직을 하위 UI 컴포넌트에 props로 전달하여 화면을 조립합니다.
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto w-full">
      <Card className="w-full h-full flex flex-col">
        <CardHeader>
          <ChatHeader otherUser={otherUser} />
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto p-4">
          <MessageList 
            messages={messages} 
            session={session} 
            otherUser={otherUser} 
            messagesEndRef={messagesEndRef} 
          />
        </CardContent>
        <CardFooter className="p-4">
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
      <LocationPickerModal 
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSendLocation={onSendLocation}
      />
    </div>
  );
}