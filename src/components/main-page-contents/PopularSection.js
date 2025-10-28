import { prisma } from "@/lib/prisma";
import { getS3Url } from "@/lib/s3";
import PopularCarousel from "./PopularCarousel";
export default async function PopularSection() {
  const popularListings = await prisma.listing.findMany({
    orderBy: { viewCount: "desc" },
    take: 12,
    include: {
      listingImages: {
        where: { isCover: true },
        take: 1,
      },
    },
  });
  const s3Url3 = popularListings.map((listing) => {
    return getS3Url(listing.listingImages[0].s3Key);
  });
  return (
    <div className="my-16 px-4 flex flex-col items-start">
      <PopularCarousel popularListings={popularListings} s3Urls={s3Url3} />
    </div>
  );
}
