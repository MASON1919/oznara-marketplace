import Image from "next/image";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const images = [
  "/joonggoImages/1.png",
  "/joonggoImages/2.png",
  "/joonggoImages/3.png",
  "/joonggoImages/4.webp",
];

export function MainCarousel() {
  return (
    <Carousel
      className="w-full max-w-5xl mx-auto mt-8"
      opts={{ loop: true, autoplay: true, interval: 2000 }}
    >
      <CarouselContent className="-ml-1">
        {images.map((image, index) => (
          <CarouselItem key={index} className="pl-1 md:basis-1/2 lg:basis-1/3">
            <div className="p-4">
              <Image
                src={image}
                alt={`Slide ${index + 1}`}
                width={400}
                height={400}
                className="h-full w-full object-cover rounded-lg"
                priority={index === 0}
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
