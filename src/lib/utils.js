import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// 주어진 날짜 문자열을 'X분 전', 'X시간 전'과 같은 상대 시간 형식으로 변환하는 유틸리티 함수
export function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  let interval = seconds / 31536000; // years
  if (interval > 1) {
    return Math.floor(interval) + "년 전";
  }
  interval = seconds / 2592000; // months
  if (interval > 1) {
    return Math.floor(interval) + "개월 전";
  }
  interval = seconds / 86400; // days
  if (interval > 1) {
    return Math.floor(interval) + "일 전";
  }
  interval = seconds / 3600; // hours
  if (interval > 1) {
    return Math.floor(interval) + "시간 전";
  }
  interval = seconds / 60; // minutes
  if (interval > 1) {
    return Math.floor(interval) + "분 전";
  }
  return Math.floor(seconds) + "초 전";
}
