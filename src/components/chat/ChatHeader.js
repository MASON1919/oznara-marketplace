
import { memo } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

/**
 * 채팅방 상단 헤더 컴포넌트입니다.
 * @param {object} props - 컴포넌트 props
 * @param {object} props.otherUser - 채팅 상대방의 유저 정보
 */
const ChatHeader = ({ otherUser }) => {
  // 상대방 정보가 없으면 아무것도 렌더링하지 않습니다.
  if (!otherUser) return null;

  return (
    <div className="flex flex-row items-center gap-4 p-4 border-b">
      <Avatar>
        <AvatarImage src={otherUser.image} alt={`${otherUser.name}의 프로필 사진`} />
        <AvatarFallback>
          {otherUser.name ? otherUser.name.charAt(0).toUpperCase() : "U"}
        </AvatarFallback>
      </Avatar>
      <div className="grid gap-0.5">
        <p className="text-sm font-medium leading-none">{otherUser.name}</p>
        {/* 온라인 상태 표시는 현재는 하드코딩되어 있지만, 추후 실제 상태를 받아와 표시할 수 있습니다. */}
        <p className="text-xs text-muted-foreground">Online</p>
      </div>
    </div>
  );
};

// React.memo를 사용하여 otherUser prop이 변경되지 않으면 리렌더링을 방지합니다.
export default memo(ChatHeader);
