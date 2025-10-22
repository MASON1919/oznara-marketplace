// /src/components/search/SearchBar.js

// 이 파일은 사용자가 검색어를 입력할 수 있는 '검색창' 컴포넌트를 만듭니다.
// 검색어를 입력하고 엔터를 치거나 검색 버튼을 누르면, 부모 컴포넌트(SearchPageClient.js)에 검색어를 전달합니다.

// 'use client'는 이 코드가 웹 브라우저(클라이언트)에서 실행되어야 한다고 Next.js에 알려줍니다.
// 사용자 입력(키보드, 클릭)을 처리해야 하기 때문에 필요합니다.
'use client';

// React에서 상태(state), 생명주기(useEffect), DOM 참조(useRef), 콜백 최적화(useCallback)를 위한 훅들을 가져옵니다.
import { useState, useEffect, useRef, useCallback } from 'react';

// SearchBar 컴포넌트는 'onSearch'라는 함수를 부모 컴포넌트로부터 받습니다.
// - onSearch: 검색이 실행되었을 때, 검색어를 부모 컴포넌트에 전달하는 함수
export default function SearchBar({ onSearch }) {
  // --- 상태(State) 정의 ---
  // 'inputValue' 상태는 검색창에 현재 입력된 텍스트를 저장합니다.
  const [inputValue, setInputValue] = useState('');
  // 'suggestions' 상태는 서버로부터 받은 자동 완성 제안 목록을 배열로 저장합니다.
  const [suggestions, setSuggestions] = useState([]);
  // 'showSuggestions' 상태는 제안 목록을 보여줄지 말지를 결정하는 boolean 값입니다.
  const [showSuggestions, setShowSuggestions] = useState(false);
  // 'loadingSuggestions' 상태는 제안을 불러오는 중인지 여부를 나타냅니다.
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  // 'activeSuggestionIndex'는 키보드 방향키로 선택된 제안의 인덱스를 저장합니다.
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  // --- 참조(Ref) 정의 ---
  // 디바운스(debounce) 타이머의 ID를 저장하기 위한 ref. (연속된 입력을 그룹화하여 마지막 입력 후 일정 시간 뒤에만 함수를 실행)
  const debounceTimeoutRef = useRef(null);
  // 검색창 input 요소의 DOM을 직접 참조하기 위한 ref.
  const searchInputRef = useRef(null);
  // 제안 목록 ul 요소의 DOM을 직접 참조하기 위한 ref.
  const suggestionsRef = useRef(null);

  // --- 함수 정의 ---

  // 서버 API에 자동 완성 제안을 요청하는 함수.
  // useCallback으로 감싸서, 이 함수가 불필요하게 다시 생성되는 것을 방지합니다.
  const fetchSuggestions = useCallback(async (query) => {
    // 검색어가 2글자 미만이면 제안을 요청하지 않습니다.
    if (query.length < 2) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }

    setLoadingSuggestions(true); // 로딩 시작
    try {
      const response = await fetch(`/api/suggestions?q=${query}`); // API 호출
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }
      const data = await response.json(); // 응답을 JSON으로 파싱
      setSuggestions(data); // 제안 목록 상태 업데이트
      setShowSuggestions(true); // 제안 목록 보이기
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]); // 에러 발생 시 제안 목록 비우기
    } finally {
      setLoadingSuggestions(false); // 로딩 종료
    }
  }, []);

  // inputValue(입력값)가 변경될 때마다 실행되는 useEffect.
  useEffect(() => {
    // 기존 디바운스 타이머가 있으면 취소합니다.
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (inputValue.length > 0) {
      // 300ms(0.3초) 후에 fetchSuggestions 함수를 실행하는 새 타이머를 설정합니다.
      debounceTimeoutRef.current = setTimeout(() => {
        fetchSuggestions(inputValue);
      }, 300);
    } else {
      // 입력값이 없으면 제안 목록을 숨깁니다.
      setSuggestions([]);
      setShowSuggestions(false);
    }

    // 컴포넌트가 언마운트되거나 inputValue가 바뀌기 직전에 타이머를 정리합니다.
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [inputValue, fetchSuggestions]);

  // 검색창 외부를 클릭했을 때 제안 목록을 닫기 위한 useEffect.
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 클릭된 곳이 검색창이나 제안 목록 내부가 아니면
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false); // 제안 목록을 닫습니다.
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 검색을 실행하는 공통 함수.
  const executeSearch = (term) => {
    onSearch(term); // 부모 컴포넌트에 검색어 전달
    setInputValue(term); // 입력창 값도 동기화
    setSuggestions([]); // 제안 목록 비우기
    setShowSuggestions(false); // 제안 목록 숨기기
    setActiveSuggestionIndex(-1); // 활성화된 제안 인덱스 초기화
  };

  // 키보드 입력을 처리하는 함수.
  const handleKeyDown = (e) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') { // 아래 방향키
        e.preventDefault(); // 기본 동작(커서 이동) 방지
        setActiveSuggestionIndex((prevIndex) =>
          prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0
        );
      } else if (e.key === 'ArrowUp') { // 위 방향키
        e.preventDefault();
        setActiveSuggestionIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1
        );
      } else if (e.key === 'Enter') { // 엔터키
        e.preventDefault();
        if (activeSuggestionIndex !== -1) { // 활성화된 제안이 있으면
          executeSearch(suggestions[activeSuggestionIndex]); // 해당 제안으로 검색
        } else {
          executeSearch(inputValue); // 없으면 현재 입력값으로 검색
        }
      } else if (e.key === 'Escape') { // ESC 키
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
      }
    } else if (e.key === 'Enter') { // 제안 목록이 없을 때 엔터
      executeSearch(inputValue);
    }
  };

  // '검색' 버튼 클릭 핸들러.
  const handleButtonClick = () => {
    executeSearch(inputValue);
  };

  // 'x' (지우기) 버튼 클릭 핸들러.
  const handleClearClick = () => {
    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    onSearch(''); // 빈 검색어로 검색하여 결과 목록을 초기화합니다.
  };

  // 제안 항목 클릭 핸들러.
  const handleSuggestionClick = (suggestion) => {
    executeSearch(suggestion);
  };

  // --- 렌더링 ---
  return (
    <div className="relative w-full" ref={searchInputRef}> {/* ref 추가 */}
      <div className="flex items-center w-full relative">
        {/* 검색어 입력 필드 */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue.length > 0 && suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="검색어를 입력하세요"
          className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition pr-10"
        />
        {/* 검색어 지우기 버튼 (입력값이 있을 때만 보임) */}
        {inputValue && ( // Only show if inputValue is not empty
          <button
            onClick={handleClearClick}
            className="absolute right-16 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 focus:outline-none text-sm font-bold"
            aria-label="검색어 지우기"
          >
            &times;
          </button>
        )}
        {/* 검색 버튼 */}
        <button
          onClick={handleButtonClick}
          className="px-4 py-2 bg-orange-500 text-white rounded-r-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 transition"
          aria-label="검색"
        >
          검색
        </button>
      </div>

      {/* 자동 완성 제안 목록 */}
      {showSuggestions && (suggestions.length > 0 || loadingSuggestions) && (
        <ul
          className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-auto"
          ref={suggestionsRef} // ref 추가
        >
          {loadingSuggestions ? (
            <li className="p-2 text-gray-500">불러오는 중...</li>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <li
                key={suggestion} // 각 제안을 위한 고유 키
                onClick={() => handleSuggestionClick(suggestion)}
                className={`p-2 cursor-pointer hover:bg-gray-100 ${
                  index === activeSuggestionIndex ? 'bg-gray-100' : ''
                }`}
              >
                {suggestion}
              </li>
            ))
          ) : (
            <li className="p-2 text-gray-500">제안 없음</li>
          )}
        </ul>
      )}
    </div>
  );
}