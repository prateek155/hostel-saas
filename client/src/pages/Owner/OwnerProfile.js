import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import { useAuth } from "../../context/auth";
import axios from "axios";
import { Phone, Mail, Building2 } from "lucide-react";

const OwnerProfile = () => {
  const [auth] = useAuth();
  const [ownerPhoto, setOwnerPhoto] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(true);

  // Fetch owner photo
  useEffect(() => {
    const fetchOwnerPhoto = async () => {
      try {
        if (auth?.user?._id) {
          const response = await axios.get(
            `https://hostelwers.onrender.com/api/v1/admin/owner-photo/${auth.user._id}`,
            {
              responseType: 'blob'
            }
          );
          
          if (response.data) {
            const photoUrl = URL.createObjectURL(response.data);
            setOwnerPhoto(photoUrl);
          }
        }
      } catch (error) {
        console.error("Error loading photo:", error);
        // Don't show error toast, just use fallback avatar
      } finally {
        setPhotoLoading(false);
      }
    };

    fetchOwnerPhoto();

    // Cleanup
    return () => {
      if (ownerPhoto) {
        URL.revokeObjectURL(ownerPhoto);
      }
    };
  }, [auth?.user?._id]);
  
  // Get user initials for fallback avatar
  const getInitials = (name) => {
    if (!name) return "O";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name[0];
  };

  return (
    <Layout title={"owner-profile"}>
      <div className="faculty-dashboard">
        <div className="dashboard-container">
          {/* Main Content */}
          <div className="main-content">
            <div className="section">
              {/* Owner Profile Card - Photo + Details */}
              <div className="owner-profile-card">
                <div className="profile-layout">
                  {/* Left Side - Photo */}
                  <div className="profile-photo-section">
                    <div className="photo-container">
                      {photoLoading ? (
                        <div className="photo-skeleton">
                          <div className="skeleton-spinner"></div>
                        </div>
                      ) : ownerPhoto ? (
                        <img 
                          src={ownerPhoto} 
                          alt={`${auth?.user?.name}'s profile`}
                          className="profile-photo"
                        />
                      ) : (
                        <div className="profile-avatar-fallback">
                          {getInitials(auth?.user?.name)}
                        </div>
                      )}
                    </div>
                    <div className="photo-badge">
                      <Building2 size={16} />
                      <span>Owner</span>
                    </div>
                  </div>

                  {/* Right Side - Details */}
                  <div className="profile-details-section">
                    <div className="profile-header">
                      <div className="profile-title-section">
                        <h1 className="profile-name">{auth?.user?.name}</h1>
                        <span className="profile-role">Hostel Owner</span>
                      </div>
                      <div className="profile-status-badge active">
                        <span className="status-dot"></span>
                        Active
                      </div>
                    </div>

                    <div className="profile-info-grid">
                      <div className="info-item">
                        <div className="info-icon">
                          <Mail size={18} />
                        </div>
                        <div className="info-content">
                          <label>Email Address</label>
                          <span>{auth?.user?.email}</span>
                        </div>
                      </div>

                      <div className="info-item">
                        <div className="info-icon">
                          <Phone size={18} />
                        </div>
                        <div className="info-content">
                          <label>Contact Number</label>
                          <span>{auth?.user?.phone}</span>
                        </div>
                      </div>

                      <div className="info-item full-width">
                        <div className="info-icon">
                          <Building2 size={18} />
                        </div>
                        <div className="info-content">
                          <label>Management System</label>
                          <span>Hostel Management Portal</span>
                        </div>
                      </div>
                    </div>
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

        .mobile-menu-toggle:active {
          transform: translateY(0);
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
          z-index: 1001;
          backdrop-filter: blur(2px);
          display: none;
        }

        .main-content {
          flex: 1;
          background: #f8fafc;
          overflow-y: auto;
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
        }

        /* Owner Profile Card - NEW DESIGN */
        .owner-profile-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 32px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .profile-layout {
          display: flex;
          gap: 32px;
          padding: 32px;
          align-items: flex-start;
        }

        /* Left Side - Photo Section */
        .profile-photo-section {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .photo-container {
          width: 180px;
          height: 180px;
          border-radius: 20px;
          overflow: hidden;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
          position: relative;
          border: 4px solid white;
        }

        .profile-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .profile-avatar-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 64px;
          font-weight: 700;
          color: white;
          text-transform: uppercase;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .photo-skeleton {
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 50%,
            #f0f0f0 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .skeleton-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .photo-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 4px 10px rgba(30, 41, 59, 0.2);
        }

        /* Right Side - Details Section */
        .profile-details-section {
          flex: 1;
          min-width: 0;
        }

        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          gap: 16px;
        }

        .profile-title-section {
          flex: 1;
          min-width: 0;
        }

        .profile-name {
          margin: 0 0 6px 0;
          font-size: 32px;
          font-weight: 700;
          color: #1e293b;
          letter-spacing: -0.025em;
          word-break: break-word;
        }

        .profile-role {
          display: inline-block;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          color: #1e40af;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .profile-status-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .profile-status-badge.active {
          background: #f0fdf4;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .profile-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .info-item {
          display: flex;
          gap: 14px;
          padding: 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .info-item:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .info-item.full-width {
          grid-column: 1 / -1;
        }

        .info-icon {
          width: 40px;
          height: 40px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #475569;
          flex-shrink: 0;
        }

        .info-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .info-content label {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .info-content span {
          font-size: 15px;
          font-weight: 600;
          color: #1e293b;
          word-break: break-word;
        }

        /* Quick Stats Header */
        .quick-stats-header {
          margin-bottom: 20px;
        }

        .quick-stats-header h2 {
          margin: 0 0 4px 0;
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
        }

        .quick-stats-header p {
          margin: 0;
          font-size: 14px;
          color: #64748b;
        }

        /* Stats Grid - Enhanced Responsive */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
          width: 100%;
        }

        .stat-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          transition: all 0.2s ease;
          min-width: 0;
          width: 100%;
        }

        .stat-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }

        .stat-card.primary { border-left: 4px solid #3b82f6; }
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
            grid-template-columns: repeat(3, 1fr);
          }
          
          .section {
            padding: 32px;
          }
        }

        /* Desktop and Large Tablet */
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

        /* Tablet Landscape */
        @media (max-width: 1024px) {
          .dashboard-container {
            flex-direction: row;
          }
          
          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          }
          
          .section {
            padding: 20px;
            padding-bottom: 120px;
          }
          
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
            will-change: transform;
          }

          .sidebar-section.mobile-open {
            transform: translateX(0);
          }
          
          .sidebar-header {
            display: flex !important;
          }

          .sidebar-content {
            height: calc(100vh - 80px);
            overflow-y: auto;
            padding: 16px 0;
          }
          
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
          /* Profile Card Mobile Adjustments */
      .owner-profile-card {
        margin-bottom: 24px;
      }

      .profile-layout {
        flex-direction: column;
        align-items: center;
        padding: 24px 20px;
        gap: 24px;
      }

      .profile-photo-section {
        width: 100%;
        align-items: center;
      }

      .photo-container {
        width: 150px;
        height: 150px;
      }

      .profile-avatar-fallback {
        font-size: 52px;
      }

      .profile-details-section {
        width: 100%;
      }

      .profile-header {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .profile-title-section {
        width: 100%;
      }

      .profile-name {
        font-size: 26px;
      }

      .profile-status-badge {
        align-self: center;
      }

      .profile-info-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .quick-stats-header {
        text-align: center;
      }

      .quick-stats-header h2 {
        font-size: 18px;
      }

      .stat-content p {
        font-size: 15px;
        white-space: normal;
        word-break: break-all;
        line-height: 1.3;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 16px;
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

      /* Profile Card Mobile */
      .profile-layout {
        padding: 20px 16px;
        gap: 20px;
      }

      .photo-container {
        width: 130px;
        height: 130px;
        border-width: 3px;
      }

      .profile-avatar-fallback {
        font-size: 44px;
      }

      .photo-badge {
        padding: 6px 12px;
        font-size: 11px;
      }

      .profile-name {
        font-size: 22px;
      }

      .profile-role {
        font-size: 11px;
        padding: 4px 10px;
      }

      .profile-status-badge {
        font-size: 11px;
        padding: 6px 12px;
      }

      .status-dot {
        width: 6px;
        height: 6px;
      }

      .info-item {
        padding: 12px;
        gap: 10px;
      }

      .info-icon {
        width: 36px;
        height: 36px;
      }

      .info-content label {
        font-size: 11px;
      }

      .info-content span {
        font-size: 13px;
      }

      .quick-stats-header h2 {
        font-size: 16px;
      }

      .quick-stats-header p {
        font-size: 12px;
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
      .stats-grid {
        gap: 12px;
      }

      .stat-card {
        padding: 12px;
      }

      .profile-layout {
        gap: 16px;
      }
    }

    /* Print Styles */
    @media print {
      .mobile-menu-toggle,
      .sidebar-section,
      .modal-overlay {
        display: none !important;
      }

      .main-content {
        width: 100% !important;
      }

      .faculty-dashboard {
        background: white !important;
      }

      .owner-profile-card,
      .stat-card {
        box-shadow: none !important;
        border: 1px solid #e2e8f0 !important;
      }
    }

    /* High Contrast Mode */
    @media (prefers-contrast: high) {
      .owner-profile-card,
      .stat-card {
        border: 2px solid #000;
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
    button:focus {
      outline: 2px solid #3b82f6;
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
export default OwnerProfile;  
