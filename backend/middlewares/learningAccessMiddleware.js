import settingModel from "../models/settingModel.js";

/**
 * learningWriteGuard
 * ───────────────────
 * Applied to POST / PUT / DELETE learning routes.
 * When admin turns OFF learning, students can only read (GET) their notes.
 * All write operations are blocked with a 403.
 */
export const learningWriteGuard = async (req, res, next) => {
  try {
    const settings = await settingModel.findOne();

    if (settings && !settings.learningControls?.access_courses) {
      return res.status(403).json({
        success: false,
        message:
          "Learning system is currently in read-only mode. Creating, editing, and deleting notes has been disabled by the admin.",
      });
    }

    next();
  } catch (err) {
    console.error("learningWriteGuard error:", err.message);
    next(); // fail-open
  }
};
