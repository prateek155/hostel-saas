import express from "express";
import {
  createProject,
  getAllProjects,
  getProjectById,
  getMyProjects,
  showInterest,
  acceptStudent,
  rejectStudent,
  closeProject,
  updateProject,
  deleteProject,
  addMilestone,
  addTask,
  updateTaskStatus
} from "../controllers/projectController.js";

import { requireSignIn, isStudent } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* ================= PROJECT CRUD ================= */

// Create new project
router.post("/new-project", requireSignIn,isStudent, createProject);

// Get all projects (public)
router.get("/all-projects", getAllProjects);

// Get logged-in user's projects
router.get("/my-projects", requireSignIn, isStudent, getMyProjects);

// Get single project
router.get("/:id", getProjectById);

// Update project
router.put("/:id", requireSignIn, isStudent, updateProject );

// Delete project
router.delete("/:id", requireSignIn,isStudent, deleteProject );

/* ================= INTEREST SYSTEM ================= */

// Show interest in project
router.post("/:id/interest", requireSignIn,isStudent, showInterest);

// Accept interested student
router.put("/:id/accept/:studentId", requireSignIn,isStudent, acceptStudent);

// Reject interested student
router.put("/:id/reject/:studentId", requireSignIn,isStudent, rejectStudent);

// Close project for new interests
router.put("/:id/close", requireSignIn,isStudent, closeProject);

/* ================= PROJECT MANAGEMENT ================= */

// Add milestone
router.post("/:id/milestones", requireSignIn, isStudent, addMilestone);

// Add task
router.post("/:id/tasks", requireSignIn, isStudent, addTask);

// Update task status
router.put("/:id/tasks/:taskId", requireSignIn, isStudent, updateTaskStatus);

export default router;
