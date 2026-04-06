import mongoose from "mongoose";

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
        ruleId: String,     // eslint rule id or custom tag
        message: String,    // human-readable description
        file: String,       // relative file path  e.g. "server.js"
        line: Number,       // line number (1-based)
        column: Number,     // column number
        source: String,     // the actual code snippet on that line
        fixable: Boolean,   // whether ESLint --fix can auto-fix this
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

export const SystemReport = mongoose.model("SystemReport", systemReportSchema);

// ─── Pending Security Keys ─────────────────────────────────────────────
const pendingKeySchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    type: { type: String, enum: ["package-update", "issue-fix"], default: "package-update" },
    // Package update fields
    packageName: String,
    currentVersion: String,
    latestVersion: String,
    // Issue fix fields
    fixType: String,        // "error" | "warning" | "all"
    targetFile: String,     // file path or "all"
    fixCommand: String,     // the command that will run after key verified
    issueCount: Number,     // how many issues this fix covers
    //
    used: { type: Boolean, default: false },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 60 * 1000) },
  },
  { timestamps: true }
);

export const PendingKey = mongoose.model("PendingKey", pendingKeySchema);

// ─── Update / Fix History ──────────────────────────────────────────────
const updateHistorySchema = new mongoose.Schema(
  {
    actionType: { type: String, enum: ["package-update", "issue-fix"], default: "package-update" },
    // Package update
    packageName: String,
    fromVersion: String,
    toVersion: String,
    // Issue fix
    fixType: String,
    targetFile: String,
    issuesFixed: Number,
    fixOutput: String,
    //
    securityKey: String,
    authorizedBy: { type: String, default: "admin" },
    status: { type: String, default: "success" },
  },
  { timestamps: true }
);

export const UpdateHistory = mongoose.model("UpdateHistory", updateHistorySchema);

// ─── System Settings ───────────────────────────────────────────────────
const systemSettingsSchema = new mongoose.Schema(
  {
    intervalDays: { type: Number, default: 15 },
    adminEmail: { type: String, default: "" },
    cronExpression: { type: String, default: "0 2 */15 * *" },
  },
  { timestamps: true }
);

export const SystemSettings = mongoose.model("SystemSettings", systemSettingsSchema);

export default SystemReport;