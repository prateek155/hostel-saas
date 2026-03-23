import userModel from "../models/userModel.js";
import JWT from "jsonwebtoken";

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
