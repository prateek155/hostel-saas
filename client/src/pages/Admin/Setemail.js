import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Menu, X } from "lucide-react";
import AdminMenu from "../../components/Layout/AdminMenu";
import Header from "../../components/Layout/Header";
import { useAuth } from "../../context/auth";

const Setemail = () => {
  const [auth] = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("adminTheme") || "default"
  );

  const [owners, setOwners] = useState([]);
  const [ownerId, setOwnerId] = useState("");
  const [email, setEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [connectedOwners, setConnectedOwners] = useState([]);

  /* ================= THEME CONFIG ================= */
  const themes = {
    default: {
      name: "Thames Brand Co.",
      primary: "#3b82f6",
      background: "#0f172a",
      surface: "#1e293b",
      surfaceLight: "#334155",
      text: "#e2e8f0",
      textSecondary: "#94a3b8",
      border: "#334155",
    },
    ocean: {
      name: "Ocean Theme",
      primary: "#06b6d4",
      background: "#0c1e24",
      surface: "#164e63",
      surfaceLight: "#155e75",
      text: "#e0f2fe",
      textSecondary: "#67e8f9",
      border: "#0e7490",
    },
    sunset: {
      name: "Sunset Theme",
      primary: "#f59e0b",
      background: "#1a0f0a",
      surface: "#451a03",
      surfaceLight: "#78350f",
      text: "#fef3c7",
      textSecondary: "#fcd34d",
      border: "#92400e",
    },
    forest: {
      name: "Forest Theme",
      primary: "#10b981",
      background: "#0a1612",
      surface: "#064e3b",
      surfaceLight: "#065f46",
      text: "#d1fae5",
      textSecondary: "#6ee7b7",
      border: "#047857",
    },
    purple: {
      name: "Purple Dream",
      primary: "#8b5cf6",
      background: "#1a0f2e",
      surface: "#2e1065",
      surfaceLight: "#4c1d95",
      text: "#f3e8ff",
      textSecondary: "#c4b5fd",
      border: "#6d28d9",
    },
  };

  const theme = themes[currentTheme];

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  useEffect(() => {
    localStorage.setItem("adminTheme", currentTheme);
  }, [currentTheme]);

  /* ================= GET OWNERS ================= */
  const getOwners = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        "http://localhost:8083/api/v1/admin/get-all-owners",
        { headers: { Authorization: `Bearer ${auth?.token}` } }
      );
      if (data.success) {
        const list = data.users || data.owners || [];
        setOwners(list);
        setConnectedOwners(list.filter((o) => o.emailConnected));
      } else {
        setOwners([]);
      }
    } catch (error) {
      toast.error("Failed to load owners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOwners();
  }, []);

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!ownerId || !email || !appPassword) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      setSubmitting(true);
      const { data } = await axios.post(
        "http://localhost:8083/api/v1/admin/connect-email",
        { ownerId, email, appPassword },
        { headers: { Authorization: `Bearer ${auth?.token}` } }
      );
      if (data.success) {
        toast.success(data.message || "Email connected successfully!");
        setEmail("");
        setAppPassword("");
        setOwnerId("");
        getOwners();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= DERIVED STATS ================= */
  const totalOwners = owners.length;
  const emailConnected = connectedOwners.length;
  const notConnected = totalOwners - emailConnected;

  const selectedOwner = owners.find((o) => o._id === ownerId);

  /* ================= STYLES ================= */
  const styles = {

    
    container: {
      display: "flex",
      minHeight: "100vh",
      backgroundColor: theme.background,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: "relative",
    },
    sidebarWrapper: {
      flexShrink: 0,
      position: "fixed",
      left: 0,
      top: 0,
      height: "100vh",
      zIndex: 1000,
      transition: "transform 0.3s ease",
    },
    mainWrapper: {
      flex: 1,
      marginLeft: sidebarOpen ? "280px" : "70px",
      transition: "margin-left 0.3s ease",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
    },
    pageContent: {
      padding: "2rem",
      flex: 1,
    },
    dashboardContainer: {
      maxWidth: "1000px",
      margin: "0 auto",
    },
    /* ---- page heading ---- */
    pageHeading: {
      marginBottom: "2rem",
    },
    pageTitle: {
      color: theme.text,
      fontSize: "1.75rem",
      fontWeight: 800,
      margin: "0 0 0.375rem 0",
      letterSpacing: "-0.02em",
    },
    pageSub: {
      color: theme.textSecondary,
      fontSize: "0.9375rem",
      margin: 0,
    },
    /* ---- stat cards ---- */
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
      gap: "1.5rem",
      marginBottom: "2rem",
    },
    statCard: {
      background: theme.surface,
      border: `1px solid ${theme.border}`,
      borderRadius: "16px",
      padding: "1.5rem",
      display: "flex",
      alignItems: "center",
      gap: "1.25rem",
      transition: "all 0.3s ease",
      cursor: "default",
    },
    statIcon: {
      width: "56px",
      height: "56px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    statInfo: { flex: 1 },
    statLabel: {
      color: theme.textSecondary,
      fontSize: "0.875rem",
      fontWeight: 500,
      marginBottom: "0.25rem",
    },
    statValue: {
      color: theme.text,
      fontSize: "2rem",
      fontWeight: 700,
      lineHeight: 1,
    },
    /* ---- main form card ---- */
    formCard: {
      background: theme.surface,
      border: `1px solid ${theme.border}`,
      borderRadius: "16px",
      padding: "2rem",
      marginBottom: "2rem",
    },
    cardHeader: { marginBottom: "2rem" },
    cardTitle: {
      color: theme.text,
      fontSize: "1.375rem",
      fontWeight: 700,
      margin: "0 0 0.375rem 0",
    },
    cardSubtitle: {
      color: theme.textSecondary,
      fontSize: "0.875rem",
      margin: 0,
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "1.5rem",
      marginBottom: "2rem",
    },
    formGroup: {
      display: "flex",
      flexDirection: "column",
    },
    formLabel: {
      color: theme.text,
      fontSize: "0.875rem",
      fontWeight: 600,
      marginBottom: "0.5rem",
      display: "flex",
      alignItems: "center",
      gap: "0.375rem",
    },
    formInput: {
      background: `${theme.background}99`,
      border: `1px solid ${theme.border}`,
      borderRadius: "10px",
      padding: "0.875rem 1rem",
      color: theme.text,
      fontSize: "0.9375rem",
      transition: "all 0.2s ease",
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
    },
    selectInput: {
      background: `${theme.background}99`,
      border: `1px solid ${theme.border}`,
      borderRadius: "10px",
      padding: "0.875rem 1rem",
      color: theme.text,
      fontSize: "0.9375rem",
      transition: "all 0.2s ease",
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
      cursor: "pointer",
      appearance: "none",
    },
    passwordWrapper: {
      position: "relative",
    },
    passwordToggle: {
      position: "absolute",
      right: "1rem",
      top: "50%",
      transform: "translateY(-50%)",
      background: "transparent",
      border: "none",
      cursor: "pointer",
      color: theme.textSecondary,
      display: "flex",
      alignItems: "center",
      padding: 0,
    },
    /* ---- owner preview pill ---- */
    ownerPreview: {
      marginTop: "1rem",
      background: `${theme.primary}12`,
      border: `1px solid ${theme.primary}33`,
      borderRadius: "10px",
      padding: "0.875rem 1rem",
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
    },
    ownerAvatar: {
      width: "36px",
      height: "36px",
      borderRadius: "8px",
      background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primary}99 100%)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontWeight: 700,
      fontSize: "0.875rem",
      flexShrink: 0,
    },
    ownerPreviewName: {
      color: theme.text,
      fontWeight: 600,
      fontSize: "0.9375rem",
    },
    ownerPreviewEmail: {
      color: theme.textSecondary,
      fontSize: "0.8125rem",
    },
    /* ---- submit row ---- */
    submitRow: {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      flexWrap: "wrap",
    },
    submitBtn: {
      background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primary}cc 100%)`,
      color: "white",
      border: "none",
      borderRadius: "10px",
      padding: "1rem 2rem",
      fontSize: "1rem",
      fontWeight: 600,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      transition: "all 0.3s ease",
      opacity: !ownerId || !email || !appPassword ? 0.5 : 1,
    },
    resetBtn: {
      background: "transparent",
      color: theme.textSecondary,
      border: `1px solid ${theme.border}`,
      borderRadius: "10px",
      padding: "1rem 1.5rem",
      fontSize: "0.9375rem",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    /* ---- info box ---- */
    infoBox: {
      background: `rgba(234,179,8,0.08)`,
      border: `1px solid rgba(234,179,8,0.25)`,
      borderRadius: "10px",
      padding: "1rem 1.25rem",
      display: "flex",
      gap: "0.75rem",
      marginTop: "1.5rem",
    },
    infoIcon: {
      color: "#eab308",
      flexShrink: 0,
      marginTop: "1px",
    },
    infoText: {
      color: "#fde68a",
      fontSize: "0.875rem",
      lineHeight: 1.6,
    },
    infoLink: {
      color: "#fbbf24",
      fontWeight: 600,
      textDecoration: "underline",
      cursor: "pointer",
    },
    /* ---- connected owners table ---- */
    tableCard: {
      background: theme.surface,
      border: `1px solid ${theme.border}`,
      borderRadius: "16px",
      overflow: "hidden",
    },
    tableCardHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "1.75rem 2rem",
      borderBottom: `1px solid ${theme.border}`,
    },
    tableWrapper: { overflowX: "auto" },
    modernTable: {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: 0,
    },
    tableHead: { background: `${theme.background}99` },
    tableHeaderCell: {
      color: theme.textSecondary,
      fontSize: "0.75rem",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      padding: "1.25rem 1.5rem",
      textAlign: "left",
      borderBottom: `1px solid ${theme.border}`,
      whiteSpace: "nowrap",
    },
    tableCell: {
      color: theme.text,
      fontSize: "0.9375rem",
      padding: "1.125rem 1.5rem",
      borderBottom: `1px solid ${theme.border}22`,
    },
    idBadge: {
      display: "inline-block",
      background: `${theme.primary}1A`,
      color: theme.primary,
      padding: "0.375rem 0.75rem",
      borderRadius: "6px",
      fontWeight: 600,
      fontSize: "0.8125rem",
      fontFamily: "Monaco, monospace",
    },
    userCell: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
    },
    avatar: {
      width: "38px",
      height: "38px",
      borderRadius: "9px",
      background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primary}aa 100%)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontWeight: 700,
      fontSize: "0.9375rem",
      flexShrink: 0,
      overflow: "hidden",
    },
    statusBadge: (connected) => ({
      display: "inline-flex",
      alignItems: "center",
      gap: "0.375rem",
      background: connected ? "rgba(34,197,94,0.12)" : "rgba(100,116,139,0.15)",
      color: connected ? "#22c55e" : "#94a3b8",
      padding: "0.375rem 0.875rem",
      borderRadius: "6px",
      fontSize: "0.8125rem",
      fontWeight: 600,
    }),
    emptyState: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "4rem 2rem",
      textAlign: "center",
    },
    emptyStateTitle: {
      color: theme.text,
      fontSize: "1.125rem",
      fontWeight: 600,
      margin: "1rem 0 0.375rem 0",
    },
    emptyStateText: {
      color: theme.textSecondary,
      fontSize: "0.9375rem",
      margin: 0,
    },
    loadingSpinner: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "3rem 2rem",
      color: theme.textSecondary,
      gap: "1rem",
    },
    spinner: {
      width: "40px",
      height: "40px",
      border: `3px solid ${theme.primary}1A`,
      borderTopColor: theme.primary,
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    },
    mobileMenuToggle: {
      position: "fixed",
      bottom: "24px",
      right: "24px",
      zIndex: 1003,
      background: "rgba(255,255,255,0.95)",
      border: "2px solid #e2e8f0",
      borderRadius: "50px",
      padding: "14px 18px",
      cursor: "pointer",
      boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
      color: "#374151",
      fontWeight: 600,
      fontSize: "14px",
      display: "none",
      alignItems: "center",
      gap: "8px",
      transition: "all 0.2s ease",
      minWidth: "90px",
    },
    mobileOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.6)",
      zIndex: 999,
      backdropFilter: "blur(2px)",
      display: isMobileMenuOpen ? "block" : "none",
    },
  };

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        .se-stat-card:hover {
          background: ${theme.surfaceLight} !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .se-form-input:focus {
          background: ${theme.background}CC !important;
          border-color: ${theme.primary} !important;
          box-shadow: 0 0 0 3px ${theme.primary}1A !important;
        }
        .se-form-input::placeholder { color: #64748b; }
        .se-select:focus {
          border-color: ${theme.primary} !important;
          box-shadow: 0 0 0 3px ${theme.primary}1A !important;
        }
        .se-select option {
          background: ${theme.surface};
          color: ${theme.text};
        }
        .se-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px ${theme.primary}55;
        }
        .se-submit-btn:active:not(:disabled) { transform: translateY(0); }
        .se-reset-btn:hover {
          border-color: ${theme.primary}66 !important;
          color: ${theme.text} !important;
        }
        .se-table-row:hover { background: ${theme.primary}0D !important; }
        .se-password-toggle:hover { color: ${theme.text} !important; }

        @media (max-width: 1024px) {
          .se-mobile-toggle { display: flex !important; }
          .se-sidebar { transform: ${isMobileMenuOpen ? "translateX(0)" : "translateX(-100%)"} !important; }
          .se-main { margin-left: 0 !important; }
        }
        @media (min-width: 1025px) {
          .se-mobile-toggle { display: none !important; }
          .se-sidebar { transform: translateX(0) !important; }
        }
        @media (max-width: 768px) {
          .se-page-content { padding: 1.25rem !important; }
          .se-stats-grid { grid-template-columns: 1fr !important; }
          .se-form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={styles.container}>
        {/* Mobile toggle */}
        <button
          className="se-mobile-toggle"
          style={styles.mobileMenuToggle}
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {isMobileMenuOpen ? "Close" : "Menu"}
          </span>
        </button>

        {/* Overlay */}
        <div style={styles.mobileOverlay} onClick={() => setIsMobileMenuOpen(false)} />

        {/* Sidebar */}
        <div className="se-sidebar" style={styles.sidebarWrapper}>
          <AdminMenu currentTheme={currentTheme} sidebarOpen={sidebarOpen} />
        </div>

        {/* Main */}
        <div className="se-main" style={styles.mainWrapper}>
          <Header
            currentTheme={currentTheme}
            setCurrentTheme={setCurrentTheme}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />

          <div className="se-page-content" style={styles.pageContent}>
            <div style={styles.dashboardContainer}>
              <ToastContainer position="top-left" autoClose={3000} theme="dark" />

              {/* Page heading */}
              <div style={styles.pageHeading}>
                <h1 style={styles.pageTitle}>Email Configuration</h1>
                <p style={styles.pageSub}>Connect Gmail accounts to hostel owners via App Password</p>
              </div>

              {/* Stats */}
              <div className="se-stats-grid" style={styles.statsGrid}>
                {/* Total owners */}
                <div className="se-stat-card" style={styles.statCard}>
                  <div style={{ ...styles.statIcon, background: `${theme.primary}1A`, color: theme.primary }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div style={styles.statInfo}>
                    <div style={styles.statLabel}>Total Owners</div>
                    <div style={styles.statValue}>{totalOwners}</div>
                  </div>
                </div>

                {/* Connected */}
                <div className="se-stat-card" style={styles.statCard}>
                  <div style={{ ...styles.statIcon, background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.59a16 16 0 0 0 5.5 5.5l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div style={styles.statInfo}>
                    <div style={styles.statLabel}>Email Connected</div>
                    <div style={styles.statValue}>{emailConnected}</div>
                  </div>
                </div>

                {/* Not connected */}
                <div className="se-stat-card" style={styles.statCard}>
                  <div style={{ ...styles.statIcon, background: "rgba(234,179,8,0.1)", color: "#eab308" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div style={styles.statInfo}>
                    <div style={styles.statLabel}>Pending Setup</div>
                    <div style={styles.statValue}>{notConnected}</div>
                  </div>
                </div>
              </div>

              {/* Form Card */}
              <div style={styles.formCard}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>Connect Hostel Owner Email</h3>
                  <p style={styles.cardSubtitle}>Select an owner and link their Gmail with an App Password</p>
                </div>

                <div className="se-form-grid" style={styles.formGrid}>
                  {/* Owner dropdown */}
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Select Hostel Owner
                    </label>
                    <div style={{ position: "relative" }}>
                      <select
                        className="se-select se-form-input"
                        style={styles.selectInput}
                        value={ownerId}
                        onChange={(e) => setOwnerId(e.target.value)}
                      >
                        <option value="">— Choose an owner —</option>
                        {owners.length > 0 ? (
                          owners.map((o) => (
                            <option key={o._id} value={o._id}>
                              {o.name} ({o.email})
                            </option>
                          ))
                        ) : (
                          <option disabled>No owners found</option>
                        )}
                      </select>
                      {/* Custom chevron */}
                      <div style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: theme.textSecondary }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>

                    {/* Owner preview */}
                    {selectedOwner && (
                      <div style={styles.ownerPreview}>
                        <div style={styles.ownerAvatar}>
                          <img
                            src={`http://localhost:8083/api/v1/admin/owner-photo/${selectedOwner._id}`}
                            alt={selectedOwner.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }}
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                          {selectedOwner.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={styles.ownerPreviewName}>{selectedOwner.name}</div>
                          <div style={styles.ownerPreviewEmail}>{selectedOwner.hostel?.name || "No hostel created"}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Email input */}
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Hostel Gmail Address
                    </label>
                    <input
                      type="email"
                      className="se-form-input"
                      style={styles.formInput}
                      placeholder="hostel@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {/* App password */}
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Gmail App Password
                    </label>
                    <div style={styles.passwordWrapper}>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="se-form-input"
                        style={{ ...styles.formInput, paddingRight: "3rem" }}
                        placeholder="xxxx xxxx xxxx xxxx"
                        value={appPassword}
                        onChange={(e) => setAppPassword(e.target.value)}
                      />
                      <button
                        className="se-password-toggle"
                        style={styles.passwordToggle}
                        onClick={() => setShowPassword(!showPassword)}
                        type="button"
                      >
                        {showPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info box */}
                <div style={styles.infoBox}>
                  <span style={styles.infoIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <p style={styles.infoText}>
                    Use a Gmail <strong style={{ color: "#fbbf24" }}>App Password</strong>, not your regular login password.
                    Enable 2-Step Verification, then generate an app password at{" "}
                    <a
                      href="https://myaccount.google.com/apppasswords"
                      target="_blank"
                      rel="noreferrer"
                      style={styles.infoLink}
                    >
                      myaccount.google.com/apppasswords
                    </a>
                    . Paste the 16-character code above (spaces are fine).
                  </p>
                </div>

                {/* Buttons */}
                <div style={{ ...styles.submitRow, marginTop: "1.75rem" }}>
                  <button
                    className="se-submit-btn"
                    style={styles.submitBtn}
                    onClick={handleSubmit}
                    disabled={!ownerId || !email || !appPassword || submitting}
                  >
                    {submitting ? (
                      <>
                        <div style={{ width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M1 4h22M1 8h22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <polyline points="9,11 12,14 22,4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Connect Email
                      </>
                    )}
                  </button>
                  <button
                    className="se-reset-btn"
                    style={styles.resetBtn}
                    onClick={() => { setOwnerId(""); setEmail(""); setAppPassword(""); }}
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Owners Table */}
              <div style={styles.tableCard}>
                <div style={styles.tableCardHeader}>
                  <div>
                    <h3 style={styles.cardTitle}>Owner Email Status</h3>
                    <p style={styles.cardSubtitle}>View connection status for all hostel owners</p>
                  </div>
                </div>

                {loading ? (
                  <div style={styles.loadingSpinner}>
                    <div style={styles.spinner} />
                    <p>Loading owners…</p>
                  </div>
                ) : owners.length === 0 ? (
                  <div style={styles.emptyState}>
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" style={{ color: "#475569", opacity: 0.5 }}>
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <h4 style={styles.emptyStateTitle}>No owners found</h4>
                    <p style={styles.emptyStateText}>Create owner accounts first to configure emails</p>
                  </div>
                ) : (
                  <div style={styles.tableWrapper}>
                    <table style={styles.modernTable}>
                      <thead style={styles.tableHead}>
                        <tr>
                          <th style={styles.tableHeaderCell}>#</th>
                          <th style={styles.tableHeaderCell}>Owner</th>
                          <th style={styles.tableHeaderCell}>Account Email</th>
                          <th style={styles.tableHeaderCell}>Hostel</th>
                          <th style={styles.tableHeaderCell}>Email Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {owners.map((owner, index) => (
                          <tr key={owner._id} className="se-table-row" style={{ background: "transparent", transition: "all 0.2s ease" }}>
                            <td style={styles.tableCell}>
                              <span style={styles.idBadge}>{String(index + 1).padStart(3, "0")}</span>
                            </td>
                            <td style={styles.tableCell}>
                              <div style={styles.userCell}>
                                <div style={styles.avatar}>
                                  <img
                                    src={`http://localhost:8083/api/v1/admin/owner-photo/${owner._id}`}
                                    alt={owner.name}
                                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "9px" }}
                                    onError={(e) => { e.target.style.display = "none"; }}
                                  />
                                  {owner.name.charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontWeight: 600, color: theme.text }}>{owner.name}</span>
                              </div>
                            </td>
                            <td style={{ ...styles.tableCell, color: theme.textSecondary }}>{owner.email}</td>
                            <td style={{ ...styles.tableCell, color: theme.textSecondary }}>
                              {owner.hostel?.name || <span style={{ color: "#64748b", fontStyle: "italic" }}>Not created</span>}
                            </td>
                            <td style={styles.tableCell}>
                              <span style={styles.statusBadge(owner.emailConnected)}>
                                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                                {owner.emailConnected ? "Connected" : "Not Connected"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Setemail;