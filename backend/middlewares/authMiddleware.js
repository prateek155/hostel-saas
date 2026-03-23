import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

/**
 * =========================
 * REQUIRE SIGN IN (JWT VERIFY)
 * =========================
 */
export const requireSignIn = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Expect: "Bearer token"
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = JWT.verify(token, process.env.JWT_SECRET);

    /*
      decoded = {
        userId,
        role,
        hostelId,
        iat,
        exp
      }
    */
    req.user = decoded;
    next();
  } catch (error) {
    console.error("requireSignIn error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

/**
 * =========================
 * ADMIN ONLY
 * =========================
 */
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }
  next();
};

/**
 * =========================
 * OWNER ONLY
 * =========================
 */
export const isOwner = (req, res, next) => {
  if (req.user.role !== "owner") {
    return res.status(403).json({
      success: false,
      message: "Owner access required",
    });
  }
  next();
};

/**
 * =========================
 * STUDENT ONLY
 * =========================
 */
export const isStudent = (req, res, next) => {
  if (req.user.role !== "student") {
    return res.status(403).json({
      success: false,
      message: "Student access required",
    });
  }
  next();
};

export const requireStudentSignIn = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Student token missing",
      });
    }

    const decoded = JWT.verify(token, process.env.JWT_SECRET);

    // 🔴 IMPORTANT: studentId, NOT userId
    if (!decoded.studentId || decoded.role !== "student") {
      return res.status(401).json({
        success: false,
        message: "Invalid student token",
      });
    }

    req.student = decoded; // { studentId, role, hostelId }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Student authentication failed",
    });
  }
};