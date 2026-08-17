"use client";

import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Doc, Id } from "@convex/_generated/dataModel";
import { useState, useRef, useEffect } from "react";
import { X, Zap, Calendar, Flag, Tag, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Category = Doc<"categories">;

const PRIORITIES = [
  { value: "high" as const, label: "🔴 Cao", color: "oklch(0.65 0.22 25)" },
  { value: "medium" as const, label: "🟡 TB", color: "oklch(0.80 0.16 85)" },
  { value: "low" as const, label: "🟢 Thấp", color: "oklch(0.72 0.18 142)" },
];

interface QuickCaptureProps {
  categories: Category[];
  onClose: () => void;
}

export default function QuickCapture({ categories, onClose }: QuickCaptureProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [categoryId, setCategoryId] = useState<Id<"categories"> | undefined>();
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setHours(23, 59, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const createTask = useMutation(api.tasks.createTask);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        status: "todo",
        priority,
        dueDate: new Date(dueDate).getTime(),
        categoryId,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/80"
        onClick={onClose}
      />

      {/* Bottom Sheet / Modal */}
      <div
        className="fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:max-w-xl z-50 border border-surface-border bg-surface-card p-5"
        style={{
          maxHeight: "90dvh",
          overflowY: "auto",
        }}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <h2 className="font-bold text-base mono-tag text-emerald-400 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>// THÊM TASK MỚI</span>
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 border border-surface-border bg-surface-dark text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title Input */}
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề task mới... (nhấn Enter để tạo)"
            className="w-full px-3.5 py-2.5 text-sm mono-tag bg-surface-dark border border-surface-border text-emerald-400"
            required
          />

          {/* Priority Quick Select */}
          <div>
            <p className="text-[11px] mono-tag mb-1.5 text-gray-400">ĐỘ ƯU TIÊN</p>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className="flex-1 py-2 text-xs font-bold mono-tag border transition-all"
                  style={{
                    background: priority === p.value ? `${p.color}20` : "oklch(0.14 0.018 260)",
                    borderColor: priority === p.value ? p.color : "oklch(0.28 0.035 260)",
                    color: priority === p.value ? p.color : "oklch(0.70 0.02 260)",
                  }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div className="flex items-center gap-2 px-3 py-2 bg-surface-dark border border-surface-border">
            <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-xs mono-tag text-gray-200"
            />
          </div>

          {/* Advanced Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs mono-tag text-gray-400 hover:text-emerald-400 transition-all">
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showAdvanced && "rotate-180")} />
            {showAdvanced ? "Ẩn mô tả & danh mục" : "Thêm mô tả & danh mục phân loại"}
          </button>

          {showAdvanced && (
            <div className="space-y-3">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả chi tiết..."
                rows={2}
                className="w-full px-3 py-2 text-xs mono-tag bg-surface-dark border border-surface-border text-gray-200 resize-none"
              />

              {categories.length > 0 && (
                <div>
                  <p className="text-[11px] mono-tag mb-1.5 text-gray-400">
                    <Tag className="w-3 h-3 inline mr-1" />DANH MỤC
                  </p>
                  <div className="flex gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setCategoryId(undefined)}
                      className="px-2.5 py-1 text-xs mono-tag border transition-all"
                      style={{
                        background: !categoryId ? "oklch(0.72 0.22 142 / 0.2)" : "oklch(0.14 0.018 260)",
                        borderColor: !categoryId ? "oklch(0.72 0.22 142)" : "oklch(0.28 0.035 260)",
                        color: !categoryId ? "oklch(0.96 0.01 142)" : "oklch(0.60 0.02 260)",
                      }}>
                      Không có
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        type="button"
                        onClick={() => setCategoryId(cat._id)}
                        className="px-2.5 py-1 text-xs mono-tag border transition-all"
                        style={{
                          background: categoryId === cat._id ? `${cat.color}25` : "oklch(0.14 0.018 260)",
                          borderColor: categoryId === cat._id ? cat.color : "oklch(0.28 0.035 260)",
                          color: categoryId === cat._id ? cat.color : "oklch(0.70 0.02 260)",
                        }}>
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!title.trim() || isLoading}
            className="w-full py-2.5 text-sm font-bold text-black bg-emerald-400 hover:bg-emerald-300 border border-emerald-400 flex items-center justify-center gap-2">
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-black border-t-transparent animate-spin" />
            ) : (
              <>
                <Zap className="w-4 h-4 fill-black" />
                THÊM TASK CÔNG VIỆC
              </>
            )}
          </button>
        </form>
      </div>
    </>
  );
}
