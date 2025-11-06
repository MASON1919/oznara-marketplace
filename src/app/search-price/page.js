"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

// SearchPrice Component (formerly SimpleSearchBar)
function SearchPrice({ initialQuery }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery || "");

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query.trim())}`);
    } else {
      router.push(`/search`); // Navigate to search page without query if empty
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex w-full max-w-md items-center space-x-2 mx-auto my-4">
      <Input
        type="text"
        placeholder="상품명 검색..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-grow"
      />
      <Button type="submit" onClick={handleSearch}>
        <Search className="h-4 w-4 mr-2" /> 검색
      </Button>
    </div>
  );
}

// Main Page Component for /search-price
export default function SearchPricePage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || "";

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center my-6">시세조회</h1>
      <p className="text-lg text-center text-gray-600 mb-4">
        원하시는 상품이 얼마에 거래되고 있는지 알아보세요
      </p>
      <p className="text-md text-center text-gray-500 mb-8">
        어떤 시세 정보가 궁금하세요?
      </p>

      <SearchPrice initialQuery={initialQuery} />
    </div>
  );
}
