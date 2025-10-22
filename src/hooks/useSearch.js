// /src/hooks/useSearch.js

// React에서 상태 관리(useState), 콜백 최적화(useCallback), 참조(useRef), 생명주기(useEffect)를 위한 훅들을 가져옵니다.
import { useState, useCallback, useRef, useEffect } from "react";
// Next.js에서 페이지를 이동시키기 위한 라우터 훅을 가져옵니다.
import { useRouter } from "next/navigation";

// `useSearch`는 검색과 관련된 모든 로직을 담고 있는 커스텀 훅(Custom Hook)입니다.
// 컴포넌트에서 검색 관련 코드를 분리하여 재사용성을 높이고 코드를 깔끔하게 만듭니다.
// `searchParams`는 URL의 쿼리 파라미터를 담고 있는 객체입니다.
export function useSearch(searchParams) {
  // --- 상태(State) 정의 ---
  const [results, setResults] = useState([]); // 검색 결과 목록
  const [loading, setLoading] = useState(true); // 로딩 상태 (초기에는 true)
  const [hasMore, setHasMore] = useState(false); // 더 불러올 데이터가 있는지 여부
  const [error, setError] = useState(null); // 에러 메시지
  const [queryTerm, setQueryTerm] = useState(searchParams.get('q') || ""); // 현재 검색어
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || null); // 선택된 카테고리
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || null); // 선택된 판매 상태
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || "createdAt_desc"); // 정렬 기준

  // --- 참조(Ref) 정의 ---
  // 다음 페이지를 불러오기 위한 커서(cursor) 값을 저장합니다. ref는 리렌더링을 유발하지 않습니다.
  const nextCursorRef = useRef(null);
  // Next.js 라우터 인스턴스
  const router = useRouter();

  // --- 함수 정의 ---

  // 실제 API를 호출하여 검색 결과를 가져오는 비동기 함수.
  // useCallback으로 감싸서, 이 함수가 불필요하게 다시 생성되는 것을 방지합니다.
  const fetchResults = useCallback(
    async (searchTerm, category, status, minPrice, maxPrice, cursor, sort) => {
      setLoading(true); // 로딩 시작
      setError(null); // 이전 에러 초기화

      try {
        // API에 보낼 URL 파라미터를 생성합니다.
        const params = new URLSearchParams();
        if (searchTerm) params.set("q", searchTerm);
        if (category) params.set("category", category);
        if (status) params.set("status", status);
        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);
        if (cursor) params.set("cursor", cursor);
        if (sort) params.set("sort", sort);

        // API 호출
        const response = await fetch(`/api/search?${params.toString()}`);
        if (!response.ok) {
          // 응답이 실패하면 에러를 발생시킵니다.
          const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }));
          throw new Error(errorData.error || "Network response was not ok");
        }

        const data = await response.json(); // 응답 데이터를 JSON으로 파싱

        if (cursor) {
          // '더 보기'로 데이터를 불러온 경우, 기존 결과에 새로운 결과를 추가합니다.
          setResults((prev) => [...prev, ...data.results]);
        } else {
          // 새로운 검색인 경우, 결과를 완전히 교체합니다.
          setResults(data.results);
        }

        // 다음 페이지 커서를 ref에 저장하고, 더 불러올 데이터가 있는지(hasMore) 상태를 업데이트합니다.
        nextCursorRef.current = data.nextCursor;
        setHasMore(!!data.nextCursor); // !!는 값을 boolean으로 변환 (값이 있으면 true, 없으면 false)
      } catch (err) {
        console.error("Error fetching search results:", err.message);
        setError(err.message); // 에러 상태 업데이트
        setHasMore(false); // 더 이상 데이터를 불러오지 않도록 설정
      } finally {
        setLoading(false); // 로딩 종료
      }
    },
    [] // 의존성 배열이 비어있으므로, 이 함수는 컴포넌트가 처음 렌더링될 때 한 번만 생성됩니다.
  );

  // URL의 searchParams가 변경될 때마다 검색을 다시 실행하는 useEffect.
  useEffect(() => {
    fetchResults(
      searchParams.get('q'),
      searchParams.get('category'),
      searchParams.get('status'),
      searchParams.get('minPrice'),
      searchParams.get('maxPrice'),
      null, // 처음 로드할 때는 커서가 없음
      searchParams.get('sort')
    );
  }, [searchParams, fetchResults]);


  // 검색을 시작하는 함수 (주로 검색 버튼, 카테고리, 상태 필터 클릭 시 호출됨).
  const handleSearch = useCallback(
    ({ searchTerm, category, status }) => {
      // 내부 상태를 먼저 업데이트합니다.
      setQueryTerm(searchTerm);
      setSelectedCategory(category);
      setSelectedStatus(status);
      
      // URL을 변경하기 위한 파라미터를 생성합니다.
      const params = new URLSearchParams();
      if (searchTerm) params.set("q", searchTerm);
      if (category) params.set("category", category);
      if (status) params.set("status", status);
      // 기존의 가격, 정렬 파라미터는 유지합니다.
      if (searchParams.get('minPrice')) params.set("minPrice", searchParams.get('minPrice'));
      if (searchParams.get('maxPrice')) params.set("maxPrice", searchParams.get('maxPrice'));
      if (sortBy) params.set("sort", sortBy);
      
      // URL을 변경하여 페이지를 리프레시하지 않고 상태를 업데이트합니다.
      // URL이 변경되면 위의 useEffect가 실행되어 fetchResults를 호출합니다.
      router.push(`?${params.toString()}`);
    },
    [sortBy, router, searchParams]
  );

  // '더 보기' (무한 스크롤)를 위한 함수.
  const loadMore = useCallback(() => {
    // 로딩 중이거나, 더 이상 데이터가 없거나, 다음 커서가 없으면 아무것도 하지 않습니다.
    if (loading || !hasMore || !nextCursorRef.current) return;
    // 현재 상태와 다음 커서 값을 사용하여 추가 데이터를 요청합니다.
    fetchResults(
      queryTerm,
      selectedCategory,
      selectedStatus,
      searchParams.get('minPrice'),
      searchParams.get('maxPrice'),
      nextCursorRef.current, // 저장해둔 다음 커서 사용
      sortBy
    );
  }, [
    loading,
    hasMore,
    queryTerm,
    selectedCategory,
    selectedStatus,
    searchParams,
    fetchResults,
    sortBy,
  ]);

  // 정렬 기준이 변경되었을 때 호출되는 함수.
  const handleSortChange = useCallback(
    (newSortBy) => {
      setSortBy(newSortBy); // 정렬 상태 업데이트
      const params = new URLSearchParams(window.location.search); // 현재 URL 파라미터 가져오기
      params.set('sort', newSortBy); // 새로운 정렬 기준 설정
      router.push(`?${params.toString()}`); // URL 변경
    },
    [router]
  );

  // 이 훅이 제공하는 모든 상태와 함수들을 반환합니다.
  return {
    queryTerm,
    results,
    loading,
    hasMore,
    selectedCategory,
    selectedStatus,
    error,
    sortBy,
    handleSearch,
    loadMore,
    handleSortChange,
  };
}