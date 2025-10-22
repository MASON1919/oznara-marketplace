// /src/components/ui/Spinner.js

// 이 파일은 데이터 로딩 중임을 사용자에게 시각적으로 알려주는
// '스피너(spinner)' UI 컴포넌트입니다.
// Tailwind CSS의 유틸리티 클래스를 사용하여 스타일링되었습니다.

// 'use client'는 이 컴포넌트가 클라이언트 측에서 렌더링될 수 있음을 명시합니다.
// 애니메이션과 같은 동적인 UI 요소에 종종 사용됩니다.
'use client';

export default function Spinner() {
    return (
        // 스피너를 중앙에 배치하기 위한 flexbox 컨테이너입니다.
        // - flex: flexbox 레이아웃 사용
        // - justify-center: 가로 중앙 정렬
        // - items-center: 세로 중앙 정렬
        <div className="flex justify-center items-center">
            {/* 
              실제 스피너 모양을 만드는 div 요소입니다.
              - w-8 h-8: 너비와 높이를 32px로 설정
              - border-4: 테두리 두께를 4px로 설정
              - border-orange-500: 테두리 색상을 주황색으로 설정
              - border-solid: 테두리 스타일을 실선으로 설정
              - rounded-full: 모서리를 완전히 둥글게 만들어 원형으로 만듦
              - animate-spin: Tailwind CSS의 기본 스핀 애니메이션을 적용하여 회전 효과를 줌
              - border-t-transparent: 위쪽(top) 테두리만 투명하게 만들어, 회전하는 것처럼 보이게 하는 트릭
            */}
            <div className="w-8 h-8 border-4 border-orange-500 border-solid rounded-full animate-spin border-t-transparent"></div>
        </div>
    );
}