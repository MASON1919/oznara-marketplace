"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { ChevronLeft } from "lucide-react";
import { BANKS } from "@/lib/banks";

export default function BankPanel({ onClose, userName = "홍길동", maxAccounts = 1, existingAccounts = [] }) {
    const [bank, setBank] = useState(BANKS[0].code);
    const [currentPage, setCurrentPage] = useState("manage");
    const [accountNumber, setAccountNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [registered, setRegistered] = useState(existingAccounts);
    const [error, setError] = useState("");

    const isMaxReached = registered.length >= maxAccounts;

    function formatAccountInput(value) {
        return value.replace(/[^0-9]/g, "");
    }

    const cancelEdit = () => {
        setCurrentPage("manage");
    };

    async function handleVerify() {
        setError("");
        setResult(null);

        const bankInfo = BANKS.find(b => b.code === bank);
        if (!accountNumber || accountNumber.length !== bankInfo.length) {
            setError(`${bankInfo.name} 계좌는 ${bankInfo.length}자리여야 합니다.`);
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/accounts/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bankCode: bank, accountNumber }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "검증 중 오류가 발생했습니다.");

            if (data.match) {
                setResult({ status: "ok", ownerName: data.ownerName, message: `${data.ownerName}님 명의의 계좌가 확인되었어요.` });
            } else {
                setResult({ status: "mismatch", ownerName: data.ownerName, message: `등록된 회원 정보와 일치하지 않습니다. (${data.ownerName})` });
            }
        } catch (e) {
            setResult({ status: "error", ownerName: null, message: e.message || "서버 오류" });
        } finally {
            setLoading(false);
        }
    }

    async function handleRegister() {
        setError("");

        if (!result || result.status !== "ok") {
            setError("명의 확인이 되지 않은 계좌는 등록할 수 없습니다.");
            return;
        }

        try {
            const res = await fetch("/api/accounts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bankCode: bank, accountNumber }),
            });
            if (!res.ok) {
                const d = await res.json();
                throw new Error(d?.error || "등록 실패");
            }

            const saved = await res.json();
            setRegistered(prev => [...prev, saved]);
            setAccountNumber("");
            setResult(null);
            setCurrentPage("manage"); // 등록 완료 후 관리 페이지로 이동
        } catch (e) {
            setError(e.message);
        }
    }

    function renderResult() {
        if (!result) return null;
        if (result.status === "ok") {
            return (
                <div className="mt-3 p-3 rounded-md border border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        <div>
                            <div className="font-medium">{result.ownerName}님 명의의 계좌가 확인되었어요.</div>
                            <div className="text-sm text-slate-600">이제 등록하실 수 있습니다.</div>
                        </div>
                    </div>
                </div>
            );
        }

        if (result.status === "mismatch") {
            return (
                <div className="mt-3 p-3 rounded-md border border-red-200 bg-red-50">
                    <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        <div>
                            <div className="font-medium">등록된 회원 정보와 일치하지 않아요.</div>
                            <div className="text-sm text-slate-600">확인된 계좌 명의: {result.ownerName || "확인 불가"} · 회원명: {userName}</div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="mt-3 p-3 rounded-md border border-yellow-200 bg-yellow-50">
                <div className="font-medium">오류가 발생했습니다.</div>
                <div className="text-sm text-slate-600">{result.message}</div>
            </div>
        );
    }

    return (
        <Sheet open={true} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full md:max-w-xl">
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
                        {currentPage === "manage" && "계좌 관리"}
                        {currentPage === "add" && "계좌 신규 등록"}
                    </SheetTitle>
                </SheetHeader>

                <div className="p-4 overflow-y-auto h-full">
                    {/* 1️⃣ 관리 페이지 */}
                    {currentPage === "manage" && (
                        <div className="flex flex-col h-full items-center justify-center">
                            {registered.length === 0 ? (

                                <p className="flex  text-sm text-slate-500">등록된 계좌가 없습니다.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {registered.map((r, idx) => (
                                        <li key={idx} className="flex items-center justify-between p-3 border rounded-md">
                                            <span>{r.bankName} • {r.maskedAccount || r.accountNumber}</span>
                                            <span className="text-xs text-slate-500">{r.status || "활성"}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {!isMaxReached && (
                                <Button className="flex mt-4" onClick={() => setCurrentPage("add")}>+ 계좌 등록</Button>
                            )}
                        </div>
                    )}

                    {/* 2️⃣ 계좌 신규 등록 페이지 */}
                    {currentPage === "add" && (
                        <div className="grid grid-cols-12 gap-3 items-end">
                            <div className="col-span-5">
                                <label className="block text-sm font-medium mb-1">은행</label>
                                <select value={bank} onChange={(e) => setBank(e.target.value)} className="w-full rounded-md border px-3 py-2">
                                    {BANKS.map(b => (<option key={b.code} value={b.code}>{b.name}</option>))}
                                </select>
                            </div>

                            <div className="col-span-7">
                                <label className="block text-sm font-medium mb-1">계좌번호</label>
                                <input
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(formatAccountInput(e.target.value))}
                                    placeholder="계좌번호를 입력해주세요"
                                    maxLength={BANKS.find(b => b.code === bank)?.length}
                                    className="w-full rounded-md border px-3 py-2"
                                />
                            </div>

                            <div className="col-span-12 flex gap-2 mt-2">
                                <Button onClick={handleVerify} disabled={loading || isMaxReached}>{loading ? "검증중..." : "계좌 검증"}</Button>
                                <Button onClick={handleRegister} disabled={!result || result.status !== "ok" || isMaxReached} className="ml-auto bg-blue-600 text-white hover:brightness-95 disabled:opacity-50">등록하기</Button>
                            </div>

                            <div className="col-span-12 mt-2">
                                {error && <div className="text-sm text-red-600">{error}</div>}
                                {renderResult()}
                                <div className="mt-3 text-xs text-slate-400">입력하신 계좌는 실시간으로 명의 확인이 진행됩니다.</div>
                            </div>
                        </div>
                    )}
                </div>
            </SheetContent>

        </Sheet>
    );
}
