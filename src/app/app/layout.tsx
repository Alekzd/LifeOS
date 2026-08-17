"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import MobileNav from "@/components/layout/MobileNav";
import DesktopSidebar from "@/components/layout/DesktopSidebar";
import AnnouncementBanner from "@/components/layout/AnnouncementBanner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const upsertUser = useMutation(api.users.upsertUser);

  // Sync user to Convex on mount
  useEffect(() => {
    if (user) {
      const searchParams = new URLSearchParams(window.location.search);
      const ref = searchParams.get("ref") ?? undefined;

      upsertUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? "",
        name: user.fullName ?? user.firstName ?? "User",
        avatarUrl: user.imageUrl,
        referredBy: ref,
      }).catch(console.error);
    }
  }, [user, upsertUser]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: "var(--color-surface-base)" }}>
      {/* Desktop Sidebar (visible on md+) */}
      <DesktopSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-24 md:pb-8">
        <AnnouncementBanner />
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav (visible on mobile only) */}
      <MobileNav />
    </div>
  );
}
