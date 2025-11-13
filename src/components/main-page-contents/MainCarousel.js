import Image from "next/image";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Sparkles } from "lucide-react";

const images = [
  "/joonggoImages/1.png",
  "/joonggoImages/2.png",
  "/joonggoImages/3.png",
  "/joonggoImages/4.webp",
];

export function MainCarousel() {
  return (
    <div className="w-full max-w-6xl mx-auto mt-8">
      {/* 헤더 섹션 */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-xl">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              오늘의 추천
            </h2>
            <p className="text-sm text-gray-500">
              지금 가장 인기 있는 상품들을 확인하세요
            </p>
          </div>
        </div>
      </div>

      <Carousel
        className="w-full"
        opts={{ loop: true, autoplay: true, interval: 2000 }}
      >
        <CarouselContent className="-ml-2">
          {images.map((image, index) => (
            <CarouselItem
              key={index}
              className="pl-2 md:basis-1/2 lg:basis-1/3"
            >
              <div className="group relative">
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.02]">
                  <Image
                    src={image}
                    alt={`Slide ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />

                  {/* 그라데이션 오버레이 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* NEW 배지 (첫 번째 이미지만) */}
                  {index === 0 && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold shadow-lg">
                      <Sparkles className="w-4 h-4" />
                      NEW
                    </div>
                  )}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="hover:bg-blue-500 hover:text-white transition-colors" />
        <CarouselNext className="hover:bg-blue-500 hover:text-white transition-colors" />
      </Carousel>
    </div>
  );
}
