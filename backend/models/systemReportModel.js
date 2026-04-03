import mongoose from "mongoose";

const systemReportSchema = new mongoose.Schema(
  {
    dependencies: [
  {
    name: String,
    current: String,
    latest: String,
    type: String,
    source: String,
  },
],
    security: [
      {
        package: String,
        severity: String,
        issue: String,
      },
    ],
    errors: [
      {
        message: String,
        file: String,
        count: Number,
      },
    ],
    warnings: [
      {
        message: String,
        file: String,
        source: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("SystemReport", systemReportSchema);