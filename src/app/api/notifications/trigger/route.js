import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

/**
 * 거래 취소 시 대기자들에게 알림 발송
 * POST /api/notifications/trigger
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

    if (!listingId) {
      return NextResponse.json(
        { error: "상품 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // 해당 상품의 대기 알림 조회 (예약 취소 알림만)
    const notifications = await prisma.waitingNotification.findMany({
      where: {
        listingId,
        type: "CANCEL_RESERVATION", // 예약 취소 알림만
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (notifications.length === 0) {
      return NextResponse.json({
        message: "알림 대상자가 없습니다.",
        count: 0,
      });
    }

    // TODO: 실제 알림 발송 (이메일, 푸시 등)
    // 현재는 로그만 출력
    console.log(
      `🔔 알림 발송 대상 (${notifications.length}명):`,
      notifications
    );

    // 알림은 삭제하지 않고 유지 (사용자가 확인할 때까지)
    // 30초마다 체크하는 NotificationToast가 자동으로 표시

    return NextResponse.json({
      message: `${notifications.length}명에게 알림이 발송되었습니다.`,
      count: notifications.length,
      users: notifications.map((n) => ({
        name: n.user.name || n.user.email,
        email: n.user.email,
      })),
    });
  } catch (error) {
    console.error("알림 발송 오류:", error);
    return NextResponse.json(
      { error: "알림 발송에 실패했습니다." },
      { status: 500 }
    );
  }
}
