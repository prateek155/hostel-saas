import cron from "node-cron";
import { generateSystemReport } from "../controllers/systemReportController.js";
import { SystemSettings } from "../models/systemReportModel.js";

let currentTask = null;

const runReport = async () => {
  console.log(`[Cron] Running scheduled audit — ${new Date().toLocaleString("en-IN")}`);
  await generateSystemReport(
    { user: { role: "admin", name: "cron" } },
    { status: () => ({ send: (d) => console.log("[Cron] Report result:", d.success ? "OK" : d.message) }) }
  );
};

export const restartCron = (expression) => {
  if (!cron.validate(expression)) {
    console.log("[Cron] Invalid expression:", expression);
    return;
  }
  if (currentTask) { currentTask.stop(); currentTask.destroy(); }
  currentTask = cron.schedule(expression, runReport, { timezone: "Asia/Kolkata" });
  console.log(`[Cron] Scheduled: "${expression}"`);
};

export const initCron = async () => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({
        intervalDays: 15, adminEmail: process.env.ADMIN_EMAIL || "", cronExpression: "0 2 */15 * *",
      });
    }
    restartCron(settings.cronExpression || "0 2 */15 * *");
    console.log(`[Cron] Initialized: every ${settings.intervalDays} days`);
  } catch (err) {
    console.log("[Cron] Init fallback:", err.message);
    restartCron("0 2 */15 * *");
  }
};

export default initCron;