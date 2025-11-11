import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

/**
 * 구매 요청 목록 조회 API (판매자용)
 * GET /api/mypage/purchase-requests
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const sellerId = session.user.id;

    // 내 상품에 대한 Pending 상태인 구매 요청 조회
    const requests = await prisma.transaction.findMany({
      where: {
        sellerId: sellerId,
        status: "Pending",
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      requests,
      count: requests.length,
    });
  } catch (error) {
    console.error("구매 요청 조회 오류:", error);
    return NextResponse.json(
      { error: "구매 요청 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}
