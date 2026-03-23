import { useEffect, useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import { useAuth } from "../../context/auth";
import { toast } from "react-toastify";

const StudentProfile = () => {
  const [auth] = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [showQR, setShowQR] = useState(false);
  const [payments, setPayments] = useState([]);

  /* ================= LOAD STUDENT PROFILE ================= */
  const loadStudentProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:8083/api/v1/student/profile",
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      setStudent(res.data.student);
      setEditData(res.data.student);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load profile");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentProfile();
    loadPayments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= UPDATE PROFILE ================= */
  const handleUpdateProfile = async () => {
    try {
      await axios.put(
        "http://localhost:8083/api/v1/student/profile",
        editData,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      toast.success("Profile updated successfully");
      setStudent(editData);
      setEditMode(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const loadPayments = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8083/api/v1/fees/my-payments",
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      setPayments(res.data.payments);
    } catch (error) {
      toast.error("Failed to load payments");
    }
  };

  /* ================= DOWNLOAD BILL ================= */
  const downloadBill = async (month) => {
    try {
      const res = await axios.get(
        `http://localhost:8083/api/v1/fees/download/${month}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Bill_${month}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      toast.error("Bill not available or unpaid");
    }
  };

  /* ================= CALCULATE DAYS STAYED ================= */
  const calculateDaysStayed = (joinDate) => {
    if (!joinDate) return 0;
    const join = new Date(joinDate);
    const today = new Date();
    const diffTime = Math.abs(today - join);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  /* ================= CALCULATE MONTHS STAYED ================= */
  const calculateMonthsStayed = (joinDate) => {
    if (!joinDate) return 0;
    const join = new Date(joinDate);
    const today = new Date();
    const months =
      (today.getFullYear() - join.getFullYear()) * 12 +
      (today.getMonth() - join.getMonth());
    return months;
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="profile-error">
        <p>No profile data found</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* ================= ROOT VARIABLES ================= */
        :root {
          --primary: #2563eb;
          --primary-dark: #1e40af;
          --secondary: #0ea5e9;
          --success: #10b981;
          --warning: #f59e0b;
          --danger: #ef4444;
          --dark: #1e293b;
          --light: #f8fafc;
          --gray-100: #f1f5f9;
          --gray-200: #e2e8f0;
          --gray-300: #cbd5e1;
          --gray-400: #94a3b8;
          --gray-500: #64748b;
          --gray-600: #475569;
          --gray-700: #334155;
          --gray-800: #1e293b;
          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
          --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
          --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }

        /* ================= GLOBAL RESETS ================= */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* ================= MAIN CONTAINER ================= */
        .student-profile-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: clamp(8px, 2vw, 20px);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .profile-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        /* ================= LOADING & ERROR STATES ================= */
        .profile-loading,
        .profile-error {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: clamp(1rem, 2.5vw, 1.2rem);
        }

        .spinner {
          width: clamp(36px, 6vw, 50px);
          height: clamp(36px, 6vw, 50px);
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ================= HEADER SECTION ================= */
        .profile-header {
          background: white;
          border-radius: clamp(12px, 2vw, 20px);
          padding: clamp(15px, 3vw, 30px);
          margin-bottom: clamp(10px, 2vw, 20px);
          box-shadow: var(--shadow-xl);
          position: relative;
          overflow: hidden;
        }

        .profile-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: clamp(100px, 15vw, 150px);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          z-index: 0;
        }

        .profile-header-content {
          position: relative;
          z-index: 1;
        }

        .profile-top {
          display: flex;
          align-items: flex-start;
          gap: clamp(16px, 3vw, 30px);
          margin-bottom: clamp(20px, 3vw, 30px);
          flex-wrap: wrap;
        }

        .profile-avatar-section {
          flex-shrink: 0;
          text-align: center;
        }

        .profile-avatar {
          width: clamp(70px, 12vw, 140px);
          height: clamp(70px, 12vw, 140px);
          border-radius: clamp(12px, 2vw, 20px);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: clamp(1.8rem, 5vw, 3.5rem);
          font-weight: 700;
          box-shadow: var(--shadow-xl);
          border: clamp(3px, 0.5vw, 5px) solid white;
          text-transform: uppercase;
        }

        .qr-code-container {
          margin-top: 12px;
          cursor: pointer;
          background: white;
          padding: clamp(5px, 1vw, 8px);
          border-radius: 12px;
          display: inline-block;
          box-shadow: var(--shadow-md);
          transition: transform 0.2s ease;
        }

        .qr-code-container:hover {
          transform: scale(1.05);
        }

        .qr-code-label {
          font-size: clamp(0.65rem, 1.5vw, 0.75rem);
          margin-top: 6px;
          color: #475569;
          text-align: center;
        }

        .profile-main-info {
          flex: 1;
          min-width: 0;
          padding-top: 10px;
        }

        .profile-name {
          font-size: clamp(1.1rem, 3.5vw, 2rem);
          font-weight: 700;
          color: white;
          margin-bottom: 5px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          word-break: break-word;
        }

        .profile-id {
          color: rgba(255, 255, 255, 0.9);
          font-size: clamp(0.78rem, 2vw, 1rem);
          margin-bottom: 15px;
        }

        .profile-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .badge {
          padding: clamp(4px, 1vw, 6px) clamp(10px, 2vw, 14px);
          border-radius: 20px;
          font-size: clamp(0.72rem, 1.5vw, 0.85rem);
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
        }

        .badge-active { background-color: var(--success); color: white; }
        .badge-inactive { background-color: var(--gray-400); color: white; }
        .badge-verified { background-color: #3b82f6; color: white; }
        .badge-payment-paid { background-color: var(--success); color: white; }
        .badge-payment-pending { background-color: var(--warning); color: white; }
        .badge-payment-overdue { background-color: var(--danger); color: white; }

        .profile-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          flex-wrap: wrap;
        }

        .btn {
          padding: clamp(8px, 1.5vw, 12px) clamp(14px, 2.5vw, 24px);
          border-radius: 10px;
          font-size: clamp(0.78rem, 1.8vw, 0.95rem);
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          white-space: nowrap;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: var(--shadow-md);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .btn-secondary {
          background: white;
          color: var(--primary);
          border: 2px solid var(--primary);
        }

        .btn-secondary:hover {
          background: var(--primary);
          color: white;
        }

        .btn-success { background: var(--success); color: white; }
        .btn-success:hover { background: #059669; }

        .btn-outline {
          background: transparent;
          color: white;
          border: 2px solid white;
        }

        .btn-outline:hover {
          background: white;
          color: var(--primary);
        }

        /* ================= STATS CARDS ================= */
        .profile-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: clamp(8px, 1.5vw, 15px);
          margin-top: clamp(20px, 3vw, 30px);
        }

        .stat-card {
          background: var(--light);
          padding: clamp(12px, 2vw, 20px);
          border-radius: clamp(10px, 1.5vw, 15px);
          text-align: center;
          box-shadow: var(--shadow-sm);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-md);
        }

        .stat-icon {
          font-size: clamp(1.3rem, 3vw, 2rem);
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: clamp(1.1rem, 3vw, 1.8rem);
          font-weight: 700;
          color: var(--dark);
          margin-bottom: 5px;
          word-break: break-all;
        }

        .stat-label {
          font-size: clamp(0.7rem, 1.5vw, 0.9rem);
          color: var(--gray-600);
          font-weight: 500;
        }

        /* ================= TABS ================= */
        .profile-tabs {
          display: flex;
          gap: clamp(6px, 1vw, 10px);
          margin-bottom: clamp(12px, 2vw, 20px);
          background: white;
          padding: clamp(6px, 1vw, 10px);
          border-radius: clamp(10px, 1.5vw, 15px);
          box-shadow: var(--shadow-md);
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: var(--gray-300) transparent;
          -webkit-overflow-scrolling: touch;
        }

        .profile-tabs::-webkit-scrollbar { height: 4px; }
        .profile-tabs::-webkit-scrollbar-track { background: transparent; }
        .profile-tabs::-webkit-scrollbar-thumb {
          background: var(--gray-300);
          border-radius: 3px;
        }

        .tab {
          padding: clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 24px);
          border-radius: 10px;
          font-size: clamp(0.78rem, 1.8vw, 0.95rem);
          font-weight: 600;
          border: none;
          background: transparent;
          color: var(--gray-600);
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        .tab:hover { background: var(--gray-100); }

        .tab.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: var(--shadow-sm);
        }

        /* ================= CONTENT SECTION ================= */
        .profile-content {
          background: white;
          border-radius: clamp(12px, 2vw, 20px);
          padding: clamp(15px, 3vw, 30px);
          box-shadow: var(--shadow-xl);
        }

        .content-section { display: none; }

        .content-section.active {
          display: block;
          animation: fadeIn 0.4s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .section-title {
          font-size: clamp(1rem, 2.5vw, 1.5rem);
          font-weight: 700;
          color: var(--dark);
          margin-bottom: clamp(15px, 2vw, 20px);
          padding-bottom: clamp(10px, 1.5vw, 15px);
          border-bottom: 2px solid var(--gray-200);
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        /* ================= INFO GRID ================= */
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
          gap: clamp(12px, 2vw, 20px);
          margin-bottom: clamp(20px, 3vw, 30px);
        }

        .info-item {
          background: var(--gray-100);
          padding: clamp(12px, 2vw, 20px);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .info-item:hover { background: var(--gray-200); }

        .info-label {
          font-size: clamp(0.72rem, 1.5vw, 0.85rem);
          color: var(--gray-600);
          font-weight: 600;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .info-value {
          font-size: clamp(0.9rem, 2vw, 1.1rem);
          color: var(--dark);
          font-weight: 600;
          word-break: break-word;
        }

        .info-value.editable {
          width: 100%;
          padding: clamp(8px, 1.2vw, 10px);
          border: 2px solid var(--gray-300);
          border-radius: 8px;
          font-size: clamp(0.85rem, 1.8vw, 1rem);
        }

        .info-value.editable:focus {
          outline: none;
          border-color: var(--primary);
        }

        /* ================= ACCOMMODATION CARD ================= */
        .accommodation-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: clamp(16px, 3vw, 30px);
          border-radius: clamp(10px, 1.5vw, 15px);
          color: white;
          margin-bottom: clamp(20px, 3vw, 30px);
          box-shadow: var(--shadow-lg);
        }

        .accommodation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: clamp(15px, 2vw, 20px);
          flex-wrap: wrap;
          gap: 10px;
        }

        .accommodation-title {
          font-size: clamp(1rem, 2.5vw, 1.5rem);
          font-weight: 700;
        }

        .accommodation-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(160px, 100%), 1fr));
          gap: clamp(12px, 2vw, 20px);
        }

        .accommodation-item {
          background: rgba(255, 255, 255, 0.2);
          padding: clamp(10px, 1.8vw, 15px);
          border-radius: 10px;
          backdrop-filter: blur(10px);
        }

        .accommodation-item-label {
          font-size: clamp(0.72rem, 1.5vw, 0.85rem);
          opacity: 0.9;
          margin-bottom: 5px;
        }

        .accommodation-item-value {
          font-size: clamp(1rem, 2.5vw, 1.3rem);
          font-weight: 700;
        }

        /* ================= PAYMENT HISTORY ================= */
        .payment-table-container {
          overflow-x: auto;
          margin-top: 20px;
          -webkit-overflow-scrolling: touch;
        }

        .payment-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 520px;
        }

        .payment-table thead { background: var(--gray-100); }

        .payment-table th {
          padding: clamp(10px, 1.5vw, 15px);
          text-align: left;
          font-weight: 600;
          color: var(--dark);
          font-size: clamp(0.72rem, 1.5vw, 0.9rem);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .payment-table td {
          padding: clamp(10px, 1.5vw, 15px);
          border-bottom: 1px solid var(--gray-200);
          color: var(--gray-700);
          font-size: clamp(0.78rem, 1.6vw, 0.95rem);
        }

        .payment-table tbody tr:hover { background: var(--gray-50); }

        /* ================= TIMELINE ================= */
        .timeline {
          position: relative;
          padding-left: clamp(28px, 5vw, 40px);
        }

        .timeline::before {
          content: '';
          position: absolute;
          left: clamp(10px, 2vw, 15px);
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--gray-300);
        }

        .timeline-item {
          position: relative;
          margin-bottom: clamp(20px, 3vw, 30px);
        }

        .timeline-item::before {
          content: '';
          position: absolute;
          left: clamp(-22px, -4vw, -32px);
          top: 5px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--primary);
          border: 3px solid white;
          box-shadow: 0 0 0 3px var(--primary);
        }

        .timeline-date {
          font-size: clamp(0.75rem, 1.5vw, 0.85rem);
          color: var(--gray-500);
          margin-bottom: 5px;
        }

        .timeline-content {
          background: var(--gray-100);
          padding: clamp(12px, 2vw, 15px);
          border-radius: 10px;
        }

        .timeline-title {
          font-weight: 600;
          color: var(--dark);
          margin-bottom: 5px;
          font-size: clamp(0.85rem, 1.8vw, 1rem);
        }

        .timeline-description {
          font-size: clamp(0.78rem, 1.6vw, 0.9rem);
          color: var(--gray-600);
        }

        /* ================= DOCUMENTS ================= */
        .documents-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(140px, 45%), 1fr));
          gap: clamp(10px, 1.5vw, 15px);
        }

        .document-card {
          background: var(--gray-100);
          padding: clamp(12px, 2vw, 20px);
          border-radius: 12px;
          text-align: center;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .document-card:hover {
          background: var(--gray-200);
          transform: translateY(-5px);
        }

        .document-icon {
          font-size: clamp(2rem, 4vw, 3rem);
          margin-bottom: 10px;
        }

        .document-name {
          font-size: clamp(0.78rem, 1.6vw, 0.9rem);
          font-weight: 600;
          color: var(--dark);
          margin-bottom: 5px;
        }

        .document-size {
          font-size: clamp(0.7rem, 1.4vw, 0.8rem);
          color: var(--gray-500);
        }

        /* ================= ALERTS ================= */
        .alert {
          padding: clamp(12px, 1.8vw, 15px) clamp(14px, 2vw, 20px);
          border-radius: 10px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 500;
          font-size: clamp(0.82rem, 1.8vw, 1rem);
        }

        .alert-info { background: #dbeafe; color: #1e40af; border-left: 4px solid #3b82f6; }
        .alert-warning { background: #fef3c7; color: #92400e; border-left: 4px solid #f59e0b; }
        .alert-success { background: #d1fae5; color: #065f46; border-left: 4px solid #10b981; }

        /* ================= QR CODE MODAL ================= */
        .qr-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: clamp(15px, 3vw, 20px);
        }

        .qr-modal-content {
          background: white;
          padding: clamp(20px, 3vw, 30px);
          border-radius: 20px;
          text-align: center;
          box-shadow: var(--shadow-xl);
          width: 100%;
          max-width: 400px;
        }

        .qr-modal-title {
          margin-bottom: 15px;
          font-weight: 700;
          font-size: clamp(1.1rem, 3vw, 1.5rem);
          color: var(--dark);
        }

        .qr-modal-description {
          margin-top: 15px;
          font-size: clamp(0.8rem, 1.8vw, 0.9rem);
          color: #475569;
        }

        /* ================= RESPONSIVE BREAKPOINTS ================= */

        /* Large Desktops (1200px+) - already handled by fluid values above */

        /* Tablets (768px - 1199px) */
        @media (max-width: 1199px) {
          .profile-stats {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        /* Small Tablets (768px - 991px) */
        @media (max-width: 991px) {
          .profile-top {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .profile-badges {
            justify-content: center;
          }

          .profile-actions {
            justify-content: center;
            width: 100%;
          }

          .profile-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .accommodation-details {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* Mobile (max 767px) */
        @media (max-width: 767px) {
          .profile-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .profile-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .btn {
            width: 100%;
            justify-content: center;
          }

          .accommodation-details {
            grid-template-columns: 1fr 1fr;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Small Mobile (max 480px) */
        @media (max-width: 480px) {
          .profile-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .accommodation-details {
            grid-template-columns: 1fr;
          }

          .documents-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          /* Hide tab text labels on very small screens, show only emoji */
          .tab-label {
            display: none;
          }
        }

        /* Extra Small (max 360px) */
        @media (max-width: 360px) {
          .profile-stats {
            grid-template-columns: 1fr 1fr;
          }

          .documents-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="student-profile-container">
        <div className="profile-wrapper">
          {/* ================= HEADER ================= */}
          <div className="profile-header">
            <div className="profile-header-content">
              <div className="profile-top">
                <div className="profile-avatar-section">
                  <div className="profile-avatar">
                    {student.name?.charAt(0)}
                  </div>

                  {/* QR Code */}
                  <div
                    className="qr-code-container"
                    onClick={() => setShowQR(true)}
                  >
                    <QRCodeCanvas
                      value={student.qrCodeToken}
                      size={70}
                    />
                  </div>

                  <div className="qr-code-label">Tap to expand QR</div>
                </div>

                <div className="profile-main-info">
                  <h1 className="profile-name">{student.name}</h1>
                  <p className="profile-id">
                    Student ID: {student.studentId || student._id?.slice(-8).toUpperCase()}
                  </p>

                  <div className="profile-badges">
                    <span className={`badge ${student.status === "active" ? "badge-active" : "badge-inactive"}`}>
                      ● {student.studentStatus === "active" ? "Active" : "Leave"}
                    </span>
                    {student.emailVerified && (
                      <span className="badge badge-verified">✓ Verified</span>
                    )}
                  </div>

                  <div className="profile-actions">
                    {!editMode ? (
                      <button className="btn btn-outline" onClick={() => setEditMode(true)}>
                        ✏️ Edit Profile
                      </button>
                    ) : (
                      <>
                        <button className="btn btn-success" onClick={handleUpdateProfile}>
                          ✓ Save Changes
                        </button>
                        <button
                          className="btn btn-outline"
                          onClick={() => {
                            setEditMode(false);
                            setEditData(student);
                          }}
                        >
                          ✕ Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* ================= STATS ================= */}
              <div className="profile-stats">
                <div className="stat-card">
                  <div className="stat-icon">📅</div>
                  <div className="stat-value">{calculateDaysStayed(student.joinDate)}</div>
                  <div className="stat-label">Days Stayed</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📆</div>
                  <div className="stat-value">{calculateMonthsStayed(student.joinDate)}</div>
                  <div className="stat-label">Months</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-value">₹{student.monthlyRent || "0"}</div>
                  <div className="stat-label">Monthly Rent</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🏠</div>
                  <div className="stat-value">{student.roomId?.roomNumber || "N/A"}</div>
                  <div className="stat-label">Room Number</div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= TABS ================= */}
          <div className="profile-tabs">
            <button
              className={`tab ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              📊 <span className="tab-label">Overview</span>
            </button>
            <button
              className={`tab ${activeTab === "accommodation" ? "active" : ""}`}
              onClick={() => setActiveTab("accommodation")}
            >
              🏠 <span className="tab-label">Accommodation</span>
            </button>
            <button
              className={`tab ${activeTab === "payments" ? "active" : ""}`}
              onClick={() => setActiveTab("payments")}
            >
              💳 <span className="tab-label">Payments</span>
            </button>
            <button
              className={`tab ${activeTab === "activity" ? "active" : ""}`}
              onClick={() => setActiveTab("activity")}
            >
              📈 <span className="tab-label">Activity</span>
            </button>
          </div>

          {/* ================= CONTENT ================= */}
          <div className="profile-content">
            {/* OVERVIEW TAB */}
            <div className={`content-section ${activeTab === "overview" ? "active" : ""}`}>
              <h2 className="section-title">
                <span>👤</span> Personal Information
              </h2>

              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">📧 Email Address</div>
                  {editMode ? (
                    <input
                      type="email"
                      className="info-value editable"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    />
                  ) : (
                    <div className="info-value">{student.email}</div>
                  )}
                </div>

                <div className="info-item">
                  <div className="info-label">📱 Phone Number</div>
                  {editMode ? (
                    <input
                      type="tel"
                      className="info-value editable"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    />
                  ) : (
                    <div className="info-value">{student.phone}</div>
                  )}
                </div>

                <div className="info-item">
                  <div className="info-label">🎂 Date of Birth</div>
                  <div className="info-value">
                    {student.dateOfBirth
                      ? new Date(student.dateOfBirth).toLocaleDateString()
                      : "Not provided"}
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-label">👤 Gender</div>
                  <div className="info-value">{student.gender || "Not provided"}</div>
                </div>

                <div className="info-item">
                  <div className="info-label">🆔 Aadhar Number</div>
                  <div className="info-value">
                    {student.aadharNumber
                      ? `XXXX-XXXX-${student.aadharNumber.slice(-4)}`
                      : "Not provided"}
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-label">📅 Join Date</div>
                  <div className="info-value">
                    {student.joinDate
                      ? new Date(student.joinDate).toLocaleDateString()
                      : "Not provided"}
                  </div>
                </div>
              </div>

              <h2 className="section-title">
                <span>👨‍👩‍👦</span> Emergency Contact
              </h2>

              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">👤 Guardian Name</div>
                  {editMode ? (
                    <input
                      type="text"
                      className="info-value editable"
                      value={editData.gardianName || ""}
                      onChange={(e) => setEditData({ ...editData, gardianName: e.target.value })}
                    />
                  ) : (
                    <div className="info-value">{student.gardianName || "Not provided"}</div>
                  )}
                </div>

                <div className="info-item">
                  <div className="info-label">📱 Guardian Phone</div>
                  {editMode ? (
                    <input
                      type="tel"
                      className="info-value editable"
                      value={editData.gardianphone || ""}
                      onChange={(e) => setEditData({ ...editData, gardianphone: e.target.value })}
                    />
                  ) : (
                    <div className="info-value">{student.gardianphone || "Not provided"}</div>
                  )}
                </div>

                <div className="info-item">
                  <div className="info-label">🏠 Guardian Address</div>
                  <div className="info-value">{student.gardianAddress || "Not provided"}</div>
                </div>
              </div>
            </div>

            {/* ACCOMMODATION TAB */}
            <div className={`content-section ${activeTab === "accommodation" ? "active" : ""}`}>
              <h2 className="section-title">
                <span>🏠</span> Current Accommodation
              </h2>

              {student.roomId ? (
                <>
                  <div className="accommodation-card">
                    <div className="accommodation-header">
                      <div className="accommodation-title">
                        {student.hostelName || "Hostel Name"}
                      </div>
                      <div className="badge badge-active">Active</div>
                    </div>

                    <div className="accommodation-details">
                      <div className="accommodation-item">
                        <div className="accommodation-item-label">Room Number</div>
                        <div className="accommodation-item-value">{student.roomId.roomNumber}</div>
                      </div>

                      <div className="accommodation-item">
                        <div className="accommodation-item-label">Floor</div>
                        <div className="accommodation-item-value">{student.roomId.floor}</div>
                      </div>

                      <div className="accommodation-item">
                        <div className="accommodation-item-label">Bed Number</div>
                        <div className="accommodation-item-value">{student.bedNumber}</div>
                      </div>

                      <div className="accommodation-item">
                        <div className="accommodation-item-label">Room Type</div>
                        <div className="accommodation-item-value">{student.roomId.type}</div>
                      </div>

                      <div className="accommodation-item">
                        <div className="accommodation-item-label">Monthly Rent</div>
                        <div className="accommodation-item-value">₹{student.monthlyRent}</div>
                      </div>
                    </div>
                  </div>

                  <h3 className="section-title">
                    <span>🛏️</span> Room Amenities
                  </h3>

                  <div className="info-grid">
                    <div className="info-item">
                      <div className="info-label">❄️ Air Conditioning</div>
                      <div className="info-value">
                        {student.roomId.type === "AC" ? "✓ Yes" : "✗ No"}
                      </div>
                    </div>

                    <div className="info-item">
                      <div className="info-label">🚿 Attached Bathroom</div>
                      <div className="info-value">
                        {student.roomId.attachedBathroom ? "✓ Yes" : "✗ No"}
                      </div>
                    </div>

                    <div className="info-item">
                      <div className="info-label">🪟 Balcony</div>
                      <div className="info-value">
                        {student.roomId.balcony ? "✓ Yes" : "✗ No"}
                      </div>
                    </div>

                    <div className="info-item">
                      <div className="info-label">📶 WiFi</div>
                      <div className="info-value">✓ Available</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="alert alert-warning">
                  <span>⚠️</span>
                  <span>No room assigned yet. Please contact the hostel administration.</span>
                </div>
              )}
            </div>

            {/* PAYMENTS TAB */}
            <div className={`content-section ${activeTab === "payments" ? "active" : ""}`}>
              <h2 className="section-title">
                <span>💳</span> Payment History
              </h2>

              <div className="payment-table-container">
                <table className="payment-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center" }}>
                          No payments yet
                        </td>
                      </tr>
                    ) : (
                      payments.map((bill) => (
                        <tr key={bill._id}>
                          <td>{new Date(bill.createdAt).toLocaleDateString()}</td>
                          <td>Monthly Rent - {bill.month}</td>
                          <td>₹{bill.amount}</td>
                          <td>
                            <span className="badge badge-payment-paid">{bill.status}</span>
                          </td>
                          <td>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: "6px 12px", fontSize: "0.8rem", width: "auto" }}
                              onClick={() => downloadBill(bill.month)}
                            >
                              Download
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: "30px" }}>
                <h3 className="section-title">
                  <span>📊</span> Payment Summary
                </h3>

                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-label">💰 Total Paid</div>
                    <div className="info-value" style={{ color: "var(--success)" }}>
                      ₹{student.monthlyRent * calculateMonthsStayed(student.joinDate)}
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-label">📅 Payment Due Date</div>
                    <div className="info-value">
                      {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-label">🔒 Security Deposit</div>
                    <div className="info-value">₹{student.Deposit}</div>
                  </div>

                  <div className="info-item">
                    <div className="info-label">⚡ Payment Method</div>
                    <div className="info-value">Online Transfer</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTIVITY TAB */}
            <div className={`content-section ${activeTab === "activity" ? "active" : ""}`}>
              <h2 className="section-title">
                <span>📈</span> Recent Activity
              </h2>

              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-date">{new Date().toLocaleDateString()}</div>
                  <div className="timeline-content">
                    <div className="timeline-title">✓ Monthly Rent Paid</div>
                    <div className="timeline-description">
                      Successfully paid ₹{student.montlyRent} for{" "}
                      {new Date().toLocaleString("default", { month: "long" })}
                    </div>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-date">
                    {new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-title">📝 Profile Updated</div>
                    <div className="timeline-description">
                      Updated emergency contact information
                    </div>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-date">
                    {new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-title">📄 Document Verified</div>
                    <div className="timeline-description">
                      Aadhar card verification completed
                    </div>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-date">
                    {new Date(student.joinDate).toLocaleDateString()}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-title">🎉 Joined Hostel</div>
                    <div className="timeline-description">
                      Welcome to {student.hostelName || "our hostel"}! Assigned to Room{" "}
                      {student.roomId?.roomNumber}, Bed {student.bedNumber}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR CODE MODAL */}
      {showQR && (
        <div className="qr-modal-overlay" onClick={() => setShowQR(false)}>
          <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="qr-modal-title">My QR Code</h3>

            <QRCodeCanvas value={student.qrCodeToken} size={260} level="H" />

            <p className="qr-modal-description">Use this QR for Mess & Gym Attendance</p>

            <button
              className="btn btn-secondary"
              style={{ marginTop: "20px", width: "100%" }}
              onClick={() => setShowQR(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentProfile;