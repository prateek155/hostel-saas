import path from "path";
import fs from "fs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import { SystemReport, PendingKey, UpdateHistory, SystemSettings } from "../models/systemReportModel.js";
import { runCommand } from "../utils/commandRunner.js";

/* ── Safe cron import — won't crash if systemCron.js isn't wired yet ── */
let restartCron = () => {};
let scheduleOneShot = () => {};

(async () => {
  try {
    const cronMod = await import("../jobs/systemCron.js");

    if (typeof cronMod.restartCron === "function") {
      restartCron = cronMod.restartCron;
    }

    if (typeof cronMod.scheduleOneShot === "function") {
      scheduleOneShot = cronMod.scheduleOneShot;
    }

  } catch (e) {
    console.log("[Cron] Could not load systemCron.js:", e.message);
  }
})();

/* ═══════════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════════ */
const getAdminEmail = async () => {
  try {
    const s = await SystemSettings.findOne();
    return s?.adminEmail || process.env.ADMIN_EMAIL || "";
  } catch { return process.env.ADMIN_EMAIL || ""; }
};

const sendMail = async (to, subject, html, pdfBuffer = null) => {
  if (!to || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.log("[Mail] Skipping — MAIL_USER/MAIL_PASS not set or no recipient");
    return;
  }
  try {
    const t = nodemailer.createTransport({
      host: process.env.MAIL_HOST || "smtp.gmail.com",
      port: Number(process.env.MAIL_PORT) || 587,
      secure: false,
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
    });
    await t.sendMail({ from: `"StayOS Security" <${process.env.MAIL_USER}>`, to, subject, html });
    console.log("[Mail] Sent to", to);
  } catch (err) {
    console.log("[Mail] Error:", err.message); // never let mail crash the main flow
  }
};

/* Safe 6-digit key — works on all Node versions */

/* PDF Report Generator */
const generatePDFBuffer = (report) => new Promise((resolve, reject) => {
  try {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    const now  = new Date(report.createdAt || Date.now()).toLocaleString("en-IN");
    const deps = report.dependencies || [];
    const sec  = report.security     || [];
    const errs = report.errors       || [];
    const wrns = report.warnings     || [];
    doc.rect(0, 0, doc.page.width, 70).fill("#0f172a");
    doc.fillColor("#ffffff").fontSize(20).font("Helvetica-Bold").text("StayOS System Audit Report", 40, 22);
    doc.fontSize(10).font("Helvetica").fillColor("#94a3b8").text("Generated: " + now, 40, 48);
    doc.moveDown(3);
    doc.fillColor("#000000").fontSize(11).font("Helvetica-Bold").text("SUMMARY", 40, doc.y);
    doc.moveDown(0.4);
    const sumY = doc.y;
    const boxes = [
      { label: "Outdated Packages", val: deps.length, color: deps.length ? "#f59e0b" : "#10b981" },
      { label: "Security Issues",   val: sec.length,  color: sec.length  ? "#ef4444" : "#10b981" },
      { label: "Code Errors",       val: errs.length, color: errs.length ? "#ef4444" : "#10b981" },
      { label: "Warnings",          val: wrns.length, color: wrns.length ? "#f59e0b" : "#10b981" },
    ];
    const bw = 118, gap = 8, startX = 40;
    boxes.forEach((b, i) => {
      const x = startX + i * (bw + gap);
      doc.rect(x, sumY, bw, 48).fillAndStroke("#f8fafc", "#e2e8f0");
      doc.fillColor(b.color).fontSize(22).font("Helvetica-Bold").text(String(b.val), x + 10, sumY + 6, { width: bw - 20, align: "center" });
      doc.fillColor("#64748b").fontSize(8).font("Helvetica").text(b.label, x + 5, sumY + 32, { width: bw - 10, align: "center" });
    });
    doc.y = sumY + 60;
    const section = (title, color, items, formatter) => {
      if (!items.length) return;
      doc.moveDown(0.5);
      if (doc.y > 700) doc.addPage();
      doc.fillColor(color).fontSize(12).font("Helvetica-Bold").text(title);
      doc.moveDown(0.3);
      items.slice(0, 30).forEach((item) => {
        if (doc.y > 720) doc.addPage();
        doc.fillColor("#334155").fontSize(9).font("Helvetica").text(formatter(item), { indent: 10, lineGap: 2 });
      });
    };
    section("Outdated Packages (" + deps.length + ")", "#f59e0b", deps, (d) => d.name + " (" + d.source + "): " + d.current + " -> " + d.latest + " [" + d.type + "]");
    section("Security Vulnerabilities (" + sec.length + ")", "#ef4444", sec, (s) => s.package + " - " + s.severity + ": " + s.issue);
    section("Code Errors (" + errs.length + ")", "#ef4444", errs, (e) => e.file + ":" + e.line + " [" + e.ruleId + "] " + e.message);
    section("Warnings (" + wrns.length + ")", "#d97706", wrns, (w) => w.file + ":" + w.line + " [" + w.ruleId + "] " + w.message);
    doc.moveDown(1);
    doc.fillColor("#94a3b8").fontSize(8).font("Helvetica").text("This report was automatically generated by StayOS. Login to admin panel to review.", { align: "center" });
    doc.end();
  } catch (err) { reject(err); }
});
const generateKey = () => {
  try {
    return String(crypto.randomInt(100000, 999999));
  } catch {
    return String(Math.floor(100000 + Math.random() * 900000));
  }
};

/* ─── File path resolver ─────────────────────────────────────────────
   Given a stored relative path like "backend/controllers/foo.js"
   return the absolute path on disk.                                   */
const resolveFilePath = (relPath) => {
  if (!relPath) return null;
  // Strip the label prefix (backend/ or client/) if present
  const withoutLabel = relPath.replace(/^(backend|client)\//, "");
  const abs = path.resolve(process.cwd(), withoutLabel);
  // Safety check — must be inside cwd
  if (!abs.startsWith(process.cwd())) return null;
  return abs;
};

/* ─── ESLint / regex scanner ─────────────────────────────────────────*/
const SCAN_EXTS = [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"];
const SKIP_DIRS = ["node_modules", ".git", "dist", "build", ".next", "coverage", ".cache"];

const WARN_PATTERNS = [
  { re: /console\.(log|warn|info|debug)\s*\(/, ruleId: "no-console",       msg: "console statement found",                       fixable: true  },
  { re: /TODO[:\s]/i,                          ruleId: "no-todo",           msg: "TODO comment found",                            fixable: false },
  { re: /FIXME[:\s]/i,                         ruleId: "no-fixme",          msg: "FIXME comment found",                           fixable: false },
  { re: /\bvar\s+\w/,                          ruleId: "no-var",            msg: "Use of 'var' — prefer const/let",               fixable: true  },
  { re: /[^=!<>]==(?!=)/,                      ruleId: "eqeqeq",            msg: "Use === instead of ==",                         fixable: true  },
  { re: /\beval\s*\(/,                         ruleId: "no-eval",           msg: "Use of eval() is a security risk",              fixable: false },
  { re: /\bdebugger\b/,                        ruleId: "no-debugger",       msg: "debugger statement found",                      fixable: true  },
  { re: /process\.env\.\w+(?!\s*[\|\&\?])/,   ruleId: "no-raw-env",        msg: "Unguarded process.env — add a fallback value",  fixable: false },
];

const ERROR_PATTERNS = [
  { re: /\bawait\b(?![^{]*\bcatch\b)(?![^{]*\btry\b)/,  ruleId: "no-unhandled-await",   msg: "await without surrounding try/catch",           fixable: false },
  { re: /throw\s+['"`][^'"`;]+['"`]/,                   ruleId: "no-string-throw",       msg: "Throwing a string instead of Error object",    fixable: false },
];

const runEslint = async (dirPath, label) => {
  const errors = []; const warnings = [];
  try {
    const raw = await runCommand(`npx --no eslint . --format json --max-warnings=9999`, dirPath, 45000);
    if (raw && raw.trim().startsWith("[")) {
      const results = JSON.parse(raw);
      for (const fr of results) {
        const relFile = path.relative(process.cwd(), fr.filePath).replace(/\\/g, "/");
        for (const msg of (fr.messages || [])) {
          const item = {
            ruleId: msg.ruleId || "unknown",
            message: msg.message,
            file: `${label}/${relFile}`,
            line: msg.line || 0,
            column: msg.column || 0,
            source: (msg.source || "").trim().slice(0, 300),
            fixable: !!(msg.fix || msg.suggestions?.length),
          };
          if (msg.severity === 2) errors.push(item);
          else warnings.push(item);
        }
      }
      console.log(`[ESLint] ${label}: ${errors.length} errors, ${warnings.length} warnings`);
      return { errors, warnings };
    }
  } catch (err) {
    console.log("[ESLint] Fallback to regex — reason:", err.message.slice(0, 80));
  }
  return regexScan(dirPath, label);
};

const regexScan = (dirPath, label) => {
  const errors = []; const warnings = [];
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
            warnings.push({ ruleId: p.ruleId, message: p.msg, file: relFile, line: lineNum, column: (lineText.search(p.re) || 0) + 1, source: lineText.trim().slice(0, 300), fixable: p.fixable });
          }
        }
        for (const p of ERROR_PATTERNS) {
          if (new RegExp(p.re.source).test(lineText)) {
            errors.push({ ruleId: p.ruleId, message: p.msg, file: relFile, line: lineNum, column: 1, source: lineText.trim().slice(0, 300), fixable: p.fixable });
          }
        }
      });
    }
  };
  walkDir(dirPath);
  return { errors, warnings };
};

/* ═══════════════════════════════════════════════════════════════════════
   1. GENERATE REPORT  POST /generate-report
   Each section is wrapped in its own try/catch so one failure never
   causes a 500 on the whole endpoint.
═══════════════════════════════════════════════════════════════════════ */
export const generateSystemReport = async (req, res) => {
  let dependencies = [], security = [], errors = [], warnings = [];

  /* ── Dependency scan ── */
  const backendPath = process.cwd();
  const clientPath = path.join(process.cwd(), "client");
  for (const p of [{ name: "backend", path: backendPath }, { name: "client", path: clientPath }]) {
    if (!fs.existsSync(p.path)) continue;
    try {
      const result = await runCommand("npm outdated --json", p.path, 30000);
      if (!result?.trim()) continue;
      let data;
      try { data = JSON.parse(result); } catch (e) { console.log("[Deps] Parse error", p.name, e.message); continue; }
      if (!data || typeof data !== "object" || Array.isArray(data)) continue;
      const formatted = Object.keys(data).map(pkg => {
        const cur = data[pkg].current || "unknown";
        const lat = data[pkg].latest || "unknown";
        let type = "patch";
        if (!data[pkg].current || data[pkg].current === "MISSING") type = "missing";
        else if (cur.split(".")[0] !== lat.split(".")[0]) type = "major";
        else if (cur.split(".")[1] !== lat.split(".")[1]) type = "minor";
        return { name: pkg, current: cur, latest: lat, type, source: p.name };
      });
      dependencies.push(...formatted);
    } catch (err) { console.log("[Deps] Scan error", p.name, err.message); }
  }

  /* ── Security scan ── */
  try {
    const raw = await runCommand("npm audit --json", backendPath, 30000);
    if (raw?.trim()) {
      let a;
      try { a = JSON.parse(raw); } catch { a = null; }
      if (a?.vulnerabilities) {
        security = Object.keys(a.vulnerabilities).map(pkg => ({
          package: pkg,
          severity: a.vulnerabilities[pkg].severity || "unknown",
          issue: a.vulnerabilities[pkg].title || "Security vulnerability",
        }));
      }
    }
  } catch (err) { console.log("[Security] Scan error:", err.message); }

  /* ── Code scan (ESLint / regex) ── */
  try {
    const bs = await runEslint(backendPath, "backend");
    errors.push(...bs.errors); warnings.push(...bs.warnings);
  } catch (err) { console.log("[Scan] Backend error:", err.message); }

  try {
    if (fs.existsSync(clientPath)) {
      const cs = await runEslint(clientPath, "client");
      errors.push(...cs.errors); warnings.push(...cs.warnings);
    }
  } catch (err) { console.log("[Scan] Client error:", err.message); }

  /* ── Deduplicate ── */
  const dedup = (arr) => {
    const seen = new Set();
    return arr.filter(item => {
      const k = `${item.file}:${item.line}:${item.ruleId}`;
      if (seen.has(k)) return false;
      seen.add(k); return true;
    });
  };
  errors = dedup(errors);
  warnings = dedup(warnings);

  /* ── Save ── */
  let report;
  try {
    report = await SystemReport.create({ dependencies, security, errors, warnings });
    console.log(`[Report] Saved ${report._id} — deps:${dependencies.length} sec:${security.length} err:${errors.length} warn:${warnings.length}`);
  } catch (dbErr) {
    console.log("[Report] DB save error:", dbErr.message);
    if (res?.status) return res.status(500).send({ success: false, message: "Database error saving report", error: dbErr.message });
    return;
  }

  /* ── Email (non-blocking) ── */
  getAdminEmail().then(async (adminEmail) => {
    if (!adminEmail) return;
    let pdfBuffer = null;
    try { pdfBuffer = await generatePDFBuffer(report); } catch (pe) { console.log("[Mail] PDF gen error:", pe.message); }
    const depH = dependencies.length ? dependencies.map(d => "<li><b>" + d.name + "</b>: " + d.current + " -> " + d.latest + "</li>").join("") : "<li>All up to date</li>";
    const secH = security.length ? security.map(s => "<li>" + s.package + " - " + s.severity + "</li>").join("") : "<li>No vulnerabilities</li>";
    const errH = errors.length ? errors.slice(0,20).map(e => "<li>" + e.file + ":" + e.line + " " + e.message + "</li>").join("") : "<li>No errors</li>";
    const wrnH = warnings.length ? warnings.slice(0,20).map(w => "<li>" + w.file + ":" + w.line + " " + w.message + "</li>").join("") : "<li>No warnings</li>";
    sendMail(adminEmail, "[StayOS] System Audit Report - " + new Date().toLocaleDateString("en-IN"), "<h2>StayOS System Audit Report</h2><p>Generated: " + new Date().toLocaleString("en-IN") + "</p><p>Full audit PDF is attached.</p><h3>Packages " + dependencies.length + " outdated</h3><ul>" + depH + "</ul><h3>Security " + security.length + " issues</h3><ul>" + secH + "</ul><h3>Errors " + errors.length + "</h3><ul>" + errH + "</ul><h3>Warnings " + warnings.length + "</h3><ul>" + wrnH + "</ul>", pdfBuffer);
  });

  if (res?.status) return res.status(200).send({ success: true, message: "System report generated", report });
};

/* ═══════════════════════════════════════════════════════════════════════
   2. GET LATEST REPORT  GET /latest
═══════════════════════════════════════════════════════════════════════ */
export const getLatestReport = async (req, res) => {
  try {
    const report = await SystemReport.findOne().sort({ createdAt: -1 });
    res.status(200).send({ success: true, report });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error fetching latest report", error: error.message });
  }
};

/* ═══════════════════════════════════════════════════════════════════════
   3. GET ALL REPORTS  GET /all
═══════════════════════════════════════════════════════════════════════ */
export const getAllReports = async (req, res) => {
  try {
    const reports = await SystemReport.find().sort({ createdAt: -1 }).limit(20);
    res.status(200).send({ success: true, reports });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error fetching all reports", error: error.message });
  }
};

/* ═══════════════════════════════════════════════════════════════════════
   4. DOWNLOAD REPORT JSON  GET /download/:id
═══════════════════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════════════════
   5. GET FILE CONTENT  GET /file-content?file=backend/server.js&line=42
   Returns the actual file content (with 5 lines of context around the
   target line) so the frontend can display the real code with
   the warning/error highlighted.
═══════════════════════════════════════════════════════════════════════ */
export const getFileContent = async (req, res) => {
  try {
    const { file, line } = req.query;
    if (!file) return res.status(400).send({ success: false, message: "file param required" });

    const absPath = resolveFilePath(file);
    if (!absPath) return res.status(400).send({ success: false, message: "Invalid or unsafe file path" });
    if (!fs.existsSync(absPath)) return res.status(404).send({ success: false, message: "File not found on disk" });

    const content = fs.readFileSync(absPath, "utf8");
    const allLines = content.split("\n");
    const targetLine = parseInt(line, 10) || 1;
    const CONTEXT = 8; // lines before and after
    const start = Math.max(0, targetLine - CONTEXT - 1);
    const end   = Math.min(allLines.length, targetLine + CONTEXT);
    const slice = allLines.slice(start, end).map((text, i) => ({
      lineNumber: start + i + 1,
      text,
      isTarget: (start + i + 1) === targetLine,
    }));

    res.status(200).send({
      success: true,
      filePath: file,
      absolutePath: absPath,
      totalLines: allLines.length,
      targetLine,
      lines: slice,
    });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error reading file", error: error.message });
  }
};

/* ═══════════════════════════════════════════════════════════════════════
   6. APPROVE PACKAGE UPDATE  POST /approve-package
═══════════════════════════════════════════════════════════════════════ */
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
        `[StayOS] Security Key — Authorize update for ${packageName}`,
        `<h2>🔑 Package Update Authorization</h2>
         <p>Admin requested update of <b>${packageName}</b>: <b>${currentVersion}</b> → <b>${latestVersion}</b></p>
         <h1 style="font-size:42px;letter-spacing:10px;font-family:monospace;color:#1f6feb">${key}</h1>
         <p>Enter this code in the admin portal. <b>Expires in 30 minutes. Single-use only.</b></p>`
      );
    }
    res.status(200).send({ success: true, message: "Security key sent to admin email", keyId: pending._id });
  } catch (error) {
    console.log("[ApprovePackage]", error.message);
    res.status(500).send({ success: false, message: "Error initiating approval", error: error.message });
  }
};

/* ═══════════════════════════════════════════════════════════════════════
   7. VERIFY KEY & APPLY PACKAGE UPDATE  POST /verify-key
═══════════════════════════════════════════════════════════════════════ */
export const verifyAndUpdate = async (req, res) => {
  try {
    const { keyId, key } = req.body;
    const pending = await PendingKey.findById(keyId);
    if (!pending)              return res.status(404).send({ success: false, message: "Key not found" });
    if (pending.used)          return res.status(400).send({ success: false, message: "Key already used" });
    if (new Date() > pending.expiresAt) return res.status(400).send({ success: false, message: "Key expired" });
    if (pending.key !== key)   return res.status(400).send({ success: false, message: "Invalid key" });
    pending.used = true;
    await pending.save();
    const record = await UpdateHistory.create({
      actionType: "package-update",
      packageName: pending.packageName,
      fromVersion: pending.currentVersion,
      toVersion: pending.latestVersion,
      securityKey: key,
      authorizedBy: req.user?.name || "admin",
      status: "success",
    });
    const adminEmail = await getAdminEmail();
    if (adminEmail) {
      sendMail(adminEmail,
        `[StayOS] Update Confirmed — ${pending.packageName}`,
        `<h2>✅ Package Update Authorized</h2>
         <p><b>Package:</b> ${pending.packageName} | <b>Version:</b> ${pending.currentVersion} → ${pending.latestVersion}</p>
         <p><b>Time:</b> ${new Date().toLocaleString("en-IN")} | <b>Key:</b> <code>${key}</code> (now invalidated)</p>`
      );
    }
    res.status(200).send({ success: true, message: "Package update authorized", record });
  } catch (error) {
    console.log("[VerifyKey]", error.message);
    res.status(500).send({ success: false, message: "Error verifying key", error: error.message });
  }
};

/* ═══════════════════════════════════════════════════════════════════════
   8. APPROVE FIX  POST /approve-fix
═══════════════════════════════════════════════════════════════════════ */
export const approveFix = async (req, res) => {
  try {
    const { fixType, targetFile, issueCount } = req.body;
    if (!fixType) return res.status(400).send({ success: false, message: "fixType required" });
    const targetArg = targetFile && targetFile !== "all" ? `"${targetFile}"` : ".";
    const fixCommand = `npx --no eslint ${targetArg} --fix --max-warnings=9999`;
    const key = generateKey();
    await PendingKey.updateMany({ type: "issue-fix", fixType, targetFile, used: false }, { used: true });
    const pending = await PendingKey.create({ key, type: "issue-fix", fixType, targetFile: targetFile || "all", fixCommand, issueCount: issueCount || 0 });
    const adminEmail = await getAdminEmail();
    if (adminEmail) {
      sendMail(adminEmail,
        `[StayOS] Security Key — Authorize auto-fix for ${fixType}s`,
        `<h2>🔧 Issue Fix Authorization</h2>
         <p>Admin requested ESLint auto-fix for <b>${issueCount || "multiple"} ${fixType}(s)</b> in <b>${targetFile || "all files"}</b>.</p>
         <p><b>Command:</b> <code>${fixCommand}</code></p>
         <h1 style="font-size:42px;letter-spacing:10px;font-family:monospace;color:#d29922">${key}</h1>
         <p><b>Expires in 30 minutes. Single-use. This will modify source files.</b></p>`
      );
    }
    res.status(200).send({ success: true, message: "Fix authorization key sent", keyId: pending._id });
  } catch (error) {
    console.log("[ApproveFix]", error.message);
    res.status(500).send({ success: false, message: "Error initiating fix approval", error: error.message });
  }
};

/* ═══════════════════════════════════════════════════════════════════════
   9. VERIFY FIX KEY & APPLY  POST /verify-fix
═══════════════════════════════════════════════════════════════════════ */
export const verifyAndFix = async (req, res) => {
  try {
    const { keyId, key } = req.body;
    const pending = await PendingKey.findById(keyId);
    if (!pending)              return res.status(404).send({ success: false, message: "Key not found" });
    if (pending.used)          return res.status(400).send({ success: false, message: "Key already used" });
    if (new Date() > pending.expiresAt) return res.status(400).send({ success: false, message: "Key expired" });
    if (pending.key !== key)   return res.status(400).send({ success: false, message: "Invalid key" });
    pending.used = true;
    await pending.save();
    let fixOutput = "";
    let fixStatus = "success";
    try {
      fixOutput = await runCommand(pending.fixCommand, process.cwd(), 60000);
      console.log("[Fix] Output:", fixOutput.slice(0, 300));
    } catch (err) { fixOutput = err.message; fixStatus = "partial"; }
    const record = await UpdateHistory.create({
      actionType: "issue-fix",
      fixType: pending.fixType,
      targetFile: pending.targetFile,
      issuesFixed: pending.issueCount,
      fixCommand: pending.fixCommand,
      fixOutput: fixOutput.slice(0, 1000),
      securityKey: key,
      authorizedBy: req.user?.name || "admin",
      status: fixStatus,
    });
    const adminEmail = await getAdminEmail();
    if (adminEmail) {
      sendMail(adminEmail,
        `[StayOS] Fix Confirmed — ${pending.fixType}s in ${pending.targetFile}`,
        `<h2>✅ Issue Fix Applied</h2>
         <p><b>Type:</b> ${pending.fixType} | <b>Target:</b> ${pending.targetFile} | <b>Issues:</b> ${pending.issueCount}</p>
         <p><b>Command:</b> <code>${pending.fixCommand}</code></p>
         <p><b>Key:</b> <code>${key}</code> (permanently invalidated)</p>
         ${fixOutput ? `<pre style="background:#f4f4f4;padding:10px">${fixOutput.slice(0, 500)}</pre>` : ""}`
      );
    }
    res.status(200).send({ success: true, message: "Fix applied", record, fixOutput });
  } catch (error) {
    console.log("[VerifyFix]", error.message);
    res.status(500).send({ success: false, message: "Error applying fix", error: error.message });
  }
};

/* ═══════════════════════════════════════════════════════════════════════
   10. GET UPDATE HISTORY  GET /update-history
═══════════════════════════════════════════════════════════════════════ */
export const getUpdateHistory = async (req, res) => {
  try {
    const updates = await UpdateHistory.find().sort({ createdAt: -1 }).limit(50);
    res.status(200).send({ success: true, updates });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error fetching update history", error: error.message });
  }
};

/* ═══════════════════════════════════════════════════════════════════════
   11. GET SETTINGS  GET /settings
═══════════════════════════════════════════════════════════════════════ */
export const getSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) settings = await SystemSettings.create({ intervalDays: 15 });
    res.status(200).send({ success: true, settings });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error fetching settings", error: error.message });
  }
};

/* ═══════════════════════════════════════════════════════════════════════
   12. SAVE SETTINGS & RESTART CRON  POST /settings
═══════════════════════════════════════════════════════════════════════ */
export const saveSettings = async (req, res) => {
  try {
    const { intervalDays, adminEmail } = req.body;
    if (!intervalDays || intervalDays < 1) return res.status(400).send({ success: false, message: "intervalDays must be >= 1" });
    const cronExpression = `0 2 */${intervalDays} * *`;
    const settings = await SystemSettings.findOneAndUpdate(
      {}, { intervalDays, adminEmail: adminEmail || "", cronExpression },
      { upsert: true, new: true }
    );
    try { restartCron(cronExpression); } catch {}
    res.status(200).send({ success: true, message: "Settings saved and cron restarted", settings });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error saving settings", error: error.message });
  }
};

/* ═══════════════════════════════════════════════════════════════════════
   13. RUN NOW  POST /run-now
   Triggers a full audit scan immediately (same as cron but on-demand).
═══════════════════════════════════════════════════════════════════════ */
export const runNow = async (req, res) => {
  // Respond immediately, run in background
  res.status(200).send({ success: true, message: "Audit started — check back in a few seconds." });
  try {
    await generateSystemReport({ user: req.user }, { status: () => ({ send: () => {} }) });
  } catch (err) {
    console.log("[RunNow] Error:", err.message);
  }
};

/* ═══════════════════════════════════════════════════════════════════════
   14. RUN IN 10 MINUTES  POST /run-in-10
   Schedules a single audit run 10 minutes from now without changing
   the recurring cron schedule.
═══════════════════════════════════════════════════════════════════════ */
export const runInTen = async (req, res) => {
  try {
    const runAt = new Date(Date.now() + 10 * 60 * 1000);
    setTimeout(async () => {
      console.log("[RunIn10] Running scheduled one-shot audit at", new Date().toLocaleString("en-IN"));
      try {
        await generateSystemReport({ user: { name: "scheduled-10min" } }, { status: () => ({ send: () => {} }) });
      } catch (e) { console.log("[RunIn10] Error:", e.message); }
    }, 10 * 60 * 1000);
    res.status(200).send({ success: true, message: `Audit scheduled for ${runAt.toLocaleTimeString("en-IN")}`, scheduledAt: runAt });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error scheduling run", error: error.message });
  }
};