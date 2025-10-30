"use client";
import { useEffect } from "react";
import { addRecentlyViewed } from "../../lib/recentlyViewed";

export default function RecentlyViewedTracker({ listing, imageUrl }) {
  // ============================================
  // 페이지 진입 시 최근 본 상품에 추가
  // ============================================
  useEffect(() => {
    if (listing) {
      addRecentlyViewed({
        id: listing.id,
        title: listing.title,
        price: listing.price,
        imageUrl: imageUrl, // 커버 이미지 URL
      });
    }
  }, [listing, imageUrl]);

  // 이 컴포넌트는 UI를 렌더링하지 않음 (추적만 함)
  return null;
}
