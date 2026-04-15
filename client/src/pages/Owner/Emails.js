import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Layout from "../../components/Layout/Layout";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  :root {
    --bg:            #f5f4f1;
    --surface:       #ffffff;
    --surface-2:     #faf9f7;
    --surface-3:     #f0ede8;
    --border:        #e8e4de;
    --border-strong: #d4cfc8;
    --text-primary:  #1a1714;
    --text-secondary:#5a5550;
    --text-muted:    #9c9790;
    --accent:        #f97316;
    --accent-light:  rgba(249,115,22,0.08);
    --accent-mid:    rgba(249,115,22,0.15);
    --accent-border: rgba(249,115,22,0.3);
    --green:         #16a34a;
    --green-light:   rgba(22,163,74,0.08);
    --green-border:  rgba(22,163,74,0.25);
    --red:           #dc2626;
    --shadow-sm:     0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --shadow-md:     0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
    --shadow-lg:     0 10px 30px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.05);
    --font-serif:    'Playfair Display', Georgia, serif;
    --font-sans:     'DM Sans', sans-serif;
    --font-mono:     'DM Mono', monospace;
    --radius:        12px;
    --radius-sm:     8px;
  }

  * { box-sizing: border-box; }

  .inbox-root {
    min-height: 100vh;
    background: var(--bg);
    font-family: var(--font-sans);
    padding-bottom: 80px;
  }

  /* TOP BAR */
  .inbox-topbar {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 0 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    height: 62px;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: var(--shadow-sm);
  }

  .inbox-brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .inbox-brand-icon {
    width: 32px;
    height: 32px;
    background: var(--accent);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    flex-shrink: 0;
  }

  .inbox-brand-name {
    font-family: var(--font-serif);
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.01em;
  }

  .topbar-refresh-btn {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    transition: all 0.18s;
    font-size: 16px;
  }
  .topbar-refresh-btn:hover {
    background: var(--surface-3);
    border-color: var(--border-strong);
    color: var(--text-primary);
  }
  .topbar-refresh-btn.spinning { animation: spin 0.7s linear; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* PAGE HEADER */
  .inbox-header {
    padding: 36px 40px 0;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  .inbox-header-left { display: flex; flex-direction: column; gap: 4px; }

  .inbox-eyebrow {
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--accent);
    font-weight: 500;
  }

  .inbox-title {
    font-family: var(--font-serif);
    font-size: clamp(28px, 4vw, 40px);
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.03em;
    line-height: 1.05;
    margin: 0;
  }

  .inbox-subtitle {
    font-size: 13.5px;
    color: var(--text-muted);
    font-weight: 400;
    margin-top: 2px;
  }

  .inbox-stats {
    align-self: flex-end;
    padding-bottom: 4px;
  }

  .stat-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 100px;
    font-family: var(--font-mono);
    font-size: 11.5px;
    font-weight: 500;
    border: 1px solid var(--accent-border);
    background: var(--accent-light);
    color: var(--accent);
  }

  .stat-pill-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: var(--accent);
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:0.4; transform:scale(0.7); }
  }

  /* DIVIDER */
  .inbox-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--border) 15%, var(--border) 85%, transparent);
    margin: 26px 40px;
  }

  /* TOOLBAR */
  .inbox-toolbar {
    padding: 0 40px 22px;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .inbox-search-wrap {
    flex: 1;
    min-width: 220px;
    position: relative;
  }

  .inbox-search-icon {
    position: absolute;
    left: 13px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    pointer-events: none;
    font-size: 15px;
  }

  .inbox-search {
    width: 100%;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 10px 13px 10px 38px;
    font-family: var(--font-sans);
    font-size: 13.5px;
    color: var(--text-primary);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-shadow: var(--shadow-sm);
  }

  .inbox-search::placeholder { color: var(--text-muted); }

  .inbox-search:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-light);
  }

  .filter-btn {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 10px 15px;
    font-family: var(--font-mono);
    font-size: 11.5px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.18s;
    white-space: nowrap;
    box-shadow: var(--shadow-sm);
    font-weight: 500;
  }

  .filter-btn:hover { border-color: var(--border-strong); color: var(--text-primary); background: var(--surface-2); }
  .filter-btn.active { background: var(--accent); border-color: var(--accent); color: #fff; box-shadow: 0 2px 8px rgba(249,115,22,0.28); }

  /* EMAIL LIST */
  .inbox-list {
    padding: 0 40px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* EMAIL CARD */
  .email-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    transition: box-shadow 0.2s, border-color 0.2s, transform 0.15s;
    animation: fadeUp 0.35s ease both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .email-card:hover { box-shadow: var(--shadow-md); border-color: var(--border-strong); transform: translateY(-1px); }
  .email-card.is-open { border-color: var(--accent-border); box-shadow: var(--shadow-md); }

  /* CARD HEADER */
  .email-card-header {
    padding: 18px 22px;
    cursor: pointer;
    display: flex;
    align-items: flex-start;
    gap: 14px;
    transition: background 0.15s;
    user-select: none;
  }

  .email-card-header:hover { background: var(--surface-2); }
  .email-card.is-open .email-card-header {
    background: var(--surface-2);
    border-bottom: 1px solid var(--border);
  }

  .email-avatar {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-serif);
    font-weight: 700;
    font-size: 14px;
    flex-shrink: 0;
    color: #fff;
    letter-spacing: 0;
  }

  .email-meta { flex: 1; min-width: 0; }

  .email-row1 {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 3px;
  }

  .email-subject {
    font-size: 14.5px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.015em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }

  .email-time {
    font-family: var(--font-mono);
    font-size: 10.5px;
    color: var(--text-muted);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .email-from {
    font-family: var(--font-mono);
    font-size: 11.5px;
    color: var(--accent);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 5px;
  }

  .email-preview {
    font-size: 13px;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.5;
  }

  .email-chevron {
    flex-shrink: 0;
    color: var(--text-muted);
    font-size: 10px;
    transition: transform 0.22s ease;
    margin-top: 5px;
  }
  .email-card.is-open .email-chevron { transform: rotate(180deg); color: var(--accent); }

  /* EXPANDED BODY */
  .email-body-wrap {
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .email-body-wrap.open { max-height: 1400px; }

  .email-body-inner {
    padding: 22px 24px 18px 76px;
    border-bottom: 1px solid var(--border);
  }

  .email-meta-row {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 16px;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-muted);
  }

  .email-meta-row strong { color: var(--text-secondary); font-weight: 500; }

  .email-meta-divider { color: var(--border-strong); }

  .email-message {
    font-size: 14.5px;
    color: var(--text-secondary);
    line-height: 1.8;
    white-space: pre-wrap;
    word-break: break-word;
  }

  /* CARD ACTIONS */
  .email-actions {
    padding: 13px 24px 13px 76px;
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--surface-2);
    border-bottom: 1px solid transparent;
    flex-wrap: wrap;
    transition: border-color 0.2s;
  }
  .email-actions.reply-open { border-bottom-color: var(--border); }

  .action-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: var(--radius-sm);
    border: 1px solid;
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.18s;
    line-height: 1;
  }

  .action-btn.reply-active,
  .action-btn.reply {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
    box-shadow: 0 2px 6px rgba(249,115,22,0.25);
  }
  .action-btn.reply:hover {
    background: #ea6d0e;
    border-color: #ea6d0e;
    box-shadow: 0 4px 12px rgba(249,115,22,0.35);
    transform: translateY(-1px);
  }

  .action-btn.secondary {
    background: var(--surface);
    border-color: var(--border);
    color: var(--text-secondary);
  }
  .action-btn.secondary:hover {
    background: var(--surface-3);
    border-color: var(--border-strong);
    color: var(--text-primary);
  }

  .email-received-date {
    margin-left: auto;
    font-family: var(--font-mono);
    font-size: 10.5px;
    color: var(--text-muted);
    white-space: nowrap;
  }

  /* REPLY PANEL */
  .reply-panel {
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.32s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .reply-panel.open { max-height: 480px; }

  .reply-inner {
    padding: 20px 24px 22px 76px;
    display: flex;
    flex-direction: column;
    gap: 11px;
    background: var(--surface);
    animation: fadeUp 0.22s ease;
  }

  .reply-heading {
    font-family: var(--font-mono);
    font-size: 10.5px;
    text-transform: uppercase;
    letter-spacing: 0.13em;
    color: var(--accent);
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 1px;
  }

  .reply-heading::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .reply-field-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .reply-field-label {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-muted);
    width: 32px;
    flex-shrink: 0;
  }

  .reply-field-value {
    flex: 1;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-secondary);
    background: var(--surface-3);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 7px 12px;
    font-weight: 400;
  }

  .reply-textarea {
    width: 100%;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 13px 15px;
    font-family: var(--font-sans);
    font-size: 13.5px;
    color: var(--text-primary);
    line-height: 1.65;
    resize: vertical;
    min-height: 108px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .reply-textarea::placeholder { color: var(--text-muted); }

  .reply-textarea:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-light);
  }

  .reply-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
  }

  .reply-char {
    font-family: var(--font-mono);
    font-size: 10.5px;
    color: var(--text-muted);
  }

  .reply-btns { display: flex; gap: 8px; align-items: center; }

  .send-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: var(--accent);
    border: none;
    border-radius: var(--radius-sm);
    padding: 10px 20px;
    font-family: var(--font-sans);
    font-size: 13.5px;
    font-weight: 600;
    color: #fff;
    cursor: pointer;
    transition: all 0.18s;
    box-shadow: 0 2px 8px rgba(249,115,22,0.28);
  }
  .send-btn:hover:not(:disabled) {
    background: #ea6d0e;
    box-shadow: 0 4px 14px rgba(249,115,22,0.4);
    transform: translateY(-1px);
  }
  .send-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .discard-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 10px 14px;
    font-family: var(--font-sans);
    font-size: 13px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.18s;
  }
  .discard-btn:hover { background: #fef2f2; color: var(--red); border-color: rgba(220,38,38,0.3); }

  /* TOAST */
  .toast-container {
    position: fixed;
    bottom: 26px;
    right: 26px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: none;
  }

  .toast {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 13px 18px;
    border-radius: var(--radius-sm);
    font-family: var(--font-sans);
    font-size: 13.5px;
    font-weight: 500;
    box-shadow: var(--shadow-lg);
    animation: toastIn 0.28s ease both;
    border: 1px solid;
    max-width: 320px;
    background: var(--surface);
  }

  .toast-icon {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    flex-shrink: 0;
    font-weight: 700;
  }

  .toast.success { border-color: var(--green-border); color: var(--green); }
  .toast.success .toast-icon { background: var(--green-light); color: var(--green); }
  .toast.error { border-color: rgba(220,38,38,0.25); color: var(--red); }
  .toast.error .toast-icon { background: #fef2f2; color: var(--red); }

  @keyframes toastIn {
    from { opacity: 0; transform: translateY(10px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* EMPTY STATE */
  .inbox-empty {
    text-align: center;
    padding: 80px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .inbox-empty-icon {
    width: 76px;
    height: 76px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    box-shadow: var(--shadow-sm);
    margin-bottom: 4px;
  }

  .inbox-empty-title {
    font-family: var(--font-serif);
    font-size: 22px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.02em;
  }

  .inbox-empty-sub {
    font-size: 13.5px;
    color: var(--text-muted);
    max-width: 260px;
    line-height: 1.6;
  }

  /* SKELETON */
  .skeleton-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px 22px;
    display: flex;
    gap: 14px;
    box-shadow: var(--shadow-sm);
  }

  .skel {
    border-radius: 6px;
    background: linear-gradient(90deg, var(--surface-3) 25%, var(--border) 50%, var(--surface-3) 75%);
    background-size: 200% 100%;
    animation: skel-wave 1.6s ease-in-out infinite;
  }
  @keyframes skel-wave {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .skel-avatar { width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0; }
  .skel-lines  { flex: 1; display: flex; flex-direction: column; gap: 9px; padding-top: 3px; }
  .skel-line   { height: 11px; }

  /* RESPONSIVE */
  @media (max-width: 768px) {
    .inbox-topbar    { padding: 0 18px; }
    .inbox-header    { padding: 26px 18px 0; }
    .inbox-divider   { margin: 22px 18px; }
    .inbox-toolbar   { padding: 0 18px 18px; }
    .inbox-list      { padding: 0 18px; }
    .email-card-header { padding: 15px 16px; gap: 11px; }
    .email-body-inner  { padding: 16px 16px; }
    .email-actions     { padding: 12px 16px; }
    .reply-inner       { padding: 16px 16px; }
    .email-avatar      { width: 36px; height: 36px; border-radius: 9px; font-size: 13px; }
    .email-received-date { display: none; }
  }

  @media (max-width: 480px) {
    .inbox-brand-name { display: none; }
    .inbox-title      { font-size: 28px; }
    .email-row1       { flex-direction: column; align-items: flex-start; gap: 1px; }
    .email-chevron    { display: none; }
    .filter-btn       { font-size: 11px; padding: 8px 11px; }
    .reply-field-row  { flex-direction: column; align-items: flex-start; gap: 5px; }
    .reply-field-value { width: 100%; }
  }
`;

// ── Helpers ──────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "#e87722","#0e7490","#7c3aed","#b45309","#15803d",
  "#be185d","#1d4ed8","#9f1239","#065f46","#92400e",
];

const getColor = (str = "") => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
};

const getInitials = (from = "") => {
  const clean = from.replace(/<[^>]+>/g, "").replace(/['"]/g, "").trim();
  const parts  = clean.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (clean.slice(0, 2) || "??").toUpperCase();
};

const relativeTime = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" });
};

// ── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonCard = ({ i }) => (
  <div className="skeleton-card" style={{ animationDelay: `${i * 70}ms` }}>
    <div className="skel skel-avatar" />
    <div className="skel-lines">
      <div className="skel skel-line" style={{ width: "50%" }} />
      <div className="skel skel-line" style={{ width: "32%" }} />
      <div className="skel skel-line" style={{ width: "75%", marginTop: 2 }} />
    </div>
  </div>
);

// ── Toast ─────────────────────────────────────────────────────────────────────
const ToastContainer = ({ toasts }) => (
  <div className="toast-container">
    {toasts.map(t => (
      <div key={t.id} className={`toast ${t.type}`}>
        <div className="toast-icon">{t.type === "success" ? "✓" : "✕"}</div>
        {t.message}
      </div>
    ))}
  </div>
);

// ── Reply Panel ───────────────────────────────────────────────────────────────
const ReplyPanel = ({ email, open, onDiscard, onSent }) => {
  const [body, setBody]       = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef           = useRef(null);

  useEffect(() => {
    if (open)  setTimeout(() => textareaRef.current?.focus(), 340);
    if (!open) setBody("");
  }, [open]);

  const handleSend = async (e) => {
    e.stopPropagation();
    if (!body.trim()) return;
    setSending(true);
    try {
      await axios.post("http://localhost:8083/api/v1/hostel/send-email", {
        to:      email.from,
        subject: `Re: ${email.subject}`,
        message: body.trim(),
      });
      onSent(true);
      setBody("");
    } catch {
      onSent(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`reply-panel${open ? " open" : ""}`} onClick={e => e.stopPropagation()}>
      <div className="reply-inner">
        <div className="reply-heading">↩ Compose Reply</div>

        <div className="reply-field-row">
          <span className="reply-field-label">To</span>
          <div className="reply-field-value">{email.from}</div>
        </div>

        <div className="reply-field-row">
          <span className="reply-field-label">Sub</span>
          <div className="reply-field-value">Re: {email.subject}</div>
        </div>

        <textarea
          ref={textareaRef}
          className="reply-textarea"
          placeholder="Type your reply here…"
          value={body}
          onChange={e => setBody(e.target.value)}
        />

        <div className="reply-footer">
          <span className="reply-char">{body.length} characters</span>
          <div className="reply-btns">
            <button className="discard-btn" onClick={(e) => { e.stopPropagation(); onDiscard(); }}>
              ✕ Discard
            </button>
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={sending || !body.trim()}
            >
              {sending ? "Sending…" : "Send Reply ↗"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Email Card ────────────────────────────────────────────────────────────────
const EmailCard = ({ email, index, onToast }) => {
  const [open, setOpen]         = useState(false);
  const [replying, setReplying] = useState(false);

  const color    = getColor(email.from);
  const initials = getInitials(email.from);

  const handleReplyResult = (success) => {
    if (success) {
      onToast({ type: "success", message: "Reply sent successfully!" });
      setReplying(false);
    } else {
      onToast({ type: "error", message: "Failed to send. Please try again." });
    }
  };

  return (
    <div
      className={`email-card${open ? " is-open" : ""}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Clickable Header */}
      <div className="email-card-header" onClick={() => { setOpen(p => !p); if (open) setReplying(false); }}>
        <div className="email-avatar" style={{ background: color }}>{initials}</div>
        <div className="email-meta">
          <div className="email-row1">
            <span className="email-subject">{email.subject || "(No subject)"}</span>
            <span className="email-time">{relativeTime(email.date)}</span>
          </div>
          <div className="email-from">{email.from}</div>
          <div className="email-preview">{email.message}</div>
        </div>
        <span className="email-chevron">▼</span>
      </div>

      {/* Expanded content */}
      <div className={`email-body-wrap${open ? " open" : ""}`}>
        <div className="email-body-inner">
          <div className="email-meta-row">
            <strong>From:</strong> {email.from}
            <span className="email-meta-divider">·</span>
            <strong>Date:</strong>&nbsp;
            {new Date(email.date).toLocaleString("en-IN", {
              weekday: "short", day: "2-digit", month: "short",
              year: "numeric", hour: "2-digit", minute: "2-digit",
            })}
          </div>
          <div className="email-message">{email.message}</div>
        </div>

        <div className={`email-actions${replying ? " reply-open" : ""}`}>
          <button
            className={`action-btn${replying ? " reply-active" : " reply"}`}
            onClick={(e) => { e.stopPropagation(); setReplying(p => !p); }}
          >
            ↩ {replying ? "Close Reply" : "Reply"}
          </button>
          <button
            className="action-btn secondary"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `mailto:${email.from}?subject=Re: ${encodeURIComponent(email.subject || "")}`;
            }}
          >
            ✉ Open in Mail App
          </button>
          <span className="email-received-date">
            Received {new Date(email.date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
          </span>
        </div>

        <ReplyPanel
          email={email}
          open={replying}
          onDiscard={() => setReplying(false)}
          onSent={handleReplyResult}
        />
      </div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const Emails = () => {
  const [emails, setEmails]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("all");
  const [spinning, setSpinning] = useState(false);
  const [toasts, setToasts]     = useState([]);

  const addToast = ({ type, message }) => {
    const id = Date.now();
    setToasts(p => [...p, { id, type, message }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  const getEmails = async () => {
    try {
      const { data } = await axios.get("http://localhost:8083/api/v1/hostel/my-emails");
      if (data.success) setEmails(data.emails);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setSpinning(true);
    await getEmails();
    setTimeout(() => setSpinning(false), 700);
  };

  useEffect(() => { getEmails(); }, []);

  const filtered = emails.filter(e => {
    const q      = search.toLowerCase();
    const matchQ = !q ||
      e.subject?.toLowerCase().includes(q) ||
      e.from?.toLowerCase().includes(q) ||
      e.message?.toLowerCase().includes(q);
    const now    = Date.now();
    const age    = now - new Date(e.date).getTime();
    const matchF =
      filter === "all"   ? true :
      filter === "today" ? age < 86400000 :
      filter === "week"  ? age < 604800000 : true;
    return matchQ && matchF;
  });

  return (
    <Layout>
      <style>{styles}</style>
      <div className="inbox-root">

        {/* Sticky Top Bar */}
        <div className="inbox-topbar">
          <div className="inbox-brand">
            <div className="inbox-brand-icon">✉</div>
            <span className="inbox-brand-name">StayOS Mail</span>
          </div>
          <button
            className={`topbar-refresh-btn${spinning ? " spinning" : ""}`}
            onClick={handleRefresh}
            title="Refresh inbox"
          >
            ↻
          </button>
        </div>

        {/* Page Header */}
        <div className="inbox-header">
          <div className="inbox-header-left">
            <span className="inbox-eyebrow">StayOS · Hostel Messages</span>
            <h1 className="inbox-title">Inbox</h1>
            <p className="inbox-subtitle">Your guest and team communications</p>
          </div>
          <div className="inbox-stats">
            <div className="stat-pill">
              <span className="stat-pill-dot" />
              {loading ? "—" : `${filtered.length} ${filtered.length === 1 ? "message" : "messages"}`}
            </div>
          </div>
        </div>

        <div className="inbox-divider" />

        {/* Toolbar */}
        <div className="inbox-toolbar">
          <div className="inbox-search-wrap">
            <span className="inbox-search-icon">⌕</span>
            <input
              className="inbox-search"
              type="text"
              placeholder="Search by subject, sender, or content…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {[
            { key: "all",   label: "All Mail" },
            { key: "today", label: "Today" },
            { key: "week",  label: "This Week" },
          ].map(f => (
            <button
              key={f.key}
              className={`filter-btn${filter === f.key ? " active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Email List */}
        <div className="inbox-list">
          {loading ? (
            [0, 1, 2].map(i => <SkeletonCard key={i} i={i} />)
          ) : filtered.length === 0 ? (
            <div className="inbox-empty">
              <div className="inbox-empty-icon">📭</div>
              <div className="inbox-empty-title">
                {search ? "No results found" : "You're all caught up!"}
              </div>
              <div className="inbox-empty-sub">
                {search
                  ? `No emails match "${search}". Try different keywords.`
                  : "No messages here yet. New emails will show up automatically."}
              </div>
            </div>
          ) : (
            filtered.map((email, i) => (
              <EmailCard
                key={email._id}
                email={email}
                index={i}
                onToast={addToast}
              />
            ))
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} />
    </Layout>
  );
};

export default Emails;