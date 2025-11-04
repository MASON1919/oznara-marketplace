"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { ChevronLeft, Package, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const TRANSACTION_STATUS_LABELS = {
  Pending: "예약중",
  Completed: "거래완료",
  Canceled: "거래취소",
};

const TRANSACTION_STATUS_COLORS = {
  Pending: "bg-yellow-500 text-white",
  Completed: "bg-green-600 text-white",
  Canceled: "bg-gray-600 text-white",
};

export default function PurchasesPanel({ onClose }) {
  const router = useRouter();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await fetch("/api/mypage/purchases");
      if (!response.ok) {
        throw new Error("구매 내역을 불러오는데 실패했습니다.");
      }
      const data = await response.json();
      console.log("구매 내역 데이터:", data);
      setPurchases(data.purchases);
    } catch (err) {
      console.error("에러:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleListingClick = (listingId) => {
    router.push(`/listings/${listingId}`);
    onClose();
  };

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full md:max-w-xl z-[1000]">
        <SheetClose className="absolute top-4 left-4 cursor-pointer">
          <ChevronLeft />
        </SheetClose>
        <SheetHeader className="flex justify-between items-center p-3">
          <SheetTitle className="mt-1 text-lg">구매내역</SheetTitle>
        </SheetHeader>

        <div className="p-4 overflow-y-auto h-[calc(100vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-red-600">
              {error}
            </div>
          ) : purchases.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Package className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">구매 내역이 없습니다</p>
              <p className="text-sm text-gray-400 mt-2">상품을 구매해보세요!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  onClick={() => handleListingClick(purchase.listing.id)}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="flex gap-4">
                    {/* 상품 이미지 */}
                    <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      {purchase.listing.imageUrl ? (
                        <>
                          <Image
                            src={purchase.listing.imageUrl}
                            alt={purchase.listing.title}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                          {/* 거래 상태 뱃지 */}
                          <div className="absolute top-1 left-1">
                            <span
                              className={`inline-block px-2 py-0.5 text-xs font-bold rounded shadow-md ${
                                TRANSACTION_STATUS_COLORS[purchase.status]
                              }`}
                            >
                              {TRANSACTION_STATUS_LABELS[purchase.status]}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* 상품 정보 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {purchase.listing.title}
                      </h3>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {purchase.listing.price.toLocaleString()}원
                      </p>

                      {/* 판매자 정보 */}
                      <div className="mt-2 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded inline-block">
                        판매자: {purchase.seller.name || purchase.seller.email}
                      </div>

                      {/* 거래 일자 */}
                      <div className="mt-2 text-xs text-gray-500">
                        {new Date(purchase.createdAt).toLocaleDateString(
                          "ko-KR",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
