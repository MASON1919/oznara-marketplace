// /src/app/page.js

// SearchPageClient 컴포넌트를 가져옵니다.
// 이 컴포넌트는 검색 페이지의 실제 UI와 상호작용을 담당합니다.
import SearchPageClient from "./SearchPageClient";

/**
 * 검색 페이지의 메인 서버 컴포넌트입니다.
 * 이 컴포넌트는 Next.js에서 서버 측에서 렌더링됩니다.
 * URL의 검색 파라미터(searchParams)를 클라이언트 컴포넌트인 SearchPageClient로 전달하는 역할을 합니다.
 * 
 * @param {object} props - 컴포넌트에 전달되는 속성들입니다.
 * @param {object} props.searchParams - URL의 쿼리 문자열을 담고 있는 객체입니다. (예: ?q=검색어)
 * @returns {JSX.Element} - 렌더링될 React 엘리먼트입니다.
 */
export default function Home({ searchParams }) {
  return (
    // 전체를 감싸는 div 태그입니다.
    <div>
      {/* 
        SearchPageClient 컴포넌트를 렌더링하고,
        서버에서 받은 searchParams를 그대로 전달합니다.
        이를 통해 클라이언트 측에서도 URL 파라미터를 사용할 수 있게 됩니다.
      */}
      <SearchPageClient searchParams={searchParams} />
    </div>
  );
}