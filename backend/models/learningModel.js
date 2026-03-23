// models/Note.js
import mongoose from "mongoose";

const learningSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",   // reference your student model
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  linkPreviews: {
    type: Object,
    default: {}
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isFullWidth: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Index for faster queries
learningSchema.index({ createdAt: -1 });
learningSchema.index({ isArchived: 1 });

export default mongoose.model("Learning", learningSchema);