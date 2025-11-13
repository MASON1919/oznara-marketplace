"use client";

import Link from "next/link";
import Image from "next/image";
import {
  SearchIcon,
  ShoppingBag,
  Heart,
  MessageCircle,
  User,
  LogOut,
  TrendingUp,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  const [scrolled, setScrolled] = useState(false);

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?query=${encodeURIComponent(q)}&page=1`);
  };

  const handleLogout = () => {
    clearAllRecentlyViewed();
    signOut({ callbackUrl: "/" });
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className={`w-full bg-white/95 backdrop-blur-md transition-all duration-300 ${
        scrolled ? "shadow-lg border-b" : "shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* 상단 행 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-8">
            {/* 맨 왼쪽: NEXTRUNNERS 로고 */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative shrink-0"
            >
              <Image
                src="/joonggoImages/nextrunners-logo.png"
                alt="NEXTRUNNERS"
                width={140}
                height={45}
                className="object-contain"
              />
            </motion.div>

            {/* 오즈나라 로고 */}
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  오즈나라
                </span>
              </motion.div>
            </Link>
          </div>

          {/* 검색바 */}
          <form onSubmit={onSubmit} className="flex-1 max-w-2xl mx-8">
            <div className="relative group">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="오즈나라에서 상품을 검색해보세요..."
                className="pl-12 pr-4 py-3 rounded-full border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm hover:shadow-md"
                autoComplete="off"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                검색
              </Button>
            </div>
          </form>

          {/* 우측 메뉴 */}
          <div className="flex items-center gap-2">
            {session?.user ? (
              <>
                <NavButton href="/upload" icon={<ShoppingBag />}>
                  판매하기
                </NavButton>

                <NavButton
                  href="/chat-list"
                  icon={<MessageCircle />}
                  badge={unreadChatsCount}
                >
                  채팅
                </NavButton>
                <NavButton href="/mypage" icon={<User />}>
                  내정보
                </NavButton>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="rounded-full hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => router.push("/login")}
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                >
                  로그인
                </Button>
                <Button
                  onClick={() => router.push("/signup")}
                  size="sm"
                  className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  회원가입
                </Button>
              </>
            )}
          </div>
        </div>

        {/* 하단 네비게이션 */}
        <div className="flex items-center gap-6">
          <NavigationMenu>
            <NavigationMenuList className="flex items-center gap-0">
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link
                    href="/"
                    className="font-semibold hover:text-blue-600 h-10 flex items-center"
                  >
                    홈
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="font-semibold h-10">
                  카테고리
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <motion.ul
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid w-[250px] gap-2 p-4"
                  >
                    {[
                      {
                        name: "디지털/가전",
                        value: "Electronics",
                        emoji: "💻",
                      },
                      {
                        name: "가구/인테리어",
                        value: "Furniture",
                        emoji: "🛋️",
                      },
                      { name: "패션/잡화", value: "Clothing", emoji: "👕" },
                      { name: "스포츠/레저", value: "Sports", emoji: "⚽" },
                      { name: "도서/취미/게임", value: "Books", emoji: "📚" },
                      { name: "기타", value: "Others", emoji: "🎁" },
                    ].map((category) => (
                      <li key={category.value}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={{
                              pathname: "/search",
                              query: { category: category.value },
                            }}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            <span className="text-xl">{category.emoji}</span>
                            <span className="font-medium">{category.name}</span>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </motion.ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link
                    href="/my/likes"
                    className="font-semibold hover:text-blue-600 h-10 flex items-center gap-1 -translate-y-1.5"
                  >
                    <Heart className="w-4 h-4" />
                    찜한상품
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link
                    href="/search-price"
                    className="font-semibold hover:text-blue-600 h-10 flex items-center gap-1 -translate-y-1.5"
                  >
                    <TrendingUp className="w-4 h-4" />
                    시세조회
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </motion.nav>
  );
}

// 네비게이션 버튼 컴포넌트
function NavButton({ href, icon, badge, children }) {
  return (
    <Link href={href}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative px-3 py-2 rounded-full hover:bg-blue-50 transition-colors flex items-center gap-2 text-sm font-medium"
      >
        {icon}
        <span className="hidden lg:inline">{children}</span>
        {badge > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full text-xs"
          >
            {badge}
          </Badge>
        )}
      </motion.button>
    </Link>
  );
}
