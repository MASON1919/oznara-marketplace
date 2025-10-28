"use client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
export default function ListingCarousel({ s3Urls }) {
  return (
    <Carousel className="w-full max-w-5xl mx-auto" opts={{ loop: true }}>
      <CarouselContent className="-ml-1">
        {s3Urls.map((image, index) => (
          <CarouselItem key={index} className="pl-1">
            <div className="p-4 flex flex-col items-center">
              <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg">
                <Image
                  src={image}
                  alt={`Slide ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
                />
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
