'use client';

import { SessionProvider } from "next-auth/react";
import { ChatProvider } from "@/components/chat/ChatContext";

export function Providers({ children }) {
  return (
    <SessionProvider>
      <ChatProvider>
        {children}
      </ChatProvider>
    </SessionProvider>
  );
}
