"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetClose,
} from "@/components/ui/sheet";

import { ChevronLeft, MapPinPen } from "lucide-react";

export default function AddressPanel({ onClose }) {
    const [addresses, setAddresses] = useState([]);
    const [currentPage, setCurrentPage] = useState("manage"); // "manage" | "add" | "edit"
    const [editing, setEditing] = useState(null);
    const [isChanged, setIsChanged] = useState(false);

    const [form, setForm] = useState({
        label: "",
        name: "",
        phone: "",
        address: "",
        detail: "",
        isDefault: false,
    });

    // ========================= 공통 함수 =========================
    const resetForm = () =>
        setForm({ label: "", name: "", phone: "", address: "", detail: "", isDefault: false });

    const validateForm = () => {
        if (!form.label || !form.name || !form.phone || !form.address || !form.detail) {
            alert("모든 필드를 입력해주세요.");
            return false;
        }
        return true;
    };

    const updateDefaultAndSort = (list) => {
        let updated = [...list];
        if (!updated.some(a => a.isDefault) && updated.length > 0) updated[0].isDefault = true;
        updated.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
        return updated;
    };

    const cancelEdit = () => {
        resetForm();
        setEditing(null);
        setIsChanged(false);
        setCurrentPage("manage");
    };

    const handleFormChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    // ========================= 주소 CRUD =========================
    const handleAdd = () => {
        if (!validateForm()) return;
        if (addresses.length >= 5) return alert("배송지는 최대 5개까지 등록 가능합니다.");

        const newAddr = { id: Date.now(), ...form, isDefault: form.isDefault || addresses.length === 0 };
        setAddresses(prev => updateDefaultAndSort([...prev, newAddr]));

        resetForm();
        setCurrentPage("manage");
    };

    const handleEditSave = () => {
        if (!editing) return;

        setAddresses(prev => {
            let updated = prev.map(a => (a.id === editing.id ? editing : a));
            if (editing.isDefault) updated = updated.map(a => ({ ...a, isDefault: a.id === editing.id }));
            return updateDefaultAndSort(updated);
        });

        cancelEdit();
    };

    const handleDelete = (id) => {
        if (addresses.length === 1) return;
        const filtered = addresses.filter(a => a.id !== id);
        setAddresses(updateDefaultAndSort(filtered));
        setIsChanged(true);
    };

    const handleSetDefault = (id) => {
        setAddresses(prev => updateDefaultAndSort(prev.map(a => ({ ...a, isDefault: a.id === id }))));
        toast.success("대표 배송지로 설정되었습니다.");
        setIsChanged(true);
    };

    // ========================= 주소 카드 컴포넌트 =========================
    const AddressCard = ({ addr, showActions = false }) => (
        <div className={`p-4.5 rounded-lg bg-white border ${addr.isDefault ? "border-orange-400" : "border-gray-200"}`}>
            <div className="flex justify-between items-center mb-2">
                <div className="font-semibold">
                    <span>{addr.label}</span>
                    {addr.isDefault && (
                        <span className="ml-2 px-1 py-0.5 text-xs border border-orange-300 rounded-xs text-orange-500">
                            대표 배송지
                        </span>
                    )}
                </div>
            </div>
            <p>{addr.name}</p>
            <p>{addr.phone}</p>
            <p>{addr.address} {addr.detail}</p>

            {showActions && (
                <div className="flex space-x-2 mt-2">
                    <Button
                        className="bg-transparent hover:bg-transparent hover:text-gray-600 cursor-pointer text-gray-900 flex-1"
                        onClick={() => handleSetDefault(addr.id)}
                        disabled={addr.isDefault}
                    >
                        대표배송지 설정
                    </Button>
                    <span className="text-gray-200 pt-1">|</span>
                    <Button
                        className="bg-transparent hover:bg-transparent hover:text-gray-600 cursor-pointer text-gray-900 flex-1"
                        variant="destructive"
                        onClick={() => {
                            if (addr.isDefault) toast.error("대표 배송지는 삭제할 수 없습니다.");
                            else handleDelete(addr.id);
                        }}
                    >
                        삭제
                    </Button>
                </div>
            )}
        </div>
    );

    // ========================= 렌더 =========================
    return (
        <Sheet open={true} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full md:max-w-xl z-[1000]">

                {/* 상단 버튼 */}
                {currentPage === "manage" ? (
                    <SheetClose className="absolute top-4 left-4 cursor-pointer">
                        <ChevronLeft />
                    </SheetClose>
                ) : (
                    <button
                        className="absolute top-4 left-4 cursor-pointer"
                        onClick={cancelEdit}
                    >
                        <ChevronLeft />
                    </button>
                )}

                <SheetHeader className="flex justify-between items-center p-3">
                    <SheetTitle className="mt-1 text-lg">
                        {currentPage === "manage" && "배송지 관리"}
                        {currentPage === "add" && "배송지 추가"}
                        {currentPage === "edit" && "배송지 편집"}
                    </SheetTitle>
                </SheetHeader>
                {/* 관리 페이지 */}
                {addresses.length > 0 && currentPage === "manage" && (
                    <div className="mr-2 flex justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-transparent hover:text-gray-600 cursor-pointer text-gray-500"
                            onClick={() => {
                                setEditing(addresses[addresses.length - 1]);
                                setCurrentPage("edit");
                            }}
                        >
                            <MapPinPen />편집
                        </Button>
                    </div>
                )}

                <div className="px-4 overflow-y-auto h-full">
                    {currentPage === "manage" && (
                        <div className="space-y-2">
                            {addresses.length === 0 && (
                                <p className="text-center text-gray-500">등록된 배송지가 없습니다.</p>
                            )}
                            {addresses.map(addr => <AddressCard key={addr.id} addr={addr} />)}

                            <div className="flex justify-center mt-2">
                                <Button className="h-12 text-sm w-full" onClick={() => setCurrentPage("add")}>
                                    + 배송지 추가
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* 추가 페이지 */}
                    <div className="h-full">
                        {currentPage === "add" && (
                            <div className="flex flex-col h-full space-y-3">
                                <Input
                                    placeholder="배송지명 (최대 10글자)"
                                    maxLength={10}
                                    value={form.label}
                                    className="h-12 focus-visible:ring-0 focus-visible:border-input"
                                    onChange={e => handleFormChange("label", e.target.value)}
                                />
                                <Input
                                    placeholder="이름"
                                    maxLength={10}
                                    value={form.name}
                                    className="h-12 focus-visible:ring-0 focus-visible:border-input"
                                    onChange={e => handleFormChange("name", e.target.value)}
                                />
                                <Input
                                    placeholder="전화번호 (-없이 숫자만 입력)"
                                    inputMode="numeric"
                                    maxLength={11}
                                    value={form.phone}
                                    className="h-12 focus-visible:ring-0 focus-visible:border-input"
                                    onChange={e => handleFormChange("phone", e.target.value.replace(/[^0-9]/g, ""))}
                                />
                                <Input
                                    placeholder="주소검색"
                                    value={form.address}
                                    className="h-12 focus-visible:ring-0 focus-visible:border-input"
                                    onChange={e => handleFormChange("address", e.target.value)}
                                />
                                <Input
                                    placeholder="상세주소 (예: 101동 101호)"
                                    value={form.detail}
                                    className="h-12 focus-visible:ring-0 focus-visible:border-input"
                                    onChange={e => handleFormChange("detail", e.target.value)}
                                />
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        checked={form.isDefault}
                                        onCheckedChange={checked => handleFormChange("isDefault", checked)}
                                        className="w-4.5 h-4.5 bg-neutral-100 rounded-full"
                                    />
                                    <span className="text-sm">대표 배송지로 설정</span>
                                </div>
                                <div className="flex pb-2 space-x-2 mt-auto">
                                    <Button className="h-12 text-md w-full" onClick={handleAdd}>
                                        완료
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 편집 페이지 */}
                    {currentPage === "edit" && editing && (
                        <div className="space-y-2 overflow-y-auto h-full">
                            {addresses.map(addr => (
                                <AddressCard key={addr.id} addr={addr} showActions={true} />
                            ))}

                            <div className="flex space-x-2 mt-auto">
                                <Button
                                    className="h-12 text-sm w-full"
                                    onClick={handleEditSave}
                                    disabled={!isChanged}
                                >
                                    편집 완료
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
                <Toaster />
            </SheetContent>
        </Sheet>
    );
}
