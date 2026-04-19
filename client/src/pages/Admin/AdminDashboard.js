import React, { useState, useEffect } from "react";
import { Building2, Mail, Menu, X } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import AdminMenu from "../../components/Layout/AdminMenu";
import Header from "../../components/Layout/Header";
import { useAuth } from "../../context/auth";
import { toast } from "react-toastify";
import axios from "axios";

/* ---------------- PIE COLORS ---------------- */
const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

const AdminDashboard = () => {
  const [auth] = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hostelTypeData, setHostelTypeData] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [hostelWiseData, setHostelWiseData] = useState([]);
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("adminTheme") || "default"
  );

  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    totalOwners: 0,
    totalHostels: 0,
    totalRevenue: 0,
    pendingAmount: 0,
  });

  const [statsLoading, setStatsLoading] = useState(false);

  /* ---------------- THEMES ---------------- */
  const themes = {
    default: {
      primary: "#3b82f6",
      background: "#0f172a",
      surface: "#1e293b",
      surfaceLight: "#334155",
      text: "#e2e8f0",
      textSecondary: "#94a3b8",
      border: "#334155",
    },
    ocean: {
      primary: "#06b6d4",
      background: "#0c1e24",
      surface: "#164e63",
      surfaceLight: "#155e75",
      text: "#e0f2fe",
      textSecondary: "#67e8f9",
      border: "#0e7490",
    },
    sunset: {
      primary: "#f59e0b",
      background: "#1a0f0a",
      surface: "#451a03",
      surfaceLight: "#78350f",
      text: "#fef3c7",
      textSecondary: "#fcd34d",
      border: "#92400e",
    },
    forest: {
      primary: "#10b981",
      background: "#0a1612",
      surface: "#064e3b",
      surfaceLight: "#065f46",
      text: "#d1fae5",
      textSecondary: "#6ee7b7",
      border: "#047857",
    },
    purple: {
      primary: "#8b5cf6",
      background: "#1a0f2e",
      surface: "#2e1065",
      surfaceLight: "#4c1d95",
      text: "#f3e8ff",
      textSecondary: "#c4b5fd",
      border: "#6d28d9",
    },
  };

  /* ✅ SAFE THEME ACCESS */
  const theme = themes[currentTheme] || themes.default;

  /* ---------------- API CALLS ---------------- */
  const getDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const res = await axios.get(
        "https://hostelwers.onrender.com/api/v1/admin/dashboard-stats",
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      if (res.data?.success) {
        setStats(res.data.stats);
      }
    } catch {
      toast.error("Failed to load dashboard stats");
    } finally {
      setStatsLoading(false);
    }
  };

  const getAllStudents = async () => {
    try {
      const res = await axios.get(
        "https://hostelwers.onrender.com/api/v1/student/admin/all-students",
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      if (res.data?.success) {
        setStudents(res.data.students);
      }
    } catch {
      toast.error("Failed to load students");
    }
  };

  const getHostelDistribution = async () => {
  try {
    const res = await axios.get(
      "https://hostelwers.onrender.com/api/v1/admin/hostel-distribution",
      {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      }
    );

    console.error("HOSTEL DISTRIBUTION API:", res.data); // 🔴 ADD THIS

    if (res.data?.success) {
      const formattedData = res.data.data.map(item => ({
  name: item._id,
  value: item.count
}));

setHostelTypeData(formattedData);

    }
  } catch (error) {
    toast.error("Failed to load hostel distribution");
  }
};

const getHostelWiseOccupancy = async (type = "") => {
  try {
    const res = await axios.get(
      `https://hostelwers.onrender.com/api/v1/admin/hostel-wise-occupancy?type=${type}`,
      {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      }
    );

    if (res.data?.success) {
      setHostelWiseData(res.data.data);
    }
  } catch {
    toast.error("Failed to load hostel occupancy");
  }
};



  useEffect(() => {
    localStorage.setItem("adminTheme", currentTheme);
  }, [currentTheme]);

  useEffect(() => {
  if (!auth?.token) return;
  getDashboardStats();
  getAllStudents();
  getHostelDistribution();
  getHostelWiseOccupancy(""); // load all types initially

}, [auth?.token]);

  useEffect(() => {
  if (!auth?.token) return;

  getHostelWiseOccupancy(selectedType);

}, [selectedType]);



  return (
    <div className="admin-dashboard-container">
      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X /> : <Menu />}
      </button>

      <div className="sidebar-wrapper">
        <AdminMenu sidebarOpen={sidebarOpen} currentTheme={currentTheme} />
      </div>

      <div className="main-wrapper">
        <Header
          currentTheme={currentTheme}
          setCurrentTheme={setCurrentTheme}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <div className="dashboard-content">
          {/* ---------- STATS ---------- */}
          <div className="stats-grid">
            <StatCard title="Total Owners" value={stats.totalOwners} icon={<Building2 />} />
            <StatCard title="Total Hostels" value={stats.totalHostels} icon={<Building2 />} />
            <StatCard title="Total Students" value={students.length} icon={<Mail />} />
            <StatCard title="Revenue" value={`₹ ${stats.totalRevenue}`} />
            <StatCard title="Pending" value={`₹ ${stats.pendingAmount}`} danger />
          </div>

          {/* ---------- CHARTS ROW ---------- */}
<div className="charts-row">

  {/* Hostel Chart */}
  <div className="chart-card">
    <h3 className="chart-title">Hostel Types Distribution</h3>

    {hostelTypeData.length === 0 ? (
      <p style={{ textAlign: "center", color: "#94a3b8" }}>
        No hostel data available
      </p>
    ) : (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={hostelTypeData}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={4}
          >
            {hostelTypeData.map((_, index) => (
              <Cell
                key={index}
                fill={PIE_COLORS[index % PIE_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    )}
  </div>

 <div className="chart-card">
  <h3 className="chart-title">Hostel Wise Occupancy</h3>

  {/* Dropdown */}
  <select
    value={selectedType}
    onChange={(e) => setSelectedType(e.target.value)}
    style={{
      padding: "8px 12px",
      marginBottom: "20px",
      borderRadius: "8px",
      background: theme.surfaceLight,
      color: theme.text,
      border: `1px solid ${theme.border}`,
    }}
  >
    <option value="">All Types</option>
    <option value="Boys Hostel">Boys Hostel</option>
    <option value="Girls Hostel">Girls Hostel</option>
    <option value="Co-ed Hostel">Co-ed Hostel</option>
    <option value="PG">PG</option>
  </select>

  {/* Table */}
  {hostelWiseData.length === 0 ? (
    <p style={{ textAlign: "center", color: "#94a3b8" }}>
      No hostels found
    </p>
  ) : (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: theme.surfaceLight }}>
          <th style={{ padding: "10px" }}>Hostel Name</th>
          <th>Total Beds</th>
          <th>Occupied</th>
          <th>Available</th>
          <th>Occupancy %</th>
        </tr>
      </thead>
      <tbody>
        {hostelWiseData.map((item, index) => (
          <tr key={index} style={{ textAlign: "center" }}>
            <td style={{ padding: "10px" }}>{item._id.name}</td>
            <td>{item.totalBeds}</td>
            <td>{item.occupiedBeds}</td>
            <td>{item.availableBeds}</td>
            <td
              style={{
                color:
                  item.occupancyPercentage > 85
                    ? "#ef4444"
                    : item.occupancyPercentage > 60
                    ? "#f59e0b"
                    : "#10b981",
                fontWeight: "bold",
              }}
            >
              {item.occupancyPercentage}%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>
</div>

        </div>
      </div>

      {/* ---------------- STYLES ---------------- */}
      <style>{`
        .admin-dashboard-container {
          display: flex;
          min-height: 100vh;
          background: ${theme.background};
          color: ${theme.text};
        }

        .sidebar-wrapper {
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          z-index: 1000;
        }

        .main-wrapper {
          flex: 1;
          margin-left: ${sidebarOpen ? "280px" : "70px"};
          transition: 0.3s;
        }

        .dashboard-content {
          padding: 30px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }

        .stat-card {
          background: ${theme.surface};
          border: 1px solid ${theme.border};
          padding: 20px;
          border-radius: 12px;
        }

        .chart-card {
          margin-top: 30px;
          background: ${theme.surface};
          border: 1px solid ${theme.border};
          padding: 24px;
          border-radius: 12px;
        }

        .chart-title {
          margin-bottom: 16px;
          font-size: 18px;
          font-weight: 600;
        }

        .mobile-menu-toggle {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1100;
          background: white;
          border-radius: 50%;
          padding: 12px;
          display: none;
        }

        /* ================= CHARTS ROW ================= */
         .charts-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin-top: 30px;
          }

          /* Mobile responsive */
          @media (max-width: 1024px) {
         .charts-row {
          grid-template-columns: 1fr;
           }
          }

        @media (max-width: 1024px) {
          .main-wrapper {
            margin-left: 0;
          }
          .mobile-menu-toggle {
            display: block;
          }
        }
      `}</style>
    </div>
  );
};

/* ---------------- STAT CARD ---------------- */
const StatCard = ({ title, value, icon, danger }) => (
  <div className="stat-card">
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span>{title}</span>
      {icon}
    </div>
    <h3 style={{ color: danger ? "#ef4444" : "#fff", marginTop: "8px" }}>
      {value}
    </h3>
  </div>
);

export default AdminDashboard;
