import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import fs from "fs";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import { fileURLToPath } from "url";


import connectDB from "./backend/config/db.js";
import { startMonthlyAttendanceJob } from "./backend/jobs/monthlyattandance.js";
// Routes
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
import { maintenanceGuard } from "./backend/middlewares/maintenanceMiddleware.js";
import "./backend/jobs/emailCron.js";
import "./backend/jobs/systemCron.js";



// Config env
dotenv.config();

// DB connection
connectDB();

startMonthlyAttendanceJob();

// ES module dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App init
const app = express();

// Uploads folder
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middlewares
// Hide Express technology
app.disable("x-powered-by");

// Security headers
app.use(helmet());

// Restrict CORS to frontend
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);

// Limit request body size
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ limit: "10kb", extended: true }));


// Prevent MongoDB injection
app.use(mongoSanitize());

// Logger
app.use(morgan("dev"));


// Static uploads
app.use("/uploads", express.static(uploadsDir));

// ✅ ADD HERE
app.get("/api/ping", (req, res) => {
  res.status(200).send("Server is alive 🚀");
});

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/hostel", maintenanceGuard, hostelRoutes);
app.use("/api/v1/student", maintenanceGuard, studentRoutes);
app.use("/api/v1/room", maintenanceGuard, roomRoutes);
app.use("/api/v1/attandance", maintenanceGuard, attandanceRoutes);
app.use("/api/v1/vehicle", maintenanceGuard, vehicleRoutes);
app.use("/api/v1/fees", maintenanceGuard, feesRoutes);
app.use("/api/v1/mess", maintenanceGuard, messRoutes);
app.use("/api/v1/announcement", maintenanceGuard, announcementRoutes);
app.use("/api/v1/learning", maintenanceGuard, learningRoutes);
app.use("/api/v1/settings", settingRoutes);
app.use("/api/v1/system", systemRoutes);

// Port
const PORT = process.env.PORT || 8083;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
