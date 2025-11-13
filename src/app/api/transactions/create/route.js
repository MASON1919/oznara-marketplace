import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

/**
 * 구매 요청 생성 API
 * POST /api/transactions/create
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { listingId } = await request.json();
    const buyerId = session.user.id;

    // 상품 정보 조회
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { userId: true, title: true },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "상품을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const sellerId = listing.userId;

    // 자기 상품 구매 방지
    if (sellerId === buyerId) {
      return NextResponse.json(
        { error: "본인 상품은 구매할 수 없습니다." },
        { status: 400 }
      );
    }

    // Transaction과 알림 동시 생성 (트랜잭션)
    const result = await prisma.$transaction(async (tx) => {
      // 1. Transaction 생성
      const transaction = await tx.transaction.create({
        data: {
          listingId,
          buyerId,
          sellerId,
          status: "Pending",
        },
      });

      // 2. 구매 요청 알림 생성
      const notification = await tx.waitingNotification.create({
        data: {
          userId: sellerId, // 판매자에게 알림
          listingId,
          type: "PURCHASE_REQUEST",
          buyerId,
          transactionId: transaction.id,
        },
      });

      return { transaction, notification };
    });

    return NextResponse.json({
      message: "구매 요청이 완료되었습니다.",
      transaction: result.transaction,
    });
  } catch (error) {
    console.error("구매 요청 생성 오류:", error);
    return NextResponse.json(
      { error: "구매 요청에 실패했습니다." },
      { status: 500 }
    );
  }
}
