
'use client';

import { createContext, useState, useContext } from 'react';

// 스크립트 로딩 상태를 위한 Context 생성
const KakaoMapsScriptContext = createContext(null);

/**
 * 카카오맵 SDK 스크립트의 로딩 상태를 제공하는 Provider 컴포넌트입니다.
 * @param {object} props - 컴포넌트 props
 * @param {React.ReactNode} props.children - 이 Provider로 감쌀 자식 컴포넌트들
 */
export function KakaoMapsScriptProvider({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <KakaoMapsScriptContext.Provider value={{ isLoaded, setIsLoaded }}>
      {children}
    </KakaoMapsScriptContext.Provider>
  );
}

/**
 * 카카오맵 스크립트 로딩 상태를 사용하기 위한 커스텀 훅입니다.
 * @returns {{isLoaded: boolean, setIsLoaded: Function}} 스크립트 로딩 상태와 상태 변경 함수
 */
export function useKakaoMapsScript() {
  const context = useContext(KakaoMapsScriptContext);
  if (context === null) {
    throw new Error('useKakaoMapsScript must be used within a KakaoMapsScriptProvider');
  }
  return context;
}
