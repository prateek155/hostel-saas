import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Building2, MapPin, Bed, Home, Users, CheckCircle, XCircle, Mail, Phone, Menu, X, Search } from 'lucide-react';
import AdminMenu from '../../components/Layout/AdminMenu';
import Header from '../../components/Layout/Header';

const AllHostels = () => {
  const [auth] = useAuth();
  const [hostels, setHostels] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('adminTheme') || 'default';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const themes = {
    default: {
      name: 'Thames Brand Co.',
      primary: '#3b82f6',
      background: '#0f172a',
      surface: '#1e293b',
      surfaceLight: '#334155',
      text: '#e2e8f0',
      textSecondary: '#94a3b8',
      border: '#334155',
      accent: '#60a5fa'
    },
    ocean: {
      name: 'Ocean Theme',
      primary: '#06b6d4',
      background: '#0c1e24',
      surface: '#164e63',
      surfaceLight: '#155e75',
      text: '#e0f2fe',
      textSecondary: '#67e8f9',
      border: '#0e7490',
      accent: '#22d3ee'
    },
    sunset: {
      name: 'Sunset Theme',
      primary: '#f59e0b',
      background: '#1a0f0a',
      surface: '#451a03',
      surfaceLight: '#78350f',
      text: '#fef3c7',
      textSecondary: '#fcd34d',
      border: '#92400e',
      accent: '#fbbf24'
    },
    forest: {
      name: 'Forest Theme',
      primary: '#10b981',
      background: '#0a1612',
      surface: '#064e3b',
      surfaceLight: '#065f46',
      text: '#d1fae5',
      textSecondary: '#6ee7b7',
      border: '#047857',
      accent: '#34d399'
    },
    purple: {
      name: 'Purple Dream',
      primary: '#8b5cf6',
      background: '#1a0f2e',
      surface: '#2e1065',
      surfaceLight: '#4c1d95',
      text: '#f3e8ff',
      textSecondary: '#c4b5fd',
      border: '#6d28d9',
      accent: '#a78bfa'
    }
  };

  const theme = themes[currentTheme];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    localStorage.setItem('adminTheme', currentTheme);
  }, [currentTheme]);

  /* ================= FETCH ALL HOSTELS ================= */
  const fetchHostels = async () => {
    try {
      const { data } = await axios.get(
        "https://hostelwers.onrender.com/api/v1/hostel/all-hostels",
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (data.success) {
        setHostels(data.hostels);
      }
    } catch (error) {
      toast.error("Failed to load hostels");
    }
  };

  /* ================= FETCH SINGLE HOSTEL ================= */
  const fetchSingleHostel = async (id) => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `https://hostelwers.onrender.com/api/v1/hostel/hostel/${id}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (data.success) {
        setSelectedHostel(data.hostel);
      }
    } catch (error) {
      toast.error("Failed to load hostel details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  const filteredHostels = hostels.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .hostels-container {
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

        .hostels-content {
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
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
        }

        .page-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .page-icon {
          width: 56px;
          height: 56px;
          background-color: ${theme.primary};
          color: #fff;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .page-title-section {
          flex: 1;
        }

        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: ${theme.text};
          margin: 0 0 4px 0;
        }

        .page-subtitle {
          font-size: 14px;
          color: ${theme.textSecondary};
          margin: 0;
        }

        .hostels-count-badge {
          background-color: ${theme.primary}33;
          color: ${theme.primary};
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          display: inline-block;
        }

        .search-bar {
          margin-bottom: 24px;
          position: relative;
        }

        .search-input-wrapper {
          position: relative;
          max-width: 400px;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: ${theme.textSecondary};
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px 12px 48px;
          background-color: ${theme.surface};
          border: 1px solid ${theme.border};
          border-radius: 8px;
          color: ${theme.text};
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
        }

        .search-input:focus {
          border-color: ${theme.primary};
          box-shadow: 0 0 0 3px ${theme.primary}22;
        }

        .search-input::placeholder {
          color: ${theme.textSecondary};
        }

        .hostels-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 24px;
        }

        .hostels-list-panel {
          background-color: ${theme.surface};
          border-radius: 12px;
          border: 1px solid ${theme.border};
          overflow: hidden;
          height: fit-content;
          max-height: calc(100vh - 280px);
          display: flex;
          flex-direction: column;
        }

        .panel-header {
          background-color: ${theme.surfaceLight};
          padding: 16px 20px;
          border-bottom: 1px solid ${theme.border};
        }

        .panel-title {
          font-size: 16px;
          font-weight: 600;
          color: ${theme.text};
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .hostels-list {
          overflow-y: auto;
          flex: 1;
          -ms-overflow-style: none;   /* hides scrollbar in IE/Edge */
          scrollbar-width: none; 
        }

        .hostels-list::-webkit-scrollbar {
          display: none;              /* hides scrollbar in Chrome/Safari */
        }

        /* Replace the existing scrollbar styles for .hostels-list */
        .hostels-list::-webkit-scrollbar {
            display: none;
        }

        .hostels-list {
            overflow-y: auto;
            flex: 1;
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;     /* Firefox */
        }

        .hostel-item {
          padding: 16px 20px;
          border-bottom: 1px solid ${theme.border};
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .hostel-item:hover {
          background-color: ${theme.surfaceLight};
        }

        .hostel-item.active {
          background-color: ${theme.primary}22;
          border-left: 3px solid ${theme.primary};
        }

        .hostel-item-content {
          flex: 1;
        }

        .hostel-name {
          font-size: 16px;
          font-weight: 600;
          color: ${theme.text};
          margin: 0 0 4px 0;
        }

        .hostel-location {
          font-size: 13px;
          color: ${theme.textSecondary};
          margin: 0;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .hostel-rooms-badge {
          background-color: ${theme.primary};
          color: #fff;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .no-hostels {
          padding: 40px 20px;
          text-align: center;
          color: ${theme.textSecondary};
        }

        .details-panel {
          background-color: ${theme.surface};
          border-radius: 12px;
          border: 1px solid ${theme.border};
          overflow: hidden;
          height: fit-content;
        }

        .details-content {
          padding: 24px;
        }

        .loading-state,
        .empty-state {
          padding: 60px 20px;
          text-align: center;
          color: ${theme.textSecondary};
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid ${theme.border};
          border-top-color: ${theme.primary};
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-state-icon {
          width: 64px;
          height: 64px;
          background-color: ${theme.surfaceLight};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          color: ${theme.textSecondary};
        }

        .hostel-detail-header {
          margin-bottom: 24px;
        }

        .hostel-detail-title {
          font-size: 24px;
          font-weight: 700;
          color: ${theme.text};
          margin: 0 0 8px 0;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-badge.active {
          background-color: #10b98133;
          color: #10b981;
        }

        .status-badge.inactive {
          background-color: #ef444433;
          color: #ef4444;
        }

        .detail-section {
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: ${theme.textSecondary};
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 12px 0;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .info-item {
          background-color: ${theme.surfaceLight};
          padding: 14px;
          border-radius: 8px;
          border: 1px solid ${theme.border};
        }

        .info-label {
          font-size: 12px;
          font-weight: 600;
          color: ${theme.textSecondary};
          margin: 0 0 6px 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .info-value {
          font-size: 15px;
          font-weight: 500;
          color: ${theme.text};
          margin: 0;
          word-break: break-word;
        }

        .divider {
          height: 1px;
          background-color: ${theme.border};
          margin: 24px 0;
        }

        .facilities-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .facility-tag {
          background-color: ${theme.surfaceLight};
          color: ${theme.text};
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 13px;
          border: 1px solid ${theme.border};
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

          .hostels-grid {
            grid-template-columns: 1fr;
          }

          .hostels-list-panel {
            max-height: 400px;
          }
        }

        @media (max-width: 768px) {
          .hostels-content {
            padding: 20px;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .page-title {
            font-size: 22px;
          }

          .search-input-wrapper {
            max-width: 100%;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .hostels-content {
            padding: 16px;
            padding-bottom: 100px;
          }

          .page-header-left {
            flex-direction: column;
            align-items: flex-start;
          }

          .page-icon {
            width: 48px;
            height: 48px;
          }

          .page-title {
            font-size: 20px;
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
      `}</style>

      <div className="hostels-container">
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

          {/* Hostels Content */}
          <div className="hostels-content">
            {/* Page Header */}
            <ToastContainer 
                          position="top-left"
                          autoClose={3000}
                          theme="dark"
                        />
            <div className="page-header">
              <div className="page-header-left">
                <div className="page-icon">
                  <Building2 size={32} />
                </div>
                <div className="page-title-section">
                  <h1 className="page-title">All Hostels</h1>
                  <p className="page-subtitle">Manage and view all hostel properties</p>
                </div>
              </div>
              <div className="hostels-count-badge">
                {hostels.length} {hostels.length === 1 ? 'Hostel' : 'Hostels'}
              </div>
            </div>

            {/* Search Bar */}
            <div className="search-bar">
              <div className="search-input-wrapper">
                <Search className="search-icon" size={20} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by hostel name or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Hostels Grid */}
            <div className="hostels-grid">
              {/* Hostels List */}
              <div className="hostels-list-panel">
                <div className="panel-header">
                  <h2 className="panel-title">
                    <Home size={18} />
                    Hostel List
                  </h2>
                </div>
                <div className="hostels-list">
                  {filteredHostels.length === 0 ? (
                    <div className="no-hostels">
                      <div className="empty-state-icon">
                        <Building2 size={32} />
                      </div>
                      <p>{searchTerm ? 'No hostels found matching your search' : 'No hostels found'}</p>
                    </div>
                  ) : (
                    filteredHostels.map((h) => (
                      <div
                        key={h._id}
                        className={`hostel-item ${selectedHostel?._id === h._id ? 'active' : ''}`}
                        onClick={() => fetchSingleHostel(h._id)}
                      >
                        <div className="hostel-item-content">
                          <h3 className="hostel-name">{h.name}</h3>
                          <p className="hostel-location">
                            <MapPin size={14} />
                            {h.city}
                          </p>
                        </div>
                        <div className="hostel-rooms-badge">
                          {h.totalRooms} Rooms
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Hostel Details */}
              <div className="details-panel">
                <div className="panel-header">
                  <h2 className="panel-title">
                    <Building2 size={18} />
                    Hostel Details
                  </h2>
                </div>
                <div className="details-content">
                  {loading ? (
                    <div className="loading-state">
                      <div className="loading-spinner"></div>
                      <p>Loading hostel details...</p>
                    </div>
                  ) : !selectedHostel ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <Building2 size={32} />
                      </div>
                      <p>Select a hostel from the list to view details</p>
                    </div>
                  ) : (
                    <>
                      <div className="hostel-detail-header">
                        <h2 className="hostel-detail-title">{selectedHostel.name}</h2>
                        <div className={`status-badge ${selectedHostel.isActive ? 'active' : 'inactive'}`}>
                          {selectedHostel.isActive ? (
                            <>
                              <CheckCircle size={14} />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle size={14} />
                              Inactive
                            </>
                          )}
                        </div>
                      </div>

                      <div className="detail-section">
                        <h3 className="section-title">Location Information</h3>
                        <div className="info-grid">
                          <div className="info-item">
                            <p className="info-label">
                              <MapPin size={14} />
                              Address
                            </p>
                            <p className="info-value">{selectedHostel.address}</p>
                          </div>
                          <div className="info-item">
                            <p className="info-label">
                              <MapPin size={14} />
                              City
                            </p>
                            <p className="info-value">{selectedHostel.city}</p>
                          </div>
                          <div className="info-item">
                            <p className="info-label">
                              <MapPin size={14} />
                              State
                            </p>
                            <p className="info-value">{selectedHostel.state}</p>
                          </div>
                          <div className="info-item">
                            <p className="info-label">
                              <MapPin size={14} />
                              Pincode
                            </p>
                            <p className="info-value">{selectedHostel.pincode}</p>
                          </div>
                        </div>
                      </div>

                      <div className="divider"></div>

                      <div className="detail-section">
                        <h3 className="section-title">Capacity Details</h3>
                        <div className="info-grid">
                          <div className="info-item">
                            <p className="info-label">
                              <Home size={14} />
                              Total Rooms
                            </p>
                            <p className="info-value">{selectedHostel.totalRooms}</p>
                          </div>
                          <div className="info-item">
                            <p className="info-label">
                              <Bed size={14} />
                              Total Beds
                            </p>
                            <p className="info-value">{selectedHostel.totalBeds}</p>
                          </div>
                        </div>
                      </div>

                      {selectedHostel.facilities && selectedHostel.facilities.length > 0 && (
                        <>
                          <div className="divider"></div>
                          <div className="detail-section">
                            <h3 className="section-title">Facilities</h3>
                            <div className="facilities-list">
                              {selectedHostel.facilities.map((facility, index) => (
                                <span key={index} className="facility-tag">
                                  {facility}
                                </span>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      <div className="divider"></div>

                      <div className="detail-section">
                        <h3 className="section-title">Owner Information</h3>
                        <div className="info-grid">
                          <div className="info-item">
                            <p className="info-label">
                              <Users size={14} />
                              Name
                            </p>
                            <p className="info-value">{selectedHostel.owner?.name || 'N/A'}</p>
                          </div>
                          <div className="info-item">
                            <p className="info-label">
                              <Mail size={14} />
                              Email
                            </p>
                            <p className="info-value">{selectedHostel.owner?.email || 'N/A'}</p>
                          </div>
                          <div className="info-item">
                            <p className="info-label">
                              <Phone size={14} />
                              Phone
                            </p>
                            <p className="info-value">{selectedHostel.owner?.phone || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AllHostels;