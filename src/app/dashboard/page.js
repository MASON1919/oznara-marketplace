// app/dashboard/page.jsx  (서버 컴포넌트)
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">
        안녕하세요, {session.user?.name || session.user?.email}님
      </h1>
      {/* 보호된 내용 */}
    </div>
  );
}
