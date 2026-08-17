import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAdmin, requireAdmin } from "./helpers";

export const listActiveAnnouncements = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("announcements")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .order("desc")
      .collect();
  },
});

export const createAnnouncement = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    type: v.union(v.literal("info"), v.literal("warning"), v.literal("feature")),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    return await ctx.db.insert("announcements", {
      createdBy: admin.clerkId,
      title: args.title,
      content: args.content,
      type: args.type,
      isActive: true,
      createdAt: Date.now(),
      expiresAt: args.expiresAt,
    });
  },
});

export const toggleAnnouncement = mutation({
  args: { announcementId: v.id("announcements"), isActive: v.boolean() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.announcementId, { isActive: args.isActive });
  },
});

export const deleteAnnouncement = mutation({
  args: { announcementId: v.id("announcements") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.announcementId);
  },
});

export const listAllAnnouncements = query({
  handler: async (ctx) => {
    const admin = await getAdmin(ctx);
    if (!admin) return [];
    return await ctx.db.query("announcements").order("desc").collect();
  },
});
