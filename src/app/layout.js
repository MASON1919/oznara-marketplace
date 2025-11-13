import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Providers } from "./providers";
import Footer from "@/components/Footer";
import RecentlyViewed from "../components/RecentlyViewed";
import { KakaoMapsScriptProvider } from "@/context/KakaoMapsScriptProvider";
import { Toaster } from "@/components/ui/sonner";
import FooterGate from "@/components/FooterGate";
import NotificationToast from "@/components/NotificationToast";

export const metadata = {
  title: "오즈나라 마켓플레이스",
  description: "안전하고 편리한 중고거래 플랫폼 오즈나라 마켓플레이스입니다.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="bg-gray-50">
        <KakaoMapsScriptProvider>
          <Providers>
            <Toaster richColors position="top-center" />
            <NotificationToast />

            {/* 헤더 - 고정 + 그림자 */}
            <header className="sticky top-0 z-50 bg-white shadow-sm">
              <Navbar />
            </header>

            {/* 메인 컨텐츠 - 여백 추가 */}
            <main className="min-h-screen pb-20">
              {/* 컨텐츠 컨테이너 */}
              <div className="mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
            </main>

            {/* 최근 본 상품 - 고정 위치 */}
            <div className="fixed bottom-24 right-6 z-40">
              <RecentlyViewed />
            </div>

            {/* 푸터 */}
            <FooterGate>
              <Footer />
            </FooterGate>
          </Providers>
        </KakaoMapsScriptProvider>
      </body>
    </html>
  );
}
