import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/auth";
import { toast, ToastContainer } from "react-toastify";

/* ─────────────────────────────────────────────
   GLOBAL CSS  (injected once into <head>)
───────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .rooms-page {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #f0f2f8;
    min-height: 100vh;
    padding: 28px 20px 60px;
  }

  /* ── PAGE HEADER ── */
  .rp-header { text-align: center; margin-bottom: 32px; }
  .rp-title {
    font-size: 30px; font-weight: 800; color: #0f172a;
    display: flex; align-items: center; justify-content: center; gap: 10px;
  }
  .rp-sub { font-size: 14px; color: #94a3b8; margin-top: 6px; }

  @media (max-width: 500px) {
    .rp-title { font-size: 22px; }
  }

  /* ── STAT GRID ── */
  .rp-stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 24px;
  }
  @media (max-width: 960px)  { .rp-stat-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 420px)  { .rp-stat-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }

  .rp-stat {
    background: #fff;
    border-radius: 16px;
    padding: 18px 16px;
    display: flex; align-items: center; gap: 14px;
    box-shadow: 0 2px 10px rgba(0,0,0,.06);
    border-left: 4px solid var(--sc);
    transition: transform .2s, box-shadow .2s;
    cursor: default;
  }
  .rp-stat:hover { transform: translateY(-4px); box-shadow: 0 8px 22px rgba(0,0,0,.10); }
  .rp-stat-icon {
    width: 48px; height: 48px; border-radius: 13px;
    background: var(--sl); font-size: 24px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .rp-stat-val  { font-size: 26px; font-weight: 800; color: #0f172a; line-height: 1; }
  .rp-stat-lbl  { font-size: 12px; color: #64748b; font-weight: 600; margin-top: 3px; }

  @media (max-width: 420px) {
    .rp-stat { padding: 14px 12px; gap: 10px; }
    .rp-stat-icon { width: 38px; height: 38px; font-size: 18px; border-radius: 10px; }
    .rp-stat-val  { font-size: 20px; }
  }

  /* ── PANEL ── */
  .rp-panel {
    background: #fff;
    border-radius: 20px;
    padding: 26px;
    margin-bottom: 22px;
    box-shadow: 0 2px 12px rgba(0,0,0,.06);
  }
  @media (max-width: 500px) { .rp-panel { padding: 16px 14px; } }

  .rp-panel-title { font-size: 18px; font-weight: 800; color: #0f172a; }
  .rp-panel-sub   { font-size: 13px; color: #94a3b8; margin-top: 3px; }
  .rp-divider     { border: none; border-top: 1.5px solid #f1f5f9; margin: 16px 0 20px; }

  /* ── FORM ── */
  .rp-form-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 18px;
  }
  @media (max-width: 960px)  { .rp-form-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 420px)  { .rp-form-grid { grid-template-columns: 1fr; } }

  .rp-label {
    font-size: 12px; font-weight: 700; color: #334155;
    display: flex; align-items: center; gap: 5px;
    margin-bottom: 7px;
  }
  .rp-control {
    width: 100%; padding: 11px 13px;
    font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif;
    border: 2px solid #e2e8f0; border-radius: 10px;
    background: #f8fafc; color: #1e293b;
    outline: none; transition: border-color .2s, box-shadow .2s;
    appearance: none;
  }
  .rp-control:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,.13);
    background: #fff;
  }
  .rp-submit {
    width: 100%; padding: 13px;
    font-size: 15px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #fff;
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    border: none; border-radius: 12px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    box-shadow: 0 4px 14px rgba(99,102,241,.35);
    transition: transform .2s, box-shadow .2s;
  }
  .rp-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(99,102,241,.4); }
  .rp-submit:active { transform: translateY(0); }

  /* ── FLOOR ACCORDION ── */
  .rp-floor-block { margin-bottom: 12px; }

  .rp-floor-btn {
    width: 100%; border: none; cursor: pointer;
    font-family: 'Plus Jakarta Sans', sans-serif;
    display: flex; align-items: center; justify-content: space-between;
    padding: 15px 18px;
    border-radius: 14px;
    transition: all .2s;
  }
  .rp-floor-btn.open { border-radius: 14px 14px 0 0; }

  .rp-floor-left {
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  }
  .rp-floor-name {
    font-size: 15px; font-weight: 800;
    display: flex; align-items: center; gap: 7px;
  }
  .rp-floor-pills { display: flex; gap: 6px; flex-wrap: wrap; }
  .rp-pill {
    padding: 3px 10px; border-radius: 20px;
    font-size: 11px; font-weight: 700; letter-spacing: .2px;
  }
  .rp-chevron {
    width: 28px; height: 28px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; flex-shrink: 0;
    transition: transform .25s;
  }
  .rp-chevron.open { transform: rotate(180deg); }

  /* ── ROOMS GRID ── */
  .rp-rooms-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 14px;
    padding: 16px;
    border-top: none;
    border-radius: 0 0 14px 14px;
    animation: rpSlide .22s ease;
  }
  @media (max-width: 600px) {
    .rp-rooms-grid { grid-template-columns: 1fr; padding: 12px; gap: 10px; }
  }
  @keyframes rpSlide {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── ROOM CARD ── */
  .rp-room-card {
    background: #fff;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0,0,0,.07);
    border: 1.5px solid #f1f5f9;
    transition: transform .18s, box-shadow .18s;
  }
  .rp-room-card:hover { transform: translateY(-3px); box-shadow: 0 8px 22px rgba(0,0,0,.10); }

  .rp-room-head {
    padding: 11px 14px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1.5px solid transparent;
  }
  .rp-room-num { font-size: 16px; font-weight: 800; color: #0f172a; }
  .rp-type-badge {
    padding: 3px 10px; border-radius: 7px;
    font-size: 11px; font-weight: 700;
    display: flex; align-items: center; gap: 3px;
  }

  /* occupancy bar */
  .rp-occ-wrap { padding: 8px 14px 0; }
  .rp-occ-row  { display: flex; justify-content: space-between; margin-bottom: 4px; }
  .rp-occ-lbl  { font-size: 11px; color: #94a3b8; font-weight: 600; }
  .rp-bar-bg   { height: 5px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
  .rp-bar-fill { height: 100%; border-radius: 4px; transition: width .5s ease; }

  /* beds */
  .rp-beds { padding: 10px 12px 12px; display: flex; flex-wrap: wrap; gap: 7px; }
  .rp-bed {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 12px; border-radius: 9px; font-size: 12px; font-weight: 700;
    border: 1.5px solid; cursor: default;
    transition: transform .12s;
  }
  .rp-bed:hover { transform: scale(1.05); }
  .rp-bed-free { background: #f0fdf4; border-color: #86efac; color: #15803d; }
  .rp-bed-occ  { background: #fff1f2; border-color: #fca5a5; color: #be123c; }
  .rp-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .rp-dot-free { background: #22c55e; }
  .rp-dot-occ  { background: #f43f5e; }

  /* footer */
  .rp-card-foot {
    padding: 8px 14px;
    border-top: 1.5px solid #f1f5f9;
    display: flex; gap: 10px; flex-wrap: wrap;
  }
  .rp-foot-tag {
    font-size: 11px; font-weight: 600; color: #64748b;
    display: flex; align-items: center; gap: 3px;
  }

  /* ── EMPTY ── */
  .rp-empty {
    text-align: center; padding: 50px 20px;
    display: flex; flex-direction: column; align-items: center; gap: 8px;
  }
  .rp-empty-icon  { font-size: 52px; opacity: .3; }
  .rp-empty-title { font-size: 16px; font-weight: 700; color: #475569; }
  .rp-empty-hint  { font-size: 13px; color: #94a3b8; }
`;

/* ── Floor colour palette (10 slots) ── */
const PALETTES = [
  { accent:"#6366f1", bg:"#eef2ff", border:"#c7d2fe", text:"#3730a3", pill:"#e0e7ff" },
  { accent:"#10b981", bg:"#ecfdf5", border:"#6ee7b7", text:"#065f46", pill:"#d1fae5" },
  { accent:"#f97316", bg:"#fff7ed", border:"#fdba74", text:"#9a3412", pill:"#ffedd5" },
  { accent:"#d946ef", bg:"#fdf4ff", border:"#e879f9", text:"#86198f", pill:"#fae8ff" },
  { accent:"#3b82f6", bg:"#eff6ff", border:"#93c5fd", text:"#1e40af", pill:"#dbeafe" },
  { accent:"#ef4444", bg:"#fef2f2", border:"#fca5a5", text:"#991b1b", pill:"#fee2e2" },
  { accent:"#14b8a6", bg:"#f0fdfa", border:"#5eead4", text:"#115e59", pill:"#ccfbf1" },
  { accent:"#eab308", bg:"#fefce8", border:"#fde047", text:"#713f12", pill:"#fef9c3" },
  { accent:"#ec4899", bg:"#fdf2f8", border:"#f9a8d4", text:"#9d174d", pill:"#fce7f3" },
  { accent:"#8b5cf6", bg:"#f5f3ff", border:"#c4b5fd", text:"#4c1d95", pill:"#ede9fe" },
];
const pal = (floor) => PALETTES[(floor - 1) % PALETTES.length];

/* ═══════════════════════════════════════════════════ */
const Rooms = () => {
  const [auth] = useAuth();
  const [rooms, setRooms] = useState([]);
  const [openFloors, setOpenFloors] = useState({});
  const [form, setForm] = useState({ floor: 1, roomNumber: "", totalBeds: 1, type: "Non-AC" });

  /* inject global CSS once */
  useEffect(() => {
    if (document.getElementById("rp-style")) return;
    const s = document.createElement("style");
    s.id = "rp-style";
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
    return () => s.remove();
  }, []);

  /* fetch */
  const fetchRooms = async () => {
    try {
      const res = await axios.get("https://hostelwers.onrender.com/api/v1/room/my-rooms", {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (res.data.success) {
        setRooms(res.data.rooms);
        const floors = [...new Set(res.data.rooms.map((r) => r.floor))].sort((a, b) => a - b);
        if (floors.length) setOpenFloors({ [floors[0]]: true });
      }
    } catch { toast.error("Failed to load rooms"); }
  };
  useEffect(() => { fetchRooms(); }, []);

  /* create */
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    try {
      const res = await axios.post(
        "https://hostelwers.onrender.com/api/v1/room/create-room",
        { floor: Number(form.floor), roomNumber: form.roomNumber, totalBeds: Number(form.totalBeds), type: form.type },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      if (res.data.success) {
        toast.success("Room created!");
        setForm({ floor: 1, roomNumber: "", totalBeds: 1, type: "Non-AC" });
        fetchRooms();
      }
    } catch (err) { toast.error(err.response?.data?.message || "Failed to create room"); }
  };

  /* group */
  const grouped = rooms.reduce((acc, r) => {
    if (!acc[r.floor]) acc[r.floor] = [];
    acc[r.floor].push(r);
    return acc;
  }, {});
  const sortedFloors = Object.keys(grouped).map(Number).sort((a, b) => a - b);
  const toggle = (f) => setOpenFloors((p) => ({ ...p, [f]: !p[f] }));

  /* stats */
  const totalBeds = rooms.reduce((t, r) => t + r.beds.length, 0);
  const freeBeds  = rooms.reduce((t, r) => t + r.beds.filter((b) => !b.isOccupied).length, 0);
  const occBeds   = totalBeds - freeBeds;

  const STATS = [
    { icon:"🛏️", val: totalBeds,    lbl:"Total Beds",  sc:"#6366f1", sl:"#eef2ff" },
    { icon:"✅", val: freeBeds,     lbl:"Available",   sc:"#10b981", sl:"#ecfdf5" },
    { icon:"🔴", val: occBeds,      lbl:"Occupied",    sc:"#f97316", sl:"#fff7ed" },
    { icon:"🚪", val: rooms.length, lbl:"Total Rooms", sc:"#d946ef", sl:"#fdf4ff" },
  ];

  return (
    <div className="rooms-page">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* HEADER */}
      <div className="rp-header">
        <h1 className="rp-title">🏨 Rooms &amp; Beds Management</h1>
        <p className="rp-sub">Manage your hostel rooms and bed allocations</p>
      </div>

      {/* STATS */}
      <div className="rp-stat-grid">
        {STATS.map((s, i) => (
          <div key={i} className="rp-stat" style={{ "--sc": s.sc, "--sl": s.sl }}>
            <div className="rp-stat-icon" style={{ background: s.sl }}>{s.icon}</div>
            <div>
              <div className="rp-stat-val">{s.val}</div>
              <div className="rp-stat-lbl">{s.lbl}</div>
            </div>
          </div>
        ))}
      </div>

      {/* FORM PANEL */}
      <div className="rp-panel">
        <div className="rp-panel-title">➕ Add New Room</div>
        <div className="rp-panel-sub">Fill in the details below to register a new room</div>
        <hr className="rp-divider" />
        <form onSubmit={handleSubmit}>
          <div className="rp-form-grid">
            <div>
              <div className="rp-label">🏢 Floor Number</div>
              <select className="rp-control" value={form.floor}
                onChange={(e) => setForm({ ...form, floor: Number(e.target.value) })}>
                {[...Array(10)].map((_, i) => (
                  <option key={i+1} value={i+1}>Floor {i+1}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="rp-label">🚪 Room Number</div>
              <input className="rp-control" type="text" placeholder="e.g. 101"
                value={form.roomNumber} required
                onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} />
            </div>
            <div>
              <div className="rp-label">🛏️ Number of Beds</div>
              <select className="rp-control" value={form.totalBeds}
                onChange={(e) => setForm({ ...form, totalBeds: Number(e.target.value) })}>
                {[1,2,3,4,5].map((b) => (
                  <option key={b} value={b}>{b} Bed{b>1?"s":""}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="rp-label">❄️ Room Type</div>
              <select className="rp-control" value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="Non-AC">🌡️ Non-AC</option>
                <option value="AC">❄️ AC</option>
              </select>
            </div>
          </div>
          <button type="submit" className="rp-submit">➕ Create Room</button>
        </form>
      </div>

      {/* ACCORDION PANEL */}
      <div className="rp-panel">
        <div className="rp-panel-title">🏢 All Rooms &amp; Beds</div>
        <div className="rp-panel-sub">Tap a floor to expand and view rooms with bed details</div>
        <hr className="rp-divider" />

        {rooms.length === 0 ? (
          <div className="rp-empty">
            <div className="rp-empty-icon">📭</div>
            <div className="rp-empty-title">No rooms created yet</div>
            <div className="rp-empty-hint">Create your first room using the form above</div>
          </div>
        ) : (
          sortedFloors.map((floor) => {
            const floorRooms = grouped[floor];
            const isOpen = !!openFloors[floor];
            const p = pal(floor);
            const fTotal = floorRooms.reduce((t,r) => t + r.beds.length, 0);
            const fFree  = floorRooms.reduce((t,r) => t + r.beds.filter(b=>!b.isOccupied).length, 0);
            const fOcc   = fTotal - fFree;

            return (
              <div key={floor} className="rp-floor-block">

                {/* FLOOR BUTTON */}
                <button
                  className={`rp-floor-btn${isOpen ? " open" : ""}`}
                  style={{
                    background: isOpen ? p.accent : p.bg,
                    border: `2px solid ${isOpen ? p.accent : p.border}`,
                    color: isOpen ? "#fff" : p.text,
                    boxShadow: isOpen ? `0 4px 16px ${p.accent}44` : "0 2px 6px rgba(0,0,0,.05)",
                  }}
                  onClick={() => toggle(floor)}
                >
                  <div className="rp-floor-left">
                    <span className="rp-floor-name">
                      <span>🏢</span> Floor {floor}
                    </span>
                    <div className="rp-floor-pills">
                      {/* rooms count */}
                      <span className="rp-pill" style={{
                        background: isOpen ? "rgba(255,255,255,.2)" : "#f1f5f9",
                        color:      isOpen ? "#fff" : "#475569",
                      }}>
                        🚪 {floorRooms.length} room{floorRooms.length!==1?"s":""}
                      </span>
                      {/* free beds */}
                      <span className="rp-pill" style={{
                        background: isOpen ? "rgba(255,255,255,.2)" : "#dcfce7",
                        color:      isOpen ? "#fff" : "#15803d",
                      }}>
                        ✅ {fFree} free
                      </span>
                      {/* occupied */}
                      {fOcc > 0 && (
                        <span className="rp-pill" style={{
                          background: isOpen ? "rgba(255,255,255,.2)" : "#fee2e2",
                          color:      isOpen ? "#fff" : "#dc2626",
                        }}>
                          🔴 {fOcc} occupied
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CHEVRON */}
                  <div
                    className={`rp-chevron${isOpen ? " open" : ""}`}
                    style={{
                      background: isOpen ? "rgba(255,255,255,.22)" : p.pill,
                      color: isOpen ? "#fff" : p.accent,
                    }}
                  >▼</div>
                </button>

                {/* ROOMS GRID */}
                {isOpen && (
                  <div
                    className="rp-rooms-grid"
                    style={{
                      background: p.bg,
                      border: `2px solid ${p.border}`,
                    }}
                  >
                    {floorRooms.map((room) => {
                      const rFree = room.beds.filter(b=>!b.isOccupied).length;
                      const rOcc  = room.beds.length - rFree;
                      const rPct  = room.beds.length > 0
                        ? Math.round((rOcc / room.beds.length) * 100) : 0;
                      const barColor = rPct > 80 ? "#ef4444" : rPct > 49 ? "#f97316" : "#22c55e";

                      return (
                        <div key={room._id} className="rp-room-card">

                          {/* HEAD */}
                          <div className="rp-room-head" style={{
                            background: room.type === "AC" ? "#f0f9ff" : "#fefce8",
                            borderBottomColor: room.type === "AC" ? "#bae6fd" : "#fde68a",
                          }}>
                            <div className="rp-room-num">Room {room.roomNumber}</div>
                            <span className="rp-type-badge" style={
                              room.type === "AC"
                                ? { background:"#e0f2fe", color:"#0369a1" }
                                : { background:"#fef9c3", color:"#854d0e" }
                            }>
                              {room.type === "AC" ? "❄️ AC" : "🌡️ Non-AC"}
                            </span>
                          </div>

                          {/* OCCUPANCY BAR */}
                          <div className="rp-occ-wrap">
                            <div className="rp-occ-row">
                              <span className="rp-occ-lbl">Occupancy</span>
                              <span className="rp-occ-lbl" style={{ color: barColor, fontWeight:700 }}>
                                {rPct}%
                              </span>
                            </div>
                            <div className="rp-bar-bg">
                              <div className="rp-bar-fill" style={{ width:`${rPct}%`, background: barColor }} />
                            </div>
                          </div>

                          {/* BEDS */}
                          <div className="rp-beds">
                            {room.beds.map((bed) => (
                              <div key={bed.label}
                                className={`rp-bed ${bed.isOccupied ? "rp-bed-occ" : "rp-bed-free"}`}>
                                <div className={`rp-dot ${bed.isOccupied ? "rp-dot-occ" : "rp-dot-free"}`} />
                                Bed {bed.label}
                              </div>
                            ))}
                          </div>

                          {/* FOOTER */}
                          <div className="rp-card-foot">
                            <span className="rp-foot-tag">🛏️ {room.beds.length} beds</span>
                            <span className="rp-foot-tag" style={{ color:"#16a34a" }}>✅ {rFree} free</span>
                            {rOcc > 0 && (
                              <span className="rp-foot-tag" style={{ color:"#dc2626" }}>🔴 {rOcc} occupied</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Rooms;