
'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { useKakaoMapsScript } from '@/context/KakaoMapsScriptProvider';

/**
 * 카카오맵 SDK 스크립트를 로드하고, 로딩 완료 상태를 Context에 알리는 컴포넌트입니다.
 */
export default function KakaoMapsScriptLoader() {
  const { setIsLoaded } = useKakaoMapsScript();

  const handleLoad = () => {
    // window.kakao.maps.load()는 콜백 함수를 실행하여 라이브러리 로딩이 완료되었음을 보장합니다.
    window.kakao.maps.load(() => {
      setIsLoaded(true);
      console.log("Kakao Maps SDK loaded successfully.");
    });
  };

  return (
    <Script
      src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAPS_APP_KEY}&libraries=services&autoload=false`}
      strategy="afterInteractive"
      onLoad={handleLoad}
      onError={(e) => {
        console.error("Error loading Kakao Maps SDK:", e);
      }}
    />
  );
}
