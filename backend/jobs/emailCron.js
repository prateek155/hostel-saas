import cron from "node-cron";
import emailReader from "../utils/emailReader.js";

cron.schedule("*/5 * * * *", () => {
  console.log("Checking for new emails...");
  emailReader();
}); 
 