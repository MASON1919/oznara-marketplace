"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Share2, Copy, Facebook, MessageCircle } from "lucide-react";

export default function ProfilePanel() {
    const { data: session, status } = useSession();
    const [tab, setTab] = useState("messages");
    const [shareOpen, setShareOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    // 닉네임/자기소개 상태 초기화
    const [nickname, setNickname] = useState("");
    const [bio, setBio] = useState("");

    useEffect(() => {
        if (session?.user) {
            setNickname(session.user.nickname || "");
            setBio(session.user.bio || "");
        }
    }, [session]);

    if (status === "loading") return <p>로딩중...</p>;
    if (!session) return <p>로그인이 필요합니다.</p>;

    const trustLevel = 68;
    const trustMax = 100;

    const handleSave = async () => {
        // 서버에 실제 업데이트 API 호출 필요
        // await fetch("/api/user/update", { ... })

        // 임시 로컬 세션 업데이트
        session.user.name = nickname;
        session.user.bio = bio;

        setEditOpen(false);
    };

    const shareLink = () => {
        navigator.clipboard.writeText(window.location.href);
        alert("URL이 복사되었습니다!");
    };

    return (
        <div className="flex flex-col w-full mt-3">
            <h1 className="flex w-full text-2xl font-bold mb-4">
                안녕하세요, {session.user?.name || session.user?.email}님
            </h1>
            {/* 프로필 카드 */}
            <div className="flex gap-4 h-[350px]">
                <Card className="flex-1 p-2 h-full">
                    <CardContent className="flex flex-col justify-around my-5 h-full">

                        {/* 프로필 & 닉네임 & */}
                        <div className="flex">
                            <Avatar className="flex w-20 h-20">
                                {session.user?.image ? (
                                    <AvatarImage src={session.user.image} alt={session.user.name ?? "프로필"} />
                                ) : (
                                    <AvatarFallback>{session.user?.name?.[0] ?? "U"}</AvatarFallback>
                                )}
                            </Avatar>
                            <div className="flex flex-col p-1 ml-3">
                                <h1 className="text-3xl font-black">{session.user?.name}</h1>
                                <p className="mt-1 text-sm text-gray-600">{session.user?.email}</p>
                            </div>
                        </div>

                        {/* 레벨 & 배지 */}
                        <div className="flex mt-5 items-center gap-2">
                            <span className="text-sm font-semibold">LV.{Math.floor(trustLevel / 10)}</span>
                            <span className="bg-yellow-400 text-white text-xs px-2 py-1 rounded-full">거래왕</span>
                        </div>

                        {/* 신뢰지수 게이지 */}
                        <div className="w-full mt-1">
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>신뢰지수</span>
                                <span>{trustLevel} / {trustMax}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div
                                    className="bg-green-500 h-2 rounded-full transition-all"
                                    style={{ width: `${(trustLevel / trustMax) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* 자기소개 */}
                        <p className="text-xs text-gray-500 text-center">
                            {bio || "자기 소개 작성하고 신뢰도를 높여 보세요."}
                        </p>

                        {/* 버튼 */}
                        <div className="flex gap-2 mt-3">
                            <Button className="flex-1 h-10" variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                                프로필 수정
                            </Button>
                            <Button className="flex-1 h-10" variant="outline" size="sm" onClick={() => setShareOpen(true)}>
                                <Share2 className="w-4 h-4 mr-1" /> 공유
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* 프로필 수정 모달 */}
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogContent className="sm:max-w-md sm:mx-auto">
                        <DialogHeader>
                            <DialogTitle>프로필 수정</DialogTitle>
                        </DialogHeader>

                        <div className="flex flex-col gap-4 mt-4">
                            <Input
                                placeholder="닉네임 (필수)"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                required
                                className="focus-visible:ring-0 focus-visible:border-input"
                            />
                            <Textarea
                                placeholder="자기소개 (최대 25자)"
                                value={bio}
                                onChange={(e) => {
                                    if (e.target.value.length <= 25) setBio(e.target.value);
                                }}
                                className="focus-visible:ring-0 focus-visible:border-input"
                            />
                            <Button
                                onClick={handleSave}
                                disabled={!nickname} // 닉네임이 없으면 비활성화
                            >
                                저장
                            </Button>
                            <p className="text-xs text-gray-500">
                                {bio.length}/25
                            </p>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* 공유 모달 */}
                <Dialog open={shareOpen} onOpenChange={setShareOpen}>
                    <DialogContent className="w-[350px] h-[200px]">
                        <DialogHeader className="mt-4">
                            <DialogTitle className="flex justify-center">공유하기</DialogTitle>
                        </DialogHeader>
                        <div className="flex justify-center gap-4">
                            <CircleButton><MessageCircle /></CircleButton>
                            <CircleButton><Facebook /></CircleButton>
                            <CircleButton onClick={shareLink}><Copy /></CircleButton>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* 탭 */}
                <Tabs value={tab} onValueChange={setTab} className="flex-1 h-full w-full overflow-hidden">
                    <TabsList className="grid grid-cols-3 w-full">
                        <TabsTrigger value="messages" className="relative flex justify-center items-center">
                            메시지
                            {/* 새 메시지 숫자 뱃지 */}
                            <span className="absolute top-0 right-0 -translate-x-1/4 translate-y-1/4 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                3
                            </span>
                        </TabsTrigger>

                        <TabsTrigger value="notifications" className="relative flex justify-center items-center">
                            알림
                        </TabsTrigger>

                        <TabsTrigger value="inquiry" className="relative flex justify-center items-center">
                            문의
                            {/* 새 문의 없으면 숫자 표시 X */}
                        </TabsTrigger>
                    </TabsList>

                    <TabPanel value="messages">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <Card key={i} className="p-3 cursor-pointer hover:bg-gray-50">
                                <p className="font-semibold">거래 채팅 #{i}</p>
                                <p className="text-xs text-gray-500">최근 메시지 미리보기...</p>
                            </Card>
                        ))}
                    </TabPanel>
                    <TabPanel value="notifications">...</TabPanel>
                    <TabPanel value="inquiry">...</TabPanel>
                </Tabs>
            </div>
        </div>
    );
}

// ----------- 재사용 컴포넌트 -----------
function CircleButton({ children, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-15 h-15 bg-gray-200 rounded-full flex items-center justify-center"
        >
            {children}
        </button>
    );
}

function TabPanel({ value, children }) {
    return (
        <TabsContent value={value} className="flex-1 overflow-hidden">
            <div className="overflow-y-auto h-full space-y-2 pr-2 box-border">{children}</div>
        </TabsContent>
    );
}
