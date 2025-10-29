"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LikedItemsList({ likes, s3Urls }) {
  const [likedItems, setLikedItems] = useState(
    likes.reduce((acc, item) => {
      acc[item.listing.id] = true;
      return acc;
    }, {})
  );
  const [removingItems, setRemovingItems] = useState(new Set());

  const handleLike = async (e, listingId) => {
    e.preventDefault();
    e.stopPropagation();

    const newState = !likedItems[listingId];
    setLikedItems((prev) => ({ ...prev, [listingId]: newState }));

    try {
      await fetch("/api/like/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, like: newState }),
        cache: "no-store",
      });

      // 좋아요 해제 시 부드럽게 사라지는 애니메이션
      if (!newState) {
        setRemovingItems((prev) => new Set([...prev, listingId]));
        // 애니메이션 후 DOM에서 제거
        setTimeout(() => {
          setRemovingItems((prev) => {
            const next = new Set(prev);
            next.delete(listingId);
            return next;
          });
        }, 300);
      }
    } catch (error) {
      console.error("찜 요청 실패:", error);
      setLikedItems((prev) => ({ ...prev, [listingId]: !newState }));
    }
  };

  // 제거된 아이템 필터링
  const visibleLikes = likes.filter(
    (item) => likedItems[item.listing.id] !== false
  );

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
                    likedItems[item.listing.id] && "text-red-500 border-red-300"
                  )}
                  aria-label="찜"
                >
                  <Heart
                    className={cn(
                      "h-4 w-4",
                      likedItems[item.listing.id] && "fill-current"
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
