// routes/feeRoutes.js
import express from "express";
import {
  getFeesByMonthController,
  generateMonthlyFeesController,
  markFeePaidController,
  downloadBillController,
  getStudentPaymentsController,
} from "../controllers/feeController.js";
import { requireSignIn, isOwner, isStudent } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/by-month", requireSignIn, isOwner, getFeesByMonthController);
router.post("/generate", requireSignIn, isOwner, generateMonthlyFeesController);
router.put("/mark-paid/:feeId", requireSignIn, isOwner, markFeePaidController);
router.get("/download/:month", requireSignIn, isStudent, downloadBillController);
router.get("/my-payments",requireSignIn, isStudent, getStudentPaymentsController);
export default router;
