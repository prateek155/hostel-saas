import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import OwnerMenu from "../../components/Layout/OwnerMenu";
import { useAuth } from "../../context/auth";
import "react-toastify/dist/ReactToastify.css";
import { Mail, Building2, X, Menu } from "lucide-react";
import { useTheme } from "../../context/theme";

const Dashboard = () => {
  const [auth] = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { ownerColor } = useTheme();
  const [ownerStats, setOwnerStats] = useState({
  totalRooms: 0,
  totalStudents: 0,
  totalRevenue: 0,
  duePayment: 0,
  occupancy: 0,
});

const [statsLoading, setStatsLoading] = useState(false);


  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const getOwnerDashboardStats = async () => {
  try {
    setStatsLoading(true);

    const res = await fetch("https://hostelwers.onrender.com/api/v1/hostel/dashboard-stats", {
      headers: {
        Authorization: `Bearer ${auth?.token}`,
      },
    });

    const data = await res.json();

    if (data?.success) {
      setOwnerStats(data.stats);
    }
  } catch (error) {
    console.error(error);
  } finally {
    setStatsLoading(false);
  }
};

useEffect(() => {
  if (auth?.token) {
    getOwnerDashboardStats();
  }
}, [auth?.token]);

  return (
    <Layout tile="faculty-dashboard">
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
                <span>Owner Panel</span>
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
              <OwnerMenu />
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
              {/* Stats Cards - Professional Layout */}
             <div className="stats-grid">
                   {/* Total Rooms */}
              <div className="stat-card primary">
                  <div className="stat-header">
                  <div className="stat-icon">
                      <Building2 size={20} />
                  </div>
                  <div className="stat-badge">Rooms</div>
                 </div>
                <div className="stat-content">
                  <h3>Total Rooms</h3>
                 <p>{ownerStats.totalRooms}</p>
                </div>
              </div>

  {/* Total Students */}
  <div className="stat-card secondary">
    <div className="stat-header">
      <div className="stat-icon">
        <Mail size={20} />
      </div>
      <div className="stat-badge">Students</div>
    </div>
    <div className="stat-content">
      <h3>Total Students</h3>
      <p>{ownerStats.totalStudents}</p>
    </div>
  </div>

  {/* Total Revenue */}
  <div className="stat-card accent">
    <div className="stat-header">
      <div className="stat-icon">
        ₹
      </div>
      <div className="stat-badge">Revenue</div>
    </div>
    <div className="stat-content">
      <h3>Total Rent</h3>
      <p>₹ {ownerStats.totalRevenue}</p>
    </div>
  </div>

  {/* Due Payment */}
  <div className="stat-card" style={{ borderLeft: "4px solid #ef4444" }}>
    <div className="stat-header">
      <div className="stat-icon">
        ₹
      </div>
      <div className="stat-badge">Pending</div>
    </div>
    <div className="stat-content">
      <h3>Due Rent</h3>
      <p style={{ color: "#dc2626" }}>
        ₹ {ownerStats.duePayment}
      </p>
    </div>
  </div>

     {/* Total Deposit */}
  <div className="stat-card" style={{ borderLeft: "4px solid #ef4444" }}>
    <div className="stat-header">
      <div className="stat-icon">
        ₹
      </div>
      <div className="stat-badge">Deposit</div>
    </div>
    <div className="stat-content">
      <h3>Total Deposit</h3>
      <p style={{ color: "#dc2626" }}>
        ₹ {ownerStats.totalDeposit}
      </p>
    </div>
  </div>

  {/* Occupancy */}
  <div className="stat-card" style={{ borderLeft: "4px solid #10b981" }}>
    <div className="stat-header">
      <div className="stat-icon">
        %
      </div>
      <div className="stat-badge">Occupancy</div>
    </div>
    <div className="stat-content">
      <h3>Occupancy Rate</h3>
      <p>{ownerStats.occupancy}%</p>
    </div>
  </div>
</div>
            </div>       
          </div>
        </div>
      </div>
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
          /* CRITICAL: Remove any margins that cause white space */
          margin: 0;
          padding: 0;
          width: 100%;
          position: relative;
        }

        .dashboard-container {
          display: flex;
          min-height: 100vh;
          position: relative;
          /* CRITICAL: Ensure full width without margins */
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
          display: none; /* Hidden by default on desktop */
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

        .mobile-menu-toggle:active {
          transform: translateY(0);
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
          overflow-x: hidden; 
          width: 280px;
        }

        /* Sidebar header - Hidden on desktop, shown on mobile */
        .sidebar-header {
          padding: 20px 16px;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
          display: none; /* Hidden by default on desktop */
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
          display: none; /* Hidden by default */
        }

        .main-content {
          flex: 1;
          background: #f8fafc;
          overflow-y: auto;
          min-width: 0;
          /* CRITICAL: Ensure full width without margins */
          width: 100%;
          margin: 0;
          padding: 0;
        }

        /* Section padding - Desktop: Normal, Mobile: Account for bottom menu button */
        .section {
          padding: 24px;
          max-width: 100%;
          padding-bottom: 120px; /* Extra bottom padding for mobile menu */
          /* CRITICAL: Remove margins */
          margin: 0;
          width: 100%;
        }

        /* Welcome Card - Enhanced Responsive */
        .welcome-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          width: 100%;
        }

        .welcome-header {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .welcome-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          color: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .welcome-content {
          flex: 1;
          min-width: 0;
        }

        .welcome-content h1 {
          margin: 0 0 4px 0;
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          letter-spacing: -0.025em;
        }

        .welcome-content p {
          margin: 0 0 8px 0;
          color: #64748b;
          font-size: 16px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .department-badge {
          background: #eff6ff;
          color: var(--theme-primary);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.025em;
          display: inline-block;
        }

        /* Stats Grid - Enhanced Responsive */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin-bottom: 32px;
  width: 100%;
}

.stat-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 12px 0;
  transition: all 0.2s ease;
  min-width: 0;
  width: 100%;
}

        .stat-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }

        .stat-card.primary { border-left: 4px solid var(--theme-primary); }
        .stat-card.secondary { border-left: 4px solid #10b981; }
        .stat-card.accent { border-left: 4px solid #f59e0b; }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          background: #f1f5f9;
          color: #475569;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-badge {
          background: #f1f5f9;
          color: #475569;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-content h3 {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 600;
          color: #64748b;
        }

        .stat-content p {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          word-break: break-all;
          line-height: 1.3;
        }

        /* Members Section - Enhanced */
        .members-section {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          width: 100%;
        }

        .section-header {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          min-width: 0;
        }

        .header-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          color: white;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .section-header h2 {
          margin: 0 0 4px 0;
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
        }

        .section-header p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }

        .header-stats {
          text-align: right;
          flex-shrink: 0;
        }

        .members-count {
          display: block;
          font-size: 28px;
          font-weight: 800;
          color: #1e293b;
          line-height: 1;
        }

        .count-label {
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        /* Table Styles - Desktop Only */
        .table-container {
          overflow: hidden;
          width: 100%;
        }

        .desktop-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
          display: table;
        }

        .desktop-table thead th {
          background: #f8fafc;
          color: #475569;
          font-weight: 600;
          padding: 16px 20px;
          text-align: left;
          border-bottom: 2px solid #e2e8f0;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }

        .desktop-table tbody tr {
          border-bottom: 1px solid #f1f5f9;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .desktop-table tbody tr:hover {
          background: #f8fafc;
        }

        .desktop-table tbody td {
          padding: 16px 20px;
          vertical-align: middle;
        }

        .member-id {
          background: #f1f5f9;
          color: #475569;
          padding: 6px 12px;
          border-radius: 6px;
          font-weight: 600;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          white-space: nowrap;
        }

        .member-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .member-avatar {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: linear-gradient(135deg, #1e293b, #334155);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
        }

        .member-details {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .member-name {
          font-weight: 600;
          color: #1e293b;
          font-size: 14px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .member-status {
          font-size: 12px;
          color: #f59e0b;
          font-weight: 500;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .phone-number {
          color: #475569;
          font-family: 'Courier New', monospace;
          background: #f8fafc;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
        }

        .email-address {
          color: #64748b;
          font-size: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .bio-preview {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #64748b;
          font-size: 13px;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .action-buttons button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border: 1px solid;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.025em;
          white-space: nowrap;
        }

        .btn-approve {
          background: #f0fdf4;
          color: #166534;
          border-color: #bbf7d0;
        }

        .btn-approve:hover {
          background: #dcfce7;
          border-color: #86efac;
        }

        .btn-reject {
          background: #fef2f2;
          color: #dc2626;
          border-color: #fecaca;
        }

        .btn-reject:hover {
          background: #fee2e2;
          border-color: #fca5a5;
        }
        /* Mobile Cards - Hidden by default */
        .mobile-cards {
          display: none;
          padding: 16px;
          gap: 16px;
          flex-direction: column;
        }

        .mobile-member-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mobile-member-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .mobile-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .mobile-member-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .mobile-status-badge {
          background: #fef3c7;
          color: #d97706;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          flex-shrink: 0;
        }

        .mobile-card-content {
          margin-bottom: 16px;
        }

        .mobile-contact {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-size: 13px;
        }

        .contact-item span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .mobile-bio {
          background: #f8fafc;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .mobile-bio p {
          margin: 0;
          color: #374151;
          font-size: 13px;
          line-height: 1.5;
        }

        .mobile-card-actions {
          display: flex;
          gap: 8px;
        }

        .mobile-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 16px;
          border: 1px solid;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        /* No Data State */
        .no-data {
          text-align: center;
          padding: 60px 32px;
          color: #64748b;
        }

        .no-data-icon {
          background: #f1f5f9;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: #94a3b8;
        }

        .no-data h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          color: #374151;
          font-weight: 600;
        }

        .no-data p {
          margin: 0;
          font-size: 14px;
          max-width: 400px;
          margin: 0 auto;
          line-height: 1.5;
        }

        /* Modal Styles - Enhanced Responsive */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(15, 23, 42, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 600px;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          border: 1px solid #e2e8f0;
        }

        .modal-header {
          background: #f8fafc;
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
        }

        .modal-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .application-id {
          background: #1e293b;
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          font-family: 'Courier New', monospace;
        }

        .modal-close-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          color: #6b7280;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .modal-close-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .modal-body {
          padding: 24px;
        }

        .detail-row {
          display: flex;
          margin-bottom: 20px;
          align-items: flex-start;
        }

        .detail-row.full-width {
          flex-direction: column;
        }

        .detail-row label {
          font-weight: 600;
          color: #374151;
          width: 140px;
          flex-shrink: 0;
          font-size: 14px;
        }

        .detail-row span {
          color: #1f2937;
          font-size: 14px;
          word-break: break-word;
        }

        .bio-content {
          background: #f8fafc;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          white-space: pre-line;
          font-size: 14px;
          line-height: 1.6;
          color: #374151;
          margin-top: 8px;
          word-break: break-word;
        }

        .modal-actions {
          background: #f8fafc;
          padding: 16px 24px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: flex-end;
          position: sticky;
          bottom: 0;
        }

        .btn-modal-close {
          background: #1e293b;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .btn-modal-close:hover {
          background: #334155;
        }

        /* Responsive Design - Enhanced */
        
        /* Large Desktop */
        @media (min-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(6, 1fr);
          }
          
          .section {
            padding: 32px;
          }
        }

        /* Hide scrollbars globally */
          * {
         scrollbar-width: none;
          -ms-overflow-style: none;
            }
          *::-webkit-scrollbar {
           display: none;
          } 

        /* Desktop and Large Tablet */
        @media (min-width: 1025px) {
          /* Keep sidebar always visible */
          .sidebar-section {
            position: static;
            transform: none;
            width: 280px;
            box-shadow: none;
          }
          
          /* Hide mobile menu elements */
          .mobile-menu-toggle {
            display: none !important;
          }
          
          .sidebar-header {
            display: none !important;
          }
          
          .mobile-overlay {
            display: none !important;
          }
          
          /* Ensure proper spacing */
          .section {
            padding: 24px;
            padding-bottom: 24px; /* Normal bottom padding on desktop */
          }
        }

        /* Tablet Landscape */
        @media (max-width: 1024px) {
          .dashboard-container {
            flex-direction: row;
          }
          
          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          
          .section {
            padding: 20px;
            padding-bottom: 120px;
          }
          
          /* Show mobile menu button */
          .mobile-menu-toggle {
            display: flex !important;
          }
          
          /* Transform sidebar into slide-out menu */
          .sidebar-section {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            width: 300px;
            z-index: 1002;
            transform: translateX(-100%);
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.3);
            will-change: transform;
          }

          .sidebar-section.mobile-open {
            transform: translateX(0);
          }
          
          /* Show sidebar header on mobile */
          .sidebar-header {
            display: flex !important;
          }

          .sidebar-content {
            height: calc(100vh - 80px);
            overflow-y: auto;
            padding: 16px 0;
          }
          
          /* Show overlay when mobile menu is open */
          .mobile-overlay {
            display: block;
          }

          .main-content {
            width: 100%;
            padding-left: 0;
          }
        }

        /* Tablet Portrait */
        @media (max-width: 768px) {
          .section {
            padding: 16px;
            padding-bottom: 120px;
          }

          .stat-content p {
            font-size: 15px;
            white-space: normal;
            word-break: break-all;
            line-height: 1.3;
          }

          .welcome-header {
            flex-direction: column;
            text-align: center;
            gap: 16px;
          }

          .welcome-content h1 {
            font-size: 20px;
          }

          .welcome-content p {
            white-space: normal;
            text-align: center;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }

          .section-header {
            flex-direction: column;
            gap: 16px;
            text-align: center;
            padding: 16px 20px;
          }

          .header-content {
            justify-content: center;
          }

          .section-header h2 {
            font-size: 18px;
          }

          .members-count {
            font-size: 24px;
          }

          /* Hide desktop table, show mobile cards */
          .desktop-table {
            display: none;
          }

          .mobile-cards {
            display: flex;
          }

          /* Modal adjustments */
          .modal-overlay {
            padding: 16px;
            align-items: flex-start;
            padding-top: 40px;
          }

          .modal-content {
            max-height: calc(100vh - 80px);
          }

          .modal-header {
            padding: 16px 20px;
          }

          .modal-header h2 {
            font-size: 16px;
          }

          .modal-body {
            padding: 20px;
          }

          .detail-row {
            flex-direction: column;
            gap: 4px;
            margin-bottom: 16px;
          }

          .detail-row label {
            width: auto;
            font-size: 13px;
          }

          .detail-row span {
            font-size: 13px;
          }

          .modal-actions {
            padding: 12px 20px;
          }

          .btn-modal-close {
            width: 100%;
            padding: 12px;
          }
        }

        /* Mobile Phones */
        @media (max-width: 480px) {
          .mobile-menu-toggle {
            bottom: 16px;
            right: 16px;
            padding: 12px 16px;
            min-width: 80px;
            border-radius: 40px;
          }

          .menu-text {
            font-size: 11px;
          }

          .sidebar-section {
            width: 280px;
          }

          .sidebar-header {
            padding: 16px 14px;
          }

          .sidebar-title {
            font-size: 15px;
          }

          .section {
            padding: 12px;
            padding-bottom: 100px;
          }

          .welcome-card {
            padding: 16px;
          }

          .welcome-icon {
            width: 48px;
            height: 48px;
          }

          .welcome-content h1 {
            font-size: 18px;
          }

          .welcome-content p {
            font-size: 14px;
          }

          .department-badge {
            font-size: 10px;
            padding: 3px 8px;
          }

          .stat-card {
            padding: 16px;
          }

          .stat-content h3 {
            font-size: 12px;
          }

          .stat-content p {
            font-size: 14px;
            white-space: normal;
            word-break: break-all;
            line-height: 1.2;
            min-height: 32px;
          }

          .section-header {
            padding: 12px 16px;
          }

          .header-icon {
            width: 40px;
            height: 40px;
          }

          .section-header h2 {
            font-size: 16px;
          }

          .section-header p {
            font-size: 12px;
          }

          .mobile-cards {
            padding: 12px;
          }

          .mobile-member-card {
            padding: 12px;
          }

          .member-avatar {
            width: 32px;
            height: 32px;
            font-size: 12px;
          }

          .member-name {
            font-size: 13px;
          }

          .mobile-status-badge {
            font-size: 9px;
            padding: 3px 6px;
          }

          .contact-item {
            font-size: 12px;
          }

          .mobile-bio p {
            font-size: 12px;
          }

          .mobile-btn {
            padding: 8px 12px;
            font-size: 11px;
          }

          .no-data {
            padding: 40px 16px;
          }

          .no-data-icon {
            width: 60px;
            height: 60px;
          }

          .no-data h3 {
            font-size: 16px;
          }

          .no-data p {
            font-size: 13px;
          }

          /* Modal mobile adjustments */
          .modal-overlay {
            padding: 8px;
            padding-top: 20px;
          }

          .modal-content {
            max-height: calc(100vh - 40px);
            border-radius: 8px;
          }

          .modal-header {
            flex-direction: column;
            gap: 8px;
            align-items: flex-start;
          }

          .modal-header-actions {
            align-self: flex-end;
          }

          .application-id {
            font-size: 10px;
            padding: 4px 8px;
          }

          .modal-body {
            padding: 16px;
          }

          .bio-content {
            padding: 12px;
            font-size: 13px;
          }
        }

        /* Extra Small Mobile */
        @media (max-width: 320px) {
          .mobile-card-actions {
            flex-direction: column;
          }

          .mobile-btn {
            width: 100%;
          }

          .stats-grid {
            gap: 12px;
          }

          .stat-card {
            padding: 12px;
          }

          .welcome-header {
            gap: 12px;
          }

          .header-content {
            gap: 12px;
          }
        }

        /* Print Styles */
        @media print {
          .mobile-menu-toggle,
          .sidebar-section,
          .action-buttons,
          .mobile-card-actions,
          .modal-overlay {
            display: none !important;
          }

          .main-content {
            width: 100% !important;
          }

          .desktop-table {
            display: table !important;
          }

          .mobile-cards {
            display: none !important;
          }

          .faculty-dashboard {
            background: white !important;
          }

          .welcome-card,
          .stat-card,
          .members-section {
            box-shadow: none !important;
            border: 1px solid #e2e8f0 !important;
          }
        }

        /* High Contrast Mode */
        @media (prefers-contrast: high) {
          .welcome-card,
          .stat-card,
          .members-section {
            border: 2px solid #000;
          }

          .btn-approve {
            background: #000;
            color: #fff;
            border-color: #000;
          }

          .btn-reject {
            background: #fff;
            color: #000;
            border-color: #000;
          }
        }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }

          .sidebar-section {
            transition: none;
          }

          .stat-card:hover {
            transform: none;
          }
        }

        /* Focus Styles for Accessibility */
        button:focus,
        .mobile-member-card:focus,
        .desktop-table tbody tr:focus {
          outline: 2px solid var(--theme-primary);
          outline-offset: 2px;
        }

        /* Screen Reader Only */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
           `}</style>
           </Layout>
  );
};

export default Dashboard;