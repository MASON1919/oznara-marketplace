// app/api/_mail-test/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

/**
 * GET /api/_mail-test?to=someone@example.com&subject=Hello&html=<b>hi</b>
 * - 기본값: to=SMTP_USER, subject="SMTP 테스트", html="<p>SMTP 연결 성공!</p>"
 */
export async function GET(req) {
  try {
    // 1) 쿼리 파라미터 파싱
    const url = new URL(req.url);
    const to = url.searchParams.get("to") || process.env.SMTP_USER;
    const subject = url.searchParams.get("subject") || "SMTP 테스트";
    const html = url.searchParams.get("html") || "<p>SMTP 연결 성공!</p>";

    // 간단한 유효성 체크
    if (!to || !to.includes("@")) {
      return NextResponse.json(
        { ok: false, error: "수신자(to) 이메일이 유효하지 않습니다." },
        { status: 400 }
      );
    }
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json(
        {
          ok: false,
          error: "SMTP 환경변수(SMTP_USER/SMTP_PASS)가 설정되지 않았습니다.",
        },
        { status: 500 }
      );
    }

    // 2) 메일 전송
    const info = await sendEmail({ to, subject, html });

    // 3) 결과 반환 (nodemailer info 일부)
    return NextResponse.json({
      ok: true,
      to,
      subject,
      messageId: info?.messageId,
      accepted: info?.accepted,
      // rejected: info?.rejected, // 필요하면 노출
    });
  } catch (e) {
    console.error("[_mail-test] error:", e);
    // Nodemailer 에러 메시지 깔끔히 반환
    const msg = typeof e?.message === "string" ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
