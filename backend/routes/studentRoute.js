import express from "express";
import {
  addStudentController,
  getOwnerStudentsController,
  studentLoginController,
  getUnassignedStudentsController,
  getAssignedStudentsController,
  getAllStudentsController,
  getStudentsByOwnerController,
  updateStudentController,
  deleteStudentController,
  getStudentProfileController,
  updateStudentProfileController,
  getStudentDashboardStatsController,
} from "../controllers/studentController.js";
import { setStudentPasswordController, studentResetPasswordController } from "../controllers/studentAuthController.js";
import { requireSignIn, isOwner, isAdmin, isStudent } from "../middlewares/authMiddleware.js";
import { loginLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

/* OWNER */
router.post("/add-student", requireSignIn, isOwner, addStudentController);

router.get("/my-students", requireSignIn, isOwner, getOwnerStudentsController);

/* STUDENT AUTH */
router.post(
  "/student/reset-password/:token",
  studentResetPasswordController
);
// STUDENT (PUBLIC)
router.post("/set-password/:token", setStudentPasswordController);
router.post("/login", loginLimiter, studentLoginController);


// ✅ Unassigned room student
router.get(
  "/unassigned",
  requireSignIn,
  isOwner,
  getUnassignedStudentsController
);

// ✅ Assigned room student
router.get(
  "/assigned-students",
  requireSignIn,
  isOwner,
  getAssignedStudentsController
);

/* ADMIN Get All Students (USER)*/
router.get(
  "/admin/all-students",
  requireSignIn,
  isAdmin,
  getAllStudentsController
);

/* ADMIN Get Students By Owner Specific */
router.get(
  "/admin/students/:ownerId",
  requireSignIn,
  isAdmin,
  getStudentsByOwnerController
);

/* Update Student Detail */
router.put(
  "/update-student/:studentId",
  requireSignIn,
  isOwner,
  updateStudentController
);

/* Delete Of Any Student */
router.delete(
  "/delete-student/:studentId",
  requireSignIn,
  isOwner,
  deleteStudentController
);

router.get(
  "/profile",
  requireSignIn,
  isStudent,
  getStudentProfileController
);

// Update Student Profile (Student only)
router.put(
  "/profile",
  requireSignIn,
  isStudent,
  updateStudentProfileController
);

// Get Student Dashboard Stats (Student only)
router.get(
  "/dashboard-stats",
  requireSignIn,
  isStudent,
  getStudentDashboardStatsController
);

export default router;
