"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { ChevronLeft } from "lucide-react";
import LikedItemsList from "@/components/LikedItemsList";

export default function WishlistPanel({ onClose }) {
    const [likesData, setLikesData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchWishlist() {
            try {
                const res = await fetch("/api/users/likes", { cache: "no-store" });
                const data = await res.json();
                setLikesData(data);
            } catch (error) {
                console.error("Wishlist fetch error:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchWishlist();
    }, []);

    return (
        <Sheet open={true} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full md:max-w-xl">
                <SheetClose className="absolute top-4 left-4 cursor-pointer">
                    <ChevronLeft />
                </SheetClose>
                <SheetHeader className="flex justify-between items-center p-3">
                    <SheetTitle className="mt-1 text-lg">찜한 상품</SheetTitle>
                </SheetHeader>

                <div className="p-4 overflow-y-auto h-full">
                    {loading && <p className="text-center text-gray-500">불러오는 중...</p>}

                    {!loading && likesData && (
                        <LikedItemsList likes={likesData.likes} s3Urls={likesData.s3Urls}
                            className="!grid-cols-3" />
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
