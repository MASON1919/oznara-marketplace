// 이 코드는 웹 브라우저(클라이언트)에서 실행됩니다.
'use client';

// React에서 필요한 기능들을 가져옵니다.
// `createContext`: 여러 컴포넌트가 정보를 쉽게 공유할 수 있는 "정보 보관함"을 만드는 기능
// `useState`: 화면에서 변하는 값(상태)을 관리하는 기능
// `useContext`: `createContext`로 만든 "정보 보관함"에서 정보를 꺼내 쓰는 기능
// `useEffect`: 화면이 처음 나타나거나 특정 상황이 바뀔 때 어떤 작업을 하는 기능
import { createContext, useState, useContext, useEffect } from 'react';

/**
 * `KakaoMapsScriptContext`는 카카오맵 JavaScript SDK가 웹 페이지에 잘 로드되었는지
 * 그 상태를 알려주는 "정보 보관함"입니다. 
 * 기본적으로는 "아직 로드되지 않음"(`isLoaded: false`) 상태로 시작합니다.
 */
const KakaoMapsScriptContext = createContext({ isLoaded: false });

/**
 * `KakaoMapsScriptProvider`는 카카오맵 SDK를 웹 페이지에 불러오고,
 * 그 로드 상태를 `KakaoMapsScriptContext`라는 "정보 보관함"에 넣어주는 역할을 합니다.
 * 이 컴포넌트는 보통 앱의 가장 바깥쪽에서 다른 모든 컴포넌트들을 감싸고 있습니다.
 * 
 * @param {object} props - 이 컴포넌트에 전달되는 정보들
 * @param {React.ReactNode} props.children - `KakaoMapsScriptProvider`가 감싸고 있는 다른 모든 컴포넌트들
 */
export function KakaoMapsScriptProvider({ children }) {
  // 카카오맵 SDK가 웹 페이지에 로드되었는지 아닌지 알려주는 변수입니다.
  const [isLoaded, setIsLoaded] = useState(false);

  // 이 부분은 웹 페이지가 처음 나타날 때 딱 한 번만 실행됩니다.
  // 여기서 카카오맵 SDK를 웹 페이지에 불러오는 작업을 합니다.
  useEffect(() => {
    // 1. 혹시 카카오맵 스크립트가 이미 웹 페이지에 있는지 확인합니다.
    // (개발 중에 웹 페이지가 새로고침될 때 스크립트가 여러 번 불러와지는 것을 막기 위함입니다.)
    const existingScript = document.querySelector(`script[src*="//dapi.kakao.com/v2/maps/sdk.js"]`);

    if (existingScript) {
        // 2. 만약 스크립트가 이미 있다면, "카카오맵 SDK가 로드되었으니 이제 쓸 수 있어!" 하고 알려줍니다.
        // `window.kakao.maps.load()`는 카카오맵 API가 완전히 준비되었을 때 실행되는 기능입니다.
        window.kakao.maps.load(() => {
            setIsLoaded(true);
            console.log("Kakao Maps SDK가 이미 로드되어 초기화되었습니다.");
        });
        return; // 이미 로드되었으니 더 이상 스크립트를 추가하지 않고 끝냅니다.
    }

    // 3. 스크립트가 없다면, 새로운 `<script>` 태그를 만들어서 카카오맵 SDK를 불러옵니다.
    const script = document.createElement('script');
    // 스크립트의 주소를 설정합니다.
    // `appkey`: 카카오 개발자 사이트에서 받은 내 앱 키
    // `libraries=services`: 장소 검색 같은 추가 기능을 쓸 수 있게 해줍니다.
    // `autoload=false`: 스크립트가 불러와지자마자 바로 실행하지 않고, 내가 "이제 실행해!" 할 때까지 기다리게 합니다.
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAPS_APP_KEY}&libraries=services&autoload=false`;
    script.async = true; // 스크립트를 비동기로 불러와서 웹 페이지가 멈추지 않게 합니다.
    // 만든 스크립트 태그를 웹 페이지의 `<head>` 부분에 추가합니다.
    document.head.appendChild(script);

    // 4. 스크립트가 웹 페이지에 성공적으로 불러와지면 실행되는 기능입니다.
    script.onload = () => {
      // `autoload=false`로 설정했기 때문에, 여기서 "카카오맵 API를 이제 실행해!" 하고 명령합니다.
      window.kakao.maps.load(() => {
        setIsLoaded(true); // 카카오맵 SDK가 완전히 준비되었다고 변수를 바꿔줍니다.
        console.log("Kakao Maps SDK가 로드되어 초기화되었습니다.");
      });
    };

    // 5. 스크립트를 불러오는 중에 에러가 발생하면 실행되는 기능입니다.
    script.onerror = () => {
        console.error("Kakao Maps SDK 로드 중 오류 발생.");
    }

    // 이 기능은 웹 페이지가 사라질 때 스크립트를 제거하는 역할도 할 수 있지만,
    // 카카오맵 SDK는 보통 앱 전체에서 계속 쓰이므로 여기서는 따로 제거하지 않습니다.
  }, []); // 빈 배열 `[]`은 이 기능이 웹 페이지가 처음 나타날 때 딱 한 번만 실행되게 합니다.

  // `KakaoMapsScriptContext.Provider`는 `value` 안에 있는 정보(`isLoaded`)를
  // 이 컴포넌트가 감싸고 있는 모든 다른 컴포넌트들에게 전달해줍니다.
  return (
    <KakaoMapsScriptContext.Provider value={{ isLoaded }}>
      {children} {/* `KakaoMapsScriptProvider`가 감싸고 있는 다른 모든 컴포넌트들 */}
    </KakaoMapsScriptContext.Provider>
  );
}

/**
 * `useKakaoMapsScript`는 `KakaoMapsScriptContext`라는 "정보 보관함"에서
 * 카카오맵 SDK의 로드 상태(`isLoaded`)를 쉽게 꺼내 쓸 수 있도록 도와주는 기능입니다.
 * 이 기능을 사용하면 복잡하게 `useContext(KakaoMapsScriptContext)`라고 쓰지 않고,
 * `useKakaoMapsScript()` 한 줄로 카카오맵이 준비되었는지 바로 알 수 있습니다.
 * 
 * @returns {{ isLoaded: boolean }} 카카오맵 SDK가 로드되었는지 여부
 */
export function useKakaoMapsScript() {
  return useContext(KakaoMapsScriptContext);
}
