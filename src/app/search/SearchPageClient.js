// /src/app/SearchPageClient.js

// 이 파일은 검색 페이지의 모든 클라이언트 측 로직을 담당합니다.
// "use client"는 이 파일이 클라이언트 측에서 실행되어야 함을 나타내는 Next.js 지시문입니다.
"use client";

// React에서 상태 관리를 위한 useState와 생명주기 관리를 위한 useEffect를 가져옵니다.
import { useState, useEffect } from "react";
// Next.js에서 URL의 검색 파라미터를 읽기 위한 useSearchParams를 가져옵니다.
import { useSearchParams } from "next/navigation";
// 검색 관련 로직을 처리하는 커스텀 훅인 useSearch를 가져옵니다.
import { useSearch } from "@/hooks/useSearch";
// 검색창 UI 컴포넌트를 가져옵니다.
import SearchBar from "@/components/search/SearchBar";
// 카테고리 필터링 UI 컴포넌트를 가져옵니다.
import CategoryFilter from "@/components/search/CategoryFilter";
// 가격 필터링 UI 컴포넌트를 가져옵니다.
import PriceFilter from "@/components/search/PriceFilter";
// 검색 결과를 표시하는 UI 컴포넌트를 가져옵니다.
import SearchResults from "@/components/search/SearchResults";
// 최근 검색어를 표시하는 UI 컴포넌트를 가져옵니다.
import RecentSearches from "@/components/search/RecentSearches";

// 이 컴포넌트는 서버로부터 초기 검색 상태를 props로 받습니다.
export default function SearchPageClient() {
  // URL의 검색 파라미터를 가져옵니다.
  const searchParams = useSearchParams();

  // useSearch 훅을 사용하여 검색 관련 상태와 함수들을 가져옵니다.
  const {
    queryTerm, // 현재 검색어
    results, // 검색 결과
    loading, // 로딩 상태
    hasMore, // 더 많은 결과가 있는지 여부
    selectedCategory, // 선택된 카테고리
    selectedStatus, // 선택된 상태
    error, // 에러 상태
    sortBy, // 정렬 기준
    handleSearch, // 검색 실행 함수
    loadMore, // 추가 결과 로드 함수
    handleSortChange, // 정렬 변경 함수
  } = useSearch(searchParams);

  // 최근 검색어를 저장하는 상태를 관리합니다.
  const [recentSearches, setRecentSearches] = useState([]);

  // 컴포넌트가 처음 렌더링될 때 로컬 스토리지에서 최근 검색어를 불러옵니다.
  useEffect(() => {
    try {
      const savedSearches = localStorage.getItem("recentSearches");
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches));
      }
    } catch (error) {
      console.error("최근 검색어 불러오기 실패:", error);
    }
  }, []);

  // 최근 검색어를 업데이트하는 함수입니다.
  const updateRecentSearches = (searchTerm) => {
    if (!searchTerm) return; // 검색어가 없으면 아무것도 하지 않습니다.
    try {
      // 새로운 검색어를 맨 앞에 추가하고, 중복을 제거한 후 최대 10개까지만 유지합니다.
      const newSearches = [
        searchTerm,
        ...recentSearches.filter((s) => s !== searchTerm),
      ].slice(0, 10);
      setRecentSearches(newSearches);
      // 업데이트된 최근 검색어를 로컬 스토리지에 저장합니다.
      localStorage.setItem("recentSearches", JSON.stringify(newSearches));
    } catch (error) {
      console.error("최근 검색어 저장 실패:", error);
    }
  };

  // 카테고리 클릭 이벤트를 처리하는 함수입니다.
  const handleCategoryClick = (category) => {
    // 이미 선택된 카테고리를 다시 클릭하면 선택을 해제하고, 그렇지 않으면 새로운 카테고리를 선택합니다.
    const newCategory = selectedCategory === category ? null : category;
    // 새로운 카테고리로 검색을 다시 실행합니다.
    handleSearch({
      searchTerm: queryTerm,
      category: newCategory,
      status: selectedStatus,
    });
  };

  // 상태(status) 클릭 이벤트를 처리하는 함수입니다.
  const handleStatusClick = (status) => {
    // 이미 선택된 상태를 다시 클릭하면 선택을 해제하고, 그렇지 않으면 새로운 상태를 선택합니다.
    const newStatus = selectedStatus === status ? null : status;
    // 새로운 상태로 검색을 다시 실행합니다.
    handleSearch({
      searchTerm: queryTerm,
      category: selectedCategory,
      status: newStatus,
    });
  };

  // 검색창에서 검색을 실행할 때 호출되는 함수입니다.
  const handleSearchBarSearch = (searchTerm) => {
    console.log(
      `[SearchPageClient] handleSearchBarSearch: searchTerm=${searchTerm}`
    );
    // 검색을 실행하고, 최근 검색어를 업데이트합니다.
    handleSearch({
      searchTerm,
      category: selectedCategory,
      status: selectedStatus,
    });
    updateRecentSearches(searchTerm);
  };

  // 최근 검색어 삭제 이벤트를 처리하는 함수입니다.
  const handleDeleteRecentSearch = (termToDelete) => {
    try {
      // 삭제할 검색어를 제외한 나머지 검색어들로 새로운 배열을 만듭니다.
      const newSearches = recentSearches.filter((s) => s !== termToDelete);
      setRecentSearches(newSearches);
      // 업데이트된 최근 검색어를 로컬 스토리지에 저장합니다.
      localStorage.setItem("recentSearches", JSON.stringify(newSearches));
    } catch (error) {
      console.error("최근 검색어 삭제 실패:", error);
    }
  };

  // 모든 최근 검색어를 삭제하는 함수입니다.
  const handleClearAllRecentSearches = () => {
    try {
      setRecentSearches([]); // 최근 검색어 상태를 빈 배열로 만듭니다.
      localStorage.removeItem("recentSearches"); // 로컬 스토리지에서 최근 검색어를 삭제합니다.
    } catch (error) {
      console.error("최근 검색어 전체 삭제 실패:", error);
    }
  };

  // 화면에 표시될 UI를 렌더링합니다.
  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className="mb-6">
        {/* 검색창 컴포넌트 */}
        <SearchBar onSearch={handleSearchBarSearch} />
      </div>

      {/* 카테고리 필터 컴포넌트 */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryClick={handleCategoryClick}
      />

      <div className="my-4">
        {/* 가격 필터 컴포넌트 */}
        <PriceFilter />
      </div>

      <div className="my-4 flex justify-end">
        {/* 정렬 기준 선택 드롭다운 */}
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="createdAt_desc">최신순</option>
          <option value="createdAt_asc">오래된순</option>
          <option value="price_asc">가격 낮은순</option>
          <option value="price_desc">가격 높은순</option>
        </select>
      </div>

      {/* 최근 검색어 컴포넌트 */}
      <RecentSearches
        searches={recentSearches}
        onSearch={handleSearchBarSearch}
        onDelete={handleDeleteRecentSearch}
        onClearAll={handleClearAllRecentSearches}
      />

      {/* 검색 결과 컴포넌트 */}
      <SearchResults
        loading={loading}
        results={results}
        queryTerm={queryTerm}
        selectedCategory={selectedCategory}
        selectedStatus={selectedStatus}
        onStatusClick={handleStatusClick}
        error={error}
        loadMore={loadMore}
        hasMore={hasMore}
      />
    </div>
  );
}
