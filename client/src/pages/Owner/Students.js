import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/auth";
import { toast, ToastContainer } from "react-toastify";

const Students = () => {
  const [auth] = useAuth();
  const [students, setStudents] = useState([]);
  const [editStudent, setEditStudent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    gardianemail: "",
    gardianName: "",
    gardianphone: "",
    gardianAddress: "",
    joinDate: "",
    leaveDate: "",
    monthlyRent: "",
    Deposit: "",
    studentStatus: "active",
    phone: "",
  });

  const fetchStudents = async () => {
    try {
      const { data } = await axios.get(
        "https://hostelwers.onrender.com/api/v1/student/my-students",
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      if (data.success) setStudents(data.students);
    } catch {
      toast.error("Failed to load students");
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "https://hostelwers.onrender.com/api/v1/student/add-student",
        form,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      if (data.success) {
        toast.success("Student added successfully");
        setForm({ name: "", email: "", gardianemail: "", gardianName: "", gardianphone: "", gardianAddress: "", joinDate: "", leaveDate: "", monthlyRent: "", Deposit: "", studentStatus: "active", phone: "" });
        fetchStudents();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add student");
    }
  };

  const handleUpdateStudent = async () => {
    try {
      const { data } = await axios.put(
        `https://hostelwers.onrender.com/api/v1/student/update-student/${editStudent._id}`,
        { name: editStudent.name, phone: editStudent.phone, gardianemail: editStudent.gardianemail, gardianphone: editStudent.gardianphone, leaveDate: editStudent.leaveDate, studentStatus: editStudent.studentStatus },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      if (data.success) {
        toast.success("Student updated");
        setShowEditModal(false);
        fetchStudents();
      }
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await axios.delete(
        `https://hostelwers.onrender.com/api/v1/student/delete-student/${id}`,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      toast.success("Student deleted");
      fetchStudents();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .sm-root {
          min-height: 100vh;
          width: 100%;
          background: #0f1117;
          font-family: 'DM Sans', sans-serif;
          padding: 40px 32px;
          color: #e2e8f0;
        }

        /* ── HEADER ── */
        .sm-header {
          margin-bottom: 36px;
          border-left: 3px solid #f59e0b;
          padding-left: 18px;
        }
        .sm-header h2 {
          font-family: 'Playfair Display', serif;
          font-size: 34px;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 6px;
          letter-spacing: -0.5px;
          line-height: 1.2;
        }
        .sm-header p {
          font-size: 14px;
          color: #64748b;
          font-weight: 300;
        }

        /* ── CARDS ── */
        .sm-card {
          background: #161b27;
          border: 1px solid #1e2738;
          border-radius: 16px;
          padding: 32px;
          margin-bottom: 28px;
          width: 100%;
          position: relative;
          overflow: hidden;
        }
        .sm-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
        }
        .sm-card.form-card::before { background: linear-gradient(90deg, #f59e0b, #ef4444, #8b5cf6); }
        .sm-card.table-card::before { background: linear-gradient(90deg, #8b5cf6, #3b82f6, #06b6d4); }

        .sm-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 600;
          color: #f1f5f9;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .sm-card-title .dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .form-card .dot { background: #f59e0b; }
        .table-card .dot { background: #8b5cf6; }

        /* ── FORM GRID ── */
        .sm-form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 18px;
          margin-bottom: 24px;
        }
        .sm-input-group { display: flex; flex-direction: column; }
        .sm-label {
          font-size: 10px;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 7px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .sm-input {
          padding: 11px 14px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          background: #0f1117;
          border: 1px solid #1e2738;
          border-radius: 8px;
          color: #e2e8f0;
          outline: none;
          width: 100%;
          transition: border-color 0.2s, box-shadow 0.2s;
          -webkit-appearance: none;
          appearance: none;
        }
        .sm-input:focus {
          border-color: #f59e0b;
          box-shadow: 0 0 0 3px rgba(245,158,11,0.12);
        }
        .sm-input::placeholder { color: #334155; }
        .sm-input option { background: #161b27; color: #e2e8f0; }

        .sm-submit-btn {
          background: linear-gradient(135deg, #f59e0b, #f97316);
          color: #0f1117;
          padding: 12px 28px;
          font-size: 13px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          transition: opacity 0.2s, transform 0.1s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          justify-content: center;
        }
        .sm-submit-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .sm-submit-btn:active { transform: translateY(0); }

        /* ── TABLE TOPROW ── */
        .sm-table-toprow {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .sm-badge {
          background: rgba(139,92,246,0.15);
          color: #a78bfa;
          padding: 5px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid rgba(139,92,246,0.25);
          white-space: nowrap;
        }

        /* ── DESKTOP TABLE ── */
        .sm-table-wrapper { overflow-x: auto; }
        .sm-table { width: 100%; border-collapse: collapse; min-width: 580px; }
        .sm-table thead tr { border-bottom: 1px solid #1e2738; }
        .sm-th {
          text-align: left; padding: 10px 14px;
          font-size: 10px; font-weight: 600;
          color: #475569; text-transform: uppercase;
          letter-spacing: 1px; white-space: nowrap;
        }
        .sm-td {
          padding: 14px; font-size: 13px;
          color: #94a3b8; border-bottom: 1px solid #1a2035;
        }
        .sm-table tbody tr:last-child .sm-td { border-bottom: none; }
        .sm-table tbody tr:hover .sm-td { background: rgba(255,255,255,0.02); }

        /* ── MOBILE STUDENT CARDS ── */
        .sm-student-cards { display: none; }
        .sm-student-card {
          background: #0f1117;
          border: 1px solid #1e2738;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
        }
        .sm-student-card:last-child { margin-bottom: 0; }
        .sm-sc-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 14px;
          gap: 10px;
        }
        .sm-sc-identity { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
        .sm-sc-name { font-weight: 600; color: #f1f5f9; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sm-sc-email { font-size: 12px; color: #64748b; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sm-sc-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 14px;
        }
        .sm-sc-field-label { font-size: 10px; color: #475569; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 3px; }
        .sm-sc-field-value { font-size: 13px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sm-sc-actions { display: flex; gap: 8px; }

        /* ── SHARED COMPONENTS ── */
        .sm-avatar {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #f59e0b, #f97316);
          color: #0f1117;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 700; flex-shrink: 0;
        }
        .sm-name-cell { display: flex; align-items: center; gap: 10px; }
        .sm-name-text { font-weight: 500; color: #e2e8f0; font-size: 14px; }

        .sm-status-active, .sm-status-inactive {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 6px;
          font-size: 11px; font-weight: 600;
          text-transform: capitalize; white-space: nowrap;
        }
        .sm-status-active { background: rgba(16,185,129,0.1); color: #34d399; border: 1px solid rgba(16,185,129,0.2); }
        .sm-status-inactive { background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.2); }
        .sm-status-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex-shrink: 0; }

        .sm-edit-btn {
          background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2);
          color: #60a5fa; padding: 6px 12px; border-radius: 6px; cursor: pointer;
          font-size: 12px; font-family: 'DM Sans', sans-serif; white-space: nowrap;
          transition: background 0.2s;
        }
        .sm-edit-btn:hover { background: rgba(59,130,246,0.2); }
        .sm-delete-btn {
          background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2);
          color: #f87171; padding: 6px 12px; border-radius: 6px; cursor: pointer;
          font-size: 12px; font-family: 'DM Sans', sans-serif; white-space: nowrap;
          transition: background 0.2s;
        }
        .sm-delete-btn:hover { background: rgba(239,68,68,0.2); }

        .sm-empty { padding: 60px 20px; text-align: center; }
        .sm-empty-icon { font-size: 48px; margin-bottom: 14px; }
        .sm-empty-text { font-size: 17px; font-weight: 500; color: #475569; margin-bottom: 6px; }
        .sm-empty-sub { font-size: 13px; color: #334155; }

        /* ── MODAL ── */
        .sm-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(4px);
          display: flex; justify-content: center; align-items: center;
          z-index: 1000; padding: 16px;
        }
        .sm-modal {
          background: #161b27; border: 1px solid #1e2738;
          border-radius: 16px; padding: 28px;
          width: 100%; max-width: 440px; max-height: 90vh; overflow-y: auto;
          box-shadow: 0 25px 60px rgba(0,0,0,0.5); position: relative;
        }
        .sm-modal::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #f59e0b, #ef4444);
          border-radius: 16px 16px 0 0;
        }
        .sm-modal-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 600; color: #f1f5f9; margin-bottom: 20px;
        }
        .sm-modal-input {
          width: 100%; padding: 11px 14px; font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          background: #0f1117; border: 1px solid #1e2738;
          border-radius: 8px; color: #e2e8f0; outline: none; margin-bottom: 12px;
          transition: border-color 0.2s, box-shadow 0.2s;
          -webkit-appearance: none; appearance: none;
        }
        .sm-modal-input:focus { border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,0.12); }
        .sm-modal-input::placeholder { color: #334155; }
        .sm-modal-input option { background: #161b27; }
        .sm-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px; }
        .sm-update-btn {
          background: linear-gradient(135deg, #f59e0b, #f97316);
          color: #0f1117; padding: 10px 22px; font-size: 13px; font-weight: 700;
          font-family: 'DM Sans', sans-serif; border: none; border-radius: 8px;
          cursor: pointer; text-transform: uppercase; letter-spacing: 0.4px; flex: 1;
          transition: opacity 0.2s;
        }
        .sm-update-btn:hover { opacity: 0.9; }
        .sm-cancel-btn {
          background: transparent; color: #64748b; padding: 10px 22px;
          font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif;
          border: 1px solid #1e2738; border-radius: 8px; cursor: pointer; flex: 1;
          transition: border-color 0.2s, color 0.2s;
        }
        .sm-cancel-btn:hover { border-color: #334155; color: #94a3b8; }

        /* ══════════════════════════════════════
           RESPONSIVE BREAKPOINTS
        ══════════════════════════════════════ */

        /* Tablet */
        @media (max-width: 768px) {
          .sm-root { padding: 28px 18px; }
          .sm-header h2 { font-size: 26px; }
          .sm-card { padding: 24px 18px; }
          .sm-form-grid { grid-template-columns: 1fr 1fr; gap: 14px; }

          /* Replace table with card list on mobile */
          .sm-table-wrapper { display: none; }
          .sm-student-cards { display: block; }
        }

        /* Mobile */
        @media (max-width: 480px) {
          .sm-root { padding: 18px 12px; }
          .sm-header { margin-bottom: 24px; }
          .sm-header h2 { font-size: 22px; }
          .sm-header p { font-size: 12px; }
          .sm-card { padding: 18px 14px; border-radius: 12px; margin-bottom: 18px; }
          .sm-card-title { font-size: 16px; margin-bottom: 16px; }

          /* Single column form */
          .sm-form-grid { grid-template-columns: 1fr; gap: 12px; margin-bottom: 18px; }
          .sm-submit-btn { padding: 13px; font-size: 13px; }

          /* Student card tweaks */
          .sm-sc-info { grid-template-columns: 1fr; gap: 8px; }
          .sm-sc-actions .sm-edit-btn,
          .sm-sc-actions .sm-delete-btn { flex: 1; text-align: center; padding: 9px 8px; font-size: 13px; }

          /* Modal as bottom sheet */
          .sm-overlay { align-items: flex-end; padding: 0; }
          .sm-modal {
            border-radius: 20px 20px 0 0;
            max-width: 100%; max-height: 88vh;
            padding: 24px 16px 32px;
          }
          .sm-modal-actions { flex-direction: column-reverse; gap: 8px; }
        }
      `}</style>

      <div className="sm-root">
        <ToastContainer position="top-left" autoClose={3000} theme="dark" />

        {/* HEADER */}
        <div className="sm-header">
          <h2>Student Management</h2>
          <p>Add and manage your students efficiently</p>
        </div>

        {/* ADD STUDENT FORM */}
        <div className="sm-card form-card">
          <h3 className="sm-card-title"><span className="dot"></span>Add New Student</h3>
          <form onSubmit={handleSubmit}>
            <div className="sm-form-grid">
              <div className="sm-input-group">
                <label className="sm-label">Full Name</label>
                <input type="text" placeholder="Enter student name" className="sm-input"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="sm-input-group">
                <label className="sm-label">Guardian Name</label>
                <input type="text" placeholder="Enter guardian name" className="sm-input"
                  value={form.gardianName} onChange={(e) => setForm({ ...form, gardianName: e.target.value })} required />
              </div>
              <div className="sm-input-group">
                <label className="sm-label">Student Email</label>
                <input type="email" placeholder="Enter email address" className="sm-input"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="sm-input-group">
                <label className="sm-label">Phone Number</label>
                <input type="tel" placeholder="Enter phone number" className="sm-input"
                  value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              </div>
              <div className="sm-input-group">
                <label className="sm-label">Guardian Phone</label>
                <input type="tel" placeholder="Enter guardian phone" className="sm-input"
                  value={form.gardianphone} onChange={(e) => setForm({ ...form, gardianphone: e.target.value })} required />
              </div>
              <div className="sm-input-group">
                <label className="sm-label">Guardian Email</label>
                <input type="email" placeholder="Enter guardian email" className="sm-input"
                  value={form.gardianemail} onChange={(e) => setForm({ ...form, gardianemail: e.target.value })} required />
              </div>
              <div className="sm-input-group">
                <label className="sm-label">Join Date</label>
                <input type="date" className="sm-input"
                  value={form.joinDate} onChange={(e) => setForm({ ...form, joinDate: e.target.value })} required />
              </div>
              <div className="sm-input-group">
                <label className="sm-label">Leave Date (Optional)</label>
                <input type="date" className="sm-input"
                  value={form.leaveDate} onChange={(e) => setForm({ ...form, leaveDate: e.target.value })} />
              </div>
              <div className="sm-input-group">
                <label className="sm-label">Monthly Rent</label>
                <input type="number" placeholder="Enter monthly rent" className="sm-input"
                  value={form.monthlyRent} onChange={(e) => setForm({ ...form, monthlyRent: e.target.value })} required />
              </div>
              <div className="sm-input-group">
                <label className="sm-label">Deposit Amount</label>
                <input type="number" placeholder="Enter deposit amount" className="sm-input"
                  value={form.Deposit} onChange={(e) => setForm({ ...form, Deposit: e.target.value })} required />
              </div>
              <div className="sm-input-group">
                <label className="sm-label">Student Status</label>
                <select className="sm-input" value={form.studentStatus}
                  onChange={(e) => setForm({ ...form, studentStatus: e.target.value })} required>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="leave">Leave</option>
                </select>
              </div>
            </div>
            <button type="submit" className="sm-submit-btn">
              <span>＋</span> Add Student
            </button>
          </form>
        </div>

        {/* STUDENT LIST */}
        <div className="sm-card table-card">
          <div className="sm-table-toprow">
            <h3 className="sm-card-title" style={{ marginBottom: 0 }}>
              <span className="dot"></span>Students List
            </h3>
            <div className="sm-badge">{students.length} Total</div>
          </div>

          {/* DESKTOP: Table */}
          <div className="sm-table-wrapper">
            <table className="sm-table">
              <thead>
                <tr>
                  <th className="sm-th">Name</th>
                  <th className="sm-th">Student Email</th>
                  <th className="sm-th">Guardian Email</th>
                  <th className="sm-th">Phone</th>
                  <th className="sm-th">Status</th>
                  <th className="sm-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="sm-td">
                      <div className="sm-empty">
                        <div className="sm-empty-icon">📚</div>
                        <p className="sm-empty-text">No students found</p>
                        <p className="sm-empty-sub">Add your first student to get started</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  students.map((s) => (
                    <tr key={s._id}>
                      <td className="sm-td">
                        <div className="sm-name-cell">
                          <div className="sm-avatar">{s.name.charAt(0).toUpperCase()}</div>
                          <span className="sm-name-text">{s.name}</span>
                        </div>
                      </td>
                      <td className="sm-td">{s.email}</td>
                      <td className="sm-td">{s.gardianemail}</td>
                      <td className="sm-td">{s.phone}</td>
                      <td className="sm-td">
                        <span className={s.studentStatus === "active" ? "sm-status-active" : "sm-status-inactive"}>
                          <span className="sm-status-dot"></span>{s.studentStatus}
                        </span>
                      </td>
                      <td className="sm-td">
                        <button className="sm-edit-btn" style={{ marginRight: "8px" }}
                          onClick={() => { setEditStudent(s); setShowEditModal(true); }}>✏️ Edit</button>
                        <button className="sm-delete-btn" onClick={() => handleDeleteStudent(s._id)}>🗑 Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE: Card list */}
          <div className="sm-student-cards">
            {students.length === 0 ? (
              <div className="sm-empty">
                <div className="sm-empty-icon">📚</div>
                <p className="sm-empty-text">No students found</p>
                <p className="sm-empty-sub">Add your first student to get started</p>
              </div>
            ) : (
              students.map((s) => (
                <div className="sm-student-card" key={s._id}>
                  <div className="sm-sc-top">
                    <div className="sm-sc-identity">
                      <div className="sm-avatar">{s.name.charAt(0).toUpperCase()}</div>
                      <div style={{ minWidth: 0 }}>
                        <div className="sm-sc-name">{s.name}</div>
                        <div className="sm-sc-email">{s.email}</div>
                      </div>
                    </div>
                    <span className={s.studentStatus === "active" ? "sm-status-active" : "sm-status-inactive"}>
                      <span className="sm-status-dot"></span>{s.studentStatus}
                    </span>
                  </div>
                  <div className="sm-sc-info">
                    <div className="sm-sc-field">
                      <div className="sm-sc-field-label">Phone</div>
                      <div className="sm-sc-field-value">{s.phone}</div>
                    </div>
                    <div className="sm-sc-field">
                      <div className="sm-sc-field-label">Guardian Email</div>
                      <div className="sm-sc-field-value">{s.gardianemail}</div>
                    </div>
                  </div>
                  <div className="sm-sc-actions">
                    <button className="sm-edit-btn"
                      onClick={() => { setEditStudent(s); setShowEditModal(true); }}>✏️ Edit</button>
                    <button className="sm-delete-btn"
                      onClick={() => handleDeleteStudent(s._id)}>🗑 Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* EDIT MODAL */}
        {showEditModal && editStudent && (
          <div className="sm-overlay">
            <div className="sm-modal">
              <h3 className="sm-modal-title">Edit Student</h3>
              <input className="sm-modal-input" value={editStudent.name} placeholder="Student Name"
                onChange={(e) => setEditStudent({ ...editStudent, name: e.target.value })} />
              <input className="sm-modal-input" value={editStudent.phone} placeholder="Phone"
                onChange={(e) => setEditStudent({ ...editStudent, phone: e.target.value })} />
              <input className="sm-modal-input" value={editStudent.gardianemail} placeholder="Guardian Email"
                onChange={(e) => setEditStudent({ ...editStudent, gardianemail: e.target.value })} />
              <input className="sm-modal-input" value={editStudent.gardianphone} placeholder="Guardian Phone"
                onChange={(e) => setEditStudent({ ...editStudent, gardianphone: e.target.value })} />
              <select className="sm-modal-input" value={editStudent.studentStatus}
                onChange={(e) => setEditStudent({ ...editStudent, studentStatus: e.target.value })}>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="leave">Leave</option>
              </select>
              <div className="sm-modal-actions">
                <button className="sm-cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button className="sm-update-btn" onClick={handleUpdateStudent}>Update</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Students;