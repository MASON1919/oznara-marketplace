"use client";

// import Image from "next/image"; // Image 컴포넌트 더 이상 사용하지 않음
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose }
    from "@/components/ui/sheet";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { ChevronLeft, Info, MoveRight } from "lucide-react";
import { DeliveryServiceCard } from "./DeliveryServiceCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircleMore } from "lucide-react";

// DeliveryServiceCard 컴포넌트 데이터 (정보 팝업에 사용될 데이터)
const DELIVERY_INFO_DATA = [
    {
        // logo: "/logos/lotte-logo.png", // 로고 이미지 경로 제거
        // logoAlt: "롯데택배", // alt 텍스트 제거
        title: "롯데 방문 택배",
        isEvent: true,
        description: "원하는 장소 -> 원하는 장소로 배송하는 서비스",
        priceInfo: "4,500원~",
        discountInfo: "(최대 1,000원 할인)",
        constraints: [
            "가로+세로+높이 160cm, 무게 20kg 이하",
            "자세한 사항은 이벤트 페이지를 참고해 주세요.",
        ],
    },
    {
        // logo: "/logos/cu-logo.png",
        // logoAlt: "CU",
        title: "CU 알뜰택배",
        isEvent: true,
        description: "편의점 -> 편의점으로 배송하는 서비스",
        priceInfo: "1,500원~",
        discountInfo: "(300원 할인)",
        constraints: [
            "가로+세로+높이 100cm, 무게 5kg 이하",
            "자세한 사항은 이벤트 페이지를 참고해 주세요.",
        ],
    },
    {
        // logo: "/logos/cu-gs25-logo.png",
        // logoAlt: "CU/GS25",
        title: "편의점 택배",
        isEvent: true,
        description: "편의점 -> 원하는 장소로 배송하는 서비스",
        priceInfo: "3,200원~",
        discountInfo: "(CU 300원 할인)",
        constraints: [
            "가로+세로+높이 140cm, 무게 20kg 이하",
            "자세한 사항은 이벤트 페이지를 참고해 주세요.",
        ],
    },
    {
        // logo: "/logos/7eleven-logo.png",
        // logoAlt: "7-Eleven",
        title: "세븐일레븐 편의점 택배",
        isEvent: false,
        description: "편의점 -> 원하는 장소로 배송하는 서비스",
        priceInfo: "3,200원~",
        constraints: [
            "가로+세로+높이 140cm, 무게 20kg 이하",
            "자세한 사항은 이벤트 페이지를 참고해 주세요.",
        ],
    },
];




export default function DeliveryPanel({ onClose }) {

    const [currentPage, setCurrentPage] = useState("delivery");
    // Info 버튼 클릭 핸들러 (택배 정보 패널/모달을 열어야 함)
    const cancelEdit = () => {
        setCurrentPage("delivery");
    };

    return (
        <Sheet open={true} onOpenChange={onClose}>
            {/* p-0: 내부에서 패딩을 제어하기 위해 기본 패딩 제거, flex/flex-col: 헤더/탭/컨텐츠 수직 정렬 */}
            <SheetContent
                side="right"
                className="w-full md:max-w-xl p-0 flex flex-col"
            >
                <div className="flex justify-between items-center">
                    {currentPage === "delivery" ? (
                        <SheetClose className="m-4 cursor-pointer">
                            <ChevronLeft />
                        </SheetClose>
                    ) : (
                        <button
                            className="p-4 cursor-pointer"
                            onClick={cancelEdit}
                        >
                            <ChevronLeft />
                        </button>
                    )}
                    <SheetHeader className="">
                        <SheetTitle className="pr-3 text-lg">
                            {currentPage === "delivery" && "택배"}
                            {currentPage === "delivery_info" && "배송상태 안내"}
                        </SheetTitle>
                    </SheetHeader>
                    <Button className="cursor-pointer" variant="link" size="icon" onClick={() => setCurrentPage("delivery_info")}>
                        <Info className="mr-4 size-5 text-gray-400" />
                    </Button>
                </div>



                <ScrollArea className="overflow-y-auto h-full">
                    {/* 2. 메인 탭 (신청 / 내역) */}
                    {/* flex-1: 남은 공간을 모두 차지, flex/flex-col: 탭 리스트와 탭 컨텐츠를 수직 정렬 */}
                    {currentPage === "delivery" && (
                        <Tabs defaultValue="request" className="flex flex-col flex-1">
                            {/* rounded-none: 탭 버튼이 헤더에 딱 붙도록 */}
                            <TabsList className="h-12 px-4 bg-transparent w-full rounded-none">
                                <TabsTrigger value="request"
                                    className="font-bold cursor-pointer border-0 border-gray-100 border-b-2 data-[state=active]:shadow-none data-[state=active]:border-b-primary data-[state=active]:border-b-2 rounded-none">
                                    택배 신청
                                </TabsTrigger>
                                <TabsTrigger value="history"
                                    className="font-bold cursor-pointer border-0 border-gray-100 border-b-2 data-[state=active]:shadow-none data-[state=active]:border-b-primary data-[state=active]:border-b-2 rounded-none">
                                    택배 내역
                                </TabsTrigger>
                            </TabsList>

                            {/* 3. "택배 신청" 탭 컨텐츠 (서브 탭 제거, 모든 카드 나열) */}
                            {/* flex-1 overflow-y-auto: 이 영역만 스크롤되도록 */}
                            <TabsContent
                                value="request"
                                className="flex-1 px-4 space-y-4"
                            >
                                <div className="bg-blue-50 rounded-lg h-30 p-4 flex justify-between items-center cursor-pointer">
                                    <div>
                                        <p className="text-sm text-blue-700">
                                            중고나라 택배를 처음 이용하시나요?
                                        </p>
                                        <h3 className="mt-1 text-lg font-bold text-blue-900">
                                            중고나라 택배 이용 가이드{" "}
                                            <MoveRight className="inline h-5 w-5" />
                                        </h3>
                                    </div>
                                    {/* 배너 이미지 제거 */}

                                </div>

                                {/* 3-2. 모든 택배 서비스 카드 나열 */}
                                <div className="space-y-3">
                                    {DELIVERY_INFO_DATA.map((service, index) => (
                                        <DeliveryServiceCard key={index} {...service} />
                                    ))}
                                </div>
                            </TabsContent>


                            {/* 4. "택배 내역" 탭 컨텐츠 */}
                            {/* flex-1: 탭 리스트를 제외한 나머지 공간 차지 */}
                            <TabsContent value="history" className="flex-1 px-4">
                                <div className="flex h-[700px]">
                                    <Tabs defaultValue="sent" className="flex flex-1 w-full">
                                        {/* 보낸 택배 / 받은 택배 서브 탭 유지 */}
                                        <TabsList className="ml-3 bg-transparent gap-1">
                                            <TabsTrigger value="sent" className="cursor-pointer border border-gray-300 text-gray-500 bg-white rounded-full px-3 py-1 h-auto transition-colors
                                    data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary">보낸 택배</TabsTrigger>
                                            <TabsTrigger value="received" className="cursor-pointer border border-gray-300 text-gray-500 bg-white rounded-full px-3 py-1 h-auto transition-colors
                                    data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary">받은 택배</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="sent" className="flex justify-center items-center">
                                            <div className="flex flex-col items-center justify-center p-10">
                                                <MessageCircleMore className="size-20 mb-2 text-gray-200" />
                                                <p>보낸 택배 내역이 없습니다.</p>
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="received" className="flex justify-center items-center">
                                            <div className="flex flex-col items-center justify-center p-10">
                                                <MessageCircleMore className="size-20 mb-2 text-gray-200" />
                                                <p>받은 택배 내역이 없습니다.</p>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}

                    {/* info page */}
                    {currentPage === "delivery_info" && (
                        <Tabs defaultValue="a" className="w-full flex-1 flex flex-col">
                            {/* rounded-none: 탭 버튼이 헤더에 딱 붙도록 */}
                            <TabsList className="h-12 px-4 bg-transparent w-full rounded-none">
                                <TabsTrigger value="a"
                                    className="font-bold cursor-pointer border-0 border-gray-100 border-b-2 data-[state=active]:shadow-none data-[state=active]:border-b-primary data-[state=active]:border-b-2 rounded-none">
                                    CU 알뜰택배
                                </TabsTrigger>
                                <TabsTrigger value="b"
                                    className="font-bold cursor-pointer border-0 border-gray-100 border-b-2 data-[state=active]:shadow-none data-[state=active]:border-b-primary data-[state=active]:border-b-2 rounded-none">
                                    편의점/방문택배
                                </TabsTrigger>
                            </TabsList>


                            <TabsContent
                                value="a"
                                className="flex-1 px-4"
                            >
                                <div className="space-y-0">
                                    {/* 예약취소 */}
                                    <div className="py-4 border-b px-4">
                                        <h4 className="font-semibold text-base">예약취소</h4>
                                        <p className="text-sm text-gray-600 mt-1">보내는 분의 예약취소 또는 접수기간 만료</p>
                                    </div>

                                    {/* 예약중 */}
                                    <div className="py-4 border-b px-4">
                                        <h4 className="font-semibold text-base">예약중</h4>
                                        <p className="text-sm text-gray-600 mt-1">예약번호가 발급된 상태</p>
                                    </div>

                                    {/* 접수완료 */}
                                    <div className="py-4 border-b px-4">
                                        <h4 className="font-semibold text-base">접수완료</h4>
                                        <p className="text-sm text-gray-600 mt-1">운송장 번호가 발급된 상태, CU 알뜰택배 접수 완료</p>
                                    </div>

                                    {/* 배송중 */}
                                    <div className="py-4 border-b px-4">
                                        <h4 className="font-semibold text-base">배송중</h4>
                                        <p className="text-sm text-gray-600 mt-1">상품이 수거되어 배송 중인 상태</p>
                                    </div>

                                    {/* 배송완료/픽업대기 */}
                                    <div className="py-4 border-b px-4">
                                        <h4 className="font-semibold text-base">배송완료/픽업대기</h4>
                                        <p className="text-sm text-gray-600 mt-1">도착 점포에 배송이 완료되어 수령 대기 중인 상태</p>
                                    </div>

                                    {/* 픽업완료 */}
                                    <div className="py-4 border-b px-4">
                                        <h4 className="font-semibold text-base">픽업완료</h4>
                                        <p className="text-sm text-gray-600 mt-1">받는 분이 상품을 수령한 상태</p>
                                    </div>

                                    {/* 반송 (마지막 항목이므로 last:border-b-0 효과를 위해 border-b를 제거하거나 부모 요소에서 처리해야 합니다.) */}
                                    <div className="py-4 px-4">
                                        <h4 className="font-semibold text-base">반송</h4>
                                        <p className="text-sm text-gray-600 mt-1">받는 분이 상품을 수령하지 않아 보내는 분에게 반송된 상태</p>
                                    </div>
                                </div>

                            </TabsContent>


                            <TabsContent value="b" className="flex-1 px-4">
                                <div className="space-y-0">

                                    {/* 예약취소 */}
                                    <div className="py-4 border-b px-4">
                                        <h4 className="font-semibold text-base">예약취소</h4>
                                        <p className="text-sm text-gray-600 mt-1">보내는 분의 예약취소 또는 접수기간 만료</p>
                                    </div>

                                    {/* 예약중 */}
                                    <div className="py-4 border-b px-4">
                                        <h4 className="font-semibold text-base">예약중</h4>
                                        <p className="text-sm text-gray-600 mt-1">예약 승인번호(예약번호)가 발급된 상태</p>
                                    </div>

                                    {/* 접수완료 */}
                                    <div className="py-4 border-b px-4">
                                        <h4 className="font-semibold text-base">접수완료</h4>
                                        <p className="text-sm text-gray-600 mt-1">운송장 번호가 발급된 상태, 편의점 택배 접수 완료, 방문 기사님 수거 완료</p>
                                    </div>

                                    {/* 배송중 */}
                                    <div className="py-4 border-b px-4">
                                        <h4 className="font-semibold text-base">배송중</h4>
                                        <p className="text-sm text-gray-600 mt-1">상품이 수거되어 배송 중인 상태</p>
                                    </div>

                                    {/* 배송완료 (마지막 항목) */}
                                    <div className="py-4 px-4">
                                        <h4 className="font-semibold text-base">배송완료</h4>
                                        <p className="text-sm text-gray-600 mt-1">받는 분에게 상품이 도착한 상태</p>
                                    </div>

                                </div>
                            </TabsContent>
                        </Tabs>
                    )}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}