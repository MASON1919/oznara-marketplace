"use client";

import { useState, useMemo } from "react";
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
import { X, ArrowUpDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { set } from "zod";
const UNSET = -1;
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
  initialSort,
}) {
  if (initialSort === undefined) {
    initialSort = "latest";
  }
  const [sort, setSort] = useState(initialSort);
  const display = "정렬";
  const router = useRouter();

  const [category, setCategory] = useState(initialCategory || "");
  const [minPrice, setMinPrice] = useState(
    Number.isFinite(initialMinPrice) ? initialMinPrice : UNSET
  );
  const [maxPrice, setMaxPrice] = useState(
    Number.isFinite(initialMaxPrice) ? initialMaxPrice : UNSET
  );
  const resetFilters = () => {
    setCategory("");
    setMinPrice(PRICE_MIN);
    setMaxPrice(PRICE_MIN);
  };

  const pushWithState = ({
    category: nextCat = category,
    min: nextMin = minPrice,
    max: nextMax = maxPrice,
  } = {}) => {
    const params = new URLSearchParams();
    params.set("page", "1");
    if (nextCat && nextCat !== "all") params.set("category", nextCat);
    if (nextMin !== UNSET) params.set("minPrice", String(nextMin));
    if (nextMax !== UNSET) params.set("maxPrice", String(nextMax));
    if (initialQuery) params.set("query", initialQuery);
    params.set("sort", sort);
    router.push(`/search?${params.toString()}`);
  };
  const applyFilters = () => pushWithState();
  // 칩에서 지우기 핸들러
  const clearCategory = () => {
    setCategory("");
    pushWithState({ category: "" });
  };
  const clearMin = () => {
    setMinPrice(UNSET);
    pushWithState({ min: UNSET });
  };
  const clearMax = () => {
    setMaxPrice(UNSET);
    pushWithState({ max: UNSET });
  };

  const selectedCategoryLabel = useMemo(() => {
    if (!category || category === "all") return "";
    return CATEGORIES.find((c) => c.slug === category)?.label ?? category;
  }, [category]);

  const onKeyDownApply = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyFilters();
    }
  };
  const Chip = ({ children, onClick, ariaLabel }) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="inline-flex items-center rounded-full border bg-gray-50/60 px-3 py-1 text-xs hover:bg-gray-100 transition-colors"
    >
      <span className="mr-1">{children}</span>
      <X className="h-3 w-3" />
    </button>
  );
  return (
    <div className="w-full max-w-3xl rounded-xl border p-4 shadow-sm bg-white mx-auto mb-6 mt-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-base font-semibold">검색 필터</h3>
      </div>

      <Separator className="my-3" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

        <div className="space-y-2">
          <Label>최소 가격 (원)</Label>
          <Input
            inputMode="numeric"
            value={minPrice !== UNSET ? minPrice.toString() : ""}
            onChange={(e) => {
              setMinPrice(e.target.value);
            }}
            onKeyDown={onKeyDownApply}
            placeholder="최소 가격"
          />
        </div>

        <div className="space-y-2">
          <Label>최대 가격 (원)</Label>
          <Input
            inputMode="numeric"
            value={maxPrice !== UNSET ? maxPrice.toString() : ""}
            onChange={(e) => {
              setMaxPrice(e.target.value);
            }}
            onKeyDown={onKeyDownApply}
            placeholder="최대 가격"
          />
        </div>
      </div>

      <Separator className="my-4" />

      <div className="text-sm">
        <div className="mb-2 font-medium">선택한 필터</div>
        <div className="flex flex-wrap items-center gap-2 min-h-[32px]">
          {selectedCategoryLabel && (
            <Chip onClick={clearCategory} ariaLabel="카테고리 제거">
              카테고리: {selectedCategoryLabel}
            </Chip>
          )}
          {minPrice !== UNSET && (
            <Chip onClick={clearMin} ariaLabel="최소 가격 제거">
              최소 {minPrice.toLocaleString("ko-KR")}원
            </Chip>
          )}
          {maxPrice !== UNSET && (
            <Chip onClick={clearMax} ariaLabel="최대 가격 제거">
              최대 {maxPrice.toLocaleString("ko-KR")}원
            </Chip>
          )}

          {!(
            selectedCategoryLabel ||
            minPrice !== UNSET ||
            maxPrice !== UNSET
          ) && <span className="text-gray-500">선택한 필터가 없습니다.</span>}
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex items-center justify-between gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              {display}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={() => setSort("latest")}
              className="flex items-center gap-2"
            >
              <span className="flex-1">최신순</span>

              {sort === "latest" && <Check className="h-4 w-4 opacity-70" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSort("popular")}
              className="flex items-center gap-2"
            >
              <span className="flex-1">인기순</span>

              {sort === "popular" && <Check className="h-4 w-4 opacity-70" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center gap-2 justify-end w-full">
          <Button variant="secondary" type="button" onClick={resetFilters}>
            초기화
          </Button>
          <Button type="button" onClick={applyFilters}>
            적용하기
          </Button>
        </div>
      </div>
    </div>
  );
}
