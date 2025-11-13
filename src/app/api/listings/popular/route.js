import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * GET: 찜이 많은 상품 조회 API
 * likeCount 기준으로 정렬하여 인기 상품 반환
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // 찜이 많은 상품 조회
    const listings = await prisma.listing.findMany({
      where: {
        deleted: false,
      },
      orderBy: {
        likeCount: "desc", // 찜 많은 순
      },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        listingImages: {
          where: { isCover: true },
          take: 1,
          select: {
            s3Key: true,
          },
        },
        transaction: {
          where: {
            status: {
              in: ["Pending", "Completed"],
            },
          },
          take: 1,
          select: {
            status: true,
          },
        },
      },
    });

    // S3 URL 생성
    const s3BaseUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;

    const listingsWithUrls = listings.map((listing) => ({
      ...listing,
      imageUrl: listing.listingImages[0]
        ? `${s3BaseUrl}${listing.listingImages[0].s3Key}`
        : null,
      status:
        listing.transaction.length > 0
          ? listing.transaction[0].status === "Completed"
            ? "SoldOut"
            : "Reserved"
          : "OnSale",
    }));

    return NextResponse.json({
      listings: listingsWithUrls,
      count: listingsWithUrls.length,
    });
  } catch (error) {
    console.error("인기 상품 조회 오류:", error);
    return NextResponse.json(
      { error: "인기 상품 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}
