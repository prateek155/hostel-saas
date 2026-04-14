import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    /* ================= SYSTEM / MAINTENANCE ================= */
    maintenanceMode: {
      type: Boolean,
      default: false,
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
