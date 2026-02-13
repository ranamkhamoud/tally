import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserId } from "./users";

// Get all active tasks for the current user (sorted by sortOrder)
export const getActiveTasks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", userId as any).eq("status", "active")
      )
      .collect();

    // Sort by sortOrder (ascending), falling back to _creationTime for legacy tasks
    return tasks.sort(
      (a, b) => (a.sortOrder ?? a._creationTime) - (b.sortOrder ?? b._creationTime)
    );
  },
});

// Get all archived tasks for the current user
export const getArchivedTasks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", userId as any).eq("status", "archived")
      )
      .collect();

    return tasks;
  },
});

// Get all deleted tasks for the current user
export const getDeletedTasks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", userId as any).eq("status", "deleted")
      )
      .collect();

    // Filter out tasks deleted more than 30 days ago
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

    return tasks.filter((task) => {
      if (!task.deletedAt) return true;
      return now - task.deletedAt < thirtyDaysMs;
    });
  },
});

// Create a new task
export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    priority: v.optional(v.string()),
    important: v.boolean(),
    urgent: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const taskId = await ctx.db.insert("tasks", {
      userId: userId as any,
      title: args.title,
      description: args.description || "",
      dueDate: args.dueDate || "",
      priority: args.priority || "medium",
      important: args.important,
      urgent: args.urgent,
      done: false,
      status: "active",
      sortOrder: Date.now(),
    });

    return taskId;
  },
});

// Update a task
export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    priority: v.optional(v.string()),
    important: v.optional(v.boolean()),
    urgent: v.optional(v.boolean()),
    done: v.optional(v.boolean()),
    sortOrder: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) {
      throw new Error("Task not found");
    }

    const updates: Partial<typeof task> = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.dueDate !== undefined) updates.dueDate = args.dueDate;
    if (args.priority !== undefined) updates.priority = args.priority;
    if (args.important !== undefined) updates.important = args.important;
    if (args.urgent !== undefined) updates.urgent = args.urgent;
    if (args.done !== undefined) updates.done = args.done;
    if (args.sortOrder !== undefined) updates.sortOrder = args.sortOrder;

    await ctx.db.patch(args.taskId, updates);
  },
});

// Batch-reorder tasks (update sortOrder, and optionally important/urgent for cross-quadrant moves)
export const reorderTasks = mutation({
  args: {
    updates: v.array(
      v.object({
        taskId: v.id("tasks"),
        sortOrder: v.float64(),
        important: v.optional(v.boolean()),
        urgent: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    for (const update of args.updates) {
      const task = await ctx.db.get(update.taskId);
      if (!task || task.userId !== userId) continue;

      const patch: Record<string, any> = { sortOrder: update.sortOrder };
      if (update.important !== undefined) patch.important = update.important;
      if (update.urgent !== undefined) patch.urgent = update.urgent;

      await ctx.db.patch(update.taskId, patch);
    }
  },
});

// Move task to trash
export const deleteTask = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) {
      throw new Error("Task not found");
    }

    await ctx.db.patch(args.taskId, {
      status: "deleted",
      deletedAt: Date.now(),
    });
  },
});

// Archive a task
export const archiveTask = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) {
      throw new Error("Task not found");
    }

    await ctx.db.patch(args.taskId, {
      status: "archived",
      archivedAt: Date.now(),
    });
  },
});

// Restore a task from archive or trash
export const restoreTask = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) {
      throw new Error("Task not found");
    }

    await ctx.db.patch(args.taskId, {
      status: "active",
      deletedAt: undefined,
      archivedAt: undefined,
    });
  },
});

// Permanently delete a task
export const permanentlyDelete = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) {
      throw new Error("Task not found");
    }

    await ctx.db.delete(args.taskId);
  },
});

// Empty trash - delete all trashed tasks
export const emptyTrash = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const deletedTasks = await ctx.db
      .query("tasks")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", userId as any).eq("status", "deleted")
      )
      .collect();

    for (const task of deletedTasks) {
      await ctx.db.delete(task._id);
    }
  },
});
