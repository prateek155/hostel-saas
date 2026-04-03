import express from "express";
import formidable from "express-formidable";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";
import { 
  createOwnerController,
  getAllOwnersController,
  toggleVehicleAccessController, 
  deactivateOwnerController, 
  activateOwnerController, 
  ownerPhotoController, 
  getAdminDashboardStatsController, 
  hostelDistribution,
  getHostelWiseOccupancyController,
  addOwnerEmailController,
  toggleEmailReaderController,
  getAllOwnerEmailsController,
  toggleGlobalEmailSystem } from "../controllers/adminController.js";
  

const router = express.Router();

// ADMIN → CREATE OWNER
router.post(
  "/create-owner",
  requireSignIn,
  isAdmin,
  formidable(),
  createOwnerController
);

router.get(
  "/owner-photo/:ownerId",
   requireSignIn,
   ownerPhotoController);

// ADMIN → GET ALL OWNERS
router.get(
  "/get-all-owners",
  requireSignIn,
  isAdmin,
  getAllOwnersController
);

router.put(
  "/toggle-vehicle-access/:ownerId",
  requireSignIn,
  isAdmin,
  toggleVehicleAccessController
);

router.put(
  "/deactivate-owner/:ownerId",
  requireSignIn,
  isAdmin,
  deactivateOwnerController
);

// 🔹 Reactivate owner + related data
router.put(
  "/activate-owner/:ownerId",
  requireSignIn,
  isAdmin,
  activateOwnerController
);

router.get(
  "/dashboard-stats",
  requireSignIn,
  isAdmin,
  getAdminDashboardStatsController
);

router.get(
  "/hostel-distribution",
  requireSignIn,
  isAdmin,
  hostelDistribution
);

router.get(
  "/hostel-wise-occupancy",
  requireSignIn,
  isAdmin,
  getHostelWiseOccupancyController
);

// connect email for reading (connect app password)
router.post(
  "/connect-email",
   requireSignIn, 
   isAdmin,
   addOwnerEmailController
);

// 🔥 stop email reading for a specific user 
router.post(
  "/toggle-email-reader",
  requireSignIn,
  isAdmin,
  toggleEmailReaderController
);

router.get(
  "/owner-emails",
  requireSignIn,
  isAdmin,
  getAllOwnerEmailsController
);

// stop email reading system for all (globaly)
router.post(
  "/toggle-global-email",
  requireSignIn,
  isAdmin,
  toggleGlobalEmailSystem
);



export default router;
