import { prisma } from "@/lib/prisma";
import { getS3Url } from "@/lib/s3";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ListingCarousel from "@/components/ListingPage/ListingCarousel";
import PurchaseForm from "@/components/ListingPage/PurchaseForm";
import ListingDescription from "@/components/ListingPage/ListingDescription";
import EditButton from "@/components/ListingPage/EditButton";
import DeleteButton from "@/components/ListingPage/DeleteButton";
import RecentlyViewedTracker from "@/components/ListingPage/RecentlyViewedTracker";
import SoldOutOverlay from "@/components/ListingPage/SoldOutOverlay";
import { cookies } from "next/headers";
import { redis } from "@/lib/redis";

export default async function ListingPage({ params }) {
  // URL 파라미터에서 상품 ID를 가져옵니다.
  const { id } = await params;
  // NextAuth를 사용하여 현재 로그인된 사용자의 세션 정보를 서버에서 가져옵니다.
  const session = await getServerSession(authOptions);
  // 로그인된 사용자의 ID를 가져오거나, 로그인되지 않았다면 null로 설정합니다.
  const userId = session?.user?.id ?? null;

  // Prisma를 사용하여 데이터베이스에서 상품 정보를 가져옵니다.
  // 상품 이미지와 사용자의 좋아요 여부도 함께 포함합니다.

  const listingInfo = await prisma.listing.findUnique({
    where: { id },
    include: {
      listingImages: {
        select: { s3Key: true },
      },
      likes: userId
        ? {
            // 사용자가 로그인되어 있다면 좋아요 여부를 확인합니다.
            where: { userId: userId },
            select: { userId: true },
            take: 1,
          }
        : false, // 로그인되어 있지 않다면 좋아요 정보를 가져오지 않습니다.
      transaction: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
  // id 는 상품의 id
  const cookieStore = await cookies();
  const anonId = cookieStore.get("oz_anon")?.value;
  const seenKey = `seen:${id}:${anonId}`;
  const firstSeen = await redis.set(seenKey, "1", { nx: true, ex: 60 * 60 });

  if (firstSeen) {
    await prisma.listing.update({
      where: { id },
      data: {
        viewCount: { increment: 1 },
      },
    });
    listingInfo.viewCount += 1;
  }

  // S3 키를 사용하여 이미지 URL을 생성합니다.

  if (listingInfo.likes === undefined) {
    listingInfo.likes = [];
  }

  const s3Urls = listingInfo.listingImages.map((image) =>
    getS3Url(image.s3Key)
  );

  // 좋아요 정보가 undefined일 경우 빈 배열로 초기화합니다.
  if (listingInfo.likes === undefined) {
    listingInfo.likes = [];
  }

  // 거래 정보에 따라 상태 계산
  let status = "OnSale"; // 기본: 판매중
  const latestTransaction = listingInfo.transaction?.[0];

  if (latestTransaction) {
    if (latestTransaction.status === "Pending") {
      status = "Reserved"; // 예약중
    } else if (latestTransaction.status === "Completed") {
      status = "SoldOut"; // 판매완료
    }
  }

  // 현재 사용자가 구매자인지 확인
  const isBuyer = latestTransaction?.buyerId === userId;

  // 상품 정보가 없을 경우 에러 메시지를 표시합니다.
  if (!listingInfo) {
    return <div>상품 정보를 찾을 수 없습니다</div>;
  }

  return (
    <div className="mt-16 max-w-5xl mx-auto p-4 relative">
      {/* 거래완료 오버레이 - 판매자가 아닌 경우에만 표시 */}
      {status === "SoldOut" && userId !== listingInfo.userId && (
        <SoldOutOverlay />
      )}

      {/* 최근 본 상품 추적 컴포넌트 (UI 없음) */}
      <RecentlyViewedTracker
        listing={listingInfo}
        imageUrl={s3Urls[0]} // 첫 번째 이미지 (커버 이미지)
      />

      <div className="flex gap-16 items-start">
        {/* 상품 이미지 캐러셀 컴포넌트 */}
        <ListingCarousel listingInfo={listingInfo} s3Urls={s3Urls} />
        {/* 구매 관련 폼 컴포넌트 */}
        <PurchaseForm
          listingInfo={listingInfo}
          initialLike={listingInfo.likes.length > 0}
          status={status}
          hasTransaction={
            !!latestTransaction && latestTransaction.status !== "Canceled"
          }
          isSeller={userId === listingInfo.userId}
          isBuyer={isBuyer}
        />
      </div>
      {/* 상품 설명 컴포넌트 */}
      <ListingDescription description={listingInfo.description} />

      {/* 수정/삭제 버튼 영역: 판매자만 자신의 게시글을 수정하거나 삭제할 수 있습니다 */}
      {userId && userId === listingInfo.userId && (
        <div className="mt-4 flex gap-3">
          {/* 게시글 수정 버튼 */}
          <div className="flex-1">
            <EditButton listingId={id} />
          </div>
          {/* 게시글 삭제 버튼 */}
          <div className="flex-1">
            <DeleteButton listingId={id} />
          </div>
        </div>
      )}
    </div>
  );
}
