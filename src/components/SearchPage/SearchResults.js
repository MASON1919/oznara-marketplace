"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "../../lib/utils";
import { useLikeStore } from "../../store/useLikeStore";
import { Badge } from "@/components/ui/badge";
import { useInView } from "react-intersection-observer";
export default function SearchResults({ listings, s3Urls, userId, sp }) {
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [allListings, setAllListings] = useState(listings);
  const [page, setPage] = useState(sp.page ? parseInt(sp.page) : 1);
  const [allS3Urls, setAllS3Urls] = useState(s3Urls);
  const { ref, inView, entry } = useInView({
    threshold: 0.1, // 요소의 10%가 보여도 "inView = true"
    rootMargin: "100px", // 화면 아래로 100px 남았을 때 미리 감지
    skip: loading, // 로딩 중일 때는 감지하지 않음
  });
  useEffect(() => {
    setAllListings(listings ?? []);
    setAllS3Urls(s3Urls ?? []);
    setPage(sp.page ? parseInt(sp.page) : 1);
    setHasMore(true);
  }, [listings, s3Urls, sp]);
  useEffect(() => {
    if (!inView || loading || !hasMore) return;
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        // 현재 URL 쿼리를 복사하고 page만 바꿔서 GET 요청
        const params = new URLSearchParams(sp);
        params.set("page", page ?? "1");

        const res = await fetch(`/api/infiniteScroll?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setAllListings((prev) => [...prev, ...data.listings]);
        setPage((prev) => prev + 1);
        setAllS3Urls((prev) => [...prev, ...data.s3Urls]);
        setHasMore(data.hasMore);
      } catch (err) {
        if (err?.name !== "AbortError") {
          console.error("fetch error:", err);
          setHasMore(false);
        }
      } finally {
        setLoading(false);
      }
    })();

    // 컴포넌트가 교체/언마운트되면 요청 취소
    return () => controller.abort();
  }, [inView]);

  // Zustand store에서 상태와 액션 가져오기
  const favorites = useLikeStore((state) => state.favorites);
  const initializeFavorites = useLikeStore(
    (state) => state.initializeFavorites
  );
  const toggleFavorite = useLikeStore((state) => state.toggleFavorite);
  // listings 변경 시 store 초기화
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
  // 좋아요 토글 핸들러
  const handleLike = async (e, listingId) => {
    e.preventDefault();
    e.stopPropagation();

    // Zustand의 toggleFavorite 액션 호출
    await toggleFavorite(listingId);
  };

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 p-4">
        {allListings.map((item, index) => (
          <Link href={`/listings/${item.id}`} key={item.id || index}>
            <div className="rounded-2xl overflow-hidden border hover:shadow-lg transition-shadow bg-white">
              <div className="relative aspect-square bg-gray-100">
                <Image
                  src={allS3Urls[index]}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  width={300}
                  height={300}
                />

                {userId === item.user.id || !userId ? null : (
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
                )}
              </div>

              <div className="p-3">
                <p className="text-sm font-medium text-gray-800 line-clamp-1">
                  {item.title}
                </p>
                <div className="flex justify-between items-center px-3 mt-2">
                  <p className="text-base font-semibold text-gray-900 mt-1">
                    {Number(item.price).toLocaleString()}원
                  </p>
                  {userId === item.user.id && (
                    <Badge className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      내 상품
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div ref={ref} className="h-[150px]"></div>
    </div>
  );
}
