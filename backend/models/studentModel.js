import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const studentSchema = new mongoose.Schema(
  {
    /* ================= BASIC INFO ================= */
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },

    email: {
      type: String,
      required: true,
      unique: true,            // ❗ important
      lowercase: true,
      trim: true,
    },
    gardianemail: {
      type: String,
      required: true,
      unique: true,            // ❗ important
      lowercase: true,
      trim: true,
    },

    gardianName: {
      type: String,
      required: true,
      trim: true,
    },

    gardianphone: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    guardianAddress: {
      type: String,
      trim: true,
    },

    joinDate: {
      type: Date,
      default: Date.now,
    },

    leaveDate: {
      type: Date,
      default: null,
    },

    studentStatus: {
      type: String,
      enum: ["active", "suspended", "leave"],
      default: "active",
    },

    qrCodeToken: {
     type: String,
     unique: true,
     },


    /* ================= AUTH ================= */
    password: {
      type: String,
      select: false,           // 🔐 hidden by default
      default: null,           // no password at creation
    },

    isVerified: {
      type: Boolean,
      default: false,          // student must set password
    },

    resetToken: {
      type: String,
      default: null,
    },

    resetTokenExpiry: {
      type: Date,
      default: null,
    },

    /* ================= RELATIONS ================= */
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

    // ✅ ADD THESE
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    default: null,
  },

  bedNumber: {
    type: String,
  enum: ["A", "B", "C", "D", "E"],
  },

  monthlyRent: {
  type: Number,
  default: 0,
  },

  Deposit: {
  type: Number,
  default: 0,
  },

    /* ================= STATUS ================= */
    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

/* ================= PASSWORD HASH ================= */
studentSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

/* ================= PASSWORD COMPARE ================= */
studentSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("Student", studentSchema);