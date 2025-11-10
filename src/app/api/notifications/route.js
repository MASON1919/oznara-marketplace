import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

/**
 * 내 알림 조회 API
 * GET /api/notifications
 */
export async function GET(request) {
  try {
    // 로그인 확인
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // createdAt으로 최근 알림만 조회 (24시간 이내)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const notifications = await prisma.waitingNotification.findMany({
      where: {
        userId: userId,
        createdAt: { gte: oneDayAgo },
      },
      include: {
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
      notifications,
      count: notifications.length,
    });
  } catch (error) {
    console.error("알림 조회 오류:", error);
    return NextResponse.json(
      { error: "알림 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

/**
 * 알림 읽음 처리
 * PATCH /api/notifications
 */
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { notificationId } = await request.json();
    const userId = session.user.id;

    if (notificationId) {
      // 특정 알림 삭제
      await prisma.waitingNotification.delete({
        where: {
          id: notificationId,
          userId: userId,
        },
      });
    } else {
      // 모든 알림 삭제
      await prisma.waitingNotification.deleteMany({
        where: {
          userId: userId,
        },
      });
    }

    return NextResponse.json({ message: "알림 삭제 완료" });
  } catch (error) {
    console.error("알림 읽음 처리 오류:", error);
    return NextResponse.json(
      { error: "읽음 처리에 실패했습니다." },
      { status: 500 }
    );
  }
}
