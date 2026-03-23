import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import userModel from "../models/userModel.js";

// 🔥 ABSOLUTE PATH TO ROOT .env (WORKS 100%)
dotenv.config({
  path: path.resolve(process.cwd(), "../.env"),
});

const resetPassword = async () => {
  try {
    console.log("MONGO_URL =", process.env.MONGO_URL);

    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL is not loaded");
    }

    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ MongoDB connected");

    const newPassword = "admin123";
    const hash = await bcrypt.hash(newPassword, 10);

    const result = await userModel.updateOne(
      { email: "admin@hostel.com" },
      { $set: { password: hash, isActive: true } }
    );

    console.log("Update result:", result);
    console.log("✅ Admin password reset to:", newPassword);

    process.exit();
  } catch (err) {
    console.error("❌ Reset failed:", err.message);
    process.exit(1);
  }
};

resetPassword();
