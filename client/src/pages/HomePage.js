import React, { useEffect, useState, useRef } from 'react';
import {
  Users, Shield, BarChart3, Bell, CreditCard, 
  ArrowRight, CheckCircle, Zap, Building2, 
  Star, Lock, Wifi, Clock,  Package, Phone, 
  Mail, MapPin, } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { useNavigate } from 'react-router-dom';

/* ─── InView hook ─── */
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ─── Counter hook ─── */
function useCounter(target, duration = 2200, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let cur = 0;
    const step = target / (duration / 40);
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { setCount(target); clearInterval(t); }
      else setCount(Math.floor(cur));
    }, 40);
    return () => clearInterval(t);
  }, [start, target, duration]);
  return count;
}

const HomePage = () => {
  const navigate = useNavigate();
  const [scrollPct, setScrollPct] = useState(0);
  const [openFAQ, setOpenFAQ] = useState(null);
  const [activePlan, setActivePlan] = useState('pro');
  const [activePricing, setActivePricing] = useState('monthly');

  useEffect(() => {
    const onScroll = () => {
      const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      setScrollPct(pct);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* In-view refs */
  const [statsRef, statsVisible] = useInView();
  const [featRef, featVisible] = useInView();
  const [howRef, howVisible] = useInView();
  const [pricingRef, pricingVisible] = useInView();
  const [testiRef, testiVisible] = useInView();
  const [faqRef, faqVisible] = useInView();
  const [ctaRef, ctaVisible] = useInView();
  const [contactRef, contactVisible] = useInView();
  const [marqRef, marqVisible] = useInView();

  /* Counters */
  const instCount   = useCounter(1200, 2000, statsVisible);
  const studCount   = useCounter(84000, 2200, statsVisible);
  const uptimeCount = useCounter(99, 1800, statsVisible);
  const supportCount = useCounter(24, 1500, statsVisible);

  const features = [
    {
      icon: Users, title: "Student Management",
      desc: "Complete student lifecycle — admission to checkout. Allocate rooms, track occupancy, manage waitlists with one dashboard.",
      color: "#f97316", tags: ["Profiles", "Occupancy", "Waitlist"],
    },
    {
      icon: CreditCard, title: "Fee & Billing Engine",
      desc: "Automated invoicing, UPI/NEFT/card collection, late-fee rules, and real-time ledgers. Zero manual reconciliation.",
      color: "#fb923c", tags: ["UPI", "Invoices", "Ledger"],
    },
    {
      icon: Bell, title: "Complaint & Maintenance",
      desc: "Students raise tickets via portal or WhatsApp. Auto-assigned to staff. Track SLA, closure rate, and satisfaction.",
      color: "#f59e0b", tags: ["Ticketing", "SLA", "WhatsApp"],
    },
    {
      icon: Shield, title: "Visitor & Gate Control",
      desc: "Digital visitor register with photo, OTP verification, and real-time alerts to wardens. Full audit trail.",
      color: "#f97316", tags: ["OTP", "Audit", "Alerts"],
    },
    {
      icon: BarChart3, title: "Analytics & Reports",
      desc: "Live dashboards for occupancy rates, fee collection, complaint trends, and expense forecasting — export-ready.",
      color: "#fb923c", tags: ["Live Data", "Export", "KPIs"],
    },
    {
      icon: Package, title: "Mess & Inventory",
      desc: "Menu planning, attendance tracking, stock management, and vendor PO generation in one unified module.",
      color: "#f59e0b", tags: ["Menu", "Stock", "Vendors"],
    },
  ];

  const steps = [
    { num: "01", title: "Set Up Your Hostel", desc: "Configure buildings, floors, room types, and capacity in minutes using our guided onboarding wizard." },
    { num: "02", title: "Onboard Students", desc: "Import existing data or let students self-register via portal. Auto-assign rooms based on your rules." },
    { num: "03", title: "Automate Operations", desc: "Fees, complaints, notices, and reports run on autopilot. Your staff focuses on residents, not paperwork." },
    { num: "04", title: "Grow Confidently", desc: "Add blocks, institutions, and users without limits. StayOS scales from 50 to 50,000 beds seamlessly." },
  ];

  const plans = {
    monthly: [
      {
        id: 'starter', name: 'Starter', price: '₹2,999', period: '/mo',
        desc: 'Perfect for small PGs and hostels getting started.',
        features: ['Up to 100 beds', '2 admin users', 'Fee collection', 'Complaint management', 'Basic reports', 'Email support'],
        cta: 'Start Free Trial', highlight: false,
      },
      {
        id: 'pro', name: 'Pro', price: '₹7,499', period: '/mo',
        desc: 'Everything you need to run a growing institution.',
        features: ['Up to 500 beds', '10 admin users', 'All Starter features', 'Visitor management', 'Mess module', 'WhatsApp alerts', 'Advanced analytics', 'Priority support'],
        cta: 'Get Pro', highlight: true,
      },
      {
        id: 'enterprise', name: 'Enterprise', price: 'Custom', period: '',
        desc: 'Built for universities, chains, and large institutions.',
        features: ['Unlimited beds', 'Unlimited users', 'All Pro features', 'Multi-campus', 'Custom integrations', 'Dedicated CSM', 'SLA guarantee', '24/7 phone support'],
        cta: 'Contact Sales', highlight: false,
      },
    ],
    annual: [
      {
        id: 'starter', name: 'Starter', price: '₹2,399', period: '/mo',
        desc: 'Perfect for small PGs and hostels getting started.',
        features: ['Up to 100 beds', '2 admin users', 'Fee collection', 'Complaint management', 'Basic reports', 'Email support'],
        cta: 'Start Free Trial', highlight: false,
      },
      {
        id: 'pro', name: 'Pro', price: '₹5,999', period: '/mo',
        desc: 'Everything you need to run a growing institution.',
        features: ['Up to 500 beds', '10 admin users', 'All Starter features', 'Visitor management', 'Mess module', 'WhatsApp alerts', 'Advanced analytics', 'Priority support'],
        cta: 'Get Pro', highlight: true,
      },
      {
        id: 'enterprise', name: 'Enterprise', price: 'Custom', period: '',
        desc: 'Built for universities, chains, and large institutions.',
        features: ['Unlimited beds', 'Unlimited users', 'All Pro features', 'Multi-campus', 'Custom integrations', 'Dedicated CSM', 'SLA guarantee', '24/7 phone support'],
        cta: 'Contact Sales', highlight: false,
      },
    ],
  };

  const testimonials = [
    {
      name: "Dr. Rajeev Sharma", role: "Hostel Warden, NIT Jaipur",
      avatar: "RS", color: "#f97316",
      text: "StayOS cut our fee reconciliation time from 3 days to 3 hours. The real-time occupancy dashboard alone is worth every rupee.",
    },
    {
      name: "Priya Menon", role: "Admin Manager, BITS Pilani",
      avatar: "PM", color: "#fb923c",
      text: "Student complaints used to drown our team. Now they're tracked, assigned, and closed automatically. Our satisfaction scores went up 40%.",
    },
    {
      name: "Vikram Joshi", role: "Director, Sunrise PG Network",
      avatar: "VJ", color: "#f59e0b",
      text: "We manage 6 hostels across Pune with StayOS. One dashboard, one login, complete control. We'd never go back to spreadsheets.",
    },
  ];

  const faqs = [
    { q: "How long does onboarding take?", a: "Most institutions are fully live within 2–3 days. Our team handles data migration, staff training, and configuration — you just approve and go." },
    { q: "Is my data secure?", a: "Yes. StayOS uses bank-grade 256-bit encryption, ISO 27001-aligned infrastructure, daily backups, and role-based access control." },
    { q: "Can I try it before paying?", a: "Absolutely. Start a 30-day free trial on any plan — no credit card required. Full feature access from day one." },
    { q: "Does it work on mobile?", a: "Yes. StayOS is fully responsive and we have native apps for Android and iOS for students, wardens, and admins." },
    { q: "What payment methods do you support?", a: "UPI, NEFT, IMPS, credit/debit cards, and net banking via Razorpay integration. Fully automated receipts and ledger entries." },
    { q: "Can I manage multiple campuses?", a: "Yes, the Pro and Enterprise plans support multiple buildings. Enterprise supports multi-campus with separate admin hierarchies." },
  ];

  return (
    <>
      <Layout title="StayOS — Hostel Management Platform">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

          /* ── VARIABLES ───────────────── */
          :root {
            --or:  #f97316;
            --or2: #fb923c;
            --or3: #ea580c;
            --bg:  #04060a;
            --bg1: #080c12;
            --bg2: #0d1117;
            --bd:  rgba(255,255,255,.07);
            --bd2: rgba(249,115,22,.18);
            --t1:  rgba(255,255,255,.95);
            --t2:  rgba(255,255,255,.55);
            --t3:  rgba(255,255,255,.3);
          }

          /* ── BASE ──────────────────── */
          *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
          html, body, #root { background: var(--bg) !important; scrollbar-width: none;}
          html::-webkit-scrollbar { display: none; }
          .sos { font-family:'DM Sans',sans-serif; background:var(--bg); color:var(--t1); overflow-x:hidden; }

          /* ── SCROLL PROGRESS ───────── */
          .sos-prog {
            position:fixed; top:0; left:0; z-index:9999;
            height:2px; transition:width .1s linear;
            background: linear-gradient(90deg, var(--or3), var(--or), var(--or2));
            box-shadow: 0 0 12px rgba(249,115,22,.8);
          }

          /* ── NOISE OVERLAY ─────────── */
          .sos-noise {
            position:fixed; inset:0; pointer-events:none; z-index:500;
            background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.03'/%3E%3C/svg%3E");
            opacity:.6;
          }

          /* ── KEYFRAMES ─────────────── */
          @keyframes fadeUp   { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
          @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
          @keyframes orbFloat { 0%,100%{transform:translateY(0) scale(1) rotate(0deg)} 33%{transform:translateY(-22px) scale(1.04) rotate(3deg)} 66%{transform:translateY(12px) scale(.97) rotate(-2deg)} }
          @keyframes hexSpin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
          @keyframes hexSpinR { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
          @keyframes gradShift{ 0%,100%{background-position:0%} 50%{background-position:200%} }
          @keyframes pulseDot { 0%,100%{box-shadow:0 0 0 0 rgba(249,115,22,.6)} 50%{box-shadow:0 0 0 7px rgba(249,115,22,0)} }
          @keyframes scanline { from{transform:translateY(-100%)} to{transform:translateY(100vh)} }
          @keyframes borderGlow { 0%,100%{opacity:.35} 50%{opacity:.9} }
          @keyframes countUp { from{opacity:0;transform:scale(.8)} to{opacity:1;transform:scale(1)} }
          @keyframes marqScroll{ from{transform:translateX(0)} to{transform:translateX(-50%)} }
          @keyframes particleRise { 0%{transform:translateY(0) scale(0);opacity:0} 10%{opacity:.7} 90%{opacity:.2} 100%{transform:translateY(-80vh) scale(1.5);opacity:0} }

          /* ── FADE-IN UTIL ──────────── */
          .sos-fade { opacity:0; transform:translateY(24px); transition:opacity .7s ease, transform .7s ease; }
          .sos-fade.sos-in { opacity:1; transform:translateY(0); }
          .sos-fade:nth-child(1){transition-delay:0ms}
          .sos-fade:nth-child(2){transition-delay:90ms}
          .sos-fade:nth-child(3){transition-delay:180ms}
          .sos-fade:nth-child(4){transition-delay:270ms}
          .sos-fade:nth-child(5){transition-delay:360ms}
          .sos-fade:nth-child(6){transition-delay:450ms}

          /* ══════════════════════════════════════
             HERO
          ══════════════════════════════════════ */
          .sos-hero {
            min-height:100vh;
            display:flex; flex-direction:column;
            align-items:center; justify-content:center;
            text-align:center;
            padding:160px 24px 120px;
            position:relative; overflow:hidden;
            background:var(--bg);
          }

          /* Grid bg */
          .sos-grid-bg {
            position:absolute; inset:0; pointer-events:none;
            background-image:
              linear-gradient(rgba(249,115,22,.018) 1px,transparent 1px),
              linear-gradient(90deg,rgba(249,115,22,.018) 1px,transparent 1px);
            background-size:64px 64px;
            mask-image:radial-gradient(ellipse 80% 75% at 50% 40%, black 30%, transparent 100%);
          }

          /* Hexagon ring decorations */
          .sos-hex-ring {
            position:absolute; border-radius:50%; pointer-events:none;
          }
          .sos-hex1 {
            width:700px; height:700px;
            border:1px solid rgba(249,115,22,.06);
            top:50%; left:50%;
            transform:translate(-50%,-55%);
            animation:hexSpin 60s linear infinite;
          }
          .sos-hex2 {
            width:500px; height:500px;
            border:1px solid rgba(249,115,22,.05);
            top:50%; left:50%;
            transform:translate(-50%,-55%);
            animation:hexSpinR 45s linear infinite;
          }
          .sos-hex3 {
            width:320px; height:320px;
            border:1px solid rgba(249,115,22,.08);
            top:50%; left:50%;
            transform:translate(-50%,-55%);
            animation:hexSpin 30s linear infinite;
          }

          /* Glow orbs */
          .sos-orb {
            position:absolute; border-radius:50%;
            filter:blur(90px); pointer-events:none;
          }
          .sos-o1 {
            width:600px; height:400px;
            background:radial-gradient(ellipse,rgba(249,115,22,.1) 0%,transparent 65%);
            top:-80px; left:50%; transform:translateX(-50%);
            animation:orbFloat 14s ease-in-out infinite;
          }
          .sos-o2 {
            width:400px; height:400px;
            background:radial-gradient(circle,rgba(234,88,12,.07) 0%,transparent 70%);
            bottom:60px; right:-80px;
            animation:orbFloat 11s ease-in-out 3s infinite reverse;
          }
          .sos-o3 {
            width:300px; height:300px;
            background:radial-gradient(circle,rgba(251,146,60,.05) 0%,transparent 70%);
            bottom:80px; left:-60px;
            animation:orbFloat 9s ease-in-out 6s infinite;
          }

          /* Scanline effect */
          .sos-scan-line {
            position:absolute; left:0; right:0; height:80px;
            background:linear-gradient(180deg,transparent,rgba(249,115,22,.025),transparent);
            pointer-events:none; animation:scanline 8s linear infinite;
            z-index:1;
          }

          /* Particles */
          .sos-particles { position:absolute; inset:0; pointer-events:none; }
          .sos-particle {
            position:absolute; border-radius:50%;
            animation:particleRise linear infinite; opacity:0;
          }

          /* Badge */
          .sos-badge {
            display:inline-flex; align-items:center; gap:9px;
            background:rgba(249,115,22,.07);
            border:1px solid rgba(249,115,22,.22);
            border-radius:100px; padding:7px 20px;
            font-family:'JetBrains Mono',monospace;
            font-size:12px; font-weight:500; color:#fb923c;
            letter-spacing:.5px; margin-bottom:32px;
            position:relative; z-index:2;
            animation:fadeUp .8s ease both;
            backdrop-filter:blur(12px);
          }
          .sos-badge-dot {
            width:7px; height:7px; border-radius:50%;
            background:var(--or); animation:pulseDot 2s infinite;
          }

          /* Hero headline */
          .sos-h1 {
            font-family:'Syne',sans-serif;
            font-size:clamp(48px,8.5vw,104px);
            font-weight:800; line-height:.92;
            letter-spacing:-5px; margin-bottom:26px;
            position:relative; z-index:2;
            animation:fadeUp .8s ease .1s both;
          }
          .sos-or-grad {
            display:block;
            background:linear-gradient(115deg, #f97316 0%, #fb923c 35%, #fbbf24 65%, #f97316 100%);
            background-size:300%;
            -webkit-background-clip:text; -webkit-text-fill-color:transparent;
            background-clip:text;
            animation:gradShift 4s ease infinite;
          }

          .sos-hero-sub {
            font-size:18px; color:var(--t2); max-width:520px;
            line-height:1.8; margin:0 auto 48px;
            position:relative; z-index:2;
            animation:fadeUp .8s ease .2s both;
          }

          /* CTA Buttons */
          .sos-btns {
            display:flex; gap:14px; justify-content:center; flex-wrap:wrap;
            position:relative; z-index:2; margin-bottom:64px;
            animation:fadeUp .8s ease .3s both;
          }
          .sos-btn {
            display:inline-flex; align-items:center; gap:9px;
            border-radius:12px; font-family:'DM Sans',sans-serif;
            font-weight:600; cursor:pointer; transition:all .28s;
            border:none; text-decoration:none; font-size:16px;
          }
          .sos-btn-lg { padding:16px 36px; }
          .sos-btn-primary {
            background:linear-gradient(135deg, var(--or), var(--or3));
            color:#fff;
            box-shadow:0 8px 32px rgba(249,115,22,.35);
          }
          .sos-btn-primary:hover {
            transform:translateY(-2px) scale(1.03);
            box-shadow:0 16px 48px rgba(249,115,22,.55);
          }
          .sos-btn-ghost {
            background:rgba(255,255,255,.04);
            border:1px solid rgba(255,255,255,.14); color:var(--t1);
          }
          .sos-btn-ghost:hover {
            background:rgba(249,115,22,.07);
            border-color:rgba(249,115,22,.3); color:#fb923c;
            transform:translateY(-2px);
          }

          /* Trust row */
          .sos-trust {
            position:relative; z-index:2;
            animation:fadeUp .8s ease .4s both;
          }
          .sos-trust-lbl {
            font-size:11px; text-transform:uppercase;
            letter-spacing:2.5px; color:var(--t3); margin-bottom:14px;
            font-family:'JetBrains Mono',monospace;
          }
          .sos-trust-chips { display:flex; gap:10px; justify-content:center; flex-wrap:wrap; }
          .sos-chip {
            display:flex; align-items:center; gap:7px;
            background:rgba(255,255,255,.03);
            border:1px solid rgba(255,255,255,.08);
            border-radius:10px; padding:8px 16px;
            font-size:13px; font-weight:500; color:var(--t2);
            transition:all .25s;
          }
          .sos-chip:hover {
            background:rgba(249,115,22,.07);
            border-color:rgba(249,115,22,.22); color:var(--t1);
            transform:translateY(-2px);
          }

          /* ══ MARQUEE ══════════════════════════ */
          .sos-marq-wrap {
            overflow:hidden; padding:18px 0;
            background:rgba(249,115,22,.03);
            border-top:1px solid rgba(249,115,22,.1);
            border-bottom:1px solid rgba(249,115,22,.1);
            position:relative; z-index:2;
          }
          .sos-marq-wrap::before,
          .sos-marq-wrap::after {
            content:''; position:absolute; top:0; bottom:0;
            width:160px; z-index:1; pointer-events:none;
          }
          .sos-marq-wrap::before { left:0; background:linear-gradient(90deg,var(--bg),transparent); }
          .sos-marq-wrap::after  { right:0; background:linear-gradient(-90deg,var(--bg),transparent); }
          .sos-marq-track {
            display:flex; width:max-content;
            animation:marqScroll 26s linear infinite;
          }
          .sos-marq-track:hover { animation-play-state:paused; }
          .sos-marq-item {
            display:flex; align-items:center; gap:9px;
            padding:0 30px; font-size:13px; font-weight:500;
            color:rgba(249,115,22,.55); white-space:nowrap;
            border-right:1px solid rgba(249,115,22,.1);
            font-family:'JetBrains Mono',monospace;
          }
          .sos-marq-dot { width:5px; height:5px; border-radius:50%; background:var(--or); opacity:.5; }

          /* ══ SECTION COMMON ═══════════════════ */
          .sos-sec {
            padding:120px 48px;
            max-width:1280px; margin:0 auto;
            position:relative; z-index:2;
          }
          .sos-eyebrow {
            display:inline-flex; align-items:center; gap:9px;
            font-family:'JetBrains Mono',monospace;
            font-size:11px; font-weight:700;
            text-transform:uppercase; letter-spacing:2px;
            color:var(--or); margin-bottom:18px;
          }
          .sos-eyebrow::before {
            content:''; width:22px; height:2px;
            background:var(--or); border-radius:2px;
          }
          .sos-h2 {
            font-family:'Syne',sans-serif;
            font-size:clamp(32px,5vw,58px);
            font-weight:800; letter-spacing:-2.5px;
            line-height:.97; margin-bottom:16px; max-width:600px;
          }
          .sos-sub {
            font-size:16px; color:var(--t2); line-height:1.78;
            max-width:460px; margin-bottom:56px;
          }

          /* Divider line accent */
          .sos-divider {
            border:none;
            border-top:1px solid var(--bd);
            position:relative; overflow:visible;
          }
          .sos-divider::after {
            content:''; position:absolute;
            top:-1px; left:0; right:0; height:1px;
            background:linear-gradient(90deg,transparent,rgba(249,115,22,.3),transparent);
          }

          /* ══ STATS ════════════════════════════ */
          .sos-stats-wrap {
            background:rgba(249,115,22,.02);
            border-top:1px solid rgba(249,115,22,.1);
            border-bottom:1px solid rgba(249,115,22,.1);
            position:relative; z-index:2;
          }
          .sos-stats-wrap::before {
            content:''; position:absolute; top:0; left:0; right:0; height:1px;
            background:linear-gradient(90deg,transparent,rgba(249,115,22,.4),transparent);
          }
          .sos-stats-grid {
            max-width:1280px; margin:0 auto;
            display:grid; grid-template-columns:repeat(4,1fr);
          }
          .sos-stat {
            padding:52px 24px; text-align:center;
            border-right:1px solid var(--bd); position:relative; overflow:hidden;
          }
          .sos-stat:last-child { border-right:none; }
          .sos-stat::after {
            content:''; position:absolute; bottom:0; left:0; right:0; height:1px;
            background:linear-gradient(90deg,transparent,rgba(249,115,22,.2),transparent);
            opacity:0; transition:opacity .3s;
          }
          .sos-stat:hover::after { opacity:1; }
          .sos-stat-n {
            font-family:'Syne',sans-serif;
            font-size:56px; font-weight:800; letter-spacing:-3px;
            line-height:1; margin-bottom:8px;
            background:linear-gradient(160deg,#fff 20%,rgba(249,115,22,.8) 100%);
            -webkit-background-clip:text; -webkit-text-fill-color:transparent;
            background-clip:text;
          }
          .sos-stat-l { font-size:14px; color:var(--t3); letter-spacing:.3px; }
          .sos-stat-sup {
            font-size:28px; font-family:'Syne',sans-serif; font-weight:800;
            background:linear-gradient(160deg,#fff 20%,rgba(249,115,22,.8) 100%);
            -webkit-background-clip:text; -webkit-text-fill-color:transparent;
            background-clip:text;
          }

          /* ══ FEATURES ═════════════════════════ */
          .sos-feat-bg {
            background:rgba(255,255,255,.01);
            border-top:1px solid var(--bd); border-bottom:1px solid var(--bd);
          }
          .sos-feat-grid {
            display:grid; grid-template-columns:repeat(3,1fr); gap:18px;
          }
          .sos-fc {
            padding:36px; border-radius:20px;
            background:rgba(255,255,255,.025);
            border:1px solid rgba(255,255,255,.06);
            position:relative; overflow:hidden;
            transition:all .4s cubic-bezier(.25,.46,.45,.94);
          }
          .sos-fc::before {
            content:''; position:absolute;
            top:0; left:0; right:0; height:1px;
            background:linear-gradient(90deg,transparent,rgba(249,115,22,.5),transparent);
            opacity:0; transition:opacity .35s; animation:borderGlow 3s ease-in-out infinite;
          }
          .sos-fc:hover {
            border-color:rgba(249,115,22,.2);
            transform:translateY(-8px);
            box-shadow:0 28px 64px rgba(0,0,0,.5), 0 0 40px rgba(249,115,22,.06);
          }
          .sos-fc:hover::before { opacity:1; }
          .sos-fc-icon {
            width:52px; height:52px; border-radius:14px;
            display:flex; align-items:center; justify-content:center;
            margin-bottom:22px; transition:transform .3s;
            background:rgba(249,115,22,.1);
            border:1px solid rgba(249,115,22,.2);
          }
          .sos-fc:hover .sos-fc-icon { transform:scale(1.1) rotate(-5deg); }
          .sos-fc-title {
            font-family:'Syne',sans-serif; font-size:20px; font-weight:700;
            letter-spacing:-.3px; margin-bottom:11px;
          }
          .sos-fc-desc { font-size:14px; color:var(--t2); line-height:1.74; margin-bottom:18px; }
          .sos-fc-tags { display:flex; flex-wrap:wrap; gap:7px; }
          .sos-fc-tag {
            padding:4px 12px; border-radius:100px; font-size:11px; font-weight:600;
            background:rgba(249,115,22,.08); color:#fb923c;
            border:1px solid rgba(249,115,22,.15);
            font-family:'JetBrains Mono',monospace; letter-spacing:.3px;
          }

          /* ══ HOW IT WORKS ═════════════════════ */
          .sos-how-grid {
            display:grid; grid-template-columns:repeat(4,1fr); gap:0;
            position:relative;
          }
          .sos-how-grid::before {
            content:''; position:absolute;
            top:38px; left:calc(12.5% + 24px); right:calc(12.5% + 24px);
            height:1px; background:rgba(249,115,22,.15);
            z-index:0;
          }
          .sos-how-step {
            padding:0 24px 0; text-align:center; position:relative; z-index:1;
          }
          .sos-how-num-wrap {
            display:flex; align-items:center; justify-content:center; margin-bottom:20px;
          }
          .sos-how-num {
            width:56px; height:56px; border-radius:50%;
            background:var(--bg1);
            border:1px solid rgba(249,115,22,.25);
            display:flex; align-items:center; justify-content:center;
            font-family:'Syne',sans-serif; font-size:16px; font-weight:800;
            color:var(--or); letter-spacing:-1px;
            transition:all .3s;
            box-shadow:0 0 0 4px rgba(249,115,22,.06);
          }
          .sos-how-step:hover .sos-how-num {
            background:rgba(249,115,22,.12);
            border-color:rgba(249,115,22,.5);
            box-shadow:0 0 0 8px rgba(249,115,22,.06), 0 0 24px rgba(249,115,22,.2);
          }
          .sos-how-title {
            font-family:'Syne',sans-serif; font-size:17px; font-weight:700;
            margin-bottom:9px; letter-spacing:-.2px;
          }
          .sos-how-desc { font-size:13px; color:var(--t2); line-height:1.72; }

          /* ══ PRICING ══════════════════════════ */
          .sos-pricing-bg {
            background:rgba(249,115,22,.015);
            border-top:1px solid rgba(249,115,22,.08);
            border-bottom:1px solid rgba(249,115,22,.08);
          }

          /* Toggle */
          .sos-toggle-wrap {
            display:flex; align-items:center; justify-content:center;
            gap:16px; margin-bottom:48px;
          }
          .sos-toggle-label { font-size:14px; color:var(--t2); font-weight:500; }
          .sos-toggle {
            width:56px; height:28px; border-radius:100px;
            background:rgba(255,255,255,.08);
            border:1px solid var(--bd);
            position:relative; cursor:pointer;
            transition:background .3s;
          }
          .sos-toggle.on { background:rgba(249,115,22,.2); border-color:rgba(249,115,22,.3); }
          .sos-toggle-knob {
            position:absolute; top:3px; left:3px;
            width:20px; height:20px; border-radius:50%;
            background:#fff; transition:transform .3s;
          }
          .sos-toggle.on .sos-toggle-knob { transform:translateX(28px); background:var(--or); }
          .sos-save-badge {
            font-size:11px; font-weight:700; color:#4ade80;
            background:rgba(74,222,128,.1); border:1px solid rgba(74,222,128,.2);
            border-radius:100px; padding:3px 10px;
            font-family:'JetBrains Mono',monospace;
          }

          .sos-pricing-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
          .sos-price-card {
            padding:36px; border-radius:24px;
            background:rgba(255,255,255,.025);
            border:1px solid rgba(255,255,255,.07);
            position:relative; overflow:hidden;
            transition:all .4s;
          }
          .sos-price-card.highlight {
            background:rgba(249,115,22,.06);
            border-color:rgba(249,115,22,.25);
            box-shadow:0 0 0 1px rgba(249,115,22,.15), 0 32px 80px rgba(249,115,22,.12);
          }
          .sos-price-card.highlight::before {
            content:''; position:absolute; top:0; left:0; right:0; height:1px;
            background:linear-gradient(90deg,transparent,rgba(249,115,22,.8),transparent);
          }
          .sos-price-card:not(.highlight):hover {
            border-color:rgba(249,115,22,.15);
            transform:translateY(-5px);
          }
          .sos-popular-tag {
            position:absolute; top:20px; right:20px;
            background:var(--or); color:#fff;
            font-size:10px; font-weight:800; letter-spacing:1px;
            text-transform:uppercase; padding:4px 11px; border-radius:100px;
            font-family:'JetBrains Mono',monospace;
          }
          .sos-plan-name {
            font-family:'Syne',sans-serif; font-size:14px; font-weight:700;
            color:var(--or); text-transform:uppercase; letter-spacing:2px;
            margin-bottom:14px; font-family:'JetBrains Mono',monospace;
          }
          .sos-price-amt {
            font-family:'Syne',sans-serif; font-size:48px; font-weight:800;
            letter-spacing:-3px; line-height:1; margin-bottom:6px; color:var(--t1);
          }
          .sos-price-per { font-size:14px; color:var(--t3); margin-bottom:14px; }
          .sos-price-desc { font-size:13px; color:var(--t2); line-height:1.6; margin-bottom:26px; padding-bottom:24px; border-bottom:1px solid var(--bd); }
          .sos-price-feats { list-style:none; margin-bottom:32px; display:flex; flex-direction:column; gap:10px; }
          .sos-price-feat {
            display:flex; align-items:center; gap:10px;
            font-size:13px; color:rgba(255,255,255,.65);
          }
          .sos-price-feat-icon { color:var(--or); flex-shrink:0; }
          .sos-price-btn {
            width:100%; padding:14px; border-radius:12px;
            font-family:'DM Sans',sans-serif; font-weight:700;
            font-size:15px; cursor:pointer; border:none;
            transition:all .28s;
          }
          .sos-price-btn-or {
            background:linear-gradient(135deg,var(--or),var(--or3));
            color:#fff; box-shadow:0 8px 24px rgba(249,115,22,.3);
          }
          .sos-price-btn-or:hover {
            transform:translateY(-2px);
            box-shadow:0 14px 36px rgba(249,115,22,.5);
          }
          .sos-price-btn-outline {
            background:transparent; color:var(--t1);
            border:1px solid var(--bd);
          }
          .sos-price-btn-outline:hover {
            background:rgba(249,115,22,.07);
            border-color:rgba(249,115,22,.3); color:var(--or);
          }

          /* ══ TESTIMONIALS ═════════════════════ */
          .sos-testi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
          .sos-tc {
            padding:32px; border-radius:20px;
            background:rgba(255,255,255,.025);
            border:1px solid rgba(255,255,255,.06);
            transition:all .35s; position:relative; overflow:hidden;
          }
          .sos-tc::after {
            content:''; position:absolute; bottom:0; left:0; right:0; height:1px;
            background:linear-gradient(90deg,transparent,var(--or),transparent);
            opacity:0; transition:opacity .3s;
          }
          .sos-tc:hover {
            border-color:rgba(249,115,22,.18);
            transform:translateY(-6px);
            box-shadow:0 24px 56px rgba(0,0,0,.5);
          }
          .sos-tc:hover::after { opacity:.4; }
          .sos-tc-quote {
            font-size:40px; line-height:1; color:rgba(249,115,22,.2);
            font-family:'Syne',sans-serif; font-weight:800; margin-bottom:10px;
          }
          .sos-tc-text {
            font-size:14px; color:var(--t2); line-height:1.76;
            margin-bottom:22px; font-style:italic;
          }
          .sos-tc-stars { color:var(--or); letter-spacing:2px; font-size:13px; margin-bottom:16px; }
          .sos-tc-auth { display:flex; align-items:center; gap:12px; }
          .sos-tc-avatar {
            width:42px; height:42px; border-radius:50%;
            display:flex; align-items:center; justify-content:center;
            font-family:'Syne',sans-serif; font-weight:800; font-size:14px;
            color:#fff; flex-shrink:0;
          }
          .sos-tc-name { font-weight:700; font-size:14px; }
          .sos-tc-role { font-size:12px; color:var(--t3); margin-top:2px; }

          /* ══ FAQ ══════════════════════════════ */
          .sos-faq-list { display:flex; flex-direction:column; gap:10px; max-width:800px; margin:0 auto; }
          .sos-faq-item {
            background:rgba(255,255,255,.025); border:1px solid var(--bd);
            border-radius:14px; overflow:hidden; transition:border-color .3s;
          }
          .sos-faq-item:hover { border-color:rgba(249,115,22,.18); }
          .sos-faq-item.open { border-color:rgba(249,115,22,.25); }
          .sos-faq-q {
            padding:20px 24px; display:flex; align-items:center;
            justify-content:space-between; cursor:pointer;
            font-size:15px; font-weight:600; color:rgba(255,255,255,.85);
            transition:color .2s;
          }
          .sos-faq-q:hover { color:#fff; }
          .sos-faq-icon {
            width:28px; height:28px; border-radius:50%; flex-shrink:0;
            background:rgba(249,115,22,.07); border:1px solid rgba(249,115,22,.18);
            display:flex; align-items:center; justify-content:center;
            color:var(--or); font-size:15px;
            transition:transform .3s, background .3s;
          }
          .sos-faq-item.open .sos-faq-icon { transform:rotate(45deg); background:rgba(249,115,22,.15); }
          .sos-faq-a { max-height:0; overflow:hidden; transition:max-height .4s cubic-bezier(.25,.46,.45,.94); }
          .sos-faq-item.open .sos-faq-a { max-height:180px; }
          .sos-faq-a-inner {
            padding:0 24px 18px; font-size:14px;
            color:rgba(255,255,255,.45); line-height:1.76;
            border-top:1px solid rgba(255,255,255,.05); padding-top:14px;
          }

          /* ══ CONTACT ══════════════════════════ */
          .sos-contact-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
          .sos-cc {
            padding:32px; border-radius:20px;
            background:rgba(255,255,255,.025); border:1px solid var(--bd);
            text-align:center; transition:all .35s;
          }
          .sos-cc:hover {
            border-color:rgba(249,115,22,.2); transform:translateY(-5px);
            box-shadow:0 20px 50px rgba(0,0,0,.4);
          }
          .sos-cc-icon {
            width:52px; height:52px; border-radius:14px;
            background:linear-gradient(135deg,var(--or),var(--or3));
            display:flex; align-items:center; justify-content:center;
            margin:0 auto 18px;
            box-shadow:0 8px 24px rgba(249,115,22,.28);
            transition:transform .3s;
          }
          .sos-cc:hover .sos-cc-icon { transform:scale(1.1) rotate(-5deg); }
          .sos-cc-title { font-family:'Syne',sans-serif; font-size:16px; font-weight:700; margin-bottom:8px; }
          .sos-cc-info { font-size:13px; color:var(--t2); line-height:1.65; }

          /* ══ CTA ══════════════════════════════ */
          .sos-cta-wrap {
            margin:0 48px 120px;
            position:relative; overflow:hidden;
            border-radius:28px;
            border:1px solid rgba(249,115,22,.18);
            background:rgba(249,115,22,.04);
            padding:96px 48px; text-align:center;
            z-index:2;
          }
          .sos-cta-wrap::before {
            content:''; position:absolute;
            top:-100px; left:50%; transform:translateX(-50%);
            width:700px; height:320px;
            background:radial-gradient(ellipse,rgba(249,115,22,.1) 0%,transparent 65%);
            border-radius:50%;
          }
          .sos-cta-wrap::after {
            content:''; position:absolute;
            top:0; left:0; right:0; height:1px;
            background:linear-gradient(90deg,transparent,rgba(249,115,22,.6),transparent);
          }
          .sos-cta-h2 {
            font-family:'Syne',sans-serif;
            font-size:clamp(36px,5.5vw,70px);
            font-weight:800; letter-spacing:-3.5px; line-height:.94;
            margin-bottom:18px; position:relative; z-index:2;
          }
          .sos-cta-p {
            font-size:18px; color:var(--t2); max-width:480px;
            margin:0 auto 40px; line-height:1.76; position:relative; z-index:2;
          }
          .sos-cta-btns {
            display:flex; gap:14px; justify-content:center;
            flex-wrap:wrap; position:relative; z-index:2;
          }
          .sos-cta-note {
            font-size:12px; color:var(--t3); margin-top:20px;
            position:relative; z-index:2;
            font-family:'JetBrains Mono',monospace; letter-spacing:.5px;
          }

          /* ══ RESPONSIVE ═══════════════════════ */
          @media(max-width:1024px){
            .sos-sec { padding:80px 24px; }
            .sos-feat-grid { grid-template-columns:1fr 1fr; }
            .sos-how-grid { grid-template-columns:1fr 1fr; gap:32px; }
            .sos-how-grid::before { display:none; }
            .sos-pricing-grid { grid-template-columns:1fr; max-width:440px; margin:0 auto; }
            .sos-testi-grid { grid-template-columns:1fr; }
            .sos-contact-grid { grid-template-columns:1fr; }
            .sos-stats-grid { grid-template-columns:1fr 1fr; }
            .sos-stat { border-bottom:1px solid var(--bd); }
            .sos-cta-wrap { margin:0 24px 80px; padding:56px 24px; }
          }
          @media(max-width:640px){
            .sos-h1 { letter-spacing:-3px; }
            .sos-btns { flex-direction:column; align-items:center; }
            .sos-btn-lg { width:100%; max-width:320px; justify-content:center; }
            .sos-feat-grid { grid-template-columns:1fr; }
            .sos-how-grid { grid-template-columns:1fr; }
            .sos-stats-grid { grid-template-columns:1fr; }
          }
        `}</style>

        {/* ── OVERLAYS ── */}
        <div className="sos-noise" />
        <div className="sos-prog" style={{ width: `${scrollPct}%` }} />

        <div className="sos">

          {/* ════════════ HERO ════════════ */}
          <section className="sos-hero">
            <div className="sos-grid-bg" />
            <div className="sos-hex-ring sos-hex1" />
            <div className="sos-hex-ring sos-hex2" />
            <div className="sos-hex-ring sos-hex3" />
            <div className="sos-orb sos-o1" />
            <div className="sos-orb sos-o2" />
            <div className="sos-orb sos-o3" />
            <div className="sos-scan-line" />
            <div className="sos-particles" id="sos-particles" />

            <div className="sos-badge">
              <span className="sos-badge-dot" />
              v2.4 — Now with AI Occupancy Forecasting
            </div>

            <h1 className="sos-h1">
              Manage Every<br />
              <span className="sos-or-grad">Bed. Bill. Block.</span>
            </h1>

            <p className="sos-hero-sub">
              StayOS is the all-in-one hostel management platform for institutions that are done with spreadsheets. Automate fees, complaints, visitors, and mess — from a single dashboard.
            </p>

            <div className="sos-btns">
              <button className="sos-btn sos-btn-lg sos-btn-primary" onClick={() => navigate('/register')}>
                <Zap size={18} />
                Start Free Trial
                <ArrowRight size={18} />
              </button>
              <button className="sos-btn sos-btn-lg sos-btn-ghost" onClick={() => navigate('/demo')}>
                <Building2 size={18} />
                Book a Live Demo
              </button>
            </div>

            <div className="sos-trust">
              <p className="sos-trust-lbl">Trusted by institutions across India</p>
              <div className="sos-trust-chips">
                <span className="sos-chip"><Shield size={14} /> SOC 2 Ready</span>
                <span className="sos-chip"><Lock size={14} /> 256-bit Encrypted</span>
                <span className="sos-chip"><Wifi size={14} /> 99.9% Uptime SLA</span>
                <span className="sos-chip"><Clock size={14} /> 30-Day Free Trial</span>
                <span className="sos-chip"><Star size={14} /> 4.9 / 5 Rating</span>
              </div>
            </div>
          </section>

          {/* ════════════ MARQUEE ════════════ */}
          <div className="sos-marq-wrap">
            <div className="sos-marq-track" id="sos-mtrack" />
          </div>

          {/* ════════════ STATS ════════════ */}
          <div className="sos-stats-wrap">
            <div className="sos-stats-grid" ref={statsRef}>
              {[
                { val: instCount,    suffix: '+', label: 'Institutions Onboarded' },
                { val: studCount,    suffix: '+', label: 'Student Beds Managed' },
                { val: uptimeCount,  suffix: '.9%', label: 'Platform Uptime' },
                { val: supportCount, suffix: '/7', label: 'Support Hours', prefix:''},
              ].map((s, i) => (
                <div
                  key={i}
                  className={`sos-stat sos-fade ${statsVisible ? 'sos-in' : ''}`}
                  style={{ transitionDelay: `${i * 90}ms` }}
                >
                  <div className="sos-stat-n">
                    {s.prefix}{s.val.toLocaleString('en-IN')}<span className="sos-stat-sup">{s.suffix}</span>
                  </div>
                  <div className="sos-stat-l">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ════════════ FEATURES ════════════ */}
          <div className="sos-feat-bg">
            <div className="sos-sec" ref={featRef}>
              <div className="sos-eyebrow">Platform Modules</div>
              <h2 className="sos-h2">Everything your hostel needs. Nothing it doesn't.</h2>
              <p className="sos-sub">Six powerful modules working in perfect sync. Replace 6 different tools with one platform.</p>
              <div className="sos-feat-grid">
                {features.map((f, i) => (
                  <div
                    key={i}
                    className={`sos-fc sos-fade ${featVisible ? 'sos-in' : ''}`}
                    style={{ transitionDelay: `${i * 80}ms` }}
                  >
                    <div className="sos-fc-icon">
                      <f.icon size={22} color="#f97316" />
                    </div>
                    <div className="sos-fc-title">{f.title}</div>
                    <div className="sos-fc-desc">{f.desc}</div>
                    <div className="sos-fc-tags">
                      {f.tags.map((tag, j) => (
                        <span key={j} className="sos-fc-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ════════════ HOW IT WORKS ════════════ */}
          <div className="sos-sec" ref={howRef}>
            <div style={{ textAlign: 'center' }}>
              <div className="sos-eyebrow" style={{ justifyContent: 'center', margin: '0 auto 18px' }}>Getting Started</div>
              <h2 className="sos-h2" style={{ maxWidth: '100%', textAlign: 'center' }}>
                Live in 48 hours.<br />Not 48 days.
              </h2>
              <p className="sos-sub" style={{ textAlign: 'center', margin: '0 auto 64px' }}>Our onboarding team handles the heavy lifting. You just approve and go.</p>
            </div>
            <div className="sos-how-grid">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className={`sos-how-step sos-fade ${howVisible ? 'sos-in' : ''}`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="sos-how-num-wrap">
                    <div className="sos-how-num">{step.num}</div>
                  </div>
                  <div className="sos-how-title">{step.title}</div>
                  <div className="sos-how-desc">{step.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ════════════ PRICING ════════════ */}
          <div className="sos-pricing-bg">
            <div className="sos-sec" ref={pricingRef}>
              <div style={{ textAlign: 'center' }}>
                <div className="sos-eyebrow" style={{ justifyContent: 'center', margin: '0 auto 18px' }}>Pricing</div>
                <h2 className="sos-h2" style={{ maxWidth: '100%', textAlign: 'center' }}>
                  Straightforward pricing.<br />No hidden charges.
                </h2>
                <p className="sos-sub" style={{ textAlign: 'center', margin: '0 auto 36px' }}>All plans include a 30-day free trial. No credit card required.</p>
              </div>

              {/* Toggle */}
              <div className="sos-toggle-wrap">
                <span className="sos-toggle-label" style={{ color: activePricing === 'monthly' ? 'var(--t1)' : 'var(--t3)' }}>Monthly</span>
                <div
                  className={`sos-toggle ${activePricing === 'annual' ? 'on' : ''}`}
                  onClick={() => setActivePricing(p => p === 'monthly' ? 'annual' : 'monthly')}
                >
                  <div className="sos-toggle-knob" />
                </div>
                <span className="sos-toggle-label" style={{ color: activePricing === 'annual' ? 'var(--t1)' : 'var(--t3)' }}>Annual</span>
                {activePricing === 'annual' && <span className="sos-save-badge">Save 20%</span>}
              </div>

              <div className="sos-pricing-grid">
                {plans[activePricing].map((plan, i) => (
                  <div
                    key={plan.id}
                    className={`sos-price-card sos-fade ${pricingVisible ? 'sos-in' : ''} ${plan.highlight ? 'highlight' : ''}`}
                    style={{ transitionDelay: `${i * 90}ms` }}
                  >
                    {plan.highlight && <span className="sos-popular-tag">Most Popular</span>}
                    <div className="sos-plan-name">{plan.name}</div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 4 }}>
                      <div className="sos-price-amt">{plan.price}</div>
                      {plan.period && <div className="sos-price-per">{plan.period}</div>}
                    </div>
                    <div className="sos-price-desc">{plan.desc}</div>
                    <ul className="sos-price-feats">
                      {plan.features.map((feat, j) => (
                        <li key={j} className="sos-price-feat">
                          <CheckCircle size={14} className="sos-price-feat-icon" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`sos-price-btn ${plan.highlight ? 'sos-price-btn-or' : 'sos-price-btn-outline'}`}
                      onClick={() => navigate(plan.id === 'enterprise' ? '/contact' : '/register')}
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ════════════ TESTIMONIALS ════════════ */}
          <div className="sos-sec" ref={testiRef}>
            <div className="sos-eyebrow">What They Say</div>
            <h2 className="sos-h2">Trusted by hostel admins<br />across India</h2>
            <p className="sos-sub" style={{ marginBottom: 48 }}>Real results from real institutions — not cherry-picked demos.</p>
            <div className="sos-testi-grid">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className={`sos-tc sos-fade ${testiVisible ? 'sos-in' : ''}`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="sos-tc-quote">"</div>
                  <div className="sos-tc-stars">★★★★★</div>
                  <div className="sos-tc-text">{t.text}</div>
                  <div className="sos-tc-auth">
                    <div
                      className="sos-tc-avatar"
                      style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)`, boxShadow: `0 0 14px ${t.color}44` }}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <div className="sos-tc-name">{t.name}</div>
                      <div className="sos-tc-role">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ════════════ FAQ ════════════ */}
          <div style={{ background: 'rgba(249,115,22,.015)', borderTop: '1px solid rgba(249,115,22,.07)', borderBottom: '1px solid rgba(249,115,22,.07)' }}>
            <div className="sos-sec" ref={faqRef}>
              <div style={{ textAlign: 'center' }}>
                <div className="sos-eyebrow" style={{ justifyContent: 'center', margin: '0 auto 18px' }}>FAQ</div>
                <h2 className="sos-h2" style={{ maxWidth: '100%', textAlign: 'center' }}>Frequently asked questions</h2>
                <p className="sos-sub" style={{ textAlign: 'center', margin: '0 auto 48px' }}>Can't find what you're looking for? Reach out to our team.</p>
              </div>
              <div className="sos-faq-list">
                {faqs.map((faq, i) => (
                  <div
                    key={i}
                    className={`sos-faq-item sos-fade ${faqVisible ? 'sos-in' : ''} ${openFAQ === i ? 'open' : ''}`}
                    style={{ transitionDelay: `${i * 70}ms` }}
                  >
                    <div className="sos-faq-q" onClick={() => setOpenFAQ(openFAQ === i ? null : i)}>
                      <span>{faq.q}</span>
                      <span className="sos-faq-icon">+</span>
                    </div>
                    <div className="sos-faq-a">
                      <div className="sos-faq-a-inner">{faq.a}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ════════════ CONTACT ════════════ */}
          <div className="sos-sec" ref={contactRef}>
            <div className="sos-eyebrow">Contact Us</div>
            <h2 className="sos-h2">We're here to help.</h2>
            <p className="sos-sub">Sales, support, or a quick question — get in touch anytime.</p>
            <div className="sos-contact-grid">
              {[
                { icon: Mail,  title: 'Email Sales',    info: 'hello@stayos.in\nsales@stayos.in' },
                { icon: Phone, title: 'Call Us',         info: '+91 98765 43210\nMon–Sat, 9am–7pm IST' },
                { icon: MapPin, title: 'Headquarters',   info: '4th Floor, Tower B\nHiranandani Business Park, Pune' },
              ].map((c, i) => (
                <div
                  key={i}
                  className={`sos-cc sos-fade ${contactVisible ? 'sos-in' : ''}`}
                  style={{ transitionDelay: `${i * 90}ms` }}
                >
                  <div className="sos-cc-icon">
                    <c.icon size={22} color="#fff" />
                  </div>
                  <div className="sos-cc-title">{c.title}</div>
                  <div className="sos-cc-info" style={{ whiteSpace: 'pre-line' }}>{c.info}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ════════════ CTA ════════════ */}
          <div
            className={`sos-cta-wrap sos-fade ${ctaVisible ? 'sos-in' : ''}`}
            ref={ctaRef}
          >
            <div className="sos-badge" style={{ marginBottom: 26 }}>
              <span className="sos-badge-dot" />
              No credit card · Full access · 30 days free
            </div>
            <h2 className="sos-cta-h2">
              Your hostel deserves<br />
              <span className="sos-or-grad">better software.</span>
            </h2>
            <p className="sos-cta-p">
              Join 1,200+ institutions that switched to StayOS. Setup takes less than a day. The time you save starts immediately.
            </p>
            <div className="sos-cta-btns">
              <button className="sos-btn sos-btn-lg sos-btn-primary" onClick={() => navigate('/register')}>
                <Zap size={18} /> Start Free Trial
                <ArrowRight size={18} />
              </button>
              <button className="sos-btn sos-btn-lg sos-btn-ghost" onClick={() => navigate('/demo')}>
                <Building2 size={18} /> Schedule a Demo
              </button>
            </div>
          </div>
        </div>
        <footer className="stayos-footer">
        <div className="stayos-foot-grid">

          {/* Brand column */}
          <div>
            <a href="/" className="stayos-nav-logo">
              <div className="stayos-nav-logo-box">🏨</div>
              <span className="stayos-nav-logo-txt">Stay<em>OS</em></span>
            </a>
            <p className="stayos-foot-brand-p">
              The all-in-one hostel management SaaS platform trusted by 1,200+ institutions worldwide.
            </p>
            <div className="stayos-foot-socials">
              {[["𝕏","#"],["in","#"],["⊙","#"],["♟","#"]].map(([icon, href]) => (
                <a key={icon} href={href} className="stayos-soc">{icon}</a>
              ))}
            </div>
          </div>
          {/* Product */}
          <div>
            <div className="stayos-foot-col-h">Product</div>
            <ul className="stayos-foot-links">
              {["Features","Modules","Pricing","Changelog","Roadmap"].map(l => (
                <li key={l}><a href="#">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <div className="stayos-foot-col-h">Resources</div>
            <ul className="stayos-foot-links">
              {["Documentation","API Reference","Tutorials","Blog","Status"].map(l => (
                <li key={l}><a href="#">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <div className="stayos-foot-col-h">Company</div>
            <ul className="stayos-foot-links">
              {["About","Careers","Press","Partners","Contact"].map(l => (
                <li key={l}><a href="#">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <div className="stayos-foot-col-h">Legal</div>
            <ul className="stayos-foot-links">
              {["Privacy Policy","Terms of Service","Cookie Policy","Security","GDPR"].map(l => (
                <li key={l}><a href="#">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>

      </footer>

        {/* ── JS: particles + marquee + parallax ── */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            /* Particles */
            var c = document.getElementById('sos-particles');
            if (c) {
              for (var i = 0; i < 30; i++) {
                var p = document.createElement('div');
                p.className = 'sos-particle';
                var s = Math.random() * 3 + 1;
                var colors = ['rgba(249,115,22,.6)','rgba(234,88,12,.5)','rgba(251,146,60,.4)','rgba(255,255,255,.12)'];
                p.style.cssText = [
                  'width:'+s+'px',
                  'height:'+s+'px',
                  'left:'+Math.random()*100+'%',
                  'background:'+colors[Math.floor(Math.random()*colors.length)],
                  'animation-duration:'+(Math.random()*18+12)+'s',
                  'animation-delay:'+(Math.random()*18)+'s',
                ].join(';');
                c.appendChild(p);
              }
            }
            /* Marquee */
            var mt = document.getElementById('sos-mtrack');
            var items = [
              'Student Management','Fee Automation','Visitor Control',
              'Complaint Tracking','Mess & Inventory','Analytics Dashboard',
              'WhatsApp Alerts','UPI Payments','Room Allocation','Gate Security',
              'Multi-Campus','AI Forecasting',
            ];
            if (mt) {
              [...items, ...items, ...items].forEach(function(txt) {
                var d = document.createElement('div');
                d.className = 'sos-marq-item';
                d.innerHTML = '<span class="sos-marq-dot"></span><span>'+txt+'</span>';
                mt.appendChild(d);
              });
            }
            /* Parallax glows */
            document.addEventListener('mousemove', function(e) {
              var o1 = document.querySelector('.sos-o1');
              var o2 = document.querySelector('.sos-o2');
              if (!o1||!o2) return;
              var px = (e.clientX/window.innerWidth-.5)*18;
              var py = (e.clientY/window.innerHeight-.5)*18;
              o1.style.transform = 'translateX(calc(-50% + '+px+'px)) translateY('+py+'px)';
              o2.style.transform = 'translate('+(-px*.6)+'px,'+(-py*.6)+'px)';
            });
          })();
        `}} />
      </Layout>
    </>
  );
};

export default HomePage;