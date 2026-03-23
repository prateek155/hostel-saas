import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/auth";
import { toast, ToastContainer } from "react-toastify";

const AssignRoom = () => {
  const [auth] = useAuth();

  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [type, setType] = useState("AC");
  const [selectedFloor, setSelectedFloor] = useState("all");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [availableFloors, setAvailableFloors] = useState([]);

  const [data, setData] = useState({
    studentId: "",
    roomId: "",
    bedNumber: "",
  });

  /* ================= LOAD UNASSIGNED STUDENTS ================= */
  const loadStudents = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8083/api/v1/student/unassigned",
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      setStudents(res.data.students);
    } catch {
      toast.error("Failed to load students");
    }
  };

  /* ================= LOAD ASSIGNED STUDENTS ================= */
  const loadAssignedStudents = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8083/api/v1/student/assigned-students",
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      setAssignedStudents(res.data.students);
    } catch {
      toast.error("Failed to load assigned students");
    }
  };

  /* ================= LOAD ROOMS ================= */
  const loadRooms = async (roomType) => {
    try {
      const res = await axios.get(
        `http://localhost:8083/api/v1/room/available/${roomType}`,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      setRooms(res.data.rooms);
      
      // Extract unique floors
      const floors = [...new Set(res.data.rooms.map(r => r.floor))].sort((a, b) => a - b);
      setAvailableFloors(floors);
    } catch {
      toast.error("Failed to load rooms");
    }
  };

  useEffect(() => {
    loadStudents();
    loadAssignedStudents();
  }, []);

  useEffect(() => {
    loadRooms(type);
    setSelectedRoom(null);
    setSelectedFloor("all");
    setData({ ...data, roomId: "", bedNumber: "" });
    // eslint-disable-next-line
  }, [type]);

  /* ================= ROOM CHANGE ================= */
  const handleRoomChange = (roomId) => {
    const room = rooms.find((r) => r._id === roomId);
    setSelectedRoom(room);
    setData({ ...data, roomId, bedNumber: "" });
  };

  /* ================= FILTER ROOMS BY FLOOR ================= */
  const getFilteredRooms = () => {
    if (selectedFloor === "all") {
      return rooms;
    }
    return rooms.filter(r => r.floor === parseInt(selectedFloor));
  };

  /* ================= ASSIGN ROOM ================= */
  const assignRoom = async () => {
    if (!data.studentId || !data.roomId || !data.bedNumber) {
      return toast.error("All fields are required");
    }

    try {
      await axios.post(
        "http://localhost:8083/api/v1/room/assign-room",
        data,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );

      toast.success("Room assigned successfully");

      loadStudents();
      loadAssignedStudents();
      loadRooms(type);

      setData({ studentId: "", roomId: "", bedNumber: "" });
      setSelectedRoom(null);
      setSelectedFloor("all");
    } catch (err) {
      toast.error(err.response?.data?.message || "Assignment failed");
    }
  };

  const filteredRooms = getFilteredRooms();

  return (
    <>
      <style>{`
        /* ================= BASE STYLES ================= */
        * {
          box-sizing: border-box;
        }

        /* ================= CONTAINER ================= */
        .assign-room-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
          padding: 24px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
        }

        .assign-room-wrapper {
          max-width: 1600px;
          margin: 0 auto;
        }

        /* ================= HEADER ================= */
        .header-section {
          text-align: center;
          margin-bottom: 40px;
          animation: fadeInDown 0.6s ease-out;
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .page-title {
          font-size: clamp(1.75rem, 4vw, 3rem);
          font-weight: 800;
          margin: 0 0 12px 0;
          background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
        }

        .page-subtitle {
          font-size: clamp(0.95rem, 2vw, 1.15rem);
          color: rgba(255, 255, 255, 0.85);
          margin: 0;
          font-weight: 400;
        }

        /* ================= CARDS ================= */
        .assignment-card {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: clamp(20px, 4vw, 40px);
          margin-bottom: 32px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 
                      0 0 0 1px rgba(255, 255, 255, 0.1);
          animation: fadeInUp 0.6s ease-out 0.1s both;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .card-title {
          font-size: clamp(1.25rem, 3vw, 1.75rem);
          color: #1a202c;
          margin: 0 0 28px 0;
          padding-bottom: 16px;
          border-bottom: 3px solid #e2e8f0;
          font-weight: 700;
          position: relative;
        }

        .card-title::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          width: 80px;
          height: 3px;
          background: linear-gradient(90deg, #2c5364 0%, #203a43 100%);
          border-radius: 2px;
        }

        /* ================= FORM ================= */
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
          gap: clamp(16px, 3vw, 24px);
          margin-bottom: 28px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          animation: fadeIn 0.4s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-label {
          font-size: clamp(0.9rem, 2vw, 1rem);
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: 0.3px;
        }

        .label-icon {
          font-size: 1.25rem;
          filter: grayscale(0.2);
        }

        .form-select {
          padding: 14px 16px;
          font-size: clamp(0.9rem, 2vw, 1rem);
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          background-color: #ffffff;
          color: #2d3748;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%232d3748' d='M6 8L0 0h12z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          padding-right: 40px;
          font-family: inherit;
        }

        .form-select:focus {
          outline: none;
          border-color: #2c5364;
          box-shadow: 0 0 0 4px rgba(44, 83, 100, 0.1),
                      0 4px 12px rgba(44, 83, 100, 0.15);
          transform: translateY(-1px);
        }

        .form-select:hover:not(:focus) {
          border-color: #cbd5e0;
          background-color: #f7fafc;
        }

        .form-select option {
          padding: 12px;
        }

        .form-select option:disabled {
          color: #a0aec0;
        }

        /* ================= BUTTON ================= */
        .btn-assign {
          width: 100%;
          padding: clamp(14px, 3vw, 18px);
          font-size: clamp(1rem, 2.5vw, 1.15rem);
          font-weight: 700;
          color: white;
          background: linear-gradient(135deg, #2c5364 0%, #203a43 50%, #0f2027 100%);
          background-size: 200% 100%;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 24px rgba(44, 83, 100, 0.35),
                      0 2px 8px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
          font-family: inherit;
          letter-spacing: 0.5px;
        }

        .btn-assign::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .btn-assign:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(44, 83, 100, 0.45),
                      0 4px 12px rgba(0, 0, 0, 0.15);
          background-position: 100% 0;
        }

        .btn-assign:hover::before {
          left: 100%;
        }

        .btn-assign:active {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(44, 83, 100, 0.35);
        }

        .btn-icon {
          font-size: 1.4rem;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        /* ================= ASSIGNED SECTION ================= */
        .assigned-section {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: clamp(20px, 4vw, 40px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3),
                      0 0 0 1px rgba(255, 255, 255, 0.1);
          animation: fadeInUp 0.6s ease-out 0.2s both;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
          padding-bottom: 16px;
          border-bottom: 3px solid #e2e8f0;
          flex-wrap: wrap;
          gap: 16px;
          position: relative;
        }

        .section-header::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          width: 100px;
          height: 3px;
          background: linear-gradient(90deg, #2c5364 0%, #203a43 100%);
          border-radius: 2px;
        }

        .section-title {
          font-size: clamp(1.25rem, 3vw, 1.75rem);
          color: #1a202c;
          margin: 0;
          font-weight: 700;
        }

        .badge-count {
          background: linear-gradient(135deg, #2c5364 0%, #203a43 100%);
          color: white;
          padding: 10px 20px;
          border-radius: 50px;
          font-size: clamp(0.85rem, 2vw, 0.95rem);
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(44, 83, 100, 0.3);
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        /* ================= TABLE ================= */
        .table-wrapper {
          overflow-x: auto;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          -webkit-overflow-scrolling: touch;
        }

        .table-wrapper::-webkit-scrollbar {
          height: 8px;
        }

        .table-wrapper::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 8px;
        }

        .table-wrapper::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 8px;
        }

        .table-wrapper::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }

        .students-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background: white;
          min-width: 800px;
        }

        .students-table thead {
          background: linear-gradient(135deg, #2c5364 0%, #203a43 100%);
          color: white;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .students-table th {
          padding: clamp(14px, 3vw, 18px);
          text-align: left;
          font-weight: 700;
          font-size: 0.85rem;
          white-space: nowrap;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .students-table th:first-child {
          border-top-left-radius: 16px;
        }

        .students-table th:last-child {
          border-top-right-radius: 16px;
        }

        .students-table td {
          padding: clamp(12px, 2.5vw, 16px);
          border-bottom: 1px solid #e2e8f0;
          color: #4a5568;
          font-size: clamp(0.85rem, 2vw, 0.95rem);
          vertical-align: middle;
        }

        .students-table tbody tr {
          transition: all 0.2s ease;
        }

        .students-table tbody tr:hover {
          background: linear-gradient(90deg, #f7fafc 0%, #edf2f7 100%);
          transform: scale(1.01);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .students-table tbody tr:last-child td {
          border-bottom: none;
        }

        .students-table tbody tr:last-child td:first-child {
          border-bottom-left-radius: 16px;
        }

        .students-table tbody tr:last-child td:last-child {
          border-bottom-right-radius: 16px;
        }

        .student-name {
          font-weight: 700;
          color: #1a202c;
        }

        .room-number {
          font-weight: 700;
          color: #2c5364;
          font-size: 1.05em;
        }

        .price {
          font-weight: 800;
          color: #10b981;
          font-size: 1.05em;
        }

        /* ================= TYPE BADGE ================= */
        .type-badge {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 50px;
          font-size: clamp(0.75rem, 1.8vw, 0.85rem);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          white-space: nowrap;
        }

        .type-badge.ac {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .type-badge.non-ac {
          background: linear-gradient(135deg, #64748b 0%, #475569 100%);
          color: white;
        }

        /* ================= NO DATA ================= */
        .no-data {
          text-align: center;
          padding: clamp(40px, 8vw, 80px) 20px !important;
          background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
        }

        .no-data-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          animation: fadeIn 0.6s ease-out;
        }

        .no-data-icon {
          font-size: clamp(2.5rem, 6vw, 4rem);
          opacity: 0.4;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .no-data-content p {
          margin: 0;
          font-size: clamp(1rem, 2.5vw, 1.2rem);
          color: #718096;
          font-weight: 500;
        }

        /* ================= RESPONSIVE ================= */
        @media (max-width: 1024px) {
          .assign-room-container {
            padding: 20px;
          }

          .header-section {
            margin-bottom: 32px;
          }

          .assignment-card,
          .assigned-section {
            border-radius: 20px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .assign-room-container {
            padding: 16px;
          }

          .header-section {
            margin-bottom: 28px;
          }

          .assignment-card,
          .assigned-section {
            border-radius: 18px;
            margin-bottom: 24px;
          }

          .card-title::after,
          .section-header::after {
            width: 60px;
          }

          .section-header {
            flex-direction: row;
            justify-content: space-between;
          }

          .badge-count {
            padding: 8px 16px;
          }

          .students-table {
            min-width: 700px;
          }
        }

        @media (max-width: 600px) {
          .assign-room-container {
            padding: 12px;
          }

          .header-section {
            margin-bottom: 24px;
          }

          .assignment-card,
          .assigned-section {
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 20px;
          }

          .form-grid {
            gap: 16px;
          }

          .form-label {
            margin-bottom: 8px;
          }

          .form-select {
            padding: 12px 14px;
            padding-right: 36px;
          }

          .btn-assign {
            padding: 14px;
          }

          .section-header {
            gap: 12px;
          }

          .badge-count {
            padding: 6px 14px;
          }

          .students-table th,
          .students-table td {
            padding: 12px 10px;
          }

          .type-badge {
            padding: 5px 12px;
          }

          .table-wrapper {
            margin: 0 -20px;
            border-radius: 0;
            padding: 0 20px;
          }
        }

        @media (max-width: 480px) {
          .assign-room-container {
            padding: 10px;
          }

          .assignment-card,
          .assigned-section {
            padding: 16px;
            border-radius: 14px;
          }

          .card-title,
          .section-title {
            margin-bottom: 20px;
            padding-bottom: 12px;
          }

          .card-title::after,
          .section-header::after {
            width: 50px;
            height: 2px;
          }

          .form-grid {
            gap: 14px;
            margin-bottom: 20px;
          }

          .form-label {
            font-size: 0.9rem;
            gap: 6px;
          }

          .label-icon {
            font-size: 1.1rem;
          }

          .form-select {
            padding: 11px 12px;
            padding-right: 34px;
            font-size: 0.9rem;
          }

          .btn-assign {
            padding: 12px;
            gap: 8px;
          }

          .btn-icon {
            font-size: 1.2rem;
          }

          .section-header {
            margin-bottom: 20px;
            padding-bottom: 12px;
            gap: 10px;
          }

          .badge-count {
            padding: 6px 12px;
            font-size: 0.8rem;
          }

          .students-table {
            min-width: 650px;
          }

          .students-table th,
          .students-table td {
            padding: 10px 8px;
            font-size: 0.8rem;
          }

          .students-table th {
            font-size: 0.75rem;
          }

          .type-badge {
            padding: 4px 10px;
            font-size: 0.7rem;
            letter-spacing: 0.5px;
          }

          .table-wrapper {
            margin: 0 -16px;
            padding: 0 16px;
          }

          .no-data {
            padding: 40px 16px !important;
          }
        }

        @media (max-width: 360px) {
          .assignment-card,
          .assigned-section {
            padding: 14px;
          }

          .form-select {
            padding: 10px;
            padding-right: 32px;
          }

          .students-table {
            min-width: 600px;
          }

          .students-table th,
          .students-table td {
            padding: 8px 6px;
          }
        }

        @media (min-width: 1400px) {
          .form-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .form-group.full-width {
            grid-column: span 3;
          }

          .students-table {
            min-width: 100%;
          }
        }

        @media (min-width: 1920px) {
          .assign-room-wrapper {
            max-width: 1800px;
          }

          .assignment-card,
          .assigned-section {
            padding: 48px;
          }

          .form-grid {
            gap: 28px;
          }
        }
      `}</style>

      <div className="assign-room-container">
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        <div className="assign-room-wrapper">
          <div className="header-section">
            <h2 className="page-title">Assign Room to Student</h2>
            <p className="page-subtitle">Select student and assign available room</p>
          </div>

          <div className="assignment-card">
            <h3 className="card-title">Room Assignment</h3>
            
            <div className="form-grid">
              {/* STUDENT */}
              <div className="form-group full-width">
                <label className="form-label">
                  <span className="label-icon">👤</span>
                  Select Student
                </label>
                <select
                  className="form-select"
                  value={data.studentId}
                  onChange={(e) => setData({ ...data, studentId: e.target.value })}
                >
                  <option value="">Choose a student...</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* ROOM TYPE */}
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🌡️</span>
                  Room Type
                </label>
                <select
                  className="form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="AC">AC</option>
                  <option value="Non-AC">Non-AC</option>
                </select>
              </div>

              {/* FLOOR */}
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🏢</span>
                  Floor
                </label>
                <select
                  className="form-select"
                  value={selectedFloor}
                  onChange={(e) => setSelectedFloor(e.target.value)}
                >
                  <option value="all">All Floors</option>
                  {availableFloors.map((floor) => (
                    <option key={floor} value={floor}>
                      Floor {floor}
                    </option>
                  ))}
                </select>
              </div>

              {/* ROOM */}
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🚪</span>
                  Room
                </label>
                <select
                  className="form-select"
                  value={data.roomId}
                  onChange={(e) => handleRoomChange(e.target.value)}
                >
                  <option value="">Choose a room...</option>
                  {filteredRooms.map((r) => (
                    <option key={r._id} value={r._id}>
                      Room {r.roomNumber} (Floor {r.floor})
                    </option>
                  ))}
                </select>
              </div>

              {/* BED */}
              {selectedRoom && (
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">🛏️</span>
                    Bed
                  </label>
                  <select
                    className="form-select"
                    value={data.bedNumber}
                    onChange={(e) =>
                      setData({ ...data, bedNumber: e.target.value })
                    }
                  >
                    <option value="">Choose a bed...</option>
                    {selectedRoom.beds.map((bed) => (
                      <option
                        key={bed.label}
                        value={bed.label}
                        disabled={bed.isOccupied}
                      >
                        Bed {bed.label} {bed.isOccupied ? "(Occupied)" : "(Available)"}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button className="btn-assign" onClick={assignRoom}>
              <span className="btn-icon">✓</span>
              Assign Room
            </button>
          </div>

          {/* ================= ASSIGNED STUDENTS ================= */}
          <div className="assigned-section">
            <div className="section-header">
              <h3 className="section-title">Assigned Students</h3>
              <span className="badge-count">{assignedStudents.length} Students</span>
            </div>

            <div className="table-wrapper">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Room</th>
                    <th>Bed</th>
                    <th>Type</th>
                    <th>Monthly Price</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedStudents.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="no-data">
                        <div className="no-data-content">
                          <span className="no-data-icon">📋</span>
                          <p>No assigned students yet</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    assignedStudents.map((s, i) => (
                      <tr key={s._id}>
                        <td>{i + 1}</td>
                        <td className="student-name">{s.name}</td>
                        <td>{s.phone}</td>
                        <td className="room-number">{s.roomId?.roomNumber}</td>
                        <td>{s.bedNumber}</td>
                        <td>
                          <span className={`type-badge ${s.roomId?.type === "AC" ? "ac" : "non-ac"}`}>
                            {s.roomId?.type}
                          </span>
                        </td>
                        <td className="price">₹ {s.monthlyRent}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssignRoom;