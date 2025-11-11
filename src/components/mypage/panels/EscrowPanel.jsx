"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { ChevronLeft } from "lucide-react";

export default function EscrowPanel({ onClose }) {
    return (
        <Sheet open={true} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full md:max-w-xl z-[1000]">
                <SheetClose className="absolute top-4 left-4 cursor-pointer">
                    <ChevronLeft />
                </SheetClose>
                <SheetHeader className="flex justify-between items-center p-3">
                    <SheetTitle className="mt-1 text-lg">패널 제목</SheetTitle>
                </SheetHeader>
                <div className="p-4 overflow-y-auto h-full">
                    <p>여기는 패널 내용입니다.</p>
                </div>
            </SheetContent>
        </Sheet>
    );
}
