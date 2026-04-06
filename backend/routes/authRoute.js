import express from "express";
import { loginController,  forgotPasswordController,
  resetPasswordController } from "../controllers/authController.js";

import {
  requireSignIn,
  isAdmin,
  isOwner,
  requireStudentSignIn
} from "../middlewares/authMiddleware.js";

import { loginLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

/**
 * =========================
 * AUTH ROUTES
 * =========================
 */

// LOGIN // forget // reset password (ALL ROLES)
router.post("/login", loginLimiter, loginController);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password/:token", resetPasswordController);

/**
 * =========================
 * AUTH CHECK ROUTES
 * =========================
 */

// Admin auth check
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).json({ ok: true });
});

// Owner auth check
router.get("/owner-auth", requireSignIn, isOwner, (req, res) => {
  res.status(200).json({ ok: true });
});

// Student auth check
router.get("/student-auth", requireStudentSignIn, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Student authenticated",
    student: req.student,
  });
});

export default router;