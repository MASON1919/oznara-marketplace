import { prisma } from "@/lib/prisma";
import { getS3Url } from "@/lib/s3";
import SearchResults from "@/components/SearchPage/SearchResults";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Filter from "@/components/SearchPage/Filter";
export default async function SearchPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  const sp = await searchParams;
  const query = sp.query || "";
  const page = parseInt(sp.page) || 1;
  const category = sp.category || "all";
  const sort = sp.sort || "latest";
  const minPrice = parseInt(sp.minPrice) || undefined;
  const maxPrice = parseInt(sp.maxPrice) || undefined;

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
      <Filter
        initialQuery={query}
        initialCategory={category}
        initialMinPrice={minPrice}
        initialMaxPrice={maxPrice}
        initialSort={sort}
      />
      <h2 className="text-2xl font-bold my-6 px-4">
        {query ? `"${query}" 검색 결과` : ""}
      </h2>
      <SearchResults
        listings={listingsWithLikeStatus}
        s3Urls={s3Urls}
        userId={userId}
        sp={sp}
      />
    </div>
  );
}
