"use client";

import { useState, useEffect } from "react";
// 💡 useSession에서 update 함수를 구조 분해 할당으로 가져옵니다.
import { useSession, signOut } from "next-auth/react";
import { Loader2 } from "lucide-react"; // 로딩 아이콘 추가

// 컴포넌트 라이브러리 임포트
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Share2, Copy, Facebook, MessageCircle } from "lucide-react";

export default function ProfilePanel() {
  // 💡 update 함수 추가
  const { data: session, status, update } = useSession();
  const [tab, setTab] = useState("messages");
  const [shareOpen, setShareOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  // 닉네임/자기소개 상태 초기화
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  // 💡 프로필 저장 관련 상태 추가
  const [editError, setEditError] = useState(null);
  const [editMessage, setEditMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [shareMessage, setShareMessage] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newConfirm, setNewConfirm] = useState("");
  const [error, setError] = useState(null); // 비밀번호 변경 에러 메시지 상태
  const [isChangingPassword, setIsChangingPassword] = useState(false); // 비밀번호 변경 로딩 상태
  const [notificationCount, setNotificationCount] = useState(0); // 알림 개수
  const [notifications, setNotifications] = useState([]); // 알림 목록
  const [chatRooms, setChatRooms] = useState([]); // 채팅방 목록
  const [messageCount, setMessageCount] = useState(0); // 안 읽은 메시지 개수
  const [purchaseRequests, setPurchaseRequests] = useState([]); // 구매 요청 목록
  const [purchaseCount, setPurchaseCount] = useState(0); // 구매 요청 개수

  useEffect(() => {
    if (session?.user) {
      setNickname(session.user.name || "");
      setBio(session.user.bio || "");

      // 알림, 채팅, 구매 요청 가져오기
      fetchNotifications();
      fetchChatRooms();
      fetchPurchaseRequests();
    }
    // 성공 메시지는 잠시 후 사라지게 처리
    if (editMessage || shareMessage) {
      const timer = setTimeout(() => {
        setEditMessage(null);
        setShareMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [session, editMessage, shareMessage]);

  // 탭 변경 시 데이터 새로고침
  useEffect(() => {
    if (!session?.user) return;

    if (tab === "inquiry") {
      fetchPurchaseRequests();
    } else if (tab === "notifications") {
      fetchNotifications();
    } else if (tab === "messages") {
      fetchChatRooms();
    }
  }, [tab]);

  // 구매 요청 가져오기 (통합 API 사용)
  const fetchPurchaseRequests = async () => {
    try {
      const response = await fetch("/api/notifications?type=PURCHASE_REQUEST");
      if (response.ok) {
        const data = await response.json();
        setPurchaseRequests(data.notifications || []);
        setPurchaseCount(data.count || 0);
      }
    } catch (error) {
      console.error("구매 요청 조회 실패:", error);
    }
  };

  // 채팅방 목록 가져오기
  const fetchChatRooms = async () => {
    try {
      const response = await fetch("/api/chat/rooms");

      if (response.ok) {
        const data = await response.json();
        setChatRooms(data.chatRooms || []);
        setMessageCount(data.chatRooms?.length || 0);
      }
    } catch (error) {
      console.error("채팅방 조회 실패:", error);
    }
  };

  // 알림 가져오기 함수 (예약 취소 알림만)
  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        "/api/notifications?type=CANCEL_RESERVATION"
      );
      if (response.ok) {
        const data = await response.json();
        setNotificationCount(data.count);
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("알림 조회 실패:", error);
    }
  };

  // 알림 클릭 핸들러
  const handleNotificationClick = async (notification) => {
    try {
      // 알림 삭제
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: notification.id }),
      });

      // 상품 페이지로 이동
      window.location.href = `/listings/${notification.listingId}`;
    } catch (error) {
      console.error("알림 처리 실패:", error);
    }
  };

  // 구매 요청 클릭 핸들러 (NEW!)
  const handlePurchaseRequestClick = async (request) => {
    try {
      // 알림 삭제
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: request.id }),
      });

      // 상품 페이지로 이동
      window.location.href = `/listings/${request.listingId}`;
    } catch (error) {
      console.error("알림 처리 실패:", error);
    }
  };

  if (status === "loading") return <p>로딩중...</p>;
  // 💡 update 함수가 세션 객체에 존재하지 않을 경우를 대비하여 세션 유효성 검사 순서를 유지합니다.
  if (!session) return <p>로그인이 필요합니다.</p>;

  const trustLevel = 68;
  const trustMax = 100;

  const handleSave = async () => {
    setEditError(null);
    setEditMessage(null);
    setIsSaving(true);

    if (!nickname.trim()) {
      setEditError("닉네임은 필수입니다.");
      setIsSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/users/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nickname,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // 🔥 세션 업데이트 (화면에서 바로 반영됨)
        await update({
          user: {
            ...session.user,
            name: data.user.name,
          },
        });
        setEditMessage("닉네임이 변경되었습니다.");
        setEditOpen(false);
      } else {
        setEditError(data.error || "닉네임 변경 실패");
      }
    } catch (err) {
      console.error("닉네임 저장 중 오류:", err);
      setEditError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };
  // --------------------------------------------------------

  const handleChangePassword = async () => {
    setError(null); // 에러 초기화
    setIsChangingPassword(true);

    // 1차 클라이언트 검증 (Zod 스키마의 refine 로직 중 일부)
    if (newPassword !== newConfirm) {
      setError("새 비밀번호가 일치하지 않습니다.");
      setIsChangingPassword(false);
      return;
    }

    try {
      // 1. 비밀번호 변경 API 호출
      const res = await fetch("/api/users/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          newConfirm,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // 2. API 호출 성공 시 응답 확인
        alert(
          data.message ||
            "비밀번호가 성공적으로 변경되었습니다. 다시 로그인해 주세요."
        );
        setPasswordOpen(false);

        // 3. 단순화된 로직: 서버 응답에 관계없이 성공하면 무조건 로그아웃 실행
        await signOut({ callbackUrl: "/login" });
      } else {
        // 4. 서버 (Zod 검증 또는 DB 로직)에서 온 에러 메시지 표시
        setError(data.message || data.error || "비밀번호 변경에 실패했습니다.");
      }
    } catch (err) {
      console.error("비밀번호 변경 중 네트워크 오류:", err);
      setError("네트워크 오류가 발생했습니다. 서버 상태를 확인해 주세요.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const shareLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => setShareMessage("URL이 클립보드에 복사되었습니다!"))
        .catch(() => setShareMessage("URL 복사에 실패했습니다."));
    } else {
      setShareMessage("브라우저에서 클립보드 접근을 지원하지 않습니다.");
    }
    setShareOpen(false);
  };

  return (
    <div className="flex flex-col w-full mt-3">
      <h1 className="flex w-full text-2xl font-bold mb-4">
        안녕하세요, {session.user?.name || "OOO"}님
      </h1>

      {/* 💡 전역 메시지 표시 (성공/공유 메시지) */}
      {(editMessage || shareMessage) && (
        <div
          className={`p-3 mb-4 text-sm rounded-lg ${
            editMessage
              ? "text-green-700 bg-green-100"
              : "text-blue-700 bg-blue-100"
          }`}
        >
          {editMessage || shareMessage}
        </div>
      )}

      {/* 프로필 카드 */}
      <div className="flex gap-4 h-[350px]">
        <Card className="flex-1 p-2 h-full">
          <CardContent className="flex flex-col justify-around my-5 h-full">
            {/* 프로필 & 닉네임 & */}
            <div className="flex">
              <Avatar className="flex w-20 h-20">
                {session.user?.image ? (
                  <AvatarImage
                    src={session.user.image}
                    alt={session.user.name ?? "프로필"}
                  />
                ) : (
                  <AvatarFallback className="bg-blue-500 text-white font-black">
                    {session.user?.name?.[0] ?? "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex flex-col p-1 ml-3">
                <h1 className="text-3xl font-black">
                  {session.user?.name || (
                    <span className="text-lg text-gray-400">
                      닉네임을 입력해주세요
                    </span>
                  )}
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  {session.user?.email}
                </p>
              </div>
            </div>

            {/* 레벨 & 배지 */}
            <div className="flex mt-5 items-center gap-2">
              <span className="text-sm font-semibold">
                LV.{Math.floor(trustLevel / 10)}
              </span>
              <span className="bg-yellow-400 text-white text-xs px-2 py-1 rounded-full">
                거래왕
              </span>
            </div>

            {/* 신뢰지수 게이지 */}
            <div className="w-full mt-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>신뢰지수</span>
                <span>
                  {trustLevel} / {trustMax}
                </span>
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
              {session.user?.bio || "자기 소개 작성하고 신뢰도를 높여 보세요."}
            </p>

            {/* 버튼 */}
            <div className="flex gap-2 mt-3">
              <Button
                className="flex-1 h-10"
                variant="outline"
                size="sm"
                onClick={() => setEditOpen(true)}
              >
                프로필 수정
              </Button>

              {session.user.hasPassword && (
                <Button
                  className="flex-1 h-10"
                  variant="outline"
                  size="sm"
                  onClick={() => setPasswordOpen(true)}
                >
                  비밀번호 변경
                </Button>
              )}

              <Button
                className="flex-1 h-10"
                variant="outline"
                size="sm"
                onClick={() => setShareOpen(true)}
              >
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

              {/* 에러 메시지 표시 */}
              {editError && <p className="text-sm text-red-500">{editError}</p>}

              <Button
                onClick={handleSave}
                disabled={!nickname.trim() || isSaving} // 닉네임이 없거나 저장 중이면 비활성화
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  "저장"
                )}
              </Button>
              <p className="text-xs text-gray-500">{bio.length}/25</p>
            </div>
          </DialogContent>
        </Dialog>

        {/* 비밀번호 변경 모달 */}
        <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
          <DialogContent className="sm:max-w-md sm:mx-auto">
            <DialogHeader>
              <DialogTitle>비밀번호 변경</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4 mt-4">
              <Input
                type="password"
                placeholder="현재 비밀번호"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="focus-visible:ring-0 focus-visible:border-input"
              />
              <Input
                type="password"
                placeholder="새 비밀번호 (8자 이상)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="focus-visible:ring-0 focus-visible:border-input"
              />
              <Input
                type="password"
                placeholder="새 비밀번호 확인"
                value={newConfirm}
                onChange={(e) => setNewConfirm(e.target.value)}
                required
                className="focus-visible:ring-0 focus-visible:border-input"
              />

              {/* 에러 메시지 표시 */}
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <DialogFooter className="mt-4">
              <Button
                onClick={handleChangePassword}
                disabled={
                  !currentPassword ||
                  !newPassword ||
                  !newConfirm ||
                  newPassword.length < 8 ||
                  isChangingPassword
                }
              >
                {isChangingPassword ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  "비밀번호 변경"
                )}
              </Button>
            </DialogFooter>
            <p className="text-xs text-gray-500">
              비밀번호 변경 후에는 보안을 위해 모든 기기에서 로그아웃됩니다.
            </p>
          </DialogContent>
        </Dialog>

        {/* 공유 모달 */}
        <Dialog open={shareOpen} onOpenChange={setShareOpen}>
          <DialogContent className="w-[350px]">
            <DialogHeader className="mt-4">
              <DialogTitle className="flex justify-center">
                공유하기
              </DialogTitle>
            </DialogHeader>
            <div className="flex justify-center gap-4 py-5">
              <CircleButton>
                <MessageCircle />
              </CircleButton>
              <CircleButton>
                <Facebook />
              </CircleButton>
              <CircleButton onClick={shareLink}>
                <Copy />
              </CircleButton>
            </div>
          </DialogContent>
        </Dialog>

        {/* 탭 */}
        <Tabs
          value={tab}
          onValueChange={setTab}
          className="flex-1 h-full w-full overflow-hidden"
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger
              value="messages"
              className="relative flex justify-center items-center"
            >
              메시지
              {/* 새 메시지 숫자 뱃지 */}
              {messageCount > 0 && (
                <span className="absolute top-0 right-0 -translate-x-1/4 translate-y-1/4 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {messageCount}
                </span>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="notifications"
              className="relative flex justify-center items-center"
            >
              알림
              {/* 새 알림 숫자 뱃지 */}
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 -translate-x-1/4 translate-y-1/4 bg-blue-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {notificationCount}
                </span>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="inquiry"
              className="relative flex justify-center items-center"
            >
              구매 요청
              {/* 구매 요청 숫자 뱃지 */}
              {purchaseCount > 0 && (
                <span className="absolute top-0 right-0 -translate-x-1/4 translate-y-1/4 bg-green-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {purchaseCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabPanel value="messages">
            {chatRooms.length > 0 ? (
              chatRooms.map((room) => (
                <Card
                  key={room.id}
                  className="p-3 cursor-pointer hover:bg-gray-50 transition-all"
                  onClick={() =>
                    (window.location.href = `/chatroom/${room.id}`)
                  }
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {room.otherUserName || "사용자"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {room.lastMessage || "메시지 없음"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {room.updatedAt &&
                          new Date(room.updatedAt).toLocaleDateString("ko-KR", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <MessageCircle className="w-8 h-8 text-gray-400" />
                </div>
                <p className="font-medium">채팅 내역이 없습니다</p>
                <p className="text-sm text-gray-400 mt-1">
                  판매자와 채팅을 시작해보세요
                </p>
              </div>
            )}
          </TabPanel>
          <TabPanel value="notifications">
            {notificationCount > 0 ? (
              notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className="p-3 cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all border-l-4 border-l-blue-500"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg">🎉</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        거래 취소 알림
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        <span className="font-medium">
                          {notification.listing.title}
                        </span>
                        이(가) 다시 판매중입니다!
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-blue-600 font-semibold">
                          {notification.listing.price.toLocaleString()}원
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(notification.createdAt).toLocaleDateString(
                            "ko-KR",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-3xl">🔔</span>
                </div>
                <p className="font-medium">새로운 알림이 없습니다</p>
                <p className="text-sm text-gray-400 mt-1">
                  예약중인 상품의 거래가 취소되면 알려드려요
                </p>
              </div>
            )}
          </TabPanel>
          <TabPanel value="inquiry">
            {purchaseCount > 0 ? (
              purchaseRequests.map((request) => (
                <Card
                  key={request.id}
                  className="p-3 cursor-pointer hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all border-l-4 border-l-green-500"
                  onClick={() => handlePurchaseRequestClick(request)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg">🛒</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">구매 요청</p>
                      <p className="text-sm text-gray-700 mt-1">
                        <span className="font-medium">
                          {request.buyer.name || request.buyer.email}
                        </span>
                        님이{" "}
                        <span className="font-medium">
                          {request.listing.title}
                        </span>
                        을(를) 구매하고 싶어합니다
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-green-600 font-semibold">
                          {request.listing.price.toLocaleString()}원
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(request.createdAt).toLocaleDateString(
                            "ko-KR",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-3xl">🛒</span>
                </div>
                <p className="font-medium">구매 요청이 없습니다</p>
                <p className="text-sm text-gray-400 mt-1">
                  구매 요청이 오면 알려드려요
                </p>
              </div>
            )}
          </TabPanel>
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
      // 💡 w-14 h-14 (56px) 사용 및 hover 효과 추가
      className="w-14 h-14 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors shadow-md"
    >
      {children}
    </button>
  );
}

function TabPanel({ value, children }) {
  return (
    <TabsContent
      value={value}
      className="flex-1 overflow-hidden data-[state=inactive]:hidden"
    >
      <div className="overflow-y-auto h-[270px] space-y-2 pr-2 box-border">
        {children}
      </div>
    </TabsContent>
  );
}
