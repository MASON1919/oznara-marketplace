"use client";

import { useRouter } from "next/navigation";

export default function SoldOutOverlay() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-10 h-10 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">거래 완료</h2>
        <p className="text-gray-600 mb-6">이 상품은 거래가 완료되었습니다</p>
        <button
          onClick={() => router.back()}
          className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
        >
          돌아가기
        </button>
      </div>
    </div>
  );
}
