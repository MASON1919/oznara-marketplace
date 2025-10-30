"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

import AddressPanel from "./panels/AddressPanel";
import BankPanel from "./panels/BankPanel";
import SalesPanel from "./panels/SalesPanel";
import PurchasesPanel from "./panels/PurchasesPanel";
import DeliveryPanel from "./panels/DeliveryPanel";
import WishlistPanel from "./panels/WishlistPanel";
import EscrowPanel from "./panels/EscrowPanel";
import ReviewsPanel from "./panels/ReviewsPanel";
import DeleteAccountPanel from "./panels/DeleteAccountPanel";

const menuItemsTop = [
    { label: "판매내역", key: "sales" },
    { label: "구매내역", key: "purchases" },
    { label: "택배", key: "delivery" },
    { label: "찜한 상품", key: "wishlist" },
    { label: "안심결제 정산내역", key: "escrow" },
];

const menuItemsBottom = [
    { label: "계좌 관리", key: "bank" },
    { label: "배송지 관리", key: "address" },
    { label: "거래 후기", key: "reviews" },
    { label: "탈퇴하기", key: "delete" },
];

export default function DashboardWithSidebar() {
    const [openPanel, setOpenPanel] = useState(null);

    const SidebarMenu = ({ items }) => (
        items.map(item => (
            <li key={item.key}>
                <Button
                    variant="ghost"
                    size="md"
                    className="hover:bg-transparent cursor-pointer w-full justify-start"
                    onClick={() => setOpenPanel(item.key)}
                >
                    {item.label}
                </Button>
            </li>
        ))
    );

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 p-4 bg-white">
                <h1 className="text-2xl font-bold mb-6">마이페이지</h1>
                <ScrollArea className="h-full">
                    <ul className="space-y-2">
                        <li className="py-1 text-xl font-semibold">거래 정보</li>
                        <SidebarMenu items={menuItemsTop} />
                        <hr className="my-6 mx-1" />
                        <li className="py-1 text-xl font-semibold">내 정보</li>
                        <SidebarMenu items={menuItemsBottom} />
                    </ul>
                </ScrollArea>
            </aside>

            {/* 각 패널 */}
            {openPanel === "sales" && <SalesPanel onClose={() => setOpenPanel(null)} />}
            {openPanel === "purchases" && <PurchasesPanel onClose={() => setOpenPanel(null)} />}
            {openPanel === "delivery" && <DeliveryPanel onClose={() => setOpenPanel(null)} />}
            {openPanel === "wishlist" && <WishlistPanel onClose={() => setOpenPanel(null)} />}
            {openPanel === "escrow" && <EscrowPanel onClose={() => setOpenPanel(null)} />}
            {openPanel === "bank" && <BankPanel onClose={() => setOpenPanel(null)} />}
            {openPanel === "address" && <AddressPanel onClose={() => setOpenPanel(null)} />}
            {openPanel === "reviews" && <ReviewsPanel onClose={() => setOpenPanel(null)} />}
            {openPanel === "delete" && <DeleteAccountPanel onClose={() => setOpenPanel(null)} />}
        </div>
    );
}
