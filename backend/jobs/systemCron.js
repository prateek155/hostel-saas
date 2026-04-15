import cron from "node-cron";
import { runFullAudit } from "../controllers/systemReportController.js";
import { SystemSettings } from "../models/systemReportModel.js";

let currentTask = null;
let isRunning   = false; // ← lock: prevents overlapping cron runs

const runReport = async () => {
  if (isRunning) {
    console.log("[Cron] Audit already running — skipping this tick");
    return;
  }
  isRunning = true;
  console.log(`[Cron] Starting scheduled audit — ${new Date().toLocaleString("en-IN")}`);
  try {
    const report = await runFullAudit("cron");
    console.log(`[Cron] Audit complete — healthScore: ${report.systemHealth?.healthScore ?? "?"}`);
  } catch (err) {
    console.log("[Cron] Audit error:", err.message);
  } finally {
    isRunning = false;
  }
};

export const restartCron = (expression, timezone = "Asia/Kolkata") => {
  if (!cron.validate(expression)) {
    console.log("[Cron] Invalid expression:", expression);
    return;
  }
  if (currentTask) {
    currentTask.stop();
    try { currentTask.destroy(); } catch {}
  }
  currentTask = cron.schedule(expression, runReport, { timezone });
  console.log(`[Cron] Scheduled: "${expression}" (tz: ${timezone})`);
};

export const initCron = async () => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({
        intervalDays:    15,
        adminEmail:      process.env.ADMIN_EMAIL || "",
        cronExpression:  "0 2 */15 * *",
        timezone:        "Asia/Kolkata",
      });
    }
    const expr = settings.cronExpression || "0 2 */15 * *";
    const tz   = settings.timezone       || "Asia/Kolkata";
    restartCron(expr, tz);
    console.log(`[Cron] Initialized — every ${settings.intervalDays} days (${tz})`);
  } catch (err) {
    console.log("[Cron] Init fallback:", err.message);
    restartCron("0 2 */15 * *");
  }
};

export default initCron;