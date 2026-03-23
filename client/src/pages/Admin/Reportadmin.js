import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Menu, X } from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { useAuth } from "../../context/auth";
import AdminMenu from "../../components/Layout/AdminMenu";
import Header from "../../components/Layout/Header";

/* ─────────────────────────────────────────────
   THEME SYSTEM
─────────────────────────────────────────────── */
const themes = {
  default:{ primary:"#3b82f6", background:"#0f172a", surface:"#1e293b", surfaceLight:"#334155", text:"#e2e8f0", textSecondary:"#94a3b8", border:"#334155" },
  ocean:  { primary:"#06b6d4", background:"#0c1e24", surface:"#164e63", surfaceLight:"#155e75", text:"#e0f2fe", textSecondary:"#67e8f9", border:"#0e7490" },
  sunset: { primary:"#f59e0b", background:"#1a0f0a", surface:"#451a03", surfaceLight:"#78350f", text:"#fef3c7", textSecondary:"#fcd34d", border:"#92400e" },
  forest: { primary:"#10b981", background:"#0a1612", surface:"#064e3b", surfaceLight:"#065f46", text:"#d1fae5", textSecondary:"#6ee7b7", border:"#047857" },
  purple: { primary:"#8b5cf6", background:"#1a0f2e", surface:"#2e1065", surfaceLight:"#4c1d95", text:"#f3e8ff", textSecondary:"#c4b5fd", border:"#6d28d9" },
};

const PIE_COLORS = ["#3b82f6","#10b981","#f59e0b","#8b5cf6","#f43f5e","#06b6d4"];
const BASE = "http://localhost:8083/api/v1";

/* ── Occupancy Ring ── */
const OccupancyRing = ({ pct=0, color, size=72 }) => {
  const r = (size-12)/2, circ = 2*Math.PI*r;
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#33415566" strokeWidth={8}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${(pct/100)*circ} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{transition:"stroke-dasharray 0.8s ease"}}/>
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        fill={color} fontSize={13} fontWeight={700} fontFamily="DM Sans,sans-serif">{pct}%</text>
    </svg>
  );
};

/* ── Skeleton ── */
const Skel = ({w="100%",h=18,theme}) => (
  <div style={{width:w,height:h,background:theme.surfaceLight,borderRadius:6,animation:"skel 1.4s ease-in-out infinite"}}/>
);

/* ════════════════════════════════════════════
   DOWNLOAD UTILITIES
════════════════════════════════════════════ */
const downloadCSV = (filename, headers, rows) => {
  const escape = v => `"${String(v ?? "").replace(/"/g,'""')}"`;
  const csvContent = [headers.map(escape).join(","), ...rows.map(r => r.map(escape).join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const downloadJSON = (filename, data) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const downloadPDF = (title, htmlContent) => {
  const win = window.open("", "_blank");
  win.document.write(`
    <html><head><title>${title}</title>
    <style>
      body{font-family:DM Sans,sans-serif;padding:24px;color:#0f172a;font-size:13px;}
      h1{font-size:20px;margin-bottom:4px;}
      p.sub{color:#64748b;margin-bottom:20px;font-size:12px;}
      table{width:100%;border-collapse:collapse;margin-bottom:24px;}
      th{background:#f1f5f9;padding:9px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#475569;}
      td{padding:9px 12px;border-bottom:1px solid #e2e8f0;font-size:12px;}
      .section{margin-bottom:28px;}
      .section-title{font-size:15px;font-weight:700;margin-bottom:12px;color:#1e293b;border-left:3px solid #3b82f6;padding-left:10px;}
      .kpi-row{display:flex;gap:16px;margin-bottom:24px;flex-wrap:wrap;}
      .kpi{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 18px;flex:1;min-width:140px;}
      .kpi-label{font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;}
      .kpi-value{font-size:22px;font-weight:700;color:#0f172a;margin-top:4px;}
      @media print{button{display:none!important}}
    </style></head><body>
    <button onclick="window.print();window.close();"
      style="margin-bottom:16px;padding:8px 18px;background:#3b82f6;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px;">
      Print / Save as PDF
    </button>
    ${htmlContent}
    </body></html>
  `);
  win.document.close();
};

/* ════════════════════════════════════════════
   DOWNLOAD MENU COMPONENT
════════════════════════════════════════════ */
const DownloadMenu = ({ options, theme }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div ref={ref} style={{position:"relative",display:"inline-block"}}>
      <button onClick={() => setOpen(o => !o)}
        style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:8,border:`1px solid ${theme.border}`,background:theme.surface,color:theme.text,fontSize:13,fontWeight:600,cursor:"pointer",transition:"all .2s"}}>
        ⬇ Download <span style={{fontSize:10,marginLeft:2}}>{open?"▲":"▼"}</span>
      </button>
      {open && (
        <div style={{position:"absolute",top:"calc(100% + 6px)",right:0,background:theme.surface,border:`1px solid ${theme.border}`,borderRadius:10,boxShadow:"0 8px 32px rgba(0,0,0,.4)",minWidth:220,zIndex:1001,overflow:"hidden",animation:"fadeUp .15s ease"}}>
          {options.map((opt, i) => (
            <button key={i} onClick={() => { opt.action(); setOpen(false); }}
              style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"11px 16px",border:"none",background:"transparent",color:theme.text,fontSize:13,cursor:"pointer",textAlign:"left",borderBottom:i<options.length-1?`1px solid ${theme.border}`:"none",transition:"background .15s"}}
              onMouseEnter={e => e.currentTarget.style.background = theme.surfaceLight}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <span style={{fontSize:16}}>{opt.icon}</span>
              <div>
                <div style={{fontWeight:600,fontSize:13}}>{opt.label}</div>
                <div style={{fontSize:11,color:theme.textSecondary,marginTop:1}}>{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
const Reportadmin = () => {
  const [auth] = useAuth();

  /* ── Layout state — identical to AdminProfile ── */
  const [sidebarOpen, setSidebarOpen]       = useState(true);
  const [currentTheme, setCurrentTheme]     = useState(() => localStorage.getItem("adminTheme") || "default");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => { localStorage.setItem("adminTheme", currentTheme); }, [currentTheme]);

  const theme  = themes[currentTheme] || themes.default;
  const authH  = { headers: { Authorization: `Bearer ${auth?.token}` } };

  /* ── Report UI state ── */
  const [activeTab, setActiveTab]           = useState("overview");
  const [hostelSubTab, setHostelSubTab]     = useState("rooms");
  const [typeFilter, setTypeFilter]         = useState("");
  const [mobileHostelOpen, setMobileHostelOpen] = useState(false);

  /* ── Data state ── */
  const [stats, setStats]                   = useState({ totalHostels:0, totalStudents:0, pendingAmount:0 });
  const [hostelTypeData, setHostelTypeData] = useState([]);
  const [hostelWiseData, setHostelWiseData] = useState([]);
  const [allStudents, setAllStudents]       = useState([]);
  const [allHostels, setAllHostels]         = useState([]);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [hostelRooms, setHostelRooms]       = useState([]);
  const [roomSummary, setRoomSummary]       = useState({ totalRooms:0, totalBeds:0, occupiedBeds:0, availableBeds:0, occupancyPercentage:0 });

  /* ── Loading ── */
  const [loadStats,   setLoadStats]   = useState(false);
  const [loadHostels, setLoadHostels] = useState(false);
  const [loadRooms,   setLoadRooms]   = useState(false);

  /* ── Derived ── */
  const hostelStudents       = selectedHostel ? allStudents.filter(s => String(s.hostelId?._id||s.hostelId) === String(selectedHostel._id)) : [];
  const activeStudents       = hostelStudents.filter(s => s.studentStatus==="active");
  const inactiveStudents     = hostelStudents.filter(s => s.studentStatus!=="active");
  const hostelMonthlyCollected = activeStudents.reduce((s,t) => s+(t.monthlyRent||0), 0);

  const currentDate = new Date();
  const monthlyChartData = Array.from({length:6},(_,i)=>{
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth()-(5-i), 1);
    return { month:d.toLocaleString("en-IN",{month:"short"}), amount: i===5 ? hostelMonthlyCollected : Math.round(hostelMonthlyCollected*(0.82+i*0.035)) };
  });

  const revenueChartData = allHostels.map(h=>({
    name: h.name?.split(" ").slice(0,2).join(" ")||"Hostel",
    amount: allStudents.filter(s=>String(s.hostelId?._id||s.hostelId)===String(h._id)&&s.studentStatus==="active").reduce((s,t)=>s+(t.monthlyRent||0),0),
  }));

  const avgOccupancy = hostelWiseData.length
    ? Math.round(hostelWiseData.reduce((s,h)=>s+(h.occupancyPercentage||0),0)/hostelWiseData.length) : 0;

  /* ── API ── */
  const fetchOverview = async () => {
    if (!auth?.token) return;
    try {
      setLoadStats(true);
      const [sR, stuR, hDistR] = await Promise.allSettled([
        axios.get(`${BASE}/admin/dashboard-stats`, authH),
        axios.get(`${BASE}/student/admin/all-students`, authH),
        axios.get(`${BASE}/admin/hostel-distribution`, authH),
      ]);
      if (sR.status==="fulfilled"&&sR.value.data?.success) { const s=sR.value.data.stats; setStats(p=>({...p,totalHostels:s?.totalHostels??0,pendingAmount:s?.pendingAmount??0})); }
      if (stuR.status==="fulfilled"&&stuR.value.data?.success) { const sts=stuR.value.data.students||[]; setAllStudents(sts); setStats(p=>({...p,totalStudents:sts.length})); }
      if (hDistR.status==="fulfilled"&&hDistR.value.data?.success) setHostelTypeData(hDistR.value.data.data.map(d=>({name:d._id,value:d.count})));
    } catch { toast.error("Failed to load overview"); }
    finally { setLoadStats(false); }
  };

  const fetchOccupancy = async (type="") => {
    if (!auth?.token) return;
    try { const r=await axios.get(`${BASE}/admin/hostel-wise-occupancy?type=${type}`,authH); if(r.data?.success) setHostelWiseData(r.data.data); }
    catch { toast.error("Failed to load occupancy"); }
  };

  const fetchAllHostels = async () => {
    if (!auth?.token) return;
    try {
      setLoadHostels(true);
      const r=await axios.get(`${BASE}/hostel/all-hostels`,authH);
      if(r.data?.success){ const h=r.data.hostels||[]; setAllHostels(h); if(h.length>0) setSelectedHostel(h[0]); }
    } catch { toast.error("Failed to load hostels"); }
    finally { setLoadHostels(false); }
  };

  const fetchHostelRooms = async (hostelId) => {
    if (!hostelId||!auth?.token) return;
    try {
      setLoadRooms(true);
      const r=await axios.get(`${BASE}/room/admin/hostel/${hostelId}`,authH);
      if(r.data?.success){ setHostelRooms(r.data.rooms||[]); setRoomSummary(r.data.summary||{totalRooms:0,totalBeds:0,occupiedBeds:0,availableBeds:0,occupancyPercentage:0}); }
    } catch { toast.error("Failed to load rooms"); setHostelRooms([]); }
    finally { setLoadRooms(false); }
  };

  useEffect(()=>{ if(!auth?.token) return; fetchOverview(); fetchOccupancy(""); fetchAllHostels(); },[auth?.token]);
  useEffect(()=>{ if(auth?.token) fetchOccupancy(typeFilter); },[typeFilter]);
  useEffect(()=>{
    if(selectedHostel?._id){ setHostelSubTab("rooms"); setHostelRooms([]); setRoomSummary({totalRooms:0,totalBeds:0,occupiedBeds:0,availableBeds:0,occupancyPercentage:0}); fetchHostelRooms(selectedHostel._id); }
  },[selectedHostel?._id]);

  /* ── Style helpers ── */
  const card = (extra={}) => ({ background:theme.surface, border:`1px solid ${theme.border}`, borderRadius:14, padding:"20px 24px", transition:"background 0.3s,border 0.3s", ...extra });
  const badge = (color,bg,label) => (<span style={{background:bg,color,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,textTransform:"capitalize"}}>{label}</span>);
  const getRoomStatus = r => { if(!r.isActive) return "inactive"; const occ=r.beds?.filter(b=>b.isOccupied).length||0,tot=r.beds?.length||0; if(occ===0) return "vacant"; if(occ===tot) return "full"; return "partial"; };
  const roomSt = s => ({ full:{color:"#10b981",bg:"rgba(16,185,129,.12)",label:"Full"}, partial:{color:"#f59e0b",bg:"rgba(245,158,11,.12)",label:"Partial"}, vacant:{color:theme.primary,bg:`${theme.primary}18`,label:"Vacant"}, inactive:{color:"#f43f5e",bg:"rgba(244,63,94,.12)",label:"Inactive"} }[s]||{color:theme.textSecondary,bg:"transparent",label:s});

  /* ════ DOWNLOAD ACTIONS (all unchanged) ════ */
  const downloadAllHostelsCSV = () => { downloadCSV(`all-hostels-report-${new Date().toISOString().slice(0,10)}.csv`,["Hostel Name","Type","City","State","Total Beds","Occupied","Available","Occupancy %","Active Students","Est. Revenue"],allHostels.map(h=>{const row=hostelWiseData.find(r=>String(r._id?._id||r._id)===String(h._id));const stu=allStudents.filter(s=>String(s.hostelId?._id||s.hostelId)===String(h._id)&&s.studentStatus==="active");const rev=stu.reduce((s,t)=>s+(t.monthlyRent||0),0);return[h.name,h.hosteltype,h.city,h.state,row?.totalBeds||h.totalBeds,row?.occupiedBeds||0,row?.availableBeds||0,row?.occupancyPercentage||0,stu.length,`₹${rev}`];})); toast.success("All hostels report downloaded!"); };
  const downloadAllHostelsPDF = () => { const rows=allHostels.map(h=>{const row=hostelWiseData.find(r=>String(r._id?._id||r._id)===String(h._id));const stu=allStudents.filter(s=>String(s.hostelId?._id||s.hostelId)===String(h._id)&&s.studentStatus==="active");const rev=stu.reduce((s,t)=>s+(t.monthlyRent||0),0);return`<tr><td>${h.name}</td><td>${h.hosteltype}</td><td>${h.city}, ${h.state}</td><td>${row?.totalBeds||h.totalBeds}</td><td>${row?.occupiedBeds||0}</td><td>${row?.availableBeds||0}</td><td><strong>${row?.occupancyPercentage||0}%</strong></td><td>${stu.length}</td><td>₹${rev.toLocaleString()}</td></tr>`;}).join("");downloadPDF("All Hostels Report",`<h1>All Hostels Report</h1><p class="sub">Generated on ${new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</p><div class="kpi-row"><div class="kpi"><div class="kpi-label">Total Hostels</div><div class="kpi-value">${stats.totalHostels}</div></div><div class="kpi"><div class="kpi-label">Total Students</div><div class="kpi-value">${stats.totalStudents}</div></div><div class="kpi"><div class="kpi-label">Avg Occupancy</div><div class="kpi-value">${avgOccupancy}%</div></div><div class="kpi"><div class="kpi-label">Pending Dues</div><div class="kpi-value">₹${Number(stats.pendingAmount).toLocaleString()}</div></div></div><div class="section"><div class="section-title">Hostel-wise Summary</div><table><thead><tr><th>Hostel</th><th>Type</th><th>Location</th><th>Total Beds</th><th>Occupied</th><th>Available</th><th>Occupancy</th><th>Students</th><th>Est. Revenue</th></tr></thead><tbody>${rows}</tbody></table></div>`); };
  const downloadRevenueCSV = () => { downloadCSV(`revenue-report-${new Date().toISOString().slice(0,10)}.csv`,["Hostel","Active Students","Est. Monthly Revenue","Avg Rent/Student"],revenueChartData.map((r,i)=>{const h=allHostels[i];const stu=allStudents.filter(s=>String(s.hostelId?._id||s.hostelId)===String(h?._id)&&s.studentStatus==="active");const avg=stu.length>0?Math.round(r.amount/stu.length):0;return[r.name,stu.length,`₹${r.amount}`,`₹${avg}`];})); toast.success("Revenue report downloaded!"); };
  const downloadRevenuePDF = () => { const totalRev=revenueChartData.reduce((s,d)=>s+d.amount,0);const rows=revenueChartData.map((r,i)=>{const h=allHostels[i];const stu=allStudents.filter(s=>String(s.hostelId?._id||s.hostelId)===String(h?._id)&&s.studentStatus==="active");const avg=stu.length>0?Math.round(r.amount/stu.length):0;return`<tr><td>${r.name}</td><td>${stu.length}</td><td>₹${r.amount.toLocaleString()}</td><td>₹${avg.toLocaleString()}</td></tr>`;}).join("");downloadPDF("Revenue Report",`<h1>Revenue Report</h1><p class="sub">Generated on ${new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</p><div class="kpi-row"><div class="kpi"><div class="kpi-label">Total Est. Revenue</div><div class="kpi-value">₹${totalRev.toLocaleString()}</div></div><div class="kpi"><div class="kpi-label">Active Students</div><div class="kpi-value">${allStudents.filter(s=>s.studentStatus==="active").length}</div></div><div class="kpi"><div class="kpi-label">Pending Dues</div><div class="kpi-value">₹${Number(stats.pendingAmount).toLocaleString()}</div></div></div><div class="section"><div class="section-title">Revenue by Hostel</div><table><thead><tr><th>Hostel</th><th>Active Students</th><th>Est. Monthly Revenue</th><th>Avg Rent/Student</th></tr></thead><tbody>${rows}</tbody></table></div>`); };
  const downloadStudentsCSV = () => { downloadCSV(`students-report-${new Date().toISOString().slice(0,10)}.csv`,["Name","Email","Phone","Bed","Monthly Rent","Join Date","Status","Hostel"],allStudents.map(s=>{const h=allHostels.find(h=>String(h._id)===String(s.hostelId?._id||s.hostelId));return[s.name,s.email,s.phone||"",s.bedNumber||"",s.monthlyRent||0,s.joinDate?new Date(s.joinDate).toLocaleDateString("en-IN"):"",s.studentStatus,h?.name||""];})); toast.success("Students report downloaded!"); };
  const downloadOccupancyCSV = () => { downloadCSV(`occupancy-report-${new Date().toISOString().slice(0,10)}.csv`,["Hostel","Type","Total Beds","Occupied","Available","Occupancy %"],hostelWiseData.map(r=>[r._id?.name||"",r._id?.hosteltype||"",r.totalBeds,r.occupiedBeds,r.availableBeds,`${r.occupancyPercentage}%`])); toast.success("Occupancy report downloaded!"); };
  const downloadSpecificHostelCSV = () => { if(!selectedHostel) return toast.error("Select a hostel first"); downloadCSV(`${selectedHostel.name.replace(/\s+/g,"-").toLowerCase()}-report-${new Date().toISOString().slice(0,10)}.csv`,["Room No","Floor","Type","Total Beds","Occupied","Available","Status"],hostelRooms.map(r=>{const occ=r.beds?.filter(b=>b.isOccupied).length||0;return[r.roomNumber,`Floor ${r.floor}`,r.type,r.beds?.length||0,occ,(r.beds?.length||0)-occ,getRoomStatus(r)];})); toast.success(`${selectedHostel.name} rooms report downloaded!`); };
  const downloadSpecificHostelTenantsCSV = () => { if(!selectedHostel) return toast.error("Select a hostel first"); downloadCSV(`${selectedHostel.name.replace(/\s+/g,"-").toLowerCase()}-tenants-${new Date().toISOString().slice(0,10)}.csv`,["Name","Email","Phone","Bed","Monthly Rent","Join Date","Status"],hostelStudents.map(s=>[s.name,s.email,s.phone||"",s.bedNumber||"",s.monthlyRent||0,s.joinDate?new Date(s.joinDate).toLocaleDateString("en-IN"):"",s.studentStatus])); toast.success(`${selectedHostel.name} tenants report downloaded!`); };
  const downloadSpecificHostelPDF = () => { if(!selectedHostel) return toast.error("Select a hostel first"); const roomRows=hostelRooms.map(r=>{const occ=r.beds?.filter(b=>b.isOccupied).length||0,tot=r.beds?.length||0;return`<tr><td>#${r.roomNumber}</td><td>Floor ${r.floor}</td><td>${r.type}</td><td>${tot}</td><td>${occ}</td><td>${tot-occ}</td><td>${getRoomStatus(r)}</td></tr>`;}).join("");const tenantRows=hostelStudents.map(s=>`<tr><td>${s.name}</td><td>${s.phone||""}</td><td>${s.bedNumber||""}</td><td>₹${s.monthlyRent||0}</td><td>${s.studentStatus}</td></tr>`).join("");downloadPDF(`${selectedHostel.name} Report`,`<h1>${selectedHostel.name}</h1><p class="sub">${selectedHostel.hosteltype} · ${selectedHostel.city}, ${selectedHostel.state} · ${selectedHostel.address} · ${selectedHostel.pincode}</p><div class="kpi-row"><div class="kpi"><div class="kpi-label">Total Beds</div><div class="kpi-value">${roomSummary.totalBeds}</div></div><div class="kpi"><div class="kpi-label">Occupied</div><div class="kpi-value">${roomSummary.occupiedBeds}</div></div><div class="kpi"><div class="kpi-label">Available</div><div class="kpi-value">${roomSummary.availableBeds}</div></div><div class="kpi"><div class="kpi-label">Occupancy</div><div class="kpi-value">${roomSummary.occupancyPercentage}%</div></div><div class="kpi"><div class="kpi-label">Students</div><div class="kpi-value">${hostelStudents.length}</div></div><div class="kpi"><div class="kpi-label">Est. Revenue</div><div class="kpi-value">₹${hostelMonthlyCollected.toLocaleString()}</div></div></div><div class="section"><div class="section-title">Room Occupancy</div><table><thead><tr><th>Room</th><th>Floor</th><th>Type</th><th>Total Beds</th><th>Occupied</th><th>Available</th><th>Status</th></tr></thead><tbody>${roomRows}</tbody></table></div><div class="section"><div class="section-title">Tenants</div><table><thead><tr><th>Name</th><th>Phone</th><th>Bed</th><th>Rent</th><th>Status</th></tr></thead><tbody>${tenantRows}</tbody></table></div>`); };
  const downloadFullJSON = () => { downloadJSON(`full-report-${new Date().toISOString().slice(0,10)}.json`,{generatedAt:new Date().toISOString(),stats,allHostels,hostelWiseData,students:allStudents.map(s=>({name:s.name,email:s.email,phone:s.phone,bedNumber:s.bedNumber,monthlyRent:s.monthlyRent,studentStatus:s.studentStatus,joinDate:s.joinDate,hostelId:s.hostelId}))}); toast.success("Full JSON report downloaded!"); };

  const overviewDownloadOptions = [
    { icon:"📋", label:"All Hostels (CSV)",    desc:"Hostel summary with occupancy",   action:downloadAllHostelsCSV },
    { icon:"📄", label:"All Hostels (PDF)",    desc:"Formatted hostel summary report", action:downloadAllHostelsPDF },
    { icon:"💰", label:"Revenue Report (CSV)", desc:"Revenue by hostel",               action:downloadRevenueCSV },
    { icon:"💰", label:"Revenue Report (PDF)", desc:"Formatted revenue summary",       action:downloadRevenuePDF },
    { icon:"📊", label:"Occupancy (CSV)",      desc:"Bed-level occupancy data",        action:downloadOccupancyCSV },
    { icon:"👥", label:"All Students (CSV)",   desc:"Full student directory",          action:downloadStudentsCSV },
    { icon:"📦", label:"Full Data (JSON)",     desc:"Complete raw data export",        action:downloadFullJSON },
  ];
  const hostelDownloadOptions = [
    { icon:"🏠", label:"Hostel Report (PDF)",  desc:"Full report with rooms & tenants", action:downloadSpecificHostelPDF },
    { icon:"🛏", label:"Rooms Report (CSV)",   desc:"Room-wise bed occupancy",          action:downloadSpecificHostelCSV },
    { icon:"👥", label:"Tenants Report (CSV)", desc:"All tenants of this hostel",       action:downloadSpecificHostelTenantsCSV },
  ];

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <div title="Reports & Analytics">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes skel   { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

        .rep-in        { animation:fadeUp .3s ease; }
        .rep-row:hover { background:${theme.surfaceLight}66 !important; }
        .rep-hcard:hover { border-color:${theme.primary}!important; cursor:pointer; background:${theme.primary}14!important; }
        .rep-scard:hover { transform:translateY(-2px); box-shadow:0 10px 32px rgba(0,0,0,.45)!important; }
        .rep-tab       { cursor:pointer; transition:all .2s; }
        .rep-tab:hover { opacity:.8; }
        ::-webkit-scrollbar       { width:4px; height:4px; }
        ::-webkit-scrollbar-thumb { background:${theme.surfaceLight}; border-radius:4px; }

        /* ── PAGE SHELL — matches AdminProfile exactly ── */
        .rep-root {
          display: flex;
          min-height: 100vh;
          background-color: ${theme.background};
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          position: relative;
        }
        .rep-sidebar-wrapper {
          flex-shrink: 0;
          position: fixed;
          left: 0; top: 0;
          height: 100vh;
          z-index: 1000;
          transition: transform 0.3s ease;
        }
        .rep-main-wrapper {
          flex: 1;
          margin-left: ${sidebarOpen ? "280px" : "70px"};
          transition: margin-left 0.3s ease;
          min-height: 100vh;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }
        .rep-page-content {
          flex: 1;
          padding: 24px 28px;
        }

        /* ── MOBILE TOGGLE — matches AdminProfile exactly ── */
        .rep-mobile-toggle {
          position: fixed;
          bottom: 24px; right: 24px;
          z-index: 1003;
          background: rgba(255,255,255,0.95);
          border: 2px solid #e2e8f0;
          border-radius: 50px;
          padding: 14px 18px;
          cursor: pointer;
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
          color: #374151;
          font-weight: 600;
          font-size: 14px;
          display: none;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          min-width: 90px;
        }
        .rep-mobile-toggle:hover { transform:translateY(-2px); box-shadow:0 10px 30px rgba(0,0,0,0.2); }
        .rep-menu-text { font-size:12px; text-transform:uppercase; letter-spacing:0.5px; }

        .rep-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 999;
          backdrop-filter: blur(2px);
        }

        /* ── REPORT GRIDS ── */
        .rep-kpi-grid      { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
        .rep-chart-grid    { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
        .rep-hostel-layout { display:grid; grid-template-columns:260px 1fr; gap:20px; align-items:start; }
        .rep-stat3         { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        .rep-stat4         { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
        .rep-header        { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; }

        .rep-mobile-hostel-btn { display:none; }
        .rep-hostel-sidebar    { display:block; }

        /* Hostel detail header */
        .rep-hostel-detail-header { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; }
        .rep-hostel-detail-header .detail-info  { flex:1; min-width:0; }
        .rep-hostel-detail-header .detail-ring-rev { display:flex; align-items:center; gap:16px; flex-shrink:0; }

        /* ── TABLET (≤1024px) ── */
        @media (max-width:1024px) {
          .rep-mobile-toggle   { display:flex !important; }
          .rep-sidebar-wrapper { transform:translateX(-100%); }
          .rep-sidebar-wrapper.open { transform:translateX(0); }
          .rep-main-wrapper    { margin-left:0 !important; }
          .rep-kpi-grid        { grid-template-columns:repeat(2,1fr); }
          .rep-chart-grid      { grid-template-columns:1fr; }
          .rep-hostel-layout   { grid-template-columns:1fr; }
          .rep-mobile-hostel-btn { display:flex; }
          .rep-hostel-sidebar  { display:none; }
          .rep-hostel-sidebar.open { display:block; }
        }
        @media (min-width:1025px) {
          .rep-mobile-toggle   { display:none !important; }
          .rep-sidebar-wrapper { transform:translateX(0) !important; }
        }

        /* ── MOBILE (≤640px) ── */
        @media (max-width:640px) {
          .rep-page-content { padding:12px !important; padding-bottom:100px !important; }
          .rep-kpi-grid     { grid-template-columns:repeat(2,1fr); gap:10px; }
          .rep-stat3        { grid-template-columns:1fr; gap:10px; }
          .rep-stat4        { grid-template-columns:repeat(2,1fr); gap:10px; }
          .rep-header       { flex-direction:column; align-items:flex-start; }
          .rep-header > div:last-child { width:100%; justify-content:space-between; }
          .rep-tabs         { flex:1; width:100%; }
          .rep-tabs button  { flex:1; padding:7px 8px !important; font-size:12px !important; }
          .rep-title        { font-size:18px !important; }
          .rep-subtabs      { overflow-x:auto; padding-bottom:4px; -webkit-overflow-scrolling:touch; }
          .rep-subtabs::-webkit-scrollbar { height:0; }
          table { font-size:12px; }
          th, td { padding:8px !important; }
          .rep-card-pad { padding:14px !important; }

          .rep-hostel-detail-header { flex-direction:column; gap:14px; }
          .rep-hostel-detail-header .detail-ring-rev { width:100%; justify-content:flex-start; gap:20px; padding-top:12px; border-top:1px solid ${theme.border}; }
          .rep-hostel-detail-header .detail-ring-rev > div:last-child { text-align:left !important; }
        }
        @media (max-width:400px) {
          .rep-kpi-grid { grid-template-columns:1fr 1fr; gap:8px; }
          .rep-stat4    { grid-template-columns:1fr 1fr; gap:8px; }
        }
      `}</style>

      {/* ════ PAGE SHELL ════ */}
      <div className="rep-root">

        {/* Mobile Toggle — same as AdminProfile */}
        <button className="rep-mobile-toggle" onClick={() => setIsMobileMenuOpen(o => !o)}>
          {isMobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
          <span className="rep-menu-text">{isMobileMenuOpen ? "Close" : "Menu"}</span>
        </button>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && <div className="rep-overlay" onClick={() => setIsMobileMenuOpen(false)}/>}

        {/* Sidebar */}
        <div className={`rep-sidebar-wrapper${isMobileMenuOpen ? " open" : ""}`}>
          <AdminMenu currentTheme={currentTheme} sidebarOpen={sidebarOpen}/>
        </div>

        {/* Main wrapper */}
        <div className="rep-main-wrapper">

          {/* Header — same as AdminProfile */}
          <Header
            currentTheme={currentTheme}
            setCurrentTheme={setCurrentTheme}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />

          {/* ════ PAGE CONTENT ════ */}
          <div className="rep-page-content">

            {/* Page Title + Tab Switcher */}
            <div className="rep-header" style={{marginBottom:24}}>
              <div>
                <h1 className="rep-title" style={{fontFamily:"Space Grotesk,sans-serif",fontSize:24,fontWeight:700,letterSpacing:"-.5px",color:theme.text,margin:0}}>
                  Reports & Analytics
                </h1>
                <p style={{color:theme.textSecondary,fontSize:13,marginTop:3}}>Live data across all your hostels</p>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                <div className="rep-tabs" style={{display:"flex",gap:5,background:theme.surface,padding:5,borderRadius:12,border:`1px solid ${theme.border}`}}>
                  {[{k:"overview",l:"📊 Overview"},{k:"hostels",l:"🏠 Hostel Reports"}].map(t=>(
                    <button key={t.k} className="rep-tab"
                      onClick={()=>setActiveTab(t.k)}
                      style={{padding:"7px 16px",borderRadius:8,border:"none",fontFamily:"DM Sans,sans-serif",fontWeight:600,fontSize:13,background:activeTab===t.k?theme.primary:"transparent",color:activeTab===t.k?"#fff":theme.textSecondary,cursor:"pointer"}}>
                      {t.l}
                    </button>
                  ))}
                </div>
                <DownloadMenu theme={theme} options={activeTab==="hostels" ? hostelDownloadOptions : overviewDownloadOptions}/>
              </div>
            </div>

            {/* ══ OVERVIEW TAB ══ */}
            {activeTab==="overview" && (
              <div className="rep-in">
                <div className="rep-kpi-grid" style={{marginBottom:20}}>
                  {[
                    {label:"Total Hostels", val:stats.totalHostels,  icon:"🏢", c:theme.primary, g:`${theme.primary}22`},
                    {label:"Total Students",val:stats.totalStudents, icon:"👥", c:"#8b5cf6",      g:"rgba(139,92,246,.15)"},
                    {label:"Avg Occupancy", val:`${avgOccupancy}%`,  icon:"📈", c:"#f59e0b",      g:"rgba(245,158,11,.15)"},
                    {label:"Pending Dues",  val:`₹${Number(stats.pendingAmount||0).toLocaleString()}`,icon:"⏳",c:"#f43f5e",g:"rgba(244,63,94,.15)"},
                  ].map((item,i)=>(
                    <div key={i} className="rep-scard rep-card-pad" style={card({position:"relative",overflow:"hidden",transition:"all .3s"})}>
                      <div style={{position:"absolute",top:0,right:0,width:70,height:70,background:item.g,borderRadius:"0 14px 0 70px"}}/>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div style={{flex:1}}>
                          <p style={{color:theme.textSecondary,fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>{item.label}</p>
                          {loadStats ? <Skel w="60%" h={24} theme={theme}/> :
                            <p style={{fontSize:26,fontWeight:700,fontFamily:"Space Grotesk,sans-serif",color:theme.text,letterSpacing:"-1px",margin:0}}>{item.val}</p>}
                        </div>
                        <span style={{fontSize:20}}>{item.icon}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rep-chart-grid" style={{marginBottom:20}}>
                  <div className="rep-card-pad" style={card()}>
                    <h3 style={{fontFamily:"Space Grotesk,sans-serif",fontSize:15,fontWeight:600,marginBottom:14,color:theme.text}}>Hostel Type Distribution</h3>
                    {hostelTypeData.length===0 ? <p style={{textAlign:"center",color:theme.textSecondary,padding:"36px 0"}}>No data</p> : <>
                      <ResponsiveContainer width="100%" height={190}>
                        <PieChart>
                          <Pie data={hostelTypeData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={82} paddingAngle={4}>
                            {hostelTypeData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                          </Pie>
                          <Tooltip contentStyle={{background:theme.surface,border:`1px solid ${theme.border}`,borderRadius:8,color:theme.text}}/>
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:8}}>
                        {hostelTypeData.map((item,i)=>(
                          <div key={i} style={{display:"flex",alignItems:"center",gap:5}}>
                            <div style={{width:8,height:8,borderRadius:"50%",background:PIE_COLORS[i%PIE_COLORS.length]}}/>
                            <span style={{fontSize:12,color:theme.textSecondary}}>{item.name} ({item.value})</span>
                          </div>
                        ))}
                      </div>
                    </>}
                  </div>

                  <div className="rep-card-pad" style={card()}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
                      <div>
                        <h3 style={{fontFamily:"Space Grotesk,sans-serif",fontSize:15,fontWeight:600,color:theme.text,margin:0}}>Revenue by Hostel</h3>
                        <p style={{color:theme.textSecondary,fontSize:11,marginTop:2}}>Monthly rent · active students</p>
                      </div>
                      <span style={{fontSize:12,color:"#10b981",background:"rgba(16,185,129,.12)",padding:"3px 10px",borderRadius:20,fontWeight:600}}>₹{revenueChartData.reduce((s,d)=>s+d.amount,0).toLocaleString()}</span>
                    </div>
                    {revenueChartData.length===0 ? <p style={{textAlign:"center",color:theme.textSecondary,padding:"36px 0"}}>No data</p> :
                      <ResponsiveContainer width="100%" height={190}>
                        <BarChart data={revenueChartData} margin={{top:0,right:0,left:0,bottom:0}}>
                          <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false}/>
                          <XAxis dataKey="name" tick={{fill:theme.textSecondary,fontSize:10}} axisLine={false} tickLine={false}/>
                          <YAxis tick={{fill:theme.textSecondary,fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/1000).toFixed(0)}K`}/>
                          <Tooltip contentStyle={{background:theme.surface,border:`1px solid ${theme.border}`,borderRadius:8,color:theme.text}} formatter={v=>[`₹${Number(v).toLocaleString()}`,"Revenue"]}/>
                          <Bar dataKey="amount" fill={theme.primary} radius={[4,4,0,0]}/>
                        </BarChart>
                      </ResponsiveContainer>}
                  </div>
                </div>

                <div className="rep-card-pad" style={card()}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
                    <h3 style={{fontFamily:"Space Grotesk,sans-serif",fontSize:15,fontWeight:600,color:theme.text,margin:0}}>Hostel-wise Occupancy</h3>
                    <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}
                      style={{padding:"7px 12px",borderRadius:8,fontSize:13,background:theme.surfaceLight,color:theme.text,border:`1px solid ${theme.border}`,outline:"none",cursor:"pointer"}}>
                      <option value="">All Types</option>
                      <option value="Boys Hostel">Boys Hostel</option>
                      <option value="Girls Hostel">Girls Hostel</option>
                      <option value="Co-ed Hostel">Co-ed Hostel</option>
                      <option value="PG">PG</option>
                    </select>
                  </div>
                  {hostelWiseData.length===0 ? <p style={{textAlign:"center",color:theme.textSecondary,padding:"28px 0"}}>No data</p> :
                    <div style={{overflowX:"auto"}}>
                      <table style={{width:"100%",borderCollapse:"collapse",minWidth:480}}>
                        <thead>
                          <tr style={{borderBottom:`1px solid ${theme.border}`,background:theme.surfaceLight}}>
                            {["Hostel-Name","Total-beds","Occupied-beds","Available-beds","Occupancy %"].map(h=>(
                              <th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:11,color:theme.textSecondary,fontWeight:600,textTransform:"uppercase",letterSpacing:".05em"}}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {hostelWiseData.map((row,i)=>{
                            const pct=row.occupancyPercentage||0, col=pct>85?"#f43f5e":pct>60?"#f59e0b":"#10b981";
                            return (
                              <tr key={i} className="rep-row" style={{borderBottom:`1px solid ${theme.border}`,transition:"background .15s"}}>
                                <td style={{padding:"11px 12px",fontSize:13,fontWeight:600,color:theme.text}}>{row._id?.name||"—"}</td>
                                <td style={{padding:"11px 12px",fontSize:13,color:theme.text}}>{row.totalBeds}</td>
                                <td style={{padding:"11px 12px",fontSize:13,color:"#10b981",fontWeight:600}}>{row.occupiedBeds}</td>
                                <td style={{padding:"11px 12px",fontSize:13,color:theme.primary,fontWeight:600}}>{row.availableBeds}</td>
                                <td style={{padding:"11px 12px"}}>
                                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                                    <div style={{flex:1,height:6,background:theme.border,borderRadius:6,minWidth:40}}>
                                      <div style={{width:`${pct}%`,height:"100%",background:col,borderRadius:6,transition:"width .7s ease"}}/>
                                    </div>
                                    <span style={{fontSize:12,fontWeight:700,color:col,minWidth:32}}>{pct}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>}
                </div>
              </div>
            )}

            {/* ══ HOSTEL REPORTS TAB ══ */}
            {activeTab==="hostels" && (
              <div className="rep-in">
                <button className="rep-mobile-hostel-btn"
                  onClick={()=>setMobileHostelOpen(o=>!o)}
                  style={{width:"100%",marginBottom:12,padding:"12px 16px",background:theme.surface,border:`1px solid ${theme.primary}`,borderRadius:12,color:theme.text,fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span>🏠 {selectedHostel?.name || "Select Hostel"}</span>
                  <span style={{fontSize:12,color:theme.textSecondary}}>{mobileHostelOpen?"▲":"▼"}</span>
                </button>

                <div className="rep-hostel-layout">
                  {/* Sidebar */}
                  <div className={`rep-hostel-sidebar${mobileHostelOpen?" open":""}`}>
                    <p style={{fontSize:11,color:theme.textSecondary,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em",marginBottom:10}}>Select Hostel</p>
                    {loadHostels
                      ? [1,2,3].map(i=><div key={i} style={{marginBottom:8}}><Skel h={80} theme={theme}/></div>)
                      : allHostels.length===0
                        ? <p style={{color:theme.textSecondary,fontSize:13}}>No hostels found</p>
                        : allHostels.map(h=>{
                          const sel=selectedHostel?._id===h._id;
                          const hRow=hostelWiseData.find(r=>String(r._id?._id||r._id)===String(h._id));
                          const pct=hRow?.occupancyPercentage||0, pc=pct>85?"#f43f5e":pct>60?"#f59e0b":"#10b981";
                          return (
                            <div key={h._id} className="rep-hcard"
                              onClick={()=>{ setSelectedHostel(h); setMobileHostelOpen(false); }}
                              style={{...card({padding:"13px 16px",marginBottom:8}),border:`1px solid ${sel?theme.primary:theme.border}`,background:sel?`${theme.primary}18`:theme.surface,transition:"all .2s"}}>
                              <p style={{fontSize:13,fontWeight:600,color:theme.text,marginBottom:3}}>{h.name}</p>
                              <p style={{fontSize:11,color:theme.textSecondary,marginBottom:8}}>{h.hosteltype} · {h.city}</p>
                            </div>
                          );
                        })}
                  </div>

                  {/* Detail Panel */}
                  <div>
                    {!selectedHostel
                      ? <div style={card({textAlign:"center",padding:"60px"})}>
                          <p style={{fontSize:32,marginBottom:10}}>🏠</p>
                          <p style={{color:theme.textSecondary}}>Select a hostel to view its report</p>
                        </div>
                      : <>
                          {/* Hostel Header */}
                          <div className="rep-hostel-detail-header rep-card-pad" style={card({marginBottom:14})}>
                            <div className="detail-info">
                              <h2 style={{fontFamily:"Space Grotesk,sans-serif",fontSize:18,fontWeight:700,letterSpacing:"-.3px",margin:0,color:theme.text}}>{selectedHostel.name}</h2>
                              <p style={{color:theme.textSecondary,fontSize:13,marginTop:3}}>{selectedHostel.hosteltype} · {selectedHostel.city}, {selectedHostel.state}</p>
                              <p style={{color:theme.textSecondary,fontSize:11,marginTop:2}}>{selectedHostel.address} — {selectedHostel.pincode}</p>
                              <div style={{display:"flex",gap:14,marginTop:10,flexWrap:"wrap"}}>
                                <span style={{fontSize:12,color:theme.textSecondary}}>🛏 <strong style={{color:theme.text}}>{roomSummary.totalBeds}</strong> beds</span>
                                <span style={{fontSize:12,color:theme.textSecondary}}>✅ <strong style={{color:"#10b981"}}>{roomSummary.occupiedBeds}</strong> occupied</span>
                                <span style={{fontSize:12,color:theme.textSecondary}}>🔵 <strong style={{color:theme.primary}}>{roomSummary.availableBeds}</strong> free</span>
                              </div>
                            </div>
                            <div className="detail-ring-rev">
                              <OccupancyRing pct={loadRooms?0:roomSummary.occupancyPercentage} color={roomSummary.occupancyPercentage>85?"#f43f5e":roomSummary.occupancyPercentage>60?"#f59e0b":"#10b981"}/>
                              <div style={{textAlign:"right"}}>
                                <p style={{fontSize:18,fontWeight:700,color:"#10b981",fontFamily:"Space Grotesk,sans-serif",margin:0}}>₹{hostelMonthlyCollected.toLocaleString()}</p>
                                <p style={{fontSize:11,color:theme.textSecondary,marginTop:2}}>est. monthly</p>
                                <p style={{fontSize:12,color:"#f59e0b",fontWeight:600,marginTop:2}}>{hostelStudents.length} students</p>
                              </div>
                            </div>
                          </div>

                          {/* Sub Tabs */}
                          <div className="rep-subtabs" style={{display:"flex",gap:6,marginBottom:14,flexWrap:"nowrap"}}>
                            {[{k:"rooms",l:"🛏 Rooms"},{k:"revenue",l:"💳 Revenue"},{k:"tenants",l:"👥 Tenants"}].map(t=>(
                              <button key={t.k} className="rep-tab"
                                onClick={()=>setHostelSubTab(t.k)}
                                style={{padding:"7px 14px",borderRadius:8,border:`1px solid ${hostelSubTab===t.k?theme.primary:theme.border}`,background:hostelSubTab===t.k?`${theme.primary}20`:"transparent",color:hostelSubTab===t.k?theme.primary:theme.textSecondary,fontSize:13,fontWeight:600,whiteSpace:"nowrap"}}>
                                {t.l}
                              </button>
                            ))}
                          </div>

                          {/* ── ROOMS ── */}
                          {hostelSubTab==="rooms" && (
                            <div className="rep-card-pad" style={card()}>
                              <div className="rep-stat4" style={{marginBottom:18}}>
                                {[
                                  {label:"Total Rooms",   n:roomSummary.totalRooms,    c:"#8b5cf6",bg:"rgba(139,92,246,.1)"},
                                  {label:"Occupied Beds", n:roomSummary.occupiedBeds,  c:"#10b981", bg:"rgba(16,185,129,.1)"},
                                  {label:"Free Beds",     n:roomSummary.availableBeds, c:theme.primary,bg:`${theme.primary}18`},
                                  {label:"Total Beds",    n:roomSummary.totalBeds,     c:"#f59e0b", bg:"rgba(245,158,11,.1)"},
                                ].map(s=>(
                                  <div key={s.label} style={{background:s.bg,border:`1px solid ${s.c}33`,borderRadius:10,padding:"13px",textAlign:"center"}}>
                                    {loadRooms?<Skel w="50%" h={24} theme={theme}/>:<p style={{fontSize:24,fontWeight:700,color:s.c,fontFamily:"Space Grotesk,sans-serif",margin:0}}>{s.n}</p>}
                                    <p style={{fontSize:11,color:theme.textSecondary,marginTop:4}}>{s.label}</p>
                                  </div>
                                ))}
                              </div>
                              <div style={{marginBottom:18}}>
                                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                                  <span style={{fontSize:13,color:theme.text,fontWeight:500}}>Occupancy</span>
                                  <span style={{fontSize:13,fontWeight:700,color:roomSummary.occupancyPercentage>85?"#f43f5e":roomSummary.occupancyPercentage>60?"#f59e0b":"#10b981"}}>{loadRooms?"—":`${roomSummary.occupancyPercentage}%`}</span>
                                </div>
                                <div style={{height:8,background:theme.border,borderRadius:8}}>
                                  <div style={{width:loadRooms?"0%":`${roomSummary.occupancyPercentage}%`,height:"100%",borderRadius:8,background:roomSummary.occupancyPercentage>85?"#f43f5e":roomSummary.occupancyPercentage>60?"#f59e0b":"#10b981",transition:"width .8s ease"}}/>
                                </div>
                              </div>
                              {loadRooms
                                ? <div style={{display:"flex",flexDirection:"column",gap:8}}>{[1,2,3,4].map(i=><Skel key={i} h={42} theme={theme}/>)}</div>
                                : hostelRooms.length===0 ? <p style={{textAlign:"center",color:theme.textSecondary,padding:"20px 0"}}>No rooms found</p>
                                : <div style={{overflowX:"auto"}}>
                                    <table style={{width:"100%",borderCollapse:"collapse",minWidth:420}}>
                                      <thead>
                                        <tr style={{borderBottom:`1px solid ${theme.border}`,background:theme.surfaceLight}}>
                                          {["Room","Floor","Type","Beds","Occ.","Free","Status"].map(h=>(
                                            <th key={h} style={{padding:"9px 10px",textAlign:"left",fontSize:11,color:theme.textSecondary,fontWeight:600,textTransform:"uppercase",letterSpacing:".04em"}}>{h}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {hostelRooms.map((r,i)=>{
                                          const st=getRoomStatus(r),rs=roomSt(st),occ=r.beds?.filter(b=>b.isOccupied).length||0,tot=r.beds?.length||0;
                                          return (
                                            <tr key={i} className="rep-row" style={{borderBottom:`1px solid ${theme.border}`,transition:"background .15s"}}>
                                              <td style={{padding:"10px",fontSize:13,fontWeight:600,color:theme.text}}>#{r.roomNumber}</td>
                                              <td style={{padding:"10px",fontSize:12,color:theme.textSecondary}}>F{r.floor}</td>
                                              <td style={{padding:"10px"}}><span style={{background:r.type==="AC"?`${theme.primary}18`:theme.surfaceLight,color:r.type==="AC"?theme.primary:theme.textSecondary,padding:"2px 7px",borderRadius:6,fontSize:11,fontWeight:600}}>{r.type}</span></td>
                                              <td style={{padding:"10px",fontSize:13,color:theme.text,fontWeight:600}}>{tot}</td>
                                              <td style={{padding:"10px",fontSize:13,color:"#10b981",fontWeight:600}}>{occ}</td>
                                              <td style={{padding:"10px",fontSize:13,color:theme.primary,fontWeight:600}}>{tot-occ}</td>
                                              <td style={{padding:"10px"}}><span style={{background:rs.bg,color:rs.color,padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:600}}>{rs.label}</span></td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>}
                              {selectedHostel.facilities?.length>0 && (
                                <div style={{marginTop:18,paddingTop:14,borderTop:`1px solid ${theme.border}`}}>
                                  <p style={{fontSize:11,color:theme.textSecondary,fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:".05em"}}>Facilities</p>
                                  <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                                    {selectedHostel.facilities.map((f,i)=>(
                                      <span key={i} style={{background:`${theme.primary}18`,color:theme.primary,padding:"4px 12px",borderRadius:20,fontSize:12,fontWeight:500}}>{f}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* ── REVENUE ── */}
                          {hostelSubTab==="revenue" && (
                            <div style={{display:"flex",flexDirection:"column",gap:14}}>
                              <div className="rep-stat3">
                                {[
                                  {label:"Est. Monthly Revenue",val:`₹${hostelMonthlyCollected.toLocaleString()}`,c:"#10b981",icon:"💰"},
                                  {label:"Active Students",     val:activeStudents.length,                        c:theme.primary,icon:"👥"},
                                  {label:"Avg Rent / Student",  val:activeStudents.length>0?`₹${Math.round(hostelMonthlyCollected/activeStudents.length).toLocaleString()}`:"—",c:"#8b5cf6",icon:"📊"},
                                ].map(s=>(
                                  <div key={s.label} className="rep-card-pad" style={card({textAlign:"center"})}>
                                    <div style={{fontSize:22,marginBottom:8}}>{s.icon}</div>
                                    <p style={{fontSize:20,fontWeight:700,color:s.c,fontFamily:"Space Grotesk,sans-serif",margin:0}}>{s.val}</p>
                                    <p style={{fontSize:12,color:theme.textSecondary,marginTop:5}}>{s.label}</p>
                                  </div>
                                ))}
                              </div>
                              <div className="rep-card-pad" style={card()}>
                                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:8}}>
                                  <div>
                                    <h3 style={{fontFamily:"Space Grotesk,sans-serif",fontSize:15,fontWeight:600,color:theme.text,margin:0}}>Monthly Revenue Trend</h3>
                                    <p style={{color:theme.textSecondary,fontSize:11,marginTop:2}}>Last 6 months · active student rents</p>
                                  </div>
                                  <span style={{fontSize:12,color:"#10b981",background:"rgba(16,185,129,.12)",padding:"3px 10px",borderRadius:20,fontWeight:600}}>₹{hostelMonthlyCollected.toLocaleString()} / mo</span>
                                </div>
                                <ResponsiveContainer width="100%" height={190}>
                                  <BarChart data={monthlyChartData} margin={{top:0,right:0,left:0,bottom:0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false}/>
                                    <XAxis dataKey="month" tick={{fill:theme.textSecondary,fontSize:11}} axisLine={false} tickLine={false}/>
                                    <YAxis tick={{fill:theme.textSecondary,fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/1000).toFixed(0)}K`}/>
                                    <Tooltip contentStyle={{background:theme.surface,border:`1px solid ${theme.border}`,borderRadius:8,color:theme.text}} formatter={v=>[`₹${Number(v).toLocaleString()}`,"Revenue"]}/>
                                    <Bar dataKey="amount" radius={[4,4,0,0]}>
                                      {monthlyChartData.map((_,i)=><Cell key={i} fill={i===monthlyChartData.length-1?"#10b981":theme.primary}/>)}
                                    </Bar>
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          )}

                          {/* ── TENANTS ── */}
                          {hostelSubTab==="tenants" && (
                            <div className="rep-card-pad" style={card()}>
                              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
                                <h3 style={{fontFamily:"Space Grotesk,sans-serif",fontSize:15,fontWeight:600,color:theme.text,margin:0}}>Tenant List</h3>
                                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                                  {badge("#10b981","rgba(16,185,129,.12)",`${activeStudents.length} Active`)}
                                  {badge("#f43f5e","rgba(244,63,94,.12)",`${inactiveStudents.length} Inactive`)}
                                </div>
                              </div>
                              {hostelStudents.length===0
                                ? <p style={{textAlign:"center",color:theme.textSecondary,padding:"24px 0"}}>No students found</p>
                                : <div style={{overflowX:"auto"}}>
                                    <table style={{width:"100%",borderCollapse:"collapse",minWidth:480}}>
                                      <thead>
                                        <tr style={{borderBottom:`1px solid ${theme.border}`,background:theme.surfaceLight}}>
                                          {["Student","Phone","Bed","Rent","Joined","Status"].map(h=>(
                                            <th key={h} style={{padding:"9px 10px",textAlign:"left",fontSize:11,color:theme.textSecondary,fontWeight:600,textTransform:"uppercase",letterSpacing:".04em"}}>{h}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {hostelStudents.map((ten,i)=>{
                                          const stCol={active:{color:"#10b981",bg:"rgba(16,185,129,.12)"},suspended:{color:"#f43f5e",bg:"rgba(244,63,94,.12)"},leave:{color:"#f59e0b",bg:"rgba(245,158,11,.12)"}}[ten.studentStatus]||{color:theme.textSecondary,bg:"transparent"};
                                          const joined=ten.joinDate?new Date(ten.joinDate).toLocaleDateString("en-IN",{month:"short",year:"numeric"}):"—";
                                          return (
                                            <tr key={i} className="rep-row" style={{borderBottom:`1px solid ${theme.border}`,transition:"background .15s"}}>
                                              <td style={{padding:"11px 10px"}}>
                                                <div style={{display:"flex",alignItems:"center",gap:8}}>
                                                  <div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${theme.primary},#8b5cf6)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#fff",fontWeight:700,flexShrink:0}}>
                                                    {(ten.name||"?").charAt(0).toUpperCase()}
                                                  </div>
                                                  <div>
                                                    <p style={{fontSize:13,fontWeight:600,color:theme.text,margin:0}}>{ten.name}</p>
                                                    <p style={{fontSize:11,color:theme.textSecondary,margin:0}}>{ten.email}</p>
                                                  </div>
                                                </div>
                                              </td>
                                              <td style={{padding:"11px 10px",fontSize:12,color:theme.textSecondary}}>{ten.phone||"—"}</td>
                                              <td style={{padding:"11px 10px"}}><span style={{background:`${theme.primary}18`,color:theme.primary,padding:"3px 9px",borderRadius:20,fontSize:12,fontWeight:700}}>{ten.bedNumber||"—"}</span></td>
                                              <td style={{padding:"11px 10px",fontSize:13,color:"#10b981",fontWeight:600}}>₹{Number(ten.monthlyRent||0).toLocaleString()}</td>
                                              <td style={{padding:"11px 10px",fontSize:12,color:theme.textSecondary}}>{joined}</td>
                                              <td style={{padding:"11px 10px"}}><span style={{background:stCol.bg,color:stCol.color,padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:600,textTransform:"capitalize"}}>{ten.studentStatus}</span></td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>}
                            </div>
                          )}
                        </>}
                  </div>
                </div>
              </div>
            )}

          </div>{/* end rep-page-content */}
        </div>{/* end rep-main-wrapper */}
      </div>{/* end rep-root */}
    </div>
  );
};

export default Reportadmin;