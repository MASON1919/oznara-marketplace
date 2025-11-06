"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";

/**
 * 게시글 삭제 버튼 컴포넌트
 * 삭제 확인 모달을 표시하고, 확인 시 게시글을 삭제합니다
 * @param {string} listingId - 삭제할 게시글의 ID
 */
export default function DeleteButton({ listingId }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false); // 삭제 진행 중 상태
  const [showConfirm, setShowConfirm] = useState(false); // 확인 모달 표시 상태

  // 게시글 삭제를 실행하는 핸들러
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // DELETE API 호출
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("삭제에 실패했습니다.");
      }

      // 삭제 성공 시 홈페이지로 이동
      router.push("/");
      router.refresh();
    } catch (error) {
      alert(error.message);
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  // 삭제 확인 모달
  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          {/* 모달 헤더 */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                게시글 삭제
              </h3>
              <p className="text-sm text-gray-500">정말로 삭제하시겠습니까?</p>
            </div>
          </div>
          {/* 경고 메시지 */}
          <p className="text-sm text-gray-600 mb-6">
            이 작업은 되돌릴 수 없습니다. 게시글과 모든 관련 데이터가 영구적으로
            삭제됩니다.
          </p>
          {/* 버튼 영역 */}
          <div className="flex gap-3">
            {/* 취소 버튼 */}
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50"
            >
              취소
            </button>
            {/* 삭제 확인 버튼 */}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 shadow-md"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  삭제 중...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  삭제
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 삭제 버튼
  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="inline-flex items-center justify-center gap-2 w-full rounded-lg text-base font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-red-600 text-white hover:bg-red-700 h-12 px-6 py-3 shadow-md hover:shadow-lg"
    >
      <Trash2 className="w-5 h-5" />
      게시글 삭제
    </button>
  );
}
