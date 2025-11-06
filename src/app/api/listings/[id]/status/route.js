import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

/**
 * PATCH: 상품 상태 변경 API
 * OnSale: 거래 취소, SoldOut: 거래 완료
 */
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "인증되지 않았습니다." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const userId = session.user.id;
    const { status } = await request.json();

    // 유효한 상태 값인지 확인
    const validStatuses = ["OnSale", "SoldOut"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "유효하지 않은 상태입니다." },
        { status: 400 }
      );
    }

    // 게시글 존재 여부 및 권한 확인
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        transaction: {
          orderBy: { createdAt: "desc" },
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

    if (listing.userId !== userId) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const latestTransaction = listing.transaction[0];

    if (status === "OnSale") {
      // 판매중으로 변경: 기존 거래 취소
      if (latestTransaction && latestTransaction.status !== "Canceled") {
        await prisma.transaction.update({
          where: { id: latestTransaction.id },
          data: { status: "Canceled" },
        });
      }
    } else if (status === "SoldOut") {
      // 판매완료로 변경: 기존 거래를 완료 처리
      if (latestTransaction && latestTransaction.status === "Pending") {
        await prisma.transaction.update({
          where: { id: latestTransaction.id },
          data: { status: "Completed" },
        });
      } else {
        return NextResponse.json(
          { error: "완료할 거래가 없습니다." },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("상태 변경 오류:", error);
    return NextResponse.json(
      { error: "상태 변경에 실패했습니다." },
      { status: 500 }
    );
  }
}
