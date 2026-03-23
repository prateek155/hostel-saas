import cron from "node-cron";
import attandanceModel from "../models/attandanceModel.js";
import studentModel from "../models/studentModel.js";
import  sendEmail  from "../utils/sendEmail.js";

export const startMonthlyAttendanceJob = () => {

  // Runs at 11:59 PM on last day of every month
  cron.schedule("59 23 28-31 * *", async () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Only run if tomorrow is 1st day of next month
    if (tomorrow.getDate() !== 1) return;

    console.log("Running Monthly Attendance Job...");

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const students = await studentModel.find();

    for (let student of students) {
      const records = await attandanceModel.find({
        studentId: student.id,
        date: { $gte: monthStart, $lt: monthEnd }
      });

      const total = records.length;
      const present = records.filter(r => r.status === "present").length;
      const absent = total - present;
      const percentage = total === 0 ? 0 : ((present / total) * 100).toFixed(2);

      const html = `
        <h2>Monthly Attendance Report</h2>
        <p>Student: ${student.name}</p>
        <p>Month: ${monthStart.toLocaleString("default", { month: "long" })}</p>
        <hr/>
        <p>Total Days: ${total}</p>
        <p>Present: ${present}</p>
        <p>Absent: ${absent}</p>
        <p>Attendance %: ${percentage}%</p>
      `;

      if (student.gardianemail) {
  await sendEmail({
    to: student.gardianemail,
    subject: `Monthly Attendance Report - ${student.name}`,
    html: html,
  });
}
    }

    console.log("Monthly Attendance Emails Sent Successfully");
  });

};
