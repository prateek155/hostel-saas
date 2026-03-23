import express from "express";
import { requireSignIn, isOwner } from "../middlewares/authMiddleware.js";
import {
  upsertMessMenuController,
  getCurrentMessMenuController,
  deleteMessMenuController,
} from "../controllers/messController.js";

const router = express.Router();

// OWNER → CREATE / UPDATE MENU (UPSERT)
router.post(
  "/menu",
  requireSignIn,
  isOwner,
  upsertMessMenuController
);

// OWNER / STUDENT → VIEW MENU (CURRENT)
router.get(
  "/menu",
  requireSignIn,
  getCurrentMessMenuController
);

// OWNER → DELETE MENU (Soft delete, no menuId needed)
router.delete(
  "/menu",
  requireSignIn,
  isOwner,
  deleteMessMenuController
);

export default router;
