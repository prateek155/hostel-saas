import express from "express";
import {
  createRoomController,
  getRoomsController,
  assignRoomController,
  getRoomsByTypeController,
  getHostelRoomsAdminController
} from "../controllers/roomController.js";
import { requireSignIn, isOwner, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// OWNER → CREATE ROOM
router.post(
  "/create-room",
  requireSignIn,
  isOwner,
  createRoomController
);

// OWNER → GET ROOMS
router.get(
  "/my-rooms",
  requireSignIn,
  isOwner,
  getRoomsController
);

// 🔥 filter by AC / Non-AC
router.get(
  "/available/:type",
  requireSignIn,
  isOwner,
  getRoomsByTypeController
);

// 🔥 assign room + bed
router.post("/assign-room", requireSignIn, isOwner, assignRoomController);

// ✅ ADMIN → GET ALL ROOMS FOR A SPECIFIC HOSTEL
router.get(
  "/admin/hostel/:hostelId",
  requireSignIn,
  isAdmin,
  getHostelRoomsAdminController
);

export default router;
