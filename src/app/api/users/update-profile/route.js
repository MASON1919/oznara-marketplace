import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json(
                { error: "로그인이 필요합니다." },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        let body;
        try {
            body = await req.json();
        } catch (e) {
            return NextResponse.json(
                { error: "잘못된 요청입니다. JSON 형식인지 확인하세요." },
                { status: 400 }
            );
        }

        const { name } = body;

        if (!name || name.trim().length === 0) {
            return NextResponse.json(
                { error: "닉네임은 필수 항목입니다." },
                { status: 400 }
            );
        }

        if (name.trim().length > 15) {
            return NextResponse.json(
                { error: "닉네임은 15자 이내여야 합니다." },
                { status: 400 }
            );
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { name: name.trim() },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
            },
        });

        return NextResponse.json(
            { message: "닉네임이 업데이트되었습니다.", user: updatedUser },
            { status: 200 }
        );
    } catch (error) {
        console.error("PATCH error:", error);
        return NextResponse.json(
            { error: "서버 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}
