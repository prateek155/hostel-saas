import cron from "node-cron";
import emailReader from "../utils/emailReader.js";

export const startEmailCron = () => {
  cron.schedule("*/10 * * * *", async () => {
    console.log("📧 Checking for new emails...");

    try {
      await emailReader(); // ✅ safe now (DB already connected)
    } catch (error) {
      console.error("❌ Email cron error:", error.message);
    }
  });
};