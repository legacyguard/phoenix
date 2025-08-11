import type { Request, Response } from "express";
import { ExecutorTaskService } from "@/services/executorTaskService";
import { supabase } from "@/integrations/supabase/client";
import { ensureAdmin } from "@/api/middleware/adminAuth";

/**
 * GET /api/executor/tasks
 * Fetches all tasks assigned to the authenticated executor
 */
export async function getExecutorTasks(req: Request, res: Response) {
  try {
    // Get authenticated user from session
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Fetch tasks for this executor
    const tasks = await ExecutorTaskService.getExecutorTasks(user.id);

    // Group tasks by category
    const groupedTasks = {
      immediate: tasks.filter((t) => t.category === "immediate"),
      first_week: tasks.filter((t) => t.category === "first_week"),
      ongoing: tasks.filter((t) => t.category === "ongoing"),
    };

    return res.json({
      success: true,
      data: groupedTasks,
      stats: {
        total: tasks.length,
        completed: tasks.filter((t) => t.status === "completed").length,
        pending: tasks.filter((t) => t.status === "pending").length,
      },
    });
  } catch (error) {
    console.error("Error fetching executor tasks:", error);
    return res.status(500).json({ error: "Failed to fetch tasks" });
  }
}

/**
 * PUT /api/executor/tasks/:taskId
 * Updates a task's status
 */
export async function updateExecutorTask(req: Request, res: Response) {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!["pending", "completed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Get authenticated user
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Update task
    const updatedTask = await ExecutorTaskService.updateTaskStatus(
      taskId,
      status,
      user.id,
    );

    return res.json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    console.error("Error updating executor task:", error);
    return res.status(500).json({ error: "Failed to update task" });
  }
}

/**
 * POST /api/executor/generate-tasks
 * Generates executor tasks when a user is marked as deceased
 * This should be called by an admin or automated system
 */
export async function generateExecutorTasks(req: Request, res: Response) {
  try {
    const { deceasedUserId, executorId } = req.body;

    if (!deceasedUserId || !executorId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Verify admin authorization before generating tasks
    if (!(await ensureAdmin(req, res))) {
      return;
    }

    await ExecutorTaskService.generateExecutorTasks(deceasedUserId, executorId);

    return res.json({
      success: true,
      message: "Executor tasks generated successfully",
    });
  } catch (error) {
    console.error("Error generating executor tasks:", error);
    return res.status(500).json({ error: "Failed to generate tasks" });
  }
}
