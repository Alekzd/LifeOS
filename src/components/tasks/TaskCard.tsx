"use client";

import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Doc } from "@convex/_generated/dataModel";
import { useState } from "react";
import { CheckCircle2, Trash2, Flag, ChevronDown, ChevronUp } from "lucide-react";
import { cn, formatRelative } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

type Task = Doc<"tasks">;
type Category = Doc<"categories">;

interface TaskCardProps {
  task: Task;
  categories: Category[];
  onComplete?: () => void;
}

export default function TaskCard({ task, categories, onComplete }: TaskCardProps) {
  const { language, t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const updateTask = useMutation(api.tasks.updateTask);
  const deleteTask = useMutation(api.tasks.deleteTask);

  const category = categories.find((c) => c._id === task.categoryId);
  const isCompleted = task.status === "completed";

  const priorityConfig: Record<string, { label: string; dot: string }> = {
    high: { label: t("task_priority_high"), dot: "oklch(0.65 0.22 25)" },
    medium: { label: t("task_priority_medium"), dot: "oklch(0.80 0.16 85)" },
    low: { label: t("task_priority_low"), dot: "oklch(0.72 0.18 142)" },
  };

  const statusConfig: Record<string, { label: string; className: string }> = {
    todo: { label: t("tasks_todo"), className: "status-todo" },
    in_progress: { label: t("tasks_in_progress"), className: "status-in-progress" },
    completed: { label: t("tasks_completed"), className: "status-completed" },
  };

  const handleToggleComplete = async () => {
    const newStatus = isCompleted ? "todo" : "completed";
    await updateTask({ taskId: task._id, status: newStatus });
    if (newStatus === "completed") onComplete?.();
  };

  const handleDelete = async () => {
    if (confirm(t("task_delete_confirm"))) {
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
        "p-3.5 sm:p-4 border-b border-surface-border transition-all card-lift bg-surface-card",
        isCompleted ? "opacity-75 bg-surface-raised" : isOverdue ? "bg-red-500/10" : ""
      )}>
      <div className="flex items-start gap-3">
        {/* iOS-Style Checkbox Touch Button */}
        <button
          onClick={handleToggleComplete}
          id={`task-complete-${task._id}`}
          className="mt-0.5 flex-shrink-0 touch-target flex items-center justify-center w-6 h-6 transition-all"
          aria-label="Toggle task status"
          style={{ minWidth: "24px", minHeight: "24px" }}>
          {isCompleted ? (
            <div className="w-5 h-5 bg-emerald-400 text-black flex items-center justify-center border border-emerald-400">
              <CheckCircle2 className="w-4 h-4 stroke-[3]" />
            </div>
          ) : (
            <div className="w-5 h-5 border border-gray-400 hover:border-emerald-400 transition-colors" />
          )}
        </button>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={cn(
              "font-medium text-xs sm:text-sm leading-snug transition-all text-left",
              isCompleted && "line-through opacity-70"
            )}
              style={{ color: isCompleted ? "var(--color-text-muted)" : "var(--color-text-primary)" }}>
              {task.title}
            </h3>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Priority Indicator */}
              <div className="w-2.5 h-2.5 flex-shrink-0"
                style={{ background: (priorityConfig[task.priority] ?? priorityConfig.medium).dot }} />

              <button onClick={() => setExpanded(!expanded)}
                aria-label="Expand task details"
                className="p-2 border border-surface-border bg-surface-dark text-gray-400 hover:text-white flex items-center justify-center min-w-[36px] min-h-[36px]">
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Meta Tags Row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap text-xs mono-tag">
            {/* Category Tag */}
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

            {/* Relative Due Date */}
            <span className={cn("text-[11px]", isOverdue ? "text-red-400 font-bold" : "text-gray-400")}>
              {isOverdue ? "⚠ " : "📅 "}
              {formatRelative(task.dueDate, language)}
            </span>

            {/* Status Pill */}
            <span className={cn(
              "px-2 py-0.5 text-[11px] font-semibold border",
              (statusConfig[task.status] ?? statusConfig.todo).className
            )}>
              {(statusConfig[task.status] ?? statusConfig.todo).label}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Actions View */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-surface-border text-left">
          {task.description && (
            <p className="text-xs sm:text-sm mb-3 text-gray-300 leading-relaxed">
              {task.description}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleCycleStatus}
              className="flex-1 py-2 px-3 border border-emerald-400/60 text-emerald-400 hover:bg-emerald-400 hover:text-black text-xs font-bold mono-tag flex items-center justify-center gap-1.5 transition-all touch-target">
              <Flag className="w-3.5 h-3.5" />
              {task.status === "todo"
                ? (language === "vi" ? "Bắt đầu làm" : "Start task")
                : task.status === "in_progress"
                ? (language === "vi" ? "Đánh dấu Xong" : "Mark completed")
                : (language === "vi" ? "Làm lại" : "Reopen")}
            </button>

            <button
              onClick={handleDelete}
              id={`task-delete-${task._id}`}
              className="py-2 px-3 border border-red-500/60 text-red-400 hover:bg-red-500 hover:text-black text-xs font-bold flex items-center justify-center transition-all touch-target">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
