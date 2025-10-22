// app/dashboard/page.jsx  (서버 컴포넌트)
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // 미들웨어로 이미 보호해도, 서버 로직에서 한 번 더 확인 가능
  if (!session) {
    // 여기서 직접 리다이렉트도 가능하지만, 보통 미들웨어에서 처리
    return <div className="p-6">로그인이 필요합니다.</div>;
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
