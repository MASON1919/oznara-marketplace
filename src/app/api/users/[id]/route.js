import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * 특정 사용자의 공개 프로필 정보를 조회하는 API 핸들러입니다.
 * 
 * @param {Request} request - Next.js가 전달하는 요청 객체 (여기서는 사용하지 않음)
 * @param {object} context - URL 파라미터 정보를 담고 있는 객체
 * @param {object} context.params - URL의 동적 세그먼트 값을 담고 있는 객체
 * @param {string} context.params.id - 조회할 사용자의 고유 ID
 */
export async function GET(request, { params }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "사용자 ID가 필요합니다." }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      // 보안을 위해 클라이언트에 전달할 필드를 명시적으로 선택합니다.
      // 비밀번호 해시나 민감한 정보가 실수로 노출되는 것을 방지합니다.
      select: {
        id: true,
        name: true,
        email: true, // email은 로그인 식별자로 사용될 수 있으나, 여기서는 편의상 포함합니다.
        image: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("사용자 정보 조회 중 오류 발생:", error);
    return NextResponse.json(
      { error: "서버 내부 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
