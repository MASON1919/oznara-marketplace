'use client';

// React와 Next.js, Firebase에서 필요한 기능들을 가져옵니다.
import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

// ChatContext를 생성합니다. 이 컨텍스트는 앱 전체에서 채팅 관련 데이터를 공유하는 데 사용됩니다.
const ChatContext = createContext();

// ChatProvider 컴포넌트입니다. 이 컴포넌트는 채팅 관련 데이터를 가져와서 하위 컴포넌트에 제공하는 역할을 합니다.
export function ChatProvider({ children }) {
  // NextAuth의 useSession 훅을 사용하여 현재 사용자의 로그인 상태(세션)를 가져옵니다.
  const { data: session } = useSession();
  // 사용자가 참여하고 있는 채팅방 목록을 저장할 상태 변수입니다.
  const [userChats, setUserChats] = useState([]);
  // 읽지 않은 메시지의 총 개수를 저장할 상태 변수입니다.
  const [unreadChatsCount, setUnreadChatsCount] = useState(0);

  // useEffect 훅은 특정 값(여기서는 session)이 변경될 때마다 실행됩니다.
  // 로그인 상태가 바뀔 때마다 새로운 데이터를 가져오기 위해 사용됩니다.
  useEffect(() => {
    // 만약 로그인한 사용자가 없다면, 채팅방 목록과 읽지 않은 메시지 수를 초기화하고 함수를 종료합니다.
    if (!session?.user?.id) {
      setUserChats([]);
      setUnreadChatsCount(0);
      return;
    }

    // Firestore에서 데이터를 가져오기 위한 쿼리를 생성합니다.
    // 'chatrooms' 컬렉션에서 'participants' 배열에 현재 로그인한 사용자의 ID가 포함된 문서들을 찾습니다.
    const q = query(
      collection(db, 'chatrooms'),
      where('participants', 'array-contains', session.user.id)
    );

    // onSnapshot 함수는 쿼리 결과를 실시간으로 감시합니다.
    // 데이터베이스에 변경이 생길 때마다 이 함수 안의 코드가 자동으로 실행됩니다.
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const chats = [];
      let unreadCount = 0;

      // querySnapshot.forEach를 통해 쿼리 결과로 나온 모든 채팅방 문서를 순회합니다.
      querySnapshot.forEach((doc) => {
        const chatData = doc.data();
        const chat = { id: doc.id, ...chatData };
        chats.push(chat);

        // --- 알림 배지 버그 수정 ---
        // 마지막 메시지를 보낸 사람이 현재 사용자라면, 이 채팅을 '읽지 않음'으로 계산하지 않습니다.
        if (chat.lastMessageSenderId === session.user.id) {
          return; // 현재 반복을 건너뛰고 다음 채팅방으로 넘어갑니다.
        }

        // 마지막 메시지가 보내진 시간과 사용자가 마지막으로 메시지를 읽은 시간을 가져옵니다.
        const lastMessageTimestamp = chat.lastMessageTimestamp?.toDate();
        const userLastRead = chat.lastRead?.[session.user.id]?.toDate();

        // 두 시간 값을 비교하여 읽지 않은 메시지인지 확인합니다.
        if (lastMessageTimestamp && userLastRead) {
          if (lastMessageTimestamp > userLastRead) {
            unreadCount++; // 마지막 메시지 시간이 마지막 읽은 시간보다 최신이면, 읽지 않은 메시지로 간주합니다.
          }
        } else if (lastMessageTimestamp) {
          // 사용자가 채팅방을 한 번도 읽지 않았다면(userLastRead가 없다면), 모든 메시지는 읽지 않은 것으로 간주합니다.
          unreadCount++;
        }
      });

      // 상태 변수를 새로운 채팅방 목록과 읽지 않은 메시지 수로 업데이트합니다.
      setUserChats(chats);
      setUnreadChatsCount(unreadCount);
    });

    // 컴포넌트가 언마운트되거나(사라지거나) session이 바뀔 때, 실시간 감시를 중단하기 위한 클린업(cleanup) 함수입니다.
    // 불필요한 리소스 낭비를 막아줍니다.
    return () => unsubscribe();
  }, [session]); // useEffect는 session이 변경될 때마다 다시 실행됩니다.

  // Context Provider는 value prop으로 전달된 데이터를 모든 하위 컴포넌트에 제공합니다.
  return (
    <ChatContext.Provider value={{ userChats, unreadChatsCount }}>
      {children}
    </ChatContext.Provider>
  );
}

// useChat 커스텀 훅입니다. 이 훅을 사용하면 어떤 컴포넌트에서든 쉽게 ChatContext의 데이터에 접근할 수 있습니다.
export function useChat() {
  return useContext(ChatContext);
}
