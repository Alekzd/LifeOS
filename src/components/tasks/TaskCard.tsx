"use client";

import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Doc } from "@convex/_generated/dataModel";
import { useState } from "react";
import { CheckCircle2, Trash2, Flag, ChevronDown, ChevronUp } from "lucide-react";
import { cn, formatRelative } from "@/lib/utils";

type Task = Doc<"tasks">;
type Category = Doc<"categories">;

const PRIORITY_CONFIG = {
  high: { label: "Cao", className: "priority-high", dot: "oklch(0.65 0.22 25)" },
  medium: { label: "TB", className: "priority-medium", dot: "oklch(0.80 0.16 85)" },
  low: { label: "Thấp", className: "priority-low", dot: "oklch(0.72 0.18 142)" },
};

const STATUS_CONFIG = {
  todo: { label: "Cần làm", className: "status-todo" },
  in_progress: { label: "Đang làm", className: "status-in-progress" },
  completed: { label: "Xong", className: "status-completed" },
};

interface TaskCardProps {
  task: Task;
  categories: Category[];
  onComplete?: () => void;
}

export default function TaskCard({ task, categories, onComplete }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);

  const updateTask = useMutation(api.tasks.updateTask);
  const deleteTask = useMutation(api.tasks.deleteTask);

  const category = categories.find((c) => c._id === task.categoryId);
  const isCompleted = task.status === "completed";

  const handleToggleComplete = async () => {
    const newStatus = isCompleted ? "todo" : "completed";
    await updateTask({ taskId: task._id, status: newStatus });
    if (newStatus === "completed") onComplete?.();
  };

  const handleDelete = async () => {
    if (confirm("Xóa task này?")) {
      await deleteTask({ taskId: task._id });
    }
  };

  const handleCycleStatus = async () => {
    const cycle: Record<string, Task["status"]> = {
      todo: "in_progress",
      in_progress: "completed",
      completed: "todo",
    };
    const newStatus = cycle[task.status];
    await updateTask({ taskId: task._id, status: newStatus });
    if (newStatus === "completed") onComplete?.();
  };

  const isOverdue = task.dueDate < Date.now() && !isCompleted;

  return (
    <div
      className={cn(
        "p-3.5 border-b border-surface-border transition-all card-lift bg-surface-card",
        isCompleted ? "bg-emerald-950/10" : isOverdue ? "bg-red-950/10" : ""
      )}>
      <div className="flex items-start gap-3">
        {/* Checkbox Button (Has Border) */}
        <button
          onClick={handleToggleComplete}
          id={`task-complete-${task._id}`}
          className="mt-0.5 flex-shrink-0 touch-target flex items-center justify-center w-5 h-5 transition-all"
          style={{ minWidth: "20px", minHeight: "20px" }}>
          {isCompleted ? (
            <div className="w-4 h-4 bg-emerald-400 text-black flex items-center justify-center border border-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          ) : (
            <div className="w-4 h-4 border border-gray-500 hover:border-emerald-400" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={cn(
              "font-medium text-xs sm:text-sm leading-snug transition-all text-left",
              isCompleted && "line-through opacity-50 text-gray-400"
            )}
              style={{ color: isCompleted ? undefined : "oklch(0.92 0.01 142)" }}>
              {task.title}
            </h3>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Priority dot */}
              <div className="w-2 h-2 flex-shrink-0"
                style={{ background: (PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.medium).dot }} />

              <button onClick={() => setExpanded(!expanded)}
                className="p-1 border border-surface-border bg-surface-dark text-gray-400 hover:text-white">
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap text-xs mono-tag">
            {/* Category Tag (Button/Badge has border) */}
            {category && (
              <span className="px-2 py-0.5 border text-[11px] font-semibold"
                style={{
                  background: `${category.color}15`,
                  color: category.color,
                  borderColor: `${category.color}40`,
                }}>
                {category.name}
              </span>
            )}

            {/* Due date */}
            <span className={cn("text-[11px]", isOverdue ? "text-red-400 font-bold" : "text-gray-400")}>
              {isOverdue ? "⚠ " : "📅 "}
              {formatRelative(task.dueDate)}
            </span>

            {/* Status Pill (Badge has border) */}
            <span className={cn(
              "px-2 py-0.5 text-[11px] font-semibold border",
              (STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.todo).className
            )}>
              {(STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.todo).label}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded description & actions */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-surface-border text-left">
          {task.description && (
            <p className="text-xs sm:text-sm mb-3 text-gray-300">
              {task.description}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleCycleStatus}
              className="flex-1 py-1.5 px-3 border border-emerald-400/60 text-emerald-400 hover:bg-emerald-400 hover:text-black text-xs font-bold mono-tag flex items-center justify-center gap-1.5 transition-all">
              <Flag className="w-3.5 h-3.5" />
              {task.status === "todo"
                ? "Bắt đầu làm"
                : task.status === "in_progress"
                ? "Đánh dấu Xong"
                : "Làm lại"}
            </button>

            <button
              onClick={handleDelete}
              id={`task-delete-${task._id}`}
              className="px-3 py-1.5 border border-red-500/60 text-red-400 hover:bg-red-500 hover:text-black text-xs font-bold flex items-center justify-center transition-all">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
