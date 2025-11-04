// src/app/api/users/change-password/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';

// 🚨 상대 경로 오류를 피하기 위해 절대 경로 사용 (NextAuth 설정, Zod 스키마)
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ChangePasswordSchema } from '@/lib/validations/auth';
import { prisma } from "@/lib/prisma" // Prisma 클라이언트

export const runtime = "nodejs";

/**
 * [PATCH] /api/users/change-password 핸들러
 * 인증된 사용자의 비밀번호를 변경합니다.
 * @param {Request} request - Next.js Request 객체
 */
export async function PATCH(request) {
    try {
        // 1. 인증: NextAuth 세션 확인 (성공 패턴 적용!)
        // 🚨 getServerSession에 authOptions만 전달하여 NextAuth가 App Router Request를 처리하도록 함
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json(
                { message: "인증되지 않았거나 유효하지 않은 세션입니다. 재로그인이 필요합니다." },
                { status: 401 }
            );
        }
        const userId = session.user.id; // 세션에 userId가 있다고 가정

        // request body 추출 및 파싱
        const body = await request.json();

        // 2. 유효성 검사: Zod 스키마 적용
        const validationResult = ChangePasswordSchema.safeParse(body);
        if (!validationResult.success) {
            // Zod 에러를 400 Bad Request로 반환
            return NextResponse.json(
                {
                    message: "입력값이 유효하지 않습니다.",
                    errors: validationResult.error.format()
                },
                { status: 400 }
            );
        }

        const { currentPassword, newPassword } = validationResult.data;

        // 3. 현재 비밀번호 확인을 위해 DB에서 사용자 비밀번호 가져오기
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { password: true }, // 'password' 필드 이름이 맞다고 가정
        });

        if (!user || !user.password) {
            return NextResponse.json(
                { message: "사용자 정보를 찾을 수 없거나 비밀번호 필드가 비어있습니다." },
                { status: 404 }
            );
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { message: "현재 비밀번호가 일치하지 않습니다." },
                { status: 401 }
            );
        }

        // 4. 새 비밀번호 해싱 및 DB 업데이트
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedNewPassword,
            },
        });

        // 5. 성공 응답
        return NextResponse.json(
            { message: "비밀번호가 성공적으로 변경되었습니다. 보안을 위해 재로그인해 주세요." },
            { status: 200 }
        );

    } catch (error) {
        console.error("비밀번호 변경 중 서버 오류 발생:", error);

        // 예상치 못한 서버 에러 처리
        return NextResponse.json(
            { message: "서버 오류가 발생했습니다.", error: error.message },
            { status: 500 }
        );
    }
}