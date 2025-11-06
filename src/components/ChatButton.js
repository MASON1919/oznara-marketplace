// 이 컴포넌트는 클라이언트 측에서 렌더링됩니다.
"use client";

// React 훅과 Next.js 관련 훅, shadcn/ui 버튼 컴포넌트를 import 합니다.
import { useState } from "react";
import { useSession } from "next-auth/react"; // NextAuth 세션 정보를 가져오기 위해 사용합니다.
import { useRouter } from "next/navigation"; // 페이지 라우팅을 위해 사용합니다.
import { Button } from "@/components/ui/button"; // shadcn/ui의 Button 컴포넌트를 가져옵니다.
import { MessageCircle } from "lucide-react"; // lucide-react 아이콘 라이브러리에서 MessageCircle 아이콘을 가져옵니다.

// ChatButton 컴포넌트는 판매자 ID와 상품 ID를 props로 받습니다.
export default function ChatButton({ sellerId, listingId, status, isBuyer }) {
  // useSession 훅을 사용하여 현재 사용자의 세션 정보와 인증 상태를 가져옵니다.
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter(); // useRouter 훅을 사용하여 라우터 객체를 가져옵니다.
  const [isLoading, setIsLoading] = useState(false); // 버튼 로딩 상태를 관리합니다.

  // 세션 로딩 중일 때는 버튼을 렌더링하지 않아 깜빡임 현상을 방지합니다.
  if (sessionStatus === "loading") {
    return null;
  }

  // '채팅하기' 버튼 클릭 시 실행될 비동기 함수입니다.
  const handleChatInitiation = async () => {
    // 로그인되지 않은 상태에서 버튼을 클릭하면 로그인 페이지로 리디렉션합니다.
    if (sessionStatus !== "authenticated") {
      router.push("/login");
      return;
    }

    // 예약중이고 구매자가 아닌 경우
    if (status === "Reserved" && !isBuyer) {
      const shouldNotify = confirm(
        "예약중인 게시글에는 채팅을 할 수 없어요.\n취소되면 알림으로 알려드릴까요?"
      );

      if (shouldNotify) {
        // TODO: 예약 취소 알림 기능
        // - Prisma 스키마에 WaitingNotification 테이블 추가
        // - API: /api/notifications/add, /api/notifications/trigger
        // - 거래 취소 시 대기자들에게 알림
        alert("취소되면 알려드릴게요!");
      }
      return;
    }

    setIsLoading(true); // 로딩 상태를 true로 설정하여 버튼을 비활성화하고 텍스트를 변경합니다.
    try {
      // /api/chat/initiate API 라우트로 POST 요청을 보냅니다.
      // 이 API는 Firestore에서 채팅방을 찾거나 새로 생성합니다.
      const response = await fetch("/api/chat/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sellerId, listingId }), // 판매자 ID와 상품 ID를 요청 본문에 담아 보냅니다.
      });

      // API 응답이 성공적이지 않으면 에러를 발생시킵니다.
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start chat");
      }

      // API 응답에서 chatRoomId를 추출합니다.
      const { chatRoomId } = await response.json();

      // 채팅방 ID를 받아오면 해당 채팅 페이지로 이동합니다.
      router.push(`/chatroom/${chatRoomId}`);
    } catch (error) {
      console.error(error); // 콘솔에 에러를 기록합니다.
      alert(`오류: ${error.message}`); // 사용자에게 에러 메시지를 알립니다.
    } finally {
      setIsLoading(false); // 로딩 상태를 false로 설정합니다.
    }
  };

  // 컴포넌트 렌더링 부분입니다.
  return (
    <Button
      onClick={handleChatInitiation}
      disabled={isLoading || sessionStatus === "loading"}
      className="w-full"
      size="default"
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      {isLoading ? "채팅방 여는 중..." : "채팅하기"}
    </Button>
  );
}
