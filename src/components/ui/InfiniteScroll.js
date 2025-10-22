// /src/components/ui/InfiniteScroll.js

// 'use client'는 이 코드가 클라이언트 측(사용자의 브라우저)에서 실행되어야 함을 나타냅니다.
// IntersectionObserver와 같은 브라우저 API를 사용하고, 사용자의 스크롤 이벤트를 감지하기 때문입니다.
'use client';

// React에서 컴포넌트의 생명주기(useEffect)와 DOM 요소를 직접 참조(useRef)하기 위한 훅을 가져옵니다.
import { useEffect, useRef } from 'react';

/**
 * InfiniteScroll 컴포넌트는 자식 요소들을 보여주고, 사용자가 페이지 끝에 가까워지면
 * 'loadMore' 함수를 호출하여 데이터를 추가로 불러오는 무한 스크롤 기능을 구현합니다.
 * @param {React.ReactNode} children - 보여줄 실제 컨텐츠 (예: 상품 목록)
 * @param {Function} loadMore - 추가 데이터를 불러오는 함수
 * @param {boolean} hasMore - 더 불러올 데이터가 남아있는지 여부
 * @param {boolean} loading - 현재 데이터를 불러오는 중인지 여부
 */
export default function InfiniteScroll({ children, loadMore, hasMore, loading }) {
    // IntersectionObserver가 감시할 '트리거(trigger)' 요소를 참조하기 위한 ref를 생성합니다.
    // ref는 렌더링 사이에 값을 유지하며, DOM 요소에 직접 접근할 수 있게 해줍니다.
    const triggerRef = useRef(null);

    // 이 useEffect 훅은 컴포넌트의 핵심 로직을 담당합니다.
    // 의존성 배열 [hasMore, loading, loadMore] 안의 값이 변경될 때마다 이 함수가 다시 실행됩니다.
    useEffect(() => {
        // triggerRef가 가리키는 실제 DOM 요소. 아직 렌더링되지 않았다면 null일 수 있습니다.
        const trigger = triggerRef.current;
        if (!trigger) return; // 감시할 요소가 없으면 아무것도 하지 않고 종료합니다.

        // IntersectionObserver 인스턴스를 생성합니다.
        // 이 옵저버는 'trigger' 요소가 뷰포트(화면)에 들어오는지 감시합니다.
        const observer = new IntersectionObserver(
            (entries) => {
                // entries 배열의 첫 번째 요소가 우리가 감시하는 'trigger'입니다.
                // entry.isIntersecting이 true이면 요소가 화면에 보인다는 의미입니다.
                // 추가로, 더 불러올 데이터가 있고(hasMore) 로딩 중이 아닐 때만(!loading) loadMore 함수를 호출합니다.
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadMore();
                }
            },
            {
                // rootMargin은 뷰포트 경계를 확장하는 역할을 합니다.
                // '0px 0px 200px 0px'는 뷰포트 하단 경계를 200px 아래로 확장하여,
                // 트리거 요소가 화면에 보이기 200px 전에 미리 데이터를 로드하게 만들어 사용자 경험을 향상시킵니다.
                rootMargin: '0px 0px 200px 0px',
            }
        );

        // 'trigger' 요소에 대한 감시를 시작합니다.
        observer.observe(trigger);

        // useEffect의 'cleanup' 함수입니다. 컴포넌트가 사라지거나(unmount),
        // 의존성 배열의 값이 변경되어 effect가 재실행되기 직전에 호출됩니다.
        return () => {
            if (trigger) {
                // 'trigger' 요소에 대한 감시를 중단합니다.
                // 이는 메모리 누수(memory leak)를 방지하는 매우 중요한 과정입니다.
                observer.unobserve(trigger);
            }
        };
    }, [hasMore, loading, loadMore]);

    return (
        // <></> (Fragment)를 사용하여 불필요한 div 태그 없이 여러 요소를 렌더링합니다.
        <>
            {/* 부모 컴포넌트로부터 전달받은 실제 컨텐츠(예: ProductList)를 여기에 렌더링합니다. */}
            {children}
            
            {/* 
              IntersectionObserver의 '트리거' 역할을 하는 div 요소입니다.
              더 불러올 데이터가 있을 때(hasMore가 true일 때)만 렌더링됩니다.
              사용자 눈에는 보이지 않지만(높이가 1px), 이 요소가 뷰포트에 들어오면 다음 페이지 로드가 시작됩니다.
            */}
            {hasMore && <div ref={triggerRef} style={{ height: '1px' }} />}

            {/* 로딩 중이 아니고 더 이상 불러올 데이터도 없을 때, 모든 결과를 불러왔음을 알리는 메시지를 표시합니다. */}
            {!loading && !hasMore && (
                <div className="text-center my-4 text-gray-500">모든 결과를 불러왔습니다.</div>
            )}
        </>
    );
}