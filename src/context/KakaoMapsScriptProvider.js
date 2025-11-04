'use client';

import { createContext, useState, useContext, useEffect } from 'react';

const KakaoMapsScriptContext = createContext({ isLoaded: false });

export function KakaoMapsScriptProvider({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const existingScript = document.querySelector(`script[src*="//dapi.kakao.com/v2/maps/sdk.js"]`);

    if (existingScript) {
        // 스크립트가 이미 로드되어 있다면, 로드 상태만 true로 설정
        window.kakao.maps.load(() => {
            setIsLoaded(true);
        });
        return;
    }

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAPS_APP_KEY}&libraries=services&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        setIsLoaded(true);
        console.log("Kakao Maps SDK loaded.");
      });
    };

    script.onerror = () => {
        console.error("Error loading Kakao Maps SDK.");
    }

  }, []);

  return (
    <KakaoMapsScriptContext.Provider value={{ isLoaded }}>
      {children}
    </KakaoMapsScriptContext.Provider>
  );
}

export function useKakaoMapsScript() {
  return useContext(KakaoMapsScriptContext);
}
