"use client";

import Link from "next/link";
import {
  CircleCheckIcon,
  CircleHelpIcon,
  CircleIcon,
  SearchIcon,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@/components/chat/ChatContext";
import { Badge } from "@/components/ui/badge";
import { clearAllRecentlyViewed } from "@/lib/recentlyViewed";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export function Navbar() {
  const { data: session } = useSession();
  const { unreadChatsCount } = useChat();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?query=${encodeURIComponent(q)}&page=1`);
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    clearAllRecentlyViewed(); // 최근 본 상품 초기화
    signOut({ callbackUrl: "/" }); // 홈으로 리디렉션
  };

  return (
    <div className="flex w-full justify-between bg-white p-4 shadow relative z-100">
      <div>
        <Link href="/">오즈나라</Link>
      </div>
      <div>
        <form
          onSubmit={onSubmit}
          className="flex w-[40vw] items-center gap-2 mb-4"
        >
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="검색어를 입력하세요"
              className="pl-9"
              autoComplete="off"
            />
          </div>
          <Button type="submit" variant="default">
            검색
          </Button>
        </form>
        <NavigationMenu viewport={false}>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
                <Link href="/">홈</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>카테고리</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[200px] gap-4">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href={{
                          pathname: "/search",
                          query: { category: "Electronics" },
                        }}
                        className="flex-row items-center gap-2"
                      >
                        디지털/가전
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href={{
                          pathname: "/search",
                          query: { category: "Furniture" },
                        }}
                        className="flex-row items-center gap-2"
                      >
                        가구/인테리어
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href={{
                          pathname: "/search",
                          query: { category: "Clothing" },
                        }}
                        className="flex-row items-center gap-2"
                      >
                        패션/잡화
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href={{
                          pathname: "/search",
                          query: { category: "Sports" },
                        }}
                        className="flex-row items-center gap-2"
                      >
                        스포츠/레저
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href={{
                          pathname: "/search",
                          query: { category: "Books" },
                        }}
                        className="flex-row items-center gap-2"
                      >
                        도서/취미/게임
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href={{
                          pathname: "/search",
                          query: { category: "Others" },
                        }}
                        className="flex-row items-center gap-2"
                      >
                        기타
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
                <Link href="/my/likes">찜한 상품</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <div>
        {session?.user ? (
          <div className="flex items-center gap-4">
            <Link href="/mypage">내 정보</Link>
            <Link href="/upload">판매하기</Link>
            <span className="text-gray-300">|</span>
            <Link href="/chat-list" className="relative">
              내 채팅
              {unreadChatsCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-5 -top-2 h-5 w-5 flex items-center justify-center rounded-full text-xs"
                >
                  {unreadChatsCount}
                </Badge>
              )}
            </Link>
            <span className="text-gray-300">|</span>
            <button className="cursor-pointer" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <>
            <Link href="/login">Login </Link>
            <Link href="/signup" className="font-bold">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
