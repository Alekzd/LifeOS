"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Home, Calendar, Settings, BarChart3 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

const NAV_ITEMS = [
  { href: "/app", icon: Home, label: "Trang chủ" },
  { href: "/app/calendar", icon: Calendar, label: "Lịch" },
  { href: "/app/settings", icon: Settings, label: "Cài đặt" },
];

export default function MobileNav() {
  const pathname = usePathname();
  const currentUser = useQuery(api.users.getCurrentUser);

  return (
    <nav className="mobile-nav md:hidden border-t" style={{ borderColor: "oklch(0.28 0.035 260)" }}>
      <div className="flex items-center justify-around px-1 py-1.5">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = href === "/app" ? pathname === "/app" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              id={`nav-${label.toLowerCase().replace(" ", "-")}`}
              className="flex flex-col items-center gap-1 px-3 py-1.5 transition-all touch-target border"
              style={{
                background: isActive ? "oklch(0.72 0.22 142 / 0.15)" : "transparent",
                borderColor: isActive ? "oklch(0.72 0.22 142 / 0.4)" : "transparent",
                minHeight: "var(--touch-target)",
                minWidth: "60px",
              }}>
              <Icon
                className="w-5 h-5"
                style={{ color: isActive ? "oklch(0.78 0.22 142)" : "oklch(0.55 0.015 260)" }}
              />
              <span className="text-[11px] font-semibold mono-tag"
                style={{ color: isActive ? "oklch(0.96 0.01 142)" : "oklch(0.50 0.015 260)" }}>
                {label}
              </span>
            </Link>
          );
        })}

        {/* Admin link if user is admin */}
        {currentUser?.role === "admin" && (
          <Link
            href="/admin"
            id="nav-admin"
            className="flex flex-col items-center gap-1 px-3 py-1.5 transition-all touch-target border"
            style={{
              background: pathname.startsWith("/admin") ? "oklch(0.82 0.18 85 / 0.15)" : "transparent",
              borderColor: pathname.startsWith("/admin") ? "oklch(0.82 0.18 85 / 0.4)" : "transparent",
              minHeight: "var(--touch-target)",
              minWidth: "60px",
            }}>
            <BarChart3
              className="w-5 h-5 text-amber-400"
            />
            <span className="text-[11px] font-semibold mono-tag text-amber-400">
              Admin
            </span>
          </Link>
        )}

        {/* User avatar */}
        <div className="flex flex-col items-center gap-1 px-2 py-1 touch-target justify-center">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-6 h-6 rounded-none",
              },
            }}
          />
          <span className="text-[11px] mono-tag text-gray-400">Tôi</span>
        </div>
      </div>
    </nav>
  );
}
