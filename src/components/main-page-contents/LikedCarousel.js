"use client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import Link from "next/link";
import { Heart, TrendingUp, Clock } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

export default function LikedCarousel({ likedListings, s3Urls }) {
  return (
    <Carousel
      className="w-full max-w-6xl mx-auto mt-8"
      opts={{
        loop: true,
        startIndex: 2, // 3번째 아이템(index 2)부터 시작 = 1위가 중앙
      }}
    >
      {/* 헤더 섹션 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-pink-500 to-red-500 p-2 rounded-xl">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
              인기 급상승
            </h2>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              찜이 가장 많은 상품들
            </p>
          </div>
        </div>
      </div>

      <CarouselContent className="-ml-2">
        {s3Urls.map((image, index) => (
          <CarouselItem
            key={index}
            className="pl-2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
          >
            <Link href={`/listings/${likedListings[index].id}`}>
              <div className="group relative">
                {/* 이미지 컨테이너 */}
                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-md transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.02]">
                  <Image
                    src={image}
                    alt={likedListings[index].title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />

                  {/* 그라데이션 오버레이 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* 찜 개수 배지 - 좌측 상단으로 이동 */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold shadow-lg">
                    <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                    <span className="bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
                      {likedListings[index].likeCount}
                    </span>
                  </div>

                  {/* 순위 배지 - 상위 3개만 */}
                  {index < 3 && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shadow-lg">
                      {index + 1}
                    </div>
                  )}
                </div>

                {/* 텍스트 정보 */}
                <div className="mt-3 px-1">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight group-hover:text-pink-600 transition-colors">
                    {likedListings[index].title}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    {/* 좌측: 가격 */}
                    <p className="text-base font-bold text-gray-900">
                      {`${likedListings[index].price.toLocaleString()}원`}
                    </p>
                    {/* 우측: 등록 시간 */}
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>
                        {formatTimeAgo(likedListings[index].createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious className="hover:bg-pink-500 hover:text-white transition-colors" />
      <CarouselNext className="hover:bg-pink-500 hover:text-white transition-colors" />
    </Carousel>
  );
}
