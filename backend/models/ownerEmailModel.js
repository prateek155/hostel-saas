import mongoose from "mongoose";

const ownerEmailSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
  },
  appPassword: {
    type: String,
    required: true,
  },
  emailReaderEnabled: {
    type: Boolean,
    default: true,
  },
  emailSystemEnabled: {
    type: Boolean,
    default: true,
  },

});

export default mongoose.model("OwnerEmail", ownerEmailSchema);