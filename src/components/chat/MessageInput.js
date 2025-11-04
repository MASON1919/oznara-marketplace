
import { memo, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, MapPin } from "lucide-react";

/**
 * 메시지 입력 및 전송, 파일 첨부 UI를 담당하는 컴포넌트입니다.
 * @param {object} props - 컴포넌트 props
 * @param {string} props.newMessage - 현재 입력 중인 메시지 텍스트
 * @param {Function} props.setNewMessage - newMessage 상태를 업데이트하는 함수
 * @param {Function} props.handleSendMessage - 메시지 전송을 처리하는 함수
 * @param {Function} props.handleFileSelect - 파일 선택을 처리하는 함수
 * @param {boolean} props.uploading - 이미지 업로드 중인지 여부
 * @param {React.RefObject} props.fileInputRef - 숨겨진 파일 입력 필드의 ref
 * @param {Function} props.setIsLocationModalOpen - 위치 선택 모달을 여는 함수
 */
const MessageInput = ({
  newMessage,
  setNewMessage,
  handleSendMessage,
  handleFileSelect,
  uploading,
  fileInputRef,
  setIsLocationModalOpen,
}) => {
  const textareaRef = useRef(null);

  // 입력 내용에 따라 Textarea의 높이를 자동으로 조절합니다.
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // 높이를 초기화하여 줄어들 수 있도록 함
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`; // 실제 컨텐츠 높이에 맞춤
    }
  }, [newMessage]);

  /** 키보드 이벤트를 처리하는 함수. Enter로 전송, Shift+Enter로 줄바꿈. */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Enter 키의 기본 동작(줄바꿈)을 막음
      handleSendMessage(e);
    }
  };

  return (
    <form onSubmit={handleSendMessage} className="p-4 border-t bg-background flex w-full items-start gap-3">
        {/* 파일 첨부를 위한 숨겨진 input 요소 */}
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/jpeg,image/png,image/webp,image/jpg"
        />
        {/* 파일 첨부 버튼 */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()} // 버튼 클릭 시 숨겨진 input을 클릭
          disabled={uploading}
          className="flex-shrink-0"
        >
          <Paperclip className="w-5 h-5" />
        </Button>
        {/* 위치 전송 버튼 */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setIsLocationModalOpen(true)} // 버튼 클릭 시 위치 선택 모달을 엶
          disabled={uploading}
          className="flex-shrink-0"
        >
          <MapPin className="w-5 h-5" />
        </Button>
        {/* 메시지 입력창 */}
        <Textarea
          ref={textareaRef}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요..."
          autoComplete="off"
          disabled={uploading}
          rows={1} // 초기 높이는 한 줄
          className="flex-1 min-h-[40px] max-h-[150px] resize-none bg-transparent focus:outline-none"
        />
        {/* 메시지 전송 버튼 */}
        <Button type="submit" disabled={uploading} className="self-end">
          {uploading ? "전송 중..." : "전송"}
        </Button>
      </form>
  );
};

// React.memo를 사용하여 props가 변경되지 않으면 리렌더링을 방지합니다.
export default memo(MessageInput);
