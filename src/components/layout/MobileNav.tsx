"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Home, Calendar, Settings, BarChart3, Plus } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useLanguage } from "@/context/LanguageContext";

interface MobileNavProps {
  onAddTask?: () => void;
}

export default function MobileNav({ onAddTask }: MobileNavProps) {
  const pathname = usePathname();
  const currentUser = useQuery(api.users.getCurrentUser);
  const { t, language } = useLanguage();

  const LEFT_NAV = [
    { href: "/app", icon: Home, label: t("nav_home") },
    { href: "/app/calendar", icon: Calendar, label: t("nav_calendar") },
  ];

  const RIGHT_NAV = [
    { href: "/app/settings", icon: Settings, label: t("nav_settings") },
  ];

  return (
    <nav
      className="mobile-nav md:hidden border-t"
      style={{
        borderColor: "var(--color-surface-border)",
        background: "var(--color-surface-dark)",
      }}
    >
      <div className="flex items-center justify-between px-2" style={{ height: "56px" }}>
        {/* Left Nav Items */}
        <div className="flex items-center justify-around flex-1">
          {LEFT_NAV.map(({ href, icon: Icon, label }) => {
            const isActive = href === "/app" ? pathname === "/app" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                id={`nav-${label.toLowerCase().replace(/ /g, "-")}`}
                className="relative flex flex-col items-center justify-center gap-0.5 px-2 transition-all h-full"
                style={{ minWidth: "48px" }}
              >
                <Icon
                  className="w-5 h-5"
                  style={{ color: isActive ? "oklch(0.78 0.22 142)" : "oklch(0.48 0.015 260)" }}
                />
                <span
                  className="text-[10px] font-semibold mono-tag truncate max-w-[56px] text-center"
                  style={{ color: isActive ? "var(--color-text-primary)" : "var(--color-text-muted)" }}
                >
                  {label}
                </span>
                {isActive && (
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2"
                    style={{
                      width: "20px",
                      height: "2px",
                      background: "oklch(0.72 0.22 142)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Center Floating Action Button (FAB) — Add Task */}
        <div className="relative flex items-center justify-center px-1 flex-shrink-0">
          <button
            onClick={onAddTask}
            id="mobile-nav-add"
            type="button"
            className="flex items-center justify-center transition-transform active:scale-95 shadow-lg"
            style={{
              width: "46px",
              height: "46px",
              background: "oklch(0.72 0.22 142)",
              border: "1px solid oklch(0.72 0.22 142)",
              color: "#000",
              marginBottom: "4px",
            }}
            aria-label={language === "vi" ? "Thêm task mới" : "Add new task"}
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Right Nav Items */}
        <div className="flex items-center justify-around flex-1">
          {RIGHT_NAV.map(({ href, icon: Icon, label }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                id={`nav-${label.toLowerCase().replace(/ /g, "-")}`}
                className="relative flex flex-col items-center justify-center gap-0.5 px-2 transition-all h-full"
                style={{ minWidth: "48px" }}
              >
                <Icon
                  className="w-5 h-5"
                  style={{ color: isActive ? "oklch(0.78 0.22 142)" : "oklch(0.48 0.015 260)" }}
                />
                <span
                  className="text-[10px] font-semibold mono-tag truncate max-w-[56px] text-center"
                  style={{ color: isActive ? "var(--color-text-primary)" : "var(--color-text-muted)" }}
                >
                  {label}
                </span>
                {isActive && (
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2"
                    style={{
                      width: "20px",
                      height: "2px",
                      background: "oklch(0.72 0.22 142)",
                    }}
                  />
                )}
              </Link>
            );
          })}

          {/* Admin Link if admin */}
          {currentUser?.role === "admin" && (
            <Link
              href="/admin"
              id="nav-admin"
              className="relative flex flex-col items-center justify-center gap-0.5 px-1.5 transition-all h-full"
              style={{ minWidth: "44px" }}
            >
              <BarChart3 className="w-5 h-5 text-amber-400" />
              <span className="text-[10px] font-semibold mono-tag text-amber-400 text-center">
                Admin
              </span>
            </Link>
          )}

          {/* User Profile Avatar */}
          <div className="flex flex-col items-center justify-center gap-0.5 px-1.5" style={{ minWidth: "44px" }}>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-6 h-6 rounded-none",
                },
              }}
            />
            <span className="text-[10px] mono-tag text-gray-400 text-center">
              {language === "vi" ? "Tôi" : "Me"}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
