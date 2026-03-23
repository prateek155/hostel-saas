import mongoose from "mongoose";

const emailSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  from: String,
  subject: String,
  message: String,
  date: Date
});

export default mongoose.model("Email", emailSchema);