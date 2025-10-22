// /src/components/search/NoResults.js

// NoResults 컴포넌트는 검색 결과가 없을 때 사용자에게 메시지를 표시하는 간단한 UI 컴포넌트입니다.
export default function NoResults() {
  return (
    // 화면 중앙에 "검색 결과가 없습니다." 텍스트를 표시합니다.
    // text-center: 텍스트를 가운데 정렬합니다.
    // text-gray-500: 텍스트 색상을 회색으로 설정합니다.
    // mt-10: 위쪽 여백을 40px로 설정합니다.
    <div className="text-center text-gray-500 mt-10">
      검색 결과가 없습니다.
    </div>
  );
}