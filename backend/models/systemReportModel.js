import mongoose from "mongoose";

// ─── System Report ─────────────────────────────────────────────────────────────
const systemReportSchema = new mongoose.Schema(
  {
    // ── Package dependency data
    dependencies: [
      {
        name:    { type: String },
        current: { type: String },
        wanted:  { type: String },   // ← NEW: npm's "wanted" field
        latest:  { type: String },
        type:    { type: String },   // major | minor | patch | missing
        source:  { type: String },   // backend | client
      },
    ],

    // ── Security CVEs from npm audit
    security: [
      {
        package:  { type: String },
        severity: { type: String }, // critical | high | medium | low
        issue:    { type: String },
        cve:      { type: String }, // ← NEW: CVE ID if available
        url:      { type: String }, // ← NEW: advisory URL
      },
    ],

    // ── ESLint / regex code issues
    errors: [
      {
        ruleId:   { type: String },
        message:  { type: String },
        file:     { type: String },
        line:     { type: Number },
        column:   { type: Number },
        source:   { type: String },
        fixable:  { type: Boolean },
      },
    ],
    warnings: [
      {
        ruleId:   { type: String },
        message:  { type: String },
        file:     { type: String },
        line:     { type: Number },
        column:   { type: Number },
        source:   { type: String },
        fixable:  { type: Boolean },
      },
    ],

    // ── OS / System Health ← ENTIRELY NEW SECTION
    systemHealth: {
      // CPU
      cpuModel:      { type: String },
      cpuCores:      { type: Number },
      cpuUsage:      { type: Number },   // percentage 0-100
      loadAvg1:      { type: Number },   // 1-min load average
      loadAvg5:      { type: Number },
      loadAvg15:     { type: Number },

      // Memory
      totalMemMB:    { type: Number },
      freeMemMB:     { type: Number },
      usedMemMB:     { type: Number },
      memUsagePct:   { type: Number },   // percentage

      // Disk (root partition)
      diskTotal:     { type: String },   // human-readable e.g. "256G"
      diskUsed:      { type: String },
      diskFree:      { type: String },
      diskUsagePct:  { type: Number },

      // Runtime
      nodeVersion:   { type: String },
      npmVersion:    { type: String },
      platform:      { type: String },
      arch:          { type: String },
      hostname:      { type: String },
      uptimeSeconds: { type: Number },
      uptimeHuman:   { type: String },   // e.g. "2d 4h 12m"

      // Process
      processMemMB:  { type: Number },   // RSS of current Node process
      processCpu:    { type: Number },   // process CPU usage %
      pid:           { type: Number },

      // DB
      dbStatus:      { type: String },   // "connected" | "disconnected" | "error"
      dbName:        { type: String },

      // Overall health score 0-100
      healthScore:   { type: Number },
      healthStatus:  { type: String },   // "healthy" | "warning" | "critical"

      // Thresholds active when score was computed — lets UI explain WHY the score is what it is
      thresholds: {
        cpuWarning:   { type: Number },
        cpuCritical:  { type: Number },
        ramWarning:   { type: Number },
        ramCritical:  { type: Number },
        diskWarning:  { type: Number },
        diskCritical: { type: Number },
      },
    },

    // ── Environment audit ← NEW
    envAudit: {
      nodeEnv:         { type: String },
      requiredVarsSet: [{ type: String }],    // vars that ARE set
      missingVars:     [{ type: String }],    // required vars that are MISSING
      totalEnvVars:    { type: Number },
    },

    // ── Scan metadata
    scanDurationMs: { type: Number },   // ← NEW: how long the full scan took
    triggeredBy:    { type: String, default: "manual" }, // "manual" | "cron" | "schedule"
  },
  {
    timestamps: true,
  }
);

// ── Indexes for performance
systemReportSchema.index({ createdAt: -1 });

// ─── Pending Security Keys ─────────────────────────────────────────────────────
const pendingKeySchema = new mongoose.Schema(
  {
    key:            { type: String, required: true },
    type:           { type: String, enum: ["package-update", "issue-fix"], default: "package-update" },
    packageName:    { type: String },
    currentVersion: { type: String },
    latestVersion:  { type: String },
    fixType:        { type: String },
    targetFile:     { type: String },
    fixCommand:     { type: String },
    issueCount:     { type: Number },
    used:           { type: Boolean, default: false },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 60 * 1000),
    },
  },
  { timestamps: true }
);

// ── Auto-delete expired keys after 2 hours (TTL index)
pendingKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 7200 });

// ─── Update / Fix History ──────────────────────────────────────────────────────
const updateHistorySchema = new mongoose.Schema(
  {
    actionType:   { type: String, enum: ["package-update", "issue-fix"], default: "package-update" },
    packageName:  { type: String },
    fromVersion:  { type: String },
    toVersion:    { type: String },
    fixType:      { type: String },
    targetFile:   { type: String },
    issuesFixed:  { type: Number },
    fixOutput:    { type: String },
    securityKey:  { type: String },
    authorizedBy: { type: String, default: "admin" },
    status:       { type: String, default: "success" },
  },
  { timestamps: true }
);

updateHistorySchema.index({ createdAt: -1 });

// ─── System Settings ───────────────────────────────────────────────────────────
const systemSettingsSchema = new mongoose.Schema(
  {
    intervalDays:   { type: Number, default: 15 },
    adminEmail:     { type: String, default: "" },
    cronExpression: { type: String, default: "0 2 */15 * *" },
    timezone:       { type: String, default: "Asia/Kolkata" },

    // Required env vars to check during every audit
    // Uses YOUR actual env var names: EMAIL_USER, EMAIL_PASS, DEV_MODE etc.
    requiredEnvVars: {
      type: [String],
      default: ["NODE_ENV", "MONGO_URL", "JWT_SECRET", "EMAIL_USER", "EMAIL_PASS", "DEV_MODE"],
    },

    // ── Health score thresholds (configurable from Settings UI) ──────────────
    // These define what % usage triggers a "warning" or "critical" penalty.
    // Penalty points are deducted from 100 to produce the final health score.
    //
    // CPU thresholds
    cpuWarningPct:   { type: Number, default: 70 },  // above this → -15 pts
    cpuCriticalPct:  { type: Number, default: 90 },  // above this → -30 pts
    // Memory thresholds
    ramWarningPct:   { type: Number, default: 75 },  // above this → -10 pts
    ramCriticalPct:  { type: Number, default: 90 },  // above this → -25 pts
    // Disk thresholds
    diskWarningPct:  { type: Number, default: 75 },  // above this → -10 pts
    diskCriticalPct: { type: Number, default: 90 },  // above this → -25 pts
    // DB penalty
    dbDownPenalty:   { type: Number, default: 20 },  // deducted if DB not connected
    // Score bands
    healthyMinScore: { type: Number, default: 80 },  // >= this = "healthy"
    warningMinScore: { type: Number, default: 50 },  // >= this = "warning", below = "critical"
  },
  { timestamps: true }
);

// ── Safe model registration (works in both dev hot-reload and production)
const safeModel = (name, schema) =>
  mongoose.models[name] || mongoose.model(name, schema);

export const SystemReport   = safeModel("SystemReport",   systemReportSchema);
export const PendingKey     = safeModel("PendingKey",     pendingKeySchema);
export const UpdateHistory  = safeModel("UpdateHistory",  updateHistorySchema);
export const SystemSettings = safeModel("SystemSettings", systemSettingsSchema);