"use client";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function Login() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const email = fd.get("email")?.toString() || "";
    const password = fd.get("password")?.toString() || "";

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false, // 실패 시 페이지 이동 막고 직접 처리
      callbackUrl: "/", // 성공 시 이동할 경로
    });

    setSubmitting(false);

    if (res?.error) {
      // NextAuth 기본: 잘못된 자격증명 -> "CredentialsSignin"
      // authorize()에서 throw한 메시지도 여기로 옴
      setError(
        res.error === "CredentialsSignin"
          ? "이메일 또는 비밀번호가 올바르지 않습니다."
          : res.error
      );
      return;
    }

    // 성공
    window.location.href = res?.url ?? "/";
  }
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>로그인</CardTitle>
        <CardDescription>
          계정에 로그인하려면 이메일을 입력하세요.
        </CardDescription>
        <CardAction>
          <Button variant="link" asChild>
            <Link href="/signup">회원가입</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="user@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">비밀번호</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  비밀번호를 잊으셨나요?
                </a>
              </div>
              <Input id="password" name="password" type="password" required />
            </div>
          </div>
          <Button type="submit" className="w-full mt-6">
            로그인
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <span className="px-3 text-sm text-gray-500">또는</span>
        <div className="flex flex-row justify-center gap-6">
          <button
            className="cursor-pointer"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            <Image
              src="/google_light_rd.png"
              alt="Google Login"
              width={40}
              height={40}
            />
          </button>
          <button
            className="cursor-pointer"
            onClick={() => signIn("github", { callbackUrl: "/" })}
          >
            <Image
              src="/github-mark.png"
              alt="GitHub Login"
              width={40}
              height={40}
            />
          </button>
          <button
            className="cursor-pointer"
            onClick={() => signIn("discord", { callbackUrl: "/" })}
          >
            <Image
              src="/discord-logo.svg"
              alt="Discord Login"
              width={40}
              height={40}
            />
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}
