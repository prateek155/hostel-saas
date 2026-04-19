import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Menu, X } from 'lucide-react';
import AdminMenu from '../../components/Layout/AdminMenu';
import Header from '../../components/Layout/Header';

const CreateOwner = () => {
  const [auth] = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTheme, setCurrentTheme] =  useState(() => { return localStorage.getItem('adminTheme') || 'default';});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    owneramount:"",
    photo: null,
  });

  const [owners, setOwners] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");

  // Theme configuration
  const themes = {
    default: {
      name: 'Thames Brand Co.',
      primary: '#3b82f6',
      background: '#0f172a',
      surface: '#1e293b',
      surfaceLight: '#334155',
      text: '#e2e8f0',
      textSecondary: '#94a3b8',
      border: '#334155'
    },
    ocean: {
      name: 'Ocean Theme',
      primary: '#06b6d4',
      background: '#0c1e24',
      surface: '#164e63',
      surfaceLight: '#155e75',
      text: '#e0f2fe',
      textSecondary: '#67e8f9',
      border: '#0e7490'
    },
    sunset: {
      name: 'Sunset Theme',
      primary: '#f59e0b',
      background: '#1a0f0a',
      surface: '#451a03',
      surfaceLight: '#78350f',
      text: '#fef3c7',
      textSecondary: '#fcd34d',
      border: '#92400e'
    },
    forest: {
      name: 'Forest Theme',
      primary: '#10b981',
      background: '#0a1612',
      surface: '#064e3b',
      surfaceLight: '#065f46',
      text: '#d1fae5',
      textSecondary: '#6ee7b7',
      border: '#047857'
    },
    purple: {
      name: 'Purple Dream',
      primary: '#8b5cf6',
      background: '#1a0f2e',
      surface: '#2e1065',
      surfaceLight: '#4c1d95',
      text: '#f3e8ff',
      textSecondary: '#c4b5fd',
      border: '#6d28d9'
    }
  };

  const theme = themes[currentTheme];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

   useEffect(() => {
    localStorage.setItem('adminTheme', currentTheme);
  }, [currentTheme]);
  
  /* ================= FORM HANDLING ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("phone", form.phone);
    formData.append("owneramount", form.owneramount);
    formData.append("password", form.password);
    if (form.photo) {
      formData.append("photo", form.photo);
    }

    const res = await axios.post(
      "https://hostelwers.onrender.com/api/v1/admin/create-owner",
      formData,
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }
    );

    if (res.data.success) {
      toast.success(res.data.message);
      setForm({ name: "", email: "", phone: "", password: "", owneramount: "", photo: null });
      getAllOwners();
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Something went wrong");
  }
};

  /* ================= GET ALL OWNERS ================= */
  const getAllOwners = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://hostelwers.onrender.com/api/v1/admin/get-all-owners",
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (res.data.success) {
        setOwners(res.data.owners);
        setFilteredOwners(res.data.owners);
      }
    } catch (error) {
      toast.error("Failed to load owners");
    } finally {
      setLoading(false);
    }
  };

  /* ================= 👤 TOGGLE OWNER STATUS ================= */
const deactivateOwner = async (ownerId) => {
  try {
    const res = await axios.put(
      `https://hostelwers.onrender.com/api/v1/admin/deactivate-owner/${ownerId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }
    );

    if (res.data.success) {
      toast.success("Owner disabled successfully");
      getAllOwners();
    }
  } catch (error) {
    toast.error("Failed to disable owner");
  }
};

const activateOwner = async (ownerId) => {
  try {
    const res = await axios.put(
      `https://hostelwers.onrender.com/api/v1/admin/activate-owner/${ownerId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }
    );

    if (res.data.success) {
      toast.success("Owner activated successfully");
      getAllOwners();
    }
  } catch (error) {
    toast.error("Failed to activate owner");
  }
};


  /* ================= 🚗 TOGGLE VEHICLE ACCESS ================= */
const toggleVehicleAccess = async (ownerId) => {
  try {
    const res = await axios.put(
      `https://hostelwers.onrender.com/api/v1/admin/toggle-vehicle-access/${ownerId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }
    );

    if (res.data.success) {
      toast.success(res.data.message);
      getAllOwners(); // refresh table
    }
  } catch (error) {
    toast.error("Failed to update parking access");
  }
};

  useEffect(() => {
    getAllOwners();
  }, []);

  /* ================= FILTER BY CITY ================= */
  const handleCityFilter = (city) => {
    setSelectedCity(city);
    if (city === "") {
      setFilteredOwners(owners);
    } else {
      const filtered = owners.filter(
        (owner) => owner.hostel?.city?.toLowerCase() === city.toLowerCase()
      );
      setFilteredOwners(filtered);
    }
  };

  // Get unique cities from owners
  const getUniqueCities = () => {
    const cities = owners
      .filter((owner) => owner.hostel?.city)
      .map((owner) => owner.hostel.city);
    return [...new Set(cities)];
  };

  /* ================= STATS CALCULATION ================= */
  const totalOwners = owners.length;
  const activeHostels = owners.filter((o) => o.hostel?.name).length;
  const pendingSetup = owners.filter((o) => !o.hostel?.name).length;

  /* ================= STYLES ================= */
  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: theme.background,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
    },
    sidebarWrapper: {
      flexShrink: 0,
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100vh',
      zIndex: 1000,
      transition: 'transform 0.3s ease',
    },
    mainWrapper: {
      flex: 1,
      marginLeft: sidebarOpen ? '280px' : '70px',
      transition: 'margin-left 0.3s ease',
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
    },
    ownerDashboard: {
      padding: '2rem',
      flex: 1,
    },
    dashboardContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    statCard: {
      background: theme.surface,
      backdropFilter: 'blur(10px)',
      border: `1px solid ${theme.border}`,
      borderRadius: '16px',
      padding: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1.25rem',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
    },
    statIcon: {
      width: '56px',
      height: '56px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    statIconBlue: {
      background: `${theme.primary}1A`,
      color: theme.primary,
    },
    statIconGreen: {
      background: 'rgba(34, 197, 94, 0.1)',
      color: '#22c55e',
    },
    statIconYellow: {
      background: 'rgba(234, 179, 8, 0.1)',
      color: '#eab308',
    },
    statInfo: {
      flex: 1,
    },
    statLabel: {
      color: theme.textSecondary,
      fontSize: '0.875rem',
      fontWeight: 500,
      marginBottom: '0.25rem',
    },
    statValue: {
      color: theme.text,
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1,
    },
    formCard: {
      background: theme.surface,
      backdropFilter: 'blur(10px)',
      border: `1px solid ${theme.border}`,
      borderRadius: '16px',
      padding: '2rem',
      marginBottom: '2rem',
    },
    cardHeader: {
      marginBottom: '2rem',
    },
    cardTitle: {
      color: theme.text,
      fontSize: '1.5rem',
      fontWeight: 700,
      margin: '0 0 0.5rem 0',
    },
    cardSubtitle: {
      color: theme.textSecondary,
      fontSize: '0.875rem',
      margin: 0,
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
    },
    formLabel: {
      color: theme.text,
      fontSize: '0.875rem',
      fontWeight: 600,
      marginBottom: '0.5rem',
    },
    formInput: {
      background: `${theme.background}99`,
      border: `1px solid ${theme.border}`,
      borderRadius: '10px',
      padding: '0.875rem 1rem',
      color: theme.text,
      fontSize: '0.9375rem',
      transition: 'all 0.2s ease',
      outline: 'none',
    },
    submitBtn: {
      background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primary}dd 100%)`,
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      padding: '1rem 2rem',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      width: '100%',
      maxWidth: '300px',
    },
    tableCard: {
      background: theme.surface,
      backdropFilter: 'blur(10px)',
      border: `1px solid ${theme.border}`,
      borderRadius: '16px',
      overflow: 'hidden',
      position: 'relative',
    },
    tableCardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '2rem',
      marginBottom: 0,
      borderBottom: `1px solid ${theme.border}`,
    },
    filterBtn: {
      background: `${theme.primary}1A`,
      color: theme.primary,
      border: `1px solid ${theme.primary}33`,
      borderRadius: '8px',
      padding: '0.625rem 1.25rem',
      fontSize: '0.875rem',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s ease',
    },
    filterDropdown: {
      position: 'absolute',
      top: '90px',
      right: '2rem',
      background: `${theme.background}F2`,
      backdropFilter: 'blur(10px)',
      border: `1px solid ${theme.border}`,
      borderRadius: '12px',
      padding: '0.5rem',
      zIndex: 1000,
      minWidth: '200px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
    },
    filterOption: {
      width: '100%',
      background: 'transparent',
      color: theme.text,
      border: 'none',
      borderRadius: '8px',
      padding: '0.75rem 1rem',
      fontSize: '0.875rem',
      fontWeight: 500,
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'all 0.2s ease',
      display: 'block',
    },
    filterOptionActive: {
      background: `${theme.primary}33`,
      color: theme.primary,
      fontWeight: 600,
    },
    activeFilter: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 2rem',
      background: `${theme.primary}1A`,
      borderBottom: `1px solid ${theme.border}`,
    },
    activeFilterText: {
      color: theme.primary,
      fontSize: '0.875rem',
      fontWeight: 600,
      flex: 1,
    },
    activeFilterBtn: {
      background: 'rgba(239, 68, 68, 0.1)',
      color: '#ef4444',
      border: 'none',
      borderRadius: '6px',
      padding: '0.375rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
    },
    tableWrapper: {
      overflowX: 'auto',
    },
    modernTable: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
    },
    tableHead: {
      background: `${theme.background}99`,
    },
    tableHeaderCell: {
      color: theme.textSecondary,
      fontSize: '0.75rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      padding: '1.25rem 1.5rem',
      textAlign: 'left',
      borderBottom: `1px solid ${theme.border}`,
    },
    tableRow: {
      background: 'transparent',
      transition: 'all 0.2s ease',
    },
    tableCell: {
      color: theme.text,
      fontSize: '0.9375rem',
      padding: '1.25rem 1.5rem',
      borderBottom: `1px solid ${theme.border}22`,
    },
    idBadge: {
      display: 'inline-block',
      background: `${theme.primary}1A`,
      color: theme.primary,
      padding: '0.375rem 0.75rem',
      borderRadius: '6px',
      fontWeight: 600,
      fontSize: '0.875rem',
      fontFamily: 'Monaco, monospace',
    },
    userCell: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.875rem',
    },
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primary}aa 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 700,
      fontSize: '1rem',
      flexShrink: 0,
    },
    userName: {
      fontWeight: 600,
      color: theme.text,
    },
    textSecondary: {
      color: theme.textSecondary,
    },
    textMuted: {
      color: '#64748b',
      fontStyle: 'italic',
    },
    hostelName: {
      color: theme.text,
      fontWeight: 500,
    },
    roleBadge: {
      display: 'inline-block',
      background: 'rgba(34, 197, 94, 0.1)',
      color: '#22c55e',
      padding: '0.375rem 0.875rem',
      borderRadius: '6px',
      fontSize: '0.8125rem',
      fontWeight: 600,
      textTransform: 'capitalize',
    },
    loadingState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      color: theme.textSecondary,
    },
    spinner: {
      width: '48px',
      height: '48px',
      border: `4px solid ${theme.primary}1A`,
      borderTopColor: theme.primary,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      marginBottom: '1rem',
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      textAlign: 'center',
    },
    emptyStateIcon: {
      color: '#475569',
      marginBottom: '1.5rem',
      opacity: 0.5,
    },
    emptyStateTitle: {
      color: theme.text,
      fontSize: '1.25rem',
      fontWeight: 600,
      margin: '0 0 0.5rem 0',
    },
    emptyStateText: {
      color: theme.textSecondary,
      fontSize: '0.9375rem',
      margin: 0,
    },
    mobileMenuToggle: {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 1003,
      background: 'rgba(255, 255, 255, 0.95)',
      border: '2px solid #e2e8f0',
      borderRadius: '50px',
      padding: '14px 18px',
      cursor: 'pointer',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
      color: '#374151',
      fontWeight: 600,
      fontSize: '14px',
      display: 'none',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s ease',
      minWidth: '90px',
    },
    menuText: {
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    mobileOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.6)',
      zIndex: 999,
      backdropFilter: 'blur(2px)',
      display: isMobileMenuOpen ? 'block' : 'none',
    },
  };

  /* ================= UI ================= */
  return (
    <>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .stat-card:hover {
            background: ${theme.surfaceLight} !important;
            border-color: ${theme.border}33 !important;
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          }
          .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px ${theme.primary}66;
          }
          .submit-btn:active {
            transform: translateY(0);
          }
          .filter-btn:hover {
            background: ${theme.primary}33 !important;
          }
          .filter-option:hover {
            background: ${theme.primary}1A !important;
            color: ${theme.primary} !important;
          }
          .active-filter-btn:hover {
            background: rgba(239, 68, 68, 0.2) !important;
          }
          .table-row:hover {
            background: ${theme.primary}0D !important;
          }
          .form-input:focus {
            background: ${theme.background}CC !important;
            border-color: ${theme.primary} !important;
            box-shadow: 0 0 0 3px ${theme.primary}1A !important;
          }
          .form-input::placeholder {
            color: #64748b;
          }
          
          @media (max-width: 1024px) {
            .mobile-menu-toggle {
              display: flex !important;
            }
            
            .sidebar-wrapper {
              transform: ${isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)'} !important;
            }
            
            .main-wrapper {
              margin-left: 0 !important;
            }
          }

          @media (min-width: 1025px) {
            .mobile-menu-toggle {
              display: none !important;
            }
            
            .sidebar-wrapper {
              transform: translateX(0) !important;
            }
          }

          @media (max-width: 768px) {
            .owner-dashboard {
              padding: 20px !important;
            }
            .stats-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 480px) {
            .owner-dashboard {
              padding: 16px !important;
              padding-bottom: 100px !important;
            }
          }
        `}
      </style>
      
      <div style={styles.container}>
        {/* Mobile Menu Toggle Button */}
        <button 
          className="mobile-menu-toggle"
          style={styles.mobileMenuToggle}
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          <span style={styles.menuText}>
            {isMobileMenuOpen ? 'Close' : 'Menu'}
          </span>
        </button>

        {/* Mobile Overlay */}
        <div 
          style={styles.mobileOverlay}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Sidebar with AdminMenu */}
        <div className="sidebar-wrapper" style={styles.sidebarWrapper}>
          <AdminMenu 
            currentTheme={currentTheme} 
            sidebarOpen={sidebarOpen}
          />
        </div>

        {/* Main Content */}
        <div className="main-wrapper" style={styles.mainWrapper}>
          {/* Header */}
          <Header 
            currentTheme={currentTheme}
            setCurrentTheme={setCurrentTheme}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />

          {/* Owner Dashboard Content */}
          <div className="owner-dashboard" style={styles.ownerDashboard}>
            <div style={styles.dashboardContainer}>
              <ToastContainer 
                position="top-left"
                autoClose={3000}
                theme="dark"
                />

              {/* Stats Cards */}
              <div style={styles.statsGrid}>
                <div className="stat-card" style={styles.statCard}>
                  <div style={{...styles.statIcon, ...styles.statIconBlue}}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div style={styles.statInfo}>
                    <div style={styles.statLabel}>Total Owners</div>
                    <div style={styles.statValue}>{totalOwners}</div>
                  </div>
                </div>

                <div className="stat-card" style={styles.statCard}>
                  <div style={{...styles.statIcon, ...styles.statIconGreen}}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9 22V12H15V22"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div style={styles.statInfo}>
                    <div style={styles.statLabel}>Active Hostels</div>
                    <div style={styles.statValue}>{activeHostels}</div>
                  </div>
                </div>

                <div className="stat-card" style={styles.statCard}>
                  <div style={{...styles.statIcon, ...styles.statIconYellow}}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 6V12L16 14"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div style={styles.statInfo}>
                    <div style={styles.statLabel}>Pending Setup</div>
                    <div style={styles.statValue}>{pendingSetup}</div>
                  </div>
                </div>
              </div>

              {/* Create Owner Form */}
              <div style={styles.formCard}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>Create Hostel Owner</h3>
                  <p style={styles.cardSubtitle}>Add new owner to the system</p>
                </div>

                <div>
                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                       <label style={styles.formLabel}>Owner Photo</label>
                       <input
                       type="file"
                       accept="image/*"
                       onChange={(e) =>
                       setForm({ ...form, photo: e.target.files[0] })
                          }
                       style={styles.formInput}
                        />
                    </div>

                    <div style={styles.formGroup}>
                      <label htmlFor="name" style={styles.formLabel}>Owner Name</label>
                      <input
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Enter full name"
                        style={styles.formInput}
                        className="form-input"
                        required
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label htmlFor="email" style={styles.formLabel}>Email Address</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="owner@example.com"
                        style={styles.formInput}
                        className="form-input"
                        required
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label htmlFor="phone" style={styles.formLabel}>Phone Number</label>
                      <input
                        id="phone"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        style={styles.formInput}
                        className="form-input"
                        required
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label htmlFor="owneramount" style={styles.formLabel}>Amount</label>
                      <input
                        id="owneramount"
                        name="owneramount"
                        value={form.owneramount}
                        onChange={handleChange}
                        placeholder="0000"
                        style={styles.formInput}
                        className="form-input"
                        required
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label htmlFor="password" style={styles.formLabel}>Password</label>
                      <input
                        id="password"
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Enter secure password"
                        style={styles.formInput}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <button onClick={handleSubmit} className="submit-btn" style={styles.submitBtn}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 5V19M5 12H19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Create Owner Account
                  </button>
                </div>
              </div>

              {/* Owners Table */}
              <div style={styles.tableCard}>
                <div style={styles.tableCardHeader}>
                  <div>
                    <h3 style={styles.cardTitle}>All Hostel Owners</h3>
                    <p style={styles.cardSubtitle}>Manage and monitor owner accounts</p>
                  </div>
                  <div>
                    <button
                      className="filter-btn"
                      style={styles.filterBtn}
                      onClick={() => setShowFilter(!showFilter)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Filter by City
                    </button>
                  </div>
                </div>

                {/* Filter Dropdown */}
                {showFilter && (
                  <div style={styles.filterDropdown}>
                    <button
                      className="filter-option"
                      style={{...styles.filterOption, ...(selectedCity === "" ? styles.filterOptionActive : {})}}
                      onClick={() => {
                        handleCityFilter("");
                        setShowFilter(false);
                      }}
                    >
                      All Cities
                    </button>
                    {getUniqueCities().map((city) => (
                      <button
                        key={city}
                        className="filter-option"
                        style={{...styles.filterOption, ...(selectedCity === city ? styles.filterOptionActive : {})}}
                        onClick={() => {
                          handleCityFilter(city);
                          setShowFilter(false);
                        }}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}

                {/* Active Filter Badge */}
                {selectedCity && (
                  <div style={styles.activeFilter}>
                    <span style={styles.activeFilterText}>Filtered by: {selectedCity}</span>
                    <button className="active-filter-btn" style={styles.activeFilterBtn} onClick={() => handleCityFilter("")}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M18 6L6 18M6 6L18 18"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                )}

                {loading ? (
                  <div style={styles.loadingState}>
                    <div style={styles.spinner}></div>
                    <p>Loading owners...</p>
                  </div>
                ) : filteredOwners.length === 0 ? (
                  <div style={styles.emptyState}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style={styles.emptyStateIcon}>
                      <path
                        d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <h4 style={styles.emptyStateTitle}>No owners found</h4>
                    <p style={styles.emptyStateText}>
                      {selectedCity
                        ? `No owners found in ${selectedCity}`
                        : "Create your first owner account to get started"}
                    </p>
                  </div>
                ) : (
                  <div style={styles.tableWrapper}>
                    <table style={styles.modernTable}>
                      <thead style={styles.tableHead}>
                        <tr>
                          <th style={styles.tableHeaderCell}>ID</th>
                          <th style={styles.tableHeaderCell}>Name</th>
                          <th style={styles.tableHeaderCell}>Email</th>
                          <th style={styles.tableHeaderCell}>Phone</th>
                          <th style={styles.tableHeaderCell}>Hostel Name</th>
                          <th style={styles.tableHeaderCell}>City</th>
                          <th style={styles.tableHeaderCell}>Pincode</th>
                          <th style={styles.tableHeaderCell}>Role</th>
                          <th style={styles.tableHeaderCell}>Parking</th> {/* 🚗 */}
                          <th style={styles.tableHeaderCell}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOwners.map((owner, index) => (
                          <tr key={owner._id} className="table-row" style={styles.tableRow}>
                            <td style={styles.tableCell}>
                              <span style={styles.idBadge}>
                                {String(index + 1).padStart(3, "0")}
                              </span>
                            </td>
                            <td style={styles.tableCell}>
                              <div style={styles.userCell}>
                                <div style={styles.avatar}>
                                  <img
                                  src={`https://hostelwers.onrender.com/api/v1/admin/owner-photo/${owner._id}`}
                                  alt={owner.name}
                                  style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  borderRadius: "10px",
                                   }}
                                   onError={(e) => {
                                    e.target.style.display = "none";
                                     }}
                                     />
                                    {!owner.photo && owner.name.charAt(0).toUpperCase()}
                                  </div>

                                <span style={styles.userName}>{owner.name}</span>
                              </div>
                            </td>
                            <td style={{...styles.tableCell, ...styles.textSecondary}}>{owner.email}</td>
                            <td style={{...styles.tableCell, ...styles.textSecondary}}>{owner.phone}</td>
                            <td style={styles.tableCell}>
                              {owner.hostel?.name ? (
                                <span style={styles.hostelName}>
                                  {owner.hostel.name}
                                </span>
                              ) : (
                                <span style={styles.textMuted}>Not Created</span>
                              )}
                            </td>
                            <td style={{...styles.tableCell, ...styles.textSecondary}}>
                              {owner.hostel?.city || "-"}
                            </td>
                            <td style={{...styles.tableCell, ...styles.textSecondary}}>
                              {owner.hostel?.pincode || "-"}
                            </td>
                            <td style={styles.tableCell}>
                              <span style={styles.roleBadge}>{owner.role}</span>
                            </td>
                            <td style={styles.tableCell}>
  <button
    onClick={() => toggleVehicleAccess(owner._id)}
    style={{
      padding: "6px 14px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "12px",
      background: owner.vehicleAccess
        ? "rgba(239,68,68,0.15)"
        : "rgba(34,197,94,0.15)",
      color: owner.vehicleAccess ? "#ef4444" : "#22c55e",
    }}
  >
    {owner.vehicleAccess ? "Disable" : "Enable"}
  </button>
</td>
<td style={styles.tableCell}>
  {owner.isActive ? (
    <button
      onClick={() => deactivateOwner(owner._id)}
      style={{
        padding: "6px 14px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "12px",
        background: "rgba(239,68,68,0.15)",
        color: "#ef4444",
      }}
    >
      Disable
    </button>
  ) : (
    <button
      onClick={() => activateOwner(owner._id)}
      style={{
        padding: "6px 14px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "12px",
        background: "rgba(34,197,94,0.15)",
        color: "#22c55e",
      }}
    >
      Enable
    </button>
  )}
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

export default CreateOwner;