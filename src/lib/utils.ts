import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | number, lang: "vi" | "en" = "vi"): string {
  const d = typeof date === "number" ? new Date(date) : date;
  return d.toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateKey(date: Date | number): string {
  const d = typeof date === "number" ? new Date(date) : date;
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  return `${year}-${month}-${day}`;
}

export function formatTime(date: Date | number, lang: "vi" | "en" = "vi"): string {
  const d = typeof date === "number" ? new Date(date) : date;
  return d.toLocaleTimeString(lang === "vi" ? "vi-VN" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelative(date: number, lang: "vi" | "en" = "vi"): string {
  const now = Date.now();
  const diff = date - now;
  const absDiff = Math.abs(diff);

  const minutes = Math.floor(absDiff / 60000);
  const hours = Math.floor(absDiff / 3600000);
  const days = Math.floor(absDiff / 86400000);

  if (days === 0) {
    if (hours === 0) {
      if (minutes === 0) return lang === "vi" ? "Hôm nay" : "Today";
      return diff > 0
        ? (lang === "vi" ? `${minutes}p nữa` : `in ${minutes}m`)
        : (lang === "vi" ? `${minutes}p trước` : `${minutes}m ago`);
    }
    return diff > 0
      ? (lang === "vi" ? `${hours}g nữa` : `in ${hours}h`)
      : (lang === "vi" ? `${hours}g trước` : `${hours}h ago`);
  }
  if (days === 1) {
    return diff > 0
      ? (lang === "vi" ? "Ngày mai" : "Tomorrow")
      : (lang === "vi" ? "Hôm qua" : "Yesterday");
  }
  return diff > 0
    ? (lang === "vi" ? `${days} ngày nữa` : `in ${days}d`)
    : (lang === "vi" ? `${days} ngày trước` : `${days}d ago`);
}

export function getStartOfDay(date: Date = new Date()): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function getEndOfDay(date: Date = new Date()): number {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

export function generateShareText(streak: number, referralCode: string, lang: "vi" | "en" = "vi"): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://life-os.pages.dev";
  if (lang === "en") {
    return `🔥 I'm on a ${streak}-day productivity streak with Life OS!\n\nTry it now: ${baseUrl}?ref=${referralCode}`;
  }
  return `🔥 Tôi đã duy trì ${streak} ngày năng suất liên tục với Life OS!\n\nThử ngay tại: ${baseUrl}?ref=${referralCode}`;
}
