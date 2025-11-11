'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useKakaoMapsScript } from '@/context/KakaoMapsScriptProvider';
import { Input } from "@/components/ui/input";

export default function AddressSearchMap({ onSelect }) {
    const { isLoaded } = useKakaoMapsScript();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const inputRef = useRef(null); // 포커스용 ref

    // 디바운스용 타이머
    const [debounceTimer, setDebounceTimer] = useState(null);

    useEffect(() => {
        // 페이지 진입 시 input 자동 포커스
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }

        if (!isLoaded) return;

        // 이전 타이머 취소
        if (debounceTimer) clearTimeout(debounceTimer);

        const timer = setTimeout(() => {
            const geocoder = new window.kakao.maps.services.Geocoder();
            geocoder.addressSearch(query, (res, status) => {
                if (status === window.kakao.maps.services.Status.OK) {
                    setResults(res);
                } else {
                    setResults([]);
                }
            });
        }, 300); // 입력 후 300ms 대기

        setDebounceTimer(timer);

        return () => clearTimeout(timer);
    }, [query, isLoaded]);

    const handleSelect = (address) => {
        onSelect(address.address_name);
    };

    return (
        <div className="space-y-3">
            <Input
                ref={inputRef} // ref 연결
                type="text"
                placeholder="시/구/동으로 검색"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-12 focus-visible:ring-0 focus-visible:border-input"
            />

            {results.length > 0 && (
                <ul className="border p-2 max-h-40 overflow-y-auto">
                    {results.map((r, idx) => (
                        <li
                            key={idx}
                            onClick={() => handleSelect(r)}
                            className="p-1 cursor-pointer hover:bg-gray-200"
                        >
                            {r.address_name}
                        </li>
                    ))}
                </ul>
            )}

            <div className="text-sm text-gray-500 border p-3 rounded bg-gray-50 h-77">
                <strong className="text-2xl text-black">tip</strong>
                <p className="mt-1">아래와 같은 조합으로 검색하시면 더욱 정확한 결과를 얻을 수 있습니다.</p>
                <ul className="list-none list-disc list-inside mt-4 space-y-3">
                    <li>도로명 + 건물번호
                        <p className="text-blue-500">(예: 판교역로 166, 제주 첨단로 242)</p></li>
                    <li>지역명(동/리) + 번지
                        <p className="text-blue-500">(예: 백현동 532, 제주 영평동 2181)</p></li>
                    <li>지역명(동/리) + 건물명(아파트명)
                        <p className="text-blue-500">(예: 분당 주공, 연수동 주공3차)</p></li>
                    <li>사서함명 + 번호
                        <p className="text-blue-500">(예: 분당우체국사서함 1~100)</p></li>
                </ul>
            </div>
        </div>
    );
}
