"use client";

import { useRouter } from "next/navigation";
import { Edit } from "lucide-react";

/**
 * 게시글 수정 버튼 컴포넌트
 * 클릭 시 게시글 수정 페이지로 이동합니다
 * @param {string} listingId - 수정할 게시글의 ID
 */
export default function EditButton({ listingId }) {
  const router = useRouter();

  // 수정 페이지로 이동하는 핸들러
  const handleEdit = () => {
    router.push(`/listings/${listingId}/edit`);
  };

  return (
    <button
      onClick={handleEdit}
      className="inline-flex items-center justify-center gap-2 w-full rounded-lg text-base font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-12 px-6 py-3 shadow-md hover:shadow-lg"
    >
      <Edit className="w-5 h-5" />
      게시글 수정
    </button>
  );
}
