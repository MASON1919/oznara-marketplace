// React에서 `memo`라는 기능을 가져옵니다. (화면을 더 빠르게 만들어주는 기능)
import { memo } from 'react';

// 미리 만들어둔 예쁜 아바타 (`Avatar`, `AvatarImage`, `AvatarFallback`) 부품들을 가져옵니다.
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

/**
 * 이 컴포넌트는 채팅방 맨 위에 나타나서 상대방의 프로필 사진과 이름을 보여줍니다.
 * 
 * @param {object} props - 이 컴포넌트에 전달되는 정보들
 * @param {object} props.otherUser - 채팅 상대방의 정보 (사진 주소, 이름 등)
 */
const ChatHeader = ({ otherUser }) => {
  // 만약 상대방 정보가 아직 없거나 준비되지 않았다면, 아무것도 보여주지 않습니다.
  if (!otherUser) return null;

  // 화면에 보여줄 내용입니다.
  return (
    // 이 부분은 상대방의 프로필 사진과 이름을 가로로 나란히 보여주기 위한 디자인 틀입니다.
    <div className="flex flex-row items-center gap-4 p-4 border-b">
      {/* 상대방의 프로필 사진을 보여주는 아바타 부품입니다. */}
      <Avatar>
        {/* `otherUser.image`에 사진 주소가 있으면 그 사진을 보여줍니다. */}
        <AvatarImage src={otherUser.image} alt={`${otherUser.name}의 프로필 사진`} />
        {/* 만약 사진이 없거나 로딩에 실패하면, 상대방 이름의 첫 글자를 대신 보여줍니다. */}
        <AvatarFallback>
          {otherUser.name ? otherUser.name.charAt(0).toUpperCase() : "U"}
        </AvatarFallback>
      </Avatar>
      
      {/* 상대방의 이름과 온라인 상태를 보여주는 부분입니다. */}
      <div className="grid gap-0.5">
        {/* 상대방의 이름을 보여줍니다. */}
        <p className="text-sm font-medium leading-none">{otherUser.name}</p>
        {/* 
          현재는 "Online"이라고 고정되어 있지만,
          나중에는 상대방이 실제로 접속해 있는지 아닌지를 실시간으로 받아와서 보여줄 수 있습니다.
        */}
        <p className="text-xs text-muted-foreground">Online</p>
      </div>
    </div>
  );
};

// `memo`라는 기능을 사용해서 `ChatHeader` 컴포넌트를 감싸줍니다.
// 이렇게 하면, 이 컴포넌트를 사용하는 부모 컴포넌트가 바뀌더라도
// `otherUser` 정보가 바뀌지 않았다면 `ChatHeader`는 다시 그려지지 않아서 화면이 더 빠르게 움직입니다.
export default memo(ChatHeader);
