export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { SignupSchema } from "@/lib/validations/auth";
import { sendEmail } from "@/lib/email";

const ServerSignupSchema = SignupSchema.pick({ email: true, password: true });

// 안전한 토큰 생성기 (Node/Web 모두 호환)
function generateToken() {
  if (typeof crypto?.randomUUID === "function") {
    return crypto.randomUUID().replace(/-/g, "");
  }
  // Node 16 호환 등 fallback
  const nodeCrypto = require("crypto");
  return nodeCrypto.randomBytes(16).toString("hex");
}

export async function POST(req) {
  // 1) 바디 파싱 + zod 안전검증
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "유효하지 않은 요청입니다." },
      { status: 400 }
    );
  }

  const parsed = ServerSignupSchema.safeParse(body);
  if (!parsed.success) {
    const msg =
      parsed.error.issues?.[0]?.message || "입력값이 유효하지 않습니다.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const token = generateToken();
  const expires = new Date(Date.now() + 1000 * 60 * 30);

  try {
    const existing = await prisma.user.findUnique({ where: { email } });

    // 2) 이미 유저가 있으면(= 소셜 가입자 포함) → 비밀번호 설정 링크 발송
    if (existing) {
      // 이미 크리덴셜 설정돼 있으면 차단
      if (existing.password && existing.emailVerified) {
        return NextResponse.json(
          { error: "이미 존재하는 계정입니다." },
          { status: 409 }
        );
      }
      const passwordHash = await bcrypt.hash(password, 10);
      await prisma.$transaction(async (tx) => {
        await tx.verificationToken.deleteMany({ where: { identifier: email } });
        await tx.verificationToken.create({
          data: { identifier: email, token, expires },
        });
        await tx.user.update({
          where: { email },
          data: { password: passwordHash },
        });
      });

      await sendEmail({
        to: email,
        subject: "이메일 인증을 완료해주세요",
        html: `
        <p>아래 링크를 클릭해 이메일 인증을 완료하세요 (30분 내 유효)</p>
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/verify?token=${token}">
          이메일 인증하기
        </a></p>
      `,
      });

      return NextResponse.json(
        { ok: true, mode: "link-credential" },
        { status: 200 }
      );
    }

    // 3) 신규 가입: 유저 생성 + 인증 토큰 저장 + 인증 메일 발송
    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: { email, password: passwordHash, emailVerified: null },
      });
      await tx.verificationToken.create({
        data: { identifier: email, token, expires },
      });
    });

    await sendEmail({
      to: email,
      subject: "이메일 인증을 완료해주세요",
      html: `
        <p>아래 링크를 클릭해 이메일 인증을 완료하세요 (30분 내 유효)</p>
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/verify?token=${token}">
          이메일 인증하기
        </a></p>
      `,
    });

    return NextResponse.json({ ok: true, mode: "new-user" }, { status: 200 });
  } catch (err) {
    if (err?.code === "P2002") {
      // unique 레이스
      return NextResponse.json(
        { error: "이미 존재하는 이메일입니다." },
        { status: 409 }
      );
    }
    console.error("[/api/signup] error:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
