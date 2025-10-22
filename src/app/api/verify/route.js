// app/api/verify/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "토큰이 없습니다." }, { status: 400 });
  }

  try {
    //  토큰 조회
    const record = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record) {
      return NextResponse.json(
        { error: "유효하지 않거나 이미 사용된 토큰입니다." },
        { status: 400 }
      );
    }

    // 만료 확인
    if (record.expires < new Date()) {
      // 만료된 토큰은 바로 삭제
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json(
        { error: "토큰이 만료되었습니다." },
        { status: 400 }
      );
    }

    // 해당 이메일 유저 찾기
    const user = await prisma.user.findUnique({
      where: { email: record.identifier },
    });

    if (!user) {
      return NextResponse.json(
        { error: "해당 이메일의 사용자가 존재하지 않습니다." },
        { status: 404 }
      );
    }

    // 인증 완료 처리 (emailVerified 갱신)
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { email: record.identifier },
        data: { emailVerified: new Date() },
      });
      await tx.verificationToken.delete({ where: { token } });
    });

    // 성공 응답
    return NextResponse.json({
      ok: true,
      message: "이메일 인증이 완료되었습니다.",
    });
  } catch (err) {
    console.error("[/api/verify] error:", err);
    return NextResponse.json(
      { error: "서버 내부 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
