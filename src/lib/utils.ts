import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | number): string {
  const d = typeof date === "number" ? new Date(date) : date;
  return d.toLocaleDateString("vi-VN", {
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

export function formatTime(date: Date | number): string {
  const d = typeof date === "number" ? new Date(date) : date;
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelative(date: number): string {
  const now = Date.now();
  const diff = date - now;
  const absDiff = Math.abs(diff);

  const minutes = Math.floor(absDiff / 60000);
  const hours = Math.floor(absDiff / 3600000);
  const days = Math.floor(absDiff / 86400000);

  if (days === 0) {
    if (hours === 0) {
      if (minutes === 0) return "Hôm nay";
      return diff > 0 ? `${minutes}p nữa` : `${minutes}p trước`;
    }
    return diff > 0 ? `${hours}g nữa` : `${hours}g trước`;
  }
  if (days === 1) return diff > 0 ? "Ngày mai" : "Hôm qua";
  return diff > 0 ? `${days} ngày nữa` : `${days} ngày trước`;
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

export function generateShareText(streak: number, referralCode: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://life-os.pages.dev";
  return `🔥 Tôi đã duy trì ${streak} ngày năng suất liên tục với Life OS!\n\nThử ngay tại: ${baseUrl}?ref=${referralCode}`;
}
