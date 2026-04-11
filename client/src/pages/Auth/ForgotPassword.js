import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "../../components/Layout/Layout";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:8083/api/v1/auth/forgot-password",
        { email }
      );
      toast.success(res.data.message || "Reset link sent to your email!");
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .modern-login-container {
          height: calc(100vh - 120px);
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
          padding: 0 15px;
          position: relative;
          overflow: hidden;
        }

        /* ── Background spheres ── */
        .bg-animation {
          position: absolute;
          width: 100%; height: 100%;
          top: 0; left: 0;
          z-index: 0;
        }

        .bg-sphere {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
          animation: float 20s ease-in-out infinite;
        }

        .sphere-1 {
          width: 400px; height: 400px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          top: -100px; right: -100px;
          animation-delay: 0s;
        }

        .sphere-2 {
          width: 500px; height: 500px;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          bottom: -150px; left: -150px;
          animation-delay: 5s;
        }

        .sphere-3 {
          width: 350px; height: 350px;
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: 10s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(30px, -50px) scale(1.1); }
          66%       { transform: translate(-20px, 20px) scale(0.9); }
        }

        /* ── Card ── */
        .login-card {
          background: rgba(30, 30, 47, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 30px 25px;
          border-radius: 24px;
          box-shadow: 0 25px 70px rgba(0,0,0,0.5),
                      0 0 0 1px rgba(255,255,255,0.05);
          width: 100%;
          max-width: 480px;
          position: relative;
          z-index: 1;
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(50px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }

        /* ── Header ── */
        .login-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .logo-icon {
          width: 70px; height: 70px;
          margin: 0 auto 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 30px rgba(102,126,234,0.4);
          font-size: 32px;
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1);    box-shadow: 0 10px 30px rgba(102,126,234,0.4); }
          50%       { transform: scale(1.05); box-shadow: 0 15px 40px rgba(102,126,234,0.6); }
        }

        .login-title {
          font-size: 30px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .login-subtitle {
          font-size: 14px;
          color: #a0aec0;
          font-weight: 400;
          line-height: 1.6;
        }

        /* ── Success state ── */
        .success-box {
          text-align: center;
          padding: 20px 0 8px;
        }

        .success-icon {
          font-size: 52px;
          margin-bottom: 14px;
          animation: popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes popIn {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }

        .success-title {
          font-size: 22px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 10px;
        }

        .success-text {
          font-size: 14px;
          color: #a0aec0;
          line-height: 1.7;
          margin-bottom: 24px;
        }

        .success-email {
          color: #667eea;
          font-weight: 600;
        }

        /* ── Form ── */
        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          color: #cbd5e0;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 10px;
          letter-spacing: 0.3px;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 18px;
          font-size: 18px;
          z-index: 1;
          pointer-events: none;
        }

        .form-input {
          width: 100%;
          padding: 16px 20px 16px 52px;
          font-size: 15px;
          border: 2px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: rgba(255,255,255,0.05);
          color: #ffffff;
          font-weight: 500;
        }

        .form-input::placeholder { color: #718096; }

        .form-input:focus {
          border-color: #667eea;
          background: rgba(255,255,255,0.08);
          box-shadow: 0 0 0 4px rgba(102,126,234,0.15);
          transform: translateY(-2px);
        }

        /* ── Action row ── */
        .action-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-top: 4px;
        }

        .back-link {
          color: #667eea;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          outline: none;
          transition: color 0.2s ease;
          white-space: nowrap;
        }

        .back-link:hover {
          color: #a78bfa;
          text-decoration: underline;
        }

        .btn-primary {
          padding: 14px 24px;
          font-size: 15px;
          font-weight: 700;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
          position: relative;
          overflow: hidden;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 10px 30px rgba(102,126,234,0.4);
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }

        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.6s ease;
        }

        .btn-primary:hover::before { left: 100%; }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(102,126,234,0.5);
        }

        .btn-primary:active  { transform: translateY(-1px); }

        .btn-primary:disabled {
          background: rgba(255,255,255,0.1);
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
          opacity: 0.6;
        }

        .btn-full {
          width: 100%;
          justify-content: center;
          padding: 16px 24px;
        }

        .btn-text  { position: relative; z-index: 1; }
        .btn-arrow { font-size: 18px; transition: transform 0.3s ease; }
        .btn-primary:hover .btn-arrow { transform: translateX(5px); }

        /* ── Toast overrides ── */
        .Toastify__toast--success {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .Toastify__toast--error {
          background: linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%);
        }

        @media (max-width: 480px) {
          .login-card  { padding: 20px 15px; border-radius: 16px; }
          .login-title { font-size: 26px; }
          .form-input  { padding: 14px 18px 14px 48px; font-size: 14px; }
          .btn-primary { padding: 12px 18px; font-size: 13px; }
        }
      `}</style>

      <Layout title="Forgot Password - M-Group">
        <div className="modern-login-container">
          <div className="bg-animation">
            <div className="bg-sphere sphere-1"></div>
            <div className="bg-sphere sphere-2"></div>
            <div className="bg-sphere sphere-3"></div>
          </div>

          <div className="login-card">
            <ToastContainer position="top-right" autoClose={3000} theme="dark" />

            <div className="login-header">
              <div className="logo-icon">📧</div>
              <h1 className="login-title">Forgot Password?</h1>
              <p className="login-subtitle">
                No worries! Enter your email and we'll send you a reset link.
              </p>
            </div>

            {/* ── Success state ── */}
            {sent ? (
              <div className="success-box">
                <div className="success-icon">✅</div>
                <p className="success-title">Check your inbox!</p>
                <p className="success-text">
                  A reset link was sent to{" "}
                  <span className="success-email">{email}</span>.<br />
                  Check your spam folder if you don't see it.
                </p>
                <button
                  className="btn-primary btn-full"
                  onClick={() => navigate("/login")}
                >
                  <span className="btn-text">Back to Login</span>
                  <span className="btn-arrow">→</span>
                </button>
              </div>
            ) : (
              /* ── Form state ── */
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-wrapper">
                    <span className="input-icon">✉️</span>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Back to Login (left) | Send Reset Link (right) */}
                <div className="action-row">
                  <button
                    type="button"
                    className="back-link"
                    onClick={() => navigate("/login")}
                  >
                    ← Back to Login
                  </button>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    <span className="btn-text">
                      {loading ? "Sending…" : "Send Link"}
                    </span>
                    {!loading && <span className="btn-arrow">→</span>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default ForgotPassword;