// models/feeModel.js
import mongoose from "mongoose";

const feeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    month: {
      type: String, // "2026-01"
      required: true,
    },

    roomSnapshot: {
      roomNumber: String,
      bedNumber: String,
      roomType: String,
    },

    monthlyRent: {
      type: Number,
      required: true,
    },

    startDate: {
      type: Date, // joining date
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "PAID"],
      default: "PENDING",
    },

    paidOn: Date,

    paymentMode: {
      type: String,
      enum: ["Cash", "UPI", "Bank", "Online"],
    },
  },
  { timestamps: true }
);

feeSchema.index({ studentId: 1, month: 1 }, { unique: true });

export default mongoose.model("Fee", feeSchema);
