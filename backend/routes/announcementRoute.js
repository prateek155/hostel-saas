import express from "express";
import {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement
} from "../controllers/announcementController.js";

import { requireSignIn , isOwner} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", requireSignIn, isOwner, createAnnouncement);
router.get("/all", requireSignIn, getAnnouncements);
router.put("/update/:id", requireSignIn, isOwner, updateAnnouncement);
router.delete("/delete/:id", requireSignIn, isOwner,  deleteAnnouncement);

export default router;