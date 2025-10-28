"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <Card className="w-[380px] text-center shadow-lg rounded-2xl border border-border">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <AlertCircle className="text-destructive size-10" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            페이지를 찾을 수 없습니다
          </h1>
        </CardHeader>

        <CardContent>
          <p className="text-muted-foreground">
            요청하신 페이지가 존재하지 않거나 이동되었어요.
          </p>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/">홈으로 돌아가기</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
