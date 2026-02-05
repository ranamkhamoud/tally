import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Internal query to get tasks by user and status
export const getTasksByUserAndStatus = internalQuery({
  args: {
    userId: v.id("users"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", args.userId).eq("status", args.status)
      )
      .collect();
  },
});

// Internal query to get a task by ID
export const getTaskById = internalQuery({
  args: {
    taskId: v.id("tasks"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== args.userId) {
      return null;
    }
    return task;
  },
});

// Internal mutation to create a task for a specific user
export const createTaskForUser = internalMutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    dueDate: v.string(),
    priority: v.string(),
    important: v.boolean(),
    urgent: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", {
      userId: args.userId,
      title: args.title,
      description: args.description,
      dueDate: args.dueDate,
      priority: args.priority,
      important: args.important,
      urgent: args.urgent,
      done: false,
      status: "active",
    });
  },
});

// Internal mutation to update a task for a specific user
export const updateTaskForUser = internalMutation({
  args: {
    taskId: v.id("tasks"),
    userId: v.id("users"),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      dueDate: v.optional(v.string()),
      priority: v.optional(v.string()),
      important: v.optional(v.boolean()),
      urgent: v.optional(v.boolean()),
      done: v.optional(v.boolean()),
      status: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== args.userId) {
      return null;
    }

    const validUpdates: Record<string, any> = {};
    if (args.updates.title !== undefined) validUpdates.title = String(args.updates.title).trim();
    if (args.updates.description !== undefined) validUpdates.description = String(args.updates.description).trim();
    if (args.updates.dueDate !== undefined) validUpdates.dueDate = args.updates.dueDate;
    if (args.updates.priority !== undefined && ["low", "medium", "high"].includes(args.updates.priority)) {
      validUpdates.priority = args.updates.priority;
    }
    if (args.updates.important !== undefined) validUpdates.important = Boolean(args.updates.important);
    if (args.updates.urgent !== undefined) validUpdates.urgent = Boolean(args.updates.urgent);
    if (args.updates.done !== undefined) validUpdates.done = Boolean(args.updates.done);
    if (args.updates.status !== undefined && ["active", "archived", "deleted"].includes(args.updates.status)) {
      validUpdates.status = args.updates.status;
    }

    await ctx.db.patch(args.taskId, validUpdates);
    const updatedTask = await ctx.db.get(args.taskId);
    return { id: args.taskId, ...updatedTask };
  },
});

// Internal mutation to delete a task for a specific user
export const deleteTaskForUser = internalMutation({
  args: {
    taskId: v.id("tasks"),
    userId: v.id("users"),
    permanent: v.boolean(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== args.userId) {
      return { success: false };
    }

    if (args.permanent) {
      await ctx.db.delete(args.taskId);
    } else {
      await ctx.db.patch(args.taskId, {
        status: "deleted",
        deletedAt: Date.now(),
      });
    }

    return { success: true };
  },
});
