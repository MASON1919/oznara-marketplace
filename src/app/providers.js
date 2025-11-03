'use client';

import { SessionProvider } from "next-auth/react";
import { ChatProvider } from "@/components/chat/ChatContext";
import KakaoMapsScriptLoader from "@/components/KakaoMapsScriptLoader";

export function Providers({ children }) {
  return (
    <SessionProvider>
      <ChatProvider>
        {children}
        <KakaoMapsScriptLoader />
      </ChatProvider>
    </SessionProvider>
  );
}
