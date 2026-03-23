import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    /* ================= STUDENT ================= */
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    /* ================= HOSTEL ================= */
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
      index: true,
    },

    /* ================= OWNER ================= */
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* ================= DATE ================= */
    date: {
      type: Date,
      required: true,
      index: true,
    },

    /* ================= STATUS ================= */
    status: {
      type: String,
      enum: ["present", "absent"],
      required: true,
    },

    /* ================= LOCK SYSTEM ================= */
    locked: {
      type: Boolean,
      default: false, // 🔒 attendance locked or not
    },

    lockedAt: {
      type: Date, // when attendance was locked
    },

    /* ================= META ================= */
    markedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);

/* =================================================
   🔐 UNIQUE ATTENDANCE PER STUDENT PER DAY
   Prevents duplicate marking
================================================= */
attendanceSchema.index(
  { studentId: 1, date: 1 },
  { unique: true }
);

/* =================================================
   ⚡ COMMON QUERY OPTIMIZATION INDEXES
================================================= */
attendanceSchema.index({ ownerId: 1, date: 1 });
attendanceSchema.index({ studentId: 1, ownerId: 1 });

export default mongoose.model("Attendance", attendanceSchema);
