"use client";

import Image from "next/image";


export function DeliveryServiceCard({
    logo,
    logoAlt,
    title,
    isEvent,
    description,
    priceInfo,
    discountInfo,
    constraints,
}) {
    return (
        // 카드 전체 (클릭 가능)
        <div className="border rounded-lg p-4 space-y-3 bg-background hover:bg-muted/50 cursor-pointer">
            {/* 상단: 정보 (제목, 설명) + 로고 */}
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    {/* 제목 + 이벤트 뱃지 */}
                    <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-base">{title}</h4>
                        {isEvent && (
                            <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded">
                                EVENT
                            </span>
                        )}
                    </div>
                    {/* 설명 */}
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>

                {/* 로고 (next/image 사용) */}
                <div className="relative w-12 h-12 rounded-full border flex items-center justify-center bg-white p-1 overflow-hidden">

                </div>
            </div>

            {/* 중단: 가격 정보 */}
            <div>
                <span className="font-bold text-lg">{priceInfo}</span>
                {discountInfo && (
                    <span className="text-sm text-blue-600 font-semibold ml-2">
                        {discountInfo}
                    </span>
                )}
            </div>

            {/* 하단: 제약 조건 */}
            {constraints && constraints.length > 0 && (
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 pt-2">
                    {constraints.map((item, index) => (
                        <li key={index}>
                            {/* "이벤트 페이지" 텍스트에 링크 스타일 적용 */}
                            {item.includes("이벤트 페이지") ? (
                                <>
                                    {item.split("이벤트 페이지")[0]}
                                    <a
                                        href="#"
                                        className="underline font-medium text-gray-700"
                                        onClick={(e) => e.stopPropagation()} // 카드 클릭 방지
                                    >
                                        이벤트 페이지
                                    </a>
                                    {item.split("이벤트 페이지")[1]}
                                </>
                            ) : (
                                item
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}