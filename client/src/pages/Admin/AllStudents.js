import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Search, Users, Filter, Menu, X } from 'lucide-react';
import AdminMenu from '../../components/Layout/AdminMenu';
import Header from '../../components/Layout/Header';

const AllStudents = () => {
  const [auth] = useAuth();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('adminTheme') || 'default';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  /* ================= GET ALL OWNERS ================= */
  const getAllOwners = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8083/api/v1/admin/get-all-owners",
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (res.data.success) {
        setOwners(res.data.owners);
      }
    } catch (error) {
      toast.error("Failed to load owners");
    }
  };

  /* ================= GET ALL STUDENTS ================= */
  const getAllStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:8083/api/v1/student/admin/all-students",
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (res.data.success) {
        setStudents(res.data.students);
        setFilteredStudents(res.data.students);
      }
    } catch (error) {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  /* ================= GET STUDENTS BY OWNER ================= */
  const getStudentsByOwner = async (ownerId) => {
    if (!ownerId) {
      getAllStudents();
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:8083/api/v1/student/admin/students/${ownerId}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (res.data.success) {
        setStudents(res.data.students);
        setFilteredStudents(res.data.students);
      }
    } catch (error) {
      toast.error("Failed to load owner students");
    } finally {
      setLoading(false);
    }
  };

  /* ================= HANDLE OWNER CHANGE ================= */
  const handleOwnerChange = (e) => {
    const ownerId = e.target.value;
    setSelectedOwner(ownerId);
    setSearchTerm("");
    getStudentsByOwner(ownerId);
  };

  /* ================= HANDLE SEARCH ================= */
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = students.filter(
      (student) =>
        student.name?.toLowerCase().includes(value) ||
        student.phone?.toLowerCase().includes(value) ||
        student.ownerId?.email?.toLowerCase().includes(value) ||
        student.ownerId?.name?.toLowerCase().includes(value)
    );

    setFilteredStudents(filtered);
  };

  useEffect(() => {
    getAllOwners();
    getAllStudents();
  }, []);

  return (
    <div>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .students-container {
          display: flex;
          min-height: 100vh;
          background-color: ${theme.background};
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          position: relative;
        }

        .sidebar-wrapper {
          flex-shrink: 0;
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          z-index: 1000;
          transition: transform 0.3s ease;
        }

        .main-wrapper {
          flex: 1;
          margin-left: ${sidebarOpen ? '280px' : '70px'};
          transition: margin-left 0.3s ease;
          min-height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
        }

        .content-area {
          padding: 30px;
          max-width: 100%;
          flex: 1;
        }

        .page-header {
          background-color: ${theme.surface};
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 24px;
          border: 1px solid ${theme.border};
        }

        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: ${theme.text};
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .page-subtitle {
          font-size: 14px;
          color: ${theme.textSecondary};
          margin: 0;
        }

        .title-icon {
          width: 48px;
          height: 48px;
          background-color: ${theme.primary};
          color: #fff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .student-count-badge {
          background-color: ${theme.primary}33;
          color: ${theme.primary};
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
        }

        .filters-card {
          background-color: ${theme.surface};
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 24px;
          border: 1px solid ${theme.border};
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .filter-label {
          font-size: 13px;
          font-weight: 600;
          color: ${theme.textSecondary};
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .search-wrapper {
          position: relative;
        }

        .search-input {
          width: 100%;
          padding: 12px 12px 12px 42px;
          border: 2px solid ${theme.border};
          border-radius: 10px;
          background-color: ${theme.surfaceLight};
          color: ${theme.text};
          font-size: 16px;
          outline: none;
          transition: all 0.2s;
        }

        .search-input:focus {
          border-color: ${theme.primary};
          background-color: ${theme.surface};
        }

        .search-input::placeholder {
          color: ${theme.textSecondary};
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: ${theme.textSecondary};
          pointer-events: none;
        }

        .filter-select {
          width: 100%;
          padding: 12px 14px;
          border: 2px solid ${theme.border};
          border-radius: 10px;
          background-color: ${theme.surfaceLight};
          color: ${theme.text};
          font-size: 16px;
          outline: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-select:focus {
          border-color: ${theme.primary};
          background-color: ${theme.surface};
        }

        .filter-select option {
          background-color: ${theme.surface};
          color: ${theme.text};
          padding: 10px;
        }

        .table-card {
          background-color: ${theme.surface};
          border-radius: 12px;
          border: 1px solid ${theme.border};
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .table-container {
          overflow-x: auto;
        }

        .table-container::-webkit-scrollbar {
          display: none;
        }

        .table-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .students-table {
          width: 100%;
          border-collapse: collapse;
        }

        .students-table thead {
          background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.surfaceLight} 100%);
        }

        .students-table thead th {
          padding: 16px 20px;
          text-align: left;
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .students-table tbody tr {
          border-bottom: 1px solid ${theme.border};
          transition: all 0.2s;
        }

        .students-table tbody tr:hover {
          background-color: ${theme.surfaceLight};
          transform: scale(1.005);
        }

        .students-table tbody tr:last-child {
          border-bottom: none;
        }

        .students-table tbody td {
          padding: 16px 20px;
          color: ${theme.text};
          font-size: 16px;
        }

        .student-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .student-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.surfaceLight} 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 700;
          font-size: 16px;
          flex-shrink: 0;
        }

        .student-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .student-name {
          font-weight: 600;
          color: ${theme.text};
          font-size: 16px;
        }

        .city-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          background-color: ${theme.primary}22;
          color: ${theme.primary};
          font-size: 12px;
          font-weight: 600;
        }

        .serial-number {
          font-weight: 700;
          color: ${theme.primary};
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          gap: 20px;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid ${theme.border};
          border-top-color: ${theme.primary};
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-text {
          color: ${theme.textSecondary};
          font-size: 16px;
          font-weight: 600;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          gap: 16px;
        }

        .empty-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background-color: ${theme.surfaceLight};
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${theme.textSecondary};
        }

        .empty-title {
          font-size: 18px;
          font-weight: 700;
          color: ${theme.text};
          margin: 0;
        }

        .empty-subtitle {
          font-size: 14px;
          color: ${theme.textSecondary};
          margin: 0;
        }

        .mobile-menu-toggle {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 1003;
          background: rgba(255, 255, 255, 0.95);
          border: 2px solid #e2e8f0;
          border-radius: 50px;
          padding: 14px 18px;
          cursor: pointer;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          color: #374151;
          font-weight: 600;
          font-size: 14px;
          display: none;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          min-width: 90px;
        }

        .mobile-menu-toggle:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .menu-text {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .mobile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          z-index: 999;
          backdrop-filter: blur(2px);
          display: ${isMobileMenuOpen ? 'block' : 'none'};
        }

        @media (max-width: 1024px) {
          .mobile-menu-toggle {
            display: flex !important;
          }
          
          .sidebar-wrapper {
            transform: ${isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)'};
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
          .content-area {
            padding: 20px;
          }

          .page-title {
            font-size: 22px;
            flex-direction: column;
            text-align: center;
          }

          .filters-grid {
            grid-template-columns: 1fr;
          }

          .table-container {
            overflow-x: scroll;
          }

          .students-table {
            min-width: 800px;
          }
        }

        @media (max-width: 480px) {
          .content-area {
            padding: 16px;
            padding-bottom: 100px;
          }

          .page-header {
            padding: 20px;
          }

          .filters-card {
            padding: 20px;
          }
        }
      `}</style>

      <div className="students-container">
        {/* Mobile Menu Toggle Button */}
        <button 
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          <span className="menu-text">
            {isMobileMenuOpen ? 'Close' : 'Menu'}
          </span>
        </button>

        {/* Mobile Overlay */}
        <div 
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Sidebar with AdminMenu */}
        <div className="sidebar-wrapper">
          <AdminMenu 
            currentTheme={currentTheme} 
            sidebarOpen={sidebarOpen}
          />
        </div>

        {/* Main Content */}
        <div className="main-wrapper">
          {/* Header */}
          <Header 
            currentTheme={currentTheme}
            setCurrentTheme={setCurrentTheme}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />

          {/* Page Content */}
          <div className="content-area">
            {/* Page Header */}
            <ToastContainer 
              position="top-left"
              autoClose={3000}
              theme="dark"
              />
            <div className="page-header">
              <div className="page-title">
                <div className="title-icon">
                  <Users size={28} />
                </div>
                <div>
                  <div>All Registered Students</div>
                  <div className="page-subtitle">
                    Manage and view all student registrations
                  </div>
                </div>
              </div>
              <div className="student-count-badge">
                <Users size={16} />
                Total Students: {filteredStudents.length}
              </div>
            </div>

            {/* Filters Card */}
            <div className="filters-card">
              <div className="filters-grid">
                {/* Search Input */}
                <div className="filter-group">
                  <label className="filter-label">
                    <Search size={14} />
                    Search Students
                  </label>
                  <div className="search-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search by name, phone, or email..."
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </div>
                </div>

                {/* Owner Filter */}
                <div className="filter-group">
                  <label className="filter-label">
                    <Filter size={14} />
                    Filter by Owner
                  </label>
                  <select
                    className="filter-select"
                    value={selectedOwner}
                    onChange={handleOwnerChange}
                  >
                    <option value="">All Owners</option>
                    {owners.map((owner) => (
                      <option key={owner._id} value={owner._id}>
                        {owner.name} ({owner.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Students Table */}
            <div className="table-card">
              {loading ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <div className="loading-text">Loading students...</div>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <Users size={40} />
                  </div>
                  <h3 className="empty-title">No students found</h3>
                  <p className="empty-subtitle">
                    Try adjusting your search or filters
                  </p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="students-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Student Name</th>
                        <th>Phone</th>
                        <th>Hostel Owner</th>
                        <th>Hostel Name</th>
                        <th>City</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student, index) => (
                        <tr key={student._id}>
                          <td>
                            <span className="serial-number">{index + 1}</span>
                          </td>
                          <td>
                            <div className="student-cell">
                              <div className="student-avatar">
                                {student.name?.charAt(0).toUpperCase()}
                              </div>
                              <div className="student-info">
                                <span className="student-name">
                                  {student.name}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>{student.phone}</td>
                          <td>{student.ownerId?.name || "-"}</td>
                          <td>{student.hostelId?.name || "-"}</td>
                          <td>
                            <span className="city-badge">
                              {student.hostelId?.city || "-"}
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
  );
};

export default AllStudents;