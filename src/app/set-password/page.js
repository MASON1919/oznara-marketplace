// app/set-password/page.jsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" }); // success | error

  useEffect(() => {
    const url = new URL(window.location.href);
    const t = url.searchParams.get("token");
    if (!t) {
      setMsg({ type: "error", text: "토큰이 없습니다." });
    } else {
      setToken(t);
    }
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    if (!token) {
      setMsg({ type: "error", text: "유효하지 않은 접근입니다." });
      return;
    }
    if (password.length < 8) {
      setMsg({ type: "error", text: "비밀번호는 8자 이상이어야 합니다." });
      return;
    }
    if (password !== confirm) {
      setMsg({ type: "error", text: "비밀번호가 일치하지 않습니다." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/set-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "설정에 실패했습니다.");
      }
      setMsg({
        type: "success",
        text: "비밀번호가 설정되었습니다. 로그인하세요.",
      });
      setPassword("");
      setConfirm("");
    } catch (e) {
      setMsg({ type: "error", text: e?.message || "오류가 발생했습니다." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <h1 className="text-2xl font-semibold mb-6">비밀번호 설정</h1>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="password">새 비밀번호</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              placeholder="8자 이상"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute inset-y-0 right-2 my-auto text-sm underline"
            >
              {showPw ? "숨기기" : "표시"}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm">비밀번호 확인</Label>
          <div className="relative">
            <Input
              id="confirm"
              type={showPw2 ? "text" : "password"}
              placeholder="다시 입력"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPw2((v) => !v)}
              className="absolute inset-y-0 right-2 my-auto text-sm underline"
            >
              {showPw2 ? "숨기기" : "표시"}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={submitting || !token}
          className="w-full"
        >
          {submitting ? "처리 중..." : "비밀번호 설정"}
        </Button>

        {msg.text && (
          <p
            className={`text-sm ${
              msg.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {msg.text}
          </p>
        )}

        <div className="pt-2">
          <a className="text-sm underline text-muted-foreground" href="/login">
            로그인 페이지로
          </a>
        </div>
      </form>
    </div>
  );
}
