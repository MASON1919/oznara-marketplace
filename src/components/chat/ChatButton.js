// 이 코드는 웹 브라우저(클라이언트)에서 실행됩니다.
'use client';

// React에서 필요한 기능들을 가져옵니다.
// `useState`: 화면에서 변하는 값(상태)을 관리하는 기능
import { useState } from 'react';

// `next-auth`에서 로그인 정보를 가져오는 기능 (`useSession`)
import { useSession } from 'next-auth/react';

// `next/navigation`에서 페이지 이동을 도와주는 기능 (`useRouter`)
import { useRouter } from 'next/navigation';

// 미리 만들어둔 예쁜 버튼 (`Button`) 부품을 가져옵니다.
import { Button } from '@/components/ui/button';

/**
 * 이 버튼은 상품 상세 페이지 등에서 판매자와 채팅을 시작할 때 사용됩니다.
 * 
 * @param {object} props - 이 버튼에 전달되는 정보들
 * @param {string} props.sellerId - 채팅을 걸고 싶은 판매자의 고유 ID
 */
export default function ChatButton({ sellerId }) {
  // 1. 내 로그인 정보와 상태를 가져옵니다.
  const { data: session, status } = useSession();
  // 2. 페이지를 이동시킬 때 사용하는 도우미입니다.
  const router = useRouter();
  // 3. 버튼을 눌렀을 때, 채팅방을 만드는 중인지 아닌지 알려주는 변수입니다.
  const [isLoading, setIsLoading] = useState(false);

  // 만약 내 로그인 정보를 아직 가져오는 중이라면, 버튼을 잠시 숨깁니다.
  // (버튼이 갑자기 나타났다 사라지는 것을 막기 위함입니다.)
  if (status === 'loading') {
    return null;
  }

  // 만약 내가 로그인했고, 그게 바로 이 상품을 파는 판매자라면 버튼을 숨깁니다.
  // (판매자는 자기 상품에 자기가 채팅을 걸 필요가 없으니까요.)
  if (status === 'authenticated' && session.user.id === sellerId) {
    return null;
  }

  /**
   * '채팅하기' 버튼을 눌렀을 때 실행되는 기능입니다.
   * 이 기능은 채팅방을 새로 만들거나, 이미 있는 채팅방으로 나를 데려다줍니다.
   */
  const handleChatInitiation = async () => {
    // 1. 만약 내가 로그인하지 않았다면, 로그인 페이지로 보내버립니다.
    if (status !== 'authenticated') {
      router.push('/login');
      return;
    }

    // 2. 채팅방을 만드는 중이라고 표시하고, 버튼을 누르지 못하게 합니다.
    setIsLoading(true);
    try {
      // 3. 우리 서버에 '채팅방 좀 만들어주세요!' 하고 요청을 보냅니다.
      // (`/api/chat/initiate`라는 주소로 `sellerId` 정보를 함께 보냅니다.)
      const response = await fetch('/api/chat/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sellerId }),
      });

      // 4. 만약 서버에서 문제가 생겼다고 알려주면, 에러 메시지를 보여줍니다.
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start chat');
      }

      // 5. 서버에서 '채팅방 ID'와 '상대방 정보'를 받아옵니다.
      const { chatRoomId, otherUser } = await response.json();
      
      // 6. 받아온 정보들을 가지고 해당 채팅방 페이지로 이동합니다.
      // 이때, 상대방 정보를 주소(URL)에 함께 담아서 보내주면,
      // 채팅방 페이지에서 상대방 정보를 다시 가져올 필요 없이 바로 쓸 수 있어서 더 빠릅니다.
      router.push(`/chatroom/${chatRoomId}?otherUser=${encodeURIComponent(JSON.stringify(otherUser))}`);

    } catch (error) {
      // 7. 혹시라도 예상치 못한 문제가 생기면, 콘솔에 에러를 기록하고 사용자에게 알립니다.
      console.error("채팅 시작 중 오류 발생:", error);
      alert(`오류: ${error.message}`);
    } finally {
      // 8. 모든 작업이 끝나면, '채팅방 만드는 중' 표시를 없애고 버튼을 다시 누를 수 있게 합니다.
      setIsLoading(false);
    }
  };

  // 화면에 보여줄 버튼입니다.
  return (
    <Button
      onClick={handleChatInitiation} // 버튼을 누르면 `handleChatInitiation` 기능이 실행됩니다.
      disabled={isLoading || status === 'loading'} // 채팅방 만드는 중이거나 로그인 정보 가져오는 중이면 버튼을 누르지 못하게 합니다.
      className="w-full mt-4" // 버튼의 크기와 위치를 조절하는 디자인 설정입니다.
      size="lg" // 버튼을 크게 만듭니다.
    >
      {isLoading ? '채팅방 여는 중...' : '채팅하기'} {/* 로딩 중이면 텍스트를 바꾸어 보여줍니다. */}
    </Button>
  );
}
