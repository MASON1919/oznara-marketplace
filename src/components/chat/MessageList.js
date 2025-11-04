
import { memo } from 'react';
import Message from "./Message";

/**
 * 메시지 목록을 렌더링하는 컴포넌트입니다.
 * @param {object} props - 컴포넌트 props
 * @param {Array} props.messages - 표시할 메시지 객체 배열
 * @param {object} props.session - 현재 사용자 세션 정보
 * @param {object} props.otherUser - 채팅 상대방 정보
 * @param {React.RefObject} props.messagesEndRef - 자동 스크롤을 위한 ref
 */
const MessageList = ({ messages, session, otherUser, messagesEndRef }) => {
  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <Message key={msg.id} msg={msg} session={session} otherUser={otherUser} />
      ))}
      {/* 이 빈 div는 새 메시지가 추가될 때 화면을 맨 아래로 스크롤하는 기준점 역할을 합니다. */}
      <div ref={messagesEndRef} />
    </div>
  );
};

// React.memo를 사용하여 props가 변경되지 않으면 리렌더링을 방지합니다.
export default memo(MessageList);
