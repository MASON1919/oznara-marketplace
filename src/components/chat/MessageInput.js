// React에서 필요한 기능들을 가져옵니다.
// `memo`: 화면을 더 빠르게 만들어주는 기능
// `useRef`: 특정 HTML 요소를 직접 가리킬 때 사용하는 기능
// `useEffect`: 화면이 처음 나타나거나 특정 상황이 바뀔 때 어떤 작업을 하는 기능
import { memo, useRef, useEffect } from 'react';

// 미리 만들어둔 예쁜 버튼, 입력창 부품들을 가져옵니다.
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// 클립 모양 아이콘 (`Paperclip`)과 지도 핀 모양 아이콘 (`MapPin`)을 가져옵니다.
import { Paperclip, MapPin } from "lucide-react";

/**
 * 이 컴포넌트는 채팅방 아래쪽에 있는 메시지 입력창입니다.
 * 글자를 입력하고 보내거나, 파일(사진)을 첨부하거나, 위치 정보를 보낼 수 있습니다.
 * 
 * @param {object} props - 이 입력창에 전달되는 정보들
 * @param {string} props.newMessage - 내가 지금 입력하고 있는 메시지 내용
 * @param {Function} props.setNewMessage - `newMessage` 변수를 바꾸는 기능
 * @param {Function} props.handleSendMessage - 메시지를 보내는 기능
 * @param {Function} props.handleFileSelect - 파일을 선택했을 때 처리하는 기능
 * @param {boolean} props.uploading - 파일(사진 등)을 올리는 중인지 아닌지 알려주는 변수
 * @param {React.RefObject} props.fileInputRef - 숨겨진 파일 선택 버튼을 직접 가리킬 때 사용하는 참조
 * @param {Function} props.setIsLocationModalOpen - 위치 선택 팝업창을 열어주는 기능
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
  // 1. 메시지 입력창(`Textarea`)을 직접 가리킬 때 사용하는 참조입니다.
  const textareaRef = useRef(null);

  // 2. 내가 입력하는 메시지 내용(`newMessage`)이 바뀔 때마다 입력창의 높이를 자동으로 조절합니다.
  useEffect(() => {
    if (textareaRef.current) {
      // 먼저 입력창 높이를 자동으로 맞추고,
      textareaRef.current.style.height = 'auto';
      // 실제 내용의 높이만큼 입력창 높이를 늘려줍니다.
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [newMessage]); // `newMessage`가 바뀔 때마다 이 기능이 실행됩니다.

  /** 
   * 키보드를 눌렀을 때 실행되는 기능입니다.
   * - `Enter` 키만 누르면 메시지를 보냅니다.
   * - `Shift` 키와 `Enter` 키를 함께 누르면 줄바꿈을 합니다.
   */
  const handleKeyDown = (e) => {
    // 만약 `Enter` 키를 눌렀고, `Shift` 키는 누르지 않았다면
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // `Enter` 키를 눌렀을 때 기본적으로 줄바꿈이 되는 것을 막습니다.
      
      // [수정] handleSendMessage를 직접 호출하는 대신, form의 submit 이벤트를 트리거합니다.
      // 이렇게 하면 모든 메시지 전송 로직이 form의 onSubmit 핸들러 하나로 통일됩니다.
      if (newMessage.trim()) { // 메시지가 비어있지 않을 때만 제출
        e.currentTarget.form.requestSubmit();
      }
    }
  };

  // 화면에 보여줄 메시지 입력창과 버튼들입니다.
  return (
    // `form` 태그로 감싸서 `Enter` 키로도 메시지를 보낼 수 있게 합니다.
    // [수정] form의 onSubmit 이벤트로 메시지 전송을 처리합니다.
    <form onSubmit={handleSendMessage} className="p-4 border-t bg-background flex w-full items-start gap-3">
        {/* 
          파일(사진 등)을 선택할 때 쓰는 버튼인데, 기본 디자인이 예쁘지 않아서 화면에는 숨겨둡니다.
          대신 아래에 있는 클립 모양 버튼을 누르면 이 숨겨진 버튼이 눌리도록 할 것입니다.
        */}
        <Input
          type="file"
          ref={fileInputRef} // 이 숨겨진 버튼을 직접 가리킬 때 사용하는 참조입니다.
          onChange={handleFileSelect} // 파일이 선택되면 `handleFileSelect` 기능이 실행됩니다.
          className="hidden" // 화면에 보이지 않게 숨깁니다.
          accept="image/jpeg,image/png,image/webp,image/jpg" // 어떤 종류의 파일만 선택할 수 있는지 정합니다.
        />
        {/* 파일 첨부 버튼 (클립 모양) */}
        <Button
          type="button" // 이 버튼을 눌러도 메시지가 바로 보내지지 않게 합니다.
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()} // 이 버튼을 누르면 위에 숨겨둔 파일 선택 버튼이 눌리게 합니다.
          disabled={uploading} // 파일을 올리는 중이면 이 버튼을 누르지 못하게 합니다.
          className="flex-shrink-0"
        >
          <Paperclip className="w-5 h-5" /> {/* 클립 모양 아이콘 */}
        </Button>
        {/* 위치 전송 버튼 (지도 핀 모양) */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setIsLocationModalOpen(true)} // 이 버튼을 누르면 위치 선택 팝업창이 열립니다.
          disabled={uploading} // 파일을 올리는 중이면 이 버튼을 누르지 못하게 합니다.
          className="flex-shrink-0"
        >
          <MapPin className="w-5 h-5" /> {/* 지도 핀 아이콘 */}
        </Button>
        {/* 메시지 입력창 */}
        <Textarea
          ref={textareaRef} // 이 입력창을 직접 가리킬 때 쓰는 참조입니다.
          value={newMessage} // 현재 입력된 메시지 내용
          onChange={(e) => setNewMessage(e.target.value)} // 메시지 내용이 바뀌면 `newMessage` 변수를 업데이트합니다.
          onKeyDown={handleKeyDown} // 키보드를 눌렀을 때 `handleKeyDown` 기능이 실행됩니다.
          placeholder="메시지를 입력하세요..." // 입력창에 아무것도 없을 때 보이는 안내 문구
          autoComplete="off"
          disabled={uploading} // 파일을 올리는 중이면 입력창을 누르지 못하게 합니다.
          rows={1} // 처음에는 한 줄 높이로 보여줍니다.
          className="flex-1 min-h-[40px] max-h-[150px] resize-none bg-transparent focus:outline-none" // 입력창 디자인 설정
        />
        {/* 메시지 전송 버튼 */}
        {/* [수정] onClick 핸들러를 제거하고, form의 submit 이벤트에 의존합니다. */}
        <Button type="submit" disabled={uploading || !newMessage.trim()} className="self-end">
          {uploading ? "전송 중..." : "전송"} {/* 파일을 올리는 중이면 텍스트를 바꿉니다. */}
        </Button>
      </form>
  );
};

// `memo`라는 기능을 사용해서 `MessageInput` 컴포넌트를 감싸줍니다.
// 이렇게 하면, 이 입력창을 사용하는 부모 컴포넌트가 바뀌더라도
// 입력창의 내용이나 기능들이 바뀌지 않았다면 `MessageInput`은 다시 그려지지 않아서 화면이 더 빠르게 움직입니다.
export default memo(MessageInput);
