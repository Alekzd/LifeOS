"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Calendar as CalendarIcon } from "lucide-react";
import { cn, getStartOfDay, getEndOfDay } from "@/lib/utils";
import TaskCard from "@/components/tasks/TaskCard";

type ViewMode = "month" | "week" | "day";

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const MONTHS = [
  "Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6",
  "Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"
];

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [displayDate, setDisplayDate] = useState(new Date());

  const calendarDots = useQuery(api.tasks.getCalendarData, {
    month: displayDate.getMonth(),
    year: displayDate.getFullYear(),
  });

  const dayTasks = useQuery(api.tasks.getTasksByDate, {
    startDate: getStartOfDay(selectedDate),
    endDate: getEndOfDay(selectedDate),
  });

  const categories = useQuery(api.categories.getUserCategories);

  const goToPrev = () => {
    if (viewMode === "month") {
      setDisplayDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    } else {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() - (viewMode === "week" ? 7 : 1));
      setSelectedDate(d);
      setDisplayDate(d);
    }
  };

  const goToNext = () => {
    if (viewMode === "month") {
      setDisplayDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    } else {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + (viewMode === "week" ? 7 : 1));
      setSelectedDate(d);
      setDisplayDate(d);
    }
  };

  // Get days in current month view
  const getDaysInMonth = () => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (Date | null)[] = Array(firstDay).fill(null);
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const formatDayKey = (date: Date) =>
    date.toISOString().split("T")[0];

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) =>
    date.toDateString() === selectedDate.toDateString();

  const getDotStatus = (date: Date) =>
    calendarDots?.[formatDayKey(date)];

  const DOT_COLORS = {
    completed: "var(--color-dot-completed)",
    mixed: "var(--color-dot-mixed)",
    pending: "var(--color-dot-pending)",
  };

  // Week view: get 7 days from selected
  const getWeekDays = () => {
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-surface-border">
        <div>
          <h1 className="text-lg sm:text-xl font-bold font-mono text-white tracking-tight">
            LỊCH TƯƠNG TÁC <span className="text-emerald-400">📅</span>
          </h1>
          <p className="text-xs mono-tag text-gray-400 mt-0.5">
            Tự động đồng bộ với due date & chấm chỉ báo màu tiến độ
          </p>
        </div>

        {/* View Mode & Today Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setSelectedDate(new Date()); setDisplayDate(new Date()); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold mono-tag border border-surface-border bg-surface-dark text-emerald-400 hover:border-emerald-400">
            <CalendarDays className="w-3.5 h-3.5" />
            Hôm nay
          </button>

          <div className="flex gap-1 p-1 bg-surface-dark border border-surface-border">
            {(["month", "week", "day"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className="px-3 py-1 text-xs font-semibold mono-tag border transition-all"
                style={{
                  background: viewMode === mode ? "oklch(0.72 0.22 142)" : "transparent",
                  borderColor: viewMode === mode ? "oklch(0.72 0.22 142)" : "transparent",
                  color: viewMode === mode ? "black" : "oklch(0.65 0.02 260)",
                }}>
                {mode === "month" ? "Tháng" : mode === "week" ? "Tuần" : "Ngày"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Balanced 16:9 Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Calendar Grid (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="terminal-card p-4 sm:p-5 border border-surface-border bg-surface-card">
            {/* Month/Period Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-surface-border">
              <button onClick={goToPrev} className="p-1.5 border border-surface-border bg-surface-dark text-gray-300 hover:border-emerald-400">
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="text-center">
                <h2 className="font-bold text-sm sm:text-base font-mono text-emerald-400">
                  {viewMode === "day"
                    ? selectedDate.toLocaleDateString("vi-VN", { weekday: "long" })
                    : `${MONTHS[displayDate.getMonth()]} năm ${displayDate.getFullYear()}`}
                </h2>
                {viewMode === "day" && (
                  <p className="text-[11px] mono-tag text-gray-400 mt-0.5">
                    {selectedDate.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                  </p>
                )}
              </div>

              <button onClick={goToNext} className="p-1.5 border border-surface-border bg-surface-dark text-gray-300 hover:border-emerald-400">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Weekday Labels */}
            <div className="grid grid-cols-7 gap-1.5 mb-2">
              {WEEKDAYS.map((day) => (
                <div key={day} className="text-center text-xs font-bold py-1 mono-tag text-gray-400">
                  {day}
                </div>
              ))}
            </div>

            {/* Month View Grid */}
            {viewMode === "month" && (
              <div className="grid grid-cols-7 gap-1.5">
                {getDaysInMonth().map((date, idx) => {
                  if (!date) return <div key={`empty-${idx}`} />;
                  const dot = getDotStatus(date);
                  const selected = isSelected(date);
                  const today = isToday(date);

                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => {
                        setSelectedDate(date);
                        setDisplayDate(date);
                      }}
                      className="flex flex-col items-center py-2 border transition-all relative"
                      style={{
                        background: selected
                          ? "oklch(0.72 0.22 142)"
                          : today
                          ? "oklch(0.72 0.22 142 / 0.15)"
                          : "oklch(0.14 0.018 260)",
                        borderColor: today && !selected
                          ? "oklch(0.72 0.22 142 / 0.6)"
                          : selected ? "oklch(0.72 0.22 142)" : "oklch(0.24 0.03 260)",
                        minHeight: "52px",
                      }}>
                      <span className="text-xs sm:text-sm font-semibold mono-tag leading-none"
                        style={{ color: selected ? "black" : today ? "oklch(0.96 0.01 142)" : "oklch(0.85 0.01 260)" }}>
                        {date.getDate()}
                      </span>
                      {dot && (
                        <div className="mt-1.5" style={{
                          width: "5px", height: "5px",
                          background: DOT_COLORS[dot as keyof typeof DOT_COLORS],
                        }} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Week View Grid */}
            {viewMode === "week" && (
              <div className="grid grid-cols-7 gap-1.5">
                {getWeekDays().map((date) => {
                  const dot = getDotStatus(date);
                  const selected = isSelected(date);
                  const today = isToday(date);

                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className="flex flex-col items-center py-2.5 border transition-all"
                      style={{
                        background: selected
                          ? "oklch(0.72 0.22 142)"
                          : today
                          ? "oklch(0.72 0.22 142 / 0.15)"
                          : "oklch(0.14 0.018 260)",
                        borderColor: today && !selected ? "oklch(0.72 0.22 142 / 0.6)" : "oklch(0.24 0.03 260)",
                        minHeight: "64px",
                      }}>
                      <span className="text-[10px] mono-tag mb-1" style={{ color: selected ? "rgba(0,0,0,0.8)" : "oklch(0.60 0.02 260)" }}>
                        {WEEKDAYS[date.getDay()]}
                      </span>
                      <span className="text-xs font-bold mono-tag"
                        style={{ color: selected ? "black" : today ? "oklch(0.96 0.01 142)" : "oklch(0.85 0.01 260)" }}>
                        {date.getDate()}
                      </span>
                      {dot && (
                        <div className="mt-1.5" style={{
                          width: "5px", height: "5px",
                          background: DOT_COLORS[dot as keyof typeof DOT_COLORS],
                        }} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Date Tasks (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="terminal-card p-4 sm:p-5 border border-surface-border bg-surface-card">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-border">
              <div>
                <h3 className="font-bold text-sm font-mono text-emerald-400 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>TASK NGÀY {selectedDate.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}</span>
                </h3>
                <p className="text-xs mono-tag text-gray-400 mt-0.5">
                  {selectedDate.toLocaleDateString("vi-VN", { weekday: "long", year: "numeric" })}
                </p>
              </div>

              {isToday(selectedDate) && (
                <span className="px-2 py-0.5 text-xs mono-tag font-bold border border-emerald-400 text-emerald-400 bg-emerald-950/20">
                  HÔM NAY
                </span>
              )}
            </div>

            {dayTasks === undefined ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 shimmer border border-surface-border" />
                ))}
              </div>
            ) : dayTasks.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-3xl mb-1">📭</div>
                <p className="text-xs mono-tag">Không có task nào trong ngày này</p>
              </div>
            ) : (
              <div className="space-y-2">
                {dayTasks.map((task: any) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    categories={categories ?? []}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
