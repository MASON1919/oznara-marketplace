// /src/components/product/ProductCard.js

// 이 파일은 상품 하나하나를 카드 형태로 보여주는 컴포넌트입니다.
// 검색 결과 목록에 있는 각 상품의 제목, 가격, 이미지 등 상세 정보를 예쁘게 표시합니다.

// ProductCard 컴포넌트는 'item'이라는 정보를 부모 컴포넌트로부터 받습니다.
// - item: 하나의 상품에 대한 모든 정보(id, title, price 등)가 담겨 있는 객체
export default function ProductCard({ item }) {

  // --- 데이터 가공 (보기 좋게 만들기) ---

  // 1. 가격을 한국 원화 형식으로 변환합니다. (예: 10000 -> "10,000")
  const formattedPrice = new Intl.NumberFormat('ko-KR').format(item.price);

  // 2. 상품이 등록된 날짜를 보기 좋은 형식으로 변환합니다.
  let formattedDate = '날짜 정보 없음'; // 기본값
  if (item.createdAt) { // item에 createdAt 정보가 있다면
    const date = new Date(item.createdAt); // ISO 문자열 형태의 날짜를 실제 날짜 객체로 만듭니다.
    // 한국식 날짜 형식(예: 2025. 10. 13.)으로 변환합니다.
    formattedDate = date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  }

  // --- 화면 그리기 (JSX 렌더링) ---
  // 상품 카드의 전체적인 모습을 정의합니다.
  return (
    // 각 상품 카드는 고유한 'id'를 키(key)로 가집니다. (React가 목록을 효율적으로 관리하기 위함)
    // 마우스를 올리면 배경색이 바뀌는 효과(hover:bg-gray-50)와 함께 클릭 가능한 커서(cursor-pointer)를 표시합니다.
    <div key={item.id} className="flex p-4 border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors duration-150 ease-in-out cursor-pointer">

      {/* 상품 정보 텍스트 영역 */}
      <div className="flex-grow flex flex-col justify-between">
        {/* 상단 정보 (제목, 설명) */}
        <div>
          {/* 상품 제목: item.title이 없으면 '제목 없음'을 표시합니다. 
              truncate 클래스는 제목이 너무 길 경우 말줄임표(...)로 표시합니다. */}
          <h2 className="text-base font-medium text-gray-800 truncate">{item.title || '제목 없음'}</h2>

          {/* 상품 설명: item.content가 없으면 '상품 설명이 없습니다.'를 표시합니다.
              line-clamp-2 클래스는 설명이 길 경우 최대 2줄까지만 보여주고 나머지는 숨깁니다. */}
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {item.content || '상품 설명이 없습니다.'}
          </p>
        </div>

        {/* 하단 정보 (가격, 카테고리, 날짜 및 추가 정보) */}
        <div>
          {/* 상품 가격 */}
          <p className="text-lg font-bold text-gray-900 mt-2">
            {formattedPrice}원
          </p>

          {/* 카테고리 및 등록일 */}
          <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
            {/* 카테고리 정보: item.address 객체가 있고 그 안에 name이 있으면 표시, 없으면 '카테고리 미분류' 표시 */}
            <span>{item.address?.name || '카테고리 미분류'}</span>
            {/* 등록일 정보 */}
            <span>등록일: {formattedDate}</span>
          </div>

          {/* 추가 정보 표시 (상태, 조회수, 좋아요 수) */}
          <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-2">
            {/* item.status가 존재할 경우에만 판매 상태를 표시합니다. */}
            {item.status && <span>상태: {item.status}</span>} {/* 판매 상태 */}
            {/* item.viewCount가 undefined가 아닐 경우에만 조회수를 표시합니다. */}
            {item.viewCount !== undefined && <span>조회: {item.viewCount}</span>} {/* viewCount로 수정 */}
            {/* item.likeCount가 undefined가 아닐 경우에만 찜(좋아요) 수를 표시합니다. */}
            {item.likeCount !== undefined && <span>찜: {item.likeCount}</span>} {/* likeCount로 수정 */}
          </div>
        </div>
      </div>
    </div>
  );
}