// app/signup/page.jsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SignupSchema } from "@/lib/validations/auth";

export default function SignupPage() {
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [terms, setTerms] = useState(false); // shadcn Checkbox는 네이티브 폼 제출에 값이 안 실려서 hidden과 동기화

  async function onSubmit(e) {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);
    const values = {
      email: fd.get("email")?.toString() ?? "",
      password: fd.get("password")?.toString() ?? "",
      confirm: fd.get("confirm")?.toString() ?? "",
      terms: (fd.get("terms") ?? "false") === "true", // hidden input에서 직렬화됨
    };

    const result = SignupSchema.safeParse(values);
    if (!result.success) {
      const next = {};
      for (const issue of result.error.issues) {
        next[issue.path[0] || "submit"] = issue.message;
      }
      setErrors(next);
      return;
    }

    setSubmitting(true);
    setErrors((p) => ({ ...p, submit: undefined }));
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: result.data.email,
          password: result.data.password,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "가입에 실패했습니다.");
      }
      alert("가입 요청이 완료되었습니다. 이메일을 확인하세요.");
      e.currentTarget.reset();
      setTerms(false); // 체크박스 UI 초기화
    } catch (err) {
      setErrors((p) => ({
        ...p,
        submit: err?.message || "오류가 발생했습니다.",
      }));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">회원가입</h1>

      <form onSubmit={onSubmit} noValidate className="space-y-6">
        {/* 이메일 (언컨트롤드) */}
        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-red-500">
              {errors.email}
            </p>
          )}
        </div>

        {/* 비밀번호 */}
        <div className="space-y-2">
          <Label htmlFor="password">비밀번호</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPw ? "text" : "password"}
              placeholder="8자 이상"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute inset-y-0 right-2 my-auto text-sm underline"
              aria-label="비밀번호 표시"
            >
              {showPw ? "숨기기" : "표시"}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="text-sm text-red-500">
              {errors.password}
            </p>
          )}
        </div>

        {/* 비밀번호 확인 */}
        <div className="space-y-2">
          <Label htmlFor="confirm">비밀번호 확인</Label>
          <div className="relative">
            <Input
              id="confirm"
              name="confirm"
              type={showPw2 ? "text" : "password"}
              placeholder="비밀번호를 다시 입력"
              autoComplete="new-password"
              aria-invalid={!!errors.confirm}
              aria-describedby={errors.confirm ? "confirm-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPw2((v) => !v)}
              className="absolute inset-y-0 right-2 my-auto text-sm underline"
              aria-label="비밀번호 표시"
            >
              {showPw2 ? "숨기기" : "표시"}
            </button>
          </div>
          {errors.confirm && (
            <p id="confirm-error" className="text-sm text-red-500">
              {errors.confirm}
            </p>
          )}
        </div>

        {/* 약관 동의 (shadcn Checkbox + hidden 동기화) */}
        <div className="space-y-2">
          <div className="flex items-start gap-3 rounded-md border p-3">
            <Checkbox
              id="terms"
              checked={terms}
              onCheckedChange={(v) => setTerms(Boolean(v))}
              aria-invalid={!!errors.terms}
              aria-describedby={errors.terms ? "terms-error" : undefined}
            />
            <div className="space-y-1 leading-none">
              <Label htmlFor="terms">이용약관 및 개인정보 처리방침 동의</Label>
              <p className="text-xs text-muted-foreground">
                서비스 이용을 위해 필수 동의가 필요합니다.
              </p>
            </div>
          </div>
          {/* 네이티브 폼 제출용 직렬화 값 */}
          <input type="hidden" name="terms" value={terms ? "true" : "false"} />
          {errors.terms && (
            <p id="terms-error" className="text-sm text-red-500">
              {errors.terms}
            </p>
          )}
        </div>

        {/* 버튼들 */}
        <div className="flex flex-col items-center gap-3">
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "처리 중..." : "가입하기"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={(e) => {
              const form = e.currentTarget.closest("form");
              form?.reset();
              setTerms(false);
              setShowPw(false);
              setShowPw2(false);
              setErrors({});
            }}
          >
            초기화
          </Button>
        </div>

        {errors.submit && (
          <p className="text-sm text-red-500">{errors.submit}</p>
        )}
      </form>
    </div>
  );
}
