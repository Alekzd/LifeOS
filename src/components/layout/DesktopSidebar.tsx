"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Home, Calendar, Settings, BarChart3, Terminal, Shield, Flame } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

const NAV_ITEMS = [
  { href: "/app", icon: Home, label: "Trang Chủ" },
  { href: "/app/calendar", icon: Calendar, label: "Lịch Tương Tác" },
  { href: "/app/settings", icon: Settings, label: "Cài Đặt & Feedback" },
];

export default function DesktopSidebar() {
  const pathname = usePathname();
  const currentUser = useQuery(api.users.getCurrentUser);

  return (
    <aside className="hidden md:flex flex-col w-60 h-screen sticky top-0 border-r flex-shrink-0 z-40"
      style={{
        background: "oklch(0.14 0.018 260)",
        borderColor: "oklch(0.28 0.035 260)",
      }}>
      {/* Brand Header */}
      <div className="h-14 px-4 border-b flex items-center gap-3"
        style={{ borderColor: "oklch(0.28 0.035 260)" }}>
        <div className="w-8 h-8 flex items-center justify-center bg-emerald-500 text-black font-bold border border-emerald-400">
          <Terminal className="w-4 h-4 stroke-[2.5]" />
        </div>
        <div>
          <span className="font-bold text-sm tracking-tight block text-emerald-400 font-mono">
            LIFE OS
          </span>
          <span className="text-[10px] mono-tag text-gray-400">
            [Terminal Edition]
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto">
        <div className="px-2.5 pb-1.5 text-[10px] font-bold tracking-wider uppercase mono-tag text-gray-400">
          // NAVIGATION
        </div>

        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = href === "/app" ? pathname === "/app" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              id={`desktop-nav-${label.toLowerCase().replace(/ /g, "-")}`}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold mono-tag transition-all border"
              style={{
                background: isActive ? "oklch(0.72 0.22 142 / 0.15)" : "transparent",
                borderColor: isActive ? "oklch(0.72 0.22 142 / 0.4)" : "transparent",
                color: isActive ? "oklch(0.96 0.010 142)" : "oklch(0.70 0.020 260)",
              }}>
              <Icon
                className="w-4 h-4 flex-shrink-0 transition-colors"
                style={{ color: isActive ? "oklch(0.72 0.22 142)" : "oklch(0.55 0.02 260)" }}
              />
              <span>{label}</span>
            </Link>
          );
        })}

        {/* Admin Link (If Admin) */}
        {currentUser?.role === "admin" && (
          <div className="pt-3">
            <div className="px-2.5 pb-1.5 text-[10px] font-bold tracking-wider uppercase mono-tag flex items-center justify-between text-amber-400">
              <span>// SYSTEM ADMIN</span>
              <Shield className="w-3 h-3 text-amber-400" />
            </div>
            <Link
              href="/admin"
              id="desktop-nav-admin"
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold mono-tag transition-all border"
              style={{
                background: pathname.startsWith("/admin") ? "oklch(0.82 0.18 85 / 0.15)" : "transparent",
                borderColor: pathname.startsWith("/admin") ? "oklch(0.82 0.18 85 / 0.4)" : "transparent",
                color: pathname.startsWith("/admin") ? "oklch(0.85 0.18 85)" : "oklch(0.70 0.020 260)",
              }}>
              <BarChart3 className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Admin Analytics</span>
            </Link>
          </div>
        )}
      </div>

      {/* User Profile Summary */}
      <div className="p-2.5 border-t" style={{ borderColor: "oklch(0.28 0.035 260)" }}>
        <div className="flex items-center justify-between gap-2 p-2 border"
          style={{ background: "oklch(0.16 0.02 260)", borderColor: "oklch(0.28 0.035 260)" }}>
          <div className="flex items-center gap-2 min-w-0">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-7 h-7 rounded-none",
                },
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate text-emerald-400 leading-tight">
                {currentUser?.name ?? "Tài Khoản"}
              </p>
              <p className="text-[10px] mono-tag flex items-center gap-1 text-amber-400 leading-tight">
                <Flame className="w-3 h-3 inline" />
                {currentUser?.streakCount ?? 0}d streak
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
