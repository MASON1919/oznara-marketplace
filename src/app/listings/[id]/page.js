import { prisma } from "@/lib/prisma";
import { getS3Url } from "@/lib/s3";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ListingCarousel from "@/components/ListingPage/ListingCarousel";
import PurchaseForm from "@/components/ListingPage/PurchaseForm";
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
  const s3Urls = listingInfo.listingImages.map((image) =>
    getS3Url(image.s3Key)
  );
  if (!listingInfo) {
    return <div>상품 정보를 찾을 수 없습니다</div>;
  } else {
    return (
      <div className="mt-16 max-w-5xl mx-auto p-4 flex gap-16 items-start">
        <ListingCarousel listingInfo={listingInfo} s3Urls={s3Urls} />
        <PurchaseForm
          listingInfo={listingInfo}
          initialLike={listingInfo.likes.length > 0}
        />
      </div>
    );
  }
}
