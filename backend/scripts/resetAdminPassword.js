import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import userModel from "../models/userModel.js";

// ✅ Load env safely (no direct dotenv usage later)
dotenv.config({
  path: path.resolve(process.cwd(), "../.env"),
});

const resetPassword = async () => {
  try {
    const mongoURL = process.env.MONGO_URL;

    if (!mongoURL) {
      throw new Error("MONGO_URL is not loaded");
    }

    console.log("MONGO_URL loaded ✅");

    await mongoose.connect(mongoURL);
    console.log("✅ MongoDB connected");

    const newPassword = "admin123";

    // ✅ bcrypt safe hashing
    const hash = await bcrypt.hash(newPassword, 10);

    const result = await userModel.updateOne(
      { email: "admin@hostel.com" },
      { $set: { password: hash, isActive: true } }
    );

    console.log("Update result:", result);
    console.log("✅ Admin password reset successfully");

    process.exit(0);
  } catch (err) {
    console.error("❌ Reset failed:", err.message);
    process.exit(1);
  }
};

resetPassword();