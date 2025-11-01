"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { ChevronLeft } from "lucide-react";

export default function DeliveryPanel({ onClose }) {
  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full md:max-w-xl z-[9999]">
        <SheetClose className="absolute top-4 left-4 cursor-pointer z-[10000]">
          <ChevronLeft />
        </SheetClose>
        <SheetHeader>
          <SheetTitle className="mt-1 text-lg">택배</SheetTitle>
        </SheetHeader>
        <div className="p-4 overflow-y-auto h-full">
          <p>여기는 택배 패널입니다.</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
