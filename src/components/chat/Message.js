// React에서 `memo`라는 기능을 가져옵니다. (화면을 더 빠르게 만들어주는 기능)
import { memo } from 'react';

// 미리 만들어둔 예쁜 아바타 (`Avatar`, `AvatarImage`, `AvatarFallback`) 부품들을 가져옵니다.
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// 지도 핀 모양 아이콘 (`MapPin`)을 가져옵니다.
import { MapPin } from 'lucide-react';

/**
 * 이 컴포넌트는 채팅방에 나타나는 메시지 하나하나를 보여줍니다.
 * 메시지가 글자인지, 사진인지, 위치 정보인지에 따라 다르게 보여줍니다.
 * 
 * @param {object} props - 이 메시지에 전달되는 정보들
 * @param {object} props.msg - 메시지 하나의 상세 정보 (내용, 보낸 사람, 시간 등)
 * @param {object} props.session - 현재 로그인한 내 정보
 * @param {object} props.otherUser - 채팅 상대방의 정보
 */
const Message = ({ msg, session, otherUser }) => {
  // 1. 이 메시지를 내가 보냈는지, 상대방이 보냈는지 확인합니다.
  const isOwnMessage = msg.senderId === session.user.id;

  /**
   * 메시지 종류(`msg.type`)에 따라 메시지 내용을 다르게 보여주는 기능입니다.
   * 
   * @returns {JSX.Element} 메시지 종류에 맞는 화면 요소
   */
  const renderContent = () => {
    switch (msg.type) {
      // 2. 메시지가 '사진'이라면
      case 'image':
        return (
          // 사진을 누르면 새 창에서 크게 볼 수 있도록 링크로 만듭니다.
          <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer">
            <img 
              src={msg.imageUrl} 
              alt="보낸 사진" 
              loading="lazy" // 사진이 화면에 보일 때만 불러와서 웹 페이지를 더 빠르게 만듭니다.
              className="rounded-md max-w-full h-auto" // 사진을 둥글게 만들고 크기를 조절합니다.
            />
          </a>
        );
      // 3. 메시지가 '위치 정보'라면
      case 'location':
        return (
          // 위치 정보를 누르면 카카오맵으로 해당 장소를 볼 수 있도록 링크로 만듭니다.
          <a 
            href={`https://map.kakao.com/link/map/${msg.addressName},${msg.location.latitude},${msg.location.longitude}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 rounded-md hover:bg-black/10 transition-colors"
          >
            <MapPin className="w-6 h-6 text-red-500 flex-shrink-0" /> {/* 지도 핀 아이콘 */}
            <span className="font-semibold">{msg.addressName}</span> {/* 장소 이름 */}
          </a>
        );
      // 4. 메시지가 '글자'이거나 다른 종류라면 (기본값)
      default:
        // 글자 내용 중에 줄바꿈이 있다면 그대로 보여주고, 너무 길면 자동으로 줄바꿈되게 합니다.
        return <p className="break-words whitespace-pre-wrap">{msg.text}</p>;
    }
  };

  // 화면에 보여줄 메시지 말풍선입니다.
  return (
    // 내가 보낸 메시지는 화면 오른쪽에, 상대방이 보낸 메시지는 왼쪽에 정렬합니다.
    <div className={`flex items-start gap-3 ${isOwnMessage ? "justify-end" : "justify-start"}`}
    >
      {/* 상대방이 보낸 메시지일 때만 왼쪽에 상대방 프로필 사진을 보여줍니다. */}
      {!isOwnMessage && otherUser && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={otherUser.image} alt={`${otherUser.name}의 프로필 사진`} />
          <AvatarFallback>
            {otherUser.name ? otherUser.name.charAt(0).toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>
      )}
      
      {/* 메시지 내용이 들어가는 말풍선 부분입니다. */}
      <div
        className={`rounded-lg px-3 py-2 text-sm max-w-xs md:max-w-md ${
          isOwnMessage
            ? "bg-blue-500 text-white" // 내가 보낸 메시지는 파란색 배경에 흰 글씨
            : "bg-gray-200 dark:bg-gray-700" // 상대방 메시지는 회색 배경
        }`}
      >
        
        {/* 메시지 종류에 따라 다르게 보여줄 내용을 여기에 넣습니다. */}
        {renderContent()}

        {/* 메시지를 보낸 시간을 보여줍니다. */}
        <p className="text-xs opacity-70 mt-1 text-right">
          {/* 
            Firebase에서 가져온 시간 정보는 특별한 형태라서,
            `toDate()`라는 기능을 써서 우리가 아는 시간 형태로 바꿔줘야 합니다.
            혹시 시간 정보가 아직 준비되지 않았을 수도 있으니, 안전하게 확인하고 보여줍니다.
          */}
          {msg.timestamp?.toDate ? new Date(msg.timestamp.toDate()).toLocaleTimeString() : ''}
        </p>
      </div>

      {/* 내가 보낸 메시지일 때만 오른쪽에 내 프로필 사진을 보여줍니다. */}
      {isOwnMessage && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={session.user.image} alt={`${session.user.name}의 프로필 사진`} />
          <AvatarFallback>
            {session.user.name ? session.user.name.charAt(0).toUpperCase() : "Y"}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

// `memo`라는 기능을 사용해서 `Message` 컴포넌트를 감싸줍니다.
// 이렇게 하면, 메시지 목록이 바뀌더라도 이 메시지 내용이 바뀌지 않았다면 `Message`는 다시 그려지지 않아서 화면이 더 빠르게 움직입니다.
export default memo(Message);
