// /src/components/search/StatusFilter.js

// 이 파일은 상품의 판매 상태('판매중', '판매완료')에 따라 필터링하는 텍스트 링크 형태의 UI를 제공합니다.
// 'use client'는 이 코드가 클라이언트 측(사용자의 브라우저)에서 실행되어야 함을 나타냅니다.
'use client';

// 필터링에 사용할 판매 상태 목록을 정의합니다.
// 각 항목은 화면에 보여질 이름(label)과 실제 API 요청에 사용될 값(value)을 가집니다.
const STATUSES = [
  { label: '판매중', value: 'SALE' },
  { label: '거래완료', value: 'SOLD_OUT' },
];

/**
 * StatusFilter 컴포넌트는 판매 상태 필터 UI를 렌더링합니다.
 * @param {string | null} selectedStatus - 현재 선택된 판매 상태 값 (예: 'SALE', 'SOLD_OUT', 또는 null)
 * @param {Function} onStatusClick - 상태 버튼을 클릭했을 때 호출될 함수. 선택된 상태의 value를 인자로 받습니다.
 */
export default function StatusFilter({ selectedStatus, onStatusClick }) {
  return (
    // 필터 버튼들을 감싸는 컨테이너입니다.
    // flex: 자식 요소들을 가로로 배치
    // justify-end: 자식 요소들을 오른쪽 끝으로 정렬
    // items-center: 자식 요소들을 세로 중앙에 정렬
    // gap-4: 자식 요소들 사이의 간격을 16px로 설정
    // my-2: 위아래 여백을 8px로 설정
    // text-sm: 기본 글자 크기를 작게 설정
    <div className="flex justify-end items-center gap-4 my-2 text-sm">
      {/*
        STATUSES 배열을 순회하며 각 상태에 대한 버튼을 생성합니다.
      */}
      {STATUSES.map(status => (
        <button
          key={status.value} // React가 각 버튼을 구별하기 위한 고유한 키
          onClick={() => onStatusClick(status.value)} // 버튼 클릭 시 onStatusClick 함수를 해당 상태의 value와 함께 호출
          // 선택된 상태에 따라 다른 스타일(CSS 클래스)을 적용합니다.
          // className 안의 `${...}`는 JavaScript 템플릿 리터럴로, 변수와 문자열을 쉽게 조합할 수 있게 해줍니다.
          className={`transition-colors duration-200 ${
            selectedStatus === status.value
              // 현재 선택된 상태와 이 버튼의 상태가 같으면: 주황색 텍스트, 굵은 글씨, 밑줄 표시
              ? 'text-orange-500 font-bold underline underline-offset-4'
              // 다르면: 회색 텍스트, 마우스를 올리면(hover) 주황색 텍스트와 밑줄 표시
              : 'text-gray-500 hover:text-orange-500 hover:underline underline-offset-4'
          }`}
        >
          {/* 버튼에 표시될 텍스트 (예: '판매중') */}
          {status.label}
        </button>
      ))}
    </div>
  );
}