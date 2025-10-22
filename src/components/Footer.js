export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">마켓플레이스</h3>
            <p className="text-gray-400 text-sm">
              안전하고 편리한 중고거래 플랫폼
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">고객센터</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="/help" className="hover:text-white">
                  자주 묻는 질문
                </a>
              </li>
              <li>
                <a href="/notice" className="hover:text-white">
                  공지사항
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-white">
                  문의하기
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">정책</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="/terms" className="hover:text-white">
                  이용약관
                </a>
              </li>
              <li>
                <a href="/privacy" className="hover:text-white">
                  개인정보처리방침
                </a>
              </li>
              <li>
                <a href="/safe-trade" className="hover:text-white">
                  안전거래 가이드
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 마켓플레이스. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
