import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma"; // prisma client 불러오기

export async function POST() {
    // 로그인한 사용자 확인
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    try {
        // 유저 삭제 (OAuth 유저도 DB에 존재해야 함)
        await prisma.user.delete({
            where: { email: session.user.email },
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("회원탈퇴 실패:", err);
        return NextResponse.json({ error: "회원탈퇴 실패" }, { status: 500 });
    }
}
