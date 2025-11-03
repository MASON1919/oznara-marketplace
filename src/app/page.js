import { MainCarousel } from "@/components/main-page-contents/MainCarousel";
import PopularSection from "@/components/main-page-contents/PopularSection";
import MyListings from "@/components/MyListings";
import MySideBar from "@/components/mypage/MySidebar";
import ProfilePanel from "@/components/mypage/ProfileCard";
export default function Home() {
  return (
    <div>
      <MainCarousel />
      <PopularSection />
      <MyListings />
      <ProfilePanel />
      <MySideBar />
    </div>
  );
}
