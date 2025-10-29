"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SearchResults({ listings, s3Urls }) {
  // ============================================
  // 1. 좋아요 상태 관리
  // ============================================
  // 서버에서 받은 isLiked 값을 기반으로 초기 상태를 설정합니다.
  // reduce를 사용해 { [listingId]: isLiked } 형태의 객체를 생성합니다.
  const [favorites, setFavorites] = useState(
    listings.reduce((acc, item) => {
      acc[item.id] = item.isLiked || false; // 서버에서 받은 좋아요 상태 사용
      return acc;
    }, {})
  );

  // ============================================
  // 2. listings prop 변경 시 동기화
  // ============================================
  // ⭐ 새로 추가: 검색어가 바뀌거나 페이지가 변경되어 listings가 업데이트되면
  // favorites 상태도 새로운 데이터로 동기화합니다.
  useEffect(() => {
    setFavorites(
      listings.reduce((acc, item) => {
        acc[item.id] = item.isLiked || false;
        return acc;
      }, {})
    );
  }, [listings]); // listings가 변경될 때마다 실행

  // ============================================
  // 3. 빈 결과 처리
  // ============================================
  if (!listings?.length) {
    return (
      <div className="py-20 text-center text-gray-500">
        검색 결과가 없습니다.
      </div>
    );
  }

  // ============================================
  // 4. 좋아요 토글 핸들러
  // ============================================
  const handleLike = async (e, listingId) => {
    // Link 클릭 방지 (상품 상세 페이지로 이동하지 않도록)
    e.preventDefault();
    e.stopPropagation();

    // 낙관적 업데이트: UI를 먼저 변경합니다.
    const newState = !favorites[listingId];
    setFavorites((prev) => ({ ...prev, [listingId]: newState }));

    try {
      // API 호출로 서버에 좋아요 상태 저장
      await fetch("/api/like/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, like: newState }),
        cache: "no-store",
      });
    } catch (error) {
      // ⭐ 에러 발생 시 롤백: UI 상태를 원래대로 되돌립니다.
      console.error("찜 요청 실패:", error);
      setFavorites((prev) => ({ ...prev, [listingId]: !newState }));
    }
  };

  // ============================================
  // 5. 렌더링
  // ============================================
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 p-4">
      {listings.map((item, index) => (
        <Link href={`/listings/${item.id}`} key={item.id || index}>
          <div className="rounded-2xl overflow-hidden border hover:shadow-lg transition-shadow bg-white">
            {/* ============================================
                6. 이미지 컨테이너 (좋아요 버튼 포함)
                ============================================ */}
            <div className="relative aspect-square bg-gray-100">
              <Image
                src={s3Urls[index]}
                alt={item.title}
                className="w-full h-full object-cover"
                width={300}
                height={300}
              />

              {/* ⭐ 좋아요 버튼: 이미지 우측 하단에 배치 */}
              <button
                onClick={(e) => handleLike(e, item.id)}
                className={cn(
                  "absolute bottom-2 right-2 p-2 rounded-full bg-white/90 backdrop-blur-sm border shadow-sm hover:bg-white transition-all",
                  // favorites[item.id]가 true면 빨간색으로 표시
                  favorites[item.id] && "text-red-500 border-red-300"
                )}
                aria-label="찜"
              >
                <Heart
                  className={cn(
                    "h-4 w-4",
                    // favorites[item.id]가 true면 하트를 채웁니다
                    favorites[item.id] && "fill-current"
                  )}
                />
              </button>
            </div>

            {/* 상품 정보 */}
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
