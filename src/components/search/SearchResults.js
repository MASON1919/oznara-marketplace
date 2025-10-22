// /src/components/search/SearchResults.js

// 이 컴포넌트는 검색 결과와 관련된 UI를 모두 담당합니다.
// 에러 메시지, 무한 스크롤, 상품 목록, 로딩 스피너, "결과 없음" 메시지 등을 포함합니다.

// 필요한 UI 컴포넌트들을 가져옵니다.
import InfiniteScroll from '@/components/ui/InfiniteScroll'; // 사용자가 스크롤을 끝까지 내리면 추가 데이터를 로드하는 컴포넌트
import ProductList from '@/components/product/ProductList';   // 상품 목록을 보여주는 컴포넌트
import NoResults from '@/components/search/NoResults';       // "검색 결과가 없습니다" 메시지를 보여주는 컴포넌트
import Spinner from '@/components/ui/Spinner';               // 데이터 로딩 중에 보여줄 스피너(빙글빙글 아이콘)
import StatusFilter from '@/components/search/StatusFilter'; // '판매중', '판매완료' 같은 상태 필터 컴포넌트

// SearchResults 컴포넌트는 부모로부터 다양한 정보(props)를 받습니다.
export default function SearchResults({
  loading,          // (boolean) 현재 데이터를 불러오는 중인지 여부
  results,          // (array) 화면에 표시할 상품 목록
  queryTerm,        // (string) 사용자가 입력한 검색어
  selectedCategory, // (string) 현재 선택된 카테고리
  selectedStatus,   // (string) 현재 선택된 판매 상태 ('SALE' 또는 'SOLD_OUT')
  onStatusClick,    // (function) 판매 상태 필터 버튼을 클릭했을 때 실행될 함수
  error,            // (string) 데이터 로딩 중 발생한 에러 메시지
  loadMore,         // (function) 추가 데이터를 불러오는 함수 (무한 스크롤용)
  hasMore,          // (boolean) 불러올 데이터가 더 남았는지 여부
}) {
  // 만약 에러가 발생했다면, 에러 메시지를 빨간색 배경의 상자에 보여줍니다.
  if (error) {
    return (
      <div className="my-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded">
        {error}
      </div>
    );
  }

  // 에러가 없다면, 검색 결과를 보여주는 UI를 렌더링합니다.
  // <></>는 Fragment라고 하며, 불필요한 div 태그 없이 여러 요소를 그룹화할 때 사용합니다.
  return (
    <>
      {/* 검색 결과가 하나 이상 있을 때만 StatusFilter(상태 필터)를 보여줍니다. */}
      {results.length > 0 && (
        <StatusFilter 
          selectedStatus={selectedStatus}
          onStatusClick={onStatusClick}
        />
      )}

      {/* 무한 스크롤을 구현하는 컴포넌트입니다. */}
      <InfiniteScroll loadMore={loadMore} hasMore={hasMore} loading={loading}>
        {/* 상품 목록을 보여주는 컴포넌트입니다. */}
        <ProductList results={results} />
      </InfiniteScroll>

      {/* 데이터를 불러오는 중이라면(loading이 true이면), 스피너를 보여줍니다. */}
      {loading && (
        <div className="my-4">
          <Spinner />
        </div>
      )}

      {/* 
        다음 모든 조건이 참일 때만 "결과 없음" 메시지를 보여줍니다:
        1. 로딩 중이 아닐 때 (!loading)
        2. 검색 결과가 없을 때 (results.length === 0)
        3. 사용자가 검색어를 입력했거나 카테고리를 선택했을 때 (queryTerm || selectedCategory)
           (아무것도 검색하지 않은 초기 상태에서는 이 메시지가 보이지 않도록 함)
      */}
      {!loading && results.length === 0 && (queryTerm || selectedCategory) && (
        <NoResults />
      )}
    </>
  );
}