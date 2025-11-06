"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { getRecentlyViewed, removeRecentlyViewed } from "../lib/recentlyViewed";

export default function RecentlyViewed() {
  const { data: session } = useSession();
  const [items, setItems] = useState([]);

  // ============================================
  // 최근 본 상품 불러오기
  // ============================================
  useEffect(() => {
    const userId = session?.user?.id;

    // 초기 로드
    setItems(getRecentlyViewed(userId).slice(0, 3)); // 최대 3개만 표시

    // storage 변경 감지
    const handleStorageChange = () => {
      setItems(getRecentlyViewed(userId).slice(0, 3));
    };

    window.addEventListener("recentlyViewedChanged", handleStorageChange);
    return () => {
      window.removeEventListener("recentlyViewedChanged", handleStorageChange);
    };
  }, [session?.user?.id]); // userId가 변경되면 다시 로드

  // ============================================
  // 상품 제거 핸들러
  // ============================================
  const handleRemove = (e, itemId) => {
    e.preventDefault();
    e.stopPropagation();
    const userId = session?.user?.id;
    removeRecentlyViewed(itemId, userId);
  };

  // 최근 본 상품이 없으면 표시 안 함
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 w-32">
      <div className="bg-white rounded-lg shadow-lg border p-3">
        <h3 className="text-xs font-semibold mb-3 text-center text-gray-700">
          최근본상품
        </h3>
        <div className="space-y-3">
          {items.map((item) => (
            <Link
              href={`/listings/${item.id}`}
              key={item.id}
              className="block relative group"
            >
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
                {/* X 버튼 */}
                <button
                  onClick={(e) => handleRemove(e, item.id)}
                  className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="제거"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs font-medium mt-1 truncate text-gray-800">
                {Number(item.price).toLocaleString()}원
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
