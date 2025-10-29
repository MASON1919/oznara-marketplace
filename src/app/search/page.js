import { prisma } from "@/lib/prisma";
import { getS3Url } from "@/lib/s3";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import SearchResults from "@/components/SearchPage/SearchResults";
import PaginationBar from "@/components/SearchPage/PaginationBar";

export default async function SearchPage({ searchParams }) {
  // ============================================
  // 1. 현재 로그인한 유저 정보 가져오기
  // ============================================
  // 좋아요 상태를 확인하기 위해 세션에서 userId를 추출합니다.
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const query = searchParams.query || "";
  const page = parseInt(searchParams.page) || 1;

  // ============================================
  // 2. 검색 결과 조회 (좋아요 정보 포함)
  // ============================================
  const listings = await prisma.listing.findMany({
    include: {
      listingImages: {
        where: { isCover: true },
        select: { s3Key: true },
        take: 1,
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
      title: {
        contains: query,
        mode: "insensitive",
      },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * 10,
    take: 10,
  });

  // isLiked 속성 추가
  const listingsWithLikeStatus = listings.map((listing) => ({
    ...listing,
    isLiked: listing.likes && listing.likes.length > 0,
    likes: undefined, // likes 배열은 클라이언트로 보내지 않음
  }));

  const s3Urls = listingsWithLikeStatus.map((listing) => {
    return getS3Url(listing.listingImages[0].s3Key);
  });

  return (
    <div>
      <h2 className="text-2xl font-bold my-6 px-4">"{query}" 검색 결과</h2>
      <SearchResults listings={listingsWithLikeStatus} s3Urls={s3Urls} />
      <PaginationBar currentPage={page} />
    </div>
  );
}
