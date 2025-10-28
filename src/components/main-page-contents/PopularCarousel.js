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

export default function PopularCarousel({ popularListings, s3Urls }) {
  return (
    <Carousel className="w-full max-w-5xl mx-auto mt-8" opts={{ loop: true }}>
      <h2 className="text-2xl font-bold mb-4">많이 본 상품</h2>
      <CarouselContent className="-ml-1">
        {s3Urls.map((image, index) => (
          <CarouselItem
            key={index}
            className="pl-1 sm:basis-1/2 md:basis-1/4 lg:basis-1/5"
          >
            <Link href={`/listings/${popularListings[index].id}`}>
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
                <p className="mt-2 text-center text-md font-medium">
                  {popularListings[index].title}
                </p>
                <p className="mt-2 text-center text-lg font-bold">
                  {`${popularListings[index].price.toLocaleString()}원`}
                </p>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
