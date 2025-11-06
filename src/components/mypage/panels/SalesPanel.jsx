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

const LISTING_STATUS_LABELS = {
  OnSale: "판매중",
  Reserved: "예약중",
  SoldOut: "판매완료",
};

export default function SalesPanel({ onClose }) {
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await fetch("/api/mypage/sales");
      if (!response.ok) {
        throw new Error("판매 내역을 불러오는데 실패했습니다.");
      }
      const data = await response.json();
      console.log("판매 내역 데이터:", data);
      setListings(data.listings);
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

  const handleStatusChange = async (
    listingId,
    newStatus,
    currentTransaction
  ) => {
    try {
      if (
        newStatus === "SoldOut" &&
        (!currentTransaction || currentTransaction.status !== "Pending")
      ) {
        alert("예약 중인 거래만 완료할 수 있습니다.");
        return;
      }

      const response = await fetch(`/api/listings/${listingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "상태 변경에 실패했습니다.");
      }

      fetchSales();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full md:max-w-xl z-[1000]">
        <SheetClose className="absolute top-4 left-4 cursor-pointer">
          <ChevronLeft />
        </SheetClose>
        <SheetHeader className="flex justify-between items-center p-3">
          <SheetTitle className="mt-1 text-lg">판매내역</SheetTitle>
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
          ) : listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Package className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">판매 중인 상품이 없습니다</p>
              <p className="text-sm text-gray-400 mt-2">상품을 등록해보세요!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all"
                >
                  <div
                    onClick={() => handleListingClick(listing.id)}
                    className="flex gap-4 cursor-pointer"
                  >
                    <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      {listing.imageUrl ? (
                        <>
                          <Image
                            src={listing.imageUrl}
                            alt={listing.title}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                          <div className="absolute top-1 left-1">
                            <span
                              className={`inline-block px-2 py-0.5 text-xs font-bold rounded shadow-md ${
                                listing.status === "OnSale"
                                  ? "bg-blue-600 text-white"
                                  : listing.status === "Reserved"
                                  ? "bg-yellow-500 text-white"
                                  : "bg-gray-600 text-white"
                              }`}
                            >
                              {LISTING_STATUS_LABELS[listing.status]}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {listing.title}
                      </h3>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {listing.price.toLocaleString()}원
                      </p>

                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <span>조회 {listing.viewCount}</span>
                        <span>·</span>
                        <span>찜 {listing.likeCount}</span>
                      </div>

                      {listing.transaction &&
                        listing.transaction[0] &&
                        listing.transaction[0].buyer && (
                          <div className="mt-2 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded inline-block">
                            구매자:{" "}
                            {listing.transaction[0].buyer.name ||
                              listing.transaction[0].buyer.email}
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(
                          listing.id,
                          "OnSale",
                          listing.transaction[0]
                        );
                      }}
                      disabled={listing.status === "OnSale"}
                      className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                        listing.status === "OnSale"
                          ? "bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed"
                          : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:border-red-300"
                      }`}
                    >
                      거래취소
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(
                          listing.id,
                          "SoldOut",
                          listing.transaction[0]
                        );
                      }}
                      disabled={
                        listing.status === "SoldOut" ||
                        listing.status === "OnSale"
                      }
                      className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                        listing.status === "SoldOut"
                          ? "bg-gray-500 text-white shadow-md cursor-default"
                          : listing.status === "OnSale"
                          ? "bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed"
                          : "bg-yellow-50 text-yellow-800 border border-yellow-300 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                      }`}
                    >
                      {listing.status === "OnSale"
                        ? "구매요청 대기중"
                        : "거래완료"}
                    </button>
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
