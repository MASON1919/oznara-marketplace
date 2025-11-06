"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { addRecentlyViewed } from "../../lib/recentlyViewed";

export default function RecentlyViewedTracker({ listing, imageUrl }) {
  const { data: session } = useSession();

  // ============================================
  // 페이지 진입 시 최근 본 상품에 추가
  // ============================================
  useEffect(() => {
    if (listing) {
      const userId = session?.user?.id;
      addRecentlyViewed(
        {
          id: listing.id,
          title: listing.title,
          price: listing.price,
          imageUrl: imageUrl, // 커버 이미지 URL
        },
        userId
      ); // userId 전달
    }
  }, [listing, imageUrl, session?.user?.id]);

  // 이 컴포넌트는 UI를 렌더링하지 않음 (추적만 함)
  return null;
}
