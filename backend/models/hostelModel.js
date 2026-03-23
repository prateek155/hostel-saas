import mongoose from "mongoose";

const hostelSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // ❗ one owner = one hostel
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    pincode: {
      type: String,
      required: true,
    },

    hosteltype: {
      type: String,
      enum: ["Boys Hostel", "Girls Hostel", "Co-ed Hostel", "PG"],
      default: "Boys Hostel",
    },


    facilities: {
      type: [String], // ["WiFi", "Water", "Food"]
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Hostel", hostelSchema);
