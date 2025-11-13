import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

/**
 * POST: 구매 요청 API
 * 구매자가 상품에 대해 구매 요청을 생성합니다
 */
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const buyerId = session.user.id;

    // 게시글 확인
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        transaction: {
          where: {
            status: {
              in: ["Pending", "Completed"],
            },
          },
          take: 1,
        },
      },
    });

    if (!listing || listing.deleted) {
      return NextResponse.json(
        { error: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 본인 상품인지 확인
    if (listing.userId === buyerId) {
      return NextResponse.json(
        { error: "본인의 상품은 구매할 수 없습니다." },
        { status: 400 }
      );
    }

    // 이미 진행 중인 거래가 있는지 확인
    if (listing.transaction.length > 0) {
      return NextResponse.json(
        { error: "이미 거래가 진행 중인 상품입니다." },
        { status: 400 }
      );
    }

    // 거래 생성 & 알림 생성 (트랜잭션)
    const result = await prisma.$transaction(async (tx) => {
      // 1. Transaction 생성
      const transaction = await tx.transaction.create({
        data: {
          listingId: id,
          buyerId: buyerId,
          sellerId: listing.userId,
          status: "Pending",
        },
      });

      // 2. 판매자에게 구매 요청 알림 생성
      const notification = await tx.waitingNotification.create({
        data: {
          userId: listing.userId, // 판매자
          listingId: id,
          type: "PURCHASE_REQUEST",
          buyerId: buyerId,
          transactionId: transaction.id,
        },
      });

      return { transaction, notification };
    });

    return NextResponse.json({
      success: true,
      transaction: result.transaction,
    });
  } catch (error) {
    console.error("구매 요청 오류:", error);
    return NextResponse.json(
      { error: "구매 요청에 실패했습니다." },
      { status: 500 }
    );
  }
}

/**
 * DELETE: 예약 취소 API
 * 구매자가 자신의 구매 요청을 취소합니다
 */
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const userId = session.user.id;

    // 게시글과 거래 확인
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        transaction: {
          where: {
            buyerId: userId,
            status: "Pending",
          },
          take: 1,
        },
      },
    });

    if (!listing || listing.deleted) {
      return NextResponse.json(
        { error: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 취소할 거래가 있는지 확인
    if (listing.transaction.length === 0) {
      return NextResponse.json(
        { error: "취소할 예약이 없습니다." },
        { status: 400 }
      );
    }

    // 거래 취소 & 알림 삭제 (트랜잭션)
    await prisma.$transaction(async (tx) => {
      const transactionId = listing.transaction[0].id;

      // 1. Transaction 상태 변경
      await tx.transaction.update({
        where: { id: transactionId },
        data: { status: "Canceled" },
      });

      // 2. 연결된 구매 요청 알림 삭제
      await tx.waitingNotification.deleteMany({
        where: {
          transactionId: transactionId,
          type: "PURCHASE_REQUEST",
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("예약 취소 오류:", error);
    return NextResponse.json(
      { error: "예약 취소에 실패했습니다." },
      { status: 500 }
    );
  }
}
