"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import {
  CheckCircle2, Zap, ChevronRight, Flame,
  ArrowRight, Terminal, Code2
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Interactive Demo Component ──────────────────────────────────────────────
function InteractiveDemo() {
  const [demoTasks, setDemoTasks] = useState([
    { id: 1, title: "Lập lịch công việc tuần tới", status: "todo", priority: "high" },
    { id: 2, title: "Review PR #42 & deploy staging", status: "in_progress", priority: "medium" },
    { id: 3, title: "Chạy automated tests Vitest", status: "completed", priority: "low" },
  ]);
  const [input, setInput] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);

  const addTask = () => {
    if (!input.trim()) return;
    setDemoTasks((prev) => [
      { id: Date.now(), title: input, status: "todo", priority: "medium" },
      ...prev,
    ]);
    setInput("");
  };

  const toggleTask = (id: number) => {
    setDemoTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "completed" ? "todo" : "completed" }
          : t
      )
    );
    const completed = demoTasks.filter((t) => t.status === "completed").length;
    if (completed >= 1) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  };

  const priorityStyle: Record<string, string> = {
    high: "priority-high",
    medium: "priority-medium",
    low: "priority-low",
  };
  const priorityLabel: Record<string, string> = { high: "Cao", medium: "TB", low: "Thấp" };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      {showCelebration && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold mono-tag border border-emerald-400 text-emerald-400 bg-emerald-950/90">
            🔥 +1 Streak! Đang trên đà năng suất!
          </div>
        </div>
      )}

      <div className="bg-surface-card border border-surface-border w-full">
        {/* Terminal Header Bar */}
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-surface-border bg-surface-dark">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-red-500"></div>
            <div className="w-2.5 h-2.5 bg-yellow-500"></div>
            <div className="w-2.5 h-2.5 bg-green-500"></div>
            <span className="text-xs mono-tag ml-2 text-gray-400">
              bash ~ life-os-demo
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] mono-tag px-2 py-0.5 border border-amber-400/40 text-amber-400 bg-amber-950/30">
            <Flame className="w-3 h-3 text-amber-400" />
            <span>5d STREAK</span>
          </div>
        </div>

        {/* Quick Capture Input */}
        <div className="p-4 border-b border-surface-border">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs mono-tag text-emerald-400">
                $
              </span>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                placeholder="Thêm task mới... (nhấn Enter)"
                className="w-full pl-7 pr-3 py-2 text-xs sm:text-sm mono-tag bg-surface-dark border border-surface-border text-emerald-400 outline-none"
              />
            </div>
            <button
              onClick={addTask}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-black bg-emerald-400 hover:bg-emerald-300 border border-emerald-400 flex items-center gap-1 flex-shrink-0">
              <Zap className="w-3.5 h-3.5 fill-black" />
              <span>THÊM</span>
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="p-4 space-y-2">
          {demoTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="flex items-center gap-3 p-2.5 cursor-pointer border-b border-surface-border/60 hover:bg-surface-raised transition-all">
              <div className={cn(
                "w-4 h-4 border flex items-center justify-center flex-shrink-0",
                task.status === "completed" ? "border-emerald-400 bg-emerald-400 text-black" : "border-gray-500"
              )}>
                {task.status === "completed" && (
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                )}
              </div>

              <span className={cn(
                "flex-1 text-xs sm:text-sm font-medium transition-all text-left truncate text-gray-200",
                task.status === "completed" && "line-through opacity-50 text-gray-400"
              )}>
                {task.title}
              </span>

              <span className={cn("text-[11px] px-2 py-0.5 mono-tag font-bold", priorityStyle[task.priority])}>
                {priorityLabel[task.priority]}
              </span>
            </div>
          ))}
        </div>

        {/* Terminal Footer */}
        <div className="px-4 py-2 text-[11px] mono-tag flex items-center justify-between border-t border-surface-border bg-surface-dark text-gray-400">
          <span>[Demo Workspace]</span>
          <span>Click để toggle hoàn thành</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Welcome / Landing Page ──────────────────────────────────────────────
export default function LandingPage() {
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen flex flex-col bg-surface-base text-text-primary overflow-x-hidden">
      {/* ── TOP NAV BAR ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-surface-dark border-b border-surface-border w-full">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center bg-emerald-500 text-black font-bold border border-emerald-400">
              <Terminal className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="font-bold text-sm sm:text-base tracking-tight font-mono text-emerald-400">
              LIFE OS
            </span>
          </div>

          {/* Nav Links & Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
              className="hidden sm:block text-xs font-mono text-gray-300 hover:text-emerald-400">
              // DEMO INTERACTIVE
            </button>

            {isSignedIn ? (
              <Link href="/app"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 border border-emerald-400">
                Vào Workspace <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="text-xs font-semibold px-3 py-1.5 border border-surface-border text-gray-200 hover:border-emerald-400">
                    Đăng Nhập
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 border border-emerald-400">
                    Dùng Miễn Phí <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── MAIN CONTENT (Centered Alignment Grid) ───────────────────── */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-14">

        {/* 1. HERO SECTION */}
        <section className="text-center w-full space-y-4 pb-10 border-b border-surface-border flex flex-col items-center justify-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-mono text-white tracking-tight leading-tight text-center">
            QUẢN LÝ CUỘC SỐNG NĂNG SUẤT
            <span className="text-emerald-400 block mt-1.5">TRONG 1 CHẠM</span>
          </h1>

          <p className="text-xs sm:text-sm leading-relaxed text-gray-300 max-w-lg mx-auto text-center">
            Ứng dụng quản lý tác vụ & lịch trình cá nhân đơn giản, trực quan và tối ưu năng suất.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {isSignedIn ? (
              <Link href="/app"
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-black bg-emerald-400 hover:bg-emerald-300 border border-emerald-400">
                <Zap className="w-4 h-4 fill-black" />
                MỞ WORKSPACE DỰ ÁN
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <SignUpButton mode="modal">
                  <button className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-black bg-emerald-400 hover:bg-emerald-300 border border-emerald-400">
                    <Zap className="w-4 h-4 fill-black" />
                    BẮT ĐẦU MIỄN PHÍ
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </SignUpButton>
                <button
                  onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-gray-200 bg-surface-card border border-surface-border hover:border-emerald-400">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  XEM DEMO
                </button>
              </>
            )}
          </div>
        </section>

        {/* 2. DEMO SECTION */}
        <section id="demo" className="w-full space-y-4 text-center pb-10 flex flex-col items-center">
          <div className="text-center">
            <h2 className="text-base sm:text-lg font-bold font-mono text-white mb-1 text-center">
              // THỬ NGAY BẢN DEMO INTERACTIVE
            </h2>
            <p className="text-xs mono-tag text-gray-400 text-center">
              Tạo task, hoàn thành công việc và trải nghiệm tính năng Streak ngay tại đây!
            </p>
          </div>
          <InteractiveDemo />
        </section>

      </main>

      {/* ── BOTTOM FOOTER BAR ───────────────────────────────────────── */}
      <footer className="border-t border-surface-border py-5 text-center text-xs mono-tag text-gray-500 bg-surface-dark w-full">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center bg-emerald-500 text-black font-bold border border-emerald-400 text-xs">
              L
            </div>
            <span className="font-bold text-gray-300">Life OS · Terminal Cyber Edition</span>
          </div>
          <p>© 2026 Life OS. Next.js 15 + Convex + Clerk</p>
        </div>
      </footer>
    </div>
  );
}


