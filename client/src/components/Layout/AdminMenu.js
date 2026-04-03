import React from 'react';
import {
  ChevronRight,
  Building2,
  LayoutDashboard,
  UserPlus,
  Users,
  BarChart3,
  Settings
} from 'lucide-react';

const AdminMenu = ({ currentTheme = 'default', sidebarOpen = true }) => {
  const themes = {
    default: {
      primary: '#3b82f6',
      surface: '#1e293b',
      surfaceLight: '#334155',
      text: '#e2e8f0',
      textSecondary: '#94a3b8',
      border: '#334155'
    },
    ocean: {
      primary: '#06b6d4',
      surface: '#164e63',
      surfaceLight: '#155e75',
      text: '#e0f2fe',
      textSecondary: '#67e8f9',
      border: '#0e7490'
    },
    sunset: {
      primary: '#f59e0b',
      surface: '#451a03',
      surfaceLight: '#78350f',
      text: '#fef3c7',
      textSecondary: '#fcd34d',
      border: '#92400e'
    },
    forest: {
      primary: '#10b981',
      surface: '#064e3b',
      surfaceLight: '#065f46',
      text: '#d1fae5',
      textSecondary: '#6ee7b7',
      border: '#047857'
    },
    purple: {
      primary: '#8b5cf6',
      surface: '#2e1065',
      surfaceLight: '#4c1d95',
      text: '#f3e8ff',
      textSecondary: '#c4b5fd',
      border: '#6d28d9'
    },
    
  };

  const theme = themes[currentTheme];

  const menuSections = [
    {
      items: [
        {
          path: "/dashboard/admin",
          icon: <LayoutDashboard size={18} />,
          title: "Dashboard",
          description: "System overview & stats",
          active: true
        }
      ]
    },
    {
      title: "Owner Management",
      items: [
        {
          path: "/dashboard/admin/create-owner",
          icon: <UserPlus size={18} />,
          title: "Create Owner / Detail's",
          description: "Onboard new hostel owners"
        },
        {
          path: "/dashboard/admin/allstudents",
          icon: <Users size={18} />,
          title: "All Students / Detail's",
          description: "View and Detail all registered students"
        }
      ]
    },
    {
      title: "Hostel Monitoring",
      items: [
        {
          path: "/dashboard/admin/allhostels",
          icon: <Building2 size={18} />,
          title: "All Hostels",
          description: "View all registered hostels"
        },
        {
          path: "/dashboard/admin/emailset",
          icon: <Building2 size={18} />,
          title: "Email Setting",
          description: "Set emails of hostels"
        }
      ]
    },
    {
      title: "System",
      items: [
        {
          path: "/dashboard/admin/reports",
          icon: <BarChart3 size={18} />,
          title: "Report Section",
          description: "Skills filled by students"
        },
        {
          path: "/dashboard/admin/system-settings",
          icon: <Settings size={18} />,
          title: "Settings",
          description: "Platform configuration"
        },
        {
          path: "/dashboard/admin/system-report",
          icon: <Settings size={18} />,
          title: "System Report",
          description: "Platform configuration"
        }
      ]
    }
  ];

  const styles = {
    sidebar: {
      width: sidebarOpen ? '280px' : '70px',
      backgroundColor: theme.surface,
      padding: '20px 0',
      transition: 'all 0.3s ease',
      overflowY: 'auto',
      height: '100vh',
      borderRight: `1px solid ${theme.border}`
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      marginBottom: '30px',
      gap: '12px'
    },
    logoIcon: {
      width: '40px',
      height: '40px',
      backgroundColor: theme.primary,
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    logoContent: {
      display: sidebarOpen ? 'block' : 'none'
    },
    logoText: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: theme.text
    },
    logoSubtitle: {
      fontSize: '11px',
      color: theme.textSecondary,
      marginTop: '4px'
    },
    sectionHeader: {
      padding: '20px 20px 12px',
      fontSize: '11px',
      fontWeight: '700',
      color: theme.textSecondary,
      textTransform: 'uppercase',
      display: sidebarOpen ? 'block' : 'none'
    },
    menuItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 20px',
      textDecoration: 'none',
      color: theme.textSecondary,
      cursor: 'pointer',
      borderLeft: '3px solid transparent'
    },
    menuItemActive: {
      backgroundColor: theme.surfaceLight,
      color: theme.text,
      borderLeftColor: theme.primary
    },
    menuContent: {
      display: 'flex',
      gap: '12px',
      alignItems: sidebarOpen ? 'flex-start' : 'center'
    },
    menuText: {
      display: sidebarOpen ? 'flex' : 'none',
      flexDirection: 'column'
    },
    chevron: {
      display: sidebarOpen ? 'block' : 'none'
    }
  };

  return (
    <>
      {/* HIDE SCROLLBAR BUT KEEP SCROLL */}
      <style>{`
        .admin-sidebar::-webkit-scrollbar {
          width: 0px;
          height: 0px;
        }
        .admin-sidebar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>

      <div style={styles.sidebar} className="admin-sidebar">
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <Building2 size={22} color="#fff" />
          </div>
          <div style={styles.logoContent}>
            <div style={styles.logoText}>Admin Panel</div>
            <div style={styles.logoSubtitle}>Hostel SaaS Management</div>
          </div>
        </div>

        {menuSections.map((section, sIdx) => (
          <div key={sIdx}>
            {section.title && (
            <div style={styles.sectionHeader}>{section.title}</div>
            )}
            {section.items.map((item, iIdx) => (
              <a
                key={iIdx}
                href={item.path}
                style={{
                  ...styles.menuItem,
                  ...(item.active ? styles.menuItemActive : {})
                }}
              >
                <div style={styles.menuContent}>
                  {item.icon}
                  <div style={styles.menuText}>
                    <div>{item.title}</div>
                    <small>{item.description}</small>
                  </div>
                </div>
                <div style={styles.chevron}>
                  <ChevronRight size={16} />
                </div>
              </a>
            ))}
          </div>
        ))}
      </div>
    </>
  );
};

export default AdminMenu;
