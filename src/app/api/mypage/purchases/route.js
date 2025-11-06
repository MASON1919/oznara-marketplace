import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getS3Url } from "@/lib/s3";

/**
 * GET: 구매 내역 조회 API
 * 현재 사용자가 구매한 상품 목록을 반환합니다
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "인증되지 않았습니다." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 사용자가 구매한 거래 목록 조회 (취소된 거래 제외)
    const transactions = await prisma.transaction.findMany({
      where: {
        buyerId: userId,
        status: {
          in: ["Pending", "Completed"],
        },
      },
      include: {
        listing: {
          include: {
            listingImages: {
              where: {
                isCover: true,
              },
              take: 1,
            },
          },
        },
        seller: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // S3 URL 추가
    const purchasesWithImages = transactions.map((transaction) => ({
      ...transaction,
      listing: {
        ...transaction.listing,
        imageUrl: transaction.listing.listingImages[0]
          ? getS3Url(transaction.listing.listingImages[0].s3Key)
          : null,
      },
    }));

    return NextResponse.json({ purchases: purchasesWithImages });
  } catch (error) {
    console.error("구매 내역 조회 오류:", error);
    return NextResponse.json(
      { error: "구매 내역 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}
