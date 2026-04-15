import express from "express";
import {
  generateSystemReport,
  getLatestReport,
  getAllReports,
  downloadReport,
  downloadPDF,
  getLiveHealth,
  getFileContent,
  approvePackage,
  verifyAndUpdate,
  approveFix,
  verifyAndFix,
  getUpdateHistory,
  getSettings,
  saveSettings,
  runNow,
  runInTen,
} from "../controllers/systemReportController.js";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ── Reports
router.post("/generate-report",  requireSignIn, isAdmin, generateSystemReport);
router.get("/latest",            requireSignIn, isAdmin, getLatestReport);
router.get("/all",               requireSignIn, isAdmin, getAllReports);

// ── Downloads (JSON + PDF)
router.get("/download/:id",      requireSignIn, isAdmin, downloadReport);    // JSON
router.get("/download-pdf/:id",  requireSignIn, isAdmin, downloadPDF);       // PDF ← NEW

// ── Live system health (no stored report — real-time OS metrics)
router.get("/live-health",       requireSignIn, isAdmin, getLiveHealth);     // ← NEW

// ── File content viewer
router.get("/file-content",      requireSignIn, isAdmin, getFileContent);

// ── Package approval (2-step)
router.post("/approve-package",  requireSignIn, isAdmin, approvePackage);
router.post("/verify-key",       requireSignIn, isAdmin, verifyAndUpdate);

// ── Issue fix approval (2-step)
router.post("/approve-fix",      requireSignIn, isAdmin, approveFix);
router.post("/verify-fix",       requireSignIn, isAdmin, verifyAndFix);

// ── History & Settings
router.get("/update-history",    requireSignIn, isAdmin, getUpdateHistory);
router.get("/settings",          requireSignIn, isAdmin, getSettings);
router.post("/settings",         requireSignIn, isAdmin, saveSettings);

// ── Manual trigger & scheduling
router.post("/run-now",          requireSignIn, isAdmin, runNow);
router.post("/run-in-10",        requireSignIn, isAdmin, runInTen);

export default router;