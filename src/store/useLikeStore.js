import { create } from "zustand";

export const useLikeStore = create((set, get) => ({
  // 좋아요 상태 저장 { listingId: boolean }
  favorites: {},

  // 초기 데이터 설정 (서버에서 받은 데이터로 초기화)
  initializeFavorites: (listings) => {
    const initialFavorites = listings.reduce((acc, item) => {
      acc[item.id] = item.isLiked || false;
      return acc;
    }, {});
    set({ favorites: initialFavorites });
  },

  // 단일 아이템 좋아요 상태 업데이트
  setFavorite: (listingId, isLiked) =>
    set((state) => ({
      favorites: { ...state.favorites, [listingId]: isLiked },
    })),

  // 좋아요 토글
  toggleFavorite: async (listingId) => {
    const currentState = get().favorites[listingId];
    const newState = !currentState;

    // 1. 먼저 UI 업데이트 (낙관적 업데이트)
    set((state) => ({
      favorites: { ...state.favorites, [listingId]: newState },
    }));

    // 2. API 호출
    try {
      await fetch("/api/like/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, like: newState }),
        cache: "no-store",
      });
    } catch (error) {
      console.error("찜 요청 실패:", error);
      // 실패 시 롤백
      set((state) => ({
        favorites: { ...state.favorites, [listingId]: currentState },
      }));
    }
  },
}));
