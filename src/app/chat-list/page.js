// 이 코드는 웹 브라우저(클라이언트)에서 실행됩니다.
'use client';

// 필요한 도우미 훅과 화면 부품들을 가져옵니다.
// `useChat`: 내가 참여하고 있는 채팅방 목록이나 안 읽은 메시지 개수 같은 채팅 정보를 가져오는 도우미
import { useChat } from '@/components/chat/ChatContext';
// `useSession`: 내 로그인 정보를 가져오는 도우미
import { useSession } from 'next-auth/react';
// `Link`: 웹 페이지를 이동할 때 쓰는 버튼 같은 부품
import Link from 'next/link';
// `useRouter`: 웹 페이지 이동을 직접 조작할 때 쓰는 도우미
import { useRouter } from 'next/navigation';
// `Badge`: "New" 같은 작은 알림을 표시할 때 쓰는 부품
import { Badge } from '@/components/ui/badge';

/**
 * 이 페이지는 내가 참여하고 있는 모든 채팅방 목록을 보여줍니다.
 * 안 읽은 메시지가 있는 채팅방은 더 잘 보이게 표시해줍니다.
 */
export default function MyChatsPage() {
  // 1. 내 로그인 정보(`session`)와 로그인 상태(`status`)를 가져옵니다.
  const { data: session, status } = useSession();
  // 2. `useChat` 도우미를 써서 내가 참여하고 있는 채팅방 목록(`userChats`)을 가져옵니다.
  const { userChats } = useChat();
  // 3. 페이지 이동을 조작할 때 쓰는 도우미입니다.
  const router = useRouter();

  // 만약 내 로그인 정보를 아직 가져오는 중이라면, "로딩 중..." 화면을 보여줍니다.
  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen"><div>로딩 중...</div></div>;
  }

  // 만약 내가 로그인하지 않았다면, 로그인 페이지로 보내버립니다.
  if (status === 'unauthenticated') {
    router.push('/login');
    return null; // 로그인 페이지로 보낸 후에는 이 페이지에서 아무것도 그리지 않습니다.
  }

  /**
   * 채팅방에 참여한 사람들 중에서 나를 제외한 상대방의 ID를 찾아주는 기능입니다.
   * 
   * @param {string[]} participants - 채팅방에 참여한 사람들의 ID 목록
   * @returns {string} 상대방의 ID
   */
  const getOtherParticipantId = (participants) => {
    return participants.find((p) => p !== session.user.id);
  };

  /**
   * 특정 채팅방에 아직 읽지 않은 메시지가 있는지 확인하는 기능입니다.
   * 
   * @param {object} chat - 확인할 채팅방 정보
   * @returns {boolean} 읽지 않은 메시지가 있으면 `true`, 모두 읽었으면 `false`
   */
  const isUnread = (chat) => {
    // 1. 내 로그인 정보나 마지막 메시지 시간이 없다면, 읽지 않은 메시지는 없다고 판단합니다.
    if (!session?.user?.id || !chat.lastMessageTimestamp) {
      return false;
    }
    // 2. 만약 마지막 메시지를 내가 보낸 것이라면, 이 채팅방은 '읽지 않음'으로 세지 않습니다.
    if (chat.lastMessageSenderId === session.user.id) {
      return false;
    }
    // 3. 내가 마지막으로 이 채팅방을 읽은 시간과 마지막 메시지가 온 시간을 가져옵니다.
    //    (Firebase에서 가져온 시간은 특별한 형태라서, 우리가 아는 시간 형태로 바꿔줍니다.)
    const lastReadTime = chat.lastRead?.[session.user.id]?.toDate();
    const lastMessageTime = chat.lastMessageTimestamp.toDate();
    
    // 4. 내가 마지막으로 읽은 시간이 없거나 (한 번도 안 읽었거나),
    //    마지막 메시지 시간이 내가 마지막으로 읽은 시간보다 나중에 왔다면, '읽지 않음' 상태입니다.
    return !lastReadTime || lastMessageTime > lastReadTime;
  };

  // 채팅방 목록을 특별한 규칙에 따라 정렬하는 기능입니다.
  const sortedChats = [...userChats].sort((a, b) => {
    const aIsUnread = isUnread(a); // 채팅방 A가 안 읽었는지 확인
    const bIsUnread = isUnread(b); // 채팅방 B가 안 읽었는지 확인

    // 1. 안 읽은 채팅방을 항상 목록의 맨 위로 올립니다.
    if (aIsUnread !== bIsUnread) {
      return aIsUnread ? -1 : 1; // A가 안 읽었고 B가 읽었으면 A를 B보다 앞으로 보냅니다.
    }

    // 2. 만약 두 채팅방 모두 안 읽었거나 모두 읽었다면,
    //    가장 최근에 메시지가 온 채팅방을 위로 올립니다.
    const aTime = a.lastMessageTimestamp?.toDate() || 0;
    const bTime = b.lastMessageTimestamp?.toDate() || 0;
    return bTime - aTime; // 최신 메시지 시간 순서대로 정렬합니다.
  });

  // 화면에 보여줄 내용입니다.
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 mt-16">
      <h1 className="text-2xl font-bold mb-6">내 채팅 목록</h1>
      {/* 만약 채팅방이 하나라도 있다면 목록을 보여주고, 없다면 "채팅 내역 없음" 메시지를 보여줍니다. */}
      {sortedChats.length > 0 ? (
        <div className="space-y-4">
          {/* 정렬된 채팅방 목록을 하나씩 꺼내서 화면에 보여줍니다. */}
          {sortedChats.map((chat) => {
            const unread = isUnread(chat); // 이 채팅방이 안 읽었는지 다시 확인합니다.
            return (
              // 채팅방을 누르면 해당 채팅방 페이지로 이동하는 링크입니다.
              <Link href={`/chatroom/${chat.id}`} key={chat.id}>
                {/* 안 읽은 채팅방은 파란색 테두리와 배경색으로 더 잘 보이게 표시합니다. */}
                <div className={`block p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow ${ 
                  unread ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                >
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-lg">
                      {/* 지금은 상대방의 ID를 보여주지만, 나중에는 상대방의 이름을 보여주도록 바꿀 수 있습니다. */}
                      상대방 ID: {getOtherParticipantId(chat.participants)}
                    </p>
                    {/* 안 읽은 메시지가 있다면 "New"라는 알림을 보여줍니다. */}
                    {unread && <Badge>New</Badge>}
                  </div>
                  <p className={`mt-1 text-sm ${unread ? 'text-blue-600' : 'text-gray-500'}`}
                  >
                    채팅방으로 이동하기
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        // 채팅 내역이 하나도 없을 때 보여주는 메시지입니다.
        <div className="text-center text-gray-500 mt-10">
          <p>아직 채팅 내역이 없습니다.</p>
          <p className="mt-2 text-sm">상품 페이지에서 판매자와 채팅을 시작해보세요.</p>
        </div>
      )}
    </div>
  );
}
