import React from 'react';

const Footer = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Cabinet+Grotesk:wght@400;500;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

        :root {
          --stayos-bg0: #04060A;
          --stayos-bg1: #080C12;
          --stayos-bd: rgba(255,255,255,.07);
          --stayos-or: #F97316;
          --stayos-or2: #FB923C;
          --stayos-or3: #EA580C;
          --stayos-t1: rgba(255,255,255,.93);
          --stayos-t2: rgba(255,255,255,.56);
          --stayos-t3: rgba(255,255,255,.32);
        }

        .stayos-footer {
          background: var(--stayos-bg1);
          border-top: 1px solid var(--stayos-bd);
          padding: 0 60px 36px;
          position: relative;
          z-index: 2;
          font-family: 'DM Sans', sans-serif;
        }

        .stayos-footer::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(249,115,22,.32), transparent);
        }

        /* Grid */
        .stayos-foot-grid {
          display: grid;
          grid-template-columns: 300px repeat(4, 1fr);
          gap: 48px;
          margin-bottom: 48px;
        }

        /* Brand */
        .stayos-foot-brand-p {
          font-size: 14px;
          color: var(--stayos-t3);
          line-height: 1.75;
          margin: 12px 0 20px;
          max-width: 230px;
        }

        .stayos-foot-socials {
          display: flex;
          gap: 8px;
        }

        .stayos-soc {
          width: 34px; height: 34px;
          background: rgba(255,255,255,.04);
          border: 1px solid var(--stayos-bd);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          color: var(--stayos-t2);
          font-size: 14px;
          text-decoration: none;
          transition: all .24s;
        }
        .stayos-soc:hover {
          background: rgba(249,115,22,.1);
          border-color: rgba(249,115,22,.25);
          color: var(--stayos-or);
          transform: translateY(-3px);
          box-shadow: 0 6px 18px rgba(249,115,22,.18);
        }

        /* Logo */
        .stayos-nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          text-decoration: none;
          margin-bottom: 4px;
        }
        .stayos-nav-logo-box {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--stayos-or), var(--stayos-or3));
          display: flex; align-items: center; justify-content: center;
          font-size: 17px;
          box-shadow: 0 0 20px rgba(249,115,22,.4);
          transition: transform .3s, box-shadow .3s;
          flex-shrink: 0;
        }
        .stayos-nav-logo:hover .stayos-nav-logo-box {
          transform: rotate(-8deg) scale(1.08);
          box-shadow: 0 0 32px rgba(249,115,22,.65);
        }
        .stayos-nav-logo-txt {
          font-family: 'Clash Display', sans-serif;
          font-size: 20px; font-weight: 700;
          letter-spacing: -.3px;
          color: var(--stayos-t1);
        }
        .stayos-nav-logo-txt em {
          font-style: normal;
          color: var(--stayos-or);
        }

        /* Column headings */
        .stayos-foot-col-h {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--stayos-t3);
          margin-bottom: 16px;
        }

        .stayos-foot-links {
          list-style: none;
          padding: 0; margin: 0;
        }
        .stayos-foot-links li { margin-bottom: 10px; }
        .stayos-foot-links a {
          color: var(--stayos-t2);
          font-size: 14px;
          transition: all .2s;
          display: flex; align-items: center; gap: 0;
          text-decoration: none;
        }
        .stayos-foot-links a::before {
          content: '';
          width: 0; height: 1px;
          background: var(--stayos-or);
          transition: width .22s;
          margin-right: 0;
        }
        .stayos-foot-links a:hover {
          color: var(--stayos-t1);
          padding-left: 9px;
        }
        .stayos-foot-links a:hover::before {
          width: 7px;
          margin-right: 4px;
        }

        /* Bottom bar */
        .stayos-foot-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 24px;
          border-top: 1px solid var(--stayos-bd);
          font-size: 13px;
          color: var(--stayos-t3);
          flex-wrap: wrap;
          gap: 12px;
        }

        .stayos-foot-legal {
          display: flex;
          gap: 20px;
        }
        .stayos-foot-legal a {
          color: var(--stayos-t3);
          text-decoration: none;
          transition: color .2s;
        }
        .stayos-foot-legal a:hover { color: var(--stayos-t1); }

        .stayos-foot-pulse {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--stayos-or);
          display: inline-block;
          margin-right: 7px;
          animation: stayosBdpulse 2.5s infinite;
        }

        @keyframes stayosBdpulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(249,115,22,.55); }
          50% { box-shadow: 0 0 0 6px rgba(249,115,22,0); }
        }

        /* Responsive */
        @media (max-width: 1100px) {
          .stayos-footer { padding: 0 22px 28px; }
          .stayos-foot-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 640px) {
          .stayos-foot-grid { grid-template-columns: 1fr; }
          .stayos-foot-bottom { flex-direction: column; text-align: center; }
        }
      `}</style>

      <footer className="stayos-footer">
        {/* Bottom bar */}
        <div className="stayos-foot-bottom">
          <div>
            <span className="stayos-foot-pulse" />
            © 2026 Imperial Technologies Pvt. Ltd. All rights reserved.
          </div>
          <div className="stayos-foot-legal">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;