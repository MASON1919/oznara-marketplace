"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Heart } from "lucide-react";
import { cn } from "../../lib/utils";
import { useLikeStore } from "../../store/useLikeStore";

export default function SearchResults({ listings, s3Urls }) {
  // ============================================
  // Zustand store에서 상태와 액션 가져오기
  // ============================================
  const favorites = useLikeStore((state) => state.favorites);
  const initializeFavorites = useLikeStore(
    (state) => state.initializeFavorites
  );
  const toggleFavorite = useLikeStore((state) => state.toggleFavorite);

  // ============================================
  // listings 변경 시 store 초기화
  // ============================================
  useEffect(() => {
    initializeFavorites(listings);
  }, [listings, initializeFavorites]);

  if (!listings?.length) {
    return (
      <div className="py-20 text-center text-gray-500">
        검색 결과가 없습니다.
      </div>
    );
  }

  // ============================================
  // 좋아요 토글 핸들러
  // ============================================
  const handleLike = async (e, listingId) => {
    e.preventDefault();
    e.stopPropagation();

    // Zustand의 toggleFavorite 액션 호출
    await toggleFavorite(listingId);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 p-4">
      {listings.map((item, index) => (
        <Link href={`/listings/${item.id}`} key={item.id || index}>
          <div className="rounded-2xl overflow-hidden border hover:shadow-lg transition-shadow bg-white">
            <div className="relative aspect-square bg-gray-100">
              <Image
                src={s3Urls[index]}
                alt={item.title}
                className="w-full h-full object-cover"
                width={300}
                height={300}
              />

              {/* 좋아요 버튼 */}
              <button
                onClick={(e) => handleLike(e, item.id)}
                className={cn(
                  "absolute bottom-2 right-2 p-2 rounded-full bg-white/90 backdrop-blur-sm border shadow-sm hover:bg-white transition-all",
                  favorites[item.id] && "text-red-500 border-red-300"
                )}
                aria-label="찜"
              >
                <Heart
                  className={cn(
                    "h-4 w-4",
                    favorites[item.id] && "fill-current"
                  )}
                />
              </button>
            </div>

            <div className="p-3">
              <p className="text-sm font-medium text-gray-800 line-clamp-1">
                {item.title}
              </p>
              <p className="text-base font-semibold text-gray-900 mt-1">
                {Number(item.price).toLocaleString()}원
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
