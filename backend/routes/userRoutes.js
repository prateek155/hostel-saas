import express from "express";
import {
  requireSignIn,
  isAdmin,
  isOwner
} from "../middlewares/authMiddleware.js";

import {
  getProfileController,
  getAllUsersController,
  getHostelStudentsController,
  updateProfileController,
  updateUserRoleController,
  toggleUserStatusController,
  deleteUserController
} from "../controllers/userController.js";

const router = express.Router();

/**
 * =========================
 * PROFILE ROUTES
 * =========================
 */

// Get logged-in user profile
router.get("/profile", requireSignIn, getProfileController);

// Update own profile
router.put("/profile", requireSignIn, updateProfileController);

/**
 * =========================
 * ADMIN ROUTES
 * =========================
 */

// Get all users (ADMIN only)
router.get("/admin/users", requireSignIn, isAdmin, getAllUsersController);

// Update user role (ADMIN only)
router.put(
  "/admin/users/:id/role",
  requireSignIn,
  isAdmin,
  updateUserRoleController
);

// Activate / Deactivate user (ADMIN only)
router.put(
  "/admin/users/:id/status",
  requireSignIn,
  isAdmin,
  toggleUserStatusController
);

// Delete user (ADMIN only)
router.delete(
  "/admin/users/:id",
  requireSignIn,
  isAdmin,
  deleteUserController
);

/**
 * =========================
 * OWNER ROUTES
 * =========================
 */

// Get students of owner hostel
router.get(
  "/owner/students",
  requireSignIn,
  isOwner,
  getHostelStudentsController
);

// Activate / Deactivate student (OWNER only)
router.put(
  "/owner/students/:id/status",
  requireSignIn,
  isOwner,
  toggleUserStatusController
);

// Delete student (OWNER only)
router.delete(
  "/owner/students/:id",
  requireSignIn,
  isOwner,
  deleteUserController
);

export default router;
