import { prisma } from "@/lib/prisma";
import { getS3Url } from "@/lib/s3";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 컴포넌트들을 import 합니다.
import ListingCarousel from "@/components/ListingPage/ListingCarousel";
import PurchaseForm from "@/components/ListingPage/PurchaseForm";

import ListingDescription from "@/components/ListingPage/ListingDescription";
import ChatButton from "@/components/ChatButton"; // 새로 추가된 채팅 버튼 컴포넌트
import EditButton from "@/components/ListingPage/EditButton"; // 게시글 수정 버튼 컴포넌트
import DeleteButton from "@/components/ListingPage/DeleteButton"; // 게시글 삭제 버튼 컴포넌트

// 상품 상세 페이지 컴포넌트입니다. 서버 컴포넌트로 동작합니다.

import RecentlyViewedTracker from "@/components/ListingPage/RecentlyViewedTracker"; // 추가

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
    },
  });

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

  // 상품 정보가 없을 경우 에러 메시지를 표시합니다.
  if (!listingInfo) {
    return <div>상품 정보를 찾을 수 없습니다</div>;
  } else {
    // 상품 정보가 있을 경우 상세 페이지 UI를 렌더링합니다.
    return (
      <div className="mt-16 max-w-5xl mx-auto p-4">
        <div className="flex gap-16 items-start">
          {/* 상품 이미지 캐러셀 컴포넌트 */}
          <ListingCarousel listingInfo={listingInfo} s3Urls={s3Urls} />
          {/* 구매 관련 폼 컴포넌트 */}
          <PurchaseForm
            listingInfo={listingInfo}
            initialLike={listingInfo.likes.length > 0}
          />
        </div>
        {/* 상품 설명 컴포넌트 */}
        <ListingDescription description={listingInfo.description} />

        {/* 채팅 버튼 컴포넌트: 상품 설명 아래에 위치하며, 판매자 ID를 전달합니다. */}
        <div className="mt-8">
          <ChatButton sellerId={listingInfo.userId} />
        </div>

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
  {
    /*
  return (
    <div className="mt-16 max-w-5xl mx-auto p-4 flex gap-16 items-start">
      
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
  );*/
  }
}
