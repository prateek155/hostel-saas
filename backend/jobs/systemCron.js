import cron from "node-cron";
import { generateSystemReport } from "../controllers/systemReportController.js";

cron.schedule("* * * * *", async () => {
  console.log("Running system scan (every 1 min)...");

  await generateSystemReport(
    { user: { role: "admin" } },
    {
      status: () => ({
        send: () => console.log("Report auto-created"),
      }),
    }
  );
});