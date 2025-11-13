"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NotificationToast() {
  const { data: session } = useSession();
  const router = useRouter();
  const shownNotifications = useRef(new Set());

  // 주기적으로 알림 확인 (30초마다)
  useEffect(() => {
    if (!session) return;

    const checkNotifications = async () => {
      try {
        const response = await fetch("/api/notifications");
        if (response.ok) {
          const data = await response.json();

          // 아직 보여주지 않은 알림만 표시
          const newNotifications = data.notifications.filter(
            (n) => !shownNotifications.current.has(n.id)
          );

          newNotifications.forEach((notification) => {
            shownNotifications.current.add(notification.id);

            // 알림 타입에 따라 다른 메시지 표시
            if (notification.type === "CANCEL_RESERVATION") {
              // 예약 취소 알림
              toast.success(
                `🎉 ${notification.listing.title}이(가) 다시 판매중입니다!`,
                {
                  description: `${notification.listing.price.toLocaleString()}원 · 지금 바로 확인하세요!`,
                  duration: 5000,
                  action: {
                    label: "보러가기",
                    onClick: async () => {
                      await fetch("/api/notifications", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          notificationId: notification.id,
                        }),
                      });
                      router.push(`/listings/${notification.listingId}`);
                    },
                  },
                }
              );
            } else if (notification.type === "PURCHASE_REQUEST") {
              // 구매 요청 알림
              toast.info(
                `🛒 ${notification.buyer?.name || "구매자"}님의 구매 요청`,
                {
                  description: `${notification.listing.title} · 마이페이지에서 확인하세요!`,
                  duration: 5000,
                  action: {
                    label: "확인하기",
                    onClick: async () => {
                      // 알림 삭제
                      await fetch("/api/notifications", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          notificationId: notification.id,
                        }),
                      });
                      router.push(`/mypage`);
                    },
                  },
                }
              );
            }
          });
        }
      } catch (error) {
        console.error("알림 확인 실패:", error);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 30000); // 30초마다

    return () => clearInterval(interval);
  }, [session, router]);

  return null;
}
