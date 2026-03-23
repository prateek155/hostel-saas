import express from "express";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";
import {
  getSettingsController,
  toggleMaintenanceModeController,
  updateOwnerThemeController,
  updateStudentThemeController,
  toggleViewInvoiceController,
  toggleEditProfileController,
  toggleLearningAccessController,
} from "../controllers/settingController.js";

const router = express.Router();

// GET all settings
router.get("/", requireSignIn, isAdmin, getSettingsController);

// Toggle maintenance mode
router.put("/maintenance-mode", requireSignIn, isAdmin, toggleMaintenanceModeController);

// Update themes
router.put("/owner-theme", requireSignIn, isAdmin, updateOwnerThemeController);
router.put("/student-theme", requireSignIn, isAdmin, updateStudentThemeController);

// Student control toggles
router.put("/toggle-view-invoice", requireSignIn, isAdmin, toggleViewInvoiceController);
router.put("/toggle-edit-profile", requireSignIn, isAdmin, toggleEditProfileController);
router.put("/toggle-learning-access", requireSignIn, isAdmin, toggleLearningAccessController);

export default router;
