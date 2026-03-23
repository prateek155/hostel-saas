// models/roomModel.js
import mongoose from "mongoose";

const bedSchema = new mongoose.Schema(
  {
    label: {
      type: String, // A, B, C, D, E
      required: true,
    },

    isOccupied: {
      type: Boolean,
      default: false,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema(
  {
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
    },

    floor: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },

    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },

    beds: {
      type: [bedSchema], // 👈 bed-wise tracking
      required: true,
      validate: [
        (v) => v.length >= 1 && v.length <= 5,
        "Beds must be between 1 and 5",
      ],
    },

    type: {
      type: String,
      enum: ["AC", "Non-AC"],
      default: "Non-AC",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);
