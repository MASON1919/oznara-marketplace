"use client";
import { useState, useRef, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart, MapPin, Truck, ChevronRight } from "lucide-react";

export default function PurchaseForm({ listingInfo, initialLike }) {
  console.log("Initial Like:", initialLike);
  const [shippingFee, setShippingFee] = useState(0);
  const [notes, setNotes] = useState("");
  const [fav, setFav] = useState(false);
  const [totalPrice, setTotalPrice] = useState(listingInfo.price);
  const [location, setLocation] = useState("");
  const [condition, setCondition] = useState("used");
  const [method, setMethod] = useState(listingInfo.method);

  const desiredRef = useRef(initialLike);
  const timerRef = useRef(null);
  const controllerRef = useRef(null);

  useEffect(() => {
    if (method === "Delivery") setMethod("택배거래");
    else if (method === "Direct") setMethod("직거래");
    else setMethod("택배거래 혹은 직거래");
  }, []);

  // 디바운스로 클릭 연타하는거 막기
  const scheduleUpdate = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(sendRequest, 1000);
  };

  const sendRequest = async () => {
    clearTimeout(timerRef.current);
    timerRef.current = null;

    controllerRef.current?.abort();
    controllerRef.current = new AbortController();

    const like = desiredRef.current;

    try {
      await fetch("/api/like/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: listingInfo.id, like }),
        signal: controllerRef.current.signal,
        cache: "no-store",
      });
    } catch (error) {
      console.error("찜 요청 실패:", error);
      // 실패 시 롤백
      const rollback = !like;
      setFav(rollback);
      desiredRef.current = rollback;
    }
  };

  const handleFavorite = () => {
    const next = !desiredRef.current;
    desiredRef.current = next;
    setFav(next); // UI 즉시 반영
    scheduleUpdate(); // 네트워크 요청은 디바운스
  };

  const handleBuy = () => {
    onSubmit &&
      onSubmit({
        title,
        price,
        method,
        shippingFee,
        location,
        condition,
        notes,
        totalPrice,
      });
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
          {/* 임시로 하드코딩*/}
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
                  {method}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="grid gap-5">
                {method !== "직거래" && (
                  <div className="rounded-xl border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-medium">
                        <Truck className="h-4 w-4" />
                        택배거래
                      </div>
                      <RadioGroup
                        value={listingInfo.method}
                        onValueChange={(v) => setMethod(v)}
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
                {method !== "택배거래" && (
                  <div
                    className={cn(
                      "rounded-xl border p-4",
                      listingInfo.method === "direct" && "ring-1 ring-ring/30"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-medium">
                        <MapPin className="h-4 w-4" />
                        직거래
                      </div>
                      <RadioGroup
                        value={listingInfo.method}
                        onValueChange={(v) => setMethod(v)}
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
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="찜"
          onClick={handleFavorite}
          className={cn(
            "rounded-full border",
            desiredRef.current && "text-red-500 border-red-300"
          )}
        >
          <Heart
            className={cn("h-5 w-5", desiredRef.current && "fill-current")}
          />
        </Button>
        <Button
          type="button"
          className="flex-1 h-12 text-base"
          onClick={handleBuy}
        >
          구매하기
        </Button>
      </CardFooter>
    </Card>
  );
}
