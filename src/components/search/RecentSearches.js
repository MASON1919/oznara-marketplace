// /src/components/search/RecentSearches.js

// 'use client'는 이 코드가 클라이언트 측(사용자의 브라우저)에서 실행되어야 함을 나타냅니다.
// 사용자와의 상호작용(클릭 등)이 있는 컴포넌트에 필요합니다.
"use client";

// 이 컴포넌트는 최근 검색어 목록을 표시하고 관리하는 역할을 합니다.
// 부모 컴포넌트로부터 다음과 같은 정보(props)를 받습니다:
// - searches: 표시할 최근 검색어들이 담긴 배열 (예: ['노트북', '키보드'])
// - onSearch: 특정 검색어를 클릭했을 때, 해당 검색어로 검색을 다시 실행하는 함수
// - onDelete: 특정 검색어 옆의 'x' 버튼을 눌렀을 때, 해당 검색어를 삭제하는 함수
// - onClearAll: '전체삭제' 버튼을 눌렀을 때, 모든 최근 검색어를 삭제하는 함수
export default function RecentSearches({
  searches,
  onSearch,
  onDelete,
  onClearAll,
}) {
  // 만약 최근 검색어 배열(searches)이 없거나 비어있으면,
  // 검색어가 없다는 메시지를 보여주는 UI를 반환합니다.
  if (!searches || searches.length === 0) {
    return (
      <div className="my-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-gray-600">최근 검색어</h3>
        </div>
        <p className="text-sm text-gray-400 text-center py-2">최근 검색어가 없습니다.</p>
      </div>
    );
  }

  // 최근 검색어가 있는 경우, 목록을 보여주는 UI를 반환합니다.
  return (
    // 최근 검색어 섹션 전체를 감싸는 컨테이너입니다.
    <div className="my-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      {/* 섹션 제목과 '전체삭제' 버튼을 포함하는 헤더 부분입니다. */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-600">최근 검색어</h3>
        <button
          onClick={onClearAll} // 클릭 시 onClearAll 함수를 실행합니다.
          className="text-xs text-gray-500 hover:text-gray-800 transition"
          aria-label="최근 검색어 전체 삭제" // 스크린 리더 사용자를 위한 설명
        >
          전체삭제
        </button>
      </div>
      {/* 최근 검색어 목록을 표시하는 리스트(ul)입니다. */}
      <ul className="flex flex-wrap gap-2">
        {/* 
          searches 배열을 순회하며 각 검색어(term)에 대해 리스트 아이템(li)을 생성합니다.
          map 함수는 배열의 각 요소에 대해 주어진 함수를 실행하고, 그 결과로 새 배열을 만듭니다.
        */}
        {searches.map((term, index) => (
          <li
            key={index} // React가 목록의 각 항목을 효율적으로 식별하기 위한 고유한 key입니다.
            className="flex items-center bg-white border border-gray-300 rounded-full px-3 py-1 text-sm text-gray-700"
          >
            {/* 검색어 텍스트. 클릭하면 해당 검색어로 검색을 다시 실행합니다. */}
            <button
              onClick={() => onSearch(term)} // 클릭 시 onSearch 함수에 해당 검색어를 전달하며 실행합니다.
              className="hover:underline"
              aria-label={`'${term}'으로 다시 검색`}
            >
              {term}
            </button>
            {/* 개별 검색어를 삭제하는 버튼입니다. */}
            <button
              onClick={() => onDelete(term)} // 클릭 시 onDelete 함수에 해당 검색어를 전달하며 실행합니다.
              className="ml-2 text-gray-400 hover:text-gray-700 font-bold"
              aria-label={`'${term}' 검색어 삭제`}
            >
              &times; {/* 'x' 모양의 특수문자입니다. */}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}