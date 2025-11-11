import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

/**
 * 예약 취소 알림 등록 API
 * POST /api/notifications/add
 */
export async function POST(request) {
  try {
    // 로그인 확인
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { listingId } = await request.json();
    const userId = session.user.id;

    if (!listingId) {
      return NextResponse.json(
        { error: "상품 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // 상품 존재 확인
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "상품을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 알림 등록 (중복 방지는 스키마의 unique 제약조건으로 처리)
    const notification = await prisma.waitingNotification.upsert({
      where: {
        userId_listingId: {
          userId: userId,
          listingId: listingId,
        },
      },
      update: {}, // 이미 존재하면 아무것도 하지 않음
      create: {
        userId: userId,
        listingId: listingId,
      },
    });

    return NextResponse.json({
      message: "알림이 등록되었습니다.",
      notification,
    });
  } catch (error) {
    console.error("알림 등록 오류:", error);
    return NextResponse.json(
      { error: "알림 등록에 실패했습니다." },
      { status: 500 }
    );
  }
}
