import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { toast } from "react-toastify";
import { ChevronDown, LogOut, LayoutDashboard, UserCircle, Bell, Menu, X, House, Calendar } from 'lucide-react';

const Header = ({ currentTheme = 'default', setCurrentTheme, sidebarOpen, setSidebarOpen }) => {
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const themes = {
    default: {
      name: 'Thames Brand Co.',
      primary: '#3b82f6',
      secondary: '#60a5fa',
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
      secondary: '#22d3ee',
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
      secondary: '#fbbf24',
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
      secondary: '#34d399',
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
      secondary: '#a78bfa',
      background: '#1a0f2e',
      surface: '#2e1065',
      surfaceLight: '#4c1d95',
      text: '#f3e8ff',
      textSecondary: '#c4b5fd',
      border: '#6d28d9'
    }
  };

  const theme = themes[currentTheme];

  const handleLogout = (e) => {
    e.preventDefault();
    setAuth({ user: null, token: "" });
    localStorage.removeItem("auth");
    toast.success("Logout Successfully");
    navigate("/login");
  };

  const userInitial = auth?.user?.name
    ? auth.user.name.charAt(0).toUpperCase()
    : "U";

  const getDashboardRoute = () => {
    if (!auth?.user) return "/login";
    switch (auth.user.role) {
      case "admin": return "/dashboard/admin";
      case "owner": return "/dashboard/owner";
      case "student": return "/dashboard/student";
      default: return "/login";
    }
  };

  const getProfileRoute = () => {
    if (!auth?.user) return "/login";
    switch (auth.user.role) {
      case "admin": return "/dashboard/admin/profile";
      case "owner": return "/dashboard/owner/profile";
      case "student": return "/dashboard/student/profile";
      default: return getDashboardRoute();
    }
  };

  useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target)
    ) {
      setUserDropdownOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .hdr {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 32px;
          height: 62px;
          background: rgba(6,6,6,0.92);
          backdrop-filter: blur(24px) saturate(180%);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          position: sticky;
          top: 0;
          z-index: 400;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.3s ease;
        }

        /* Animated top accent line */
        .hdr::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, ${theme.primary}, transparent);
          opacity: 0.7;
        }

        /* Subtle noise texture */
        .hdr::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.025'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: -1;
        }

        .hdr-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        /* Menu toggle */
        .hdr-menu-btn {
          background: none;
          border: none;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          padding: 7px;
          display: flex;
          align-items: center;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .hdr-menu-btn:hover {
          background: rgba(255,255,255,0.07);
          color: #fff;
        }

        /* Logo */
        .hdr-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          cursor: pointer;
        }
        .hdr-logo-img {
          width: 44px;
          height: 30px;
          object-fit: contain;
          border-radius: 6px;
          filter: brightness(1.1);
          transition: transform 0.3s;
        }
        .hdr-logo:hover .hdr-logo-img { transform: scale(1.06) rotate(-2deg); }

        /* Theme selector */
        .hdr-theme-wrap {
          position: relative;
        }
        .hdr-theme-sel {
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.7);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 6px 32px 6px 14px;
          border-radius: 100px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          cursor: pointer;
          appearance: none;
          outline: none;
          transition: all 0.25s;
        }
        .hdr-theme-sel:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.2);
          color: #fff;
        }
        .hdr-theme-sel option {
          background: #111;
          color: #fff;
        }
        .hdr-theme-chevron {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: rgba(255,255,255,0.4);
        }

        /* Right section */
        .hdr-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Notification bell */
        .hdr-notif-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 7px;
          display: flex;
          align-items: center;
          border-radius: 8px;
          transition: all 0.2s;
          position: relative;
          color: rgba(255,255,255,0.5);
        }
        .hdr-notif-btn:hover {
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.9);
        }
        .hdr-notif-dot {
          position: absolute;
          top: 6px; right: 6px;
          width: 7px; height: 7px;
          background: #ef4444;
          border-radius: 50%;
          border: 1.5px solid #060606;
          animation: notifPulse 2s infinite;
        }
        @keyframes notifPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
          50% { box-shadow: 0 0 0 4px rgba(239,68,68,0); }
        }

        /* User section */
        .hdr-user {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 6px;
          border-radius: 100px;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.25s;
        }
        .hdr-user:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.1);
        }

        .hdr-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary});
          display: flex; align-items: center; justify-content: center;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-weight: 700; font-size: 14px;
          flex-shrink: 0;
          box-shadow: 0 0 0 2px rgba(255,255,255,0.1), 0 0 14px ${theme.primary}44;
          transition: box-shadow 0.3s;
        }
        .hdr-user:hover .hdr-avatar {
          box-shadow: 0 0 0 2px ${theme.primary}66, 0 0 20px ${theme.primary}44;
        }

        .hdr-user-info { display: flex; flex-direction: column; }
        .hdr-user-name {
          font-size: 13px; font-weight: 600;
          color: rgba(255,255,255,0.9); line-height: 1.2;
        }
        .hdr-user-role {
          font-size: 11px; color: rgba(255,255,255,0.4);
          text-transform: capitalize; line-height: 1.2;
        }

        .hdr-chevron-btn {
          background: none; border: none;
          cursor: pointer; padding: 2px;
          display: flex; align-items: center;
          color: rgba(255,255,255,0.35);
          transition: transform 0.3s, color 0.2s;
        }
        .hdr-chevron-btn.open { transform: rotate(180deg); color: rgba(255,255,255,0.7); }

        /* Dropdown */
        .hdr-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          min-width: 230px;
          background: rgba(14,14,14,0.97);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 16px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04);
          z-index: 1000;
          overflow: hidden;
          animation: dropIn 0.22s cubic-bezier(0.25,0.46,0.45,0.94) both;
        }
        @keyframes dropIn {
          from { opacity:0; transform: translateY(-8px) scale(0.97); }
          to { opacity:1; transform: translateY(0) scale(1); }
        }

        /* Dropdown top line */
        .hdr-dropdown::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, ${theme.primary}88, transparent);
        }

        .hdr-drop-head {
          padding: 14px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
        }
        .hdr-drop-name {
          font-size: 14px; font-weight: 700;
          color: #fff; font-family: 'Syne', sans-serif;
          margin: 0 0 2px;
        }
        .hdr-drop-email {
          font-size: 12px; color: rgba(255,255,255,0.4);
          margin: 0; text-transform: capitalize;
        }

        .hdr-drop-item {
          width: 100%;
          padding: 11px 18px;
          display: flex; align-items: center; gap: 11px;
          border: none; background: none;
          cursor: pointer; font-size: 14px;
          font-family: 'DM Sans', sans-serif; font-weight: 500;
          transition: all 0.2s;
          text-align: left;
          color: rgba(255,255,255,0.7);
          text-decoration: none;
        }
        .hdr-drop-item:hover {
          background: rgba(255,255,255,0.05);
          color: #fff;
          padding-left: 22px;
        }
        .hdr-drop-item svg { opacity: 0.6; transition: opacity 0.2s; flex-shrink: 0; }
        .hdr-drop-item:hover svg { opacity: 1; }

        .hdr-drop-divider {
          height: 1px; margin: 4px 0;
          background: rgba(255,255,255,0.07);
        }

        .hdr-drop-item-logout {
          color: #f87171 !important;
        }
        .hdr-drop-item-logout:hover {
          background: rgba(239,68,68,0.08) !important;
          color: #ef4444 !important;
        }
        .hdr-drop-item-logout svg { opacity: 0.7 !important; }

        /* Login link */
        .hdr-login-link {
          display: flex; align-items: center; gap: 8px;
          text-decoration: none;
          color: rgba(255,255,255,0.7);
          padding: 7px 16px;
          border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.12);
          font-size: 14px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.25s;
          background: rgba(255,255,255,0.04);
        }
        .hdr-login-link:hover {
          background: ${theme.primary}22;
          border-color: ${theme.primary}66;
          color: #fff;
        }

        @media (max-width: 768px) {
          .hdr { padding: 0 16px; }
          .hdr-theme-wrap { display: none; }
          .hdr-user-info { display: none; }
          .hdr-right { gap: 4px; }
        }
        @media (max-width: 480px) {
          .hdr-logo-img { width: 36px; height: 26px; }
          .hdr-avatar { width: 30px; height: 30px; font-size: 12px; }
        }
      `}</style>

      <header className="hdr">
        <div className="hdr-left">
          {setSidebarOpen && (
            <button className="hdr-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          )}

          <Link to="/" className="hdr-logo">
            <img src="/image/header.png" alt="Logo" className="hdr-logo-img" />
          </Link>

          {setCurrentTheme && (
            <div className="hdr-theme-wrap">
              <select
                className="hdr-theme-sel"
                value={currentTheme}
                onChange={(e) => setCurrentTheme(e.target.value)}
              >
                {Object.keys(themes).map(key => (
                  <option key={key} value={key}>{themes[key].name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="hdr-theme-chevron" />
            </div>
          )}
        </div>

        <div className="hdr-right">
          <button className="hdr-notif-btn">
            <Bell size={19} />
            <span className="hdr-notif-dot"></span>
          </button>

          {auth?.user ? (
              <div
                ref={dropdownRef}
                className="hdr-user"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              >
              <div className="hdr-avatar" title={auth.user.name}>
                {userInitial}
              </div>
              <div className="hdr-user-info">
                <span className="hdr-user-name">{auth.user.name}</span>
                <span className="hdr-user-role">{auth.user.role}</span>
              </div>
              <button
                className={`hdr-chevron-btn ${userDropdownOpen ? 'open' : ''}`}
                onClick={(e) => { e.stopPropagation(); setUserDropdownOpen(!userDropdownOpen); }}
              >
                <ChevronDown size={16} />
              </button>

              {userDropdownOpen && (
                <div className="hdr-dropdown">
                  <div className="hdr-drop-head">
                    <div className="hdr-drop-name">{auth.user.name}</div>
                    <div className="hdr-drop-email">{auth.user.email || auth.user.role}</div>
                  </div>

                  <Link to={getDashboardRoute()} className="hdr-drop-item" onClick={() => setUserDropdownOpen(false)}>
                    <LayoutDashboard size={16} /><span>Dashboard</span>
                  </Link>
                  <Link to="/" className="hdr-drop-item">
                    <House size={16} /><span>Home</span>
                  </Link>
                  <Link to={getProfileRoute()} className="hdr-drop-item" onClick={() => setUserDropdownOpen(false)}>
                    <UserCircle size={16} /><span>Profile</span>
                  </Link>
                  <Link to="/events" className="hdr-drop-item">
                    <Calendar size={16} /><span>Events</span>
                  </Link>

                  <div className="hdr-drop-divider"></div>

                  <button className="hdr-drop-item hdr-drop-item-logout" onClick={handleLogout}>
                    <LogOut size={16} /><span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="hdr-login-link">
              <div className="hdr-avatar">U</div>
              <span>Login</span>
            </Link>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;