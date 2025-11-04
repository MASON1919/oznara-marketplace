
import { memo } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin } from 'lucide-react';

const Message = ({ msg, session, otherUser }) => {
  const isOwnMessage = msg.senderId === session.user.id;

  const renderContent = () => {
    switch (msg.type) {
      case 'image':
        return (
          <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer">
            <img src={msg.imageUrl} alt="uploaded content" loading="lazy" className="rounded-md max-w-full h-auto"/>
          </a>
        );
      case 'location':
        return (
          <a 
            href={`https://map.kakao.com/link/map/${msg.addressName},${msg.location.latitude},${msg.location.longitude}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 rounded-md hover:bg-black/10 transition-colors"
          >
            <MapPin className="w-6 h-6 text-red-500 flex-shrink-0" />
            <span className="font-semibold">{msg.addressName}</span>
          </a>
        );
      default:
        return <p className="break-words whitespace-pre-wrap">{msg.text}</p>;
    }
  };

  return (
    <div
      className={`flex items-start gap-3 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      {!isOwnMessage && otherUser && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={otherUser.image} alt={`${otherUser.name}의 프로필 사진`} />
          <AvatarFallback>
            {otherUser.name ? otherUser.name.charAt(0).toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div
        className={`rounded-lg px-3 py-2 text-sm max-w-xs md:max-w-md ${
          isOwnMessage
            ? "bg-blue-500 text-white"
            : "bg-gray-200 dark:bg-gray-700"
        }`}>
        
        {renderContent()}

        <p className="text-xs opacity-70 mt-1 text-right">
          {msg.timestamp?.toDate ? new Date(msg.timestamp.toDate()).toLocaleTimeString() : new Date(msg.timestamp).toLocaleTimeString()}
        </p>
      </div>

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

export default memo(Message);
