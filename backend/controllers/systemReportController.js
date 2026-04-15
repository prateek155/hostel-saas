import path from "path";
import fs from "fs";
import os from "os";
import crypto from "crypto";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import mongoose from "mongoose";
import {
  SystemReport,
  PendingKey,
  UpdateHistory,
  SystemSettings,
} from "../models/systemReportModel.js";
import userModel from "../models/userModel.js";
import { runCommand, runCommandJSON, runCommandText } from "../utils/commandRunner.js";

/* ── Safe cron import ────────────────────────────────────────────────────────── */
let restartCron = () => {};

(async () => {
  try {
    const cronMod = await import("../jobs/systemCron.js");
    if (typeof cronMod.restartCron === "function") restartCron = cronMod.restartCron;
  } catch (e) {
    console.error("[Cron] Could not load systemCron.js:", e.message);
  }
})();

/* ═══════════════════════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════════════════════ */

const SCAN_EXTS = [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"];
const SKIP_DIRS = [
  "node_modules", ".git", "dist", "build", ".next", "coverage",
  ".cache", "__tests__", "__mocks__", "test", "tests", "spec",
];

const REQUIRED_ENV_VARS = [
  "NODE_ENV", "MONGO_URL", "JWT_SECRET",
  "EMAIL_USER", "EMAIL_PASS",   // ← your actual env var names
  "DEV_MODE",                   // ← dev/prod switch
];

const WARN_PATTERNS = [
  { re: /console\.(log|warn|info|debug)\s*\(/, ruleId: "no-console",   message: "console statement found",                      fixable: true  },
  { re: /TODO[:\s]/i,                          ruleId: "no-todo",      message: "TODO comment found",                           fixable: false },
  { re: /FIXME[:\s]/i,                         ruleId: "no-fixme",     message: "FIXME comment found",                          fixable: false },
  { re: /\bvar\s+\w/,                          ruleId: "no-var",       message: "Use of 'var' — prefer const/let",              fixable: true  },
  { re: /[^=!<>]==(?!=)/,                      ruleId: "eqeqeq",       message: "Use === instead of ==",                        fixable: true  },
  { re: /\beval\s*\(/,                         ruleId: "no-eval",      message: "Use of eval() is a security risk",             fixable: false },
  { re: /\bdebugger\b/,                        ruleId: "no-debugger",  message: "debugger statement found",                     fixable: true  },
  { re: /process\.env\.\w+[^|\s&?!]/,          ruleId: "no-raw-env",   message: "Unguarded process.env — add a fallback value", fixable: false },
  { re: /require\(['"]password/i,              ruleId: "no-hardcoded", message: "Possible hardcoded credential",                fixable: false },
  { re: /password\s*=\s*['"][^'"]+['"]/i,      ruleId: "no-hardcoded", message: "Possible hardcoded password",                  fixable: false },
];

const ERROR_PATTERNS = [
  { re: /throw\s+['"`][^'"`;]+['"`]/,           ruleId: "no-string-throw",    message: "Throwing a string instead of Error object",       fixable: false },
  { re: /JSON\.parse\([^)]+\)(?!\s*catch|\s*})/,ruleId: "no-unsafe-parse",    message: "JSON.parse without try/catch — can throw",         fixable: false },
  { re: /\.env\b(?!\.)/,                         ruleId: "dotenv-access",      message: "Accessing .env directly — use process.env",        fixable: false },
];

/* ═══════════════════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════════════════ */

const getAdminEmail = async () => {
  try {
    // 1. Admin override set from the Settings UI takes highest priority
    const s = await SystemSettings.findOne();
    if (s?.adminEmail) return s.adminEmail;
    // 2. Find user with role "admin" in your userModel — uses field: email
    const adminUser = await userModel.findOne({ role: "admin" }).select("email");
    if (adminUser?.email) return adminUser.email;
    // 3. Final fallback — EMAIL_USER is your sender address so it doubles as admin
    return process.env.EMAIL_USER || "";
  } catch {
    return process.env.EMAIL_USER || "";
  }
};

const getRequiredEnvVars = async () => {
  try {
    const s = await SystemSettings.findOne();
    return s?.requiredEnvVars?.length ? s.requiredEnvVars : REQUIRED_ENV_VARS;
  } catch {
    return REQUIRED_ENV_VARS;
  }
};

const generateKey = () => {
  try {
    return String(crypto.randomInt(100000, 999999));
  } catch {
    return String(Math.floor(100000 + Math.random() * 900000));
  }
};

const resolveFilePath = (relPath) => {
  if (!relPath) return null;
  const withoutLabel = relPath.replace(/^(backend|client)\//, "");
  const abs = path.resolve(process.cwd(), withoutLabel);
  if (!abs.startsWith(process.cwd())) return null;
  return abs;
};

/** Format seconds into "Xd Xh Xm" */
const formatUptime = (totalSeconds) => {
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(" ");
};

/**
 * Compute health score 0-100 using thresholds from SystemSettings.
 * Each metric is checked against warning and critical thresholds.
 * Penalties are deducted from 100:
 *   CPU  critical (default >90%) → -30  |  warning (default >70%) → -15
 *   RAM  critical (default >90%) → -25  |  warning (default >75%) → -10
 *   Disk critical (default >90%) → -25  |  warning (default >75%) → -10
 *   DB disconnected              → -20  (configurable via dbDownPenalty)
 * Thresholds are fully configurable from the Settings UI — no code changes needed.
 */
const computeHealthScore = (health, settings = null) => {
  // Pull thresholds from DB settings, fall back to safe defaults
  const cpuWarn  = settings?.cpuWarningPct   ?? 70;
  const cpuCrit  = settings?.cpuCriticalPct  ?? 90;
  const ramWarn  = settings?.ramWarningPct   ?? 75;
  const ramCrit  = settings?.ramCriticalPct  ?? 90;
  const diskWarn = settings?.diskWarningPct  ?? 75;
  const diskCrit = settings?.diskCriticalPct ?? 90;
  const dbPen    = settings?.dbDownPenalty   ?? 20;

  let score = 100;

  // CPU
  if (health.cpuUsage >= cpuCrit)       score -= 30;
  else if (health.cpuUsage >= cpuWarn)  score -= 15;

  // Memory
  if (health.memUsagePct >= ramCrit)      score -= 25;
  else if (health.memUsagePct >= ramWarn) score -= 10;

  // Disk
  if (health.diskUsagePct >= diskCrit)      score -= 25;
  else if (health.diskUsagePct >= diskWarn) score -= 10;

  // Database connectivity
  if (health.dbStatus !== "connected") score -= dbPen;

  return Math.max(0, score);
};

/* ═══════════════════════════════════════════════════════════════════════════════
   SYSTEM HEALTH COLLECTOR  ← Fully dynamic, OS-level data
═══════════════════════════════════════════════════════════════════════════════ */

const collectSystemHealth = async () => {
  const health = {};

  /* ── CPU ── */
  const cpus = os.cpus();
  health.cpuModel = cpus[0]?.model?.trim() || "Unknown";
  health.cpuCores = cpus.length;

  // CPU usage: take two snapshots 500ms apart
  const cpuUsageSample = () => {
    const cs = os.cpus();
    let idle = 0, total = 0;
    cs.forEach((c) => {
      const times = c.times;
      idle  += times.idle;
      total += times.user + times.nice + times.sys + times.idle + times.irq;
    });
    return { idle, total };
  };
  const s1 = cpuUsageSample();
  await new Promise((r) => setTimeout(r, 500));
  const s2 = cpuUsageSample();
  const idleDelta  = s2.idle  - s1.idle;
  const totalDelta = s2.total - s1.total;
  health.cpuUsage  = totalDelta > 0
    ? Math.round((1 - idleDelta / totalDelta) * 100)
    : 0;

  /* Load averages (not available on Windows — falls back to 0) */
  const [l1, l5, l15] = os.loadavg();
  health.loadAvg1  = parseFloat(l1.toFixed(2));
  health.loadAvg5  = parseFloat(l5.toFixed(2));
  health.loadAvg15 = parseFloat(l15.toFixed(2));

  /* ── Memory ── */
  const totalMem = os.totalmem();
  const freeMem  = os.freemem();
  const usedMem  = totalMem - freeMem;
  health.totalMemMB  = Math.round(totalMem / 1024 / 1024);
  health.freeMemMB   = Math.round(freeMem  / 1024 / 1024);
  health.usedMemMB   = Math.round(usedMem  / 1024 / 1024);
  health.memUsagePct = Math.round((usedMem / totalMem) * 100);

  /* ── Disk ── */
  try {
    const isWin = process.platform === "win32";
    if (isWin) {
      const raw = await runCommandText("wmic logicaldisk get Size,FreeSpace,Caption", process.cwd(), 8000);
      const lines = raw.split("\n").filter((l) => l.includes(":"));
      if (lines.length) {
        const parts = lines[0].trim().split(/\s+/);
        const free  = parseInt(parts[1] || "0", 10);
        const total = parseInt(parts[2] || "0", 10);
        const used  = total - free;
        const gb = (b) => (b / 1024 / 1024 / 1024).toFixed(1) + "G";
        health.diskTotal    = gb(total);
        health.diskUsed     = gb(used);
        health.diskFree     = gb(free);
        health.diskUsagePct = total > 0 ? Math.round((used / total) * 100) : 0;
      }
    } else {
      const raw = await runCommandText("df -BG / 2>/dev/null | tail -1", process.cwd(), 8000);
      if (raw) {
        const parts = raw.trim().split(/\s+/);
        health.diskTotal    = parts[1] || "?";
        health.diskUsed     = parts[2] || "?";
        health.diskFree     = parts[3] || "?";
        health.diskUsagePct = parseInt((parts[4] || "0%").replace("%", ""), 10) || 0;
      }
    }
  } catch (err) {
    console.error("[Health] Disk check error:", err.message);
    health.diskTotal = health.diskUsed = health.diskFree = "N/A";
    health.diskUsagePct = 0;
  }

  /* ── Runtime / Process ── */
  health.nodeVersion = process.version;
  health.platform    = os.platform();
  health.arch        = os.arch();
  health.hostname    = os.hostname();

  const uptimeSec = Math.floor(os.uptime());
  health.uptimeSeconds = uptimeSec;
  health.uptimeHuman   = formatUptime(uptimeSec);

  const memUsage = process.memoryUsage();
  health.processMemMB = Math.round(memUsage.rss / 1024 / 1024);
  health.pid          = process.pid;

  // npm version
  try {
    const npmVer = await runCommandText("npm --version", process.cwd(), 8000);
    health.npmVersion = npmVer.trim() || "unknown";
  } catch {
    health.npmVersion = "unknown";
  }

  /* ── Database ── */
  try {
    const state = mongoose.connection.readyState;
    health.dbStatus = state === 1 ? "connected" : state === 2 ? "connecting" : "disconnected";
    health.dbName   = mongoose.connection.name || "unknown";
  } catch {
    health.dbStatus = "error";
    health.dbName   = "unknown";
  }

  /* ── Process CPU (approximation via /proc on Linux) ── */
  try {
    if (process.platform === "linux") {
      const raw = await runCommandText(`ps -p ${process.pid} -o %cpu --no-headers`, process.cwd(), 5000);
      health.processCpu = parseFloat(raw.trim()) || 0;
    } else {
      health.processCpu = 0;
    }
  } catch {
    health.processCpu = 0;
  }

  /* ── Health score — computed using thresholds from DB settings ── */
  let _settings = null;
  try { _settings = await SystemSettings.findOne(); } catch {}

  health.healthScore  = computeHealthScore(health, _settings);

  // Score bands also come from settings so admin can tune them
  const healthyMin = _settings?.healthyMinScore ?? 80;
  const warningMin = _settings?.warningMinScore ?? 50;
  health.healthStatus =
    health.healthScore >= healthyMin ? "healthy"
    : health.healthScore >= warningMin ? "warning"
    : "critical";

  // Store which thresholds were used — useful for the UI to display context
  health.thresholds = {
    cpuWarning:   _settings?.cpuWarningPct   ?? 70,
    cpuCritical:  _settings?.cpuCriticalPct  ?? 90,
    ramWarning:   _settings?.ramWarningPct   ?? 75,
    ramCritical:  _settings?.ramCriticalPct  ?? 90,
    diskWarning:  _settings?.diskWarningPct  ?? 75,
    diskCritical: _settings?.diskCriticalPct ?? 90,
  };

  return health;
};

/* ═══════════════════════════════════════════════════════════════════════════════
   ENV AUDIT
═══════════════════════════════════════════════════════════════════════════════ */

const collectEnvAudit = async () => {
  const requiredVars = await getRequiredEnvVars();
  const set     = requiredVars.filter((v) => !!process.env[v]);
  const missing = requiredVars.filter((v) => !process.env[v]);
  return {
    nodeEnv:         process.env.NODE_ENV || "not set",
    requiredVarsSet: set,
    missingVars:     missing,
    totalEnvVars:    Object.keys(process.env).length,
  };
};

/* ═══════════════════════════════════════════════════════════════════════════════
   DEPENDENCY SCANNER
═══════════════════════════════════════════════════════════════════════════════ */

const scanDependencies = async () => {
  const dependencies = [];
  const locations = [
    { name: "backend", path: process.cwd() },
    { name: "client",  path: path.join(process.cwd(), "client") },
  ];

  for (const loc of locations) {
    if (!fs.existsSync(loc.path)) continue;
    try {
      const data = await runCommandJSON("npm outdated --json", loc.path, 35000);
      if (!data || typeof data !== "object") continue;

      const entries = Array.isArray(data) ? data : Object.entries(data).map(([name, info]) => ({
        name,
        current: info.current || "unknown",
        wanted:  info.wanted  || "unknown",
        latest:  info.latest  || "unknown",
      }));

      for (const pkg of entries) {
        const cur = pkg.current || "unknown";
        const lat = pkg.latest  || "unknown";
        let type = "patch";
        if (!pkg.current || pkg.current === "MISSING") type = "missing";
        else if (cur.split(".")[0] !== lat.split(".")[0]) type = "major";
        else if (cur.split(".")[1] !== lat.split(".")[1]) type = "minor";

        dependencies.push({
          name:    pkg.name    || "unknown",
          current: cur,
          wanted:  pkg.wanted  || cur,
          latest:  lat,
          type,
          source:  loc.name,
        });
      }
      console.error(`[Deps] ${loc.name}: ${entries.length} outdated`);
    } catch (err) {
      console.error("[Deps] Error", loc.name, err.message);
    }
  }

  return dependencies;
};

/* ═══════════════════════════════════════════════════════════════════════════════
   SECURITY SCANNER
═══════════════════════════════════════════════════════════════════════════════ */

const scanSecurity = async () => {
  const security = [];
  try {
    const data = await runCommandJSON("npm audit --json", process.cwd(), 35000);
    if (!data) return security;

    if (data.vulnerabilities) {
      // npm v7+ format
      for (const [pkg, vuln] of Object.entries(data.vulnerabilities)) {
        const viaObj = Array.isArray(vuln.via)
          ? vuln.via.find((v) => typeof v === "object" && v.title)
          : null;
        security.push({
          package:  pkg,
          severity: vuln.severity || viaObj?.severity || "unknown",
          issue:    viaObj?.title || `Vulnerability in ${pkg}`,
          cve:      viaObj?.cve || "",
          url:      viaObj?.url || "",
        });
      }
    } else if (data.advisories) {
      // npm v6 format
      for (const adv of Object.values(data.advisories)) {
        security.push({
          package:  adv.module_name,
          severity: adv.severity || "unknown",
          issue:    adv.title || "Security vulnerability",
          cve:      adv.cves?.[0] || "",
          url:      adv.url || "",
        });
      }
    }
    console.error(`[Security] Found ${security.length} vulnerabilities`);
  } catch (err) {
    console.error("[Security] Scan error:", err.message);
  }
  return security;
};

/* ═══════════════════════════════════════════════════════════════════════════════
   CODE SCANNER  (ESLint with regex fallback)
═══════════════════════════════════════════════════════════════════════════════ */

const runEslint = async (dirPath, label) => {
  try {
    const result = await runCommand(
      "npx --no eslint . --format json --max-warnings=9999",
      dirPath,
      50000
    );
    const raw = result.stdout || result.stderr;
    if (raw && raw.trim().startsWith("[")) {
      const results  = JSON.parse(raw);
      const errors   = [];
      const warnings = [];
      for (const fr of results) {
        const relFile = path.relative(process.cwd(), fr.filePath).replace(/\\/g, "/");
        for (const msg of fr.messages || []) {
          const item = {
            ruleId:  msg.ruleId || "unknown",
            message: msg.message,
            file:    `${label}/${relFile}`,
            line:    msg.line    || 0,
            column:  msg.column  || 0,
            source:  (msg.source || "").trim().slice(0, 300),
            fixable: !!(msg.fix || msg.suggestions?.length),
          };
          if (msg.severity === 2) errors.push(item);
          else warnings.push(item);
        }
      }
      console.error(`[ESLint] ${label}: ${errors.length} errors, ${warnings.length} warnings`);
      return { errors, warnings };
    }
  } catch (err) {
    console.error("[ESLint] Fallback to regex:", err.message.slice(0, 80));
  }
  return regexScan(dirPath, label);
};

const regexScan = (dirPath, label) => {
  const errors = [], warnings = [];
  const walkDir = (dir) => {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (SKIP_DIRS.includes(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { walkDir(full); continue; }
      if (!SCAN_EXTS.includes(path.extname(entry.name))) continue;
      let content;
      try { content = fs.readFileSync(full, "utf8"); } catch { continue; }
      const relFile = `${label}/${path.relative(dirPath, full).replace(/\\/g, "/")}`;
      content.split("\n").forEach((lineText, idx) => {
        const lineNum = idx + 1;
        for (const p of WARN_PATTERNS) {
          if (p.re.test(lineText)) {
            warnings.push({ ruleId: p.ruleId, message: p.message, file: relFile, line: lineNum, column: (lineText.search(p.re) || 0) + 1, source: lineText.trim().slice(0, 300), fixable: p.fixable });
          }
        }
        for (const p of ERROR_PATTERNS) {
          if (new RegExp(p.re.source).test(lineText)) {
            errors.push({ ruleId: p.ruleId, message: p.message, file: relFile, line: lineNum, column: 1, source: lineText.trim().slice(0, 300), fixable: p.fixable });
          }
        }
      });
    }
  };
  walkDir(dirPath);
  return { errors, warnings };
};

const dedup = (arr) => {
  const seen = new Set();
  return arr.filter((item) => {
    const k = `${item.file}:${item.line}:${item.ruleId}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

/* ═══════════════════════════════════════════════════════════════════════════════
   PDF GENERATOR  — professional, data-rich layout
═══════════════════════════════════════════════════════════════════════════════ */

const generatePDFBuffer = (report) =>
  new Promise((resolve, reject) => {
    try {
      const doc    = new PDFDocument({ margin: 40, size: "A4" });
      const chunks = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end",  () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const now   = new Date(report.createdAt || Date.now()).toLocaleString("en-IN");
      const deps  = report.dependencies  || [];
      const sec   = report.security      || [];
      const errs  = report.errors        || [];
      const wrns  = report.warnings      || [];
      const hlth  = report.systemHealth  || {};
      const env   = report.envAudit      || {};
      const W     = doc.page.width - 80; // usable width

      /* ── Header band ── */
      doc.rect(0, 0, doc.page.width, 80).fill("#0f172a");
      doc.fillColor("#3b82f6").fontSize(9).font("Helvetica").text("STAYOS ENTERPRISE", 40, 18, { characterSpacing: 2 });
      doc.fillColor("#ffffff").fontSize(18).font("Helvetica-Bold").text("System Audit Report", 40, 30);
      doc.fillColor("#94a3b8").fontSize(9).font("Helvetica").text(`Generated: ${now}  ·  Triggered by: ${report.triggeredBy || "manual"}  ·  Scan: ${report.scanDurationMs ? (report.scanDurationMs / 1000).toFixed(1) + "s" : "—"}`, 40, 56);
      doc.y = 100;

      /* ── Health Score band ── */
      const hs     = hlth.healthScore ?? 100;
      const hsCol  = hs >= 80 ? "#10b981" : hs >= 50 ? "#f59e0b" : "#ef4444";
      doc.rect(40, doc.y, W, 50).fillAndStroke("#f8fafc", "#e2e8f0");
      doc.fillColor(hsCol).fontSize(28).font("Helvetica-Bold").text(String(hs), 50, doc.y - 42, { continued: true });
      doc.fillColor("#64748b").fontSize(10).font("Helvetica").text(`/100  ·  ${hlth.healthStatus?.toUpperCase() || "—"}`, { continued: false });
      doc.fillColor("#64748b").fontSize(8).text(`Host: ${hlth.hostname || "—"}  ·  Platform: ${hlth.platform || "—"} ${hlth.arch || ""}  ·  Node: ${hlth.nodeVersion || "—"}  ·  npm: ${hlth.npmVersion || "—"}  ·  Uptime: ${hlth.uptimeHuman || "—"}`, 50, doc.y - 10);
      doc.y += 20;

      /* ── Summary boxes ── */
      const boxes = [
        { label: "Outdated Pkgs", val: deps.length,  color: deps.length  ? "#f59e0b" : "#10b981" },
        { label: "Security CVEs", val: sec.length,   color: sec.length   ? "#ef4444" : "#10b981" },
        { label: "Code Errors",   val: errs.length,  color: errs.length  ? "#ef4444" : "#10b981" },
        { label: "Warnings",      val: wrns.length,  color: wrns.length  ? "#f59e0b" : "#10b981" },
        { label: "Missing Env",   val: env.missingVars?.length || 0, color: (env.missingVars?.length || 0) > 0 ? "#f59e0b" : "#10b981" },
      ];
      const bw = (W - 4 * 8) / 5;
      const sumY = doc.y + 10;
      boxes.forEach((b, i) => {
        const x = 40 + i * (bw + 8);
        doc.rect(x, sumY, bw, 56).fillAndStroke("#ffffff", "#e2e8f0");
        doc.fillColor(b.color).fontSize(20).font("Helvetica-Bold").text(String(b.val), x + 4, sumY + 8, { width: bw - 8, align: "center" });
        doc.fillColor("#64748b").fontSize(7.5).font("Helvetica").text(b.label, x + 4, sumY + 38, { width: bw - 8, align: "center" });
      });
      doc.y = sumY + 76;

      /* ── Section helper ── */
      const section = (title, color, items, formatter) => {
        if (!items.length) return;
        if (doc.y > 680) doc.addPage();
        doc.moveDown(0.6);
        doc.rect(40, doc.y, W, 18).fill(color + "22");
        doc.fillColor(color).fontSize(11).font("Helvetica-Bold").text(title, 48, doc.y - 14);
        doc.y += 8;
        doc.moveDown(0.2);
        items.slice(0, 40).forEach((item) => {
          if (doc.y > 740) doc.addPage();
          doc.fillColor("#334155").fontSize(8.5).font("Helvetica").text("• " + formatter(item), { indent: 14, lineGap: 1.5 });
        });
        if (items.length > 40) {
          doc.fillColor("#94a3b8").fontSize(8).text(`  … and ${items.length - 40} more — see admin panel`, { indent: 14 });
        }
      };

      /* ── System Health detail ── */
      if (Object.keys(hlth).length) {
        if (doc.y > 640) doc.addPage();
        doc.moveDown(0.6);
        doc.rect(40, doc.y, W, 18).fill("#3b82f620");
        doc.fillColor("#3b82f6").fontSize(11).font("Helvetica-Bold").text("System Health", 48, doc.y - 14);
        doc.y += 10;

        const rows = [
          ["CPU Model", hlth.cpuModel || "—"],
          ["CPU Cores / Usage", `${hlth.cpuCores || "?"}  cores  ·  ${hlth.cpuUsage ?? "?"}% usage  ·  Load: ${hlth.loadAvg1}/${hlth.loadAvg5}/${hlth.loadAvg15}`],
          ["Memory", `${hlth.usedMemMB || "?"}MB used / ${hlth.totalMemMB || "?"}MB total  (${hlth.memUsagePct ?? "?"}%)`],
          ["Disk (root)", `${hlth.diskUsed || "?"}  used / ${hlth.diskTotal || "?"}  total  (${hlth.diskUsagePct ?? "?"}%)  ·  Free: ${hlth.diskFree || "?"}`],
          ["Process Memory", `${hlth.processMemMB || "?"}MB RSS  ·  PID ${hlth.pid || "?"}`],
          ["Database", `${hlth.dbStatus || "?"}  —  ${hlth.dbName || "?"}`],
          ["Uptime", hlth.uptimeHuman || "—"],
        ];
        rows.forEach(([lbl, val]) => {
          if (doc.y > 740) doc.addPage();
          doc.fillColor("#1e293b").fontSize(8.5).font("Helvetica-Bold").text(lbl + ": ", 54, doc.y, { continued: true });
          doc.fillColor("#334155").font("Helvetica").text(val);
        });
      }

      /* ── Environment Audit ── */
      if (env.missingVars?.length) {
        section(`Environment Issues (${env.missingVars.length} missing vars)`, "#f59e0b", env.missingVars, (v) => `${v} is NOT set`);
      }

      section(`Outdated Packages (${deps.length})`, "#f59e0b", deps, (d) =>
        `${d.name} [${d.source}]:  current ${d.current}  →  wanted ${d.wanted}  →  latest ${d.latest}  [${d.type}]`
      );
      section(`Security Vulnerabilities (${sec.length})`, "#ef4444", sec, (s) =>
        `${s.package}  —  ${s.severity}:  ${s.issue}${s.cve ? "  [" + s.cve + "]" : ""}`
      );
      section(`Code Errors (${errs.length})`, "#ef4444", errs, (e) =>
        `${e.file}:${e.line}  [${e.ruleId}]  ${e.message}`
      );
      section(`Warnings (${wrns.length})`, "#d97706", wrns, (w) =>
        `${w.file}:${w.line}  [${w.ruleId}]  ${w.message}`
      );

      /* ── Footer ── */
      doc.moveDown(2);
      doc.fillColor("#94a3b8").fontSize(8).font("Helvetica")
        .text("Generated by StayOS Enterprise System Monitor. Login to admin panel to review and take action.", { align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });

/* ═══════════════════════════════════════════════════════════════════════════════
   MAILER
═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Send an email using EMAIL_USER / EMAIL_PASS from your .env
 *
 * DEV_MODE behaviour:
 *   DEV_MODE=true  → emails are NOT sent; full content is logged to console instead.
 *                    Useful during local development so you never accidentally spam.
 *   DEV_MODE=false (or unset) → emails are sent normally via SMTP.
 */
const sendMail = async (to, subject, html, pdfBuffer = null) => {
  if (!to) {
    console.error("[Mail] Skipping — no recipient address");
    return;
  }

  // DEV_MODE: log to console, skip SMTP entirely
  const isDevMode = process.env.DEV_MODE === "true";
  if (isDevMode) {
    console.error("\n[Mail][DEV_MODE] ═══════════════════════════════");
    console.error("[Mail][DEV_MODE] TO     :", to);
    console.error("[Mail][DEV_MODE] SUBJECT:", subject);
    console.error("[Mail][DEV_MODE] HTML   :", html.slice(0, 400), "...(truncated)");
    if (pdfBuffer) console.error("[Mail][DEV_MODE] PDF attachment: yes,", pdfBuffer.length, "bytes");
    console.error("[Mail][DEV_MODE] ═══════════════════════════════\n");
    return;
  }

  // Production: require EMAIL_USER and EMAIL_PASS
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("[Mail] Skipping — EMAIL_USER or EMAIL_PASS not set in .env");
    return;
  }

  try {
    const t = nodemailer.createTransport({
      host:   process.env.EMAIL_HOST || "smtp.gmail.com",
      port:   Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth:   { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    const opts = {
      from:    `"StayOS Enterprise" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };
    if (pdfBuffer) {
      opts.attachments = [{
        filename:    `stayos-audit-${new Date().toISOString().split("T")[0]}.pdf`,
        content:     pdfBuffer,
        contentType: "application/pdf",
      }];
    }
    await t.sendMail(opts);
    console.error("[Mail] Sent to", to, pdfBuffer ? "(with PDF)" : "");
  } catch (err) {
    console.error("[Mail] Error:", err.message);
  }
};

/* ═══════════════════════════════════════════════════════════════════════════════
   CORE REPORT GENERATOR  (internal — can be called by cron or HTTP handler)
═══════════════════════════════════════════════════════════════════════════════ */

export const runFullAudit = async (triggeredBy = "manual") => {
  const scanStart = Date.now();
  console.error(`[Audit] Starting full audit (${triggeredBy})`);

  const [systemHealth, envAudit, dependencies, security] = await Promise.all([
    collectSystemHealth(),
    collectEnvAudit(),
    scanDependencies(),
    scanSecurity(),
  ]);

  let errors = [], warnings = [];

  const backendPath = process.cwd();
  const clientPath  = path.join(process.cwd(), "client");

  const [bs, cs] = await Promise.all([
    runEslint(backendPath, "backend").catch((e) => { console.error("[Scan] Backend error:", e.message); return { errors: [], warnings: [] }; }),
    fs.existsSync(clientPath)
      ? runEslint(clientPath, "client").catch((e) => { console.error("[Scan] Client error:", e.message); return { errors: [], warnings: [] }; })
      : Promise.resolve({ errors: [], warnings: [] }),
  ]);

  errors   = dedup([...bs.errors,   ...cs.errors]);
  warnings = dedup([...bs.warnings, ...cs.warnings]);

  const scanDurationMs = Date.now() - scanStart;

  const report = await SystemReport.create({
    dependencies,
    security,
    errors,
    warnings,
    systemHealth,
    envAudit,
    scanDurationMs,
    triggeredBy,
  });

  console.error(`[Audit] Done in ${scanDurationMs}ms — deps:${dependencies.length} sec:${security.length} err:${errors.length} warn:${warnings.length} health:${systemHealth.healthScore}`);

  // Email (non-blocking)
  getAdminEmail().then(async (adminEmail) => {
    if (!adminEmail) return;
    let pdfBuffer = null;
    try { pdfBuffer = await generatePDFBuffer(report); } catch (pe) { console.error("[Mail] PDF error:", pe.message); }

    const depH = dependencies.length ? dependencies.map((d) => `<li><b>${d.name}</b> [${d.source}]: <span style="color:#999">${d.current}</span> → <b style="color:#10b981">${d.latest}</b> <i>(${d.type})</i></li>`).join("") : "<li>All packages up to date ✓</li>";
    const secH = security.length    ? security.map((s)    => `<li><span style="color:#ef4444"><b>${s.package}</b></span>: ${s.severity} — ${s.issue}</li>`).join("") : "<li>No vulnerabilities ✓</li>";
    const errH = errors.length      ? errors.slice(0, 15).map((e)  => `<li>${e.file}:${e.line} <code>[${e.ruleId}]</code> ${e.message}</li>`).join("") : "<li>No errors ✓</li>";
    const wrnH = warnings.length    ? warnings.slice(0, 15).map((w) => `<li>${w.file}:${w.line} <code>[${w.ruleId}]</code> ${w.message}</li>`).join("") : "<li>No warnings ✓</li>";
    const missingEnv = envAudit.missingVars?.length ? envAudit.missingVars.map((v) => `<li style="color:#f59e0b">${v}</li>`).join("") : "<li>All required env vars set ✓</li>";

    const scoreColor = systemHealth.healthScore >= 80 ? "#10b981" : systemHealth.healthScore >= 50 ? "#f59e0b" : "#ef4444";

    await sendMail(
      adminEmail,
      `[StayOS] System Audit — ${new Date().toLocaleDateString("en-IN")} · Health: ${systemHealth.healthScore}/100`,
      `<div style="font-family:sans-serif;max-width:700px;margin:0 auto">
        <div style="background:#0f172a;padding:20px 24px;border-radius:8px 8px 0 0">
          <h2 style="color:#fff;margin:0 0 4px">StayOS Enterprise — System Audit Report</h2>
          <p style="color:#94a3b8;margin:0;font-size:13px">Generated: ${new Date().toLocaleString("en-IN")} · Triggered by: ${triggeredBy}</p>
        </div>
        <div style="background:#f8fafc;padding:16px 24px;border:1px solid #e2e8f0;border-top:none">
          <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px">
            <div style="flex:1;min-width:100px;text-align:center;padding:12px;background:#fff;border-radius:8px;border:1px solid #e2e8f0">
              <div style="font-size:32px;font-weight:700;color:${scoreColor}">${systemHealth.healthScore}</div>
              <div style="font-size:11px;color:#64748b">Health Score /100</div>
            </div>
            <div style="flex:1;min-width:100px;text-align:center;padding:12px;background:#fff;border-radius:8px;border:1px solid #e2e8f0">
              <div style="font-size:24px;font-weight:700;color:${systemHealth.memUsagePct > 80 ? "#ef4444" : "#10b981"}">${systemHealth.memUsagePct}%</div>
              <div style="font-size:11px;color:#64748b">Memory Usage</div>
            </div>
            <div style="flex:1;min-width:100px;text-align:center;padding:12px;background:#fff;border-radius:8px;border:1px solid #e2e8f0">
              <div style="font-size:24px;font-weight:700;color:${systemHealth.cpuUsage > 80 ? "#ef4444" : "#10b981"}">${systemHealth.cpuUsage}%</div>
              <div style="font-size:11px;color:#64748b">CPU Usage</div>
            </div>
            <div style="flex:1;min-width:100px;text-align:center;padding:12px;background:#fff;border-radius:8px;border:1px solid #e2e8f0">
              <div style="font-size:24px;font-weight:700;color:${dependencies.length > 0 ? "#f59e0b" : "#10b981"}">${dependencies.length}</div>
              <div style="font-size:11px;color:#64748b">Outdated Pkgs</div>
            </div>
          </div>
          <p style="font-size:12px;color:#64748b">Node: ${systemHealth.nodeVersion} · npm: ${systemHealth.npmVersion} · Uptime: ${systemHealth.uptimeHuman} · Host: ${systemHealth.hostname}</p>
          <p style="font-size:12px;color:#334155"><b>Full audit PDF is attached.</b> Login to the admin panel to review and take action.</p>
          <h3 style="color:#f59e0b;font-size:13px">📦 Outdated Packages (${dependencies.length})</h3><ul style="font-size:12px">${depH}</ul>
          <h3 style="color:#ef4444;font-size:13px">🔒 Security CVEs (${security.length})</h3><ul style="font-size:12px">${secH}</ul>
          <h3 style="color:#ef4444;font-size:13px">✖ Errors (${errors.length})</h3><ul style="font-size:12px">${errH}</ul>
          <h3 style="color:#f59e0b;font-size:13px">⚠ Warnings (${warnings.length})</h3><ul style="font-size:12px">${wrnH}</ul>
          <h3 style="color:#f59e0b;font-size:13px">🔑 Missing Env Vars</h3><ul style="font-size:12px">${missingEnv}</ul>
        </div>
      </div>`,
      pdfBuffer
    );
  });

  return report;
};

/* ═══════════════════════════════════════════════════════════════════════════════
   ROUTE HANDLERS
═══════════════════════════════════════════════════════════════════════════════ */

export const generateSystemReport = async (req, res) => {
  try {
    const report = await runFullAudit("manual");
    return res.status(200).send({ success: true, message: "System report generated", report });
  } catch (e) {
    console.error("[generateSystemReport]", e.message);
    return res.status(500).send({ success: false, message: "Error generating report", error: e.message });
  }
};

export const getLatestReport = async (req, res) => {
  try {
    const report = await SystemReport.findOne().sort({ createdAt: -1 });
    res.status(200).send({ success: true, report });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error fetching latest report", error: error.message });
  }
};

export const getAllReports = async (req, res) => {
  try {
    const reports = await SystemReport.find().sort({ createdAt: -1 }).limit(20);
    res.status(200).send({ success: true, reports });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error fetching all reports", error: error.message });
  }
};

export const downloadReport = async (req, res) => {
  try {
    const report = req.params.id === "latest"
      ? await SystemReport.findOne().sort({ createdAt: -1 })
      : await SystemReport.findById(req.params.id);
    if (!report) return res.status(404).send({ success: false, message: "Report not found" });
    const filename = `stayos-audit-${new Date(report.createdAt).toISOString().split("T")[0]}.json`;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(JSON.stringify(report, null, 2));
  } catch (error) {
    res.status(500).send({ success: false, message: "Error downloading report", error: error.message });
  }
};

export const downloadPDF = async (req, res) => {
  try {
    const report = req.params.id === "latest"
      ? await SystemReport.findOne().sort({ createdAt: -1 })
      : await SystemReport.findById(req.params.id);
    if (!report) return res.status(404).send({ success: false, message: "Report not found" });
    const pdfBuffer = await generatePDFBuffer(report);
    const filename  = `stayos-audit-${new Date(report.createdAt).toISOString().split("T")[0]}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).send({ success: false, message: "Error generating PDF", error: error.message });
  }
};

export const getLiveHealth = async (req, res) => {
  try {
    const health = await collectSystemHealth();
    const env    = await collectEnvAudit();
    res.status(200).send({ success: true, health, env, timestamp: new Date() });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error fetching live health", error: error.message });
  }
};

export const getFileContent = async (req, res) => {
  try {
    const { file, line } = req.query;
    if (!file) return res.status(400).send({ success: false, message: "file param required" });
    const absPath = resolveFilePath(file);
    if (!absPath) return res.status(400).send({ success: false, message: "Invalid or unsafe file path" });
    if (!fs.existsSync(absPath)) return res.status(404).send({ success: false, message: "File not found" });
    const content   = fs.readFileSync(absPath, "utf8");
    const allLines  = content.split("\n");
    const targetLine = parseInt(line, 10) || 1;
    const CONTEXT = 8;
    const start = Math.max(0, targetLine - CONTEXT - 1);
    const end   = Math.min(allLines.length, targetLine + CONTEXT);
    const lines = allLines.slice(start, end).map((text, i) => ({
      lineNumber: start + i + 1,
      text,
      isTarget: (start + i + 1) === targetLine,
    }));
    res.status(200).send({ success: true, filePath: file, totalLines: allLines.length, targetLine, lines });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error reading file", error: error.message });
  }
};

export const approvePackage = async (req, res) => {
  try {
    const { packageName, currentVersion, latestVersion } = req.body;
    if (!packageName) return res.status(400).send({ success: false, message: "packageName is required" });
    const key = generateKey();
    await PendingKey.updateMany({ packageName, type: "package-update", used: false }, { used: true });
    const pending = await PendingKey.create({ key, type: "package-update", packageName, currentVersion, latestVersion });
    const adminEmail = await getAdminEmail();
    if (adminEmail) {
      sendMail(adminEmail,
        `[StayOS] Security Key — Authorize update: ${packageName}`,
        `<div style="font-family:sans-serif;max-width:500px">
          <h2>🔑 Package Update Authorization</h2>
          <p>Admin requested update of <b>${packageName}</b>:</p>
          <p><b>${currentVersion}</b> → <b style="color:#10b981">${latestVersion}</b></p>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;text-align:center;margin:20px 0">
            <div style="font-size:48px;letter-spacing:12px;font-family:monospace;color:#1f6feb;font-weight:700">${key}</div>
          </div>
          <p style="color:#ef4444;font-size:13px">⚠ Expires in 30 minutes · Single-use only</p>
        </div>`
      );
    }
    res.status(200).send({ success: true, message: "Security key sent to admin email", keyId: pending._id });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error initiating approval", error: error.message });
  }
};

export const verifyAndUpdate = async (req, res) => {
  try {
    const { keyId, key } = req.body;
    const pending = await PendingKey.findById(keyId);
    if (!pending)                       return res.status(404).send({ success: false, message: "Key not found" });
    if (pending.used)                   return res.status(400).send({ success: false, message: "Key already used" });
    if (new Date() > pending.expiresAt) return res.status(400).send({ success: false, message: "Key expired" });
    if (pending.key !== key)            return res.status(400).send({ success: false, message: "Invalid key" });
    pending.used = true;
    await pending.save();
    const record = await UpdateHistory.create({
      actionType:  "package-update",
      packageName: pending.packageName,
      fromVersion: pending.currentVersion,
      toVersion:   pending.latestVersion,
      securityKey: key,
      authorizedBy: req.user?.name || "admin",
      status: "success",
    });
    const adminEmail = await getAdminEmail();
    if (adminEmail) {
      sendMail(adminEmail,
        `[StayOS] ✅ Update Authorized — ${pending.packageName}`,
        `<h2>✅ Package Update Authorized</h2>
         <p><b>Package:</b> ${pending.packageName} · <b>Version:</b> ${pending.currentVersion} → ${pending.latestVersion}</p>
         <p><b>Time:</b> ${new Date().toLocaleString("en-IN")} · Key: <code>${key}</code> (invalidated)</p>`
      );
    }
    res.status(200).send({ success: true, message: "Package update authorized", record });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error verifying key", error: error.message });
  }
};

export const approveFix = async (req, res) => {
  try {
    const { fixType, targetFile, issueCount } = req.body;
    if (!fixType) return res.status(400).send({ success: false, message: "fixType required" });
    const targetArg  = targetFile && targetFile !== "all" ? `"${targetFile}"` : ".";
    const fixCommand = `npx --no eslint ${targetArg} --fix --max-warnings=9999`;
    const key = generateKey();
    await PendingKey.updateMany({ type: "issue-fix", fixType, targetFile, used: false }, { used: true });
    const pending = await PendingKey.create({ key, type: "issue-fix", fixType, targetFile: targetFile || "all", fixCommand, issueCount: issueCount || 0 });
    const adminEmail = await getAdminEmail();
    if (adminEmail) {
      sendMail(adminEmail,
        `[StayOS] Security Key — Authorize fix: ${fixType}s`,
        `<h2>🔧 Issue Fix Authorization</h2>
         <p>Admin requested ESLint auto-fix for <b>${issueCount || "multiple"} ${fixType}(s)</b> in <b>${targetFile || "all files"}</b>.</p>
         <p><b>Command:</b> <code>${fixCommand}</code></p>
         <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;text-align:center;margin:20px 0">
           <div style="font-size:48px;letter-spacing:12px;font-family:monospace;color:#d29922;font-weight:700">${key}</div>
         </div>
         <p style="color:#ef4444;font-size:13px">⚠ Expires in 30 min · Single-use · This will modify source files.</p>`
      );
    }
    res.status(200).send({ success: true, message: "Fix authorization key sent", keyId: pending._id });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error initiating fix approval", error: error.message });
  }
};

export const verifyAndFix = async (req, res) => {
  try {
    const { keyId, key } = req.body;
    const pending = await PendingKey.findById(keyId);
    if (!pending)                       return res.status(404).send({ success: false, message: "Key not found" });
    if (pending.used)                   return res.status(400).send({ success: false, message: "Key already used" });
    if (new Date() > pending.expiresAt) return res.status(400).send({ success: false, message: "Key expired" });
    if (pending.key !== key)            return res.status(400).send({ success: false, message: "Invalid key" });
    pending.used = true;
    await pending.save();
    let fixOutput = "";
    let fixStatus = "success";
    try {
      const result = await runCommand(pending.fixCommand, process.cwd(), 60000);
      fixOutput = (result.stdout || result.stderr || "").slice(0, 1000);
    } catch (err) {
      fixOutput = err.message;
      fixStatus = "partial";
    }
    const record = await UpdateHistory.create({
      actionType:  "issue-fix",
      fixType:     pending.fixType,
      targetFile:  pending.targetFile,
      issuesFixed: pending.issueCount,
      fixCommand:  pending.fixCommand,
      fixOutput:   fixOutput,
      securityKey: key,
      authorizedBy: req.user?.name || "admin",
      status: fixStatus,
    });
    const adminEmail = await getAdminEmail();
    if (adminEmail) {
      sendMail(adminEmail,
        `[StayOS] ✅ Fix Applied — ${pending.fixType}s in ${pending.targetFile}`,
        `<h2>✅ Issue Fix Applied</h2>
         <p><b>Type:</b> ${pending.fixType} · <b>Target:</b> ${pending.targetFile} · <b>Issues:</b> ${pending.issueCount}</p>
         <p><b>Command:</b> <code>${pending.fixCommand}</code></p>
         ${fixOutput ? `<pre style="background:#f4f4f4;padding:10px;font-size:12px">${fixOutput.slice(0, 500)}</pre>` : ""}`
      );
    }
    res.status(200).send({ success: true, message: "Fix applied", record, fixOutput });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error applying fix", error: error.message });
  }
};

export const getUpdateHistory = async (req, res) => {
  try {
    const updates = await UpdateHistory.find().sort({ createdAt: -1 }).limit(50);
    res.status(200).send({ success: true, updates });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error fetching update history", error: error.message });
  }
};

export const getSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) settings = await SystemSettings.create({ intervalDays: 15 });
    res.status(200).send({ success: true, settings });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error fetching settings", error: error.message });
  }
};

export const saveSettings = async (req, res) => {
  try {
    const {
      intervalDays, adminEmail, timezone, requiredEnvVars,
      // Health score thresholds — all optional, fall back to schema defaults
      cpuWarningPct, cpuCriticalPct,
      ramWarningPct, ramCriticalPct,
      diskWarningPct, diskCriticalPct,
      dbDownPenalty,
      healthyMinScore, warningMinScore,
    } = req.body;

    if (!intervalDays || intervalDays < 1)
      return res.status(400).send({ success: false, message: "intervalDays must be >= 1" });

    const cronExpression = `0 2 */${intervalDays} * *`;

    const updateData = {
      intervalDays,
      adminEmail:     adminEmail || "",
      cronExpression,
      ...(timezone        && { timezone }),
      ...(requiredEnvVars && { requiredEnvVars }),
      // Threshold fields — only update if provided (undefined = keep existing)
      ...(cpuWarningPct   != null && { cpuWarningPct:   Number(cpuWarningPct)   }),
      ...(cpuCriticalPct  != null && { cpuCriticalPct:  Number(cpuCriticalPct)  }),
      ...(ramWarningPct   != null && { ramWarningPct:   Number(ramWarningPct)   }),
      ...(ramCriticalPct  != null && { ramCriticalPct:  Number(ramCriticalPct)  }),
      ...(diskWarningPct  != null && { diskWarningPct:  Number(diskWarningPct)  }),
      ...(diskCriticalPct != null && { diskCriticalPct: Number(diskCriticalPct) }),
      ...(dbDownPenalty   != null && { dbDownPenalty:   Number(dbDownPenalty)   }),
      ...(healthyMinScore != null && { healthyMinScore: Number(healthyMinScore) }),
      ...(warningMinScore != null && { warningMinScore: Number(warningMinScore) }),
    };

    const settings = await SystemSettings.findOneAndUpdate({}, updateData, { upsert: true, new: true });
    try { restartCron(settings.cronExpression, settings.timezone || "Asia/Kolkata"); } catch {}
    res.status(200).send({ success: true, message: "Settings saved and cron restarted", settings });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error saving settings", error: error.message });
  }
};

export const runNow = async (req, res) => {
  // Respond immediately, run in background
  res.status(200).send({ success: true, message: "Audit started — check back in a few seconds." });
  try {
    await runFullAudit("manual");
  } catch (err) {
    console.error("[RunNow] Error:", err.message);
  }
};

export const runInTen = async (req, res) => {
  try {
    const runAt = new Date(Date.now() + 10 * 60 * 1000);
    setTimeout(async () => {
      console.error("[RunIn10] Running one-shot audit");
      try { await runFullAudit("schedule"); } catch (e) { console.error("[RunIn10] Error:", e.message); }
    }, 10 * 60 * 1000);
    res.status(200).send({ success: true, message: `Audit scheduled`, scheduledAt: runAt });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error scheduling run", error: error.message });
  }
};