import express from "express";
import {
  createHostelController,
  getOwnerHostelController,
  getSingleHostelController,
  getAllHostelsController,
  updateMyHostelController,
  getOwnerDashboardStatsController,
  getOwnerEmailsController
} from "../controllers/hostelController.js";

import {
  requireSignIn,
  isOwner,
  isAdmin
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// OWNER → CREATE HOSTEL
router.post(
  "/create-hostel",
  requireSignIn,
  isOwner,
  createHostelController
);

// OWNER → GET OWN HOSTEL
router.get(
  "/my-hostel",
  requireSignIn,
  isOwner,
  getOwnerHostelController
);

// GET ALL HOSTELS
router.get(
  "/all-hostels",
  requireSignIn,
  isAdmin,
  getAllHostelsController
);

// GET SINGLE HOSTEL
router.get(
  "/hostel/:id",
  requireSignIn,
  isAdmin,
  getSingleHostelController
);

router.put(
  "/update-my-hostel",
  requireSignIn,
  isOwner,
  updateMyHostelController
);

router.get(
  "/dashboard-stats",
  requireSignIn,
  isOwner,
  getOwnerDashboardStatsController
);

// get owner emails
router.get(
  "/my-emails",
  requireSignIn,
  isOwner,
  getOwnerEmailsController
);

export default router;
