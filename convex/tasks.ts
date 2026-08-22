import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getUser, requireUser, getAdmin, requireAdmin, formatDateKey, calculateNewStreak } from "./helpers";

// ── CREATE TASK ───────────────────────────────────────────────────────────────
export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("completed")),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    dueDate: v.number(),
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    try {
      const user = await requireUser(ctx);
      const now = Date.now();

      // Get current max order for user
      const lastTask = await ctx.db
        .query("tasks")
        .withIndex("by_user", (q) => q.eq("userId", user.clerkId))
        .order("desc")
        .first();

      const order =
        lastTask && typeof lastTask.order === "number" && !isNaN(lastTask.order)
          ? lastTask.order + 1
          : 0;

      const taskId = await ctx.db.insert("tasks", {
        userId: user.clerkId,
        title: args.title,
        description: args.description || undefined,
        status: args.status,
        priority: args.priority,
        dueDate: args.dueDate,
        categoryId: args.categoryId || undefined,
        order,
        createdAt: now,
        updatedAt: now,
      });

      return taskId;
    } catch (err: any) {
      console.error("Lỗi chi tiết trong createTask:", err);
      throw new Error(`[CREATE_TASK_ERROR] ${err?.message || String(err)}`);
    }
  },
});

// ── GET USER TASKS ────────────────────────────────────────────────────────────
export const getUserTasks = query({
  args: {
    status: v.optional(v.union(v.literal("todo"), v.literal("in_progress"), v.literal("completed"))),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) return [];

    let tasksQuery;
    if (args.status) {
      tasksQuery = ctx.db
        .query("tasks")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", user.clerkId).eq("status", args.status!)
        );
    } else {
      tasksQuery = ctx.db
        .query("tasks")
        .withIndex("by_user", (q) => q.eq("userId", user.clerkId));
    }

    return await tasksQuery.order("desc").collect();
  },
});

// ── GET TASKS BY DATE ─────────────────────────────────────────────────────────
export const getTasksByDate = query({
  args: {
    startDate: v.number(), // Epoch ms (start of day)
    endDate: v.number(),   // Epoch ms (end of day)
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) return [];

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", user.clerkId).gte("dueDate", args.startDate).lte("dueDate", args.endDate)
      )
      .collect();

    return tasks;
  },
});

// ── UPDATE TASK ───────────────────────────────────────────────────────────────
export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.union(v.literal("todo"), v.literal("in_progress"), v.literal("completed"))),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    dueDate: v.optional(v.number()),
    categoryId: v.optional(v.id("categories")),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const { taskId, ...updates } = args;

    // Ownership check — CRITICAL for multi-tenant security
    const task = await ctx.db.get(taskId);
    if (!task) throw new Error("NOT_FOUND: Task không tồn tại.");
    if (task.userId !== user.clerkId) {
      throw new Error("FORBIDDEN: Bạn không có quyền sửa task này.");
    }

    await ctx.db.patch(taskId, { ...updates, updatedAt: Date.now() });

    // If completing a task, update streak
    if (updates.status === "completed") {
      const today = formatDateKey(new Date());
      const newStreak = calculateNewStreak(user.streakCount, user.lastActiveDate, today);
      if (user.lastActiveDate !== today) {
        await ctx.db.patch(user._id, {
          streakCount: newStreak,
          lastActiveDate: today,
          updatedAt: Date.now(),
        });
      }
    }

    return taskId;
  },
});

// ── DELETE TASK ───────────────────────────────────────────────────────────────
export const deleteTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const task = await ctx.db.get(args.taskId);

    if (!task) throw new Error("NOT_FOUND");
    if (task.userId !== user.clerkId) {
      throw new Error("FORBIDDEN: Bạn không có quyền xóa task này.");
    }

    await ctx.db.delete(args.taskId);
  },
});

// ── GET CALENDAR DATA (dots per day) ─────────────────────────────────────────
export const getCalendarData = query({
  args: {
    month: v.number(), // 0-indexed month
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) return {};

    const startOfMonth = new Date(args.year, args.month, 1).getTime();
    const endOfMonth = new Date(args.year, args.month + 1, 0, 23, 59, 59, 999).getTime();

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user_date", (q) =>
        q
          .eq("userId", user.clerkId)
          .gte("dueDate", startOfMonth)
          .lte("dueDate", endOfMonth)
      )
      .collect();

    // Group by day → dot color logic
    const dayMap: Record<string, { total: number; completed: number }> = {};
    for (const task of tasks) {
      const dayKey = formatDateKey(new Date(task.dueDate));
      if (!dayMap[dayKey]) dayMap[dayKey] = { total: 0, completed: 0 };
      dayMap[dayKey].total++;
      if (task.status === "completed") dayMap[dayKey].completed++;
    }

    // Convert to dot status
    const calendarDots: Record<string, "completed" | "mixed" | "pending"> = {};
    for (const [day, data] of Object.entries(dayMap)) {
      if (data.completed === data.total) calendarDots[day] = "completed";
      else if (data.completed > 0) calendarDots[day] = "mixed";
      else calendarDots[day] = "pending";
    }

    return calendarDots;
  },
});

// ── ADMIN: GET ALL TASKS STATS ────────────────────────────────────────────────
export const getTaskStats = query({
  handler: async (ctx) => {
    const admin = await getAdmin(ctx);
    if (!admin) return null;
    const all = await ctx.db.query("tasks").collect();
    type TaskDoc = (typeof all)[number];
    return {
      total: all.length,
      todo: all.filter((t: TaskDoc) => t.status === "todo").length,
      inProgress: all.filter((t: TaskDoc) => t.status === "in_progress").length,
      completed: all.filter((t: TaskDoc) => t.status === "completed").length,
    };
  },
});
