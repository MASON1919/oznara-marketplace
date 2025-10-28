import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    // 데이터베이스에 저장하기
    const user = await prisma.user.create({
      data: {
        email: email,
        name: name,
        password: password,
      },
    });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "사용자를 만들 수 없습니다" },
      { status: 500 }
    );
  }
}
