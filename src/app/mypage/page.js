import React from "react";
import DashboardWithSidebar from "@/components/mypage/MySidebar";
import ProfileCard from "@/components/mypage/ProfileCard";
import MyListings from "@/components/MyListings";

export default function MyPageComplete() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* 좌측 고정 사이드바 */}
        <aside className="fixed left-0 top-0 h-screen w-64 pt-30 overflow-y-auto">
          <DashboardWithSidebar />
        </aside>

        {/* 우측 메인 컨텐츠 */}
        <main className="flex-1 ml-64">
          <div className="container mx-auto px-4 py-8">
            <ProfileCard />
            <MyListings />
          </div>
        </main>
      </div>
    </div>
  );
}
