// 이 코드는 웹 브라우저(클라이언트)에서 실행됩니다.
'use client';

// React에서 필요한 기능들을 가져옵니다.
// `createContext`: 여러 컴포넌트가 정보를 쉽게 공유할 수 있는 "정보 보관함"을 만드는 기능
// `useContext`: `createContext`로 만든 "정보 보관함"에서 정보를 꺼내 쓰는 기능
// `useState`: 화면에서 변하는 값(상태)을 관리하는 기능
// `useEffect`: 화면이 처음 나타나거나 특정 상황이 바뀔 때 어떤 작업을 하는 기능
import { createContext, useContext, useState, useEffect } from 'react';

// `next-auth`에서 로그인 정보를 가져오는 기능 (`useSession`)
import { useSession } from 'next-auth/react';

// Firebase Firestore 데이터베이스에 접근하는 기능 (`db`)
import { db } from '@/lib/firebase';

// Firestore에서 데이터를 가져오고 실시간으로 지켜보는 기능들
// `collection`: 특정 데이터 묶음(컬렉션)을 가리키는 기능
// `query`: 데이터를 어떻게 가져올지 조건을 정하는 기능
// `where`: 특정 조건에 맞는 데이터만 고르는 기능
// `onSnapshot`: 데이터가 바뀔 때마다 실시간으로 알려주는 기능
import { collection, query, where, onSnapshot } from 'firebase/firestore';

/**
 * @typedef {object} ChatContextType
 * @property {Array<object>} userChats - 내가 참여하고 있는 모든 채팅방 목록
 * @property {number} unreadChatsCount - 아직 읽지 않은 메시지가 있는 채팅방의 개수
 */

/**
 * `ChatContext`는 여러 컴포넌트가 채팅 관련 정보를 쉽게 공유할 수 있도록 해주는 "정보 보관함"입니다.
 * 이 보관함 덕분에 복잡하게 정보를 계속 전달하지 않아도, 필요한 컴포넌트에서 바로 채팅 정보를 꺼내 쓸 수 있습니다.
 */
const ChatContext = createContext();

/**
 * `ChatProvider`는 `ChatContext`라는 "정보 보관함"에 실제 채팅 정보를 넣어주는 역할을 합니다.
 * 이 컴포넌트는 보통 앱의 가장 바깥쪽에서 다른 모든 컴포넌트들을 감싸고 있습니다.
 * 
 * @param {object} props - 이 컴포넌트에 전달되는 정보들
 * @param {React.ReactNode} props.children - `ChatProvider`가 감싸고 있는 다른 모든 컴포넌트들
 */
export function ChatProvider({ children }) {
  // 1. 내 로그인 정보와 상태를 가져옵니다.
  const { data: session } = useSession();
  // 2. 내가 참여하고 있는 채팅방 목록을 저장할 변수입니다.
  const [userChats, setUserChats] = useState([]);
  // 3. 아직 읽지 않은 메시지가 있는 채팅방의 개수를 저장할 변수입니다.
  const [unreadChatsCount, setUnreadChatsCount] = useState(0);

  // 이 부분은 화면이 처음 나타나거나, 내 로그인 정보가 바뀔 때마다 실행됩니다.
  useEffect(() => {
    // 1. 만약 내가 로그인하지 않았다면,
    //    채팅방 목록과 읽지 않은 메시지 개수를 모두 0으로 만들고 아무것도 하지 않습니다.
    if (!session?.user?.id) {
      setUserChats([]);
      setUnreadChatsCount(0);
      return;
    }

    // 2. Firebase Firestore에서 내 채팅방 정보를 가져올 준비를 합니다.
    //    `chatrooms`라는 데이터 묶음(컬렉션)에서,
    //    `participants`라는 목록에 내 ID가 들어있는 채팅방들만 골라달라고 요청합니다.
    const q = query(
      collection(db, 'chatrooms'),
      where('participants', 'array-contains', session.user.id)
    );

    // 3. `onSnapshot`은 Firebase에게 "이 채팅방 목록이 바뀌면 나에게 바로 알려줘!" 하고 부탁하는 기능입니다.
    //    데이터베이스에 채팅방이 새로 생기거나, 메시지가 오거나 하면 이 안의 코드가 자동으로 다시 실행됩니다.
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const chats = []; // 새로 가져온 채팅방 목록을 임시로 저장할 곳
      let unreadCount = 0; // 읽지 않은 채팅방 개수를 셀 변수

      // 4. 가져온 모든 채팅방 정보를 하나씩 살펴봅니다.
      querySnapshot.forEach((doc) => {
        const chatData = doc.data();
        const chat = { id: doc.id, ...chatData };
        chats.push(chat);

        // --- 읽지 않은 메시지 개수 세는 방법 ---

        // 만약 마지막 메시지를 내가 보낸 것이라면, 이 채팅방은 '읽지 않음'으로 세지 않습니다.
        if (chat.lastMessageSenderId === session.user.id) {
          return; // 다음 채팅방으로 넘어갑니다.
        }

        // 마지막 메시지가 언제 왔는지, 내가 마지막으로 언제 읽었는지 시간을 가져옵니다.
        const lastMessageTimestamp = chat.lastMessageTimestamp?.toDate();
        const userLastRead = chat.lastRead?.[session.user.id]?.toDate();

        // 5. 이 채팅방에 읽지 않은 메시지가 있는지 확인합니다.
        if (lastMessageTimestamp && userLastRead) {
          // 마지막 메시지가 내가 마지막으로 읽은 시간보다 나중에 왔다면, 읽지 않은 메시지가 있는 것입니다.
          if (lastMessageTimestamp > userLastRead) {
            unreadCount++;
          }
        } else if (lastMessageTimestamp) {
          // 만약 내가 이 채팅방을 한 번도 읽은 적이 없다면 (userLastRead가 없다면),
          // 마지막 메시지가 있기만 해도 무조건 '읽지 않음'으로 셉니다.
          unreadCount++;
        }
      });

      // 6. 새로 가져온 채팅방 목록과 읽지 않은 개수를 화면에 반영합니다.
      //    이 변수들이 바뀌면, 이 정보를 쓰는 모든 컴포넌트들이 자동으로 업데이트됩니다.
      setUserChats(chats);
      setUnreadChatsCount(unreadCount);
    });

    // 7. 이 페이지가 사라지거나, 내 로그인 정보가 바뀌어서 이 기능이 다시 시작될 때,
    //    이전에 Firebase에게 "실시간으로 알려줘!" 하고 부탁했던 것을 멈춥니다.
    //    (불필요하게 계속 정보를 받아오는 것을 막기 위함입니다.)
    return () => unsubscribe();
  }, [session]); // 내 로그인 정보(`session`)가 바뀔 때마다 이 기능이 다시 실행됩니다.

  // `ChatContext.Provider`는 `value` 안에 있는 정보들을
  // 이 컴포넌트가 감싸고 있는 모든 다른 컴포넌트들에게 전달해줍니다.
  return (
    <ChatContext.Provider value={{ userChats, unreadChatsCount }}>
      {children} {/* `ChatProvider`가 감싸고 있는 다른 모든 컴포넌트들 */}
    </ChatContext.Provider>
  );
}

/**
 * `useChat`은 `ChatContext`라는 "정보 보관함"에서 정보를 쉽게 꺼내 쓸 수 있도록 도와주는 기능입니다.
 * 이 기능을 사용하면 `useContext(ChatContext)`처럼 복잡하게 쓰지 않고,
 * `useChat()` 한 줄로 내가 참여하고 있는 채팅방 목록(`userChats`)과 
 * 읽지 않은 채팅방 개수(`unreadChatsCount`)를 바로 가져올 수 있습니다.
 * 
 * @returns {ChatContextType} 채팅 관련 정보들
 */
export function useChat() {
  return useContext(ChatContext);
}
