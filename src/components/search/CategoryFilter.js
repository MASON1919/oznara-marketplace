// /src/components/search/CategoryFilter.js

// 이 파일은 웹사이트에 카테고리 필터 버튼들을 보여주는 컴포넌트입니다.
// 사용자가 특정 카테고리 버튼을 누르면, 그 카테고리에 해당하는 상품만 검색되도록 합니다.

// 우리만의 재사용 가능한 Button 컴포넌트를 가져옵니다.
import { Button } from "@/components/ui/button";

// 이 컴포넌트에서 사용할 카테고리 목록을 미리 정의해 둡니다.
const CATEGORIES = [
  "디지털/가전",
  "의류/잡화",
  "가구/인테리어",
  "생활/주방",
  "유아동",
  "스포츠/레저",
  "도서/티켓/음반",
  "미용/뷰티",
  "반려동물 용품",
  "기타",
];

// CategoryFilter 컴포넌트는 두 가지 정보를 받아서 카테고리 버튼들을 그립니다.
// - selectedCategory: 현재 어떤 카테고리가 선택되어 있는지 알려주는 정보 (선택된 버튼을 다르게 표시하기 위함)
// - onCategoryClick: 카테고리 버튼을 눌렀을 때, 어떤 카테고리가 선택되었는지 부모 컴포넌트(SearchPageClient.js)에 알려주는 함수
export default function CategoryFilter({ selectedCategory, onCategoryClick }) {
  return (
    // 카테고리 버튼들을 감싸는 영역입니다.
    // flex: 자식 요소들을 가로로 배치
    // flex-wrap: 자식 요소들이 한 줄에 다 들어가지 않으면 자동으로 줄바꿈
    // gap-2: 자식 요소들 사이의 간격을 8px로 설정
    // mb-6: 아래쪽 여백을 24px로 설정
    <div className="flex flex-wrap gap-2 mb-6">
      {/* '전체' 카테고리 버튼 */}
      <Button
        // 이 버튼을 클릭하면 onCategoryClick 함수를 호출하고, null 값을 전달하여 '전체'가 선택되었음을 알립니다.
        onClick={() => onCategoryClick(null)}
        // 현재 선택된 카테고리가 null(즉, '전체')이면 주황색 배경에 흰 글씨로,
        // 그렇지 않으면 회색 배경에 검은 글씨로 버튼 스타일을 다르게 적용합니다.
        className={`${
          selectedCategory === null
            ? "bg-orange-500 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        전체
      </Button>
      {/* 
          미리 정의된 CATEGORIES 배열을 순회하면서 각 카테고리에 대한 버튼을 만듭니다.
          .map() 함수는 배열의 각 요소를 가지고 새로운 배열을 만드는 JavaScript 기능입니다.
        */}
      {CATEGORIES.map((category) => (
        <Button
          // React가 목록의 각 항목을 효율적으로 식별하기 위해 고유한 key prop이 필요합니다.
          key={category}
          // 이 버튼을 클릭하면 onCategoryClick 함수를 호출하고, 해당 카테고리 이름을 전달합니다.
          onClick={() => onCategoryClick(category)}
          // 현재 선택된 카테고리가 이 버튼의 카테고리와 같으면 주황색으로,
          // 그렇지 않으면 회색으로 스타일을 적용합니다.
          className={`${
            selectedCategory === category
              ? "bg-orange-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {/* 버튼에 카테고리 이름을 표시합니다. */}
          {category}
        </Button>
      ))}
    </div>
  );
}
