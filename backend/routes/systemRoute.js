import express from "express";
import { generateSystemReport, getLatestReport,
  getAllReports, } from "../controllers/systemReportController.js";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/generate-report", requireSignIn, isAdmin, generateSystemReport);
// Get latest report
router.get("/latest", requireSignIn, isAdmin, getLatestReport);

// Get all reports
router.get("/all", requireSignIn, isAdmin, getAllReports);

export default router;