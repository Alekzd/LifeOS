"use client";

import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Doc, Id } from "@convex/_generated/dataModel";
import { useState, useRef, useEffect } from "react";
import { X, Zap, Calendar, Flag, Tag, ChevronDown, Clock, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { useLanguage } from "@/context/LanguageContext";

type Category = Doc<"categories">;

interface QuickCaptureProps {
  categories: Category[];
  onClose: () => void;
  defaultCategory?: Id<"categories">;
}

type TimePlanId = "today" | "1h" | "2h" | "3h" | "tomorrow" | "custom";

interface TimePlan {
  id: TimePlanId;
  label: string;
  sublabel?: string;
  getDate: () => Date;
}

function getTimePlans(lang: "vi" | "en" = "vi"): TimePlan[] {
  const now = new Date();

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 0, 0);

  const plus1h = new Date(now.getTime() + 60 * 60 * 1000);
  const plus2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const plus3h = new Date(now.getTime() + 3 * 60 * 60 * 1000);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 0, 0);

  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  return [
    {
      id: "today",
      label: lang === "vi" ? "Hôm nay" : "Today",
      sublabel: "23:59",
      getDate: () => todayEnd,
    },
    {
      id: "1h",
      label: lang === "vi" ? "+1 giờ" : "+1 hour",
      sublabel: fmt(plus1h),
      getDate: () => plus1h,
    },
    {
      id: "2h",
      label: lang === "vi" ? "+2 giờ" : "+2 hours",
      sublabel: fmt(plus2h),
      getDate: () => plus2h,
    },
    {
      id: "3h",
      label: lang === "vi" ? "+3 giờ" : "+3 hours",
      sublabel: fmt(plus3h),
      getDate: () => plus3h,
    },
    {
      id: "tomorrow",
      label: lang === "vi" ? "Ngày mai" : "Tomorrow",
      sublabel: "23:59",
      getDate: () => tomorrow,
    },
  ];
}

function getLocalDatetimeString(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function QuickCapture({ categories, onClose, defaultCategory }: QuickCaptureProps) {
  const { getToken, isSignedIn } = useAuth();
  const { t, language } = useLanguage();

  const PRIORITIES = [
    { value: "high" as const, label: t("task_priority_high"), color: "oklch(0.65 0.22 25)" },
    { value: "medium" as const, label: t("task_priority_medium"), color: "oklch(0.80 0.16 85)" },
    { value: "low" as const, label: t("task_priority_low"), color: "oklch(0.72 0.18 142)" },
  ];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [categoryId, setCategoryId] = useState<Id<"categories"> | undefined>(defaultCategory);

  const timePlans = getTimePlans(language);
  const [selectedPlan, setSelectedPlan] = useState<TimePlanId>("today");
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [customDate, setCustomDate] = useState(() => getLocalDatetimeString());

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const createTask = useMutation(api.tasks.createTask);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSelectPlan = (plan: TimePlan) => {
    setSelectedPlan(plan.id);
    setShowCustomDate(false);
  };

  const handleCustom = () => {
    setSelectedPlan("custom");
    setShowCustomDate(true);
    setTimeout(() => dateInputRef.current?.showPicker?.(), 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (!isSignedIn) {
        setErrorMsg(language === "vi" ? "⚠️ Bạn chưa đăng nhập. Vui lòng đăng nhập lại!" : "⚠️ Please sign in first!");
        setIsLoading(false);
        return;
      }

      const token = await getToken({ template: "convex" });
      if (!token) {
        setErrorMsg(language === "vi"
          ? "⚠️ Chưa cấp JWT Token 'convex' từ Clerk Dashboard."
          : "⚠️ Clerk JWT Token template 'convex' missing.");
        setIsLoading(false);
        return;
      }

      let finalDueDate: number;
      if (selectedPlan === "custom") {
        const parsed = customDate ? new Date(customDate).getTime() : Date.now();
        finalDueDate = isNaN(parsed) ? Date.now() : parsed;
      } else {
        const plan = timePlans.find(p => p.id === selectedPlan) ?? timePlans[0];
        finalDueDate = plan.getDate().getTime();
      }

      const payload: any = {
        title: title.trim(),
        description: description.trim() || undefined,
        status: "todo",
        priority,
        dueDate: finalDueDate,
      };
      if (categoryId) {
        payload.categoryId = categoryId;
      }

      await createTask(payload);
      onClose();
    } catch (err: any) {
      console.error("Task creation error:", err);
      const msg = err?.message || String(err);
      setErrorMsg(`Error: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const activePlanInfo = selectedPlan !== "custom"
    ? timePlans.find(p => p.id === selectedPlan)
    : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/80"
        onClick={onClose}
      />

      {/* iOS-Style Bottom Sheet on mobile / Center modal on desktop */}
      <div
        className="fixed z-50 bg-surface-card border border-surface-border
          bottom-0 left-0 right-0
          md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:max-w-lg md:w-full"
        style={{ maxHeight: "92dvh", overflowY: "auto" }}
      >
        {/* Mobile drag handle bar */}
        <div className="md:hidden pt-2 pb-1 bg-surface-dark flex justify-center border-b border-surface-border/50">
          <div className="sheet-drag-handle" />
        </div>

        <form onSubmit={handleSubmit} className="pb-[max(16px,env(safe-area-inset-bottom))]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border bg-surface-dark">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mono-tag">
              <Zap className="w-4 h-4" />
              <span>// {language === "vi" ? "THÊM TASK MỚI" : "NEW TASK"}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 border border-surface-border bg-surface-card text-gray-400 hover:text-white touch-target flex items-center justify-center"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {errorMsg && (
              <div className="p-2.5 text-xs border border-red-500/50 bg-red-500/10 text-red-400 font-mono">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Title Input */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 text-xs mono-tag pointer-events-none">$</span>
              <input
                ref={inputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("quick_capture_placeholder")}
                className="w-full pl-7 pr-3 py-3 text-sm mono-tag bg-surface-dark border border-surface-border text-emerald-400 outline-none focus:border-emerald-400"
                required
              />
            </div>

            {/* ── TIME PLAN CHIPS & NATIVE IOS PICKER ─────────────────────────── */}
            <div>
              <p className="text-[11px] mono-tag mb-2 text-gray-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  {language === "vi" ? "Thời hạn & Lịch trình" : "Due Date & Schedule"}
                </span>
                <span className="text-[10px] text-gray-500">iOS Native Picker</span>
              </p>

              <div className="flex gap-1.5 flex-wrap">
                {timePlans.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => handleSelectPlan(plan)}
                    className={cn(
                      "time-chip flex-col gap-0",
                      selectedPlan === plan.id && "active"
                    )}
                    style={{ paddingTop: "6px", paddingBottom: "6px", minWidth: "52px" }}
                  >
                    <span>{plan.label}</span>
                    {plan.sublabel && (
                      <span className="text-[9px] opacity-60 font-normal" style={{ letterSpacing: 0 }}>
                        {plan.sublabel}
                      </span>
                    )}
                  </button>
                ))}

                {/* Native iOS Picker Trigger Button */}
                <button
                  type="button"
                  onClick={handleCustom}
                  className={cn("time-chip flex items-center gap-1", selectedPlan === "custom" && "active")}
                  style={{ paddingTop: "6px", paddingBottom: "6px" }}
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === "vi" ? "Chọn lịch iOS" : "Pick Date"}</span>
                </button>
              </div>

              {/* Native iOS Datetime Input (Triggers native iOS scroll wheel) */}
              {showCustomDate && (
                <div className="mt-2.5 p-3 bg-surface-dark border border-emerald-400/50 space-y-1.5">
                  <label className="block text-[10px] mono-tag text-emerald-400 font-bold uppercase">
                    📱 {language === "vi" ? "Trình chọn ngày & giờ chuẩn iPhone / Android:" : "Native OS Date & Time Wheel:"}
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <input
                      ref={dateInputRef}
                      type="datetime-local"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="flex-1 bg-surface-card border border-surface-border px-3 py-2 text-xs mono-tag text-emerald-400 outline-none focus:border-emerald-400 cursor-pointer"
                      style={{ colorScheme: "dark" }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ── PRIORITY ────────────────────────────────────── */}
            <div>
              <p className="text-[11px] mono-tag mb-1.5 text-gray-400">{t("quick_capture_priority")}</p>
              <div className="flex gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className="flex-1 py-2 text-xs font-bold mono-tag border transition-all"
                    style={{
                      background: priority === p.value ? `${p.color}20` : "var(--color-surface-dark)",
                      borderColor: priority === p.value ? p.color : "var(--color-surface-border)",
                      color: priority === p.value ? p.color : "var(--color-text-secondary)",
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── ADVANCED: description + category ─────────────── */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-xs mono-tag text-gray-500 hover:text-gray-300 transition-all"
            >
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showAdvanced && "rotate-180")} />
              {showAdvanced
                ? (language === "vi" ? "Thu gọn" : "Collapse")
                : (language === "vi" ? "+ Thêm mô tả, danh mục" : "+ Add description, category")}
            </button>

            {showAdvanced && (
              <div className="space-y-3">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("quick_capture_desc_placeholder")}
                  rows={2}
                  className="w-full px-3 py-2 text-xs mono-tag bg-surface-dark border border-surface-border text-gray-200 resize-none outline-none focus:border-emerald-400/50"
                />

                {categories.length > 0 && (
                  <div>
                    <p className="text-[11px] mono-tag mb-1.5 text-gray-400">
                      <Tag className="w-3 h-3 inline mr-1" />{t("quick_capture_category")}
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setCategoryId(undefined)}
                        className="px-2.5 py-1 text-xs mono-tag border transition-all"
                        style={{
                          background: !categoryId ? "oklch(0.72 0.22 142 / 0.2)" : "var(--color-surface-dark)",
                          borderColor: !categoryId ? "oklch(0.72 0.22 142)" : "var(--color-surface-border)",
                          color: !categoryId ? "var(--color-text-primary)" : "var(--color-text-muted)",
                        }}
                      >
                        {t("quick_capture_no_category")}
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat._id}
                          type="button"
                          onClick={() => setCategoryId(cat._id)}
                          className="px-2.5 py-1 text-xs mono-tag border transition-all"
                          style={{
                            background: categoryId === cat._id ? `${cat.color}25` : "var(--color-surface-dark)",
                            borderColor: categoryId === cat._id ? cat.color : "var(--color-surface-border)",
                            color: categoryId === cat._id ? cat.color : "var(--color-text-secondary)",
                          }}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!title.trim() || isLoading}
              className="w-full py-3 text-sm font-bold text-black bg-emerald-400 hover:bg-emerald-300 border border-emerald-400 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-black" />
                  {activePlanInfo
                    ? (language === "vi"
                        ? `Tạo task — ${activePlanInfo.label} ${activePlanInfo.sublabel ?? ""}`
                        : `Create Task — ${activePlanInfo.label} ${activePlanInfo.sublabel ?? ""}`)
                    : t("quick_capture_submit")}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
