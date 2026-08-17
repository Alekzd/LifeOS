"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { X, Info, AlertTriangle, Sparkles } from "lucide-react";
import { useState } from "react";

const TYPE_CONFIG = {
  info: { icon: Info, color: "oklch(0.65 0.20 264)", bg: "oklch(0.60 0.24 264 / 0.1)", border: "oklch(0.60 0.24 264 / 0.3)" },
  warning: { icon: AlertTriangle, color: "oklch(0.76 0.17 60)", bg: "oklch(0.76 0.17 60 / 0.1)", border: "oklch(0.76 0.17 60 / 0.3)" },
  feature: { icon: Sparkles, color: "oklch(0.68 0.26 340)", bg: "oklch(0.68 0.26 340 / 0.1)", border: "oklch(0.68 0.26 340 / 0.3)" },
};

export default function AnnouncementBanner() {
  const announcements = useQuery(api.announcements.listActiveAnnouncements);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  if (!announcements || announcements.length === 0) return null;

  const visible = announcements.filter(
    (a: any) => !dismissed.has(a._id) && (!a.expiresAt || a.expiresAt > Date.now())
  );

  if (visible.length === 0) return null;

  const latest = visible[0];
  const config = TYPE_CONFIG[latest.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.info;
  const Icon = config.icon;

  return (
    <div className="px-4 pt-3"
      style={{ animation: "slide-down 0.3s var(--ease-spring)" }}>
      <div className="rounded-2xl px-4 py-3 flex items-start gap-3"
        style={{ background: config.bg, border: `1px solid ${config.border}` }}>
        <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: config.color }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: "oklch(0.90 0.005 264)" }}>
            {latest.title}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "oklch(0.70 0.02 264)" }}>
            {latest.content}
          </p>
        </div>
        <button
          onClick={() => setDismissed((prev) => new Set(prev).add(latest._id))}
          className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center"
          style={{ background: "oklch(0.25 0.03 264)", color: "oklch(0.65 0.02 264)" }}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
