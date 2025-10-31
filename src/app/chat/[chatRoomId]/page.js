
// 이 컴포넌트는 클라이언트 측에서 렌더링됩니다.

'use client';



// React 훅과 Next.js 관련 훅, Firebase 및 shadcn/ui 컴포넌트들을 import 합니다.

import { useState, useEffect, useRef } from 'react';

import { useSession } from 'next-auth/react';

import { useRouter } from 'next/navigation';

import { db } from '@/lib/firebase';

import {

  collection,

  query,

  orderBy,

  onSnapshot,

  addDoc,

  serverTimestamp,

  doc, // doc 함수 import

  updateDoc, // updateDoc 함수 import

} from 'firebase/firestore';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';



// 채팅 페이지 컴포넌트입니다. URL 파라미터에서 chatRoomId를 받습니다.

export default function ChatPage({ params }) {

  // URL 파라미터인 params가 Promise일 수 있으므로, 이를 해결하여 chatRoomId를 상태로 관리합니다.

  const [resolvedChatRoomId, setResolvedChatRoomId] = useState(null);

  const { data: session, status } = useSession(); // 현재 사용자의 세션 정보와 인증 상태를 가져옵니다。

  const router = useRouter(); // 라우터 객체를 가져옵니다。

  const [messages, setMessages] = useState([]); // 채팅 메시지 목록을 관리합니다。

  const [newMessage, setNewMessage] = useState(''); // 새 메시지 입력 필드의 값을 관리합니다。

  const messagesEndRef = useRef(null);



  // --- 모든 훅 호출은 여기에 위치해야 합니다. (React Rules of Hooks 준수) ---



  // params Promise를 해결하고 chatRoomId를 상태에 저장하는 useEffect 훅입니다.

  // 이 훅은 컴포넌트가 마운트될 때 한 번 실행되며, params가 변경될 때 다시 실행됩니다。

  useEffect(() => {

    Promise.resolve(params)

      .then(resolved => {

        setResolvedChatRoomId(resolved.chatRoomId);

      })

      .catch(error => {

        console.error("Error resolving params:", error);

        // 오류 발생 시 사용자에게 알리거나 다른 페이지로 리디렉션하는 등의 처리를 할 수 있습니다.

      });

  }, [params]);



  // 메시지 목록이 업데이트될 때마다 자동으로 맨 아래로 스크롤하는 함수입니다。

  const scrollToBottom = () => {

    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  };



  // 메시지 목록(messages)이 변경될 때마다 scrollToBottom 함수를 호출합니다。

  useEffect(() => {

    scrollToBottom();

  }, [messages]);



  // Firestore에서 실시간으로 메시지를 가져오는 useEffect 훅입니다。

  // resolvedChatRoomId가 유효할 때만 실행되며, 컴포넌트 언마운트 시 구독을 해제합니다。

  useEffect(() => {

    if (!resolvedChatRoomId) return; // chatRoomId가 아직 해결되지 않았다면 실행하지 않습니다.



    // Firestore의 'chatrooms/{chatRoomId}/messages' 컬렉션에 대한 참조를 가져옵니다。

    const messagesCollection = collection(db, 'chatrooms', resolvedChatRoomId, 'messages');

    // 메시지를 'timestamp' 필드를 기준으로 오름차순 정렬하여 쿼리합니다。

    const q = query(messagesCollection, orderBy('timestamp', 'asc'));



    // onSnapshot을 사용하여 실시간으로 메시지 변경 사항을 구독합니다。

    const unsubscribe = onSnapshot(q, (querySnapshot) => {

      // 스냅샷에서 문서들을 가져와 메시지 객체 배열로 변환합니다。

      const msgs = querySnapshot.docs.map((doc) => ({

        id: doc.id,

        ...doc.data(),

      }));

      setMessages(msgs); // 메시지 상태를 업데이트합니다.

    });



    // 컴포넌트 언마운트 시 Firestore 구독을 해제하는 클린업 함수를 반환합니다。

    return () => unsubscribe();

  }, [resolvedChatRoomId]);



  // 사용자가 채팅 페이지를 보고 있을 때 해당 사용자의 lastRead 타임스탬프를 업데이트합니다。

  useEffect(() => {

    if (!resolvedChatRoomId || !session?.user?.id) return;



    const chatRoomRef = doc(db, 'chatrooms', resolvedChatRoomId);

    const userId = session.user.id;



    const updateLastRead = async () => {

      try {

        await updateDoc(chatRoomRef, {

          [`lastRead.${userId}`]: serverTimestamp(),

        });

      } catch (error) {

        console.error('Error updating lastRead timestamp:', error);

      }

    };



    updateLastRead();



  }, [resolvedChatRoomId, session?.user?.id]); // resolvedChatRoomId 또는 사용자 ID가 변경될 때 실행



  // --- 조건부 렌더링은 모든 훅 호출 이후에 와야 합니다. ---



  // chatRoomId가 아직 해결되지 않았다면 로딩 메시지를 표시합니다。

  if (!resolvedChatRoomId) {

    return <div>채팅방 정보를 불러오는 중...</div>;

  }



  // 세션 로딩 중일 때 로딩 메시지를 표시합니다。

  if (status === 'loading') {

    return <div>사용자 세션 로딩 중...</div>;

  }



  // 로그인되지 않은 사용자일 경우 로그인 페이지로 리디렉션합니다。

  if (status === 'unauthenticated') {

    router.push('/login');

    return null;

  }



  // 메시지 전송을 처리하는 비동기 함수입니다。

  const handleSendMessage = async (e) => {

    e.preventDefault(); // 폼 제출 시 페이지 새로고침 방지

    // 메시지 내용이 비어있거나 사용자가 로그인되지 않았다면 전송하지 않습니다。

    if (newMessage.trim() === '' || !session) return;



    // 전송할 메시지 데이터를 구성합니다。

    const messageData = {

      text: newMessage,

      timestamp: serverTimestamp(), // Firestore 서버 타임스탬프를 사용하여 정확한 시간 기록

      senderId: session.user.id,

    };



    // 낙관적 업데이트(Optimistic Update): 서버 응답을 기다리지 않고 UI에 메시지를 즉시 추가합니다。

    // 임시 ID와 현재 시간을 부여하여 UI에 빠르게 반영합니다。

    setMessages((prevMessages) => [

      ...prevMessages,

      { ...messageData, id: Date.now().toString(), timestamp: new Date() },

    ]);

    setNewMessage(''); // 입력 필드를 비웁니다。



    try {

      // Firestore의 해당 채팅방 메시지 컬렉션에 새 메시지를 추가합니다。

      const messagesCollection = collection(db, 'chatrooms', resolvedChatRoomId, 'messages');

      await addDoc(messagesCollection, messageData);



      // 채팅방 문서의 lastMessageTimestamp와 lastMessageSenderId를 업데이트하여 새 메시지가 있음을 알립니다.

      const chatRoomRef = doc(db, 'chatrooms', resolvedChatRoomId);

      await updateDoc(chatRoomRef, {

        lastMessageTimestamp: serverTimestamp(),

        lastMessageSenderId: session.user.id, // 마지막 메시지 보낸 사람 ID 추가

      });



    } catch (error) {

      console.error('Error sending message:', error);

      // TODO: 에러 발생 시 낙관적으로 추가했던 메시지를 UI에서 제거하는 등의 에러 처리가 필요합니다。

    }

  };



  // 컴포넌트 렌더링 부분입니다。

  return (

    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-2xl mx-auto my-8 border rounded-lg">

      {/* 메시지 목록을 표시하는 영역입니다. */}

      <div className="flex-grow p-4 overflow-y-auto bg-gray-50">

        {messages.map((msg) => (

          <div

            key={msg.id} // 각 메시지에 고유한 key를 부여합니다。

            // w-full을 추가하여 flex 컨테이너가 전체 너비를 차지하도록 합니다.

            className={`w-full flex my-2 ${msg.senderId === session.user.id ? 'justify-end' : 'justify-start'}`}>

            <div

              // 메시지 보낸 사람에 따라 배경색을 다르게 합니다。

              className={`px-4 py-2 rounded-lg max-w-xs lg:max-w-md ${msg.senderId === session.user.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>

              {msg.text}

            </div>

          </div>

        ))}

        {/* 메시지 목록의 맨 아래로 스크롤하기 위한 빈 div입니다。

 */}

        <div ref={messagesEndRef} />

      </div>

      {/* 메시지 입력 폼입니다。

 */}

      <form onSubmit={handleSendMessage} className="flex p-4 border-t">

        <Input

          type="text"

          value={newMessage}

          onChange={(e) => setNewMessage(e.target.value)}

          placeholder="메시지를 입력하세요..."

          className="flex-grow"

        />

        <Button type="submit" className="ml-4">전송</Button>

      </form>

    </div>

  );

}
