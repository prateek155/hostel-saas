import mongoose from "mongoose";

const mealSchema = new mongoose.Schema(
  {
    breakfast: {
      type: [String],
      default: [],
    },
    lunch: {
      type: [String],
      default: [],
    },
    dinner: {
      type: [String],
      default: [],
    },
  },
  { _id: false } // prevents extra _id for sub-documents
);

const messMenuSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
    },

    // 🔥 ONE MENU – DAY WISE (NO WEEK SYSTEM)
    menu: {
      Monday: { type: mealSchema, default: () => ({}) },
      Tuesday: { type: mealSchema, default: () => ({}) },
      Wednesday: { type: mealSchema, default: () => ({}) },
      Thursday: { type: mealSchema, default: () => ({}) },
      Friday: { type: mealSchema, default: () => ({}) },
      Saturday: { type: mealSchema, default: () => ({}) },
      Sunday: { type: mealSchema, default: () => ({}) },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// 🔒 IMPORTANT: prevent duplicate menus for same owner + hostel
messMenuSchema.index({ ownerId: 1, hostelId: 1 }, { unique: true });

export default mongoose.model("MessMenu", messMenuSchema);
