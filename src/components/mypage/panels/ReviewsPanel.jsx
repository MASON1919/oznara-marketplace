"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { ChevronLeft } from "lucide-react";
import { MessageCircleMore } from "lucide-react";
import React from "react";

export default function ReviewsPanel({ onClose, reviews = [] }) {
    return (
        <Sheet open={true} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full md:max-w-xl">
                <SheetClose className="absolute top-4 left-4 cursor-pointer">
                    <ChevronLeft />
                </SheetClose>
                <SheetHeader className="flex justify-between items-center p-3">
                    <SheetTitle className="mt-1 text-lg">거래 후기</SheetTitle>
                </SheetHeader>

                <div className="p-4 overflow-y-auto h-full flex flex-col gap-4">
                    {reviews.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <MessageCircleMore className="text-gray-300 size-20" />
                            <p className="text-center text-gray-500 mt-4">아직 등록된 후기가 없습니다.</p>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 mt-4">아직 등록된 후기가 없습니다.</p>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
