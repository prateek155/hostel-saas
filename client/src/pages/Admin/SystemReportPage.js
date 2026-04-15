import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import AdminMenu from "../../components/Layout/AdminMenu";
import Header from "../../components/Layout/Header";

const API_BASE = "http://localhost:8083/api/v1/system";

/* ══════════════════════════════════════════════════════════════
   THEME DEFINITIONS
══════════════════════════════════════════════════════════════ */
const THEMES = {
  default: { primary:"#3b82f6",  background:"#0f172a", surface:"#1e293b", surfaceLight:"#334155", text:"#e2e8f0",  textSecondary:"#94a3b8", border:"#334155" },
  ocean:   { primary:"#06b6d4",  background:"#0c1e24", surface:"#164e63", surfaceLight:"#155e75", text:"#e0f2fe",  textSecondary:"#67e8f9", border:"#0e7490" },
  sunset:  { primary:"#f59e0b",  background:"#1a0f0a", surface:"#451a03", surfaceLight:"#78350f", text:"#fef3c7",  textSecondary:"#fcd34d", border:"#92400e" },
  forest:  { primary:"#10b981",  background:"#0a1612", surface:"#064e3b", surfaceLight:"#065f46", text:"#d1fae5",  textSecondary:"#6ee7b7", border:"#047857" },
  purple:  { primary:"#8b5cf6",  background:"#1a0f2e", surface:"#2e1065", surfaceLight:"#4c1d95", text:"#f3e8ff",  textSecondary:"#c4b5fd", border:"#6d28d9" },
};

/* ══════════════════════════════════════════════════════════════
   CSS GENERATOR
══════════════════════════════════════════════════════════════ */
const getCSS = (theme) => `
  .sos * { box-sizing: border-box; margin: 0; padding: 0; }
  .sos { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; background: ${theme.background}; min-height: 100vh; color: ${theme.text}; font-size: 14px; }
  .sos-tab-bar { display:flex; background:${theme.surface}; border-bottom:1px solid ${theme.border}; padding:0 24px; overflow-x:auto; }
  .sos-tab { padding:10px 16px; font-size:12px; font-weight:400; color:${theme.textSecondary}; border:none; background:none; cursor:pointer; border-bottom:2px solid transparent; white-space:nowrap; font-family:inherit; transition:color 0.15s; }
  .sos-tab:hover { color:${theme.text}; }
  .sos-tab.active { color:${theme.text}; font-weight:600; border-bottom-color:${theme.primary}; }
  .sos-tab-badge { display:inline-flex; align-items:center; justify-content:center; min-width:16px; height:16px; border-radius:8px; font-size:9px; font-weight:700; margin-left:5px; padding:0 4px; }
  .sos-tab-badge-red   { background:rgba(248,81,73,0.15);  color:#f85149; }
  .sos-tab-badge-amber { background:rgba(210,153,34,0.15); color:#d29922; }
  .sos-content { padding:20px 24px; }
  .sos-card { background:${theme.surface}; border:1px solid ${theme.border}; border-radius:12px; padding:16px; margin-bottom:14px; }
  .sos-card-hd { font-size:13px; font-weight:600; color:${theme.text}; margin-bottom:12px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; }
  .sos-card-hd-left { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .sos-metric-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(145px,1fr)); gap:10px; margin-bottom:16px; }
  .sos-metric-card { background:${theme.surface}; border:1px solid ${theme.border}; border-radius:8px; padding:14px 16px; }
  .sos-metric-lbl { font-size:11px; color:${theme.textSecondary}; margin-bottom:6px; }
  .sos-metric-val { font-size:24px; font-weight:700; line-height:1; font-family:"SF Mono",Consolas,monospace; }
  .sos-metric-val-green { color:#3fb950; } .sos-metric-val-blue  { color:${theme.primary}; }
  .sos-metric-val-amber { color:#d29922; } .sos-metric-val-red   { color:#f85149; }
  .sos-metric-sub { font-size:10px; color:${theme.textSecondary}; margin-top:4px; font-family:"SF Mono",Consolas,monospace; }
  .sos-two-col { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:12px; margin-bottom:14px; }
  .sos-three-col { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:12px; margin-bottom:14px; }
  .sos-sum-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(110px,1fr)); gap:8px; }
  .sos-sum-cell { text-align:center; padding:12px 8px; border-radius:8px; }
  .sos-sum-cell-text { font-size:22px; font-weight:700; font-family:"SF Mono",Consolas,monospace; }
  .sos-sum-cell-lbl  { font-size:10px; margin-top:3px; opacity:0.8; }
  .sos-sum-amber { background:rgba(210,153,34,0.1);  color:#d29922; }
  .sos-sum-red   { background:rgba(248,81,73,0.1);   color:#f85149; }
  .sos-sum-green { background:rgba(63,185,80,0.1);   color:#3fb950; }
  .sos-sum-blue  { background:${theme.primary}1A;    color:${theme.primary}; }
  .sos-section-hd { font-size:10px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:${theme.textSecondary}; margin-bottom:10px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:6px; }
  .sos-pill { display:inline-flex; align-items:center; gap:5px; padding:2px 9px; border-radius:20px; font-size:11px; font-weight:500; border:1px solid; }
  .sos-pill-green { color:#3fb950; border-color:rgba(63,185,80,0.3);  background:rgba(63,185,80,0.1);  }
  .sos-pill-amber { color:#d29922; border-color:rgba(210,153,34,0.3); background:rgba(210,153,34,0.1); }
  .sos-pill-red   { color:#f85149; border-color:rgba(248,81,73,0.3);  background:rgba(248,81,73,0.1);  }
  .sos-pill-blue  { color:${theme.primary}; border-color:${theme.primary}4D; background:${theme.primary}1A; }
  .sos-pill-gray  { color:${theme.textSecondary}; border-color:${theme.border}; background:${theme.surfaceLight}; }
  .sos-pulse { width:6px; height:6px; border-radius:50%; background:#3fb950; flex-shrink:0; animation:sos-blink 1.4s infinite; }
  @keyframes sos-blink { 0%,100%{opacity:1} 50%{opacity:0.25} }
  .sos-chip { display:inline-flex; align-items:center; padding:2px 8px; border-radius:20px; font-size:10px; font-weight:600; border:1px solid; }
  .sos-chip-critical { color:#f85149; background:rgba(248,81,73,0.1);   border-color:rgba(248,81,73,0.3);   }
  .sos-chip-high     { color:#ff8c69; background:rgba(255,140,105,0.1); border-color:rgba(255,140,105,0.3); }
  .sos-chip-medium   { color:#d29922; background:rgba(210,153,34,0.1);  border-color:rgba(210,153,34,0.3);  }
  .sos-chip-ok       { color:#3fb950; background:rgba(63,185,80,0.1);   border-color:rgba(63,185,80,0.3);   }
  .sos-chip-fix      { font-size:9px; color:#3fb950; background:rgba(63,185,80,0.1); border-color:rgba(63,185,80,0.3); }
  .sos-chip-info     { color:${theme.textSecondary}; background:${theme.surfaceLight}; border-color:${theme.border}; }
  .sos-btn-primary { padding:9px 16px; background:${theme.primary}; border:none; border-radius:8px; color:#fff; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; transition:background 0.15s; }
  .sos-btn-primary:hover:not(:disabled) { background:${theme.primary}dd; }
  .sos-btn-primary:disabled { opacity:0.55; cursor:not-allowed; }
  .sos-btn-secondary { padding:9px 16px; background:none; border:1px solid ${theme.border}; border-radius:8px; color:${theme.textSecondary}; font-size:13px; cursor:pointer; font-family:inherit; transition:all 0.15s; }
  .sos-btn-secondary:hover { border-color:${theme.text}; color:${theme.text}; }
  .sos-btn-ghost { font-size:11px; padding:5px 12px; border:1px solid ${theme.border}; background:none; border-radius:20px; color:${theme.textSecondary}; cursor:pointer; font-family:inherit; white-space:nowrap; transition:all 0.15s; }
  .sos-btn-ghost:hover { border-color:${theme.primary}; color:${theme.primary}; }
  .sos-btn-ghost:disabled { opacity:0.5; cursor:not-allowed; }
  .sos-btn-green { font-size:11px; padding:5px 13px; border:1px solid rgba(63,185,80,0.3); background:rgba(63,185,80,0.1); border-radius:20px; color:#3fb950; cursor:pointer; font-family:inherit; font-weight:500; white-space:nowrap; transition:background 0.15s; }
  .sos-btn-green:hover { background:rgba(63,185,80,0.2); } .sos-btn-green:disabled { opacity:0.5; cursor:default; }
  .sos-btn-amber { font-size:11px; padding:5px 13px; border:1px solid rgba(210,153,34,0.3); background:rgba(210,153,34,0.1); border-radius:20px; color:#d29922; cursor:pointer; font-family:inherit; font-weight:500; white-space:nowrap; }
  .sos-btn-amber:hover { background:rgba(210,153,34,0.2); }
  .sos-btn-red { font-size:11px; padding:5px 13px; border:1px solid rgba(248,81,73,0.3); background:rgba(248,81,73,0.1); border-radius:20px; color:#f85149; cursor:pointer; font-family:inherit; font-weight:500; white-space:nowrap; }
  .sos-btn-red:hover { background:rgba(248,81,73,0.2); }
  .sos-btn-blue { font-size:11px; padding:5px 13px; border:1px solid ${theme.primary}4D; background:${theme.primary}1A; border-radius:20px; color:${theme.primary}; cursor:pointer; font-family:inherit; font-weight:500; white-space:nowrap; }
  .sos-btn-blue:hover:not(:disabled) { background:${theme.primary}33; } .sos-btn-blue:disabled { opacity:0.5; cursor:not-allowed; }
  .sos-btn-full { width:100%; }
  .sos-table-outer { border:1px solid ${theme.border}; border-radius:12px; overflow:hidden; overflow-x:auto; }
  .sos-table-outer-nb-red    { border:1px solid rgba(248,81,73,0.3);  border-top:none; border-radius:0 0 8px 8px; overflow-x:auto; margin-bottom:14px; background:${theme.surfaceLight}; }
  .sos-table-outer-nb-medium { border:1px solid rgba(210,153,34,0.3); border-top:none; border-radius:0 0 8px 8px; overflow-x:auto; margin-bottom:14px; background:${theme.surfaceLight}; }
  .sos-table { width:100%; border-collapse:collapse; font-size:12px; min-width:480px; }
  .sos-th { font-size:10px; text-align:left; color:${theme.textSecondary}; padding:8px 14px; border-bottom:1px solid ${theme.border}; font-weight:600; letter-spacing:0.05em; text-transform:uppercase; background:${theme.surfaceLight}; white-space:nowrap; }
  .sos-td { padding:10px 14px; border-bottom:1px solid ${theme.border}; color:${theme.text}; vertical-align:middle; }
  .sos-tr-last td { border-bottom:none; }
  .sos-table tr:hover td { background:${theme.primary}0D; }
  .sos-mono  { font-family:"SF Mono",Consolas,"Courier New",monospace; }
  .sos-muted { color:${theme.textSecondary}; }
  .sos-hint  { color:${theme.textSecondary}; opacity:0.6; }
  .sos-green { color:#3fb950; } .sos-amber { color:#d29922; } .sos-red-txt { color:#f85149; } .sos-blue { color:${theme.primary}; }
  .sos-info-bar { display:flex; gap:10px; padding:11px 14px; background:${theme.primary}14; border:1px solid ${theme.primary}40; border-radius:8px; margin-bottom:14px; font-size:12px; color:${theme.textSecondary}; line-height:1.6; }
  .sos-info-bar strong { color:${theme.text}; }
  .sos-warn-bar { font-size:10px; color:#d29922; background:rgba(210,153,34,0.1); border:1px solid rgba(210,153,34,0.3); border-radius:6px; padding:6px 10px; text-align:center; margin-bottom:12px; font-family:"SF Mono",Consolas,monospace; }
  /* Health bar */
  .sos-hbar-track { height:8px; background:${theme.surfaceLight}; border-radius:4px; overflow:hidden; margin-top:6px; }
  .sos-hbar-fill  { height:100%; border-radius:4px; transition:width 0.6s; }
  /* Issue cards */
  .sos-issue-card { display:flex; border-radius:10px; overflow:hidden; margin-bottom:10px; border:1px solid; }
  .sos-issue-card-error   { border-color:rgba(248,81,73,0.3);  }
  .sos-issue-card-warning { border-color:rgba(210,153,34,0.3); }
  .sos-issue-sidebar-error   { width:4px; background:#f85149; flex-shrink:0; }
  .sos-issue-sidebar-warning { width:4px; background:#d29922; flex-shrink:0; }
  .sos-issue-body { flex:1; padding:10px 14px; background:${theme.surfaceLight}; min-width:0; }
  .sos-issue-top  { display:flex; align-items:flex-start; justify-content:space-between; gap:8px; flex-wrap:wrap; }
  .sos-issue-meta { flex:1; min-width:0; }
  .sos-issue-tags { display:flex; align-items:center; gap:6px; margin-bottom:4px; flex-wrap:wrap; }
  .sos-issue-rule { font-size:10px; font-family:"SF Mono",Consolas,monospace; }
  .sos-issue-rule-error { color:#f85149; } .sos-issue-rule-warning { color:#d29922; }
  .sos-issue-msg  { font-size:12px; font-weight:600; color:${theme.text}; margin-bottom:4px; }
  .sos-issue-location { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .sos-file-path  { font-size:11px; font-family:"SF Mono",Consolas,monospace; color:${theme.primary}; }
  .sos-line-tag   { font-size:10px; font-family:"SF Mono",Consolas,monospace; color:${theme.textSecondary}; background:${theme.surface}; border:1px solid ${theme.border}; border-radius:4px; padding:1px 6px; }
  .sos-issue-actions { display:flex; gap:6px; flex-shrink:0; align-items:flex-start; flex-wrap:wrap; }
  /* File viewer */
  .sos-file-viewer { margin-top:10px; border:1px solid ${theme.border}; border-radius:8px; overflow:hidden; }
  .sos-file-viewer-header { padding:8px 12px; background:${theme.surface}; border-bottom:1px solid ${theme.border}; display:flex; align-items:center; justify-content:space-between; }
  .sos-file-viewer-title { font-size:11px; font-family:"SF Mono",Consolas,monospace; color:${theme.primary}; }
  .sos-file-viewer-sub   { font-size:10px; color:${theme.textSecondary}; }
  .sos-file-viewer-body  { overflow-x:auto; background:${theme.background}; }
  .sos-file-line { display:flex; min-width:max-content; }
  .sos-file-line:hover { background:${theme.primary}08; }
  .sos-file-line-target      { background:rgba(248,81,73,0.12) !important; border-left:3px solid #f85149; }
  .sos-file-line-target-warn { background:rgba(210,153,34,0.12) !important; border-left:3px solid #d29922; }
  .sos-file-line-num { min-width:48px; padding:2px 10px; text-align:right; font-size:11px; font-family:"SF Mono",Consolas,monospace; color:${theme.textSecondary}; border-right:1px solid ${theme.border}; user-select:none; flex-shrink:0; opacity:0.6; }
  .sos-file-line-num-target      { color:#f85149; opacity:1; }
  .sos-file-line-num-target-warn { color:#d29922; opacity:1; }
  .sos-file-line-code { padding:2px 14px; font-size:11px; font-family:"SF Mono",Consolas,monospace; color:${theme.text}; white-space:pre; }
  .sos-file-loading { padding:20px; text-align:center; font-size:12px; color:${theme.textSecondary}; }
  /* Code block */
  .sos-code-block { background:${theme.surface}; border:1px solid ${theme.border}; border-radius:6px; padding:8px 12px; font-family:"SF Mono",Consolas,monospace; font-size:11px; color:${theme.primary}; word-break:break-all; margin-top:8px; line-height:1.7; overflow-x:auto; }
  /* Activity */
  .sos-act-list { display:flex; flex-direction:column; gap:6px; }
  .sos-act-item { display:flex; align-items:flex-start; gap:10px; padding:8px 10px; background:${theme.surfaceLight}; border-radius:8px; }
  .sos-act-dot  { width:7px; height:7px; border-radius:50%; margin-top:4px; flex-shrink:0; }
  .sos-act-dot-green { background:#3fb950; } .sos-act-dot-amber { background:#d29922; } .sos-act-dot-blue { background:${theme.primary}; }
  .sos-act-text { font-size:12px; color:${theme.text}; line-height:1.4; }
  .sos-act-time { font-size:10px; color:${theme.textSecondary}; font-family:"SF Mono",Consolas,monospace; margin-top:1px; opacity:0.6; }
  /* Run row */
  .sos-run-row { display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-top:10px; padding-top:10px; border-top:1px solid ${theme.border}; }
  .sos-run-row-label { font-size:11px; color:${theme.textSecondary}; margin-right:4px; }
  .sos-scheduled-badge { font-size:11px; font-family:"SF Mono",Consolas,monospace; color:#d29922; background:rgba(210,153,34,0.1); border:1px solid rgba(210,153,34,0.3); border-radius:4px; padding:2px 8px; }
  /* Modal */
  .sos-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.75); display:flex; align-items:center; justify-content:center; z-index:1000; padding:20px; }
  .sos-modal-box { background:${theme.surface}; border:1px solid ${theme.border}; border-radius:12px; padding:28px 24px; width:100%; max-width:360px; }
  .sos-modal-icon { width:44px; height:44px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:20px; margin:0 auto 14px; }
  .sos-modal-icon-amber { background:rgba(210,153,34,0.1); border:1px solid rgba(210,153,34,0.3); }
  .sos-modal-icon-blue  { background:${theme.primary}1A; border:1px solid ${theme.primary}4D; }
  .sos-modal-title { font-size:16px; font-weight:700; color:${theme.text}; text-align:center; margin-bottom:5px; }
  .sos-modal-sub  { font-size:12px; color:${theme.textSecondary}; text-align:center; line-height:1.6; margin-bottom:8px; }
  .sos-modal-sub strong { color:${theme.text}; }
  .sos-scope-tag { display:block; text-align:center; font-size:11px; font-family:"SF Mono",Consolas,monospace; color:${theme.primary}; background:${theme.primary}1A; border:1px solid ${theme.primary}4D; border-radius:4px; padding:2px 8px; margin-bottom:14px; word-break:break-all; }
  .sos-digits-row { display:flex; gap:6px; justify-content:center; margin-bottom:14px; align-items:center; }
  .sos-digit-sep  { color:${theme.textSecondary}; font-size:20px; }
  .sos-digit { width:40px; height:48px; background:${theme.surfaceLight}; border:1px solid ${theme.border}; border-radius:8px; font-size:20px; font-weight:700; font-family:"SF Mono",Consolas,monospace; color:${theme.text}; text-align:center; outline:none; transition:border-color 0.15s; }
  .sos-digit:focus { border-color:${theme.primary}; }
  .sos-modal-error   { font-size:11px; color:#f85149; text-align:center; margin-bottom:10px; }
  .sos-modal-actions { display:flex; gap:8px; }
  .sos-success-ring  { width:52px; height:52px; border-radius:50%; background:rgba(63,185,80,0.1); border:2px solid #3fb950; display:flex; align-items:center; justify-content:center; font-size:24px; margin:0 auto 14px; }
  .sos-fix-output { max-height:100px; overflow:auto; text-align:left; margin-bottom:14px; }
  /* Settings */
  .sos-form-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:16px; margin-bottom:20px; }
  .sos-form-label { font-size:11px; color:${theme.textSecondary}; margin-bottom:6px; font-weight:500; }
  .sos-form-hint  { font-size:10px; color:${theme.textSecondary}; margin-top:4px; font-family:"SF Mono",Consolas,monospace; opacity:0.6; }
  .sos-input  { background:${theme.surfaceLight}; border:1px solid ${theme.border}; border-radius:8px; color:${theme.text}; font-size:13px; padding:8px 12px; outline:none; width:100%; font-family:inherit; transition:border-color 0.15s; }
  .sos-input:focus { border-color:${theme.primary}; }
  .sos-select { background:${theme.surfaceLight}; border:1px solid ${theme.border}; border-radius:8px; color:${theme.text}; font-size:13px; padding:8px 12px; outline:none; width:100%; font-family:inherit; cursor:pointer; }
  .sos-config-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:10px; }
  .sos-config-cell { padding:11px 13px; background:${theme.surfaceLight}; border-radius:8px; border-left:3px solid; }
  .sos-config-cell-ok   { border-left-color:#3fb950; } .sos-config-cell-warn { border-left-color:#d29922; }
  .sos-config-lbl { font-size:10px; color:${theme.textSecondary}; text-transform:uppercase; letter-spacing:0.07em; }
  .sos-config-val { font-size:13px; font-weight:600; color:${theme.text}; margin-top:3px; font-family:"SF Mono",Consolas,monospace; }
  /* Env var tags */
  .sos-env-set  { display:inline-flex; align-items:center; padding:2px 8px; border-radius:4px; font-size:10px; font-family:"SF Mono",Consolas,monospace; background:rgba(63,185,80,0.1); color:#3fb950; border:1px solid rgba(63,185,80,0.3); margin:2px; }
  .sos-env-miss { display:inline-flex; align-items:center; padding:2px 8px; border-radius:4px; font-size:10px; font-family:"SF Mono",Consolas,monospace; background:rgba(248,81,73,0.1); color:#f85149; border:1px solid rgba(248,81,73,0.3); margin:2px; }
  /* Scan progress */
  .sos-scan-bar { display:flex; align-items:center; gap:10px; padding:10px 14px; background:${theme.primary}14; border:1px solid ${theme.primary}40; border-radius:8px; margin-bottom:14px; font-size:12px; color:${theme.text}; }
  .sos-scan-spinner { width:14px; height:14px; border:2px solid ${theme.primary}40; border-top-color:${theme.primary}; border-radius:50%; animation:sos-spin 0.8s linear infinite; flex-shrink:0; }
  @keyframes sos-spin { to { transform:rotate(360deg); } }
  /* Misc */
  .sos-key-reveal { font-size:10px; color:${theme.primary}; background:none; border:none; cursor:pointer; margin-left:6px; font-family:inherit; }
  .sos-key-reveal:hover { text-decoration:underline; }
  .sos-empty { text-align:center; padding:40px 20px; color:${theme.textSecondary}; font-size:13px; }
  .sos-empty-green { color:#3fb950; }
  .sos-save-row { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
  .sos-save-msg-ok  { font-size:12px; color:#3fb950; }
  .sos-save-msg-err { font-size:12px; color:#f85149; }
  .sos-divider { height:1px; background:${theme.border}; margin:12px 0; }
  .sos-sec-card { display:flex; gap:12px; padding:12px 14px; border-radius:8px 8px 0 0; border:1px solid; align-items:flex-start; }
  .sos-sec-card-high       { background:rgba(248,81,73,0.07);  border-color:rgba(248,81,73,0.3);  }
  .sos-sec-card-standalone { border-radius:8px; margin-bottom:8px; }
  .sos-sec-icon { font-size:14px; flex-shrink:0; margin-top:2px; }
  .sos-modal-record { background:${theme.surfaceLight}; border:1px solid ${theme.border}; border-radius:8px; padding:10px 14px; text-align:left; margin:12px 0; }
  .sos-record-lbl { font-size:9px; color:${theme.textSecondary}; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:4px; }
  .sos-record-val { font-size:11px; font-family:"SF Mono",Consolas,monospace; color:${theme.text}; word-break:break-all; }
  /* Live health pulse ring */
  .sos-health-score { font-size:48px; font-weight:700; font-family:"SF Mono",Consolas,monospace; line-height:1; }
  .sos-health-badge { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; border:1px solid; margin-top:6px; }
  .sos-health-badge-healthy  { color:#3fb950; background:rgba(63,185,80,0.1);  border-color:rgba(63,185,80,0.3);  }
  .sos-health-badge-warning  { color:#d29922; background:rgba(210,153,34,0.1); border-color:rgba(210,153,34,0.3); }
  .sos-health-badge-critical { color:#f85149; background:rgba(248,81,73,0.1);  border-color:rgba(248,81,73,0.3);  }
  @media (max-width:640px) {
    .sos-content { padding:14px; }
    .sos-metric-grid { grid-template-columns:repeat(2,1fr); }
    .sos-two-col,.sos-three-col { grid-template-columns:1fr; }
  }
`;

/* ══════════════════════════════════════════════════════════════
   TINY HELPERS
══════════════════════════════════════════════════════════════ */
function Pill({ color, children }) {
  return <span className={`sos-pill sos-pill-${color || "gray"}`}>{children}</span>;
}
function Chip({ type }) {
  const map = { critical:"sos-chip-critical", major:"sos-chip-critical", high:"sos-chip-high", medium:"sos-chip-medium", minor:"sos-chip-medium", ok:"sos-chip-ok", patch:"sos-chip-ok", success:"sos-chip-ok", "issue-fix":"sos-chip-medium", "package-update":"sos-chip-ok" };
  return <span className={`sos-chip ${map[type] || "sos-chip-info"}`}>{type || "—"}</span>;
}
function SevPill({ sev }) {
  const s = (sev || "").toLowerCase();
  const c = (s === "critical" || s === "high") ? "red" : s === "medium" ? "amber" : "gray";
  return <Pill color={c}>{sev || "unknown"}</Pill>;
}
function KeyCell({ keyVal }) {
  const [show, setShow] = useState(false);
  return (
    <span className="sos-mono">
      <span className="sos-muted">{show ? keyVal : "●●●●●●"}</span>
      <button className="sos-key-reveal" onClick={() => setShow(s => !s)}>{show ? "hide" : "show"}</button>
    </span>
  );
}
function Dot({ color }) {
  const cls = { green:"sos-act-dot-green", amber:"sos-act-dot-amber", blue:"sos-act-dot-blue" };
  return <div className={`sos-act-dot ${cls[color] || "sos-act-dot-green"}`} />;
}

/**
 * Horizontal usage bar.
 * warn / crit props are the threshold percentages — shows tick marks so the
 * admin can visually see where the warning and critical boundaries sit.
 */
function UsageBar({ pct, warn = 70, crit = 90 }) {
  const p = Math.min(100, pct || 0);
  const color = p >= crit ? "#f85149" : p >= warn ? "#d29922" : "#3fb950";
  return (
    <div className="sos-hbar-track" style={{ position:"relative" }}>
      <div className="sos-hbar-fill" style={{ width:`${p}%`, background:color }} />
      {/* Warning threshold tick */}
      <div style={{ position:"absolute", top:0, left:`${warn}%`, width:1, height:"100%", background:"#d29922", opacity:0.5 }} />
      {/* Critical threshold tick */}
      <div style={{ position:"absolute", top:0, left:`${crit}%`, width:1, height:"100%", background:"#f85149", opacity:0.5 }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   FILE VIEWER
══════════════════════════════════════════════════════════════ */
function FileViewer({ file, line, type, onClose }) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr]       = useState("");
  const lineRefs = useRef({});
  const isError  = type === "error";

  useEffect(() => {
    setLoading(true); setErr(""); setData(null);
    axios.get(`${API_BASE}/file-content`, { params: { file, line } })
      .then(r => { setData(r.data); setLoading(false); })
      .catch(e => { setErr(e?.response?.data?.message || "Could not read file"); setLoading(false); });
  }, [file, line]);

  useEffect(() => {
    if (data && lineRefs.current[line]) {
      lineRefs.current[line].scrollIntoView({ block:"center", behavior:"smooth" });
    }
  }, [data, line]);

  return (
    <div className="sos-file-viewer">
      <div className="sos-file-viewer-header">
        <div>
          <div className="sos-file-viewer-title">{file}</div>
          <div className="sos-file-viewer-sub">Line {line} · {data?.totalLines || "?"} total lines</div>
        </div>
        <button className="sos-btn-ghost" onClick={onClose} style={{ fontSize:10, padding:"3px 8px" }}>✕ Close</button>
      </div>
      <div className="sos-file-viewer-body">
        {loading && <div className="sos-file-loading">Loading file…</div>}
        {err && <div style={{ padding:"12px 14px", color:"#f85149", fontSize:11 }}>⚠ {err}</div>}
        {data && data.lines.map(l => (
          <div key={l.lineNumber} ref={el => { if (el) lineRefs.current[l.lineNumber] = el; }}
            className={`sos-file-line ${l.isTarget ? (isError ? "sos-file-line-target" : "sos-file-line-target-warn") : ""}`}>
            <div className={`sos-file-line-num ${l.isTarget ? (isError ? "sos-file-line-num-target" : "sos-file-line-num-target-warn") : ""}`}>{l.lineNumber}</div>
            <div className="sos-file-line-code">{l.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SECURITY KEY MODAL
══════════════════════════════════════════════════════════════ */
function KeyModal({ config, onClose, onSuccess }) {
  const [digits, setDigits] = useState(["","","","","",""]);
  const [hasError, setHasError] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(null);
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  useEffect(() => { setTimeout(() => refs[0].current?.focus(), 100); }, []);

  const handleDigit = (i, val) => {
    const v = val.replace(/\D/g,"").slice(-1);
    const nd = [...digits]; nd[i] = v;
    setDigits(nd); setHasError(false);
    if (v && i < 5) refs[i+1]?.current?.focus();
  };
  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs[i-1]?.current?.focus();
  };
  const handleVerify = async () => {
    const entered = digits.join("");
    if (entered.length < 6) return;
    setVerifying(true); setHasError(false);
    try {
      const ep = config.type === "issue-fix" ? `${API_BASE}/verify-fix` : `${API_BASE}/verify-key`;
      const res = await axios.post(ep, { keyId:config.keyId, key:entered, ...(config.extra||{}) });
      if (res.data.success) { setSuccess(res.data); onSuccess(res.data); }
      else { setHasError(true); setDigits(["","","","","",""]); setTimeout(()=>refs[0].current?.focus(),50); }
    } catch { setHasError(true); setDigits(["","","","","",""]); setTimeout(()=>refs[0].current?.focus(),50); }
    finally { setVerifying(false); }
  };

  if (success) return (
    <div className="sos-modal-overlay"><div className="sos-modal-box">
      <div style={{ textAlign:"center" }}>
        <div className="sos-success-ring">✓</div>
        <div className="sos-modal-title">{config.type==="issue-fix"?"Fix Applied!":"Update Authorized!"}</div>
        <p className="sos-modal-sub" style={{ marginBottom:14 }}>{config.successMsg}</p>
        {success.fixOutput && <div className="sos-code-block sos-fix-output">{success.fixOutput}</div>}
        <button className="sos-btn-primary sos-btn-full" onClick={onClose}>Done</button>
      </div>
    </div></div>
  );

  return (
    <div className="sos-modal-overlay"><div className="sos-modal-box">
      <div className={`sos-modal-icon ${config.type==="issue-fix"?"sos-modal-icon-amber":"sos-modal-icon-blue"}`}>
        {config.type==="issue-fix"?"🔧":"🔑"}
      </div>
      <div className="sos-modal-title">Security Key Required</div>
      <div className="sos-modal-sub">A one-time key was emailed to<br/><strong>{config.email||"admin email"}</strong></div>
      <span className="sos-scope-tag">{config.scopeLabel}</span>
      {config.type==="issue-fix" && <div className="sos-warn-bar">⚠ This will modify source files. Ensure git is committed.</div>}
      <div className="sos-digits-row">
        {digits.map((d,i) => (
          <React.Fragment key={i}>
            {i===3 && <span className="sos-digit-sep">–</span>}
            <input ref={refs[i]} className="sos-digit" type="text" maxLength={1} inputMode="numeric" value={d}
              onChange={e => handleDigit(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)} />
          </React.Fragment>
        ))}
      </div>
      {hasError && <div className="sos-modal-error">Incorrect key — check your email and try again</div>}
      <div className="sos-modal-actions">
        <button className="sos-btn-secondary" style={{ flex:1 }} onClick={onClose}>Cancel</button>
        <button className="sos-btn-primary" style={{ flex:1 }} onClick={handleVerify}
          disabled={verifying || digits.join("").length < 6}>
          {verifying ? "Verifying..." : "Authorize"}
        </button>
      </div>
    </div></div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ISSUE CARD
══════════════════════════════════════════════════════════════ */
function IssueCard({ item, type, fixedSet, onRequestFix }) {
  const [snippet, setSnippet] = useState(false);
  const [viewer,  setViewer]  = useState(false);
  const isFixed  = fixedSet.has(`${item.file}:${item.line}:${item.ruleId}`);
  const isError  = type === "error";

  return (
    <div className={`sos-issue-card ${isError?"sos-issue-card-error":"sos-issue-card-warning"}`}>
      <div className={isError?"sos-issue-sidebar-error":"sos-issue-sidebar-warning"} />
      <div className="sos-issue-body">
        <div className="sos-issue-top">
          <div className="sos-issue-meta">
            <div className="sos-issue-tags">
              <span className={`sos-chip ${isError?"sos-chip-critical":"sos-chip-medium"}`}>{type}</span>
              <span className={`sos-issue-rule sos-mono ${isError?"sos-issue-rule-error":"sos-issue-rule-warning"}`}>[{item.ruleId||"unknown"}]</span>
              {item.fixable && <span className="sos-chip sos-chip-fix">auto-fixable</span>}
              {isFixed      && <span className="sos-chip sos-chip-ok" style={{ fontSize:9 }}>✓ fixed</span>}
            </div>
            <div className="sos-issue-msg">{item.message}</div>
            <div className="sos-issue-location">
              <span className="sos-file-path">{item.file}</span>
              {item.line > 0 && <span className="sos-line-tag">line {item.line}{item.column > 0 ? `:${item.column}` : ""}</span>}
            </div>
          </div>
          <div className="sos-issue-actions">
            {item.source && <button className="sos-btn-ghost" onClick={() => { setSnippet(s=>!s); setViewer(false); }}>{snippet?"Hide snippet":"Code snippet"}</button>}
            <button className="sos-btn-blue" style={{ fontSize:11, padding:"5px 13px" }} onClick={() => { setViewer(v=>!v); setSnippet(false); }}>{viewer?"Close file":"View file"}</button>
            {!isFixed && <button className={item.fixable?"sos-btn-amber":"sos-btn-ghost"} onClick={() => onRequestFix(item, type)} title={item.fixable?"Auto-fix with ESLint":"Manual fix required"}>{item.fixable?"🔧 Fix Issue":"View Fix"}</button>}
          </div>
        </div>
        {snippet && item.source && (
          <div className="sos-code-block">
            <span style={{ color:"#94a3b8", marginRight:12, userSelect:"none", opacity:0.5 }}>{item.line}</span>
            <span style={{ color:"inherit" }}>{item.source}</span>
          </div>
        )}
        {viewer && <FileViewer file={item.file} line={item.line} type={type} onClose={() => setViewer(false)} />}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SYSTEM HEALTH TAB  ← NEW
══════════════════════════════════════════════════════════════ */
function HealthTab({ report, theme }) {
  const [live,        setLive]       = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveErr,     setLiveErr]    = useState("");

  const fetchLive = async () => {
    setLiveLoading(true); setLiveErr("");
    try {
      const r = await axios.get(`${API_BASE}/live-health`);
      setLive(r.data);
    } catch (e) {
      setLiveErr(e?.response?.data?.message || "Failed to fetch live health");
    } finally { setLiveLoading(false); }
  };

  useEffect(() => { fetchLive(); }, []);

  // Use live data if available, else fall back to last report's stored snapshot
  const h   = live?.health  || report?.systemHealth  || {};
  const env = live?.env     || report?.envAudit       || {};
  const ts  = live?.timestamp ? new Date(live.timestamp).toLocaleTimeString("en-IN") : null;

  // Thresholds stored in the health snapshot — these are what the server used
  // Falls back to safe defaults if not present (old reports)
  const thr = h.thresholds || {
    cpuWarning: 70, cpuCritical: 90,
    ramWarning: 75, ramCritical: 90,
    diskWarning: 75, diskCritical: 90,
  };

  // Color each metric using the actual thresholds that were applied
  const metricColor = (pct, warn, crit) =>
    (pct ?? 0) >= crit ? "sos-metric-val-red"
    : (pct ?? 0) >= warn ? "sos-metric-val-amber"
    : "sos-metric-val-green";

  const healthyMin = report?.systemHealth?.thresholds ? 80 : 80; // from settings
  const scoreColor = h.healthScore >= 80 ? "#3fb950" : h.healthScore >= 50 ? "#d29922" : "#f85149";

  return (
    <>
      {/* Live refresh bar */}
      <div className="sos-info-bar" style={{ marginBottom:14 }}>
        <span style={{ fontSize:16 }}>🖥</span>
        <div style={{ flex:1 }}>
          {live ? <span>Live system snapshot taken at <strong>{ts}</strong>. Click refresh to update.</span>
                : <span>Showing health data from last audit report. Click <strong>Refresh Live</strong> for current metrics.</span>}
          {liveErr && <span style={{ color:"#f85149", marginLeft:8 }}>⚠ {liveErr}</span>}
        </div>
        <button className="sos-btn-blue" onClick={fetchLive} disabled={liveLoading}>
          {liveLoading ? <><span className="sos-scan-spinner" style={{ display:"inline-block" }} /> Fetching…</> : "↻ Refresh Live"}
        </button>
      </div>

      {/* Health Score */}
      <div className="sos-two-col">
        <div className="sos-card" style={{ textAlign:"center" }}>
          <div className="sos-metric-lbl" style={{ marginBottom:8 }}>Overall Health Score</div>
          <div className="sos-health-score" style={{ color:scoreColor }}>{h.healthScore ?? "—"}</div>
          <div style={{ fontSize:12, color:"#94a3b8", margin:"4px 0" }}>/100</div>
          {h.healthStatus && (
            <span className={`sos-health-badge sos-health-badge-${h.healthStatus}`}>
              <span className="sos-pulse" />
              {h.healthStatus?.toUpperCase()}
            </span>
          )}
          {h.uptimeHuman && <div className="sos-metric-sub" style={{ marginTop:10 }}>Uptime: {h.uptimeHuman}</div>}
          {report?.scanDurationMs && <div className="sos-metric-sub">Last scan: {(report.scanDurationMs/1000).toFixed(1)}s</div>}
        </div>

        <div className="sos-card">
          <div className="sos-card-hd"><span>Runtime Info</span></div>
          {[
            { lbl:"Hostname",    val: h.hostname   || "—" },
            { lbl:"Platform",    val: h.platform && h.arch ? `${h.platform} / ${h.arch}` : "—" },
            { lbl:"Node.js",     val: h.nodeVersion || "—" },
            { lbl:"npm",         val: h.npmVersion  || "—" },
            { lbl:"PID",         val: h.pid         || "—" },
            { lbl:"Process RAM", val: h.processMemMB ? `${h.processMemMB} MB RSS` : "—" },
            { lbl:"Database",    val: h.dbStatus && h.dbName ? `${h.dbStatus} — ${h.dbName}` : h.dbStatus || "—" },
          ].map(r => (
            <div key={r.lbl} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:`1px solid ${theme.border}`, fontSize:12 }}>
              <span className="sos-muted">{r.lbl}</span>
              <span className="sos-mono" style={{ fontSize:11 }}>{r.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CPU / Memory / Disk */}
      <div className="sos-three-col">
        <div className="sos-card">
          <div className="sos-metric-lbl">CPU Usage</div>
          <div className={`sos-metric-val ${metricColor(h.cpuUsage, thr.cpuWarning, thr.cpuCritical)}`}>
            {h.cpuUsage ?? "—"}%
          </div>
          <UsageBar pct={h.cpuUsage} warn={thr.cpuWarning} crit={thr.cpuCritical} />
          <div className="sos-metric-sub" style={{ marginTop:8 }}>
            {h.cpuCores} cores · {h.cpuModel?.slice(0, 32) || "—"}
          </div>
          <div className="sos-metric-sub">
            Load: {h.loadAvg1}/{h.loadAvg5}/{h.loadAvg15}
          </div>
          <div className="sos-metric-sub" style={{ marginTop:4, opacity:0.5 }}>
            warn &gt;{thr.cpuWarning}% · crit &gt;{thr.cpuCritical}%
          </div>
        </div>

        <div className="sos-card">
          <div className="sos-metric-lbl">Memory Usage</div>
          <div className={`sos-metric-val ${metricColor(h.memUsagePct, thr.ramWarning, thr.ramCritical)}`}>
            {h.memUsagePct ?? "—"}%
          </div>
          <UsageBar pct={h.memUsagePct} warn={thr.ramWarning} crit={thr.ramCritical} />
          <div className="sos-metric-sub" style={{ marginTop:8 }}>
            {h.usedMemMB ? `${h.usedMemMB} MB used` : "—"}
          </div>
          <div className="sos-metric-sub">
            {h.totalMemMB ? `of ${h.totalMemMB} MB total` : ""}
          </div>
          <div className="sos-metric-sub" style={{ marginTop:4, opacity:0.5 }}>
            warn &gt;{thr.ramWarning}% · crit &gt;{thr.ramCritical}%
          </div>
        </div>

        <div className="sos-card">
          <div className="sos-metric-lbl">Disk Usage (root)</div>
          <div className={`sos-metric-val ${metricColor(h.diskUsagePct, thr.diskWarning, thr.diskCritical)}`}>
            {h.diskUsagePct ?? "—"}%
          </div>
          <UsageBar pct={h.diskUsagePct} warn={thr.diskWarning} crit={thr.diskCritical} />
          <div className="sos-metric-sub" style={{ marginTop:8 }}>
            {h.diskUsed ? `${h.diskUsed} used` : "—"}
          </div>
          <div className="sos-metric-sub">
            {h.diskFree ? `${h.diskFree} free of ${h.diskTotal}` : ""}
          </div>
          <div className="sos-metric-sub" style={{ marginTop:4, opacity:0.5 }}>
            warn &gt;{thr.diskWarning}% · crit &gt;{thr.diskCritical}%
          </div>
        </div>
      </div>

      {/* Score Calculation Explanation */}
      <div className="sos-card">
        <div className="sos-card-hd">
          <span>How This Score Is Calculated</span>
          <span className="sos-muted" style={{ fontSize:11 }}>Thresholds are configurable in ⚙ Settings</span>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:10 }}>
          {[
            {
              label: "CPU Usage",
              current: h.cpuUsage,
              warn: thr.cpuWarning,
              crit: thr.cpuCritical,
              penaltyWarn: -15,
              penaltyCrit: -30,
            },
            {
              label: "Memory Usage",
              current: h.memUsagePct,
              warn: thr.ramWarning,
              crit: thr.ramCritical,
              penaltyWarn: -10,
              penaltyCrit: -25,
            },
            {
              label: "Disk Usage",
              current: h.diskUsagePct,
              warn: thr.diskWarning,
              crit: thr.diskCritical,
              penaltyWarn: -10,
              penaltyCrit: -25,
            },
          ].map(m => {
            const isCrit = (m.current ?? 0) >= m.crit;
            const isWarn = !isCrit && (m.current ?? 0) >= m.warn;
            const status = isCrit ? "critical" : isWarn ? "warning" : "ok";
            const penalty = isCrit ? m.penaltyCrit : isWarn ? m.penaltyWarn : 0;
            const statusColor = isCrit ? "#f85149" : isWarn ? "#d29922" : "#3fb950";
            return (
              <div key={m.label} style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${isCrit ? "rgba(248,81,73,0.3)" : isWarn ? "rgba(210,153,34,0.3)" : "rgba(63,185,80,0.2)"}`, borderRadius:8, padding:"10px 12px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:11, fontWeight:600 }}>{m.label}</span>
                  <span style={{ fontSize:11, fontFamily:"monospace", color:statusColor, fontWeight:700 }}>
                    {penalty !== 0 ? penalty : "✓ +0"}
                  </span>
                </div>
                <div style={{ fontSize:10, color:"#94a3b8", marginBottom:4 }}>
                  Current: <span style={{ color:statusColor, fontWeight:600 }}>{m.current ?? "—"}%</span>
                </div>
                <div style={{ fontSize:10, color:"#94a3b8" }}>
                  <span style={{ color:"#d29922" }}>⚠ warn</span> &gt;{m.warn}% ({m.penaltyWarn} pts) &nbsp;
                  <span style={{ color:"#f85149" }}>✖ crit</span> &gt;{m.crit}% ({m.penaltyCrit} pts)
                </div>
                <div style={{ marginTop:6, fontSize:10, padding:"2px 8px", borderRadius:20, display:"inline-flex", alignItems:"center", gap:4, background: isCrit ? "rgba(248,81,73,0.1)" : isWarn ? "rgba(210,153,34,0.1)" : "rgba(63,185,80,0.1)", color:statusColor, border:`1px solid ${statusColor}40` }}>
                  {status.toUpperCase()}
                </div>
              </div>
            );
          })}
          {/* DB status card */}
          <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${h.dbStatus === "connected" ? "rgba(63,185,80,0.2)" : "rgba(248,81,73,0.3)"}`, borderRadius:8, padding:"10px 12px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontSize:11, fontWeight:600 }}>Database</span>
              <span style={{ fontSize:11, fontFamily:"monospace", color: h.dbStatus === "connected" ? "#3fb950" : "#f85149", fontWeight:700 }}>
                {h.dbStatus === "connected" ? "✓ +0" : "-20"}
              </span>
            </div>
            <div style={{ fontSize:10, color:"#94a3b8", marginBottom:4 }}>
              Status: <span style={{ color: h.dbStatus === "connected" ? "#3fb950" : "#f85149", fontWeight:600 }}>{h.dbStatus || "—"}</span>
            </div>
            <div style={{ fontSize:10, color:"#94a3b8" }}>Disconnected → -20 pts penalty</div>
            <div style={{ marginTop:6, fontSize:10, padding:"2px 8px", borderRadius:20, display:"inline-flex", alignItems:"center", gap:4, background: h.dbStatus === "connected" ? "rgba(63,185,80,0.1)" : "rgba(248,81,73,0.1)", color: h.dbStatus === "connected" ? "#3fb950" : "#f85149", border:`1px solid ${h.dbStatus === "connected" ? "#3fb95040" : "#f8514940"}` }}>
              {h.dbStatus === "connected" ? "CONNECTED" : "DISCONNECTED"}
            </div>
          </div>
        </div>
        <div style={{ marginTop:12, padding:"8px 12px", background:"rgba(59,130,246,0.08)", border:"1px solid rgba(59,130,246,0.2)", borderRadius:6, fontSize:11, color:"#94a3b8" }}>
          Score = 100 {h.cpuUsage >= thr.cpuCritical ? "− 30 (CPU critical)" : h.cpuUsage >= thr.cpuWarning ? "− 15 (CPU warning)" : ""}
          {h.memUsagePct >= thr.ramCritical ? " − 25 (RAM critical)" : h.memUsagePct >= thr.ramWarning ? " − 10 (RAM warning)" : ""}
          {h.diskUsagePct >= thr.diskCritical ? " − 25 (Disk critical)" : h.diskUsagePct >= thr.diskWarning ? " − 10 (Disk warning)" : ""}
          {h.dbStatus !== "connected" ? " − 20 (DB down)" : ""}
          {" = "}<strong style={{ color: h.healthScore >= 80 ? "#3fb950" : h.healthScore >= 50 ? "#d29922" : "#f85149" }}>{h.healthScore ?? "—"}</strong>
          <span style={{ marginLeft:12, opacity:0.6 }}>· Adjust thresholds in ⚙ Settings to match your server capacity</span>
        </div>
      </div>

      {/* Environment Audit */}
      <div className="sos-card">
        <div className="sos-card-hd">
          <span>Environment Variables Audit</span>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {env.missingVars?.length > 0
              ? <Pill color="red">{env.missingVars.length} missing</Pill>
              : <Pill color="green">All required vars set</Pill>}
            <span className="sos-muted" style={{ fontSize:11 }}>{env.totalEnvVars} total env vars</span>
          </div>
        </div>
        <div style={{ fontSize:11, color:"#94a3b8", marginBottom:8 }}>NODE_ENV: <span className="sos-mono" style={{ color:"#3fb950" }}>{env.nodeEnv || "—"}</span></div>

        {env.missingVars?.length > 0 && (
          <>
            <div className="sos-section-hd" style={{ marginBottom:6 }}>Missing Required Vars</div>
            <div style={{ marginBottom:12 }}>
              {env.missingVars.map((v) => <span key={v} className="sos-env-miss">✗ {v}</span>)}
            </div>
          </>
        )}

        {env.requiredVarsSet?.length > 0 && (
          <>
            <div className="sos-section-hd" style={{ marginBottom:6 }}>Configured Vars</div>
            <div>
              {env.requiredVarsSet.map((v) => <span key={v} className="sos-env-set">✓ {v}</span>)}
            </div>
          </>
        )}
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
function SystemReportPage() {
  const [tab,           setTab]           = useState("overview");
  const [loading,       setLoading]       = useState(false);
  const [scanning,      setScanning]      = useState(false);  // ← separate from loading
  const [report,        setReport]        = useState(null);
  const [history,       setHistory]       = useState([]);
  const [updateHistory, setUpdateHistory] = useState([]);
  const [pageError,     setPageError]     = useState("");
  const [settings,      setSettings]      = useState(null);
  const [settingsForm,  setSettingsForm]  = useState({
    intervalDays:   15,
    adminEmail:     "",
    timezone:       "Asia/Kolkata",
    requiredEnvVars: "",
    // Health threshold defaults — match server defaults
    cpuWarningPct:   70,
    cpuCriticalPct:  90,
    ramWarningPct:   75,
    ramCriticalPct:  90,
    diskWarningPct:  75,
    diskCriticalPct: 90,
    dbDownPenalty:   20,
    healthyMinScore: 80,
    warningMinScore: 50,
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMsg,  setSettingsMsg]    = useState("");
  const [approvedPkgs, setApprovedPkgs]  = useState({});
  const [fixedIssues,  setFixedIssues]   = useState(new Set());
  const [modal,        setModal]         = useState(null);
  const [downloading,  setDownloading]   = useState(false);
  const [runningNow,   setRunningNow]    = useState(false);
  const [scheduledData,setScheduledData] = useState(null);  // { at: Date } or null
  const [sidebarOpen,  setSidebarOpen]   = useState(true);
  const [currentTheme, setCurrentTheme]  = useState(() => {
    try { return localStorage.getItem("adminTheme") || "default"; } catch { return "default"; }
  });

  const theme = THEMES[currentTheme] || THEMES.default;

  useEffect(() => {
    try { localStorage.setItem("adminTheme", currentTheme); } catch {}
  }, [currentTheme]);

  /* ── API calls ── */
  const fetchLatest = useCallback(async () => {
    try { const r = await axios.get(`${API_BASE}/latest`); setReport(r.data.report); }
    catch { setPageError("Failed to load latest report"); }
  }, []);
  const fetchHistory      = useCallback(async () => { try { const r = await axios.get(`${API_BASE}/all`); setHistory(r.data.reports||[]); } catch {} }, []);
  const fetchUpdateHistory = useCallback(async () => { try { const r = await axios.get(`${API_BASE}/update-history`); setUpdateHistory(r.data.updates||[]); } catch {} }, []);
  const fetchSettings     = useCallback(async () => {
    try {
      const r = await axios.get(`${API_BASE}/settings`);
      const s = r.data.settings;
      setSettings(s);
      setSettingsForm({
        intervalDays:    s.intervalDays    || 15,
        adminEmail:      s.adminEmail      || "",
        timezone:        s.timezone        || "Asia/Kolkata",
        requiredEnvVars: (s.requiredEnvVars || []).join(", "),
        cpuWarningPct:   s.cpuWarningPct   ?? 70,
        cpuCriticalPct:  s.cpuCriticalPct  ?? 90,
        ramWarningPct:   s.ramWarningPct   ?? 75,
        ramCriticalPct:  s.ramCriticalPct  ?? 90,
        diskWarningPct:  s.diskWarningPct  ?? 75,
        diskCriticalPct: s.diskCriticalPct ?? 90,
        dbDownPenalty:   s.dbDownPenalty   ?? 20,
        healthyMinScore: s.healthyMinScore ?? 80,
        warningMinScore: s.warningMinScore ?? 50,
      });
    } catch {}
  }, []);

  useEffect(() => { fetchLatest(); fetchHistory(); fetchUpdateHistory(); fetchSettings(); }, []);

  const generateReport = async () => {
    setLoading(true); setPageError("");
    try {
      const r = await axios.post(`${API_BASE}/generate-report`);
      setReport(r.data.report);
      fetchHistory();
    } catch (e) {
      setPageError(e?.response?.data?.message || "Error generating report — check server logs.");
    } finally { setLoading(false); }
  };

  /* ── Download helpers ── */
  const handleDownloadJSON = async () => {
    if (!report) return;
    setDownloading(true);
    try {
      const r = await axios.get(`${API_BASE}/download/${report._id}`, { responseType:"blob" });
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement("a"); a.href = url;
      a.download = `stayos-audit-${new Date(report.createdAt).toISOString().split("T")[0]}.json`;
      a.click(); window.URL.revokeObjectURL(url);
    } catch { alert("Download failed"); }
    finally { setDownloading(false); }
  };

  const handleDownloadPDF = async () => {
    if (!report) return;
    setDownloading(true);
    try {
      const r = await axios.get(`${API_BASE}/download-pdf/${report._id}`, { responseType:"blob" });
      const url = window.URL.createObjectURL(new Blob([r.data], { type:"application/pdf" }));
      const a = document.createElement("a"); a.href = url;
      a.download = `stayos-audit-${new Date(report.createdAt).toISOString().split("T")[0]}.pdf`;
      a.click(); window.URL.revokeObjectURL(url);
    } catch { alert("PDF download failed"); }
    finally { setDownloading(false); }
  };

  /* ── Run now with polling ── */
  const handleRunNow = async () => {
    setRunningNow(true); setScanning(true); setScheduledData(null); setPageError("");
    try {
      await axios.post(`${API_BASE}/run-now`);
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        try {
          const r = await axios.get(`${API_BASE}/latest`);
          const newReport = r.data.report;
          const isNewer   = newReport && (!report || new Date(newReport.createdAt) > new Date(report.createdAt));
          if (isNewer) {
            setReport(newReport); fetchHistory();
            clearInterval(poll); setRunningNow(false); setScanning(false);
          }
        } catch {}
        if (attempts > 30) { clearInterval(poll); setRunningNow(false); setScanning(false); setPageError("Scan timed out — check server logs"); }
      }, 3000);
    } catch (e) {
      setPageError(e?.response?.data?.message || "Failed to start audit");
      setRunningNow(false); setScanning(false);
    }
  };

  const handleRunIn10 = async () => {
    try {
      const r = await axios.post(`${API_BASE}/run-in-10`);
      setScheduledData({ at: new Date(r.data.scheduledAt) });
    } catch (e) {
      setPageError(e?.response?.data?.message || "Failed to schedule run");
    }
  };

  /* ── Package approval ── */
  const handleApprovePackage = async (dep) => {
    try {
      const r = await axios.post(`${API_BASE}/approve-package`, { packageName:dep.name, currentVersion:dep.current, latestVersion:dep.latest });
      setModal({
        type:"package-update", keyId:r.data.keyId,
        scopeLabel:`${dep.name}  ${dep.current} → ${dep.latest}`,
        email:settings?.adminEmail || "admin email",
        successMsg:`${dep.name} update authorized (${dep.current} → ${dep.latest}).`,
        extra:{ packageName:dep.name, currentVersion:dep.current, latestVersion:dep.latest },
        onSuccess:() => { setApprovedPkgs(p => ({...p,[dep.name]:true})); fetchUpdateHistory(); },
      });
    } catch { alert("Failed to initiate package approval."); }
  };

  /* ── Fix approval ── */
  const handleApproveFix = async (item, type) => {
    if (!item.fixable) {
      alert(`Manual fix required:\n\nFile: ${item.file}\nLine: ${item.line}\nRule: ${item.ruleId}\n\nCode:\n${item.source||"N/A"}`);
      return;
    }
    try {
      const r = await axios.post(`${API_BASE}/approve-fix`, { fixType:type, targetFile:item.file, issueCount:1 });
      setModal({
        type:"issue-fix", keyId:r.data.keyId,
        scopeLabel:`Fix ${type}: [${item.ruleId}] in ${item.file}:${item.line}`,
        email:settings?.adminEmail || "admin email",
        successMsg:`ESLint --fix applied to ${item.file}.`,
        extra:{},
        onSuccess:() => { setFixedIssues(prev => new Set([...prev, `${item.file}:${item.line}:${item.ruleId}`])); fetchUpdateHistory(); },
      });
    } catch { alert("Failed to initiate fix approval."); }
  };

  const handleFixAll = async (type) => {
    const items   = type === "error" ? report?.errors : report?.warnings;
    const fixable = (items||[]).filter(i => i.fixable);
    if (!fixable.length) { alert("No auto-fixable issues of this type."); return; }
    try {
      const r = await axios.post(`${API_BASE}/approve-fix`, { fixType:type, targetFile:"all", issueCount:fixable.length });
      setModal({
        type:"issue-fix", keyId:r.data.keyId,
        scopeLabel:`Fix all ${fixable.length} auto-fixable ${type}(s)`,
        email:settings?.adminEmail || "admin email",
        successMsg:`ESLint --fix applied. ${fixable.length} ${type}(s) addressed.`,
        extra:{},
        onSuccess:() => {
          const upd = new Set(fixedIssues);
          fixable.forEach(i => upd.add(`${i.file}:${i.line}:${i.ruleId}`));
          setFixedIssues(upd); fetchUpdateHistory();
        },
      });
    } catch { alert("Failed to initiate bulk fix approval."); }
  };

  const handleSaveSettings = async () => {
    setSettingsSaving(true); setSettingsMsg("");
    try {
      const payload = {
        ...settingsForm,
        requiredEnvVars: settingsForm.requiredEnvVars
          ? settingsForm.requiredEnvVars.split(",").map(v => v.trim()).filter(Boolean)
          : undefined,
        // Health thresholds — sent as numbers
        cpuWarningPct:   Number(settingsForm.cpuWarningPct),
        cpuCriticalPct:  Number(settingsForm.cpuCriticalPct),
        ramWarningPct:   Number(settingsForm.ramWarningPct),
        ramCriticalPct:  Number(settingsForm.ramCriticalPct),
        diskWarningPct:  Number(settingsForm.diskWarningPct),
        diskCriticalPct: Number(settingsForm.diskCriticalPct),
        dbDownPenalty:   Number(settingsForm.dbDownPenalty),
        healthyMinScore: Number(settingsForm.healthyMinScore),
        warningMinScore: Number(settingsForm.warningMinScore),
      };
      await axios.post(`${API_BASE}/settings`, payload);
      setSettingsMsg("Settings saved. Cron schedule updated.");
      fetchSettings();
    } catch { setSettingsMsg("Failed to save settings."); }
    finally { setSettingsSaving(false); }
  };

  /* ── Derived counts ── */
  const pendingPkgCount = (report?.dependencies||[]).filter(d => !approvedPkgs[d.name]).length;
  const issueCount      = (report?.errors?.length||0) + (report?.warnings?.length||0);
  const secCount        = report?.security?.length || 0;
  const missingEnvCount = report?.envAudit?.missingVars?.length || 0;

  const TABS = [
    { k:"overview",  l:"Overview" },
    { k:"health",    l:"System Health", badge: missingEnvCount > 0 ? { n:missingEnvCount, c:"amber" } : null },
    { k:"report",    l:"Audit Report",  badge: issueCount > 0 ? { n:issueCount, c:"red" } : null },
    { k:"issues",    l:"Errors & Warnings", badge: issueCount > 0 ? { n:issueCount, c:"red" } : null },
    { k:"packages",  l:"Packages",      badge: pendingPkgCount > 0 ? { n:pendingPkgCount, c:"amber" } : null },
    { k:"history",   l:"History" },
    { k:"settings",  l:"⚙ Settings" },
  ];

  const RunControls = () => (
    <div className="sos-run-row">
      <span className="sos-run-row-label">Manual trigger:</span>
      <button className="sos-btn-green" onClick={handleRunNow} disabled={runningNow}>
        {runningNow ? <><span className="sos-scan-spinner" style={{ display:"inline-block", width:10, height:10, marginRight:5 }} />Scanning…</> : "▶ Run Now"}
      </button>
      <button className="sos-btn-blue" onClick={handleRunIn10} disabled={runningNow}>⏱ Run in 10 min</button>
      {scheduledData && (
        <span className="sos-scheduled-badge">
          Scheduled for {scheduledData.at.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}
        </span>
      )}
    </div>
  );

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:theme.background, color:theme.text }}>
      <div style={{ position:"fixed", left:0, top:0, height:"100vh", zIndex:1000 }}>
        <AdminMenu sidebarOpen={sidebarOpen} currentTheme={currentTheme} />
      </div>
      <div style={{ flex:1, marginLeft:sidebarOpen?"280px":"70px", transition:"margin-left 0.3s" }}>
        <Header currentTheme={currentTheme} setCurrentTheme={setCurrentTheme} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="sos">
          <style>{getCSS(theme)}</style>
          {modal && <KeyModal config={modal} onClose={() => setModal(null)} onSuccess={data => modal.onSuccess?.(data)} />}

          {/* Scan progress banner */}
          {scanning && (
            <div className="sos-scan-bar">
              <div className="sos-scan-spinner" />
              <span>System audit running — scanning packages, security vulnerabilities, code issues, and system health…</span>
            </div>
          )}

          {pageError && (
            <div style={{ margin:"10px 24px", padding:"10px 14px", background:"rgba(248,81,73,0.1)", border:"1px solid rgba(248,81,73,0.3)", borderRadius:8, fontSize:12, color:"#f85149", display:"flex", justifyContent:"space-between" }}>
              <span>⚠ {pageError}</span>
              <button style={{ background:"none", border:"none", color:"#f85149", cursor:"pointer", fontSize:12 }} onClick={() => setPageError("")}>✕</button>
            </div>
          )}

          {/* ── TABS ── */}
          <div className="sos-tab-bar">
            {TABS.map(t => (
              <button key={t.k} className={`sos-tab${tab===t.k?" active":""}`} onClick={() => setTab(t.k)}>
                {t.l}
                {t.badge && <span className={`sos-tab-badge ${t.badge.c==="red"?"sos-tab-badge-red":"sos-tab-badge-amber"}`}>{t.badge.n}</span>}
              </button>
            ))}
          </div>

          <div className="sos-content">

            {/* ════════════ OVERVIEW ════════════ */}
            {tab==="overview" && (
              <>
                <div className="sos-metric-grid">
                  {[
                    { lbl:"Last Audit",       val: report ? new Date(report.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short"}) : "—",   sub: report ? new Date(report.createdAt).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}) : "No report yet", cls:"sos-metric-val-green" },
                    { lbl:"Health Score",     val: report?.systemHealth?.healthScore ?? "—",  sub: report?.systemHealth?.healthStatus || "run audit",          cls: (report?.systemHealth?.healthScore||100) >= 80 ? "sos-metric-val-green" : (report?.systemHealth?.healthScore||100) >= 50 ? "sos-metric-val-amber" : "sos-metric-val-red" },
                    { lbl:"Packages Outdated",val: report?.dependencies?.length || 0,          sub:"dependencies found",                                    cls:"sos-metric-val-amber" },
                    { lbl:"Security CVEs",    val: secCount,                                    sub: secCount === 0 ? "no vulnerabilities" : "critical!",    cls: secCount > 0 ? "sos-metric-val-red" : "sos-metric-val-green" },
                    { lbl:"Errors",           val: report?.errors?.length || 0,                sub:`${report?.warnings?.length||0} warnings`,               cls:"sos-metric-val-red" },
                    { lbl:"Missing Env Vars", val: missingEnvCount,                             sub: missingEnvCount === 0 ? "all vars configured" : "check settings", cls: missingEnvCount > 0 ? "sos-metric-val-amber" : "sos-metric-val-green" },
                  ].map(m => (
                    <div key={m.lbl} className="sos-metric-card">
                      <div className="sos-metric-lbl">{m.lbl}</div>
                      <div className={`sos-metric-val ${m.cls}`}>{m.val}</div>
                      <div className="sos-metric-sub">{m.sub}</div>
                    </div>
                  ))}
                </div>

                {/* CPU / RAM mini summary from last report */}
                {report?.systemHealth && (
                  <div className="sos-three-col" style={{ marginBottom:14 }}>
                    {[
                      { lbl:"CPU", pct: report.systemHealth.cpuUsage, sub:`${report.systemHealth.cpuCores} cores · Load: ${report.systemHealth.loadAvg1}` },
                      { lbl:"RAM", pct: report.systemHealth.memUsagePct, sub:`${report.systemHealth.usedMemMB}MB / ${report.systemHealth.totalMemMB}MB` },
                      { lbl:"Disk", pct: report.systemHealth.diskUsagePct, sub:`${report.systemHealth.diskUsed} used · ${report.systemHealth.diskFree} free` },
                    ].map(r => (
                      <div key={r.lbl} className="sos-card" style={{ padding:"12px 16px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                          <span className="sos-metric-lbl">{r.lbl}</span>
                          <span className={`sos-mono ${(r.pct||0) >= 90 ? "sos-red-txt" : (r.pct||0) >= 70 ? "sos-amber" : "sos-green"}`} style={{ fontSize:13, fontWeight:700 }}>{r.pct ?? "—"}%</span>
                        </div>
                        <UsageBar pct={r.pct} theme={theme} />
                        <div className="sos-metric-sub" style={{ marginTop:5 }}>{r.sub}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="sos-two-col">
                  <div className="sos-card">
                    <div className="sos-card-hd"><span>Audit Schedule</span><Pill color="green">Active</Pill></div>
                    <div style={{ textAlign:"center", padding:"8px 0" }}>
                      <div style={{ fontSize:48, fontWeight:700, fontFamily:"\"SF Mono\",Consolas,monospace", color:theme.text, lineHeight:1 }}>{settings?.intervalDays||15}</div>
                      <div style={{ fontSize:11, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.1em", marginTop:4 }}>Day Interval</div>
                      <div style={{ fontSize:11, color:"#94a3b8", fontFamily:"\"SF Mono\",Consolas,monospace", marginTop:8, opacity:0.6 }}>Runs automatically via cron</div>
                      {settings?.cronExpression && <div style={{ fontSize:10, color:theme.primary, fontFamily:"\"SF Mono\",Consolas,monospace", marginTop:4 }}>{settings.cronExpression}</div>}
                    </div>
                    <RunControls />
                  </div>

                  <div className="sos-card">
                    <div className="sos-card-hd">
                      <span>Recent Activity</span>
                      <button className="sos-btn-ghost" onClick={generateReport} disabled={loading}>{loading?"Generating...":"+ Generate Report"}</button>
                    </div>
                    <div className="sos-act-list">
                      {history.slice(0,3).map((r,i) => (
                        <div key={i} className="sos-act-item">
                          <Dot color="green" />
                          <div>
                            <div className="sos-act-text">Audit report generated{r.systemHealth?.healthScore != null ? ` · Health: ${r.systemHealth.healthScore}/100` : ""}</div>
                            <div className="sos-act-time">{new Date(r.createdAt).toLocaleString("en-IN")}</div>
                          </div>
                        </div>
                      ))}
                      {updateHistory.slice(0,2).map((u,i) => (
                        <div key={i} className="sos-act-item">
                          <Dot color={u.actionType==="issue-fix"?"amber":"blue"} />
                          <div>
                            <div className="sos-act-text">{u.actionType==="issue-fix"?`Fixed ${u.fixType}s in ${u.targetFile}`:`${u.packageName} ${u.fromVersion} → ${u.toVersion}`}</div>
                            <div className="sos-act-time">{new Date(u.createdAt).toLocaleString("en-IN")}</div>
                          </div>
                        </div>
                      ))}
                      {!history.length && !updateHistory.length && (
                        <div className="sos-act-item"><Dot color="blue" /><div className="sos-act-text sos-hint">No activity yet. Generate a report to start.</div></div>
                      )}
                    </div>
                  </div>
                </div>

                {report && (
                  <div className="sos-card">
                    <div className="sos-card-hd">
                      <span>Last Report · {new Date(report.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>
                      <div style={{ display:"flex",gap:8 }}>
                        <button className="sos-btn-ghost" onClick={handleDownloadJSON} disabled={downloading}>⬇ JSON</button>
                        <button className="sos-btn-ghost" onClick={handleDownloadPDF}  disabled={downloading}>⬇ PDF</button>
                        <button className="sos-btn-ghost" onClick={() => setTab("issues")}>View Issues ↗</button>
                      </div>
                    </div>
                    <div className="sos-sum-grid">
                      <div className="sos-sum-cell sos-sum-amber"><div className="sos-sum-cell-text">{report.dependencies?.length||0}</div><div className="sos-sum-cell-lbl">Outdated Pkgs</div></div>
                      <div className="sos-sum-cell sos-sum-red"><div className="sos-sum-cell-text">{secCount}</div><div className="sos-sum-cell-lbl">CVEs</div></div>
                      <div className="sos-sum-cell sos-sum-red"><div className="sos-sum-cell-text">{report.errors?.length||0}</div><div className="sos-sum-cell-lbl">Errors</div></div>
                      <div className="sos-sum-cell sos-sum-amber"><div className="sos-sum-cell-text">{report.warnings?.length||0}</div><div className="sos-sum-cell-lbl">Warnings</div></div>
                      <div className="sos-sum-cell sos-sum-amber"><div className="sos-sum-cell-text">{missingEnvCount}</div><div className="sos-sum-cell-lbl">Missing Env</div></div>
                      <div className="sos-sum-cell sos-sum-blue"><div className="sos-sum-cell-text">{report.systemHealth?.healthScore ?? "—"}</div><div className="sos-sum-cell-lbl">Health Score</div></div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ════════════ SYSTEM HEALTH ════════════ */}
            {tab==="health" && <HealthTab report={report} theme={theme} />}

            {/* ════════════ AUDIT REPORT ════════════ */}
            {tab==="report" && (
              !report ? (
                <div className="sos-card sos-empty">No report generated yet.<div style={{ marginTop:16 }}><button className="sos-btn-primary" onClick={generateReport} disabled={loading}>{loading?"Generating...":"Generate Report"}</button></div></div>
              ) : (
                <div className="sos-card">
                  <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8, paddingBottom:14, borderBottom:`1px solid ${theme.border}`, marginBottom:14 }}>
                    <div>
                      <div style={{ fontSize:15, fontWeight:600 }}>Audit Report</div>
                      <div className="sos-mono sos-muted" style={{ fontSize:11, marginTop:3 }}>
                        {new Date(report.createdAt).toLocaleString("en-IN")} · {settings?.adminEmail || "admin"}
                        {report.scanDurationMs && <span> · scan took {(report.scanDurationMs/1000).toFixed(1)}s</span>}
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <button className="sos-btn-ghost" onClick={handleDownloadJSON} disabled={downloading}>⬇ JSON</button>
                      <button className="sos-btn-ghost" onClick={handleDownloadPDF}  disabled={downloading}>⬇ PDF</button>
                      <Pill color="green">Delivered</Pill>
                    </div>
                  </div>
                  <div className="sos-sum-grid" style={{ marginBottom:16 }}>
                    {[
                      {n:report.systemHealth?.healthScore??100, lbl:"Health Score",    cls: (report.systemHealth?.healthScore||100)>=80?"sos-sum-green":"sos-sum-red" },
                      {n:report.dependencies?.length||0,        lbl:"Outdated Pkgs",  cls:"sos-sum-amber"},
                      {n:secCount,                               lbl:"Security CVEs",  cls:secCount>0?"sos-sum-red":"sos-sum-green"},
                      {n:report.errors?.length||0,              lbl:"Errors",         cls:"sos-sum-red"},
                      {n:report.warnings?.length||0,            lbl:"Warnings",       cls:"sos-sum-amber"},
                      {n:missingEnvCount,                        lbl:"Missing Env",    cls:missingEnvCount>0?"sos-sum-amber":"sos-sum-green"},
                    ].map(m => (
                      <div key={m.lbl} className={`sos-sum-cell ${m.cls}`}>
                        <div className="sos-sum-cell-text">{m.n}</div>
                        <div className="sos-sum-cell-lbl">{m.lbl}</div>
                      </div>
                    ))}
                  </div>
                  {report.security?.length>0 && (
                    <>
                      <div className="sos-section-hd">Security Vulnerabilities ({report.security.length})</div>
                      {report.security.map((s,i) => (
                        <div key={i} className="sos-sec-card sos-sec-card-high sos-sec-card-standalone">
                          <div className="sos-sec-icon">⚠</div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:12, fontWeight:600, marginBottom:3 }}>{s.issue}</div>
                            <div style={{ fontSize:11 }}><span className="sos-mono sos-red-txt">{s.package}</span><span className="sos-muted"> · {s.severity}</span>{s.cve && <span className="sos-muted"> · {s.cve}</span>}</div>
                          </div>
                          <SevPill sev={s.severity} />
                        </div>
                      ))}
                      <div style={{ marginBottom:14 }} />
                    </>
                  )}
                  {report.errors?.length>0 && (
                    <>
                      <div className="sos-section-hd"><span>Errors ({report.errors.length})</span><button className="sos-btn-ghost" onClick={()=>setTab("issues")}>See all ↗</button></div>
                      {report.errors.slice(0,3).map((e,i) => <IssueCard key={i} item={e} type="error" fixedSet={fixedIssues} onRequestFix={handleApproveFix} />)}
                      {report.errors.length>3 && <div style={{ fontSize:11, color:theme.textSecondary, textAlign:"center", marginBottom:12 }}>+{report.errors.length-3} more — <button className="sos-btn-ghost" style={{ padding:"2px 8px" }} onClick={()=>setTab("issues")}>View all</button></div>}
                    </>
                  )}
                  {report.warnings?.length>0 && (
                    <>
                      <div className="sos-section-hd" style={{ marginTop:14 }}><span>Warnings ({report.warnings.length})</span><button className="sos-btn-ghost" onClick={()=>setTab("issues")}>See all ↗</button></div>
                      {report.warnings.slice(0,3).map((w,i) => <IssueCard key={i} item={w} type="warning" fixedSet={fixedIssues} onRequestFix={handleApproveFix} />)}
                    </>
                  )}
                  {!report.errors?.length&&!report.warnings?.length&&!report.security?.length && (
                    <div className="sos-empty sos-empty-green">✓ No code issues or vulnerabilities found</div>
                  )}
                </div>
              )
            )}

            {/* ════════════ ERRORS & WARNINGS ════════════ */}
            {tab==="issues" && (
              !report ? (
                <div className="sos-card sos-empty">No report available.<div style={{ marginTop:16 }}><button className="sos-btn-primary" onClick={generateReport} disabled={loading}>{loading?"Generating...":"Generate Report"}</button></div></div>
              ) : (
                <>
                  <div className="sos-info-bar">
                    <div style={{ fontSize:16, flexShrink:0 }}>🔍</div>
                    <div>Issues scanned via ESLint (regex fallback). Click <strong>View file</strong> to see highlighted source. Click <strong>🔧 Fix Issue</strong> to authorize an auto-fix via security key.</div>
                  </div>
                  {report.errors?.length>0 && (
                    <div className="sos-card">
                      <div className="sos-card-hd">
                        <div className="sos-card-hd-left"><span>Errors</span><span className="sos-chip sos-chip-critical">{report.errors.length}</span><span className="sos-muted" style={{ fontSize:11 }}>· {report.errors.filter(e=>e.fixable).length} auto-fixable</span></div>
                        {report.errors.some(e=>e.fixable) && <button className="sos-btn-red" onClick={() => handleFixAll("error")}>🔧 Fix All Errors</button>}
                      </div>
                      {report.errors.map((e,i) => <IssueCard key={i} item={e} type="error" fixedSet={fixedIssues} onRequestFix={handleApproveFix} />)}
                    </div>
                  )}
                  {report.warnings?.length>0 && (
                    <div className="sos-card">
                      <div className="sos-card-hd">
                        <div className="sos-card-hd-left"><span>Warnings</span><span className="sos-chip sos-chip-medium">{report.warnings.length}</span><span className="sos-muted" style={{ fontSize:11 }}>· {report.warnings.filter(w=>w.fixable).length} auto-fixable</span></div>
                        {report.warnings.some(w=>w.fixable) && <button className="sos-btn-amber" onClick={() => handleFixAll("warning")}>🔧 Fix All Warnings</button>}
                      </div>
                      {report.warnings.map((w,i) => <IssueCard key={i} item={w} type="warning" fixedSet={fixedIssues} onRequestFix={handleApproveFix} />)}
                    </div>
                  )}
                  {!report.errors?.length&&!report.warnings?.length && <div className="sos-card sos-empty sos-empty-green">✓ No errors or warnings found</div>}
                </>
              )
            )}

            {/* ════════════ PACKAGES ════════════ */}
            {tab==="packages" && (
              !report ? (
                <div className="sos-card sos-empty">No report available.<div style={{ marginTop:16 }}><button className="sos-btn-primary" onClick={generateReport} disabled={loading}>{loading?"Generating...":"Generate Report"}</button></div></div>
              ) : (
                <>
                  <div className="sos-info-bar">
                    <div style={{ fontSize:16, flexShrink:0 }}>🔐</div>
                    <div>Approving an update sends a <strong>one-time security key</strong> to <strong>{settings?.adminEmail||"admin"}</strong>. Each key expires in 30 minutes and is single-use.</div>
                  </div>
                  {report.security?.length>0 && (
                    <div className="sos-card">
                      <div className="sos-card-hd"><span>Security Vulnerabilities</span><Pill color="red">{report.security.length} CVEs</Pill></div>
                      {report.security.map((s,i) => {
                        const dep = (report.dependencies||[]).find(d => d.name === s.package);
                        return (
                          <div key={i} style={{ marginBottom:14 }}>
                            <div className="sos-sec-card sos-sec-card-high">
                              <div className="sos-sec-icon">⚠</div>
                              <div style={{ flex:1 }}>
                                <div style={{ fontSize:12, fontWeight:600, marginBottom:2 }}>{s.issue}</div>
                                <div style={{ fontSize:11 }}><span className="sos-mono sos-red-txt">{s.package}</span><span className="sos-muted"> · {s.severity}</span>{s.cve&&<span className="sos-muted"> · {s.cve}</span>}</div>
                              </div>
                              <SevPill sev={s.severity} />
                            </div>
                            <div className="sos-table-outer-nb-red">
                              <table className="sos-table" style={{ minWidth:400 }}>
                                <thead><tr>{["Package","Current","Wanted","→ Latest","Action"].map(h=><th key={h} className="sos-th">{h}</th>)}</tr></thead>
                                <tbody>
                                  <tr className="sos-tr-last">
                                    <td className="sos-td sos-mono">{s.package}</td>
                                    <td className="sos-td sos-mono sos-muted">{dep?.current||"—"}</td>
                                    <td className="sos-td sos-mono sos-amber">{dep?.wanted||"—"}</td>
                                    <td className="sos-td sos-mono sos-green">{dep?.latest||"latest"}</td>
                                    <td className="sos-td">
                                      {approvedPkgs[s.package]
                                        ? <span className="sos-mono sos-green" style={{ fontSize:11 }}>✓ Approved</span>
                                        : dep ? <button className="sos-btn-green" onClick={() => handleApprovePackage(dep)}>Approve Update</button>
                                              : <span className="sos-muted" style={{ fontSize:11 }}>No update found</span>}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {/* ── Non-CVE outdated packages ── */}
                  {(() => {
                    // Packages that need updates but have NO security CVE
                    const nonSecDeps = (report.dependencies||[]).filter(
                      d => !(report.security||[]).find(s => s.package === d.name)
                    );
                    // Split by urgency: major updates need more attention
                    const majorDeps = nonSecDeps.filter(d => d.type === "major");
                    const minorDeps = nonSecDeps.filter(d => d.type !== "major");
                    const approvedCount = nonSecDeps.filter(d => approvedPkgs[d.name]).length;
                    const pendingCount  = nonSecDeps.filter(d => !approvedPkgs[d.name]).length;

                    if (!nonSecDeps.length) return (
                      <div className="sos-card">
                        <div className="sos-card-hd"><span>Outdated Packages (non-security)</span><Pill color="green">All clear</Pill></div>
                        <div className="sos-empty sos-empty-green" style={{ padding:"20px" }}>✓ No outdated packages outside of security CVEs</div>
                      </div>
                    );

                    return (
                      <div className="sos-card">
                        <div className="sos-card-hd">
                          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                            <span>Outdated Packages</span>
                            {pendingCount > 0  && <Pill color="amber">{pendingCount} need update</Pill>}
                            {approvedCount > 0 && <Pill color="green">{approvedCount} approved ✓</Pill>}
                            {majorDeps.length > 0 && <span style={{ fontSize:11, color:"#f85149" }}>⚠ {majorDeps.length} major version jump{majorDeps.length>1?"s":""}</span>}
                          </div>
                        </div>

                        {/* Up-to-date summary chip */}
                        <div style={{ marginBottom:12, padding:"8px 12px", background:"rgba(63,185,80,0.06)", border:"1px solid rgba(63,185,80,0.2)", borderRadius:8, fontSize:11, color:"#94a3b8", display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ color:"#3fb950", fontSize:14 }}>✓</span>
                          Packages <strong style={{ color:"#3fb950" }}>not</strong> listed here are already up to date.
                          <span style={{ marginLeft:"auto", fontSize:10 }}>npm outdated only reports packages that need updates</span>
                        </div>

                        <div className="sos-table-outer">
                          <table className="sos-table">
                            <thead>
                              <tr>
                                {["Package","Source","Current","Wanted","→ Latest","Type","Status","Action"].map(h=>(
                                  <th key={h} className="sos-th">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {nonSecDeps.map((d, i, arr) => {
                                const isApproved = !!approvedPkgs[d.name];
                                const isMajor    = d.type === "major";
                                const rowBg      = isApproved
                                  ? "rgba(63,185,80,0.04)"
                                  : isMajor
                                  ? "rgba(248,81,73,0.04)"
                                  : "transparent";
                                return (
                                  <tr key={i} className={i===arr.length-1?"sos-tr-last":""} style={{ background:rowBg }}>
                                    <td className="sos-td sos-mono" style={{ fontWeight: isMajor ? 600 : 400 }}>{d.name}</td>
                                    <td className="sos-td sos-muted" style={{ fontSize:11 }}>{d.source||"—"}</td>
                                    <td className="sos-td sos-mono sos-muted">{d.current}</td>
                                    <td className="sos-td sos-mono" style={{ color: d.wanted !== d.current ? "#d29922" : "#94a3b8" }}>{d.wanted || d.current}</td>
                                    <td className="sos-td sos-mono sos-green">{d.latest}</td>
                                    <td className="sos-td">
                                      <span className={`sos-chip ${
                                        d.type === "major"   ? "sos-chip-critical" :
                                        d.type === "minor"   ? "sos-chip-medium"   :
                                        d.type === "missing" ? "sos-chip-high"     :
                                        "sos-chip-ok"
                                      }`}>{d.type}</span>
                                    </td>
                                    <td className="sos-td">
                                      {isApproved
                                        ? <span style={{ fontSize:11, color:"#3fb950", display:"flex", alignItems:"center", gap:4 }}>
                                            <span style={{ width:6, height:6, borderRadius:"50%", background:"#3fb950", display:"inline-block" }} />
                                            Up to date
                                          </span>
                                        : <span style={{ fontSize:11, color:"#d29922" }}>Needs update</span>
                                      }
                                    </td>
                                    <td className="sos-td">
                                      {isApproved
                                        ? <span className="sos-mono sos-green" style={{ fontSize:11 }}>✓ Approved</span>
                                        : <button className="sos-btn-green" onClick={() => handleApprovePackage(d)}>Approve Update</button>
                                      }
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ── All up to date (no dependencies at all) ── */}
                  {!report.dependencies?.length && (
                    <div className="sos-card" style={{ border:"1px solid rgba(63,185,80,0.3)", background:"rgba(63,185,80,0.04)" }}>
                      <div className="sos-card-hd"><span>Package Status</span><Pill color="green">All up to date ✓</Pill></div>
                      <div className="sos-empty sos-empty-green" style={{ padding:"20px" }}>
                        ✓ All installed packages are running their latest versions
                      </div>
                    </div>
                  )}
                </>
              )
            )}

            {/* ════════════ HISTORY ════════════ */}
            {tab==="history" && (
              <>
                <div className="sos-card">
                  <div className="sos-card-hd"><span>Package Updates &amp; Issue Fixes</span><Pill color="gray">{updateHistory.length} records</Pill></div>
                  {!updateHistory.length ? <div className="sos-empty">No actions taken yet.</div> : (
                    <div className="sos-table-outer">
                      <table className="sos-table" style={{ minWidth:580 }}>
                        <thead><tr>{["Date & Time","Type","Target / Package","Change","Security Key","Status"].map(h=><th key={h} className="sos-th">{h}</th>)}</tr></thead>
                        <tbody>
                          {updateHistory.map((u,i)=>(
                            <tr key={i} className={i===updateHistory.length-1?"sos-tr-last":""}>
                              <td className="sos-td sos-mono" style={{ fontSize:11 }}>{new Date(u.createdAt).toLocaleString("en-IN")}</td>
                              <td className="sos-td"><Chip type={u.actionType} /></td>
                              <td className="sos-td sos-mono" style={{ fontSize:11 }}>{u.packageName||u.targetFile||"—"}</td>
                              <td className="sos-td sos-mono" style={{ fontSize:11 }}>
                                {u.actionType==="package-update"
                                  ? <><span className="sos-muted">{u.fromVersion}</span>{" → "}<span className="sos-green">{u.toVersion}</span></>
                                  : <span className="sos-amber">{u.issuesFixed||0} {u.fixType}(s)</span>}
                              </td>
                              <td className="sos-td"><KeyCell keyVal={u.securityKey||"—"} /></td>
                              <td className="sos-td"><span className="sos-chip sos-chip-ok">Success</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="sos-card">
                  <div className="sos-card-hd"><span>Audit Reports Archive</span><Pill color="gray">{history.length} reports</Pill></div>
                  {!history.length ? <div className="sos-empty">No reports yet.</div> : (
                    <div className="sos-table-outer">
                      <table className="sos-table" style={{ minWidth:560 }}>
                        <thead><tr>{["Generated","Health","Dependencies","Security","Errors","Warnings","Download"].map(h=><th key={h} className="sos-th">{h}</th>)}</tr></thead>
                        <tbody>
                          {history.map((r,i)=>(
                            <tr key={i} className={i===history.length-1?"sos-tr-last":""}>
                              <td className="sos-td sos-mono" style={{ fontSize:11 }}>{new Date(r.createdAt).toLocaleString("en-IN")}</td>
                              <td className="sos-td">
                                {r.systemHealth?.healthScore != null
                                  ? <span className={`sos-chip ${r.systemHealth.healthScore>=80?"sos-chip-ok":r.systemHealth.healthScore>=50?"sos-chip-medium":"sos-chip-critical"}`}>{r.systemHealth.healthScore}</span>
                                  : <span className="sos-chip sos-chip-info">—</span>}
                              </td>
                              <td className="sos-td"><span className={`sos-chip ${r.dependencies?.length>0?"sos-chip-medium":"sos-chip-ok"}`}>{r.dependencies?.length||0}</span></td>
                              <td className="sos-td"><span className={`sos-chip ${r.security?.length>0?"sos-chip-critical":"sos-chip-ok"}`}>{r.security?.length||0}</span></td>
                              <td className="sos-td"><span className={`sos-chip ${r.errors?.length>0?"sos-chip-high":"sos-chip-ok"}`}>{r.errors?.length||0}</span></td>
                              <td className="sos-td"><span className={`sos-chip ${r.warnings?.length>0?"sos-chip-medium":"sos-chip-ok"}`}>{r.warnings?.length||0}</span></td>
                              <td className="sos-td" style={{ display:"flex", gap:6 }}>
                                <button className="sos-btn-ghost" style={{ fontSize:10, padding:"2px 8px" }} onClick={() => { window.open(`${API_BASE}/download/${r._id}`,"_blank"); }}>JSON</button>
                                <button className="sos-btn-ghost" style={{ fontSize:10, padding:"2px 8px" }} onClick={() => { window.open(`${API_BASE}/download-pdf/${r._id}`,"_blank"); }}>PDF</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ════════════ SETTINGS ════════════ */}
            {tab==="settings" && (
              <>
                <div className="sos-card">
                  <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>Audit Schedule Configuration</div>
                  <div className="sos-muted" style={{ fontSize:12, marginBottom:20, lineHeight:1.6 }}>
                    All settings are dynamic — no code changes needed. The cron job restarts immediately after saving.
                  </div>
                  {/* ── Schedule & Email ── */}
                  <div style={{ fontSize:12, fontWeight:600, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Schedule & Email</div>
                  <div className="sos-form-grid">
                    <div>
                      <div className="sos-form-label">Audit Interval</div>
                      <select className="sos-select" value={settingsForm.intervalDays} onChange={e => setSettingsForm(f=>({...f,intervalDays:Number(e.target.value)}))}>
                        {[1,3,7,14,15,30,60,90].map(d => <option key={d} value={d}>Every {d} day{d>1?"s":""}</option>)}
                      </select>
                      <div className="sos-form-hint">Current: every {settings?.intervalDays||15} days · {settings?.cronExpression}</div>
                    </div>
                    <div>
                      <div className="sos-form-label">Admin Email (reports & security keys)</div>
                      <input className="sos-input" type="email" placeholder="admin@yourdomain.com"
                        value={settingsForm.adminEmail} onChange={e => setSettingsForm(f=>({...f,adminEmail:e.target.value}))} />
                      <div className="sos-form-hint">
                        Fallback order: this field → role:admin user email → EMAIL_USER env var
                        {settings?.adminEmail ? ` · Current: ${settings.adminEmail}` : " · not set — using userModel admin email"}
                      </div>
                    </div>
                    <div>
                      <div className="sos-form-label">Timezone</div>
                      <input className="sos-input" placeholder="Asia/Kolkata"
                        value={settingsForm.timezone} onChange={e => setSettingsForm(f=>({...f,timezone:e.target.value}))} />
                      <div className="sos-form-hint">IANA timezone e.g. Asia/Kolkata, UTC, America/New_York</div>
                    </div>
                    <div>
                      <div className="sos-form-label">Required Env Vars to Audit (comma-separated)</div>
                      <input className="sos-input" placeholder="NODE_ENV, MONGO_URL, EMAIL_USER, EMAIL_PASS, DEV_MODE"
                        value={settingsForm.requiredEnvVars} onChange={e => setSettingsForm(f=>({...f,requiredEnvVars:e.target.value}))} />
                      <div className="sos-form-hint">
                        Checked every audit. Uses EMAIL_USER, EMAIL_PASS, DEV_MODE by default.
                      </div>
                    </div>
                  </div>

                  {/* ── Health Score Thresholds ── */}
                  <div className="sos-divider" />
                  <div style={{ fontSize:12, fontWeight:600, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>Health Score Thresholds</div>
                  <div style={{ fontSize:12, color:"#64748b", marginBottom:14, lineHeight:1.6 }}>
                    These thresholds define how the health score (0–100) is calculated.
                    The score starts at 100 and penalties are deducted based on usage levels.
                    <br/>
                    <span style={{ fontSize:11, fontFamily:"monospace", color:"#94a3b8" }}>
                      CPU crit: −30 · CPU warn: −15 · RAM crit: −25 · RAM warn: −10 · Disk crit: −25 · Disk warn: −10 · DB down: −{settingsForm.dbDownPenalty}
                    </span>
                  </div>
                  <div className="sos-form-grid">
                    {[
                      { key:"cpuWarningPct",   label:"CPU Warning %",    hint:"Above this → −15 pts",  color:"#d29922" },
                      { key:"cpuCriticalPct",  label:"CPU Critical %",   hint:"Above this → −30 pts",  color:"#f85149" },
                      { key:"ramWarningPct",   label:"RAM Warning %",    hint:"Above this → −10 pts",  color:"#d29922" },
                      { key:"ramCriticalPct",  label:"RAM Critical %",   hint:"Above this → −25 pts",  color:"#f85149" },
                      { key:"diskWarningPct",  label:"Disk Warning %",   hint:"Above this → −10 pts",  color:"#d29922" },
                      { key:"diskCriticalPct", label:"Disk Critical %",  hint:"Above this → −25 pts",  color:"#f85149" },
                      { key:"dbDownPenalty",   label:"DB Down Penalty",  hint:"Deducted when DB is not connected", color:"#f85149" },
                      { key:"healthyMinScore", label:"Healthy Min Score",hint:"Score ≥ this = 🟢 healthy",         color:"#3fb950" },
                      { key:"warningMinScore", label:"Warning Min Score",hint:"Score ≥ this = 🟡 warning, below = 🔴 critical", color:"#d29922" },
                    ].map(f => (
                      <div key={f.key}>
                        <div className="sos-form-label" style={{ display:"flex", justifyContent:"space-between" }}>
                          <span>{f.label}</span>
                          <span style={{ color:f.color, fontFamily:"monospace", fontSize:11 }}>{settingsForm[f.key]}{f.key.includes("Pct") ? "%" : " pts"}</span>
                        </div>
                        <input
                          className="sos-input"
                          type="number" min={0} max={f.key.includes("Pct") ? 100 : 50}
                          value={settingsForm[f.key]}
                          onChange={e => setSettingsForm(f2=>({...f2,[f.key]:Number(e.target.value)}))}
                        />
                        <div className="sos-form-hint">{f.hint}</div>
                      </div>
                    ))}
                  </div>
                  <div className="sos-save-row">
                    <button className="sos-btn-primary" onClick={handleSaveSettings} disabled={settingsSaving}>{settingsSaving?"Saving...":"Save Settings"}</button>
                    {settingsMsg && <span className={settingsMsg.includes("Failed")?"sos-save-msg-err":"sos-save-msg-ok"}>{settingsMsg}</span>}
                  </div>
                  <RunControls />
                </div>

                {settings && (
                  <div className="sos-card">
                    <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>Live Configuration</div>
                    <div className="sos-config-grid">
                      {[
                        { lbl:"Interval",          val:`Every ${settings.intervalDays} days`,      ok:true },
                        { lbl:"Admin Email",        val:settings.adminEmail||"Using userModel admin", ok:true },
                        { lbl:"Cron Expression",    val:settings.cronExpression||"—",               ok:true },
                        { lbl:"Timezone",           val:settings.timezone||"Asia/Kolkata",          ok:true },
                        { lbl:"Env Vars Audited",   val:`${(settings.requiredEnvVars||[]).length} vars`, ok:true },
                        { lbl:"CPU Thresholds",     val:`warn ${settings.cpuWarningPct??70}% / crit ${settings.cpuCriticalPct??90}%`, ok:true },
                        { lbl:"RAM Thresholds",     val:`warn ${settings.ramWarningPct??75}% / crit ${settings.ramCriticalPct??90}%`, ok:true },
                        { lbl:"Disk Thresholds",    val:`warn ${settings.diskWarningPct??75}% / crit ${settings.diskCriticalPct??90}%`, ok:true },
                        { lbl:"Healthy Score ≥",    val:`${settings.healthyMinScore??80} pts`,      ok:true },
                        { lbl:"Last Updated",       val:settings.updatedAt?new Date(settings.updatedAt).toLocaleDateString("en-IN"):"—", ok:true },
                      ].map(r => (
                        <div key={r.lbl} className={`sos-config-cell ${r.ok?"sos-config-cell-ok":"sos-config-cell-warn"}`}>
                          <div className="sos-config-lbl">{r.lbl}</div>
                          <div className="sos-config-val">{r.val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

          </div>{/* sos-content */}
        </div>{/* .sos */}
      </div>
    </div>
  );
}

export default SystemReportPage;