// src/app/dashboard/page.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ProfileCard from "@/components/mypage/ProfileCard";
import Sidebar from "@/components/mypage/MySidebar";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions); // ← 그냥 이렇게

  if (!session) {
    return <div className="p-6">로그인이 필요합니다.</div>;
  }

  return (
    <div className="flex p-5">
      <div>
        <Sidebar />
      </div>
      <div className="flex-1" >
        <ProfileCard />
      </div>
    </div>
  );
}
