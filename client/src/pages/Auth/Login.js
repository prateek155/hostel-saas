import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../context/auth";

const MAX_ATTEMPTS = 3;
const LOCK_DURATION = 30 * 1000; // 30 seconds

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [auth, setAuth] = useAuth();
  const [isLocked, setIsLocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const lockTime = localStorage.getItem("lockTime");

    if (lockTime) {
      const timeLeft = parseInt(lockTime) - Date.now();

      if (timeLeft > 0) {
        setIsLocked(true);
        setRemainingTime(Math.floor(timeLeft / 1000));

        const interval = setInterval(() => {
          const newTimeLeft = parseInt(lockTime) - Date.now();
          if (newTimeLeft <= 0) {
            clearInterval(interval);
            setIsLocked(false);
            localStorage.removeItem("lockTime");
            localStorage.removeItem("failedAttempts");
          } else {
            setRemainingTime(Math.floor(newTimeLeft / 1000));
          }
        }, 1000);

        return () => clearInterval(interval);
      } else {
        localStorage.removeItem("lockTime");
        localStorage.removeItem("failedAttempts");
      }
    }
  }, []);

  const formatTime = (seconds) => {
    const min = String(Math.floor(seconds / 60)).padStart(2, "0");
    const sec = String(seconds % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLocked) {
      toast.error("You are currently locked out. Please wait.");
      return;
    }

    const failedAttempts =
      parseInt(localStorage.getItem("failedAttempts")) || 0;

    // ❌ IMPORTANT: remove token before login
    delete axios.defaults.headers.common["Authorization"];

    /* ================= TRY STUDENT LOGIN ================= */
    try {
      const studentRes = await axios.post(
        "http://localhost:8083/api/v1/student/login",
        { email, password }
      );

      if (studentRes.data.success) {
        toast.success("Student login successful");

        const authData = {
  user: {
    ...studentRes.data.student,
    role: "student",
  },
  token: studentRes.data.token,
};

setAuth(authData);
localStorage.setItem("auth", JSON.stringify(authData));

axios.defaults.headers.common[
  "Authorization"
] = `Bearer ${studentRes.data.token}`;

navigate("/dashboard/student", { replace: true });
return; // 🔴 STOP HERE
      }
    } catch (err) {
      // ignore → try owner/admin
    }

    /* ================= TRY OWNER / ADMIN LOGIN ================= */
    try {
      const res = await axios.post(
        "http://localhost:8083/api/v1/auth/login",
        { email, password }
      );

      if (res.data.success) {
        toast.success("Login successful");

        const authData = {
          user: res.data.user,
          token: res.data.token,
          role: res.data.user.role,
        };

        setAuth(authData);
        localStorage.setItem("auth", JSON.stringify(authData));
        localStorage.removeItem("failedAttempts");
        localStorage.removeItem("lockTime");

        if (res.data.user.role === "admin") {
          navigate("/dashboard/admin", { replace: true });
        } else {
          navigate("/dashboard/owner", { replace: true });
        }
      }
    } catch (error) {
      /* ================= HANDLE FAILURE ================= */
      const newAttempts = failedAttempts + 1;
      localStorage.setItem("failedAttempts", newAttempts);

      toast.error(
        error.response?.data?.message || "Invalid email or password"
      );

      if (newAttempts >= MAX_ATTEMPTS) {
        const lockUntil = Date.now() + LOCK_DURATION;
        localStorage.setItem("lockTime", lockUntil.toString());
        setIsLocked(true);
        setRemainingTime(Math.floor(LOCK_DURATION / 1000));
        toast.error("Too many failed attempts. Try again later.");
      }
    }
  };

  return (
    <>
      <style>{`
        /* ============================================
           MODERN DARK LOGIN PAGE STYLES
           ============================================ */
        
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

        /* ============================================
           ANIMATED BACKGROUND
           ============================================ */
        .bg-animation {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
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
          width: 400px;
          height: 400px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          top: -100px;
          right: -100px;
          animation-delay: 0s;
        }

        .sphere-2 {
          width: 500px;
          height: 500px;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          bottom: -150px;
          left: -150px;
          animation-delay: 5s;
        }

        .sphere-3 {
          width: 350px;
          height: 350px;
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: 10s;
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        /* ============================================
           LOGIN CARD
           ============================================ */
        .login-card {
          height: fit-content;
          max-height: none;
          overflow: hidden;
          background: rgba(30, 30, 47, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 30px 25px;
          border-radius: 24px;
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.5),
                      0 0 0 1px rgba(255, 255, 255, 0.05);
          width: 100%;
          max-width: 480px;
          position: relative;
          z-index: 1;
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* ============================================
           HEADER SECTION
           ============================================ */
        .login-header {
          text-align: center;
          margin-bottom: 20px;
        }

        .logo-container {
          margin-bottom: 25px;
        }

        .logo-icon {
          width: 70px;
          height: 70px;
          margin: 0 auto;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
          animation: pulse 3s ease-in-out infinite;
        }

        .logo-icon span {
          font-size: 36px;
          font-weight: 800;
          color: white;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 15px 40px rgba(102, 126, 234, 0.6);
          }
        }

        .login-title {
          font-size: 32px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 12px;
          letter-spacing: -0.5px;
        }

        .login-subtitle {
          font-size: 15px;
          color: #a0aec0;
          font-weight: 400;
        }

        /* ============================================
           LOCKOUT WARNING
           ============================================ */
        .lockout-warning {
          background: linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%);
          padding: 25px;
          border-radius: 16px;
          margin-bottom: 30px;
          text-align: center;
          animation: shake 0.5s ease-in-out, glow 2s ease-in-out infinite;
          box-shadow: 0 10px 30px rgba(252, 74, 26, 0.4);
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        @keyframes glow {
          0%, 100% {
            box-shadow: 0 10px 30px rgba(252, 74, 26, 0.4);
          }
          50% {
            box-shadow: 0 10px 40px rgba(252, 74, 26, 0.6);
          }
        }

        .lock-icon {
          font-size: 32px;
          margin-bottom: 10px;
        }

        .lockout-text {
          color: white;
          font-weight: 700;
          font-size: 16px;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .lockout-timer {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .timer-label {
          color: rgba(255, 255, 255, 0.9);
          font-size: 13px;
          font-weight: 500;
        }

        .timer-value {
          color: white;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: 3px;
          font-family: 'Courier New', monospace;
        }

        /* ============================================
           FORM STYLES
           ============================================ */
        .login-form {
          margin-bottom: 30px;
        }

        .form-group {
          margin-bottom: 18px;
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
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          font-weight: 500;
        }

        .form-input::placeholder {
          color: #718096;
        }

        .form-input:focus {
          border-color: #667eea;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
          transform: translateY(-2px);
        }

        .form-input:disabled {
          background: rgba(255, 255, 255, 0.02);
          cursor: not-allowed;
          opacity: 0.5;
        }

        .password-input {
          padding-right: 55px;
        }

        .password-toggle {
          position: absolute;
          right: 15px;
          background: transparent;
          border: none;
          font-size: 20px;
          cursor: pointer;
          padding: 8px;
          outline: none;
          transition: all 0.3s ease;
          border-radius: 8px;
          z-index: 1;
        }

        .password-toggle:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: scale(1.1);
        }

        .password-toggle:active {
          transform: scale(0.95);
        }

        .password-toggle:disabled {
          cursor: not-allowed;
          opacity: 0.4;
        }

        /* ============================================
           BUTTON STYLES
           ============================================ */
        .btn {
          width: 100%;
          padding: 18px 24px;
          font-size: 16px;
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
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.6s ease;
        }

        .btn-primary:hover::before {
          left: 100%;
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(102, 126, 234, 0.5);
        }

        .btn-primary:active {
          transform: translateY(-1px);
        }

        .btn-text {
          position: relative;
          z-index: 1;
        }

        .btn-arrow {
          font-size: 20px;
          transition: transform 0.3s ease;
        }

        .btn-primary:hover .btn-arrow {
          transform: translateX(5px);
        }

        .btn-primary:disabled {
          background: rgba(255, 255, 255, 0.1);
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
          opacity: 0.6;
        }

        .btn-primary:disabled:hover {
          transform: none;
        }

        /* ============================================
           RESPONSIVE DESIGN
           ============================================ */
        @media (max-width: 480px) {

          .login-card {
            padding: 20px 15px;
            border-radius: 16px;
            max-height: 80vh;
          }

          .login-title {
            font-size: 28px;
          }

          .login-subtitle {
            font-size: 14px;
          }

          .logo-icon {
            width: 60px;
            height: 60px;
          }

          .logo-icon span {
            font-size: 30px;
          }

          .form-input {
            padding: 14px 18px 14px 48px;
            font-size: 14px;
          }

          .btn {
            padding: 16px 20px;
            font-size: 14px;
          }
        }

        /* ============================================
           TOAST CUSTOMIZATION
           ============================================ */
        .Toastify__toast-container {
          z-index: 9999;
        }

        .Toastify__toast--dark {
          background: rgba(30, 30, 47, 0.98);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        .Toastify__toast--success {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .Toastify__toast--error {
          background: linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%);
        }
      `}</style>

      <Layout title="Login - M-Group app">
        <div className="modern-login-container">
          {/* Animated Background Elements */}
          <div className="bg-animation">
            <div className="bg-sphere sphere-1"></div>
            <div className="bg-sphere sphere-2"></div>
            <div className="bg-sphere sphere-3"></div>
          </div>

          <div className="login-card">
            <ToastContainer 
              position="top-right"
              autoClose={3000}
              theme="dark"
            />

            <div className="login-header">
              <div className="logo-container">
                <div className="logo-icon">
                  <span>M</span>
                </div>
              </div>
              <h1 className="login-title">Welcome Back</h1>
              <p className="login-subtitle">Sign in to continue to M-Group</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {isLocked && (
                <div className="lockout-warning">
                  <div className="lock-icon">🔒</div>
                  <p className="lockout-text">Account Temporarily Locked</p>
                  <div className="lockout-timer">
                    <span className="timer-label">Try again in</span>
                    <span className="timer-value">{formatTime(remainingTime)}</span>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <span className="input-icon">✉️</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    placeholder="Enter your email"
                    required
                    disabled={isLocked}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔑</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input password-input"
                    placeholder="Enter your password"
                    required
                    disabled={isLocked}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLocked}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLocked}
              >
                <span className="btn-text">
                  {isLocked ? "🔒 Account Locked" : "Sign In"}
                </span>
                {!isLocked && <span className="btn-arrow">→</span>}
              </button>
            </form>
          </div>
        </div>
        <div style={{ textAlign: "right", marginTop: "8px" }}>
  <span
    style={{
      color: "#667eea",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
    }}
    onClick={() => navigate("/forgot-password")}
  >
    Forgot Password?
  </span>
</div>
      </Layout>
    </>
  );
};

export default Login;