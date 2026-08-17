"use client";

import { Share2, Target, Flame } from "lucide-react";

interface StreakBarProps {
  streak: number;
  completedToday: number;
  onShareClick: () => void;
}

const DAILY_GOAL = 5;

export default function StreakBar({ streak, completedToday, onShareClick }: StreakBarProps) {
  const progress = Math.min((completedToday / DAILY_GOAL) * 100, 100);
  const isGoalReached = completedToday >= DAILY_GOAL;

  return (
    <div className="terminal-card p-4 border border-surface-border bg-surface-card">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-surface-border">
        {/* Streak count */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 border border-amber-400/40 bg-amber-950/20 flex items-center justify-center text-xl">
            🔥
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold mono-tag text-amber-400">
                {streak}
              </span>
              <span className="text-xs font-semibold mono-tag text-gray-300">
                NGÀY STREAK LIÊN TỤC
              </span>
            </div>
            <p className="text-[11px] mono-tag text-gray-400">
              {streak === 0 ? "Bắt đầu streak hôm nay!" : `Duy trì chuỗi ${streak} ngày năng suất`}
            </p>
          </div>
        </div>

        {/* Share button */}
        {streak > 0 && (
          <button
            onClick={onShareClick}
            id="streak-share-btn"
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold mono-tag border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black transition-all">
            <Share2 className="w-3.5 h-3.5" />
            CHIA SẺ
          </button>
        )}
      </div>

      {/* Daily progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs mono-tag">
          <span className="text-gray-300">
            Mục tiêu ngày: <strong className="text-emerald-400">{completedToday}/{DAILY_GOAL}</strong> tasks
          </span>
          {isGoalReached && (
            <span className="text-emerald-400 font-bold">
              🎯 ĐẠT MỤC TIÊU!
            </span>
          )}
        </div>
        <div className="h-2 border border-surface-border bg-surface-dark overflow-hidden">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: isGoalReached ? "oklch(0.72 0.22 142)" : "oklch(0.80 0.16 85)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
