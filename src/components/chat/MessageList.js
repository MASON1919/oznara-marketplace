// React에서 `memo`라는 기능을 가져옵니다. (화면을 더 빠르게 만들어주는 기능)
import { memo } from 'react';

// 메시지 하나하나를 보여주는 `Message`라는 부품을 가져옵니다.
import Message from "./Message";

/**
 * 이 컴포넌트는 채팅방에 있는 모든 메시지들을 순서대로 보여주는 역할을 합니다.
 * 
 * @param {object} props - 이 메시지 목록에 전달되는 정보들
 * @param {Array<object>} props.messages - 채팅방의 모든 메시지 정보들이 담긴 목록
 * @param {object} props.session - 현재 로그인한 내 정보
 * @param {object} props.otherUser - 채팅 상대방의 정보
 * @param {React.RefObject} props.messagesEndRef - 메시지 목록의 맨 아래를 가리키는 참조 (새 메시지가 오면 자동으로 스크롤하기 위함)
 */
const MessageList = ({ messages, session, otherUser, messagesEndRef }) => {
  // 화면에 보여줄 메시지 목록입니다.
  return (
    // 메시지들 사이에 적당한 간격을 줍니다.
    <div className="space-y-4">
      {/* 
        `messages` 목록에 있는 메시지들을 하나씩 꺼내서 `Message`라는 부품으로 만들어서 보여줍니다.
        `key={msg.id}`는 React가 각 메시지를 효율적으로 관리하기 위해 필요한 고유한 이름표입니다.
      */}
      {messages.map((msg) => (
        <Message key={msg.id} msg={msg} session={session} otherUser={otherUser} />
      ))}
      {/* 
        이 빈 공간은 항상 메시지 목록의 맨 마지막에 있습니다.
        새로운 메시지가 오면 이 공간이 화면에 보이도록 자동으로 스크롤해서,
        사용자가 항상 최신 메시지를 볼 수 있게 해줍니다.
      */}
      <div ref={messagesEndRef} />
    </div>
  );
};

// `memo`라는 기능을 사용해서 `MessageList` 컴포넌트를 감싸줍니다.
// 이렇게 하면, 이 메시지 목록을 사용하는 부모 컴포넌트가 바뀌더라도
// 메시지 내용(`messages`)이나 다른 정보들이 바뀌지 않았다면 `MessageList`는 다시 그려지지 않아서 화면이 더 빠르게 움직입니다.
export default memo(MessageList);
