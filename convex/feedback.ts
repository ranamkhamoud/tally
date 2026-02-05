import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getUserId } from "./users";

// Submit feedback
export const submitFeedback = mutation({
  args: {
    message: v.string(),
    category: v.optional(v.string()),
    page: v.optional(v.string()),
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.insert("feedback", {
      userId: userId as any,
      message: args.message,
      category: args.category || "general",
      page: args.page,
      userEmail: args.userEmail,
    });
  },
});
