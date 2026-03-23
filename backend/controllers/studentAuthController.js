import studentModel from "../models/studentModel.js";

export const setStudentPasswordController = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const student = await studentModel.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    }).select("+password");

    if (!student) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    student.password = password;
    student.isVerified = true;
    student.resetToken = null;
    student.resetTokenExpiry = null;

    await student.save();

    res.status(200).json({
      success: true,
      message: "Password set successfully",
    });

  } catch (error) {
    console.error("SET PASSWORD ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to set password",
    });
  }
};

export const studentResetPasswordController = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and password are required",
      });
    }

    const student = await studentModel.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    }).select("+password");

    if (!student) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset link",
      });
    }

    // ✅ set new password
    student.password = password;
    student.isVerified = true;

    // ❌ invalidate token
    student.resetToken = null;
    student.resetTokenExpiry = null;

    await student.save();

    res.status(200).json({
      success: true,
      message: "Password set successfully. You can now login.",
    });
  } catch (error) {
    console.error("STUDENT RESET PASSWORD ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
};
