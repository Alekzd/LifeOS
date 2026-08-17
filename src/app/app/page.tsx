"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState, useCallback } from "react";
import { Plus, Filter, SortAsc, CheckCircle2, Clock, AlertCircle, Sparkles } from "lucide-react";
import TaskCard from "@/components/tasks/TaskCard";
import QuickCapture from "@/components/tasks/QuickCapture";
import StreakBar from "@/components/streak/StreakBar";
import ShareModal from "@/components/streak/ShareModal";
import TaskFilter from "@/components/tasks/TaskFilter";
import { cn } from "@/lib/utils";

type Status = "todo" | "in_progress" | "completed" | undefined;

const STATUS_TABS = [
  { value: undefined, label: "Tất cả", icon: SortAsc },
  { value: "todo" as const, label: "Cần làm", icon: AlertCircle },
  { value: "in_progress" as const, label: "Đang làm", icon: Clock },
  { value: "completed" as const, label: "Xong", icon: CheckCircle2 },
];

export default function AppPage() {
  const [status, setStatus] = useState<Status>(undefined);
  const [showCapture, setShowCapture] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string | undefined>();
  const [filterCategory, setFilterCategory] = useState<string | undefined>();

  const currentUser = useQuery(api.users.getCurrentUser);
  const tasks = useQuery(api.tasks.getUserTasks, { status });
  const categories = useQuery(api.categories.getUserCategories);

  // Client-side filtering
  const filteredTasks = tasks?.filter((t: any) => {
    if (filterPriority && t.priority !== filterPriority) return false;
    if (filterCategory && t.categoryId !== filterCategory) return false;
    return true;
  });

  const completedToday = tasks?.filter((t: any) => {
    if (t.status !== "completed") return false;
    const taskDate = new Date(t.updatedAt);
    const today = new Date();
    return (
      taskDate.getDate() === today.getDate() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getFullYear() === today.getFullYear()
    );
  }).length ?? 0;

  // Show share modal when user completes 5 tasks in a day
  const handleTaskComplete = useCallback(() => {
    if (completedToday + 1 >= 5) {
      setTimeout(() => setShowShareModal(true), 800);
    }
  }, [completedToday]);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
      {/* Header Row (Centered / Balanced) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-surface-border">
        <div>
          <h1 className="text-base sm:text-lg font-bold font-mono text-white tracking-tight flex items-center gap-2">
            <span>{getGreeting()},</span>
            <span className="text-emerald-400">
              {currentUser?.name?.split(" ").at(-1) ?? "bạn"}
            </span>
            <span>👋</span>
          </h1>
          <p className="text-xs mono-tag text-gray-400 mt-0.5">
            📅 {new Date().toLocaleDateString("vi-VN", {
              weekday: "long", day: "numeric", month: "long", year: "numeric"
            })}
          </p>
        </div>

        {/* Header Action Buttons (Buttons Have Borders) */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="lg:hidden px-3 py-1.5 text-xs font-semibold mono-tag flex items-center gap-1.5 border border-surface-border bg-surface-dark text-gray-200">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            Lọc Task
          </button>

          <button
            onClick={() => setShowCapture(true)}
            id="desktop-quick-add-btn"
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-black bg-emerald-400 hover:bg-emerald-300 border border-emerald-400">
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Thêm Task Mới</span>
          </button>
        </div>
      </div>

      {/* Main Balanced 16:9 Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tasks List & Status Tabs (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* Status Filter Buttons (Buttons Have Borders) */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto">
              {STATUS_TABS.map((tab) => (
                <button
                  key={String(tab.value)}
                  onClick={() => setStatus(tab.value)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold mono-tag whitespace-nowrap transition-all border flex-1 sm:flex-initial",
                  )}
                  style={{
                    background: status === tab.value ? "oklch(0.72 0.22 142)" : "oklch(0.14 0.018 260)",
                    borderColor: status === tab.value ? "oklch(0.72 0.22 142)" : "oklch(0.28 0.035 260)",
                    color: status === tab.value ? "black" : "oklch(0.70 0.02 260)",
                  }}>
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="hidden sm:block text-xs mono-tag text-gray-400">
              Tổng số: <strong className="text-emerald-400">{filteredTasks?.length ?? 0}</strong> tasks
            </div>
          </div>

          {/* Task List (Frameless Rows with Bottom Dividers) */}
          <div className="space-y-0 border-t border-surface-border">
            {filteredTasks === undefined ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 shimmer border-b border-surface-border" />
              ))
            ) : filteredTasks.length === 0 ? (
              <EmptyState status={status} onAdd={() => setShowCapture(true)} />
            ) : (
              filteredTasks.map((task: any) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  categories={categories ?? []}
                  onComplete={handleTaskComplete}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar Column: Streak Engine & Category Panel (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Streak Bar Card */}
          {currentUser && (
            <StreakBar
              streak={currentUser.streakCount}
              completedToday={completedToday}
              onShareClick={() => setShowShareModal(true)}
            />
          )}

          {/* Desktop Filter Panel */}
          <div className="hidden lg:block">
            <TaskFilter
              categories={categories ?? []}
              filterPriority={filterPriority}
              filterCategory={filterCategory}
              onPriorityChange={setFilterPriority}
              onCategoryChange={setFilterCategory}
              onReset={() => { setFilterPriority(undefined); setFilterCategory(undefined); }}
            />
          </div>

          {/* Mobile Filter Toggle */}
          {showFilter && (
            <div className="lg:hidden">
              <TaskFilter
                categories={categories ?? []}
                filterPriority={filterPriority}
                filterCategory={filterCategory}
                onPriorityChange={setFilterPriority}
                onCategoryChange={setFilterCategory}
                onReset={() => { setFilterPriority(undefined); setFilterCategory(undefined); }}
              />
            </div>
          )}

          {/* Category Summary Box (Frameless Panel) */}
          {categories && categories.length > 0 && (
            <div className="p-4 bg-surface-card border-b border-surface-border">
              <h3 className="text-xs font-bold uppercase tracking-wider mono-tag mb-3 flex items-center justify-between text-gray-400 pb-2 border-b border-surface-border">
                <span>// DANH MỤC PHÂN LOẠI</span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </h3>
              <div className="space-y-1.5">
                {categories.map((cat) => {
                  const count = tasks?.filter((t: any) => t.categoryId === cat._id).length ?? 0;
                  return (
                    <div key={cat._id}
                      onClick={() => setFilterCategory(filterCategory === cat._id ? undefined : cat._id)}
                      className="flex items-center justify-between p-2 cursor-pointer transition-all border text-xs"
                      style={{
                        background: filterCategory === cat._id ? `${cat.color}20` : "oklch(0.14 0.018 260)",
                        borderColor: filterCategory === cat._id ? cat.color : "oklch(0.24 0.030 260)",
                      }}>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5" style={{ background: cat.color }} />
                        <span className="font-medium text-gray-200">
                          {cat.name}
                        </span>
                      </div>
                      <span className="mono-tag font-semibold px-2 py-0.5 border border-surface-border bg-surface-dark text-gray-300 text-[11px]">
                        {count} tasks
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button on Mobile */}
      <button
        onClick={() => setShowCapture(true)}
        id="quick-add-fab"
        className="md:hidden fixed bottom-16 right-4 w-12 h-12 flex items-center justify-center text-black bg-emerald-400 border border-emerald-400 z-40">
        <Plus className="w-6 h-6 stroke-[3]" />
      </button>

      {/* Modals & Bottom Sheets */}
      {showCapture && (
        <QuickCapture
          categories={categories ?? []}
          onClose={() => setShowCapture(false)}
        />
      )}

      {showShareModal && currentUser && (
        <ShareModal
          streak={currentUser.streakCount}
          referralCode={currentUser.referralCode}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Chào buổi sáng";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

function EmptyState({ status, onAdd }: { status?: string; onAdd: () => void }) {
  const messages: Record<string, { emoji: string; text: string }> = {
    todo: { emoji: "✅", text: "Không còn task cần làm. Tuyệt vời!" },
    in_progress: { emoji: "⚡", text: "Không có task nào đang thực hiện." },
    completed: { emoji: "🎉", text: "Hãy hoàn thành task đầu tiên của bạn!" },
    all: { emoji: "📋", text: "Chưa có task nào. Thêm ngay!" },
  };
  const msg = messages[status ?? "all"] ?? messages.all;

  return (
    <div className="text-center py-12 px-4 bg-surface-card border-b border-surface-border">
      <div className="text-3xl mb-2">{msg.emoji}</div>
      <p className="text-xs sm:text-sm font-medium mb-4 text-gray-300">{msg.text}</p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 border border-emerald-400">
        <Plus className="w-3.5 h-3.5" />
        Thêm Task Mới
      </button>
    </div>
  );
}
