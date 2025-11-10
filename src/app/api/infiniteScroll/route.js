import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getS3Url } from "@/lib/s3";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";
  const page = parseInt(searchParams.get("page")) + 1 || 2;
  const category = searchParams.get("category") || "all";
  const sort = searchParams.get("sort") || "latest";
  const minPrice = parseInt(searchParams.get("minPrice")) || undefined;
  const maxPrice = parseInt(searchParams.get("maxPrice")) || undefined;

  const listings = await prisma.listing.findMany({
    include: {
      listingImages: {
        where: { isCover: true },
        select: { s3Key: true },
        take: 1,
      },
      user: {
        select: { id: true, name: true },
      },
      // 현재 로그인한 유저의 좋아요 정보 포함
      likes: userId
        ? {
            where: { userId },
            select: { userId: true },
          }
        : false,
    },
    where: {
      deleted: false,
      title: {
        contains: query,
        mode: "insensitive",
      },
      price: {
        gte: minPrice,
        lte: maxPrice,
      },
      ...(category !== "all" && category ? { category: category } : {}),
    },
    orderBy: {
      ...(sort === "latest" && { createdAt: "desc" }),
      ...(sort === "popular" && { likeCount: "desc" }),
    },
    skip: (page - 1) * 10,
    take: 10,
  });
  const s3Urls = listings.map((listing) =>
    getS3Url(listing.listingImages[0]?.s3Key)
  );
  const hasMore = listings.length === 10;
  return NextResponse.json({ listings, s3Urls, hasMore }, { status: 200 });
}
