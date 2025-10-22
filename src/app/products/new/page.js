"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ImageUpload";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "새상품",
    imageKeys: [],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.price) {
      alert("제목과 가격은 필수항목입니다.");
      return;
    }

    if (formData.imageKeys.length === 0) {
      alert("최소 1개의 이미지를 업로드해주세요.");
      return;
    }

    if (!formData.category) {
      alert("카테고리를 선택해주세요.");
      return;
    }

    setLoading(true);

    try {
      console.log("상품 등록 요청:", formData);

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseInt(formData.price),
          sellerId: "temp-user-id",
        }),
      });

      console.log("응답 상태:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "상품 등록 실패");
      }

      const product = await response.json();
      console.log("상품 등록 완료:", product.id);

      alert("상품이 등록되었습니다!");
      router.push(`/products/${product.id}`);
    } catch (error) {
      console.error("상품 등록 실패:", error);
      alert(`상품 등록에 실패했습니다: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2 text-gray-900">상품 등록</h1>
      <p className="text-gray-600 mb-8 text-gray-900">
        판매할 상품 정보를 입력해주세요.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white rounded-lg p-8 shadow"
      >
        {/* 이미지 업로드 */}
        <div>
          <label className="block text-sm font-semibold mb-3 text-gray-900">
            상품 이미지 <span className="text-red-500">*</span>
          </label>
          <ImageUpload
            onImagesChange={(keys) =>
              setFormData({ ...formData, imageKeys: keys })
            }
          />
          <p className="text-xs text-gray-500 mt-2">
            최소 1개, 최대 5개의 이미지를 업로드할 수 있습니다.
          </p>
        </div>

        {/* 제목 */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="상품 제목을 입력하세요"
            maxLength="100"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.title.length}/100
          </p>
        </div>

        {/* 카테고리 */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            카테고리 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">카테고리를 선택하세요</option>
            <option value="electronics">전자제품</option>
            <option value="fashion">패션/의류</option>
            <option value="books">도서</option>
            <option value="furniture">가구/인테리어</option>
            <option value="etc">기타</option>
          </select>
        </div>

        {/* 상태 */}
        <div>
          <label className="block text-sm font-semibold mb-3">
            상품 상태 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="새상품"
                checked={formData.condition === "새상품"}
                onChange={(e) =>
                  setFormData({ ...formData, condition: e.target.value })
                }
                className="w-4 h-4 mr-2"
              />
              <span className="text-sm">새상품</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="중고"
                checked={formData.condition === "중고"}
                onChange={(e) =>
                  setFormData({ ...formData, condition: e.target.value })
                }
                className="w-4 h-4 mr-2"
              />
              <span className="text-sm">중고</span>
            </label>
          </div>
        </div>

        {/* 가격 */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            가격 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              required
              min="0"
            />
            <span className="absolute right-4 top-2 text-gray-500">원</span>
          </div>
          {formData.price && (
            <p className="text-sm text-gray-600 mt-1">
              {new Intl.NumberFormat("ko-KR").format(parseInt(formData.price))}
              원
            </p>
          )}
        </div>

        {/* 설명 */}
        <div>
          <label className="block text-sm font-semibold mb-2">상품 설명</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="6"
            placeholder="상품에 대한 자세한 설명을 입력하세요"
            maxLength="1000"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.description.length}/1000
          </p>
        </div>

        {/* 제출 버튼 */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
          >
            {loading ? "등록 중..." : "상품 등록하기"}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
