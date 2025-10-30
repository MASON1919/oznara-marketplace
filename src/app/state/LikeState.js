"use client";
import { create } from "zustand";

export const useLikeState = create((set) => ({
  likedIds: new Set(),

  setLikedIds: (ids) =>
    set({
      likedIds: new Set(ids),
    }),

  addLike: (id) =>
    set((state) => {
      const newSet = new Set(state.likedIds);
      newSet.add(id);
      return { likedIds: newSet };
    }),

  removeLike: (id) =>
    set((state) => {
      const newSet = new Set(state.likedIds);
      newSet.delete(id);
      return { likedIds: newSet };
    }),

  toggleLike: (id) =>
    set((state) => {
      const newSet = new Set(state.likedIds);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return { likedIds: newSet };
    }),
}));
