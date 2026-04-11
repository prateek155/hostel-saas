import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Pagenotfound = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [tick, setTick] = useState(0);

  /* ── Animate room lights ── */
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 2000);
    return () => clearInterval(id);
  }, []);

  /* ── Floating particles on canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.3,
      dy: -Math.random() * 0.4 - 0.1,
      o: Math.random() * 0.5 + 0.1,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59,130,246,${p.o})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.y < 0) { p.y = canvas.height; p.x = Math.random() * canvas.width; }
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  /* Room grid — some lit, some dark, 404 always dark */
  const floors = [
    [1, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 0, 1],
    [1, 1, 0, 1, 1, 1],
    [1, 1, 1, 0, 1, 1],
  ];

  /* Toggle a random room each tick for "life" */
  const [litMap, setLitMap] = useState(() =>
    floors.map(row => [...row])
  );
  useEffect(() => {
    setLitMap(prev => {
      const next = prev.map(r => [...r]);
      const fi = Math.floor(Math.random() * floors.length);
      const ci = Math.floor(Math.random() * floors[0].length);
      next[fi][ci] = next[fi][ci] ? 0 : 1;
      return next;
    });
  }, [tick]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .pnf-root {
          min-height: 100vh;
          background: #060d1f;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', system-ui, sans-serif;
          position: relative;
          overflow: hidden;
          padding: 2rem 1rem;
        }

        /* Radial bg glow */
        .pnf-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 20% 50%, #0d2d5e18 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 80% 30%, #1e3a6e14 0%, transparent 70%),
            radial-gradient(ellipse 40% 60% at 50% 100%, #0a1f4212 0%, transparent 60%);
          pointer-events: none;
        }

        /* ── Stars ── */
        .pnf-stars {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            radial-gradient(1px 1px at 8%  12%, #fff5, transparent),
            radial-gradient(1px 1px at 22% 6%,  #fff4, transparent),
            radial-gradient(1.5px 1.5px at 37% 18%, #fff6, transparent),
            radial-gradient(1px 1px at 52% 4%,  #fff3, transparent),
            radial-gradient(1px 1px at 68% 14%, #fff4, transparent),
            radial-gradient(1.5px 1.5px at 83% 8%,  #fff5, transparent),
            radial-gradient(1px 1px at 91% 22%, #fff3, transparent),
            radial-gradient(1px 1px at 14% 32%, #fff3, transparent),
            radial-gradient(1px 1px at 76% 28%, #fff4, transparent),
            radial-gradient(1px 1px at 44% 35%, #fff2, transparent),
            radial-gradient(1px 1px at 62% 10%, #fff4, transparent),
            radial-gradient(1px 1px at 5%  45%, #fff2, transparent),
            radial-gradient(1px 1px at 95% 38%, #fff3, transparent);
        }

        /* ── Canvas particles ── */
        .pnf-canvas {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          pointer-events: none;
        }

        /* ── Layout ── */
        .pnf-wrap {
          position: relative; z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2.5rem;
          width: 100%;
          max-width: 900px;
        }

        /* ── Top brand strip ── */
        .pnf-brand {
          display: flex; align-items: center; gap: 10px;
          background: #0f1e35;
          border: 1px solid #1e3a5f;
          border-radius: 50px;
          padding: 8px 20px;
        }
        .pnf-brand-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #3b82f6;
          box-shadow: 0 0 8px #3b82f6;
          animation: pnfPulse 2s ease-in-out infinite;
        }
        .pnf-brand-text {
          font-size: 12px; font-weight: 700;
          color: #64748b; letter-spacing: 2px; text-transform: uppercase;
        }

        /* ── Main card ── */
        .pnf-card {
          background: #0c1825;
          border: 1px solid #1e3a5f;
          border-radius: 24px;
          overflow: hidden;
          width: 100%;
          box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px #0f2040;
        }

        /* ── Building scene ── */
        .pnf-scene {
          padding: 2.5rem 2rem 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          animation: pnfFloat 6s ease-in-out infinite;
        }

        /* ── Building ── */
        .pnf-building {
          width: 100%; max-width: 520px;
          position: relative;
        }

        /* Roof */
        .pnf-roof {
          height: 44px;
          background: linear-gradient(180deg, #162336 0%, #1a2d44 100%);
          border-radius: 10px 10px 0 0;
          border: 1px solid #2d4a6a;
          border-bottom: none;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 20px;
          position: relative;
        }
        .pnf-roof-logo {
          display: flex; align-items: center; gap: 8px;
        }
        .pnf-roof-icon {
          width: 20px; height: 20px;
        }
        .pnf-roof-name {
          font-size: 11px; font-weight: 800;
          color: #3b82f6; letter-spacing: 2px;
          text-transform: uppercase;
        }
        .pnf-roof-lights {
          display: flex; gap: 5px; align-items: center;
        }
        .pnf-roof-light {
          width: 6px; height: 6px; border-radius: 50%;
        }

        /* Antenna */
        .pnf-antenna {
          position: absolute; top: -36px; left: 50%;
          transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center;
        }
        .pnf-antenna-mast {
          width: 2px; height: 28px; background: #2d4a6a;
        }
        .pnf-antenna-arm {
          position: absolute; top: 6px;
          width: 20px; height: 2px; background: #2d4a6a;
        }
        .pnf-antenna-tip {
          width: 8px; height: 8px; border-radius: 50%;
          background: #ef4444;
          box-shadow: 0 0 8px #ef4444aa;
          animation: pnfBlink 1.4s ease-in-out infinite;
          margin-top: -4px;
        }

        /* Body */
        .pnf-body {
          background: linear-gradient(180deg, #0e1e30 0%, #0b1925 100%);
          border: 1px solid #1e3a5f;
          border-top: none; border-bottom: none;
        }

        /* Floor */
        .pnf-floor {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 6px;
          padding: 10px 14px;
          border-bottom: 1px solid #0a1628;
        }
        .pnf-floor:last-child { border-bottom: none; }

        /* Room window */
        .pnf-room {
          height: 42px;
          border-radius: 5px;
          position: relative; overflow: hidden;
          transition: all 0.8s ease;
        }
        .pnf-room.lit {
          background: #0d2444;
          border: 1px solid #1e4a80;
        }
        .pnf-room.dark {
          background: #07121e;
          border: 1px solid #111f30;
        }
        .pnf-room .h-bar {
          position: absolute; top: 50%; left: 0; right: 0;
          height: 1px;
        }
        .pnf-room .v-bar {
          position: absolute; top: 0; bottom: 0; left: 50%;
          width: 1px;
        }
        .pnf-room.lit .h-bar { background: #1e4a8055; }
        .pnf-room.lit .v-bar { background: #1e4a8055; }
        .pnf-room.dark .h-bar { background: #111f3044; }
        .pnf-room.dark .v-bar { background: #111f3044; }
        .pnf-room-glow {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 50% 110%, #1d4ed844, transparent 65%);
        }

        /* Ground floor with 404 door */
        .pnf-ground {
          display: flex; align-items: flex-end; gap: 6px;
          padding: 10px 14px 0;
          background: #0b1925;
          border: 1px solid #1e3a5f;
          border-top: 1px solid #0a1628;
          border-bottom: none;
        }
        .pnf-ground-windows {
          flex: 1;
          display: grid; grid-template-columns: 1fr 1fr 1fr;
          gap: 5px;
        }
        .pnf-gwin {
          height: 54px; border-radius: 4px;
          background: #0d2444; border: 1px solid #1e4a80;
          position: relative; overflow: hidden;
        }
        .pnf-gwin::after {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse at 50% 110%, #1d4ed855, transparent 65%);
        }

        /* 404 door */
        .pnf-door-wrap {
          width: 66px; flex-shrink: 0;
          display: flex; flex-direction: column; align-items: center;
          position: relative;
        }
        .pnf-door-plate {
          background: #1a0040;
          border: 1px solid #7c3aed;
          border-radius: 4px;
          padding: 2px 8px;
          font-size: 10px; font-weight: 900;
          color: #c4b5fd; letter-spacing: 1px;
          box-shadow: 0 0 12px #7c3aed44;
          margin-bottom: 3px;
          position: relative; z-index: 2;
        }
        .pnf-door {
          width: 66px; height: 76px;
          background: linear-gradient(160deg, #5b21b6 0%, #3b0764 100%);
          border-radius: 5px 5px 0 0;
          border: 2px solid #7c3aed;
          position: relative; overflow: hidden;
          box-shadow: 0 0 20px #7c3aed33;
        }
        .pnf-door-panel-top {
          margin: 6px 6px 3px;
          height: 20px; border-radius: 3px;
          border: 1px solid #7c3aed55;
        }
        .pnf-door-panel-bot {
          margin: 0 6px;
          height: 20px; border-radius: 3px;
          border: 1px solid #7c3aed55;
        }
        .pnf-door-knob {
          position: absolute; right: 8px; top: 50%;
          transform: translateY(-50%);
          width: 7px; height: 7px; border-radius: 50%;
          background: linear-gradient(135deg, #fbbf24, #d97706);
          box-shadow: 0 0 6px #fbbf2466;
        }
        .pnf-door-xmark {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
        }

        /* Vacant sign */
        .pnf-vacant {
          position: absolute; top: -50px; right: -14px; z-index: 5;
          display: flex; flex-direction: column; align-items: center;
          animation: pnfSignSwing 4s ease-in-out infinite;
          transform-origin: top center;
        }
        .pnf-vacant-cord {
          width: 1px; height: 16px; background: #475569;
        }
        .pnf-vacant-tag {
          background: #7f1d1d;
          border: 1px solid #ef444466;
          color: #fca5a5;
          font-size: 7px; font-weight: 900;
          padding: 3px 7px; border-radius: 3px;
          letter-spacing: 1.5px; text-transform: uppercase;
          box-shadow: 0 2px 10px #ef444433;
        }

        /* Step */
        .pnf-step {
          height: 10px;
          background: linear-gradient(180deg, #1e3a5f, #2d4a6a);
          border-radius: 0 0 6px 6px;
          border: 1px solid #2d4a6a;
          border-top: none;
        }

        /* Ground shadow */
        .pnf-shadow {
          width: 70%; height: 14px; border-radius: 50%;
          margin: 6px auto 0;
          background: radial-gradient(ellipse, #00000088, transparent 70%);
        }

        /* ── Bottom panel (text) ── */
        .pnf-panel {
          padding: 2.5rem 2.5rem 2.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          border-top: 1px solid #1e3a5f;
          background: #0a1628;
          text-align: center;
        }

        /* error code strip */
        .pnf-code-strip {
          display: flex; align-items: center; gap: 12px;
        }
        .pnf-code-num {
          font-size: clamp(52px, 10vw, 80px);
          font-weight: 900; line-height: 1;
          background: linear-gradient(135deg, #93c5fd 0%, #3b82f6 50%, #1d4ed8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -4px;
        }
        .pnf-code-divider {
          width: 2px; height: 60px;
          background: linear-gradient(180deg, transparent, #1e3a5f, transparent);
        }
        .pnf-code-info {
          text-align: left;
        }
        .pnf-code-label {
          font-size: 11px; font-weight: 700;
          color: #3b82f6; letter-spacing: 2px;
          text-transform: uppercase; margin-bottom: 4px;
        }
        .pnf-code-title {
          font-size: clamp(16px, 3vw, 20px); font-weight: 800;
          color: #e2e8f0; line-height: 1.3;
        }

        .pnf-desc {
          font-size: clamp(13px, 2vw, 15px);
          color: #64748b; line-height: 1.8;
          max-width: 420px;
        }

        /* ── Stats row ── */
        .pnf-stats {
          display: flex; gap: 0;
          width: 100%; max-width: 420px;
          background: #0c1825;
          border: 1px solid #1e3a5f;
          border-radius: 12px; overflow: hidden;
        }
        .pnf-stat {
          flex: 1; padding: 0.85rem 0.5rem;
          text-align: center;
          border-right: 1px solid #1e3a5f;
        }
        .pnf-stat:last-child { border-right: none; }
        .pnf-stat-val {
          font-size: 18px; font-weight: 800;
          margin-bottom: 2px;
        }
        .pnf-stat-lbl {
          font-size: 9px; font-weight: 700;
          color: #475569; letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        /* ── Actions ── */
        .pnf-actions {
          display: flex; gap: 12px; flex-wrap: wrap;
          justify-content: center;
        }
        .pnf-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 0.8rem 1.75rem; border-radius: 50px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #fff; font-weight: 700; font-size: 14px;
          text-decoration: none; border: 1px solid #3b82f644;
          animation: pnfBtnPulse 2.5s ease-in-out infinite;
          transition: transform .2s, box-shadow .2s;
          cursor: pointer;
          font-family: inherit;
        }
        .pnf-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px #3b82f666 !important;
        }
        .pnf-btn-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 0.8rem 1.75rem; border-radius: 50px;
          background: transparent;
          color: #64748b; font-weight: 600; font-size: 14px;
          text-decoration: none;
          border: 1px solid #1e3a5f;
          transition: all .2s;
          cursor: pointer;
          font-family: inherit;
        }
        .pnf-btn-secondary:hover {
          background: #0f1e35;
          color: #94a3b8;
          border-color: #2d4a6a;
        }

        /* ── Quick links ── */
        .pnf-links {
          display: flex; gap: 8px; flex-wrap: wrap;
          justify-content: center;
        }
        .pnf-link-chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 12px; border-radius: 50px;
          background: #0f1e35; border: 1px solid #1e3a5f;
          color: #64748b; font-size: 12px; font-weight: 500;
          text-decoration: none;
          transition: all .2s;
        }
        .pnf-link-chip:hover {
          background: #162640; color: #93c5fd;
          border-color: #2d4a6a;
        }

        /* ── Keyframes ── */
        @keyframes pnfFloat {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
        @keyframes pnfBlink {
          0%,100%,87%,89% { opacity: 1; }
          88%              { opacity: 0; }
        }
        @keyframes pnfPulse {
          0%,100% { box-shadow: 0 0 6px #3b82f6; }
          50%      { box-shadow: 0 0 16px #3b82f6; }
        }
        @keyframes pnfSignSwing {
          0%,100% { transform: rotate(-4deg); }
          50%      { transform: rotate(4deg); }
        }
        @keyframes pnfBtnPulse {
          0%,100% { box-shadow: 0 4px 20px #3b82f644; }
          50%      { box-shadow: 0 4px 32px #3b82f677; }
        }

        /* ── Responsive ── */
        @media (max-width: 540px) {
          .pnf-floor { grid-template-columns: repeat(4,1fr); }
          .pnf-ground-windows { grid-template-columns: 1fr 1fr; }
          .pnf-panel { padding: 1.75rem 1.25rem; }
          .pnf-code-strip { flex-direction: column; gap: 6px; }
          .pnf-code-divider { display: none; }
          .pnf-code-info { text-align: center; }
        }
      `}</style>

      <div className="pnf-root">
        <div className="pnf-stars" />
        <canvas className="pnf-canvas" ref={canvasRef} />

        <div className="pnf-wrap">

          {/* Brand pill */}
          <div className="pnf-brand">
            <div className="pnf-brand-dot" />
            <span className="pnf-brand-text">Hostel SaaS Management System</span>
          </div>

          {/* Main card */}
          <div className="pnf-card">

            {/* Building scene */}
            <div className="pnf-scene">
              <div className="pnf-building">

                {/* Antenna */}
                <div className="pnf-antenna">
                  <div className="pnf-antenna-tip" />
                  <div className="pnf-antenna-mast">
                    <div className="pnf-antenna-arm" />
                  </div>
                </div>

                {/* Roof */}
                <div className="pnf-roof">
                  <div className="pnf-roof-logo">
                    {/* Building icon */}
                    <svg className="pnf-roof-icon" viewBox="0 0 20 20" fill="none">
                      <rect x="2" y="7" width="16" height="12" rx="1" stroke="#3b82f6" strokeWidth="1.5"/>
                      <path d="M10 2L2 7h16L10 2z" stroke="#3b82f6" strokeWidth="1.5" strokeLinejoin="round"/>
                      <rect x="7" y="12" width="6" height="7" rx="1" fill="#3b82f622" stroke="#3b82f655" strokeWidth="1"/>
                    </svg>
                    <span className="pnf-roof-name">HostelSaaS</span>
                  </div>
                  <div className="pnf-roof-lights">
                    {['#22c55e','#f59e0b','#ef4444'].map((c,i) => (
                      <div key={i} className="pnf-roof-light"
                        style={{ background:c, boxShadow:`0 0 5px ${c}88` }} />
                    ))}
                  </div>
                </div>

                {/* Room floors */}
                <div className="pnf-body">
                  {litMap.map((row, fi) => (
                    <div className="pnf-floor" key={fi}>
                      {row.map((lit, wi) => (
                        <div key={wi}
                          className={`pnf-room ${lit ? 'lit' : 'dark'}`}
                        >
                          <div className="h-bar" />
                          <div className="v-bar" />
                          {lit && <div className="pnf-room-glow" />}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Ground floor */}
                <div className="pnf-ground">
                  <div className="pnf-ground-windows">
                    {[0,1,2].map(i => <div key={i} className="pnf-gwin" />)}
                  </div>

                  {/* 404 Door */}
                  <div className="pnf-door-wrap">
                    {/* Vacant sign */}
                    <div className="pnf-vacant">
                      <div className="pnf-vacant-cord" />
                      <div className="pnf-vacant-tag">Vacant</div>
                    </div>
                    <div className="pnf-door-plate">404</div>
                    <div className="pnf-door">
                      <div className="pnf-door-panel-top" />
                      <div className="pnf-door-panel-bot" />
                      <div className="pnf-door-knob" />
                      <div className="pnf-door-xmark">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                          <path d="M6 6l12 12M18 6L6 18"
                            stroke="#7c3aed" strokeWidth="2"
                            strokeLinecap="round" opacity="0.6"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="pnf-ground-windows">
                    {[0,1,2].map(i => <div key={i} className="pnf-gwin" />)}
                  </div>
                </div>

                {/* Step */}
                <div className="pnf-step" />
              </div>
              <div className="pnf-shadow" />
            </div>

            {/* Text panel */}
            <div className="pnf-panel">

              {/* 404 + title */}
              <div className="pnf-code-strip">
                <div className="pnf-code-num">404</div>
                <div className="pnf-code-divider" />
                <div className="pnf-code-info">
                  <div className="pnf-code-label">Page Not Found</div>
                  <div className="pnf-code-title">
                    This room doesn't<br />exist in the system
                  </div>
                </div>
              </div>

              <p className="pnf-desc">
                The page you're trying to access has been removed, relocated,
                or was never registered in the hostel management system.
                Head back to your dashboard or use the links below.
              </p>

              {/* Stats */}
              <div className="pnf-stats">
                {[
                  { val:'404', label:'Error Code',    color:'#a78bfa' },
                  { val:'0',   label:'Rooms Here',    color:'#ef4444' },
                  { val:'–',   label:'Owner Found',   color:'#64748b' },
                  { val:'N/A', label:'Availability',  color:'#f59e0b' },
                ].map((s,i) => (
                  <div className="pnf-stat" key={i}>
                    <div className="pnf-stat-val" style={{ color:s.color }}>{s.val}</div>
                    <div className="pnf-stat-lbl">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="pnf-actions">
                <Link to="/" className="pnf-btn-primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10"/>
                  </svg>
                  Back to Dashboard
                </Link>
                <button
                  className="pnf-btn-secondary"
                  onClick={() => navigate(-1)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 5l-7 7 7 7"/>
                  </svg>
                  Go Back
                </button>
              </div>

              {/* Quick nav chips */}
              <div className="pnf-links">
                {[
                  { to:'/admin/owners',   label:'Manage Owners' },
                  { to:'/admin/hostels',  label:'All Hostels' },
                  { to:'/admin/students', label:'Students' },
                  { to:'/admin/reports',  label:'Reports' },
                ].map((l,i) => (
                  <Link key={i} to={l.to} className="pnf-link-chip">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                    {l.label}
                  </Link>
                ))}
              </div>

            </div>
          </div>

          {/* Footer note */}
          <p style={{ fontSize:11, color:'#1e3a5f', textAlign:'center' }}>
            If you believe this is a system error, contact your platform administrator
          </p>
        </div>
      </div>
    </>
  );
};

export default Pagenotfound;