"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { MessageSquare, Send, Flame, Gift, User } from "lucide-react";

export default function SettingsPage() {
  const { user } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);
  const submitFeedback = useMutation(api.feedbacks.submitFeedback);

  const [rating, setRating] = useState(0);
  const [adoptionReason, setAdoptionReason] = useState("");
  const [painPoints, setPainPoints] = useState("");
  const [featureRequests, setFeatureRequests] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !adoptionReason || !painPoints || !featureRequests) return;
    setLoading(true);
    try {
      await submitFeedback({ adoptionRating: rating, adoptionReason, painPoints, featureRequests });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 mb-5 pb-4 border-b border-surface-border">
        <div>
          <h1 className="text-lg sm:text-xl font-bold font-mono text-white tracking-tight">
            CÀI ĐẶT & FEEDBACK SURVEY <span className="text-emerald-400">⚙️</span>
          </h1>
          <p className="text-xs mono-tag text-gray-400 mt-0.5">
            Quản lý thông tin tài khoản & gửi khảo sát trải nghiệm thực tế
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: User Profile & Streak Summary (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          {currentUser && (
            <div className="terminal-card p-5 border border-surface-border bg-surface-card">
              <div className="flex items-center gap-3.5 mb-4 pb-4 border-b border-surface-border">
                <div className="w-12 h-12 flex items-center justify-center font-bold text-black text-lg bg-emerald-400 border border-emerald-400 flex-shrink-0 font-mono">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-emerald-400 font-mono truncate">
                      {currentUser.name}
                    </p>
                    <span className="px-2 py-0.5 text-[10px] mono-tag font-bold uppercase border"
                      style={{
                        background: currentUser.role === "admin" ? "oklch(0.82 0.18 85 / 0.15)" : "oklch(0.72 0.22 142 / 0.15)",
                        color: currentUser.role === "admin" ? "oklch(0.85 0.18 85)" : "oklch(0.78 0.22 142)",
                        borderColor: currentUser.role === "admin" ? "oklch(0.82 0.18 85 / 0.4)" : "oklch(0.72 0.22 142 / 0.4)",
                      }}>
                      {currentUser.role}
                    </span>
                  </div>
                  <p className="text-xs mono-tag text-gray-400 truncate mt-0.5">
                    {currentUser.email}
                  </p>
                </div>
              </div>

              {/* Stats Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border border-surface-border bg-surface-dark">
                  <div className="flex items-center gap-2 text-xs font-semibold mono-tag text-gray-300">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>STREAK NĂNG SUẤT</span>
                  </div>
                  <span className="text-xs font-bold mono-tag text-amber-400">
                    🔥 {currentUser.streakCount} NGÀY
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 border border-surface-border bg-surface-dark">
                  <div className="flex items-center gap-2 text-xs font-semibold mono-tag text-gray-300">
                    <Gift className="w-4 h-4 text-cyan-400" />
                    <span>MÃ REFERRAL CODE</span>
                  </div>
                  <span className="text-xs font-bold mono-tag px-2 py-0.5 border border-cyan-400/40 text-cyan-400 bg-cyan-950/20">
                    {currentUser.referralCode}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Structured Feedback Form (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="terminal-card p-5 border border-surface-border bg-surface-card">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-surface-border">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <h2 className="font-bold text-sm font-mono text-emerald-400">
                // GỬI PHẢN HỒI PHỎNG VẤN TRẢI NGHIỆM
              </h2>
            </div>

            {submitted ? (
              <div className="text-center py-12 text-gray-300">
                <div className="text-4xl mb-2">🙏</div>
                <p className="font-bold text-base text-emerald-400 font-mono">
                  CẢM ƠN PHẢN HỒI CỦA BẠN!
                </p>
                <p className="text-xs mono-tag mt-1 text-gray-400">
                  Thông tin phỏng vấn đã được ghi trực tiếp vào dữ liệu FEEDBACK.md.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Rating 1-10 */}
                <div>
                  <label className="text-xs font-semibold mono-tag block mb-2 text-gray-300">
                    1. Độ sẵn sàng sử dụng hàng ngày? (1 - 10)
                  </label>
                  <div className="flex gap-1 flex-wrap sm:flex-nowrap">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        className="flex-1 py-1.5 text-xs font-bold mono-tag border transition-all"
                        style={{
                          background: n <= rating ? "oklch(0.72 0.22 142)" : "oklch(0.14 0.018 260)",
                          borderColor: n <= rating ? "oklch(0.72 0.22 142)" : "oklch(0.28 0.035 260)",
                          color: n <= rating ? "black" : "oklch(0.60 0.02 260)",
                        }}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold mono-tag block mb-1 text-gray-300">
                    2. Lý do chọn dùng (Có dùng thay Apple Reminders / Notion không)?
                  </label>
                  <textarea value={adoptionReason} onChange={(e) => setAdoptionReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs mono-tag bg-surface-dark border border-surface-border text-gray-200 resize-none" rows={2}
                    placeholder="Vd: Giao diện Terminal phẳng vuông vức rất đẹp, Quick capture 3s cực nhanh..." required />
                </div>

                <div>
                  <label className="text-xs font-semibold mono-tag block mb-1 text-gray-300">
                    3. UX Pain Points (Gặp khó khăn gì khi thao tác)?
                  </label>
                  <textarea value={painPoints} onChange={(e) => setPainPoints(e.target.value)}
                    className="w-full px-3 py-2 text-xs mono-tag bg-surface-dark border border-surface-border text-gray-200 resize-none" rows={2}
                    placeholder="Vd: Cần nút bấm lọc theo ưu tiên rõ ràng hơn..." required />
                </div>

                <div>
                  <label className="text-xs font-semibold mono-tag block mb-1 text-gray-300">
                    4. Top 2 tính năng mong muốn nhất?
                  </label>
                  <textarea value={featureRequests} onChange={(e) => setFeatureRequests(e.target.value)}
                    className="w-full px-3 py-2 text-xs mono-tag bg-surface-dark border border-surface-border text-gray-200 resize-none" rows={2}
                    placeholder="Vd: Widget màn hình chính, Reminder thông báo Telegram..." required />
                </div>

                <button type="submit" disabled={loading || rating === 0}
                  id="submit-feedback-btn"
                  className="w-full py-2.5 text-xs sm:text-sm font-bold text-black bg-emerald-400 hover:bg-emerald-300 border border-emerald-400 flex items-center justify-center gap-2">
                  <Send className="w-4 h-4 fill-black" />
                  {loading ? "Đang gửi..." : "GỬI PHẢN HỒI FEEDBACK"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
