import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getS3Url } from "@/lib/s3";

/**
 * GET: 판매 내역 조회 API
 * 현재 사용자가 판매 중인 상품 목록을 반환합니다
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

    // 사용자가 판매 중인 상품 목록 조회 (삭제되지 않은 것만)
    const listings = await prisma.listing.findMany({
      where: {
        userId: userId,
        deleted: false,
      },
      include: {
        listingImages: {
          where: {
            isCover: true,
          },
          take: 1,
        },
        transaction: {
          include: {
            buyer: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1, // 가장 최근 거래만 가져오기
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("조회된 상품 수:", listings.length); // 디버깅용

    // S3 URL 추가 및 상태 계산
    const listingsWithImages = listings.map((listing) => {
      // 거래 정보에 따라 상태 계산
      let status = "OnSale"; // 기본: 판매중
      const latestTransaction = listing.transaction[0];

      if (latestTransaction) {
        if (latestTransaction.status === "Pending") {
          status = "Reserved"; // 예약중
        } else if (latestTransaction.status === "Completed") {
          status = "SoldOut"; // 판매완료
        } else if (latestTransaction.status === "Canceled") {
          status = "OnSale"; // 취소되면 다시 판매중
        }
      }

      return {
        ...listing,
        status, // 계산된 상태 추가
        imageUrl: listing.listingImages[0]
          ? getS3Url(listing.listingImages[0].s3Key)
          : null,
      };
    });

    return NextResponse.json({ listings: listingsWithImages });
  } catch (error) {
    console.error("판매 내역 조회 오류:", error);
    return NextResponse.json(
      { error: "판매 내역 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}
