import SystemReport from "../models/systemReportModel.js";
import { runCommand } from "../utils/commandRunner.js";
import path from "path";

export const generateSystemReport = async (req, res) => {
  try {
    let dependencies = [];

    // ✅ Correct Paths
    const backendPath = process.cwd();
    const clientPath = path.join(process.cwd(), "client");

    const paths = [
      { name: "backend", path: backendPath },
      { name: "client", path: clientPath },
    ];

    // ===========================
    // 📦 DEPENDENCY SCAN
    // ===========================
    for (let p of paths) {
      try {
        console.log("Checking:", p.name, p.path);

        const result = await runCommand("npm outdated --json", p.path);

        console.log("RAW RESULT:", result);

        if (!result || result.trim() === "") continue;

        let data;
        try {
          data = JSON.parse(result);
        } catch (parseErr) {
          console.log("JSON parse failed for", p.name);
          continue;
        }

        const formatted = Object.keys(data).map((pkg) => {
          const current = data[pkg].current;
          const latest = data[pkg].latest;

          let type = "patch";

          if (!current || current === "MISSING") {
            type = "missing";
          } else if (current.split(".")[0] !== latest.split(".")[0]) {
            type = "major";
          } else if (current.split(".")[1] !== latest.split(".")[1]) {
            type = "minor";
          }

          return {
            name: pkg,
            current,
            latest,
            type,
            source: p.name,
          };
        });

        dependencies.push(...formatted);
      } catch (err) {
        console.log("Error scanning:", p.name, err.message);
      }
    }

    // ===========================
    // 🔐 SECURITY SCAN
    // ===========================
    let security = [];

    try {
      const auditResult = await runCommand("npm audit --json", backendPath);

      if (auditResult && auditResult.trim() !== "") {
        let auditData;

        try {
          auditData = JSON.parse(auditResult);
        } catch {
          auditData = null;
        }

        if (auditData && auditData.vulnerabilities) {
          const vulns = auditData.vulnerabilities;

          security = Object.keys(vulns).map((pkg) => ({
            package: pkg,
            severity: vulns[pkg].severity,
            issue: vulns[pkg].title || "Security issue",
          }));
        }
      }
    } catch (err) {
      console.log("Security scan error:", err.message);
    }

    // ===========================
    // ❌ ERRORS (TEMP)
    // ===========================
    const errors = [
      {
        message: "Sample error",
        file: "server.js",
        count: 1,
      },
    ];

    // ===========================
    // ⚠️ WARNINGS (TEMP)
    // ===========================
    const warnings = [
      {
        message: "Deprecated API usage",
        file: "App.js",
        source: "React",
      },
    ];

    // ===========================
    // 💾 SAVE REPORT
    // ===========================
    const report = await SystemReport.create({
      dependencies,
      security,
      errors,
      warnings,
    });

    console.log("Report Saved:", report._id);

    res.status(200).send({
      success: true,
      message: "System report generated",
      report,
    });
  } catch (error) {
    console.log("MAIN ERROR:", error.message);

    res.status(500).send({
      success: false,
      message: "Error generating report",
      error: error.message,
    });
  }
};

// ===========================
// ✅ GET LATEST REPORT
// ===========================
export const getLatestReport = async (req, res) => {
  try {
    const report = await SystemReport.findOne().sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      report,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching latest report",
      error: error.message,
    });
  }
};

// ===========================
// ✅ GET ALL REPORTS
// ===========================
export const getAllReports = async (req, res) => {
  try {
    const reports = await SystemReport.find()
      .sort({ createdAt: -1 })
      .limit(20); // ✅ prevent overload

    res.status(200).send({
      success: true,
      reports,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching reports",
      error: error.message,
    });
  }
};