"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import {
  Users, Shield, TrendingUp, CheckSquare, Flame, Gift,
  Crown, Megaphone, Plus, Trash2, CheckCircle2,
  BarChart3, Sparkles
} from "lucide-react";
import { cn, formatRelative } from "@/lib/utils";

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub: string; color: string }) {
  return (
    <div className="terminal-card p-4 border border-surface-border card-lift">
      <div className="text-[11px] font-bold uppercase tracking-wider mono-tag text-gray-400 mb-1">
        {label}
      </div>
      <div className="text-2xl font-bold font-mono mb-1" style={{ color }}>
        {value}
      </div>
      <div className="text-[11px] mono-tag text-gray-400">
        {sub}
      </div>
    </div>
  );
}

function GrowthCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string | number;
  sub: string;
  color: string;
}) {
  return (
    <div className="terminal-card p-4 border border-surface-border card-lift">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider mono-tag text-gray-400">{label}</span>
        <div className="w-6 h-6 flex items-center justify-center border border-surface-border bg-surface-dark">
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
      </div>
      <div className="text-xl font-bold font-mono mb-1 text-white">
        {value}
      </div>
      <div className="text-[11px] mono-tag text-gray-400">
        {sub}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [announcementType, setAnnouncementType] = useState<"info" | "warning" | "feature">("info");
  const [activeTab, setActiveTab] = useState<"analytics" | "users" | "announcements" | "feedbacks">("analytics");

  const currentUser = useQuery(api.users.getCurrentUser);
  const isAdmin = currentUser?.role === "admin";

  const analyticsData = useQuery(api.users.getAnalytics, isAdmin ? {} : "skip");
  const analytics: any = analyticsData;
  const users = useQuery(api.users.listAllUsers, isAdmin ? {} : "skip");
  const announcements = useQuery(api.announcements.listActiveAnnouncements);
  const feedbacks = useQuery(api.feedbacks.listFeedbacks, isAdmin ? {} : "skip");

  const updateUserRole = useMutation(api.users.updateUserRole);
  const createAnnouncement = useMutation(api.announcements.createAnnouncement);
  const deleteAnnouncement = useMutation(api.announcements.deleteAnnouncement);
  const updateFeedbackStatus = useMutation(api.feedbacks.updateFeedbackStatus);

  if (currentUser === undefined) {
    return <div className="p-8 text-center text-xs mono-tag text-gray-400">Đang kiểm tra quyền Admin...</div>;
  }

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="p-8 text-center max-w-md mx-auto my-12 terminal-card border border-red-500/40">
        <div className="text-3xl mb-2">🚫</div>
        <h2 className="text-sm font-bold text-red-400 font-mono mb-2">// ACCESS DENIED (403)</h2>
        <p className="text-xs text-gray-300">
          Bạn không có quyền truy cập trang quản trị hệ thống. Tài khoản phải có role <code className="text-amber-400">admin</code>.
        </p>
      </div>
    );
  }

  const handleRoleToggle = async (targetUserId: any, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (confirm(`Đổi quyền tài khoản thành ${newRole.toUpperCase()}?`)) {
      await updateUserRole({ targetUserId, role: newRole });
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementContent.trim()) return;

    await createAnnouncement({
      title: announcementTitle,
      content: announcementContent,
      type: announcementType,
    });

    setAnnouncementTitle("");
    setAnnouncementContent("");
    alert("Đã phát thông báo toàn hệ thống!");
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold mono-tag border border-amber-500/50 bg-amber-950/30 text-amber-400">
              ROLE: SYSTEM ADMIN
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold font-mono text-white tracking-tight mt-1 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <span>DASHBOARD QUẢN TRỊ LIFE OS</span>
          </h1>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex gap-1 overflow-x-auto p-1 bg-surface-dark border border-surface-border">
          {[
            { id: "analytics", label: "Analytics" },
            { id: "users", label: `Users (${users?.length ?? 0})` },
            { id: "announcements", label: "Broadcasts" },
            { id: "feedbacks", label: `Feedback (${feedbacks?.length ?? 0})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold mono-tag whitespace-nowrap transition-all border",
                activeTab === t.id
                  ? "bg-amber-400 border-amber-400 text-black font-bold"
                  : "bg-transparent border-transparent text-gray-400 hover:text-white"
              )}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Analytics */}
      {activeTab === "analytics" && (
        <div className="space-y-4">
          <div className="terminal-card p-4 border border-surface-border">
            <h2 className="text-xs font-bold uppercase tracking-wider mono-tag text-gray-400 mb-3 flex items-center gap-2 pb-2 border-b border-surface-border">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>// CHỈ SỐ TĂNG TRƯỞNG SYSTEM</span>
            </h2>

            {analytics ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <GrowthCard icon={Users} label="Tổng Người Dùng" value={analytics.totalUsers}
                    sub={`+${analytics.newUsersThisWeek ?? 0} tuần này`} color="#4fc1ff" />
                  <GrowthCard icon={TrendingUp} label="DAU Hoạt Động" value={analytics.dau ?? analytics.activeTodayUsers}
                    sub={`${analytics.totalUsers > 0 ? Math.round((analytics.dau ?? analytics.activeTodayUsers) / analytics.totalUsers * 100) : 0}% active`}
                    color="#3fb950" />
                  <GrowthCard icon={CheckSquare} label="Tỷ Lệ Hoàn Thành" value={`${analytics.completionRate}%`}
                    sub={`${analytics.completedTasks}/${analytics.totalTasks} tasks`} color="#dcdcaa" />
                  <GrowthCard icon={Flame} label="Streak TB" value={analytics.avgStreak ?? 0}
                    sub="ngày liên tục" color="#ff7b72" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GrowthCard icon={Gift} label="Tổng Lượt Referrals" value={analytics.totalReferrals ?? 0}
                    sub="Lượt đăng ký qua link cá nhân" color="#d2a8ff" />
                  <GrowthCard icon={CheckSquare} label="Tổng Tasks Tạo Ra" value={analytics.totalTasks}
                    sub="Toàn bộ task trong database" color="#4fc1ff" />
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 shimmer border border-surface-border" />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Users Management */}
      {activeTab === "users" && (
        <div className="terminal-card p-4 border border-surface-border">
          <h2 className="text-xs font-bold uppercase tracking-wider mono-tag text-gray-400 mb-3 flex items-center justify-between pb-2 border-b border-surface-border">
            <span>// DANH SÁCH USER NGƯỜI DÙNG</span>
            <span className="text-emerald-400">{users?.length ?? 0} HỒ SƠ</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-surface-border text-gray-400 bg-surface-dark">
                  <th className="p-2.5">User</th>
                  <th className="p-2.5">Email</th>
                  <th className="p-2.5">Role</th>
                  <th className="p-2.5">Streak</th>
                  <th className="p-2.5">Mã Ref</th>
                  <th className="p-2.5">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50">
                {users?.map((u: any) => (
                  <tr key={u._id} className="hover:bg-surface-raised transition-all">
                    <td className="p-2.5 font-bold text-white flex items-center gap-2">
                      <div className="w-6 h-6 border border-surface-border bg-surface-dark flex items-center justify-center text-[10px] text-emerald-400">
                        {u.name[0]}
                      </div>
                      {u.name}
                    </td>
                    <td className="p-2.5 text-gray-300">{u.email}</td>
                    <td className="p-2.5">
                      <span className={cn(
                        "px-2 py-0.5 text-[10px] font-bold border",
                        u.role === "admin"
                          ? "border-amber-400/50 bg-amber-950/30 text-amber-400"
                          : "border-surface-border text-gray-300"
                      )}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-2.5 text-amber-400 font-bold">🔥 {u.streakCount}d</td>
                    <td className="p-2.5 text-emerald-400">{u.referralCode}</td>
                    <td className="p-2.5">
                      <button
                        onClick={() => handleRoleToggle(u._id, u.role)}
                        className="px-2.5 py-1 text-[11px] font-bold border border-surface-border hover:border-emerald-400 text-gray-200">
                        {u.role === "admin" ? "Hạ xuống User" : "Thăng Admin"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Announcements */}
      {activeTab === "announcements" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-6 terminal-card p-4 border border-surface-border">
            <h2 className="text-xs font-bold uppercase tracking-wider mono-tag text-gray-400 mb-3 pb-2 border-b border-surface-border">
              // TẠO BẮN THÔNG BÁO BROADCAST
            </h2>
            <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mono-tag mb-1">Tiêu đề thông báo:</label>
                <input
                  type="text"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="Ví dụ: Bảo trì hệ thống 15 phút"
                  className="w-full p-2 mono-tag bg-surface-dark border border-surface-border text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mono-tag mb-1">Nội dung chi tiết:</label>
                <textarea
                  value={announcementContent}
                  onChange={(e) => setAnnouncementContent(e.target.value)}
                  placeholder="Nhập nội dung hiển thị cho tất cả người dùng..."
                  rows={3}
                  className="w-full p-2 mono-tag bg-surface-dark border border-surface-border text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mono-tag mb-1">Mức độ ưu tiên:</label>
                <select
                  value={announcementType}
                  onChange={(e) => setAnnouncementType(e.target.value as any)}
                  className="w-full p-2 mono-tag bg-surface-dark border border-surface-border text-white">
                  <option value="info">Thông tin (Info)</option>
                  <option value="warning">Cảnh báo (Warning)</option>
                  <option value="feature">Tính năng mới (Feature)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-400 hover:bg-emerald-300 text-black font-bold mono-tag border border-emerald-400 flex items-center justify-center gap-1.5">
                <Megaphone className="w-4 h-4" />
                PHÁT THÔNG BÁO TOÀN TRANG
              </button>
            </form>
          </div>

          <div className="lg:col-span-6 terminal-card p-4 border border-surface-border">
            <h2 className="text-xs font-bold uppercase tracking-wider mono-tag text-gray-400 mb-3 pb-2 border-b border-surface-border">
              // THÔNG BÁO ĐANG HIỂN THỊ
            </h2>
            <div className="space-y-2">
              {announcements?.map((a: any) => (
                <div key={a._id} className="p-3 bg-surface-dark border border-surface-border flex items-start justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-amber-400 mono-tag block">{a.title}</span>
                    <p className="text-gray-300 mt-1">{a.content}</p>
                  </div>
                  <button
                    onClick={() => deleteAnnouncement({ announcementId: a._id })}
                    className="p-1 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-black">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Feedbacks */}
      {activeTab === "feedbacks" && (
        <div className="terminal-card p-4 border border-surface-border">
          <h2 className="text-xs font-bold uppercase tracking-wider mono-tag text-gray-400 mb-3 flex items-center justify-between pb-2 border-b border-surface-border">
            <span>// Ý KIẾN PHẢN HỒI NGƯỜI DÙNG</span>
            <span className="text-emerald-400">{feedbacks?.length ?? 0} FEEDBACKS</span>
          </h2>

          <div className="space-y-2.5">
            {feedbacks?.map((f: any) => (
              <div key={f._id} className="p-3 bg-surface-dark border border-surface-border text-xs space-y-1.5 text-left">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-emerald-400 mono-tag">{f.type ? f.type.toUpperCase() : "FEEDBACK"}</span>
                  <span className="text-[11px] text-gray-400 mono-tag">{formatRelative(f.createdAt)}</span>
                </div>
                <p className="text-gray-200">{f.message ?? f.painPoints ?? f.featureRequests}</p>
                <div className="flex items-center justify-between pt-1 border-t border-surface-border/50 text-[11px]">
                  <span className="text-gray-400">Trạng thái: <strong className="text-white">{f.status}</strong></span>
                  {f.status === "pending" && (
                    <button
                      onClick={() => updateFeedbackStatus({ feedbackId: f._id, status: "reviewed" })}
                      className="px-2 py-0.5 border border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-black mono-tag font-bold">
                      Đánh dấu đã xem
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
