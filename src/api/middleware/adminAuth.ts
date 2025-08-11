import type { Request, Response, NextFunction } from "express";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

// Extend the Express Request interface to include authenticated user
declare module "express-serve-static-core" {
  interface Request {
    user?: User;
  }
}

/**
 * Middleware that verifies the requester has admin privileges.
 *
 * Checks the Authorization header for a valid Supabase session token and
 * ensures the user has an admin role. Responds with appropriate HTTP status
 * codes when authentication or authorization fails.
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const isAdmin =
      user.email?.endsWith("@legacyguard.com") ||
      user.user_metadata?.role === "admin";

    if (!isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Attach user for downstream handlers if needed
    req.user = user;
    return next();
  } catch (err) {
    console.error("Admin authentication error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Helper for endpoints that cannot use Express middleware chaining. Performs
 * the same admin verification as {@link requireAdmin} and returns a boolean
 * indicating whether the requester is authorized.
 */
export async function ensureAdmin(
  req: Request,
  res: Response,
): Promise<boolean> {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }

  const isAdmin =
    user.email?.endsWith("@legacyguard.com") ||
    user.user_metadata?.role === "admin";

  if (!isAdmin) {
    res.status(403).json({ error: "Forbidden" });
    return false;
  }

  req.user = user;
  return true;
}
