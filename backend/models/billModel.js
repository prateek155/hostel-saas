import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    /* ================= BASIC IDENTIFIERS ================= */
    billNumber: {
      type: String,
      required: true,
      unique: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
    },

    /* ================= BILL DETAILS ================= */
    month: {
      type: String, // "2026-02"
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "PAID"],
      default: "PENDING",
    },

    paymentMode: {
      type: String,
      enum: ["Cash", "UPI", "Card", "NetBanking"],
    },

    paidOn: {
      type: Date,
    },

    /* ================= SNAPSHOT (IMPORTANT) ================= */
    studentSnapshot: {
      name: String,
      email: String,
      parentemail: String,

      roomNumber: String,
      bedNumber: String,
      roomType: String,
    },

    /* ================= META ================= */
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

/* ================= INDEX ================= */
billSchema.index({ studentId: 1, month: 1 }, { unique: true });

export default mongoose.model("Bill", billSchema);
