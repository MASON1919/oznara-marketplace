import { MainCarousel } from "@/components/main-page-contents/MainCarousel";
import PopularSection from "@/components/main-page-contents/PopularSection";
import MyListings from "@/components/MyListings";
export default function Home() {
  return (
    <div>
      <MainCarousel />
      <PopularSection />
      <MyListings />
    </div>
  );
}
