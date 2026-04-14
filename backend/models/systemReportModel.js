import mongoose from "mongoose";

/* 🧠 FIX: Prevent model overwrite / caching issue */
delete mongoose.models.SystemReport;
delete mongoose.models.PendingKey;
delete mongoose.models.UpdateHistory;
delete mongoose.models.SystemSettings;

// ─── System Report ────────────────────────────────────────────────────
const systemReportSchema = new mongoose.Schema(
  {
    dependencies: [
      {
        name: String,
        current: String,
        latest: String,
        type: String,   // major | minor | patch | missing
        source: String, // backend | client
      },
    ],
    security: [
      {
        package: String,
        severity: String, // critical | high | medium | low
        issue: String,
      },
    ],
    errors: [
      {
        ruleId: String,
        message: String,
        file: String,
        line: Number,
        column: Number,
        source: String,
        fixable: Boolean,
      },
    ],
    warnings: [
      {
        ruleId: String,
        message: String,
        file: String,
        line: Number,
        column: Number,
        source: String,
        fixable: Boolean,
      },
    ],
  },
  { timestamps: true }
);

export const SystemReport =
  mongoose.models.SystemReport ||
  mongoose.model("SystemReport", systemReportSchema);

// ─── Pending Security Keys ─────────────────────────────────────────────
const pendingKeySchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    type: {
      type: String,
      enum: ["package-update", "issue-fix"],
      default: "package-update",
    },
    packageName: String,
    currentVersion: String,
    latestVersion: String,
    fixType: String,
    targetFile: String,
    fixCommand: String,
    issueCount: Number,
    used: { type: Boolean, default: false },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 60 * 1000),
    },
  },
  { timestamps: true }
);

export const PendingKey =
  mongoose.models.PendingKey ||
  mongoose.model("PendingKey", pendingKeySchema);

// ─── Update / Fix History ──────────────────────────────────────────────
const updateHistorySchema = new mongoose.Schema(
  {
    actionType: {
      type: String,
      enum: ["package-update", "issue-fix"],
      default: "package-update",
    },
    packageName: String,
    fromVersion: String,
    toVersion: String,
    fixType: String,
    targetFile: String,
    issuesFixed: Number,
    fixOutput: String,
    securityKey: String,
    authorizedBy: { type: String, default: "admin" },
    status: { type: String, default: "success" },
  },
  { timestamps: true }
);

export const UpdateHistory =
  mongoose.models.UpdateHistory ||
  mongoose.model("UpdateHistory", updateHistorySchema);

// ─── System Settings ───────────────────────────────────────────────────
const systemSettingsSchema = new mongoose.Schema(
  {
    intervalDays: { type: Number, default: 15 },
    adminEmail: { type: String, default: "" },
    cronExpression: { type: String, default: "0 2 */15 * *" },
  },
  { timestamps: true }
);

export const SystemSettings =
  mongoose.models.SystemSettings ||
  mongoose.model("SystemSettings", systemSettingsSchema);