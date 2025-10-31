// app/components/LikesBootstrap.tsx
"use client";
import { useEffect, useRef } from "react";
import { useLikeState } from "@/app/state/LikeState";

export default function LikesBootstrap() {
  const once = useRef(false);
  const setLikedIds = useLikeState((s) => s.setLikedIds);

  return null; // UI 없음
}
