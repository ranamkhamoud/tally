import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserId } from "./users";

// Generate a random API key
function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "tk_";
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

// Get or create API key for the current user
export const getApiKey = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const existingKey = await ctx.db
      .query("apiKeys")
      .withIndex("by_user", (q) => q.eq("userId", userId as any))
      .first();

    if (existingKey) {
      return existingKey.key;
    }

    return null;
  },
});

// Create API key if it doesn't exist
export const createApiKey = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user already has an API key
    const existingKey = await ctx.db
      .query("apiKeys")
      .withIndex("by_user", (q) => q.eq("userId", userId as any))
      .first();

    if (existingKey) {
      return existingKey.key;
    }

    // Create new API key
    const newKey = generateApiKey();
    await ctx.db.insert("apiKeys", {
      userId: userId as any,
      key: newKey,
    });

    return newKey;
  },
});

// Regenerate API key
export const regenerateApiKey = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Delete existing API key if it exists
    const existingKey = await ctx.db
      .query("apiKeys")
      .withIndex("by_user", (q) => q.eq("userId", userId as any))
      .first();

    if (existingKey) {
      await ctx.db.delete(existingKey._id);
    }

    // Create new API key
    const newKey = generateApiKey();
    await ctx.db.insert("apiKeys", {
      userId: userId as any,
      key: newKey,
    });

    return newKey;
  },
});

// Validate API key and return userId (for HTTP actions)
export const validateApiKey = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const apiKeyDoc = await ctx.db
      .query("apiKeys")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (!apiKeyDoc) {
      return null;
    }

    return apiKeyDoc.userId;
  },
});
