"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

const CATEGORIES = [
  { label: "전체", slug: "all" },
  { label: "디지털/가전", slug: "Electronics" },
  { label: "가구/인테리어", slug: "Furniture" },
  { label: "패션/잡화", slug: "Clothing" },
  { label: "스포츠/레저", slug: "Sports" },
  { label: "도서/취미/게임", slug: "Books" },
  { label: "기타", slug: "Others" },
];

const PRICE_MIN = 0;
const PRICE_MAX = 100_000_000; // 1억원

export default function Filter({
  initialQuery,
  initialCategory,
  initialMinPrice,
  initialMaxPrice,
}) {
  const router = useRouter();

  const [category, setCategory] = useState(initialCategory || "");
  const [minPrice, setMinPrice] = useState(initialMinPrice || 0);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice || 0);

  // 가격 입력 보정
  const normalizeRange = (min, max) => {
    let a = Math.max(PRICE_MIN, Math.min(min, PRICE_MAX));
    let b = Math.max(PRICE_MIN, Math.min(max, PRICE_MAX));
    if (a > b) [a, b] = [b, a];
    return [a, b];
  };

  const onChangeMin = (e) => {
    const v = Number(e.target.value.replaceAll(",", ""));
    const [a, b] = normalizeRange(Number.isFinite(v) ? v : PRICE_MIN, maxPrice);
    setMinPrice(a);
    setMaxPrice(b); // min이 커져서 max보다 커질 때 swap
  };

  const onChangeMax = (e) => {
    const v = Number(e.target.value.replaceAll(",", ""));
    const [a, b] = normalizeRange(minPrice, Number.isFinite(v) ? v : PRICE_MAX);
    setMinPrice(a);
    setMaxPrice(b); // max이 작아져 min보다 작아질 때 swap
  };

  const resetFilters = () => {
    setCategory("");
    setMinPrice(PRICE_MIN);
    setMaxPrice(PRICE_MIN);
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    params.set("page", "1");
    if (category) params.set("category", category);
    if (minPrice !== PRICE_MIN) params.set("minPrice", String(minPrice));
    if (maxPrice !== PRICE_MAX) params.set("maxPrice", String(maxPrice));
    if (initialQuery) params.set("query", initialQuery);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-3xl rounded-xl border p-4 shadow-sm bg-white mx-auto mb-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* 카테고리 */}
        <div className="space-y-2">
          <Label>카테고리</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.slug || "all"} value={c.slug}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 최소 가격 */}
        <div className="space-y-2">
          <Label>최소 가격 (원)</Label>
          <Input
            inputMode="numeric"
            value={minPrice.toString()}
            onChange={onChangeMin}
            placeholder="0"
          />
        </div>

        {/* 최대 가격 */}
        <div className="space-y-2">
          <Label>최대 가격 (원)</Label>
          <Input
            inputMode="numeric"
            value={maxPrice.toString()}
            onChange={onChangeMax}
            placeholder={PRICE_MAX.toString()}
          />
        </div>
      </div>
      {/*선택한 필터 */}
      <div className="mt-4 text-sm text-gray-600">
        선택한 필터: {category && <span>카테고리: {category}</span>}
        {minPrice !== PRICE_MIN && (
          <span>최소 가격: {minPrice.toLocaleString("ko-KR")}원</span>
        )}
        {maxPrice !== PRICE_MAX && (
          <span>최대 가격: {maxPrice.toLocaleString("ko-KR")}원</span>
        )}
      </div>

      {/* 액션 */}
      <div className="mt-6 flex items-center gap-2">
        <Button variant="secondary" type="button" onClick={resetFilters}>
          초기화
        </Button>
        <Button type="button" onClick={applyFilters}>
          적용하기
        </Button>
      </div>
    </div>
  );
}
