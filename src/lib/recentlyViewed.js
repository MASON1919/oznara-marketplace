// ============================================
// 최근 본 상품 관리 유틸리티
// ============================================

const STORAGE_KEY_PREFIX = "recentlyViewed";
const MAX_ITEMS = 20; // 최대 저장 개수

/**
 * 사용자별 스토리지 키 생성
 */
function getStorageKey(userId) {
  return userId ? `${STORAGE_KEY_PREFIX}_${userId}` : STORAGE_KEY_PREFIX;
}

/**
 * 최근 본 상품 목록 가져오기
 * @param {string} userId - 사용자 ID (옵션)
 */
export function getRecentlyViewed(userId = null) {
  if (typeof window === "undefined") return [];

  try {
    const items = localStorage.getItem(getStorageKey(userId));
    return items ? JSON.parse(items) : [];
  } catch (error) {
    console.error("최근 본 상품 불러오기 실패:", error);
    return [];
  }
}

/**
 * 최근 본 상품에 추가
 * @param {Object} item - 상품 정보 { id, title, price, imageUrl, viewedAt }
 * @param {string} userId - 사용자 ID (옵션)
 */
export function addRecentlyViewed(item, userId = null) {
  if (typeof window === "undefined") return;

  try {
    let items = getRecentlyViewed(userId);

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

    localStorage.setItem(getStorageKey(userId), JSON.stringify(items));

    // 커스텀 이벤트 발생 (다른 컴포넌트에 알림)
    window.dispatchEvent(new Event("recentlyViewedChanged"));
  } catch (error) {
    console.error("최근 본 상품 저장 실패:", error);
  }
}

/**
 * 최근 본 상품에서 제거
 * @param {string} itemId - 상품 ID
 * @param {string} userId - 사용자 ID (옵션)
 */
export function removeRecentlyViewed(itemId, userId = null) {
  if (typeof window === "undefined") return;

  try {
    let items = getRecentlyViewed(userId);
    items = items.filter((i) => i.id !== itemId);
    localStorage.setItem(getStorageKey(userId), JSON.stringify(items));
    window.dispatchEvent(new Event("recentlyViewedChanged"));
  } catch (error) {
    console.error("최근 본 상품 삭제 실패:", error);
  }
}

/**
 * 최근 본 상품 전체 삭제
 * @param {string} userId - 사용자 ID (옵션)
 */
export function clearRecentlyViewed(userId = null) {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(getStorageKey(userId));
    window.dispatchEvent(new Event("recentlyViewedChanged"));
  } catch (error) {
    console.error("최근 본 상품 전체 삭제 실패:", error);
  }
}

/**
 * 모든 사용자의 최근 본 상품 삭제 (로그아웃 시 사용)
 */
export function clearAllRecentlyViewed() {
  if (typeof window === "undefined") return;

  try {
    // localStorage에서 recentlyViewed로 시작하는 모든 키 삭제
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    window.dispatchEvent(new Event("recentlyViewedChanged"));
  } catch (error) {
    console.error("전체 최근 본 상품 삭제 실패:", error);
  }
}
