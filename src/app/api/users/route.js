// app/api/users/route.js
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST 요청 - 새 사용자 만들기
export async function POST(request) {
  try {
    // 요청에서 데이터 가져오기
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

    // 성공! 만들어진 사용자 정보를 보내줍니다
    return NextResponse.json(user);
  } catch (error) {
    // 에러가 발생하면 에러 메시지를 보냅니다
    return NextResponse.json(
      { error: "사용자를 만들 수 없습니다" },
      { status: 500 }
    );
  }
}
