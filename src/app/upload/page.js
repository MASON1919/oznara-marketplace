import UploadForm from "@/components/UploadForm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
export default async function UploadPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/");
  }
  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">상품 업로드</h1>
      <UploadForm />
    </div>
  );
}
