"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * 구매 요청 버튼 컴포넌트
 * 구매자가 상품에 대해 구매 요청을 보낼 수 있습니다
 */
export default function PurchaseRequestButton({
  listingId,
  status,
  hasTransaction,
  isBuyer, // 현재 사용자가 구매자인지 여부
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePurchaseRequest = async () => {
    // 예약 취소 (구매자만 가능)
    if (status === "Reserved" && isBuyer) {
      if (!confirm("예약을 취소하시겠습니까?")) {
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/listings/${listingId}/purchase`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "예약 취소에 실패했습니다.");
        }

        alert("예약이 취소되었습니다.");
        router.refresh();
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    // 구매 요청
    if (hasTransaction) {
      alert("이미 거래가 진행 중인 상품입니다.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/listings/${listingId}/purchase`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "구매 요청에 실패했습니다.");
      }

      alert("구매 요청이 완료되었습니다! 판매자가 확인 후 거래를 진행합니다.");
      router.refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 상태에 따른 버튼 텍스트와 스타일
  const getButtonConfig = () => {
    if (status === "SoldOut") {
      return {
        text: "판매완료",
        disabled: true,
      };
    }
    if (status === "Reserved") {
      // 구매자인 경우에만 예약 취소 가능
      if (isBuyer) {
        return {
          text: "예약 취소",
          disabled: false,
        };
      }
      // 다른 사용자는 예약중 상태만 표시
      return {
        text: "예약중",
        disabled: true,
      };
    }
    return {
      text: "구매 요청",
      disabled: false,
    };
  };

  const config = getButtonConfig();

  return (
    <Button
      onClick={handlePurchaseRequest}
      disabled={config.disabled || loading}
      className={`w-full ${
        status === "Reserved"
          ? "bg-yellow-500 hover:bg-yellow-600"
          : status === "SoldOut"
          ? "bg-gray-400"
          : "bg-green-600 hover:bg-green-700"
      }`}
      size="default"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          처리 중...
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4 mr-2" />
          {config.text}
        </>
      )}
    </Button>
  );
}
