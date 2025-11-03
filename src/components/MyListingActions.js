"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function MyListings({ myListings = [], s3Urls = [] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState(null);
  const [isPending, startTransition] = useTransition();

  const formatKRW = (n) =>
    typeof n === "number" ? n.toLocaleString("ko-KR") + "원" : n;

  const onDelete = async (id) => {
    setPendingId(id);
    try {
      //userId를 담은 쿼리스트링 생성
      const res = await fetch(`/api/listing?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast("알림", {
          description: "삭제에 실패했습니다.",
          action: {
            label: "닫기",
            onClick: () => console.log("닫기 클릭됨"),
          },
        });
        return;
      }
      startTransition(() => router.refresh());
      toast("알림", {
        description: "삭제에 성공했습니다.",
        action: {
          label: "닫기",
          onClick: () => console.log("닫기 클릭됨"),
        },
      });
    } catch (e) {
      console.error(e);
      toast("알림", {
        description: "삭제에 실패했습니다.",
        action: {
          label: "닫기",
          onClick: () => console.log("닫기 클릭됨"),
        },
      });
    } finally {
      setPendingId(null);
    }
  };
  // 내 정보 페이지에서 내 게시물 클릭 시 해당 게시물로 이동
  const handleProductClick = (listingId) => {
    router.push(`/listings/${listingId}`);
  };

  if (!myListings.length) {
    return (
      <div className="my-16 px-4 flex flex-col items-start w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>내 게시물</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            아직 작성한 게시물이 없습니다.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="my-16 px-4 w-full">
      <h2 className="text-xl font-semibold mb-4">내 게시물</h2>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {myListings.map((item, idx) => {
          const cover = s3Urls[idx] ?? "/placeholder.png"; // placeholder는 프로젝트에 맞게
          const deleting = pendingId === item.id || isPending;
          {
            /* Card 클릭시 handleProductClick 추가함 */
          }
          return (
            <Card
              key={item.id}
              className="overflow-hidden cursor-pointer"
              onClick={() => handleProductClick(item.id)}
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={cover}
                  alt={item.title ?? "cover"}
                  fill
                  sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 25vw"
                  className="object-cover"
                  priority={idx < 4}
                />
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="truncate">{item.title}</CardTitle>
              </CardHeader>

              <CardContent className="pt-0 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>{formatKRW(item.price)}</span>
                  {item.createdAt && (
                    <span>
                      {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex justify-end">
                {/* 수정 버튼이 필요하면 여기 추가 */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deleting}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {deleting ? "삭제 중..." : "삭제"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>정말 삭제하시겠어요?</AlertDialogTitle>
                      <AlertDialogDescription>
                        이 작업은 되돌릴 수 없습니다. 게시물과 관련 데이터가
                        삭제됩니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(item.id)}
                        disabled={deleting}
                      >
                        확인
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
