import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  // Users table - stores user info from Clerk
  users: defineTable({
    clerkId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  }).index("by_clerk_id", ["clerkId"]),

  // Tasks table - stores all user tasks
  tasks: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    priority: v.optional(v.string()), // 'low', 'medium', 'high'
    important: v.boolean(),
    urgent: v.boolean(),
    done: v.boolean(),
    status: v.string(), // 'active', 'archived', 'deleted'
    archivedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
  })
    .index("by_user_and_status", ["userId", "status"])
    .index("by_user", ["userId"]),

  // Feedback table - user feedback submissions
  feedback: defineTable({
    userId: v.id("users"),
    message: v.string(),
    category: v.optional(v.string()),
    page: v.optional(v.string()),
    userEmail: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  // API Keys table - for REST API authentication
  apiKeys: defineTable({
    userId: v.id("users"),
    key: v.string(),
  })
    .index("by_key", ["key"])
    .index("by_user", ["userId"]),
});

export default schema;
