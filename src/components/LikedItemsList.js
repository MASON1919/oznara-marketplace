"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "../lib/utils";
import { useLikeStore } from "../store/useLikeStore";

export default function LikedItemsList({ likes, s3Urls }) {
  // ============================================
  // Zustand store 사용
  // ============================================
  const favorites = useLikeStore((state) => state.favorites);
  const initializeFavorites = useLikeStore(
    (state) => state.initializeFavorites
  );
  const toggleFavorite = useLikeStore((state) => state.toggleFavorite);

  const [removingItems, setRemovingItems] = useState(new Set());

  // ============================================
  // likes 데이터로 store 초기화
  // ============================================
  useEffect(() => {
    // likes 데이터를 listings 형태로 변환
    const listingsData = likes.map((like) => ({
      id: like.listing.id,
      isLiked: true, // 찜 페이지는 모두 true
    }));
    initializeFavorites(listingsData);
  }, [likes, initializeFavorites]);

  // ============================================
  // 좋아요 토글 + 애니메이션
  // ============================================
  const handleLike = async (e, listingId) => {
    e.preventDefault();
    e.stopPropagation();

    const wasLiked = favorites[listingId];

    // Zustand로 좋아요 토글
    await toggleFavorite(listingId);

    // 좋아요 해제 시 애니메이션
    if (wasLiked) {
      setRemovingItems((prev) => new Set([...prev, listingId]));
      setTimeout(() => {
        setRemovingItems((prev) => {
          const next = new Set(prev);
          next.delete(listingId);
          return next;
        });
      }, 300);
    }
  };

  // ============================================
  // 좋아요 해제된 아이템 필터링
  // ============================================
  const visibleLikes = likes.filter(
    (item) => favorites[item.listing.id] !== false
  );

  if (visibleLikes.length === 0) {
    return (
      <div className="py-20 text-center text-gray-500">
        찜한 상품이 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 p-4">
      {visibleLikes.map((item, index) => {
        const originalIndex = likes.findIndex(
          (like) => like.listing.id === item.listing.id
        );
        const isRemoving = removingItems.has(item.listing.id);

        return (
          <Link
            href={`/listings/${item.listing.id}`}
            key={item.listing.id}
            className={cn(
              "transition-all duration-300",
              isRemoving && "opacity-0 scale-95"
            )}
          >
            <div className="rounded-2xl overflow-hidden border hover:shadow-lg transition-shadow bg-white">
              <div className="relative aspect-square bg-gray-100">
                <Image
                  src={s3Urls[originalIndex]}
                  alt={item.listing.title}
                  className="w-full h-full object-cover"
                  width={300}
                  height={300}
                />

                {/* 좋아요 버튼 */}
                <button
                  onClick={(e) => handleLike(e, item.listing.id)}
                  className={cn(
                    "absolute bottom-2 right-2 p-2 rounded-full bg-white/90 backdrop-blur-sm border shadow-sm hover:bg-white transition-all",
                    favorites[item.listing.id] && "text-red-500 border-red-300"
                  )}
                  aria-label="찜"
                >
                  <Heart
                    className={cn(
                      "h-4 w-4",
                      favorites[item.listing.id] && "fill-current"
                    )}
                  />
                </button>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-800 line-clamp-1">
                  {item.listing.title}
                </p>
                <p className="text-base font-semibold text-gray-900 mt-1">
                  {Number(item.listing.price).toLocaleString()}원
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
