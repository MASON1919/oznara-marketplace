"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";

export default function ImageUpload({ onImagesChange }) {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = async (acceptedFiles) => {
    if (images.length + acceptedFiles.length > 5) {
      alert("최대 5개의 이미지만 업로드 가능합니다.");
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = acceptedFiles.map(async (file) => {
        // 1. Presigned URL 받기
        const response = await fetch("/api/upload/presigned", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
          }),
        });

        const { url, key } = await response.json();

        // 2. S3에 직접 업로드
        try {
          console.log("✅ S3 presigned URL:", url);

          const res = await fetch(url, {
            method: "PUT",
            body: file,
            // ✅ headers 제거!
          });

          if (!res.ok) {
            throw new Error(`업로드 실패: ${res.status}`);
          }

          console.log("✅ 이미지 업로드 성공");
        } catch (error) {
          console.error("❌ 업로드 에러:", error);
        }

        // 3. 미리보기용 로컬 URL 생성
        const previewUrl = URL.createObjectURL(file);

        return { key, previewUrl };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      const newImages = [...images, ...uploadedImages];
      setImages(newImages);
      onImagesChange(newImages.map((img) => img.key));
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: uploading || images.length >= 5,
  });

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages.map((img) => img.key));
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }
          ${images.length >= 5 ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <p>업로드 중...</p>
        ) : images.length >= 5 ? (
          <p>최대 5개까지 업로드 가능합니다.</p>
        ) : isDragActive ? (
          <p>여기에 이미지를 놓으세요</p>
        ) : (
          <div>
            <p className="text-gray-900">
              이미지를 드래그하거나 클릭해서 업로드
            </p>

            <p className="text-sm text-gray-500 mt-2">
              ({images.length}/5) · 최대 5MB
            </p>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-5 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={image.previewUrl}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
              >
                ×
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  대표
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
