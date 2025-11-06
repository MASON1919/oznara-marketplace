"use client";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Heart, MapPin, Truck } from "lucide-react";
import { useLikeStore } from "../../store/useLikeStore";
import PurchaseRequestButton from "./PurchaseRequestButton";
import ChatButton from "../ChatButton";

export default function PurchaseForm({
  listingInfo,
  initialLike,
  status,
  hasTransaction,
  isSeller,
}) {
  // ============================================
  // Zustand store에서 상태와 액션 가져오기
  // ============================================
  const favorites = useLikeStore((state) => state.favorites);
  const setFavorite = useLikeStore((state) => state.setFavorite);
  const toggleFavorite = useLikeStore((state) => state.toggleFavorite);

  // ============================================
  // 초기 좋아요 상태 설정
  // ============================================
  useEffect(() => {
    // 서버에서 받은 initialLike로 store 초기화
    setFavorite(listingInfo.id, initialLike);
  }, [listingInfo.id, initialLike, setFavorite]);

  // 현재 상품의 좋아요 상태
  const isLiked = favorites[listingInfo.id] || false;

  // ============================================
  // 거래 방법 한글 변환
  // ============================================
  const getMethodText = (method) => {
    if (method === "Delivery") return "택배거래";
    if (method === "Direct") return "직거래";
    return "택배거래 혹은 직거래";
  };

  // ============================================
  // 좋아요 토글 핸들러
  // ============================================
  const handleFavorite = async () => {
    if (isSeller) {
      alert("본인 상품에는 좋아요를 할 수 없습니다");
      return;
    }
    await toggleFavorite(listingInfo.id);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl rounded-2xl">
      <CardHeader className="gap-1">
        <CardTitle className="text-2xl leading-tight">
          {listingInfo.title}
        </CardTitle>
        <div className="text-3xl font-extrabold tracking-tight">
          {listingInfo.price.toLocaleString()}원
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          <span>3분 전</span>
          <span className="mx-2">·</span>
          <span>조회 {listingInfo.viewCount}</span>
          <span className="mx-2">·</span>
          <span>찜 {listingInfo.likeCount}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 거래 방법 */}
        <Accordion
          type="single"
          collapsible
          defaultValue="method"
          className="border rounded-xl bg-card"
        >
          <AccordionItem value="method" className="px-3">
            <AccordionTrigger className="text-base font-semibold">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="rounded-md">
                  {getMethodText(listingInfo.method)}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="grid gap-5">
                {/* 택배거래 */}
                {listingInfo.method !== "Direct" && (
                  <div className="rounded-xl border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-medium">
                        <Truck className="h-4 w-4" />
                        택배거래
                      </div>
                      <RadioGroup
                        value={listingInfo.method}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={listingInfo.method}
                            id="Delivery"
                          />
                          <Label htmlFor="Delivery">선택</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="shipping-fee">배송비</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-muted-foreground">
                            0 원
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 직거래 */}
                {listingInfo.method !== "Delivery" && (
                  <div
                    className={cn(
                      "rounded-xl border p-4",
                      listingInfo.method === "Direct" && "ring-1 ring-ring/30"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-medium">
                        <MapPin className="h-4 w-4" />
                        직거래
                      </div>
                      <RadioGroup
                        value={listingInfo.method}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={listingInfo.method}
                            id="direct"
                          />
                          <Label htmlFor="direct">선택</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="location">만남 위치</Label>
                        <div className="mt-2 flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            type="button"
                            className="shrink-0"
                          >
                            지도
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Separator />
      </CardContent>

      <CardFooter className="flex items-center gap-3">
        {/* ============================================
            좋아요 버튼 (Zustand로 관리)
            ============================================ */}
        <Button
          disabled={isSeller}
          type="button"
          variant="ghost"
          size="icon"
          aria-label="찜"
          onClick={handleFavorite}
          className={cn(
            "rounded-full border",
            isLiked && "text-red-500 border-red-300"
          )}
        >
          <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
        </Button>
        {/* ============================================
            구매 요청/상태 버튼과 채팅 버튼
            ============================================ */}
        <div className="flex-1 flex gap-3">
          <div className="flex-1">
            <PurchaseRequestButton
              listingId={listingInfo.id}
              status={status}
              hasTransaction={hasTransaction}
              isSeller={isSeller}
            />
          </div>
          <div className="flex-1">
            <ChatButton
              sellerId={listingInfo.userId}
              listingId={listingInfo.id}
            />
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
