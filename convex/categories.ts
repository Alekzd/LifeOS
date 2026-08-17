import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getUser, requireUser, requireAdmin } from "./helpers";

export const getUserCategories = query({
  handler: async (ctx) => {
    const user = await getUser(ctx);
    const templates = await ctx.db
      .query("categories")
      .withIndex("by_system", (q) => q.eq("isSystemTemplate", true))
      .collect();

    if (!user) return templates;

    const personal = await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", user.clerkId))
      .collect();
    return [...personal, ...templates];
  },
});

export const createCategory = mutation({
  args: {
    name: v.string(),
    color: v.string(),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    return await ctx.db.insert("categories", {
      userId: user.clerkId,
      name: args.name,
      color: args.color,
      icon: args.icon,
      createdAt: Date.now(),
    });
  },
});

export const deleteCategory = mutation({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const cat = await ctx.db.get(args.categoryId);
    if (!cat) throw new Error("NOT_FOUND");
    if (cat.userId !== user.clerkId) throw new Error("FORBIDDEN");
    await ctx.db.delete(args.categoryId);
  },
});

// Admin: Create system-wide template category
export const createSystemTemplate = mutation({
  args: { name: v.string(), color: v.string(), icon: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("categories", {
      userId: "system",
      name: args.name,
      color: args.color,
      icon: args.icon,
      isSystemTemplate: true,
      createdAt: Date.now(),
    });
  },
});
