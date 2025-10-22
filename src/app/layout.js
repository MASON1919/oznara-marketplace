import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Providers } from "./providers";
import Footer from "@/components/Footer";

export const metadata = {
  title: "OZ Marketplace",
  description: "안전하고 편리한 중고거래 플랫폼 OZ Marketplace",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <header>
            <Navbar />
          </header>
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
