import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ── BẢNG NGƯỜI DÙNG & PHÂN QUYỀN (USERS & RBAC) ─────────────────────────
  users: defineTable({
    clerkId: v.string(),          // Subject ID từ Clerk JWT
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    role: v.union(v.literal("user"), v.literal("admin")), // 🛡️ RBAC
    streakCount: v.number(),       // 🔥 Chuỗi ngày năng suất
    lastActiveDate: v.optional(v.string()), // YYYY-MM-DD
    referralCode: v.string(),      // 🚀 Viral referral
    referredBy: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_referralCode", ["referralCode"])
    .index("by_role", ["role"]),

  // ── BẢNG CÔNG VIỆC (TASKS) ──────────────────────────────────────────────
  tasks: defineTable({
    userId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("completed")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    ),
    dueDate: v.number(),           // Epoch milliseconds
    categoryId: v.optional(v.id("categories")),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_user_date", ["userId", "dueDate"])
    .index("by_user_category", ["userId", "categoryId"]),

  // ── BẢNG DANH MỤC (CATEGORIES) ─────────────────────────────────────────
  categories: defineTable({
    userId: v.string(),
    name: v.string(),
    color: v.string(),             // OKLCH string hoặc hex
    icon: v.optional(v.string()),  // Lucide icon name
    isSystemTemplate: v.optional(v.boolean()), // Admin-created global templates
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_system", ["isSystemTemplate"]),

  // ── BẢNG PHẢN HỒI NGƯỜI DÙNG (FEEDBACKS) ───────────────────────────────
  feedbacks: defineTable({
    userId: v.string(),
    userName: v.string(),
    userEmail: v.string(),
    adoptionRating: v.number(),    // 1-10
    adoptionReason: v.string(),    // "Would they use daily?"
    painPoints: v.string(),
    featureRequests: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("reviewed"),
      v.literal("resolved")
    ),
    adminNote: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_user", ["userId"]),

  // ── BẢNG THÔNG BÁO HỆ THỐNG (SYSTEM ANNOUNCEMENTS) ─────────────────────
  announcements: defineTable({
    createdBy: v.string(),         // Admin clerkId
    title: v.string(),
    content: v.string(),
    type: v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("feature")
    ),
    isActive: v.boolean(),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
  })
    .index("by_active", ["isActive"]),

  // ── BẢNG REFERRAL TRACKING (PLG) ────────────────────────────────────────
  referralEvents: defineTable({
    referralCode: v.string(),
    referrerId: v.string(),
    newUserId: v.string(),
    createdAt: v.number(),
  })
    .index("by_referrer", ["referrerId"])
    .index("by_referralCode", ["referralCode"]),
});
