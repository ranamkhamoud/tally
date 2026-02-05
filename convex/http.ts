import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Content-Type": "application/json",
};

// Helper to authenticate API key
async function authenticateApiKey(
  ctx: any,
  authHeader: string | null
): Promise<{ userId: Id<"users"> } | { error: string; status: number }> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      error: "Missing or invalid Authorization header. Use: Bearer <your-api-key>",
      status: 401,
    };
  }

  const apiKey = authHeader.split("Bearer ")[1];

  if (!apiKey || apiKey.length < 10) {
    return { error: "Invalid API key format", status: 401 };
  }

  const userId = await ctx.runQuery(api.apiKeys.validateApiKey, { key: apiKey });

  if (!userId) {
    return { error: "Invalid API key", status: 401 };
  }

  return { userId };
}

// OPTIONS handler for CORS
http.route({
  path: "/api/tasks",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

http.route({
  path: "/api/task",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

// GET /api/tasks - List all tasks
http.route({
  path: "/api/tasks",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const authHeader = request.headers.get("Authorization");
    const authResult = await authenticateApiKey(ctx, authHeader);

    if ("error" in authResult) {
      return new Response(JSON.stringify({ error: authResult.error }), {
        status: authResult.status,
        headers: corsHeaders,
      });
    }

    const userId = authResult.userId;
    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "active";
    const quadrant = url.searchParams.get("quadrant");
    const search = url.searchParams.get("q")?.toLowerCase().trim();
    const orderBy = url.searchParams.get("order_by") || "created_at";
    const orderDir = url.searchParams.get("order_dir") || "desc";

    // Parse pagination
    let limit: number | null = null;
    let offset = 0;
    if (url.searchParams.get("limit")) {
      limit = Math.min(Math.max(parseInt(url.searchParams.get("limit")!) || 50, 1), 100);
      offset = Math.max(parseInt(url.searchParams.get("offset") || "0") || 0, 0);
    }

    // Get all tasks for user
    const allTasks = await ctx.runQuery(internal.httpHelpers.getTasksByUserAndStatus, {
      userId,
      status: status === "done" ? "active" : status,
    });

    // Filter by done status if needed
    let tasks = status === "done"
      ? allTasks.filter((t: any) => t.done === true)
      : status === "active"
      ? allTasks.filter((t: any) => t.done === false)
      : allTasks;

    // Filter by quadrant
    const quadrantMap: Record<string, { important: boolean; urgent: boolean }> = {
      UI: { important: true, urgent: true },
      NUI: { important: true, urgent: false },
      UNI: { important: false, urgent: true },
      NUNI: { important: false, urgent: false },
    };

    if (quadrant && quadrantMap[quadrant.toUpperCase()]) {
      const q = quadrantMap[quadrant.toUpperCase()];
      tasks = tasks.filter(
        (t: any) => t.important === q.important && t.urgent === q.urgent
      );
    }

    // Search filter
    if (search) {
      tasks = tasks.filter(
        (t: any) =>
          t.title?.toLowerCase().includes(search) ||
          t.description?.toLowerCase().includes(search)
      );
    }

    // Add quadrant code to each task
    tasks = tasks.map((t: any) => {
      const quadrantCode =
        t.urgent && t.important
          ? "UI"
          : !t.urgent && t.important
          ? "NUI"
          : t.urgent && !t.important
          ? "UNI"
          : "NUNI";
      return { ...t, id: t._id, quadrant: quadrantCode };
    });

    // Sort
    const quadrantOrder: Record<string, number> = { UI: 0, NUI: 1, UNI: 2, NUNI: 3 };
    const isDesc = orderDir === "desc";

    tasks.sort((a: any, b: any) => {
      let result = 0;
      switch (orderBy) {
        case "created_at":
          result = (a._creationTime || 0) - (b._creationTime || 0);
          break;
        case "due_date":
          if (!a.dueDate && !b.dueDate) result = 0;
          else if (!a.dueDate) result = 1;
          else if (!b.dueDate) result = -1;
          else result = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case "quadrant":
          result = quadrantOrder[a.quadrant] - quadrantOrder[b.quadrant];
          break;
        case "title":
          result = (a.title || "").localeCompare(b.title || "");
          break;
        default:
          result = (a._creationTime || 0) - (b._creationTime || 0);
      }
      return isDesc ? -result : result;
    });

    const total = tasks.length;

    // Apply pagination
    if (limit) {
      tasks = tasks.slice(offset, offset + limit);
    }

    const response: any = { tasks, total };
    if (limit) {
      response.pagination = { limit, offset, returned: tasks.length };
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: corsHeaders,
    });
  }),
});

// GET /api/task?id=taskId - Get single task
http.route({
  path: "/api/task",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const authHeader = request.headers.get("Authorization");
    const authResult = await authenticateApiKey(ctx, authHeader);

    if ("error" in authResult) {
      return new Response(JSON.stringify({ error: authResult.error }), {
        status: authResult.status,
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);
    const taskId = url.searchParams.get("id") as Id<"tasks">;

    if (!taskId) {
      return new Response(JSON.stringify({ error: "Task ID is required. Use ?id=taskId" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const task = await ctx.runQuery(internal.httpHelpers.getTaskById, {
      taskId,
      userId: authResult.userId,
    });

    if (!task) {
      return new Response(JSON.stringify({ error: "Task not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ id: task._id, ...task }), {
      status: 200,
      headers: corsHeaders,
    });
  }),
});

// POST /api/tasks - Create task
http.route({
  path: "/api/tasks",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const authHeader = request.headers.get("Authorization");
    const authResult = await authenticateApiKey(ctx, authHeader);

    if ("error" in authResult) {
      return new Response(JSON.stringify({ error: authResult.error }), {
        status: authResult.status,
        headers: corsHeaders,
      });
    }

    const body = await request.json();
    const { title, description, dueDate, priority, important, urgent } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Title is required" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const taskId = await ctx.runMutation(internal.httpHelpers.createTaskForUser, {
      userId: authResult.userId,
      title: title.trim(),
      description: description?.trim() || "",
      dueDate: dueDate || "",
      priority: ["low", "medium", "high"].includes(priority) ? priority : "medium",
      important: Boolean(important),
      urgent: Boolean(urgent),
    });

    return new Response(
      JSON.stringify({
        id: taskId,
        title: title.trim(),
        description: description?.trim() || "",
        important: Boolean(important),
        urgent: Boolean(urgent),
        done: false,
        status: "active",
      }),
      { status: 201, headers: corsHeaders }
    );
  }),
});

// PUT /api/task?id=taskId - Update task
http.route({
  path: "/api/task",
  method: "PUT",
  handler: httpAction(async (ctx, request) => {
    const authHeader = request.headers.get("Authorization");
    const authResult = await authenticateApiKey(ctx, authHeader);

    if ("error" in authResult) {
      return new Response(JSON.stringify({ error: authResult.error }), {
        status: authResult.status,
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);
    const taskId = url.searchParams.get("id") as Id<"tasks">;

    if (!taskId) {
      return new Response(JSON.stringify({ error: "Task ID is required. Use ?id=taskId" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const body = await request.json();

    const result = await ctx.runMutation(internal.httpHelpers.updateTaskForUser, {
      taskId,
      userId: authResult.userId,
      updates: body,
    });

    if (!result) {
      return new Response(JSON.stringify({ error: "Task not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: corsHeaders,
    });
  }),
});

// DELETE /api/task?id=taskId - Delete task
http.route({
  path: "/api/task",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    const authHeader = request.headers.get("Authorization");
    const authResult = await authenticateApiKey(ctx, authHeader);

    if ("error" in authResult) {
      return new Response(JSON.stringify({ error: authResult.error }), {
        status: authResult.status,
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);
    const taskId = url.searchParams.get("id") as Id<"tasks">;
    const permanent = url.searchParams.get("permanent") === "true";

    if (!taskId) {
      return new Response(JSON.stringify({ error: "Task ID is required. Use ?id=taskId" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const result = await ctx.runMutation(internal.httpHelpers.deleteTaskForUser, {
      taskId,
      userId: authResult.userId,
      permanent,
    });

    if (!result.success) {
      return new Response(JSON.stringify({ error: "Task not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    return new Response(
      JSON.stringify({
        message: permanent ? "Task permanently deleted" : "Task moved to trash",
        id: taskId,
      }),
      { status: 200, headers: corsHeaders }
    );
  }),
});

export default http;
