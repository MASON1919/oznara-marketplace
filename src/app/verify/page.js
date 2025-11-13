// app/verify/page.jsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Link } from "next/link";

export default function VerifyPage() {
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("토큰이 없습니다.");
      return;
    }

    (async () => {
      try {
        const res = await fetch(
          `/api/verify?token=${encodeURIComponent(token)}`,
          { method: "GET" }
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || "검증에 실패했습니다.");
        }
        setStatus("success");
        setMessage("이메일 인증이 완료되었습니다.");
      } catch (e) {
        setStatus("error");
        setMessage(e?.message || "검증 중 오류가 발생했습니다.");
      }
    })();
  }, []);

  return (
    <div className="max-w-md mx-auto mt-16 text-center space-y-6">
      <h1 className="text-2xl font-semibold">이메일 인증</h1>

      {status === "loading" && (
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>검증 중입니다…</span>
        </div>
      )}

      {status === "success" && (
        <>
          <p className="text-green-600">{message}</p>
          <Button asChild>
            <a href="/login">로그인하러 가기</a>
          </Button>
        </>
      )}

      {status === "error" && (
        <>
          <p className="text-red-600">{message}</p>
          <div className="flex gap-3 justify-center">
            <Button asChild variant="outline">
              <Link href="/">홈으로</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">회원가입 다시 시도</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
