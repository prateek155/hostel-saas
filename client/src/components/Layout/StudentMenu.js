import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  BookOpen,
  ChevronRight,
  Building2,
  Settings
} from "lucide-react";

const StudentMenu = () => {

  const menuSections = [
    {
      items: [
        {
          path: "/dashboard/student",
          icon: <LayoutDashboard />,
          title: "Dashboard",
          description: "Main control center",
        },
        {
          path: "/dashboard/student/daily-menu",
          icon: <Package />,
          title: "MENU",
          description: "Detail Of food ",
        },
        {
          path: "/dashboard/student/complaint",
          icon: <BookOpen />,
          title: "Complaint Box",
          description: "Make a complaint to owner",
        },
         {
          path: "/dashboard/student/Announcement",
          icon: <BookOpen />,
          title: "Announcement",
          description: "Announcement",
        },
        {
          path: "/dashboard/student/learning",
          icon: <BookOpen />,
          title: "Learning Box",
          description: "Drop any link or video leacture here.",
        },
        {
          path: "/dashboard/student/profile",
          icon: <BookOpen />,
          title: "Projects Activity",
          description: "Manu Real-world projects for working",
        }
      ]
    }
  ];

  const handleItemClick = (path) => {
  };

  return (
    <>
      <style>{`
        .institutional-menu {
          width: 340px;
          height: 100vh;
          background: #f8fafc;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          overflow: hidden;
        }

        .institutional-header {
          padding: 24px;
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          border-bottom: 1px solid #334155;
          position: relative;
        }

        .institutional-header::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 24px;
          right: 24px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #64748b, transparent);
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .header-icon {
          width: 32px;
          height: 32px;
          color: #3b82f6;
          background: rgba(59, 130, 246, 0.1);
          padding: 6px;
          border-radius: 8px;
        }

        .header-title {
          font-size: 20px;
          font-weight: 700;
          color: white;
          margin: 0;
          letter-spacing: -0.025em;
        }

        .header-subtitle {
          font-size: 13px;
          color: #94a3b8;
          margin: 0;
          font-weight: 500;
        }

        .menu-content {
          flex: 1;
          padding: 0;
          overflow-y: auto;
          background: #f8fafc;
        }

        .menu-content::-webkit-scrollbar {
          width: 6px;
        }

        .menu-content::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        .menu-content::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .menu-section {
          margin-bottom: 8px;
        }

        .section-header {
          padding: 20px 24px 12px 24px;
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: #f1f5f9;
          border-bottom: 1px solid #e2e8f0;
          margin: 0;
        }

        .section-items {
          background: white;
          border-bottom: 1px solid #f1f5f9;
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: 16px 24px;
          text-decoration: none;
          color: #475569;
          transition: all 0.2s ease;
          border-left: 3px solid transparent;
          position: relative;
          cursor: pointer;
        }

        .nav-item:hover {
          background: #f8fafc;
          color: #1e293b;
          border-left-color: #e2e8f0;
        }

        .nav-item.active {
          background: #eff6ff;
          color: #1d4ed8;
          border-left-color: #3b82f6;
          font-weight: 600;
        }

        .nav-item.active::after {
          content: '';
          position: absolute;
          right: 24px;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 4px;
          background: #3b82f6;
          border-radius: 50%;
        }

        .nav-icon {
          width: 20px;
          height: 20px;
          margin-right: 16px;
          flex-shrink: 0;
        }

        .nav-content {
          flex: 1;
          min-width: 0;
        }

        .nav-title {
          font-size: 14px;
          font-weight: 500;
          margin: 0 0 2px 0;
          line-height: 1.4;
        }

        .nav-description {
          font-size: 12px;
          color: #64748b;
          margin: 0;
          line-height: 1.3;
        }

        .nav-item.active .nav-description {
          color: #3730a3;
        }

        .nav-arrow {
          width: 16px;
          height: 16px;
          color: #cbd5e1;
          transition: all 0.2s ease;
          opacity: 0;
        }

        .nav-item:hover .nav-arrow {
          opacity: 1;
          color: #64748b;
          transform: translateX(2px);
        }

        .nav-item.active .nav-arrow {
          opacity: 1;
          color: #3b82f6;
        }

        .footer-section {
          padding: 20px 24px;
          border-top: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .footer-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          color: #64748b;
          font-size: 13px;
          font-weight: 500;
        }

        .footer-icon {
          width: 18px;
          height: 18px;
        }

        @media (max-width: 768px) {
          .institutional-menu {
            width: 100%;
            height: auto;
            border-radius: 0;
            border-right: none;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .institutional-header {
            padding: 16px;
          }
          
          .section-header {
            padding: 16px 20px 8px 20px;
          }
          
          .nav-item {
            padding: 12px 20px;
          }
        }
      `}</style>

      <div className="institutional-menu">
        {/* Header */}
        <div className="institutional-header">
          <div className="header-content">
            <Building2 className="header-icon" />
            <div>
              <h2 className="header-title">Administration</h2>
              <p className="header-subtitle">System Management Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="menu-content">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="menu-section">
              <div className="section-header">
                {section.title}
              </div>
              <div className="section-items">
                {section.items.map((item, itemIndex) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `nav-item ${isActive ? 'active' : ''}`
                    }
                    onClick={() => handleItemClick(item.path)}
                  >
                    <div className="nav-icon">
                      {item.icon}
                    </div>
                    <div className="nav-content">
                      <div className="nav-title">{item.title}</div>
                      <div className="nav-description">{item.description}</div>
                    </div>
                    <ChevronRight className="nav-arrow" />
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="footer-section">
          <div className="footer-item">
            <Settings className="footer-icon" />
            <span>System Configuration</span>
          </div>
        </div>
      </div>

    </>
  );
};
export default StudentMenu;