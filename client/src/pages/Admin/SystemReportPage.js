import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8083/api/v1/system";

const SystemReportPage = () => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  const fetchLatestReport = async () => {
    try {
      const res = await axios.get(`${API_BASE}/latest`);
      setReport(res.data.report);
    } catch (err) {
      console.log(err);
      setError("Failed to load latest report");
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/all`);
      setHistory(res.data.reports || []);
    } catch (err) {
      console.log(err);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API_BASE}/generate-report`);
      console.log("Generated Report:", res.data.report); // 🔥 DEBUG
      setReport(res.data.report);
      fetchHistory();
    } catch (err) {
      console.log(err);
      setError("Error generating report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestReport();
    fetchHistory();
  }, []);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1>System Health Reports</h1>
        <button
          style={loading ? styles.buttonDisabled : styles.button}
          onClick={generateReport}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Report"}
        </button>
      </div>

      {/* Error Message */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Report Section */}
      {report ? (
        <div style={styles.grid}>
          {/* Dependencies */}
          <div style={styles.card}>
            <h2>📦 Dependencies</h2>
            {report.dependencies && report.dependencies.length > 0 ? (
              report.dependencies.map((d, i) => (
                <p key={i}>
                  🔹 <b>{d.name}</b> ({d.source || "unknown"}) <br />
                  {d.current} → {d.latest}{" "}
                  <span
                    style={{
                      color:
                        d.type === "major"
                          ? "red"
                          : d.type === "minor"
                          ? "orange"
                          : "green",
                    }}
                  >
                    ({d.type})
                  </span>
                </p>
              ))
            ) : (
              <p style={{ color: "green" }}>✅ All packages are up to date</p>
            )}
          </div>

          {/* Security */}
          <div style={styles.card}>
            <h2>🔐 Security</h2>
            {report.security && report.security.length > 0 ? (
              report.security.map((s, i) => (
                <p key={i}>
                  🔸 {s.package} -{" "}
                  <span style={{ color: "red" }}>{s.severity}</span>
                </p>
              ))
            ) : (
              <p style={{ color: "green" }}>✅ No vulnerabilities</p>
            )}
          </div>

          {/* Errors */}
          <div style={styles.card}>
            <h2>❌ Errors</h2>
            {report.errors && report.errors.length > 0 ? (
              report.errors.map((e, i) => (
                <p key={i}>
                  🔻 {e.message} <br />
                  <small>{e.file}</small>
                </p>
              ))
            ) : (
              <p style={{ color: "green" }}>✅ No errors</p>
            )}
          </div>

          {/* Warnings */}
          <div style={styles.card}>
            <h2>⚠️ Warnings</h2>
            {report.warnings && report.warnings.length > 0 ? (
              report.warnings.map((w, i) => (
                <p key={i}>
                  ⚠️ {w.message} <br />
                  <small>{w.file}</small>
                </p>
              ))
            ) : (
              <p style={{ color: "green" }}>✅ No warnings</p>
            )}
          </div>
        </div>
      ) : (
        <p>No report found. Click "Generate Report".</p>
      )}

      {/* History */}
      <div style={styles.history}>
        <h2>📜 Previous Reports</h2>
        {history.length > 0 ? (
          history.map((r) => (
            <div key={r._id} style={styles.historyItem}>
              📅 {new Date(r.createdAt).toLocaleString()}
            </div>
          ))
        ) : (
          <p>No history found</p>
        )}
      </div>
    </div>
  );
};

export default SystemReportPage;

const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },

  button: {
    padding: "8px 16px",
    border: "none",
    background: "#007bff",
    color: "#fff",
    borderRadius: "6px",
    cursor: "pointer",
  },

  buttonDisabled: {
    padding: "8px 16px",
    border: "none",
    background: "gray",
    color: "#fff",
    borderRadius: "6px",
    cursor: "not-allowed",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
    marginBottom: "30px",
  },

  card: {
    padding: "15px",
    borderRadius: "10px",
    background: "#f5f5f5",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },

  history: {
    marginTop: "20px",
  },

  historyItem: {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    marginBottom: "8px",
    background: "#fafafa",
  },
};