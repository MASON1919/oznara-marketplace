// components/FooterGate.tsx (클라이언트)
"use client";

import { usePathname } from "next/navigation";

const HIDE_FOOTER_PATHS = ["/search", "/search-price"];

export default function FooterGate({ children }) {
  const pathname = usePathname();
  const hide = HIDE_FOOTER_PATHS.includes(pathname);
  if (hide) return null;
  return <>{children}</>;
}
