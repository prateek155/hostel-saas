import express from "express";
import { createAnnouncement } from "../controllers/announcementController.js";
import { requireSignIn, isOwner } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/announcement-create",
  requireSignIn,
  isOwner,
  createAnnouncement
);

export default router;
