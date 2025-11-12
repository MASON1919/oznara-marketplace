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
    const q = query(
      collection(db, 'chatrooms'),
      where('participants', 'array-contains', session.user.id)
    );

    // 3. `onSnapshot`으로 실시간 데이터 변경을 감지합니다.
      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const rawChats = [];
        querySnapshot.forEach((doc) => {
          rawChats.push({ id: doc.id, ...doc.data() });
        });

        // [추가] '숨김' 처리된 채팅방을 필터링합니다.
        const visibleChats = rawChats.filter(chat => !chat.hiddenFor?.includes(session.user.id));

        // 데이터 유효성 검사 및 필터링
        const validChats = [];
        const participantIds = new Set();
        let unreadMessages = 0;

        for (const chat of visibleChats) { // [수정] visibleChats를 사용하도록 변경
          const otherParticipantId = chat.participants?.find(p => p !== session.user.id);

          // 데이터가 손상된 채팅방(참여자가 2명이 아니거나 상대방 ID를 찾을 수 없는 경우)을 필터링합니다.
          if (chat.participants?.length !== 2 || !otherParticipantId) {
            console.warn("손상된 채팅방 데이터를 필터링했습니다:", chat);
            continue; // 이 채팅방은 건너뜁니다.
          }
          
          validChats.push(chat);
          participantIds.add(otherParticipantId);

          // 안 읽은 메시지 카운트 로직
          if (chat.lastMessageTimestamp && chat.lastMessageSenderId !== session.user.id) {
            const lastReadTime = chat.lastRead?.[session.user.id]?.toDate();
            const lastMessageTime = chat.lastMessageTimestamp.toDate();
            if (!lastReadTime || lastMessageTime > lastReadTime) {
              unreadMessages += 1;
            }
          }
        }

        // 유효한 채팅방이 있을 경우에만 상대방 정보를 조회합니다.
        if (participantIds.size > 0) {
          try {
            const res = await fetch('/api/users/details', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids: Array.from(participantIds) }),
            });

            if (res.ok) {
              const usersById = await res.json();
              const chatsWithDetails = validChats.map(chat => {
                const otherParticipantId = chat.participants.find(p => p !== session.user.id);
                return {
                  ...chat,
                  otherParticipant: usersById[otherParticipantId] || null,
                };
              });
              setUserChats(chatsWithDetails);
            } else {
              console.error("Failed to fetch participant details: API response not OK", res.status, res.statusText);
              setUserChats(validChats); // API 실패 시, 유효한 채팅 목록만이라도 설정
            }
          } catch (error) {
            console.error("Failed to fetch participant details: Network or other error", error);
            setUserChats(validChats); // 네트워크 오류 시, 유효한 채팅 목록만이라도 설정
          }
        } else {
          setUserChats(validChats); // 참여할 상대방이 없는 경우 (모든 채팅이 손상된 경우 등)
        }

        setUnreadChatsCount(unreadMessages);
      });

    return () => unsubscribe();
  }, [session]);

  return (
    <ChatContext.Provider value={{ userChats, unreadChatsCount }}>
      {children}
    </ChatContext.Provider>
  );
}

/**
 * `useChat`은 `ChatContext`라는 "정보 보관함"에서 정보를 쉽게 꺼내 쓸 수 있도록 도와주는 기능입니다.
 */
export function useChat() {
  return useContext(ChatContext);
}
