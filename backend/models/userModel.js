import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false // 🔐 hide password by default
    },

    phone: {
      type: String,
      required: true
    },

    owneramount: {
      type: Number,
      default: 0,
      required: true
    },

     photo: {
      data: Buffer,
      contentType: String,
    },

    role: {
      type: String,
      enum: ["admin", "owner", "student"],
      default: "student"
    },

    /* 🚗 VEHICLE PARKING ACCESS (ADMIN CONTROLLED) */
    vehicleAccess: {
      type: Boolean,
      default: false, // ❗ OFF by default
    },

    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      default: null // ❗ admin has no hostel
    },

    isActive: {
      type: Boolean,
      default: true
    },

    lastLogin: {
      type: Date
    }
  },
  { timestamps: true }
);



// 🔐 Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔑 Compare password during login
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
