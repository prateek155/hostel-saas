import express from "express";
import {
  markAttendanceController,
  getAttendanceByDateController,
  getMyAttendanceController,
  lockAttendanceController,
  getAttendanceStatsController,
  getAttendanceByMonthController,
  getAttendanceByRangeController,
  getStudentAttendanceController,
  downloadStudentAttendancePDFController
} from "../controllers/attandanceController.js";
import { requireSignIn, isOwner, isStudent } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* MARK ATTENDANCE (NIGHT) */
router.post(
  "/mark",
  requireSignIn,
  isOwner,
  markAttendanceController
);

/* GET ATTENDANCE BY DATE */
router.get(
  "/by-date",
  requireSignIn,
  isOwner,
  getAttendanceByDateController
);

/* STUDENT LAST 30 DAYS ATTENDANCE */
router.get(
  "/my-attendance",
  requireSignIn,
  isStudent,
  getMyAttendanceController
);


router.post(
  "/lock",
  requireSignIn,
  isOwner,
  lockAttendanceController
);

router.get(
  "/stats/:studentId",
  requireSignIn,
  isOwner,
  getAttendanceStatsController
);

router.get(
  "/by-month",
  requireSignIn,
  isOwner,
  getAttendanceByMonthController
);

router.get(
  "/by-range",
  requireSignIn,
  isOwner,
  getAttendanceByRangeController
);

router.get(
  "/student/:studentId",
  requireSignIn,
  isOwner,
  getStudentAttendanceController
);

router.get(
  "/student-pdf/:studentId",
  requireSignIn,
  isOwner,
  downloadStudentAttendancePDFController
);


export default router;
