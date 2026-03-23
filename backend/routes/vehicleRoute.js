import express from "express";
import {
  getVehiclesController,
  addVehicleController,
} from "../controllers/vehicleController.js";

import { requireSignIn, isOwner } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get(
  "/",
  requireSignIn,
  isOwner,
  getVehiclesController
);

router.post(
  "/add",
  requireSignIn,
  isOwner,
  addVehicleController
);

export default router;
