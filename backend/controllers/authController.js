import userModel from "../models/userModel.js";
import JWT from "jsonwebtoken";
import studentModel from "../models/studentModel.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 🔑 VERY IMPORTANT: select +password
    const user = await userModel
      .findOne({ email })
      .select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = JWT.sign(
      {
        userId: user._id,
        role: user.role,
        hostelId: user.hostelId,
        vehicleAccess: user.vehicleAccess, // ✅ ADD THIS
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    user.password = undefined;

    return res.status(200).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.error("LOGIN ERROR ❌", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// ✅ FORGOT PASSWORD
export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;

    // 🔍 find user (admin/owner OR student)
    let user = await userModel.findOne({ email });

    if (!user) {
      user = await studentModel.findOne({ email });
    }

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // 🔐 generate token
    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000; // 10 min

    await user.save();

    // 🔗 reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    // ✉ send email using your working utility
    await sendEmail({
      to: user.email,
      subject: "Password Reset",
      html: `
        <h2>Hello ${user.name}</h2>
        <p>You requested to reset your password.</p>
        <p>Click below to reset:</p>

        <a href="${resetLink}"
           style="padding:10px 15px;background:#2563eb;color:white;text-decoration:none;border-radius:5px;">
           Reset Password
        </a>

        <p>This link will expire in 10 minutes.</p>
      `,
    });

    res.send({
      success: true,
      message: "Reset link sent to email",
    });

  } catch (error) {
    console.log("FORGOT PASSWORD ERROR:", error);
    res.status(500).send({
      success: false,
      message: "Error in forgot password",
      error: error.message, // ✅ helpful for debugging
    });
  }
};

// ✅ RESET PASSWORD
export const resetPasswordController = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    let user = await userModel.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      user = await studentModel.findOne({
        resetToken: token,
        resetTokenExpire: { $gt: Date.now() },
      });
    }

    if (!user) {
      return res.status(400).send({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;

    await user.save();

    res.send({
      success: true,
      message: "Password reset successful",
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error resetting password",
    });
  }
};
