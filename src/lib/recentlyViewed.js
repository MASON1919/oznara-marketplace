// ============================================
// 최근 본 상품 관리 유틸리티
// ============================================

const STORAGE_KEY = "recentlyViewed";
const MAX_ITEMS = 20; // 최대 저장 개수

/**
 * 최근 본 상품 목록 가져오기
 */
export function getRecentlyViewed() {
  if (typeof window === "undefined") return [];

  try {
    const items = localStorage.getItem(STORAGE_KEY);
    return items ? JSON.parse(items) : [];
  } catch (error) {
    console.error("최근 본 상품 불러오기 실패:", error);
    return [];
  }
}

/**
 * 최근 본 상품에 추가
 * @param {Object} item - 상품 정보 { id, title, price, imageUrl, viewedAt }
 */
export function addRecentlyViewed(item) {
  if (typeof window === "undefined") return;

  try {
    let items = getRecentlyViewed();

    // 중복 제거 (같은 상품을 다시 보면 맨 앞으로)
    items = items.filter((i) => i.id !== item.id);

    // 맨 앞에 추가
    items.unshift({
      ...item,
      viewedAt: new Date().toISOString(),
    });

    // 최대 개수 제한
    if (items.length > MAX_ITEMS) {
      items = items.slice(0, MAX_ITEMS);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

    // 커스텀 이벤트 발생 (다른 컴포넌트에 알림)
    window.dispatchEvent(new Event("recentlyViewedChanged"));
  } catch (error) {
    console.error("최근 본 상품 저장 실패:", error);
  }
}

/**
 * 최근 본 상품에서 제거
 */
export function removeRecentlyViewed(itemId) {
  if (typeof window === "undefined") return;

  try {
    let items = getRecentlyViewed();
    items = items.filter((i) => i.id !== itemId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("recentlyViewedChanged"));
  } catch (error) {
    console.error("최근 본 상품 삭제 실패:", error);
  }
}

/**
 * 최근 본 상품 전체 삭제
 */
export function clearRecentlyViewed() {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("recentlyViewedChanged"));
  } catch (error) {
    console.error("최근 본 상품 전체 삭제 실패:", error);
  }
}
