// React에서 필요한 기능들을 가져옵니다.
import { memo } from 'react';
import { useRouter } from 'next/navigation'; // 페이지 이동을 위해 useRouter를 가져옵니다.

// UI 부품들을 가져옵니다.
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from 'next/link';
import { MoreVertical } from 'lucide-react'; // '더보기' 아이콘을 가져옵니다.

/**
 * 이 컴포넌트는 채팅방 맨 위에 나타나서 상대방의 프로필 사진과 이름, 그리고 관련 상품 정보를 보여줍니다.
 * 
 * @param {object} props - 이 컴포넌트에 전달되는 정보들
 * @param {object} props.otherUser - 채팅 상대방의 정보 (사진 주소, 이름 등)
 * @param {object} [props.listing] - 현재 채팅방과 연결된 상품 정보 (ID, 제목, 썸네일 URL 등)
 * @param {string} props.chatRoomId - 현재 채팅방의 ID
 */
const ChatHeader = ({ otherUser, listing, chatRoomId }) => {
  const router = useRouter();

  // '채팅방 나가기' 버튼을 눌렀을 때 실행되는 기능입니다.
  const handleLeaveChat = async () => {
    if (!confirm('정말로 이 채팅방을 나가시겠습니까? 채팅 내역이 삭제됩니다.')) {
      return;
    }

    try {
      const response = await fetch('/api/chat/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatRoomId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to leave chatroom');
      }

      alert('채팅방에서 성공적으로 나갔습니다.');
      router.push('/chat-list'); // 채팅 목록 페이지로 이동합니다.

    } catch (error) {
      console.error("채팅방 나가기 중 오류 발생:", error);
      alert(`오류: ${error.message}`);
    }
  };

  // 만약 상대방 정보가 아직 없거나 준비되지 않았다면, 헤더의 기본 틀만 보여주거나 로딩 상태를 표시할 수 있습니다.
  // 여기서는 null을 반환하여 아무것도 보여주지 않습니다.
  if (!otherUser) return null;

  return (
    <div className="flex flex-row items-center justify-between gap-4 p-4 border-b">
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src={otherUser.image} alt={`${otherUser.name || '사용자'}의 프로필 사진`} />
          <AvatarFallback>
            {otherUser.name ? otherUser.name.charAt(0).toUpperCase() : (otherUser.email ? otherUser.email.charAt(0).toUpperCase() : "U")}
          </AvatarFallback>
        </Avatar>
        
        <div className="grid gap-0.5">
          <p className="text-sm font-medium leading-none">{otherUser.name || otherUser.email || '익명 사용자'}</p>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* 상품 정보가 있을 경우에만 상품 썸네일과 링크 버튼을 보여줍니다. */}
        {listing && (
          <Link href={`/listings/${listing.id}`} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors">
            {listing.thumbnailUrl && (
              <img src={listing.thumbnailUrl} alt={listing.title} className="w-10 h-10 object-cover rounded-md" />
            )}
            <span className="text-sm font-medium text-gray-700 truncate max-w-[100px]">
              {listing.title}
            </span>
          </Link>
        )}

        {/* '더보기' 드롭다운 메뉴 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={handleLeaveChat} className="text-red-600">
              채팅방 나가기
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default memo(ChatHeader);
