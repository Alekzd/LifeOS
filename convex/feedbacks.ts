import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser, getAdmin, requireAdmin } from "./helpers";

export const submitFeedback = mutation({
  args: {
    adoptionRating: v.number(),
    adoptionReason: v.string(),
    painPoints: v.string(),
    featureRequests: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    if (args.adoptionRating < 1 || args.adoptionRating > 10) {
      throw new Error("Rating phải từ 1-10.");
    }
    return await ctx.db.insert("feedbacks", {
      userId: user.clerkId,
      userName: user.name,
      userEmail: user.email,
      adoptionRating: args.adoptionRating,
      adoptionReason: args.adoptionReason,
      painPoints: args.painPoints,
      featureRequests: args.featureRequests,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const listFeedbacks = query({
  args: {
    status: v.optional(v.union(v.literal("pending"), v.literal("reviewed"), v.literal("resolved"))),
  },
  handler: async (ctx, args) => {
    const admin = await getAdmin(ctx);
    if (!admin) return [];
    if (args.status) {
      return await ctx.db
        .query("feedbacks")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("feedbacks").order("desc").collect();
  },
});

export const updateFeedbackStatus = mutation({
  args: {
    feedbackId: v.id("feedbacks"),
    status: v.union(v.literal("pending"), v.literal("reviewed"), v.literal("resolved")),
    adminNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.feedbackId, {
      status: args.status,
      adminNote: args.adminNote,
    });
  },
});
