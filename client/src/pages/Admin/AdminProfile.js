import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2, Mail, Phone, Menu, X,
  Users, Globe,
  BookOpen, Bell, Lock, Zap,
  ChevronRight, Activity, Shield, Settings,
  MailCheck, UserCheck,
  AlertTriangle, Database
} from 'lucide-react';
import AdminMenu from '../../components/Layout/AdminMenu';
import Header from '../../components/Layout/Header';
import { useAuth } from '../../context/auth';
import axios from 'axios';

// ─────────────────────────────────────────────
//  SECTION CONFIG — add new sections HERE only
// ─────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'email-reader',
    label: 'Email Reader',
    shortLabel: 'Reader',
    icon: Mail,
    color: '#4f8ef7',
    description: 'Control which hostel owners can read emails via StayOS',
    badge: null,
  },
  {
    id: 'student-controls',
    label: 'Student Controls',
    shortLabel: 'Students',
    icon: BookOpen,
    color: '#8b5cf6',
    description: 'Manage student-facing features and access permissions',
    badge: null,
  },
  {
    id: 'global-controls',
    label: 'Global Controls',
    shortLabel: 'Global',
    icon: Globe,
    color: '#ef4444',
    description: 'System-wide feature flags that affect all users and hostels',
    badge: 'ADMIN',
  },
];

// ─────────────────────────────────────────────
//  THEME
// ─────────────────────────────────────────────
const THEME = { primary: '#4f8ef7', background: '#0f172a', surface: '#1e293b', surfaceLight: '#334155', surfaceMid: '#253347', text: '#e2e8f0', textSecondary: '#94a3b8', border: '#2d3f55' };

const AVATAR_COLORS = ['#4f8ef7', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

// ─────────────────────────────────────────────
//  REUSABLE: Toggle Switch
// ─────────────────────────────────────────────
const ToggleSwitch = ({ checked, onChange, disabled, primaryColor }) => (
  <label style={{
    position: 'relative', width: 52, height: 28,
    flexShrink: 0, cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1, display: 'inline-block',
  }}>
    <input
      type="checkbox" checked={checked} onChange={onChange} disabled={disabled}
      style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
    />
    <div style={{
      position: 'absolute', inset: 0, borderRadius: 100,
      transition: 'background 0.3s, box-shadow 0.3s',
      background: checked ? primaryColor : 'rgba(255,255,255,0.1)',
      border: `1px solid ${checked ? primaryColor : 'rgba(255,255,255,0.15)'}`,
      boxShadow: checked ? `0 0 0 3px ${primaryColor}30` : 'none',
    }} />
    <div style={{
      position: 'absolute', top: 3, left: 3,
      width: 22, height: 22, borderRadius: '50%',
      background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
      transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      transform: checked ? 'translateX(24px)' : 'translateX(0)',
      pointerEvents: 'none',
    }} />
  </label>
);

// ─────────────────────────────────────────────
//  REUSABLE: User Toggle Row
// ─────────────────────────────────────────────
const ToggleRow = ({ user, index, isOn, isLoading, onToggle, primaryColor, theme }) => {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const initial = user.ownerId?.name?.[0]?.toUpperCase() || '?';
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '13px 15px', borderRadius: 13, marginBottom: 8,
        background: hovered ? `${theme.surfaceLight}88` : theme.surfaceMid,
        border: `1px solid ${hovered ? primaryColor + '55' : theme.border}`,
        transition: 'all 0.2s', gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: `linear-gradient(135deg, ${color}, ${color}88)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 800, color: '#fff',
        }}>{initial}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: theme.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user.ownerId?.name || 'Unknown'}
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: theme.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user.email}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {isLoading
          ? <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${primaryColor}`, borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
          : <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 600, color: isOn ? '#10b981' : theme.textSecondary, minWidth: 24, textAlign: 'right' }}>{isOn ? 'ON' : 'OFF'}</span>
        }
        <ToggleSwitch checked={isOn} onChange={() => onToggle(user.ownerId._id)} disabled={isLoading} primaryColor={primaryColor} />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  REUSABLE: Control Block
// ─────────────────────────────────────────────
const ControlBlock = ({ title, description, color, icon: Icon, rightSlot, children, theme }) => (
  <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 18, overflow: 'hidden', marginBottom: 18 }}>
    <div style={{
      padding: '16px 20px', borderBottom: `1px solid ${theme.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: `linear-gradient(135deg, ${color}08, transparent)`, gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
          <Icon size={17} />
        </div>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: theme.text }}>{title}</div>
          {description && <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 1 }}>{description}</div>}
        </div>
      </div>
      {rightSlot}
    </div>
    <div style={{ padding: '14px 16px' }}>{children}</div>
  </div>
);

// ─────────────────────────────────────────────
//  REUSABLE: Count Badge
// ─────────────────────────────────────────────
const CountBadge = ({ count, total, theme }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.surfaceLight, border: `1px solid ${theme.border}`, borderRadius: 20, padding: '4px 12px', flexShrink: 0 }}>
    <div style={{ width: 7, height: 7, borderRadius: '50%', background: count > 0 ? '#10b981' : theme.textSecondary }} />
    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 600, color: theme.text }}>{count}/{total}</span>
  </div>
);

// ─────────────────────────────────────────────
//  REUSABLE: Global Toggle Row
// ─────────────────────────────────────────────
const GlobalToggleRow = ({ icon: Icon, label, description, checked, onChange, color, theme, disabled }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '13px 15px', borderRadius: 13, marginBottom: 8,
        background: hovered ? `${theme.surfaceLight}88` : theme.surfaceMid,
        border: `1px solid ${hovered ? color + '55' : theme.border}`,
        transition: 'all 0.2s', gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
          <Icon size={15} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, fontFamily: "'DM Sans', sans-serif" }}>{label}</div>
          <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 1 }}>{description}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 600, color: checked ? '#10b981' : theme.textSecondary }}>{checked ? 'ON' : 'OFF'}</span>
        <ToggleSwitch checked={checked} onChange={onChange} primaryColor={color} disabled={disabled} />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  REUSABLE: Empty State
// ─────────────────────────────────────────────
const EmptyState = ({ icon: Icon, label, theme }) => (
  <div style={{ textAlign: 'center', padding: '36px 20px', color: theme.textSecondary }}>
    <Icon size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.3 }} />
    <div style={{ fontSize: 13 }}>{label}</div>
  </div>
);

// ─────────────────────────────────────────────
//  PANEL: Email Reader
// ─────────────────────────────────────────────
const EmailReaderPanel = ({ theme, section, emailUsers, togglingIds, onToggle }) => {
  const enabledCount = emailUsers.filter(u => u.emailReaderEnabled).length;
  return (
    <ControlBlock title="Email Reader Access" description="Grant or revoke IMAP/email reading per owner" color={section.color} icon={Mail} theme={theme}
      rightSlot={<CountBadge count={enabledCount} total={emailUsers.length} theme={theme} />}
    >
      {emailUsers.length === 0
        ? <EmptyState icon={Users} label="No users found" theme={theme} />
        : emailUsers.map((user, i) => (
          <ToggleRow key={user._id} user={user} index={i} isOn={!!user.emailReaderEnabled}
            isLoading={togglingIds.has(user.ownerId?._id)} onToggle={onToggle}
            primaryColor={section.color} theme={theme} />
        ))
      }
    </ControlBlock>
  );
};

// ─────────────────────────────────────────────
//  PANEL: Student Controls
// ─────────────────────────────────────────────
const StudentControlPanel = ({ theme, section, studentStates, onToggle, updatingControl }) => {
  const features = [
    { id: 'project',         icon: UserCheck,   label: 'project',       description: 'Students can check in without owner approval' },
    { id: 'view_invoice',    icon: BookOpen,    label: 'View Invoices',        description: 'Students can view and download their invoices' },
    { id: 'learning',        icon: Bell,        label: 'learning',     description: 'Students can submit complaint tickets' },
    { id: 'edit_profile',    icon: Settings,    label: 'Edit Profile',         description: 'Students can update their own profile info' },
    { id: 'doc_upload',      icon: Database,    label: 'Document Upload',      description: 'Students can upload ID or KYC documents' },
  ];
  const enabledCount = features.filter(f => studentStates[f.id]).length;
  return (
    <ControlBlock title="Student Feature Flags" description="Enable or disable student-facing features globally" color={section.color} icon={BookOpen} theme={theme}
      rightSlot={<CountBadge count={enabledCount} total={features.length} theme={theme} />}
    >
      {features.map(f => (
        <GlobalToggleRow key={f.id} icon={f.icon} label={f.label} description={f.description}
          checked={!!studentStates[f.id]} onChange={() => onToggle(f.id)} disabled={updatingControl === f.id}
          color={section.color} theme={theme} />
      ))}
    </ControlBlock>
  );
};

// ─────────────────────────────────────────────
//  PANEL: Global Controls
// ─────────────────────────────────────────────
const GlobalControlPanel = ({ theme, section, globalStates, setGlobalStates, onToggleMaintenance, updatingControl, globalEmailOn, globalEmailLoading, onToggleGlobalEmail }) => {
  const groups = [
    {
      title: 'System', icon: Zap,
      controls: [
        { id: 'maintenance_mode',  icon: AlertTriangle, label: 'Maintenance Mode',   description: 'Puts entire platform in read-only state',          color: '#ef4444' },
        { id: 'new_registrations', icon: UserCheck,     label: 'New Registrations',  description: 'Allow new hostel owners to register on StayOS',    color: '#10b981' },
        { id: 'api_access',        icon: Database,      label: 'API Access',          description: 'Enable external API access for all integrations',   color: '#4f8ef7' },
      ]
    }
  ];

  // Master switch colours flip based on state
  const masterColor = globalEmailOn ? '#10b981' : '#ef4444';

  return (
    <>
      {/* ── Global Email System — Master Switch ── */}
      <div style={{
        background: theme.surface,
        border: `1.5px solid ${masterColor}55`,
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: 18,
        boxShadow: `0 0 0 3px ${masterColor}10`,
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}>
        {/* Block header */}
        <div style={{
          padding: '16px 20px', borderBottom: `1px solid ${masterColor}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: `linear-gradient(135deg, ${masterColor}10, transparent)`, gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${masterColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: masterColor, flexShrink: 0 }}>
              <Mail size={17} />
            </div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: theme.text }}>
                Global Email System
              </div>
              <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 1 }}>
                Master switch — enables or disables ALL email functionality platform-wide
              </div>
            </div>
          </div>
          {/* Animated status pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: `${masterColor}18`, border: `1px solid ${masterColor}44`,
            borderRadius: 20, padding: '4px 12px', flexShrink: 0,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: masterColor, animation: globalEmailOn ? 'pulseDot 2s ease-in-out infinite' : 'none' }} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 700, color: masterColor, letterSpacing: '0.06em' }}>
              {globalEmailOn ? 'SYSTEM ON' : 'SYSTEM OFF'}
            </span>
          </div>
        </div>

        {/* Block body */}
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 1.6, flex: 1 }}>
            {globalEmailOn
              ? 'Email system is active. All hostel owners with email reader/sending permissions can access email features normally.'
              : 'Email system is disabled. No emails can be read or sent through StayOS regardless of individual owner permissions.'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {globalEmailLoading
              ? <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${masterColor}`, borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
              : <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 700, color: masterColor }}>{globalEmailOn ? 'ON' : 'OFF'}</span>
            }
            <ToggleSwitch checked={globalEmailOn} onChange={onToggleGlobalEmail} disabled={globalEmailLoading} primaryColor={masterColor} />
          </div>
        </div>
      </div>

      {/* ── Standard control groups ── */}
      {groups.map(group => (
        <ControlBlock key={group.title} title={group.title} color={section.color} icon={group.icon} theme={theme}>
          {group.controls.map(ctrl => (
            <GlobalToggleRow key={ctrl.id} icon={ctrl.icon} label={ctrl.label} description={ctrl.description}
              checked={!!globalStates[ctrl.id]} onChange={() => ctrl.id === 'maintenance_mode' ? onToggleMaintenance() : setGlobalStates(prev => ({ ...prev, [ctrl.id]: !prev[ctrl.id] }))} disabled={ctrl.id === 'maintenance_mode' && updatingControl === 'maintenance_mode'}
              color={ctrl.color} theme={theme} />
          ))}
        </ControlBlock>
      ))}
    </>
  );
};

// ─────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────
const AdminProfile = () => {
  const [auth] = useAuth();
  const [sidebarOpen, setSidebarOpen]           = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection]       = useState(SECTIONS[0].id);

  // ── Per-section states ──
  const [emailUsers, setEmailUsers]       = useState([]);
  const [togglingIds, setTogglingIds]     = useState(new Set());
  const [studentStates, setStudentStates] = useState({ project: true, view_invoice: true, learning: true, edit_profile: true, doc_upload: true });
  const [globalStates, setGlobalStates]   = useState({ maintenance_mode: false, new_registrations: true, api_access: true });
  const [globalEmailOn, setGlobalEmailOn]         = useState(false);
  const [globalEmailLoading, setGlobalEmailLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [updatingControl, setUpdatingControl]   = useState(null);

  const theme = THEME;
  const section = SECTIONS.find(s => s.id === activeSection);

  // ── API ──
  // ── Fetch settings from backend on mount ──
  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const { data } = await axios.get('http://localhost:8083/api/v1/settings');
      if (data.success && data.data) {
        const d = data.data;
        setStudentStates({
          project:      true,
          view_invoice: d.studentControls?.view_invoice          ?? true,
          learning:     d.learningControls?.access_courses       ?? true,
          edit_profile: d.studentControls?.edit_profile          ?? true,
          doc_upload:   true,
        });
        setGlobalStates(prev => ({
          ...prev,
          maintenance_mode: d.maintenanceMode ?? false,
        }));
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  // ── Toggle a student control and call backend ──
  const toggleStudentControl = async (controlId) => {
    const endpointMap = {
      view_invoice: '/api/v1/settings/toggle-view-invoice',
      learning:     '/api/v1/settings/toggle-learning-access',
      edit_profile: '/api/v1/settings/toggle-edit-profile',
    };
    const endpoint = endpointMap[controlId];
    if (!endpoint) {
      setStudentStates(prev => ({ ...prev, [controlId]: !prev[controlId] }));
      return;
    }
    setUpdatingControl(controlId);
    try {
      await axios.put('http://localhost:8083' + endpoint);
      setStudentStates(prev => ({ ...prev, [controlId]: !prev[controlId] }));
    } catch (err) {
      console.error('Failed to toggle', controlId, err);
    } finally {
      setUpdatingControl(null);
    }
  };

  // ── Toggle maintenance mode ──
  const toggleMaintenanceMode = async () => {
    setUpdatingControl('maintenance_mode');
    try {
      const { data } = await axios.put('http://localhost:8083/api/v1/settings/maintenance-mode');
      setGlobalStates(prev => ({ ...prev, maintenance_mode: data.maintenanceMode }));
    } catch (err) {
      console.error('Failed to toggle maintenance mode:', err);
      setGlobalStates(prev => ({ ...prev, maintenance_mode: !prev.maintenance_mode }));
    } finally {
      setUpdatingControl(null);
    }
  };

  const toggleGlobalEmail = async () => {
    setGlobalEmailLoading(true);
    try {
      const res = await axios.post('http://localhost:8083/api/v1/admin/toggle-global-email');
      setGlobalEmailOn(res.data.status);
    } catch {
      setGlobalEmailOn(prev => !prev); // optimistic fallback
    } finally {
      setGlobalEmailLoading(false);
    }
  };

  const getEmailUsers = useCallback(async () => {
    try {
      const { data } = await axios.get('http://localhost:8083/api/v1/admin/owner-emails');
      if (data.success) setEmailUsers(data.data);
    } catch {
      setEmailUsers([]);
    }
  }, []);

  const toggleEmailReader = async (ownerId) => {
    setTogglingIds(prev => new Set([...prev, ownerId]));
    try {
      await axios.post('http://localhost:8083/api/v1/admin/toggle-email-reader', { ownerId });
      await getEmailUsers();
    } catch {
      setEmailUsers(prev => prev.map(u => u.ownerId?._id === ownerId ? { ...u, emailReaderEnabled: !u.emailReaderEnabled } : u));
    } finally {
      setTogglingIds(prev => { const s = new Set(prev); s.delete(ownerId); return s; });
    }
  };

  useEffect(() => {
    getEmailUsers();
  }, [getEmailUsers]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const renderPanel = () => {
    switch (activeSection) {
      case 'email-reader':     return <EmailReaderPanel    theme={theme} section={section} emailUsers={emailUsers} togglingIds={togglingIds} onToggle={toggleEmailReader} />;
      case 'student-controls': return <StudentControlPanel theme={theme} section={section} studentStates={studentStates} onToggle={toggleStudentControl} updatingControl={updatingControl} />;
      case 'global-controls':  return <GlobalControlPanel  theme={theme} section={section} globalStates={globalStates} setGlobalStates={setGlobalStates} onToggleMaintenance={toggleMaintenanceMode} updatingControl={updatingControl} globalEmailOn={globalEmailOn} globalEmailLoading={globalEmailLoading} onToggleGlobalEmail={toggleGlobalEmail} />;
      default: return null;
    }
  };

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulseDot{ 0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.5;transform:scale(0.8);} }

        .ap-root   { display:flex; min-height:100vh; background:${theme.background}; font-family:'DM Sans',sans-serif; position:relative; }
        .ap-sidebar{ flex-shrink:0; position:fixed; left:0; top:0; height:100vh; z-index:1000; transition:transform 0.3s ease; }
        .ap-main   { flex:1; margin-left:${sidebarOpen ? '280px' : '70px'}; transition:margin-left 0.3s ease; min-height:100vh; display:flex; flex-direction:column; }
        .ap-content{ padding:28px 28px 60px; flex:1; }

        /* Hero */
        .ap-hero { position:relative; overflow:hidden; background:linear-gradient(135deg,${theme.surface} 0%,${theme.background} 100%); border:1px solid ${theme.border}; border-radius:20px; padding:28px 32px; margin-bottom:22px; display:flex; align-items:center; gap:22px; }
        .ap-hero::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at top right,${theme.primary}20 0%,transparent 65%); pointer-events:none; }
        .ap-hero-orb { position:absolute; right:-60px; top:-60px; width:240px; height:240px; background:radial-gradient(circle,${theme.primary}14,transparent 70%); border-radius:50%; pointer-events:none; }
        .ap-hero-avatar { width:66px; height:66px; border-radius:18px; background:linear-gradient(135deg,${theme.primary},${theme.primary}88); display:flex; align-items:center; justify-content:center; color:#fff; flex-shrink:0; box-shadow:0 8px 24px ${theme.primary}44; position:relative; z-index:1; }
        .ap-hero-body { flex:1; position:relative; z-index:1; }
        .ap-hero-eyebrow { font-family:'DM Mono',monospace; font-size:10px; letter-spacing:0.18em; text-transform:uppercase; color:${theme.primary}; margin-bottom:5px; }
        .ap-hero-title { font-family:'Syne',sans-serif; font-size:25px; font-weight:800; color:${theme.text}; line-height:1.1; margin-bottom:5px; }
        .ap-hero-sub { font-size:13px; color:${theme.textSecondary}; margin-bottom:12px; }
        .ap-pill { display:inline-flex; align-items:center; gap:6px; background:${theme.primary}1a; border:1px solid ${theme.primary}44; color:${theme.primary}; padding:4px 12px; border-radius:100px; font-size:10px; font-weight:600; font-family:'DM Mono',monospace; letter-spacing:0.08em; text-transform:uppercase; }
        .ap-pill-dot { width:6px; height:6px; background:${theme.primary}; border-radius:50%; animation:pulseDot 2s ease-in-out infinite; }

        /* Stats */
        .ap-stats { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; margin-bottom:24px; }
        .ap-stat  { background:${theme.surface}; border:1px solid ${theme.border}; border-radius:16px; padding:20px; position:relative; overflow:hidden; transition:transform 0.2s,box-shadow 0.2s; }
        .ap-stat:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(0,0,0,0.25); }
        .ap-stat-line { position:absolute; bottom:0; left:0; height:2px; width:100%; }
        .ap-stat-top  { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:15px; }
        .ap-stat-icon { width:40px; height:40px; border-radius:11px; display:flex; align-items:center; justify-content:center; }
        .ap-stat-tag  { font-family:'DM Mono',monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:${theme.textSecondary}; background:${theme.surfaceLight}; padding:3px 9px; border-radius:6px; }
        .ap-stat-label{ font-size:11px; font-weight:500; color:${theme.textSecondary}; margin-bottom:4px; text-transform:uppercase; letter-spacing:0.06em; }
        .ap-stat-value{ font-family:'DM Mono',monospace; font-size:14px; font-weight:500; color:${theme.text}; word-break:break-all; }

        /* Layout */
        .ap-controls-layout { display:grid; grid-template-columns:210px 1fr; gap:18px; align-items:start; }

        /* Section Nav */
        .ap-section-nav { background:${theme.surface}; border:1px solid ${theme.border}; border-radius:18px; overflow:hidden; position:sticky; top:20px; }
        .ap-nav-header  { padding:14px 16px; border-bottom:1px solid ${theme.border}; }
        .ap-nav-label   { font-family:'DM Mono',monospace; font-size:9px; letter-spacing:0.18em; text-transform:uppercase; color:${theme.textSecondary}; }
        .ap-nav-list    { padding:8px; display:flex; flex-direction:column; gap:2px; }
        .ap-nav-item    { display:flex; align-items:center; gap:9px; padding:9px 11px; border-radius:11px; cursor:pointer; transition:all 0.18s; border:1px solid transparent; }
        .ap-nav-item:hover:not(.ap-nav-item-active){ background:${theme.surfaceLight}55; }
        .ap-nav-icon    { width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:background 0.18s; }
        .ap-nav-name    { font-size:12px; font-weight:600; transition:color 0.18s; flex:1; font-family:'DM Sans',sans-serif; }
        .ap-nav-badge   { font-family:'DM Mono',monospace; font-size:8px; font-weight:700; padding:2px 5px; border-radius:4px; letter-spacing:0.05em; }
        .ap-nav-arrow   { opacity:0; transition:opacity 0.18s; flex-shrink:0; }
        .ap-nav-item-active .ap-nav-arrow { opacity:1; }

        /* Panel */
        .ap-panel       { animation:fadeIn 0.22s ease both; }
        .ap-panel-header{ margin-bottom:18px; display:flex; align-items:center; gap:12px; }
        .ap-panel-dot   { width:9px; height:9px; border-radius:50%; flex-shrink:0; }
        .ap-panel-title { font-family:'Syne',sans-serif; font-size:19px; font-weight:800; color:${theme.text}; }
        .ap-panel-desc  { font-size:12px; color:${theme.textSecondary}; margin-top:2px; }

        /* Mobile tabs */
        .ap-mobile-tabs { display:none; overflow-x:auto; gap:8px; padding-bottom:4px; margin-bottom:16px; scrollbar-width:none; }
        .ap-mobile-tabs::-webkit-scrollbar { display:none; }
        .ap-mobile-tab  { flex-shrink:0; display:flex; align-items:center; gap:6px; padding:7px 13px; border-radius:30px; cursor:pointer; border:1px solid ${theme.border}; background:${theme.surface}; transition:all 0.18s; white-space:nowrap; }

        /* FAB */
        .ap-fab { position:fixed; bottom:24px; right:24px; z-index:1003; background:rgba(255,255,255,0.95); border:2px solid #e2e8f0; border-radius:50px; padding:12px 16px; cursor:pointer; box-shadow:0 8px 25px rgba(0,0,0,0.15); color:#374151; font-weight:600; font-size:14px; display:none; align-items:center; gap:8px; transition:all 0.2s; }
        .ap-fab:hover{ transform:translateY(-2px); box-shadow:0 10px 30px rgba(0,0,0,0.2); }
        .ap-overlay   { position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:999; backdrop-filter:blur(2px); display:${isMobileMenuOpen ? 'block' : 'none'}; }

        @media (max-width:1024px) {
          .ap-fab     { display:flex !important; }
          .ap-sidebar { transform:${isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)'}; }
          .ap-main    { margin-left:0 !important; }
        }
        @media (min-width:1025px){
          .ap-fab     { display:none !important; }
          .ap-sidebar { transform:translateX(0) !important; }
        }
        @media (max-width:860px){
          .ap-controls-layout { grid-template-columns:1fr; }
          .ap-section-nav     { display:none; }
          .ap-mobile-tabs     { display:flex !important; }
        }
        @media (max-width:640px){
          .ap-content    { padding:16px 14px 80px; }
          .ap-hero       { flex-direction:column; text-align:center; padding:22px 18px; }
          .ap-hero-avatar{ margin:0 auto; }
          .ap-hero-title { font-size:21px; }
          .ap-stats      { gap:10px; }
          .ap-stat       { padding:15px 13px; }
          .ap-stat-value { font-size:12px; }
        }
      `}</style>

      <div className="ap-root">
        {/* FAB */}
        <button className="ap-fab" onClick={() => setIsMobileMenuOpen(p => !p)}>
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {isMobileMenuOpen ? 'Close' : 'Menu'}
          </span>
        </button>
        <div className="ap-overlay" onClick={() => setIsMobileMenuOpen(false)} />

        {/* Sidebar */}
        <div className="ap-sidebar">
          <AdminMenu sidebarOpen={sidebarOpen} />
        </div>

        <div className="ap-main">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          <div className="ap-content">

            {/* ── Hero ── */}
            <div className="ap-hero">
              <div className="ap-hero-orb" />
              <div className="ap-hero-avatar"><Building2 size={30} /></div>
              <div className="ap-hero-body">
                <div className="ap-hero-eyebrow">StayOS · Admin Portal</div>
                <h1 className="ap-hero-title">Welcome back, {auth?.user?.name || 'Admin'}</h1>
                <p className="ap-hero-sub">Full system access — manage features, users &amp; controls</p>
                <div className="ap-pill"><span className="ap-pill-dot" />System Active</div>
              </div>
            </div>

            {/* ── Stats ── */}
            <div className="ap-stats">
              {[
                { label: 'Email Address', value: auth?.user?.email || 'admin@stayos.in', icon: Mail,  color: theme.primary, tag: 'Contact' },
                { label: 'Phone Number',  value: auth?.user?.phone || '+91 9999999999',  icon: Phone, color: '#10b981',     tag: 'Communication' },
              ].map(s => (
                <div className="ap-stat" key={s.label}>
                  <div className="ap-stat-line" style={{ background: `linear-gradient(90deg,${s.color},transparent)` }} />
                  <div className="ap-stat-top">
                    <div className="ap-stat-icon" style={{ background: `${s.color}22`, color: s.color }}><s.icon size={19} /></div>
                    <span className="ap-stat-tag">{s.tag}</span>
                  </div>
                  <div className="ap-stat-label">{s.label}</div>
                  <div className="ap-stat-value">{s.value}</div>
                </div>
              ))}
            </div>

            {/* ── Mobile Tabs ── */}
            <div className="ap-mobile-tabs">
              {SECTIONS.map(s => {
                const isActive = activeSection === s.id;
                return (
                  <div key={s.id} className="ap-mobile-tab"
                    style={{ borderColor: isActive ? s.color : theme.border, background: isActive ? `${s.color}18` : theme.surface }}
                    onClick={() => setActiveSection(s.id)}>
                    <s.icon size={13} style={{ color: isActive ? s.color : theme.textSecondary }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: isActive ? s.color : theme.textSecondary }}>{s.shortLabel}</span>
                  </div>
                );
              })}
            </div>

            {/* ── Controls Layout ── */}
            <div className="ap-controls-layout">

              {/* Left Nav */}
              <div className="ap-section-nav">
                <div className="ap-nav-header">
                  <div className="ap-nav-label">Control Panels</div>
                </div>
                <div className="ap-nav-list">
                  {SECTIONS.map(s => {
                    const isActive = activeSection === s.id;
                    return (
                      <div key={s.id}
                        className={`ap-nav-item ${isActive ? 'ap-nav-item-active' : ''}`}
                        style={{ borderColor: isActive ? `${s.color}44` : 'transparent', background: isActive ? `${s.color}14` : 'transparent' }}
                        onClick={() => setActiveSection(s.id)}
                      >
                        <div className="ap-nav-icon" style={{ background: isActive ? `${s.color}22` : `${theme.surfaceLight}88`, color: isActive ? s.color : theme.textSecondary }}>
                          <s.icon size={15} />
                        </div>
                        <span className="ap-nav-name" style={{ color: isActive ? s.color : theme.textSecondary }}>{s.label}</span>
                        {s.badge && <span className="ap-nav-badge" style={{ background: `${s.color}22`, color: s.color }}>{s.badge}</span>}
                        <ChevronRight size={13} className="ap-nav-arrow" style={{ color: s.color }} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Panel */}
              <div key={activeSection} className="ap-panel">
                <div className="ap-panel-header">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="ap-panel-dot" style={{ background: section.color }} />
                      <div className="ap-panel-title">{section.label}</div>
                    </div>
                    <div className="ap-panel-desc">{section.description}</div>
                  </div>
                </div>
                {renderPanel()}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;