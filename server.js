import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import connectDB from "./backend/config/db.js";
import { startMonthlyAttendanceJob } from "./backend/jobs/monthlyattandance.js";
import authRoutes from "./backend/routes/authRoute.js";
import userRoutes from "./backend/routes/userRoutes.js";
import adminRoutes from "./backend/routes/adminRoute.js";
import hostelRoutes from "./backend/routes/hostelRoute.js";
import studentRoutes from "./backend/routes/studentRoute.js";
import roomRoutes from "./backend/routes/roomRoute.js";
import attandanceRoutes from "./backend/routes/attandanceRoute.js";
import vehicleRoutes from "./backend/routes/vehicleRoute.js";
import feesRoutes from "./backend/routes/feeRoute.js";
import messRoutes from "./backend/routes/messRoute.js";
import announcementRoutes from "./backend/routes/announcementRoute.js";
import learningRoutes from "./backend/routes/learningRoute.js";
import settingRoutes from "./backend/routes/settingRoute.js";
import systemRoutes from "./backend/routes/systemRoute.js";
import "./backend/jobs/emailCron.js";

dotenv.config();
connectDB();
startMonthlyAttendanceJob();
initCron();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) { fs.mkdirSync(uploadsDir, { recursive: true }); }

// SECURITY: restrict CORS to frontend origin only
app.use(cors({
  origin: [process.env.FRONTEND_URL || "http://localhost:3000", "http://localhost:3000"],
  credentials: true,
}));

// SECURITY: set secure HTTP headers
app.use(helmet({ contentSecurityPolicy: false }));

// SECURITY: block MongoDB injection operators in request body/query
app.use(mongoSanitize());

// SECURITY: limit request body to 10kb to prevent payload attacks
app.use(express.json({ limit: "10kb" }));

app.use(morgan("dev"));

app.use("/uploads", express.static(uploadsDir));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/hostel", hostelRoutes);
app.use("/api/v1/student", studentRoutes);
app.use("/api/v1/room", roomRoutes);
app.use("/api/v1/attandance", attandanceRoutes);
app.use("/api/v1/vehicle", vehicleRoutes);
app.use("/api/v1/fees", feesRoutes);
app.use("/api/v1/mess", messRoutes);
app.use("/api/v1/announcement", announcementRoutes);
app.use("/api/v1/learning", learningRoutes);
app.use("/api/v1/settings", settingRoutes);
app.use("/api/v1/system", systemRoutes);

app.use(express.static(path.join(__dirname, "../client/build")));
app.get("*", (req, res) => { res.sendFile(path.join(__dirname, "../client/build/index.html")); });

const PORT = process.env.PORT || 8083;
app.listen(PORT, () => { console.log("Server running on port " + PORT); });