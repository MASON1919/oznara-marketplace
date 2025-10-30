import { prisma } from "@/lib/prisma";
import { getS3Url } from "@/lib/s3";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ListingCarousel from "@/components/ListingPage/ListingCarousel";
import PurchaseForm from "@/components/ListingPage/PurchaseForm";
import RecentlyViewedTracker from "@/components/ListingPage/RecentlyViewedTracker"; // 추가

export default async function ListingPage({ params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;

  const listingInfo = await prisma.listing.findUnique({
    where: { id },
    include: {
      listingImages: {
        select: { s3Key: true },
      },
      likes: userId
        ? {
            where: { userId: userId },
            select: { userId: true },
            take: 1,
          }
        : false,
    },
  });

  if (!listingInfo) {
    return <div>상품 정보를 찾을 수 없습니다</div>;
  }

  const s3Urls = listingInfo.listingImages.map((image) =>
    getS3Url(image.s3Key)
  );

  return (
    <div className="mt-16 max-w-5xl mx-auto p-4 flex gap-16 items-start">
      {/* ============================================
          최근 본 상품 추적 컴포넌트 (UI 없음)
          ============================================ */}
      <RecentlyViewedTracker
        listing={listingInfo}
        imageUrl={s3Urls[0]} // 첫 번째 이미지 (커버 이미지)
      />

      <ListingCarousel listingInfo={listingInfo} s3Urls={s3Urls} />
      <PurchaseForm
        listingInfo={listingInfo}
        initialLike={listingInfo.likes.length > 0}
      />
    </div>
  );
}
