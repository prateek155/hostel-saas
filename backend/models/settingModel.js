import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    /* ================= SYSTEM / MAINTENANCE ================= */
    maintenanceMode: {
      type: Boolean,
      default: false,
    },

    /* ================= THEMES ================= */
    ownerTheme: {
      type: String,
      default: "blue",
      enum: ["blue", "green", "purple", "orange"],
    },

    studentTheme: {
      type: String,
      default: "blue",
      enum: ["blue", "green", "purple", "orange"],
    },

    /* ================= STUDENT CONTROLS ================= */
    studentControls: {
      view_invoice: {
        type: Boolean,
        default: true,
      },
      edit_profile: {
        type: Boolean,
        default: true,
      },
    },

    /* ================= PROJECT CONTROLS ================= */
    projectControls: {
      create_project: {
        type: Boolean,
        default: true,
      },
      update_project: {
        type: Boolean,
        default: true,
      },
      delete_project: {
        type: Boolean,
        default: true,
      },
      view_project: {
        type: Boolean,
        default: true,
      },
    },

    /* ================= LEARNING CONTROLS ================= */
    learningControls: {
      access_courses: {
        type: Boolean,
        default: true,
      },
      submit_assignments: {
        type: Boolean,
        default: true,
      },
      view_materials: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
