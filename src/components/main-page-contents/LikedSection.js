import { prisma } from "@/lib/prisma";
import { getS3Url } from "@/lib/s3";
import { redis } from "@/lib/redis";
import LikedCarousel from "./LikedCarousel";

export default async function LikedSection() {
  const chached = await redis.get("likedListings");
  if (chached) {
    const { likedListings, s3Urls } = chached;
    return (
      <div className="my-4 px-4 flex flex-col items-start">
        <LikedCarousel likedListings={likedListings} s3Urls={s3Urls} />
      </div>
    );
  } else {
    const likedListings = await prisma.listing.findMany({
      where: {
        deleted: false,
        // 거래 완료된 상품 제외
        NOT: {
          transaction: {
            some: {
              status: "Completed",
            },
          },
        },
      },
      orderBy: { likeCount: "desc" }, // 찜 많은 순으로 정렬 (1위부터)
      take: 12,
      select: {
        id: true,
        title: true,
        price: true,
        likeCount: true,
        createdAt: true,
        listingImages: {
          where: { isCover: true },
          take: 1,
          select: {
            s3Key: true,
          },
        },
      },
    });

    const s3Urls = likedListings.map((listing) => {
      return getS3Url(listing.listingImages[0].s3Key);
    });

    await redis.set("likedListings", { likedListings, s3Urls }, { ex: 60 * 5 });

    return (
      <div className="my-4 px-4 flex flex-col items-start">
        <LikedCarousel likedListings={likedListings} s3Urls={s3Urls} />
      </div>
    );
  }
}
