import express from "express";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";
import {
  getSettingsController,
  toggleMaintenanceModeController,
  toggleViewInvoiceController,
  toggleEditProfileController,
  toggleLearningAccessController,
} from "../controllers/settingController.js";

const router = express.Router();

// GET all settings
router.get("/", requireSignIn, getSettingsController);

// Toggle maintenance mode
router.put("/maintenance-mode", requireSignIn, isAdmin, toggleMaintenanceModeController);

// Student control toggles
router.put("/toggle-view-invoice", requireSignIn, isAdmin, toggleViewInvoiceController);
router.put("/toggle-edit-profile", requireSignIn, isAdmin, toggleEditProfileController);
router.put("/toggle-learning-access", requireSignIn, isAdmin, toggleLearningAccessController);

export default router;
