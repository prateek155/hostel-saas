import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import StudentMenu from "../../components/Layout/StudentMenu";
import { useAuth } from "../../context/auth";
import "react-toastify/dist/ReactToastify.css";
import { Building2, X, Menu, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import axios from "axios";
import { useTheme } from "../../context/theme";

const Dashboard = () => {
  const [auth] = useAuth();
  const [showAttendance, setShowAttendance] = useState(false);
  const { studentColor } = useTheme();
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [weeklyAttendance, setWeeklyAttendance] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    total: 0,
    percentage: 0
  });

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const fetchMyAttendance = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:8083/api/v1/attandance/my-attendance",
        {
          headers: { Authorization: `Bearer ${auth.token}` },
          params: {
            date: selectedDate || undefined,
          },
        }
      );

      if (data.success) {
        setAttendance(data.attendance);
        calculateStats(data.attendance);
        if (!selectedDate) {
          generateWeeklyView(data.attendance);
        }
      }
    } catch (error) {
      console.error("Attendance fetch error", error);
    }
  };

  const getAnnouncements = async () => {
  try {
    const { data } = await axios.get(
      "http://localhost:8083/api/v1/announcement/all",
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }
    );

    if (data.success) {
      setAnnouncements(data.announcements);
    }
  } catch (error) {
    console.log("Announcement fetch error", error);
  }
};

  const calculateStats = (attendanceData) => {
    const present = attendanceData.filter(a => a.status === "present").length;
    const absent = attendanceData.filter(a => a.status === "absent").length;
    const total = attendanceData.length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

    setAttendanceStats({ present, absent, total, percentage });
  };

  const generateWeeklyView = (attendanceData) => {
    const today = new Date();
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dateString = date.toISOString().split('T')[0];
      const record = attendanceData.find(a => 
        new Date(a.date).toISOString().split('T')[0] === dateString
      );
      
      weekData.push({
        date: date,
        dateString: dateString,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        status: record ? record.status : null,
        isToday: dateString === today.toISOString().split('T')[0]
      });
    }
    
    setWeeklyAttendance(weekData);
  };

  const clearDateFilter = () => {
    setSelectedDate("");
  };

  useEffect(() => {
    if (showAttendance) {
      fetchMyAttendance();
    }
  }, [showAttendance, selectedDate]);

  useEffect(() => {
  if (auth?.token) {
    getAnnouncements();
  }
}, [auth?.token]);

  return (
    <Layout tile={"faculty-dashboard"}>
      <div className="faculty-dashboard">
        <div className="dashboard-container">
          {/* Menu Button - Only Visible on Mobile/Tablet */}
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            <span className="menu-text">
              {isMobileMenuOpen ? 'Close' : 'Menu'}
            </span>
          </button>

          {/* Sidebar Section with AdminMenu */}
          <div className={`sidebar-section ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <div className="sidebar-header">
              <div className="sidebar-title">
                <Building2 size={20} />
                <span>Student Panel</span>
              </div>
              <button 
                className="sidebar-close"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close navigation menu"
              >
                <X size={20} />
              </button>
            </div>
            <div className="sidebar-content">
              <StudentMenu />
            </div>
          </div>

          {/* Overlay */}
          {isMobileMenuOpen && (
            <div 
              className="mobile-overlay"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu overlay"
            />
          )}
          
          {/* Main Content */}
          <div className="main-content">
            <div className="section">

  {/* 🔔 ANNOUNCEMENTS SECTION */}
  <div className="card shadow-sm p-4 mb-4">
    <h4>📢 Hostel Announcements</h4>

    {announcements.length === 0 ? (
      <p>No announcements available</p>
    ) : (
      announcements.map((a) => (
        <div key={a._id} className="announcement-box mb-3 p-3 border rounded">
          <h5>{a.title}</h5>
          <p>{a.message}</p>
          <small>
            {new Date(a.createdAt).toLocaleString()}
          </small>
        </div>
      ))
    )}
  </div>

  {/* Attendance Button */}
  <button
    className="attendance-btn"
    onClick={() => setShowAttendance(true)}
  >
    <Calendar size={20} />
    View My Attendance
  </button>

</div>      
          </div>
        </div>
      </div>

      {/* ================= ATTENDANCE MODAL ================= */}
      {showAttendance && (
        <div className="modal-overlay">
          <div className="modal-content attendance-modal">
            <div className="modal-header">
              <div className="header-left">
                <Calendar size={24} />
                <h2>My Attendance</h2>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setShowAttendance(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Stats Cards */}
              <div className="stats-row">
                <div className="stat-box present-stat">
                  <CheckCircle size={20} />
                  <div className="stat-info">
                    <span className="stat-value">{attendanceStats.present}</span>
                    <span className="stat-label">Present</span>
                  </div>
                </div>
                <div className="stat-box absent-stat">
                  <XCircle size={20} />
                  <div className="stat-info">
                    <span className="stat-value">{attendanceStats.absent}</span>
                    <span className="stat-label">Absent</span>
                  </div>
                </div>
                <div className="stat-box total-stat">
                  <Clock size={20} />
                  <div className="stat-info">
                    <span className="stat-value">{attendanceStats.percentage}%</span>
                    <span className="stat-label">Attendance</span>
                  </div>
                </div>
              </div>

              {/* Date Filter */}
              <div className="filter-section">
                <div className="filter-header">
                  <h3>Filter by Date</h3>
                  {selectedDate && (
                    <button className="clear-filter-btn" onClick={clearDateFilter}>
                      <X size={16} />
                      Clear Filter
                    </button>
                  )}
                </div>
                <input
                  type="date"
                  className="date-input"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Weekly View - Only show when no date filter */}
              {!selectedDate && weeklyAttendance.length > 0 && (
                <div className="weekly-view">
                  <h3 className="section-title">This Week</h3>
                  <div className="week-grid">
                    {weeklyAttendance.map((day, index) => (
                      <div 
                        key={index} 
                        className={`week-day ${day.status} ${day.isToday ? 'today' : ''}`}
                      >
                        <span className="day-name">{day.dayName}</span>
                        <span className="day-number">{day.dayNumber}</span>
                        <div className="day-status">
                          {day.status === 'present' && <CheckCircle size={18} />}
                          {day.status === 'absent' && <XCircle size={18} />}
                          {!day.status && <span className="no-record">-</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attendance List */}
              <div className="attendance-list-section">
                <h3 className="section-title">
                  {selectedDate ? 'Attendance for Selected Date' : 'All Attendance Records'}
                </h3>
                {attendance.length === 0 ? (
                  <div className="no-attendance">
                    <Calendar size={48} />
                    <p>No attendance records found</p>
                    {selectedDate && <span>Try selecting a different date</span>}
                  </div>
                ) : (
                  <div className="attendance-list">
                    {attendance.map((a) => (
                      <div key={a._id} className={`attendance-item ${a.status}`}>
                        <div className="attendance-date">
                          <Calendar size={18} />
                          <div className="date-info">
                            <span className="date-text">
                              {new Date(a.date).toLocaleDateString('en-US', { 
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                            <span className="time-text">
                              {new Date(a.date).toLocaleDateString('en-US', { 
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                        <div className={`status-badge ${a.status}`}>
                          {a.status === 'present' ? (
                            <>
                              <CheckCircle size={16} />
                              <span>Present</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={16} />
                              <span>Absent</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* CRITICAL FIX: Remove all margins and padding that cause white space */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }

        .faculty-dashboard {
          background: #f8fafc;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          margin: 0;
          padding: 0;
          width: 100%;
          position: relative;
        }

        .dashboard-container {
          display: flex;
          min-height: 100vh;
          position: relative;
          width: 100%;
          margin: 0;
          padding: 0;
        }

        /* Menu Button - Hidden on Desktop, Visible on Mobile/Tablet at Bottom */
        .mobile-menu-toggle {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 1003;
          background: white;
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
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.95);
        }

        .mobile-menu-toggle:hover {
          background: #f9fafb;
          border-color: #cbd5e1;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }

        .menu-text {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Sidebar - Desktop: Always visible, Mobile: Slide-out */
        .sidebar-section {
          flex-shrink: 0;
          background: white;
          border-right: 1px solid #e2e8f0;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow-y: auto;
          width: 280px;
        }

        .sidebar-header {
          padding: 20px 16px;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
          display: none;
          justify-content: space-between;
          align-items: center;
        }

        .sidebar-title {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #1e293b;
          font-weight: 600;
          font-size: 16px;
        }

        .sidebar-close {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          padding: 8px;
          color: #64748b;
          transition: all 0.2s ease;
        }

        .sidebar-close:hover {
          background: #e2e8f0;
          color: #475569;
        }

        .sidebar-content {
          padding: 0;
        }

        .mobile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          z-index: 1001;
          backdrop-filter: blur(2px);
          display: none;
        }

        .main-content {
          flex: 1;
          background: #f8fafc;
          overflow: hidden;
          min-width: 0;
          width: 100%;
          margin: 0;
          padding: 0;
        }

        .section {
          padding: 24px;
          max-width: 100%;
          padding-bottom: 120px;
          margin: 0;
          width: 100%;
          display: block;
        }

        /* Attendance Button */
        .attendance-btn {
          background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-primary) 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 16px 32px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-left: auto;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .attendance-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
          background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-primary) 100%);
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(15, 23, 42, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          backdrop-filter: blur(8px);
          padding: 20px;
        }

        .modal-content.attendance-modal {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 800px;
          max-height: calc(100vh - 40px);
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          color: white;
          padding: 24px 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          color: white;
        }

        .modal-close-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          cursor: pointer;
          padding: 8px;
          color: white;
          transition: all 0.2s ease;
        }

        .modal-close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .modal-body {
          padding: 28px;
          overflow-y: auto;
          flex: 1;
        }

        /* Announcement */
        .announcement-box {
         background: #f1f5f9;
         transition: 0.3s;
        }

        .announcement-box:hover {
         background: #e2e8f0;
         transform: translateY(-2px);
        }

        /* Stats Row */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 28px;
        }

        .stat-box {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.3s ease;
        }

        .stat-box:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .stat-box.present-stat {
          border-color: #10b981;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        }

        .stat-box.present-stat svg {
          color: #10b981;
        }

        .stat-box.absent-stat {
          border-color: #ef4444;
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
        }

        .stat-box.absent-stat svg {
          color: #ef4444;
        }

        .stat-box.total-stat {
          border-color: var(--theme-primary);
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        }

        .stat-box.total-stat svg {
          color: var(--theme-primary);
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 800;
          color: #1e293b;
          line-height: 1;
        }

        .stat-label {
          font-size: 13px;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 4px;
        }

        /* Filter Section */
        .filter-section {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 28px;
        }

        .filter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .filter-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
        }

        .clear-filter-btn {
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .clear-filter-btn:hover {
          background: #fecaca;
        }

        .date-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
          color: #1e293b;
          transition: all 0.2s ease;
        }

        .date-input:focus {
          outline: none;
          border-color: var(--theme-primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* Weekly View */
        .weekly-view {
          margin-bottom: 28px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .week-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 12px;
        }

        .week-day {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .week-day:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .week-day.today {
          border-color: var(--theme-primary);
          background: #eff6ff;
        }

        .week-day.present {
          border-color: #10b981;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        }

        .week-day.absent {
          border-color: #ef4444;
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
        }

        .day-name {
          font-size: 12px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .day-number {
          font-size: 24px;
          font-weight: 800;
          color: #1e293b;
          line-height: 1;
        }

        .day-status {
          margin-top: 4px;
        }

        .week-day.present .day-status svg {
          color: #10b981;
        }

        .week-day.absent .day-status svg {
          color: #ef4444;
        }

        .no-record {
          font-size: 20px;
          color: #cbd5e1;
          font-weight: 700;
        }

        /* Attendance List */
        .attendance-list-section {
          margin-top: 28px;
        }

        .attendance-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .attendance-item {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 18px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s ease;
        }

        .attendance-item:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .attendance-item.present {
          border-left: 6px solid #10b981;
          background: linear-gradient(90deg, #f0fdf4 0%, white 100%);
        }

        .attendance-item.absent {
          border-left: 6px solid #ef4444;
          background: linear-gradient(90deg, #fef2f2 0%, white 100%);
        }

        .attendance-date {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .attendance-date svg {
          color: #64748b;
          flex-shrink: 0;
        }

        .date-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .date-text {
          font-size: 15px;
          font-weight: 600;
          color: #1e293b;
        }

        .time-text {
          font-size: 13px;
          color: #64748b;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-badge.present {
          background: #10b981;
          color: white;
        }

        .status-badge.absent {
          background: #ef4444;
          color: white;
        }

        /* No Attendance State */
        .no-attendance {
          text-align: center;
          padding: 60px 20px;
          color: #64748b;
        }

        .no-attendance svg {
          color: #cbd5e1;
          margin-bottom: 16px;
        }

        .no-attendance p {
          font-size: 18px;
          font-weight: 600;
          color: #475569;
          margin: 0 0 8px 0;
        }

        .no-attendance span {
          font-size: 14px;
          color: #64748b;
        }

        /* Responsive Design */
        @media (min-width: 1025px) {
          .sidebar-section {
            position: static;
            transform: none;
            width: 280px;
            box-shadow: none;
          }
          
          .mobile-menu-toggle {
            display: none !important;
          }
          
          .sidebar-header {
            display: none !important;
          }
          
          .mobile-overlay {
            display: none !important;
          }
          
          .section {
            padding: 24px;
            padding-bottom: 24px;
          }
        }

        @media (max-width: 1024px) {
          .mobile-menu-toggle {
            display: flex !important;
          }
          
          .sidebar-section {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            width: 300px;
            z-index: 1002;
            transform: translateX(-100%);
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.3);
          }

          .sidebar-section.mobile-open {
            transform: translateX(0);
          }
          
          .sidebar-header {
            display: flex !important;
          }

          .mobile-overlay {
            display: block;
          }

          .week-grid {
            grid-template-columns: repeat(auto-fit, minmin(80px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .modal-content.attendance-modal {
            max-width: 100%;
            margin: 0;
            border-radius: 12px;
          }

          .modal-header {
            padding: 20px;
          }

          .modal-header h2 {
            font-size: 18px;
          }

          .modal-body {
            padding: 20px;
          }

          .stats-row {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .week-grid {
            grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
            gap: 8px;
          }

          .week-day {
            padding: 12px 8px;
          }

          .day-number {
            font-size: 20px;
          }

          .attendance-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            padding: 16px;
          }

          .status-badge {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .section {
            padding: 12px;
            padding-bottom: 100px;
          }

          .attendance-btn {
            width: 100%;
            justify-content: center;
            font-size: 15px;
            padding: 14px 24px;
          }

          .modal-header {
            padding: 16px;
          }

          .modal-body {
            padding: 16px;
          }

          .stat-box {
            padding: 16px;
          }

          .stat-value {
            font-size: 24px;
          }

          .week-grid {
            grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
            gap: 6px;
          }

          .week-day {
            padding: 10px 6px;
          }

          .day-name {
            font-size: 10px;
          }

          .day-number {
            font-size: 18px;
          }

          .day-status svg {
            width: 16px;
            height: 16px;
          }

          .date-text {
            font-size: 14px;
          }

          .time-text {
            font-size: 12px;
          }
        }

        /* Focus Styles for Accessibility */
        button:focus {
          outline: 2px solid var(--theme-primary);
          outline-offset: 2px;
        }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }

          .attendance-item:hover,
          .week-day:hover,
          .stat-box:hover {
            transform: none;
          }
        }
      `}</style>
    </Layout>
  );
};

export default Dashboard;