import { MainCarousel } from "@/components/main-page-contents/MainCarousel";
import PopularSection from "@/components/main-page-contents/PopularSection";
import LikedSection from "@/components/main-page-contents/LikedSection";

export default function Home() {
  return (
    <div>
      <MainCarousel />
      <PopularSection />
      <LikedSection />
    </div>
  );
}
