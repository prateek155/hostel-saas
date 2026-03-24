import jwt from "jsonwebtoken";
import settingModel from "../models/settingModel.js";

/**
 * maintenanceGuard
 * ─────────────────
 * Applied to all owner + student API routes.
 * - GET requests always pass through (read-only is fine).
 * - Admin role always passes through.
 * - For everyone else: if maintenanceMode is ON, block with 503.
 */
export const maintenanceGuard = async (req, res, next) => {
  try {
    // GET = read-only → always allowed
    if (req.method === "GET") return next();

    // Decode role from JWT (non-blocking — auth errors handled elsewhere)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const decoded = jwt.verify(
          authHeader.split(" ")[1],
          process.env.JWT_SECRET
        );
        // Admin bypasses maintenance completely
        if (decoded.role === "admin") return next();
      } catch {
        // Bad token — let requireSignIn handle this
        return next();
      }
    } else {
      // No token — let requireSignIn handle auth
      return next();
    }

    // Check maintenance flag in DB
    const settings = await settingModel.findOne();
    if (settings && settings.maintenanceMode) {
      return res.status(503).json({
        success: false,
        maintenance: true,
        message:
          "System is under maintenance. Only read access is allowed. Please try again later.",
      });
    }

    next();
  } catch (err) {
    console.error("maintenanceGuard error:", err.message);
    next(); // fail-open so a DB hiccup never locks everyone out
  }
};
