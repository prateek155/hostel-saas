import userModel from "../models/userModel.js";

/**
 * =========================
 * GET LOGGED IN USER PROFILE
 * =========================
 */
export const getProfileController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * =========================
 * GET ALL USERS (ADMIN ONLY)
 * =========================
 */
export const getAllUsersController = async (req, res) => {
  try {
    const users = await userModel.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * ===================================
 * GET STUDENTS (OWNER → OWN HOSTEL)
 * ===================================
 */
export const getHostelStudentsController = async (req, res) => {
  try {
    const students = await userModel.find({
      role: "student",
      hostelId: req.user.hostelId,
    }).select("-password");

    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error("Get hostel students error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * =========================
 * UPDATE USER PROFILE
 * (Self update)
 * =========================
 */
export const updateProfileController = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await userModel.findByIdAndUpdate(
      req.user.userId,
      { name, phone },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * =========================
 * UPDATE USER ROLE
 * (ADMIN ONLY)
 * =========================
 */
export const updateUserRoleController = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    const allowedRoles = ["admin", "owner", "student"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin tampering
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin role cannot be changed",
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user,
    });
  } catch (error) {
    console.error("Update role error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * =========================
 * ACTIVATE / DEACTIVATE USER
 * (ADMIN & OWNER)
 * =========================
 */
export const toggleUserStatusController = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Owner can control only students of own hostel
    if (
      req.user.role === "owner" &&
      (user.role !== "student" ||
        String(user.hostelId) !== String(req.user.hostelId))
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Prevent admin block
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin cannot be deactivated",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${
        user.isActive ? "activated" : "deactivated"
      } successfully`,
      user,
    });
  } catch (error) {
    console.error("Toggle status error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * =========================
 * DELETE USER
 * =========================
 */
export const deleteUserController = async (req, res) => {
  try {
    const userId = req.params.id;
    const loggedInUser = req.user;

    const userToDelete = await userModel.findById(userId);

    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Owner → only students of own hostel
    if (
      loggedInUser.role === "owner" &&
      (userToDelete.role !== "student" ||
        String(userToDelete.hostelId) !== String(loggedInUser.hostelId))
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this user",
      });
    }

    // Never delete admin
    if (userToDelete.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin cannot be deleted",
      });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
