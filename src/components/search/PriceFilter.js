// /src/components/search/PriceFilter.js

// 이 파일은 클라이언트 측에서 실행되어야 함을 나타냅니다.
"use client";

// Next.js에서 URL 파라미터와 라우팅을 다루기 위한 훅들을 가져옵니다.
import { useSearchParams, useRouter } from "next/navigation";
// React의 상태 관리 및 생명주기 관련 훅들을 가져옵니다.
import { useState, useEffect, useCallback } from "react";
// 가격 범위를 시각적으로 조절할 수 있는 슬라이더 라이브러리를 가져옵니다.
import Slider from "rc-slider";
// 슬라이더의 기본 CSS 스타일을 가져옵니다.
import "rc-slider/assets/index.css";
// lodash 라이브러리에서 debounce 함수를 가져옵니다. (현재 코드에서는 사용되지 않음)

// PriceFilter 컴포넌트를 정의합니다.
export default function PriceFilter() {
  // URL의 검색 파라미터를 읽기 위한 훅입니다.
  const searchParams = useSearchParams();
  // 페이지를 이동시키기 위한 Next.js 라우터 훅입니다.
  const router = useRouter();

  // --- 상태 관리 ---
  // 최소 가격 상태. URL 파라미터 'minPrice'가 있으면 그 값을, 없으면 0을 기본값으로 설정합니다.
  const [minPrice, setMinPrice] = useState(
    Number(searchParams.get("minPrice")) || 0
  );
  // 최대 가격 상태. URL 파라미터 'maxPrice'가 있으면 그 값을, 없으면 100000을 기본값으로 설정합니다.
  const [maxPrice, setMaxPrice] = useState(
    Number(searchParams.get("maxPrice")) || 100000
  );
  // 최소 가격 입력 필드의 값 상태. URL에 'minPrice'가 있으면 해당 값을 문자열로, 없으면 빈 문자열로 설정합니다.
  const [minInputValue, setMinInputValue] = useState(
    searchParams.has("minPrice") ? minPrice.toString() : ""
  );
  // 최대 가격 입력 필드의 값 상태.
  const [maxInputValue, setMaxInputValue] = useState(
    searchParams.has("maxPrice") ? maxPrice.toString() : ""
  );

  // --- 이벤트 핸들러 ---

  // 슬라이더 값이 변경될 때 호출되는 함수입니다.
  const handleSliderChange = (value) => {
    // 슬라이더의 첫 번째 값으로 최소 가격을, 두 번째 값으로 최대 가격을 설정합니다.
    setMinPrice(value[0]);
    setMaxPrice(value[1]);
    // 입력 필드의 값도 함께 업데이트합니다.
    setMinInputValue(value[0].toString());
    setMaxInputValue(value[1].toString());
  };

  // 최소 가격 입력 필드에서 포커스가 벗어났을 때(onBlur) 호출되는 함수입니다.
  const handleMinInputBlur = () => {
    const value = Number(minInputValue);
    // 입력된 최소값이 최대값보다 크면, 최소값을 최대값과 같게 조정합니다.
    if (value > maxPrice) {
      setMinPrice(maxPrice);
      setMinInputValue(maxPrice.toString());
    } else {
      setMinPrice(value);
    }
  };

  // 최대 가격 입력 필드에서 포커스가 벗어났을 때 호출되는 함수입니다.
  const handleMaxInputBlur = () => {
    const value = Number(maxInputValue);
    // 입력된 최대값이 최소값보다 작으면, 최대값을 최소값과 같게 조정합니다.
    if (value < minPrice) {
      setMaxPrice(minPrice);
      setMaxInputValue(minPrice.toString());
    } else {
      setMaxPrice(value);
    }
  };

  // '적용' 버튼을 클릭했을 때 호출되는 함수입니다.
  const handleApplyFilter = () => {
    // 현재 URL 파라미터를 기반으로 새로운 파라미터 객체를 생성합니다.
    const params = new URLSearchParams(searchParams);
    // 새로운 최소/최대 가격을 파라미터에 설정합니다.
    params.set("minPrice", minPrice);
    params.set("maxPrice", maxPrice);
    // 새로운 파라미터가 적용된 URL로 페이지를 이동시킵니다.
    router.push(`?${params.toString()}`);
  };

  // '초기화' 버튼을 클릭했을 때 호출되는 함수입니다.
  const handleReset = () => {
    // 가격 상태들을 초기값으로 되돌립니다.
    setMinPrice(0);
    setMaxPrice(100000);
    setMinInputValue("");
    setMaxInputValue("");

    // URL 파라미터에서 가격 필터를 제거합니다.
    const params = new URLSearchParams(searchParams);
    params.delete("minPrice");
    params.delete("maxPrice");
    router.push(`?${params.toString()}`);
  };

  // --- 렌더링 ---
  return (
    <div className="p-2 border rounded-lg">
      <h3 className="font-bold mb-1 text-sm">가격</h3>
      <div className="flex items-center gap-2">
        {/* 최소 가격 입력 필드 */}
        <input
          type="number"
          value={minInputValue}
          onChange={(e) => setMinInputValue(e.target.value)}
          onBlur={handleMinInputBlur}
          className="w-full p-1 border rounded focus:ring-2 focus:ring-blue-500 text-sm"
          aria-label="Minimum price"
          placeholder="최소 금액"
        />
        <span>-</span>
        {/* 최대 가격 입력 필드 */}
        <input
          type="number"
          value={maxInputValue}
          onChange={(e) => setMaxInputValue(e.target.value)}
          onBlur={handleMaxInputBlur}
          className="w-full p-1 border rounded focus:ring-2 focus:ring-blue-500 text-sm"
          aria-label="Maximum price"
          placeholder="최대 금액"
        />
        {/* 적용 버튼 */}
        <button
          onClick={handleApplyFilter}
          className="bg-blue-500 text-white p-1 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm whitespace-nowrap"
        >
          적용
        </button>
        {/* 초기화 버튼 */}
        <button
          onClick={handleReset}
          className="bg-gray-500 text-white p-1 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm whitespace-nowrap"
        >
          초기화
        </button>
      </div>
      {/* 가격 범위 슬라이더 */}
      <div className="mt-2">
        <Slider
          range // 범위 슬라이더로 설정
          min={0} // 최소값
          max={100000} // 최대값
          value={[minPrice, maxPrice]} // 현재 값 (최소, 최대)
          onChange={handleSliderChange} // 값이 변경될 때 호출될 함수
          allowCross={false} // 두 핸들이 교차되지 않도록 설정
        />
      </div>
    </div>
  );
}
