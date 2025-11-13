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
  "/joonggoImages/oznara-main-1.png",
  "/joonggoImages/oznara-main-2.png",
  "/joonggoImages/oznara-main-3.png",
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
              오즈나라에 오신 것을 환영합니다! 🎉
            </h2>
            <p className="text-sm text-gray-500">
              안전하고 편리한 중고거래를 경험해보세요
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
