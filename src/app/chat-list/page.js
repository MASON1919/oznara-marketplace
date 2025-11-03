'use client';

import { useChat } from '@/components/chat/ChatContext';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge'; // Badge 컴포넌트를 가져옵니다.

export default function MyChatsPage() {
  const { data: session, status } = useSession();
  const { userChats } = useChat();
  const router = useRouter();

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen"><div>Loading...</div></div>;
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const getOtherParticipantId = (participants) => {
    return participants.find((p) => p !== session.user.id);
  };

  // 채팅방이 읽지 않은 상태인지 확인하는 함수
  const isUnread = (chat) => {
    if (!session?.user?.id || !chat.lastMessageTimestamp) {
      return false;
    }
    // 내가 보낸 마지막 메시지는 '읽지 않음'으로 간주하지 않습니다.
    if (chat.lastMessageSenderId === session.user.id) {
      return false;
    }
    const lastReadTime = chat.lastRead?.[session.user.id]?.toDate();
    const lastMessageTime = chat.lastMessageTimestamp.toDate();
    
    // lastReadTime이 없거나, 마지막 메시지 시간이 마지막으로 읽은 시간보다 최신이면 '읽지 않음' 상태입니다.
    return !lastReadTime || lastMessageTime > lastReadTime;
  };

  // 채팅 목록을 정렬하는 로직
  const sortedChats = [...userChats].sort((a, b) => {
    const aIsUnread = isUnread(a);
    const bIsUnread = isUnread(b);

    // 1. 읽지 않은 채팅방을 위로 올립니다.
    if (aIsUnread !== bIsUnread) {
      return aIsUnread ? -1 : 1;
    }

    // 2. 두 채팅방 모두 읽었거나 모두 안 읽었다면, 최근 메시지 순으로 정렬합니다.
    const aTime = a.lastMessageTimestamp?.toDate() || 0;
    const bTime = b.lastMessageTimestamp?.toDate() || 0;
    return bTime - aTime;
  });

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 mt-16">
      <h1 className="text-2xl font-bold mb-6">내 채팅 목록</h1>
      {sortedChats.length > 0 ? (
        <div className="space-y-4">
          {sortedChats.map((chat) => {
            const unread = isUnread(chat);
            return (
              <Link href={`/chatroom/${chat.id}`} key={chat.id}>
                <div className={`block p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                  unread ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}>
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-lg">
                      상대방 ID: {getOtherParticipantId(chat.participants)}
                    </p>
                    {unread && <Badge>New</Badge>}
                  </div>
                  <p className={`mt-1 text-sm ${unread ? 'text-blue-600' : 'text-gray-500'}`}>
                    채팅방으로 이동하기
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-10">
          <p>아직 채팅 내역이 없습니다.</p>
          <p className="mt-2 text-sm">상품 페이지에서 판매자와 채팅을 시작해보세요.</p>
        </div>
      )}
    </div>
  );
}
