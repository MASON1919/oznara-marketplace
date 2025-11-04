"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, Upload, AlertCircle, Loader2 } from "lucide-react";

const CATEGORIES = [
  "Electronics",
  "Furniture",
  "Clothing",
  "Sports",
  "Books",
  "Others",
];
const METHODS = ["Direct", "Delivery", "Both"];

const CATEGORY_LABELS = {
  Electronics: "전자기기",
  Furniture: "가구",
  Clothing: "의류",
  Sports: "스포츠",
  Books: "도서",
  Others: "기타",
};

const METHOD_LABELS = {
  Direct: "직거래",
  Delivery: "택배",
  Both: "직거래/택배",
};

export default function EditListingForm({ listing, images }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: listing.title,
    description: listing.description || "",
    category: listing.category,
    price: listing.price,
    method: listing.method,
  });
  const [existingImages, setExistingImages] = useState(images);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseInt(value) || 0 : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (existingImages.length + newImages.length + files.length > 10) {
      setError("최대 10개의 이미지만 업로드할 수 있습니다.");
      return;
    }
    setError("");

    const imageUrls = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setNewImages((prev) => [...prev, ...imageUrls]);
  };

  const removeExistingImage = (imageId) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].url);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // FormData 생성
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("category", formData.category);
      submitData.append("price", formData.price);
      submitData.append("method", formData.method);

      // 유지할 이미지 ID들
      existingImages.forEach((img) => {
        submitData.append("keepImageIds", img.id);
      });

      // 새로 추가할 이미지들
      newImages.forEach((img) => {
        submitData.append("newImages", img.file);
      });

      const response = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        body: submitData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "수정에 실패했습니다.");
      }

      router.push(`/listings/${listing.id}`);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalImages = existingImages.length + newImages.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* 제목 */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="상품 제목을 입력하세요"
          />
        </div>

        {/* 카테고리 & 거래 방법 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">
              거래 방법 <span className="text-red-500">*</span>
            </label>
            <select
              name="method"
              value={formData.method}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              {METHODS.map((method) => (
                <option key={method} value={method}>
                  {METHOD_LABELS[method]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 가격 */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900">
            가격 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              min="0"
              className="w-full border border-gray-300 rounded-lg pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
              원
            </span>
          </div>
        </div>

        {/* 설명 */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900">
            상품 설명
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="6"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            placeholder="상품 설명을 입력하세요"
          />
        </div>

        {/* 이미지 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-900">
              상품 이미지
            </label>
            <span className="text-xs text-gray-500 font-medium">
              {totalImages}/10
            </span>
          </div>

          {/* 이미지 그리드 */}
          {(existingImages.length > 0 || newImages.length > 0) && (
            <div className="grid grid-cols-5 gap-3">
              {existingImages.map((img, index) => (
                <div key={img.id} className="relative aspect-square group">
                  <Image
                    src={img.url}
                    alt="기존 이미지"
                    fill
                    className="object-cover rounded-lg border border-gray-200"
                  />
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded">
                      대표
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeExistingImage(img.id)}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {newImages.map((img, index) => (
                <div
                  key={`new-${index}`}
                  className="relative aspect-square group"
                >
                  <Image
                    src={img.url}
                    alt="새 이미지"
                    fill
                    className="object-cover rounded-lg border border-gray-200"
                  />
                  <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded">
                    신규
                  </div>
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 이미지 업로드 버튼 */}
          {totalImages < 10 && (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 font-medium">
                  클릭하여 이미지 추가
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG (최대 10개)
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "수정 중..." : "수정 완료"}
        </button>
      </div>
    </form>
  );
}
