"use client";

import { Doc } from "@convex/_generated/dataModel";
import { RotateCcw, Filter } from "lucide-react";

type Category = Doc<"categories">;

interface TaskFilterProps {
  categories: Category[];
  filterPriority?: string;
  filterCategory?: string;
  onPriorityChange: (p: string | undefined) => void;
  onCategoryChange: (c: string | undefined) => void;
  onReset: () => void;
}

const PRIORITIES = [
  { value: "high", label: "🔴 Cao" },
  { value: "medium", label: "🟡 TB" },
  { value: "low", label: "🟢 Thấp" },
];

export default function TaskFilter({
  categories,
  filterPriority,
  filterCategory,
  onPriorityChange,
  onCategoryChange,
  onReset,
}: TaskFilterProps) {
  const hasFilter = filterPriority || filterCategory;

  return (
    <div className="terminal-card p-4 border border-surface-border bg-surface-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-surface-border">
        <span className="text-xs font-bold uppercase tracking-wider mono-tag text-gray-300 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-emerald-400" />
          <span>// LỌC DANH SÁCH</span>
        </span>
        {hasFilter && (
          <button onClick={onReset}
            className="flex items-center gap-1 text-[11px] font-bold mono-tag px-2 py-0.5 border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-black transition-all">
            <RotateCcw className="w-3 h-3" />
            RESET
          </button>
        )}
      </div>

      {/* Priority filter */}
      <div className="mb-3">
        <p className="text-[11px] mono-tag mb-1.5 text-gray-400">ĐỘ ƯU TIÊN</p>
        <div className="flex gap-1.5">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              onClick={() => onPriorityChange(filterPriority === p.value ? undefined : p.value)}
              className="px-3 py-1 text-xs font-semibold mono-tag border transition-all flex-1"
              style={{
                background: filterPriority === p.value ? "oklch(0.72 0.22 142 / 0.2)" : "oklch(0.14 0.018 260)",
                borderColor: filterPriority === p.value ? "oklch(0.72 0.22 142)" : "oklch(0.28 0.035 260)",
                color: filterPriority === p.value ? "oklch(0.96 0.01 142)" : "oklch(0.70 0.02 260)",
              }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div>
          <p className="text-[11px] mono-tag mb-1.5 text-gray-400">DANH MỤC</p>
          <div className="flex gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => onCategoryChange(filterCategory === cat._id ? undefined : cat._id)}
                className="px-3 py-1 text-xs font-semibold mono-tag border transition-all"
                style={{
                  background: filterCategory === cat._id ? `${cat.color}25` : "oklch(0.14 0.018 260)",
                  borderColor: filterCategory === cat._id ? cat.color : "oklch(0.28 0.035 260)",
                  color: filterCategory === cat._id ? cat.color : "oklch(0.70 0.02 260)",
                }}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
