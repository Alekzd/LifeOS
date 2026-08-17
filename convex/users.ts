import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import {
  requireAuth,
  getUser,
  requireUser,
  getAdmin,
  requireAdmin,
  generateReferralCode,
  calculateNewStreak,
  formatDateKey,
} from "./helpers";

// ── UPSERT USER (Clerk webhook sync + first sign-in) ─────────────────────────
export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    referredBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
    const userEmail = args.email.trim().toLowerCase();
    const now = Date.now();

    const isAdminEmailMatch = adminEmail !== "" && userEmail === adminEmail;

    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      // If user exists and email matches ADMIN_EMAIL, auto-promote to admin
      const shouldPromote = isAdminEmailMatch && existing.role !== "admin";

      await ctx.db.patch(existing._id, {
        name: args.name,
        avatarUrl: args.avatarUrl,
        ...(shouldPromote ? { role: "admin" } : {}),
        updatedAt: now,
      });
      return existing._id;
    }

    // Determine role: matching ADMIN_EMAIL gets admin
    const role = isAdminEmailMatch ? "admin" : "user";

    // Generate unique referral code
    let referralCode = generateReferralCode();
    let attempts = 0;
    while (attempts < 5) {
      const conflict = await ctx.db
        .query("users")
        .withIndex("by_referralCode", (q) => q.eq("referralCode", referralCode))
        .unique();
      if (!conflict) break;
      referralCode = generateReferralCode();
      attempts++;
    }

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      avatarUrl: args.avatarUrl,
      role,
      streakCount: 0,
      lastActiveDate: undefined,
      referralCode,
      referredBy: args.referredBy,
      createdAt: now,
      updatedAt: now,
    });

    // Create default categories
    await ctx.db.insert("categories", {
      userId: args.clerkId,
      name: "Công Việc",
      color: "oklch(0.62 0.22 264)",
      icon: "Briefcase",
      createdAt: now,
    });
    await ctx.db.insert("categories", {
      userId: args.clerkId,
      name: "Cá Nhân",
      color: "oklch(0.68 0.22 320)",
      icon: "User",
      createdAt: now,
    });
    await ctx.db.insert("categories", {
      userId: args.clerkId,
      name: "Học Tập",
      color: "oklch(0.65 0.20 145)",
      icon: "BookOpen",
      createdAt: now,
    });

    // Track referral if applicable
    if (args.referredBy) {
      const referrer = await ctx.db
        .query("users")
        .withIndex("by_referralCode", (q) => q.eq("referralCode", args.referredBy!))
        .unique();
      if (referrer) {
        await ctx.db.insert("referralEvents", {
          referralCode: args.referredBy,
          referrerId: referrer.clerkId,
          newUserId: args.clerkId,
          createdAt: now,
        });
      }
    }

    return userId;
  },
});

// ── GET CURRENT USER ─────────────────────────────────────────────────────────
export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      const adminEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
      const userEmail = (identity.email ?? "").trim().toLowerCase();
      const isAdminEmailMatch = adminEmail !== "" && userEmail === adminEmail;
      return {
        _id: "temp" as any,
        _creationTime: Date.now(),
        clerkId: identity.subject,
        email: identity.email ?? "",
        name: identity.name ?? identity.givenName ?? "User",
        avatarUrl: identity.pictureUrl,
        role: (isAdminEmailMatch ? "admin" : "user") as "admin" | "user",
        streakCount: 0,
        referralCode: "",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    return user;
  },
});

// ── UPDATE STREAK ────────────────────────────────────────────────────────────
export const updateStreak = mutation({
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const today = formatDateKey(new Date());

    if (user.lastActiveDate === today) return; // Already updated today

    const newStreak = calculateNewStreak(user.streakCount, user.lastActiveDate, today);
    await ctx.db.patch(user._id, {
      streakCount: newStreak,
      lastActiveDate: today,
      updatedAt: Date.now(),
    });
  },
});

// ── ADMIN: LIST ALL USERS ────────────────────────────────────────────────────
export const listAllUsers = query({
  handler: async (ctx) => {
    const admin = await getAdmin(ctx);
    if (!admin) return [];
    return await ctx.db.query("users").order("desc").collect();
  },
});

// ── ADMIN: UPDATE USER ROLE ──────────────────────────────────────────────────
export const updateUserRole = mutation({
  args: {
    targetUserId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.targetUserId, { role: args.role, updatedAt: Date.now() });
  },
});

// ── ADMIN: GET ANALYTICS ─────────────────────────────────────────────────────
export const getAnalytics = query({
  handler: async (ctx) => {
    const admin = await getAdmin(ctx);
    if (!admin) return null;

    const allUsers = await ctx.db.query("users").collect();
    const allTasks = await ctx.db.query("tasks").collect();
    const allReferralEvents = await ctx.db.query("referralEvents").collect();

    const totalUsers = allUsers.length;
    const adminUsers = allUsers.filter((u) => u.role === "admin").length;

    const today = formatDateKey(new Date());
    const activeTodayUsers = allUsers.filter((u) => u.lastActiveDate === today).length;

    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const newUsersThisWeek = allUsers.filter((u) => u.createdAt >= oneWeekAgo).length;

    const totalStreaks = allUsers.reduce((sum, u) => sum + (u.streakCount || 0), 0);
    const avgStreak = totalUsers > 0 ? Math.round((totalStreaks / totalUsers) * 10) / 10 : 0;

    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter((t) => t.status === "completed").length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalUsers,
      adminUsers,
      activeTodayUsers,
      dau: activeTodayUsers,
      newUsersThisWeek,
      avgStreak,
      totalReferrals: allReferralEvents.length,
      totalTasks,
      completedTasks,
      completionRate,
    };
  },
});
