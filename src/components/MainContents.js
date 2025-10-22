"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function MainContents() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "전체" },
    { id: "electronics", name: "전자제품" },
    { id: "fashion", name: "패션/의류" },
    { id: "books", name: "도서" },
    { id: "furniture", name: "가구/인테리어" },
    { id: "etc", name: "기타" },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log("상품 목록 조회 시작");
      const response = await fetch("/api/products");

      console.log("응답 상태:", response.status);
      console.log("응답 타입:", response.headers.get("content-type"));

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();
      console.log("응답 내용:", text.substring(0, 200));

      const data = JSON.parse(text);
      setProducts(data.products || data || []);
      console.log("상품 로드 완료:", data.products?.length || data.length);
    } catch (error) {
      console.error("상품 목록 조회 실패:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const createdAt = new Date(date);
    const diff = Math.floor((now - createdAt) / 1000); // 초 단위

    if (diff < 60) return "방금 전";
    if (diff < 3600) return Math.floor(diff / 60) + "분 전";
    if (diff < 86400) return Math.floor(diff / 3600) + "시간 전";
    if (diff < 604800) return Math.floor(diff / 86400) + "일 전";
    return createdAt.toLocaleDateString("ko-KR");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 히어로 섹션 */}
      <section className="mb-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-12 text-white">
        <h1 className="text-4xl font-bold mb-4">우리 동네 중고거래</h1>
        <p className="text-xl mb-6">이웃과 함께하는 안전한 중고거래 플랫폼</p>
        <Link
          href="/products/new"
          className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          지금 판매하기
        </Link>
      </section>

      {/* 카테고리 필터 */}
      <section className="mb-8">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </section>

      {/* 상품 목록 */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {selectedCategory === "all"
              ? "전체 상품"
              : categories.find((c) => c.id === selectedCategory)?.name}
          </h2>
          <span className="text-gray-500">
            {filteredProducts.length}개의 상품
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg overflow-hidden shadow animate-pulse"
              >
                <div className="aspect-square bg-gray-300"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              등록된 상품이 없습니다
            </h3>
            <p className="text-gray-500 mb-6">첫 번째 판매자가 되어보세요!</p>
            <Link
              href="/products/new"
              className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              상품 등록하기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow"
              >
                {/* 상품 이미지 */}
                <div className="aspect-square bg-gray-200 relative">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0].imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-4xl">📷</span>
                    </div>
                  )}
                  {product.status === "sold" && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold">
                        판매완료
                      </span>
                    </div>
                  )}
                </div>

                {/* 상품 정보 */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-xl font-bold text-blue-600 mb-2">
                    {formatPrice(product.price)}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{product.condition}</span>
                    <span>{getTimeAgo(product.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 더보기 버튼 (페이지네이션 대신) */}
      {!loading && filteredProducts.length > 0 && (
        <div className="text-center mt-12">
          <button className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors">
            더보기
          </button>
        </div>
      )}
    </div>
  );
}
