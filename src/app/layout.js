import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Providers } from "./providers";
import Footer from "@/components/Footer";
import RecentlyViewed from "../components/RecentlyViewed";
import { KakaoMapsScriptProvider } from "@/context/KakaoMapsScriptProvider";

export const metadata = {
  title: "오즈나라 마켓플레이스",
  description: "안전하고 편리한 중고거래 플랫폼 오즈나라 마켓플레이스입니다.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <KakaoMapsScriptProvider>
          <Providers>
            <header>
              <Navbar />
            </header>
            <main>{children}</main>
            <RecentlyViewed />
            <Footer />
          </Providers>
        </KakaoMapsScriptProvider>
      </body>
    </html>
  );
}
