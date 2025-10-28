"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { ChevronLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

const REASONS = [
    { id: "lowUsage", label: "사용 빈도가 낮고 개인정보 및 보안 우려" },
    { id: "badUsers", label: "비매너 사용자들로 인한 불편 (사기 등)" },
    { id: "serviceIssues", label: "서비스 기능 불편 (상품등록/거래 등)" },
    { id: "eventUse", label: "이벤트 등의 목적으로 한시 사용" },
    { id: "etc", label: "기타" },
];

export default function DeleteAccountPanel({ onClose }) {
    const [checked, setChecked] = useState([]);
    const [detail, setDetail] = useState("");

    const toggleReason = (id) => {
        setChecked(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleSubmit = async () => {
        if (checked.length === 0) return;

        try {
            const res = await fetch("/api/user/delete-account", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reasons: checked, detail }),
            });

            if (res.ok) {
                alert("탈퇴 요청이 정상적으로 접수되었습니다.");
                // 로그아웃 또는 리다이렉트 처리 가능
            } else {
                alert("탈퇴 요청 중 오류가 발생했습니다.");
            }
        } catch (error) {
            console.error(error);
            alert("네트워크 오류가 발생했습니다.");
        }
    };

    return (
        <Sheet open={true} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full md:max-w-xl">
                <SheetClose className="absolute top-4 left-4 cursor-pointer">
                    <ChevronLeft />
                </SheetClose>
                <SheetHeader className="flex justify-between items-center p-3">
                    <SheetTitle className="mt-1 text-lg">회원 탈퇴</SheetTitle>
                </SheetHeader>
                <ScrollArea className="overflow-y-auto">
                    <div className="mx-4">
                        <div className="">
                            <h2 className="tracking-tight text-2xl font-medium text-gray-900">
                                탈퇴 사유를 알려주시면<br />
                                개선을 위해 노력하겠습니다.
                            </h2>
                            <p className="my-5 text-sm text-gray-500">
                                (복합 선택 가능)
                            </p>

                            {/* 체크리스트 */}
                            <div className="space-y-5">
                                {REASONS.map((reason) => (
                                    <div key={reason.id} className="flex items-center gap-2">
                                        <Checkbox
                                            checked={checked.includes(reason.id)}
                                            onCheckedChange={() => toggleReason(reason.id)}
                                        />
                                        <label className="text-sm font-semibold text-gray-900">{reason.label}</label>
                                    </div>
                                ))}
                            </div>

                            {/* 상세 사유 */}
                            <div className="m-4">
                                <Textarea
                                    placeholder="상세 사유를 작성해 주세요. (예: 타 서비스 이용)"
                                    value={detail}
                                    onChange={(e) => setDetail(e.target.value)}
                                    maxLength={200}
                                    className="focus-visible:ring-0 focus-visible:border-input my-2 w-full h-30 resize-none"
                                />
                                <div className="text-xs text-gray-500 text-right">{detail.length}/200</div>
                            </div>
                        </div>

                        {/* 유의사항 */}
                        <div className="text-base text-gray-700">
                            <h3 className="tracking-tight text-xl font-semibold text-gray-900">유의 사항을 확인해주세요!</h3>

                            <div className="mt-2 space-y-5 w-full ">
                                <div className="flex items-start gap-2">
                                    <span className="text-lg font-bold w-6 flex-shrink-0">01</span>
                                    <p className="pl-2 flex-1 text-gray-600">
                                        탈퇴 신청일로부터 30일 이내에 동일한 아이디와 휴대폰 번호로 가입 불가하며 재가입 시, 신규 가입 혜택은 적용되지 않습니다.
                                    </p>
                                </div>

                                <div className="flex items-start gap-2">
                                    <span className="text-lg font-bold w-6 flex-shrink-0">02</span>
                                    <p className="pl-2 flex-1 text-gray-600">
                                        회원 탈퇴 시 본인 계정에 등록된 게시물 또는 회원이 작성한 게시물 일체는 삭제됩니다. 다만, 다른 회원에 의해 스크랩되어 게시되거나 공용 게시판에 등록된 게시물은 삭제되지 않으니 삭제를 원하신다면 미리 삭제 후 탈퇴를 진행해주세요.
                                    </p>
                                </div>

                                <div className="flex items-start gap-2">
                                    <span className="text-lg font-bold w-6 flex-shrink-0">03</span>
                                    <div className="pl-2 flex-1 space-y-2 text-gray-600">
                                        <p>
                                            전자 상거래 등에서의 소비자 보호에 관한 법률 규정에 따라 아래와 같이 기록을 보관하며, 법률에 의한 경우 외 다른 목적으로 이용되지 않습니다.
                                        </p>
                                        <ul className="list-disc ml-5 space-y-1">
                                            <li>표시 광고에 대한 기록: 6개월</li>
                                            <li>계약 또는 청약철회, 대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
                                            <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
                                            <li>로그인 기록: 3개월</li>
                                            <li>전자금융거래기록: 5년</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <span className="text-lg font-bold w-6 flex-shrink-0">04</span>
                                    <p className="pl-2 flex-1 text-gray-600">
                                        탈퇴 신청 후 72시간(3일) 이내 동일한 계정으로 로그인 시 탈퇴 신청이 자동으로 철회됩니다.
                                    </p>
                                </div>

                                <div className="flex items-start gap-2">
                                    <span className="text-lg font-bold w-6 flex-shrink-0">05</span>
                                    <p className="pl-2 flex-1 text-gray-600">
                                        중고나라 카페 글쓰기 권한을 받은 상태에서 탈퇴할 경우, 중고나라 카페와의 연결이 해제되며 회원 등급도 변경됩니다. 이로 인해 카페에서 글쓰기가 제한될 수 있으니 유의해주세요.
                                    </p>
                                </div>

                                {/* 탈퇴 버튼 */}
                                <Button
                                    className="h-12 text-sm w-full mt-4"
                                    disabled={
                                        checked.length === 0 || (checked.includes("etc") && detail.trim().length === 0)
                                    }
                                    onClick={handleSubmit}
                                >
                                    회원탈퇴
                                </Button>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet >
    );
}
