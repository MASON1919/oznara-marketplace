import { prisma } from "@/lib/prisma";
import { getS3Url } from "@/lib/s3";
import PopularCarousel from "./PopularCarousel";
import { redis } from "@/lib/redis";
export default async function PopularSection() {
  const chached = await redis.get("popularListings");
  if (chached) {
    const { popularListings, s3Urls } = chached;
    return (
      <div className="my-4 px-4 flex flex-col items-start">
        <PopularCarousel popularListings={popularListings} s3Urls={s3Urls} />
      </div>
    );
  } else {
    const popularListings = await prisma.listing.findMany({
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
      orderBy: { viewCount: "desc" },
      take: 12,
      select: {
        id: true,
        title: true,
        price: true,
        viewCount: true,
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
    const s3Urls = popularListings.map((listing) => {
      return getS3Url(listing.listingImages[0].s3Key);
    });
    await redis.set("popularListings", { popularListings, s3Urls }, { ex: 5 });
    return (
      <div className="my-4 px-4 flex flex-col items-start">
        <PopularCarousel popularListings={popularListings} s3Urls={s3Urls} />
      </div>
    );
  }
}
