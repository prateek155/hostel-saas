import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/auth";
import { toast, ToastContainer } from "react-toastify";

const Attendance = () => {
  const [auth] = useAuth();

  /* ================= MODE ================= */
  const [viewMode, setViewMode] = useState("MARK"); // MARK | CHECK

  /* ================= COMMON ================= */
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  /* ================= MARK ATTENDANCE ================= */
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [locked, setLocked] = useState(false);

  /* ================= CHECK ATTENDANCE ================= */
  const [allAttendance, setAllAttendance] = useState([]);
  const [dailyAttendance, setDailyAttendance] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [monthlyAttendance, setMonthlyAttendance] = useState([]);
  const [percentage, setPercentage] = useState(0);

  /* ================= NEW: SEARCH & FILTER ================= */
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reportMonth, setReportMonth] = useState("");
const [reportYear, setReportYear] = useState("");

const monthList = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const yearList = Array.from({ length: 10 }, (_, i) => 2024 + i);
const selectedMonthValue =
  reportYear && reportMonth
    ? `${reportYear}-${reportMonth}`
    : "";


  /* =====================================================
     LOAD STUDENTS (FOR MARKING)
  ===================================================== */
  const loadStudents = async () => {
    try {
      const { data } = await axios.get(
        "https://hostelwers.onrender.com/api/v1/student/assigned-students",
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );

      setStudents(data.students || []);
      setRecords(
        (data.students || []).map((s) => ({
          studentId: s._id,
          hostelId: s.hostelId,
          status: "null",
        }))
      );
    } catch (err) {
      console.error("Error loading students:", err);
      toast.error("Failed to load students");
    }
  };

  /* =====================================================
     LOAD ATTENDANCE BY DATE
  ===================================================== */
  const loadAttendanceByDate = async () => {
    try {
      const { data } = await axios.get(
        `https://hostelwers.onrender.com/api/v1/attandance/by-date?date=${selectedDate}`,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );

      setDailyAttendance(data.attendance || []);

      if (data.attendance?.length) {
        setLocked(data.attendance[0].locked);
      } else {
        setLocked(false);
      }
    } catch (err) {
      console.error("Error loading attendance:", err);
    }
  };

  useEffect(() => {
    loadStudents();
    loadAttendanceByDate();
  }, [selectedDate]);

const loadAttendanceByFilters = async () => {
  try {
    let url = "";

    if (selectedMonthValue && !fromDate && !toDate) {
      url = `https://hostelwers.onrender.com/api/v1/attandance/by-month?month=${selectedMonthValue}`;
    } else if (fromDate && toDate) {
      url = `https://hostelwers.onrender.com/api/v1/attandance/by-range?from=${fromDate}&to=${toDate}`;
    } else {
      return;
    }

    const { data } = await axios.get(url, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });

    setAllAttendance(data.attendance || []);
  } catch (err) {
    toast.error("Failed to load attendance");
  }
};


useEffect(() => {
  if (viewMode === "CHECK") {
    loadAttendanceByFilters();
  }
}, [viewMode, selectedMonthValue, fromDate, toDate]);

useEffect(() => {
  if (selectedMonthValue) {
    setFromDate("");
    setToDate("");
  }
}, [selectedMonthValue]);

useEffect(() => {
  if (fromDate || toDate) {
    setReportMonth("");
    setReportYear("");
  }
}, [fromDate, toDate]);


  /* =====================================================
     TOGGLE STATUS (CLICK ON BUTTON)
  ===================================================== */
  const toggleStatus = async (student, index, newStatus) => {
    if (locked) return;

    setRecords((prev) =>
      prev.map((r, i) =>
        i === index ? { ...r, status: newStatus } : r
      )
    );

    try {
      await axios.post(
        "https://hostelwers.onrender.com/api/v1/attandance/mark",
        {
          studentId: student._id,
          hostelId: student.hostelId,
          status: newStatus,
          date: selectedDate,
        },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
    } catch (err) {
      toast.error("Auto save failed");
    }
  };

  /* =====================================================
     LOCK ATTENDANCE
  ===================================================== */
  const lockAttendance = async () => {
    try {
      await axios.post(
        "https://hostelwers.onrender.com/api/v1/attandance/lock",
        { date: selectedDate },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      toast.success("Attendance locked successfully!");
      setLocked(true);
    } catch (err) {
      toast.error("Failed to lock attendance");
    }
  };

  /* =====================================================
     OPEN STUDENT (MONTHLY)
  ===================================================== */
const openStudent = async (row) => {
  if (!row?.studentId?._id) return;

  setSelectedStudent(row.studentId);

  try {
    let baseUrl = `https://hostelwers.onrender.com/api/v1/attandance/student/${row.studentId._id}`;
    let url = baseUrl;

    // ✅ PRIORITY 1: Date Range
    if (fromDate && toDate) {
      url = `${baseUrl}?from=${fromDate}&to=${toDate}`;
    }

    // ✅ PRIORITY 2: Month
    else if (selectedMonthValue) {
      url = `${baseUrl}?month=${selectedMonthValue}`;
    }

    const { data } = await axios.get(url, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });

    setMonthlyAttendance(data.attendance || []);

    const total = data.attendance?.length || 0;
    const present = (data.attendance || []).filter(
      (r) => r.status === "present"
    ).length;

    const percent =
      total === 0 ? 0 : ((present / total) * 100).toFixed(2);

    setPercentage(percent);

  } catch (err) {
    toast.error("Failed to load student attendance");
  }
};


  /* =====================================================
     DOWNLOAD CSV
  ===================================================== */
const downloadPDF = async () => {
  if (!selectedStudent) return;

  try {
    let url = `https://hostelwers.onrender.com/api/v1/attandance/student-pdf/${selectedStudent._id}`;

    if (selectedMonthValue) {
      url += `?month=${selectedMonthValue}`;
    }

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${auth.token}` },
      responseType: "blob",
    });

    const fileURL = window.URL.createObjectURL(
      new Blob([response.data])
    );

    const link = document.createElement("a");
    link.href = fileURL;
    link.download = `${selectedStudent.name}_attendance.pdf`;
    link.click();

  } catch (err) {
    toast.error("Failed to download PDF");
  }
};


  /* =====================================================
     FILTER FUNCTIONS
  ===================================================== */
  const filteredStudents = students.filter((s) =>
    s?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAttendance = allAttendance.filter((a) => {
  if (!a?.studentId?.name) return false;

  const matchesSearch = a.studentId.name
    .toLowerCase()
    .includes(searchTerm.toLowerCase());

  const matchesStatus =
    filterStatus === "all" || a.status === filterStatus;

  return matchesSearch && matchesStatus;
});


  /* =====================================================
     STATISTICS
  ===================================================== */
  const stats = {
    total: filteredAttendance.length,
    present: filteredAttendance.filter((a) => a.status === "present").length,
    absent:  filteredAttendance.filter((a) => a.status === "absent").length,
  };

  const markStats = {
    total: records.filter((r) => r.status !== null).length,
    present: records.filter((r) => r.status === "present").length,
    absent: records.filter((r) => r.status === "absent").length,
  };

  return (
    <div className="attendance-modern-container">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      
      {/* ================= HEADER ================= */}
      <div className="modern-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
              </svg>
            </div>
            <div className="header-text">
              <h1>Attendance Management</h1>
              <p>Track and manage student attendance efficiently</p>
            </div>
          </div>
          <div className="header-tabs">
            <button
              className={`tab-btn ${viewMode === "MARK" ? "active" : ""}`}
              onClick={() => setViewMode("MARK")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Mark Attendance
            </button>
            <button
              className={`tab-btn ${viewMode === "CHECK" ? "active" : ""}`}
              onClick={() => setViewMode("CHECK")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
              Check Attendance
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
         MARK ATTENDANCE VIEW
      ===================================================== */}
      {viewMode === "MARK" && (
        <div className="modern-content">
          <div className="content-card">
            <div className="card-header">
              <div className="card-title">
                <h2>Mark Daily Attendance</h2>
                <span className="date-badge">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="header-controls">
                <input
                  type="text"
                  className="search-input-compact"
                  placeholder="🔍 Search student..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <input
                  type="date"
                  className="date-input-modern"
                  value={selectedDate}
                  max={today}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>

            {locked && (
              <div className="alert-modern alert-warning">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0110 0v4"></path>
                </svg>
                <span>Attendance is locked for this date and cannot be modified</span>
              </div>
            )}

            {/* Stats Row */}
            <div className="stats-row">
              <div className="stat-box stat-total">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 010 7.75"></path>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-value">{markStats.total}</span>
                  <span className="stat-label">Total Students</span>
                </div>
              </div>
              <div className="stat-box stat-present">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-value">{markStats.present}</span>
                  <span className="stat-label">Present</span>
                </div>
              </div>
              <div className="stat-box stat-absent">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-value">{markStats.absent}</span>
                  <span className="stat-label">Absent</span>
                </div>
              </div>
              <div className="stat-box stat-percentage">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"></path>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-value">
                    {markStats.total > 0 ? Math.round((markStats.present / markStats.total) * 100) : 0}%
                  </span>
                  <span className="stat-label">Attendance Rate</span>
                </div>
              </div>
            </div>

            {/* Student List */}
            <div className="student-list-container">
              <div className="list-header">
                <span className="list-title">Student Roster ({filteredStudents.length})</span>
              </div>
              <div className="student-list">
                {filteredStudents.map((student, index) => {
                  const actualIndex = students.indexOf(student);
                  const status = records[actualIndex]?.status;
                  
                  return (
                    <div key={student._id} className={`student-item ${locked ? 'locked' : ''}`}>
                      <div className="student-info-row">
                        <div className="student-avatar">
                          {student.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div className="student-details">
                          <h3 className="student-name">{student.name || "Unknown"}</h3>
                          <span className="student-room">Room: {student.roomNumber || "Not Assigned"}</span>
                        </div>
                      </div>
                      <div className="attendance-buttons">
                        <button
                          className={`attendance-btn btn-present ${status === "present" ? "active" : ""}`}
                          onClick={() => !locked && toggleStatus(student, actualIndex, "present")}
                          disabled={locked}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          Present
                        </button>
                        <button
                          className={`attendance-btn btn-absent ${status === "absent" ? "active" : ""}`}
                          onClick={() => !locked && toggleStatus(student, actualIndex, "absent")}
                          disabled={locked}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                          Absent
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredStudents.length === 0 && (
                <div className="no-data-modern">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="M21 21l-4.35-4.35"></path>
                  </svg>
                  <p>No students found</p>
                </div>
              )}
            </div>

            <div className="card-footer">
              <button
                className="btn-modern btn-lock"
                disabled={locked}
                onClick={lockAttendance}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0110 0v4"></path>
                </svg>
                {locked ? "Attendance Locked" : "Lock Attendance"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
         CHECK ATTENDANCE VIEW
      ===================================================== */}
      {viewMode === "CHECK" && (
        <div className="modern-content">
          <div className="content-card">
            <div className="card-header">
              <div className="card-title">
                <h2>Attendance Reports</h2>
                <span className="subtitle">View and analyze attendance records</span>
              </div>
              <div className="header-controls-wide">
                <input
                  type="text"
                  className="search-input-compact"
                  placeholder="🔍 Search student..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
  className="select-modern"
  value={reportMonth}
  onChange={(e) => setReportMonth(e.target.value)}
>
  <option value="">Select Month</option>
  {monthList.map((m) => (
    <option key={m.value} value={m.value}>
      {m.label}
    </option>
  ))}
</select>

<select
  className="select-modern"
  value={reportYear}
  onChange={(e) => setReportYear(e.target.value)}
>
  <option value="">Select Year</option>
  {yearList.map((y) => (
    <option key={y} value={y}>
      {y}
    </option>
  ))}
</select>

                <input
                  type="date"
                  className="date-input-modern"
                  placeholder="From Date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
                <input
                  type="date"
                  className="date-input-modern"
                  placeholder="To Date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
                <select
                  className="select-modern"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="present">Present Only</option>
                  <option value="absent">Absent Only</option>
                </select>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-row">
              <div className="stat-box stat-total">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 010 7.75"></path>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-value">{stats.total}</span>
                  <span className="stat-label">Total Records</span>
                </div>
              </div>
              <div className="stat-box stat-present">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-value">{stats.present}</span>
                  <span className="stat-label">Present</span>
                </div>
              </div>
              <div className="stat-box stat-absent">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-value">{stats.absent}</span>
                  <span className="stat-label">Absent</span>
                </div>
              </div>
              <div className="stat-box stat-percentage">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-value">
                    {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
                  </span>
                  <span className="stat-label">Attendance Rate</span>
                </div>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="table-wrapper">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Room</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.length > 0 ? (
                    filteredAttendance.map((record) => (
                      <tr key={record._id}>
                        <td>
                          <div className="table-student">
                            <div className="table-avatar">
                              {record.studentId?.name?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <span className="table-student-name">
                              {record.studentId?.name || "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="room-badge">
                            {record.studentId?.roomNumber || "N/A"}
                          </span>
                        </td>
                        <td>
                          <span className={`status-pill ${record.status}`}>
                            {record.status === "present" ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            )}
                            {record.status}
                          </span>
                        </td>
                        <td>{new Date(record.date).toLocaleDateString()}</td>
                        <td>{new Date(record.createdAt).toLocaleTimeString()}</td>
                        <td>
                          <button
                            className="btn-action"
                            onClick={() => openStudent(record)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-data-cell">
                        <div className="no-data-modern">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <path d="M9.88 9.88a3 3 0 104.24 4.24"></path>
                            <path d="M10.73 5.08A10.43 10.43 0 0112 5c7 0 10 7 10 7a13.16 13.16 0 01-1.67 2.68"></path>
                            <path d="M6.61 6.61A13.526 13.526 0 002 12s3 7 10 7a9.74 9.74 0 005.39-1.61"></path>
                            <line x1="2" y1="2" x2="22" y2="22"></line>
                          </svg>
                          <p>No attendance records found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      {/* =====================================================
         STUDENT MODAL
      ===================================================== */}
      {selectedStudent && (
        <div className="modal-backdrop" onClick={() => setSelectedStudent(null)}>
          <div className="modal-modern" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-modern">
              <div className="modal-student-header">
                <div className="modal-student-avatar">
                  {selectedStudent.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="modal-student-info">
                  <h3>{selectedStudent.name || "Unknown"}</h3>
                  <p>Room: {selectedStudent.roomNumber || "Not Assigned"}</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelectedStudent(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="modal-body-modern">
              {/* Percentage Circle */}
              <div className="percentage-section">
                <div className="circular-chart">
                  <svg viewBox="0 0 200 200" width="180" height="180">
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="#e0e0e0"
                      strokeWidth="20"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="20"
                      strokeDasharray={`${percentage * 5.03} 503`}
                      strokeLinecap="round"
                      transform="rotate(-90 100 100)"
                      style={{ transition: 'stroke-dasharray 1s ease' }}
                    />
                    <text x="100" y="95" textAnchor="middle" fontSize="36" fontWeight="700" fill="#1f2937">
                      {percentage}%
                    </text>
                    <text x="100" y="120" textAnchor="middle" fontSize="14" fill="#6b7280">
                      Attendance
                    </text>
                  </svg>
                </div>
              </div>

              {/* Monthly History */}
              <h4 className="modal-section-title">Attendance History</h4>
              <div className="modal-table-wrapper">
                <table className="modal-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyAttendance.length > 0 ? (
                      monthlyAttendance.map((record) => (
                        <tr key={record._id}>
                          <td>{new Date(record.date).toLocaleDateString()}</td>
                          <td>
                            <span className={`status-pill ${record.status}`}>
                              {record.status === "present" ? (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              ) : (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              )}
                              {record.status}
                            </span>
                          </td>
                          <td>{new Date(record.createdAt).toLocaleTimeString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="no-data-cell">No history available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer-modern">
              <button className="btn-modern btn-download" onClick={downloadPDF}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download CSV
              </button>
              <button className="btn-modern btn-cancel" onClick={() => setSelectedStudent(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .attendance-modern-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          padding: 0;
        }

        /* ================= HEADER ================= */
        .modern-header {
          background: #ffffff;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: clamp(0.75rem, 2vw, 1.5rem) clamp(1rem, 3vw, 2rem);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: clamp(1rem, 2vw, 2rem);
          flex-wrap: wrap;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: clamp(0.75rem, 1.5vw, 1rem);
        }

        .header-icon {
          width: clamp(40px, 8vw, 56px);
          height: clamp(40px, 8vw, 56px);
          border-radius: clamp(10px, 2vw, 14px);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .header-icon svg {
          width: clamp(24px, 5vw, 40px);
          height: clamp(24px, 5vw, 40px);
        }

        .header-text h1 {
          font-size: clamp(1.1rem, 3vw, 1.75rem);
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 0.25rem;
          line-height: 1.2;
        }

        .header-text p {
          font-size: clamp(0.75rem, 1.5vw, 0.9rem);
          color: #6b7280;
          font-weight: 500;
          display: none;
        }

        .header-tabs {
          display: flex;
          gap: clamp(0.25rem, 0.5vw, 0.5rem);
          background: #f3f4f6;
          padding: clamp(0.25rem, 0.5vw, 0.4rem);
          border-radius: clamp(8px, 1.5vw, 12px);
          width: 100%;
          max-width: 400px;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(0.25rem, 0.75vw, 0.5rem);
          padding: clamp(0.5rem, 1.5vw, 0.75rem) clamp(0.75rem, 2vw, 1.5rem);
          border: none;
          background: transparent;
          color: #6b7280;
          font-size: clamp(0.8rem, 1.5vw, 0.95rem);
          font-weight: 600;
          border-radius: clamp(6px, 1.2vw, 10px);
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
        }

        .tab-btn svg {
          width: clamp(14px, 2.5vw, 18px);
          height: clamp(14px, 2.5vw, 18px);
          flex-shrink: 0;
        }

        .tab-btn:hover {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        .tab-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        /* ================= CONTENT ================= */
        .modern-content {
          max-width: 1400px;
          margin: clamp(1rem, 2vw, 2rem) auto;
          padding: 0 clamp(0.75rem, 2vw, 2rem) clamp(1rem, 2vw, 2rem);
        }

        .content-card {
          background: white;
          border-radius: clamp(12px, 2vw, 16px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }

        .card-header {
          padding: clamp(1rem, 3vw, 2rem);
          border-bottom: 1px solid #e5e7eb;
        }

        .card-title h2 {
          font-size: clamp(1.1rem, 2.5vw, 1.5rem);
          font-weight: 700;
          color: #1f2937;
          margin-bottom: clamp(0.25rem, 0.5vw, 0.5rem);
          line-height: 1.2;
        }

        .date-badge {
          display: inline-block;
          padding: clamp(0.3rem, 0.75vw, 0.4rem) clamp(0.75rem, 1.5vw, 1rem);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: clamp(15px, 3vw, 20px);
          font-size: clamp(0.7rem, 1.5vw, 0.85rem);
          font-weight: 600;
        }

        .subtitle {
          color: #6b7280;
          font-size: clamp(0.8rem, 1.5vw, 0.95rem);
        }

        .header-controls,
        .header-controls-wide {
          display: flex;
          gap: clamp(0.5rem, 1vw, 0.75rem);
          margin-top: clamp(0.75rem, 1.5vw, 1rem);
          flex-wrap: wrap;
        }

        .search-input-compact {
          flex: 1 1 auto;
          min-width: 150px;
          max-width: 280px;
          padding: clamp(0.5rem, 1.2vw, 0.65rem) clamp(0.75rem, 1.5vw, 1rem);
          border: 2px solid #e5e7eb;
          border-radius: clamp(8px, 1.5vw, 10px);
          font-size: clamp(0.8rem, 1.5vw, 0.9rem);
          transition: all 0.3s ease;
        }

        .search-input-compact:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .date-input-modern,
        .select-modern {
          padding: clamp(0.5rem, 1.2vw, 0.65rem) clamp(0.75rem, 1.5vw, 1rem);
          border: 2px solid #e5e7eb;
          border-radius: clamp(8px, 1.5vw, 10px);
          font-size: clamp(0.8rem, 1.5vw, 0.9rem);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
        }

        .date-input-modern:focus,
        .select-modern:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        /* ================= ALERTS ================= */
        .alert-modern {
          display: flex;
          align-items: center;
          gap: clamp(0.5rem, 1vw, 0.75rem);
          padding: clamp(0.75rem, 1.5vw, 1rem) clamp(1rem, 2vw, 1.5rem);
          margin: clamp(1rem, 2vw, 1.5rem) clamp(1rem, 2vw, 2rem);
          border-radius: clamp(10px, 1.5vw, 12px);
          font-weight: 500;
          font-size: clamp(0.8rem, 1.5vw, 0.95rem);
        }

        .alert-modern svg {
          width: clamp(16px, 3vw, 20px);
          height: clamp(16px, 3vw, 20px);
          flex-shrink: 0;
        }

        .alert-warning {
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fcd34d;
        }

        /* ================= STATS ROW ================= */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(clamp(200px, 30vw, 250px), 1fr));
          gap: clamp(1rem, 2vw, 1.5rem);
          padding: clamp(1rem, 3vw, 2rem);
        }

        .stat-box {
          display: flex;
          align-items: center;
          gap: clamp(0.75rem, 1.5vw, 1rem);
          padding: clamp(1rem, 2vw, 1.5rem);
          border-radius: clamp(12px, 2vw, 14px);
          transition: all 0.3s ease;
        }

        .stat-box:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .stat-total {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
        }

        .stat-present {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
        }

        .stat-absent {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
        }

        .stat-percentage {
          background: linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%);
        }

        .stat-icon {
          width: clamp(40px, 8vw, 56px);
          height: clamp(40px, 8vw, 56px);
          border-radius: clamp(10px, 1.5vw, 12px);
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #667eea;
          flex-shrink: 0;
        }

        .stat-icon svg {
          width: clamp(20px, 4vw, 24px);
          height: clamp(20px, 4vw, 24px);
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: clamp(1.5rem, 4vw, 2rem);
          font-weight: 800;
          color: #1f2937;
          line-height: 1;
        }

        .stat-label {
          font-size: clamp(0.7rem, 1.5vw, 0.85rem);
          color: #6b7280;
          font-weight: 600;
          margin-top: 0.25rem;
        }

        /* ================= STUDENT LIST ================= */
        .student-list-container {
          padding: 0 clamp(1rem, 3vw, 2rem) clamp(1rem, 3vw, 2rem);
        }

        .list-header {
          padding: clamp(0.75rem, 1.5vw, 1rem) 0;
          border-bottom: 2px solid #e5e7eb;
          margin-bottom: clamp(0.75rem, 1.5vw, 1rem);
        }

        .list-title {
          font-size: clamp(0.9rem, 2vw, 1.1rem);
          font-weight: 700;
          color: #1f2937;
        }

        .student-list {
          display: flex;
          flex-direction: column;
          gap: clamp(0.5rem, 1vw, 0.75rem);
        }

        .student-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: clamp(0.75rem, 2vw, 1.25rem) clamp(1rem, 2vw, 1.5rem);
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          border-radius: clamp(10px, 1.5vw, 12px);
          transition: all 0.3s ease;
          gap: clamp(0.5rem, 1.5vw, 1rem);
          flex-wrap: wrap;
        }

        .student-item:hover:not(.locked) {
          background: #f3f4f6;
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
        }

        .student-item.locked {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .student-info-row {
          display: flex;
          align-items: center;
          gap: clamp(0.75rem, 1.5vw, 1rem);
          flex: 1 1 auto;
          min-width: 0;
        }

        .student-avatar {
          width: clamp(38px, 8vw, 50px);
          height: clamp(38px, 8vw, 50px);
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: clamp(1rem, 2vw, 1.25rem);
          font-weight: 700;
          flex-shrink: 0;
        }

        .student-details {
          flex: 1;
          min-width: 0;
        }

        .student-name {
          font-size: clamp(0.85rem, 2vw, 1rem);
          font-weight: 600;
          color: #1f2937;
          margin-bottom: clamp(0.15rem, 0.5vw, 0.25rem);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .student-room {
          font-size: clamp(0.75rem, 1.5vw, 0.85rem);
          color: #6b7280;
          font-weight: 500;
        }

        .attendance-buttons {
          display: flex;
          gap: clamp(0.35rem, 0.75vw, 0.5rem);
          flex-shrink: 0;
        }

        .attendance-btn {
          display: flex;
          align-items: center;
          gap: clamp(0.3rem, 0.75vw, 0.5rem);
          padding: clamp(0.5rem, 1.2vw, 0.65rem) clamp(0.75rem, 2vw, 1.25rem);
          border: 2px solid;
          border-radius: clamp(8px, 1.2vw, 10px);
          font-size: clamp(0.75rem, 1.5vw, 0.9rem);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
          white-space: nowrap;
        }

        .attendance-btn svg {
          width: clamp(12px, 2.5vw, 16px);
          height: clamp(12px, 2.5vw, 16px);
          flex-shrink: 0;
        }

        .attendance-btn:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .btn-present {
          border-color: #d1fae5;
          color: #059669;
        }

        .btn-present:hover:not(:disabled) {
          background: #d1fae5;
        }

        .btn-present.active {
          background: #10b981;
          color: white;
          border-color: #10b981;
        }

        .btn-absent {
          border-color: #fee2e2;
          color: #dc2626;
        }

        .btn-absent:hover:not(:disabled) {
          background: #fee2e2;
        }

        .btn-absent.active {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
        }

        /* ================= TABLE ================= */
        .table-wrapper {
          padding: 0 clamp(1rem, 3vw, 2rem) clamp(1rem, 3vw, 2rem);
          overflow-x: auto;
        }

        .modern-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          min-width: 600px;
        }

        .modern-table thead {
          background: #f9fafb;
          border-bottom: 2px solid #e5e7eb;
        }

        .modern-table th {
          padding: clamp(0.75rem, 1.5vw, 1rem) clamp(0.75rem, 2vw, 1.25rem);
          text-align: left;
          font-size: clamp(0.7rem, 1.5vw, 0.85rem);
          font-weight: 700;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .modern-table td {
          padding: clamp(0.85rem, 2vw, 1.25rem);
          border-bottom: 1px solid #e5e7eb;
          font-size: clamp(0.8rem, 1.5vw, 0.95rem);
          color: #374151;
        }

        .modern-table tbody tr {
          transition: all 0.2s ease;
        }

        .modern-table tbody tr:hover {
          background: #f9fafb;
        }

        .table-student {
          display: flex;
          align-items: center;
          gap: clamp(0.5rem, 1vw, 0.75rem);
        }

        .table-avatar {
          width: clamp(36px, 6vw, 42px);
          height: clamp(36px, 6vw, 42px);
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: clamp(0.85rem, 1.5vw, 1rem);
          flex-shrink: 0;
        }

        .table-student-name {
          font-weight: 600;
          color: #1f2937;
        }

        .room-badge {
          display: inline-block;
          padding: clamp(0.3rem, 0.75vw, 0.4rem) clamp(0.65rem, 1.2vw, 0.85rem);
          background: #f3f4f6;
          color: #6b7280;
          border-radius: clamp(6px, 1vw, 8px);
          font-size: clamp(0.75rem, 1.5vw, 0.85rem);
          font-weight: 600;
          white-space: nowrap;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: clamp(0.3rem, 0.5vw, 0.4rem);
          padding: clamp(0.4rem, 0.75vw, 0.5rem) clamp(0.75rem, 1.5vw, 1rem);
          border-radius: clamp(15px, 3vw, 20px);
          font-size: clamp(0.75rem, 1.5vw, 0.85rem);
          font-weight: 600;
          text-transform: capitalize;
          white-space: nowrap;
        }

        .status-pill svg {
          width: clamp(10px, 2vw, 14px);
          height: clamp(10px, 2vw, 14px);
          flex-shrink: 0;
        }

        .status-pill.present {
          background: #d1fae5;
          color: #059669;
        }

        .status-pill.absent {
          background: #fee2e2;
          color: #dc2626;
        }

        .btn-action {
          display: inline-flex;
          align-items: center;
          gap: clamp(0.3rem, 0.75vw, 0.5rem);
          padding: clamp(0.4rem, 0.75vw, 0.5rem) clamp(0.75rem, 1.5vw, 1rem);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: clamp(6px, 1vw, 8px);
          font-size: clamp(0.75rem, 1.5vw, 0.85rem);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .btn-action svg {
          width: clamp(12px, 2.5vw, 16px);
          height: clamp(12px, 2.5vw, 16px);
          flex-shrink: 0;
        }

        .btn-action:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        /* ================= FOOTER ================= */
        .card-footer {
          padding: clamp(1rem, 2vw, 1.5rem) clamp(1rem, 3vw, 2rem);
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
          gap: clamp(0.5rem, 1vw, 1rem);
          flex-wrap: wrap;
        }

        .btn-modern {
          display: inline-flex;
          align-items: center;
          gap: clamp(0.4rem, 0.75vw, 0.5rem);
          padding: clamp(0.65rem, 1.5vw, 0.85rem) clamp(1.25rem, 2.5vw, 1.75rem);
          border: none;
          border-radius: clamp(8px, 1.5vw, 10px);
          font-size: clamp(0.8rem, 1.5vw, 0.95rem);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .btn-modern svg {
          width: clamp(14px, 2.5vw, 18px);
          height: clamp(14px, 2.5vw, 18px);
          flex-shrink: 0;
        }

        .btn-lock {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-lock:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(102, 126, 234, 0.4);
        }

        .btn-lock:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        /* ================= MODAL ================= */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: clamp(0.5rem, 2vw, 1rem);
          backdrop-filter: blur(4px);
        }

        .modal-modern {
          background: white;
          border-radius: clamp(12px, 3vw, 20px);
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: modalSlideIn 0.3s ease;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header-modern {
          padding: clamp(1.25rem, 3vw, 2rem);
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .modal-student-header {
          display: flex;
          align-items: center;
          gap: clamp(0.75rem, 1.5vw, 1rem);
          flex: 1;
          min-width: 0;
        }

        .modal-student-avatar {
          width: clamp(48px, 10vw, 64px);
          height: clamp(48px, 10vw, 64px);
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: clamp(1.25rem, 3vw, 1.75rem);
          font-weight: 700;
          flex-shrink: 0;
        }

        .modal-student-info {
          flex: 1;
          min-width: 0;
        }

        .modal-student-info h3 {
          font-size: clamp(1.1rem, 2.5vw, 1.5rem);
          font-weight: 700;
          color: #1f2937;
          margin-bottom: clamp(0.15rem, 0.5vw, 0.25rem);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .modal-student-info p {
          color: #6b7280;
          font-size: clamp(0.8rem, 1.5vw, 0.95rem);
          font-weight: 500;
        }

        .modal-close {
          width: clamp(36px, 6vw, 40px);
          height: clamp(36px, 6vw, 40px);
          border-radius: 50%;
          border: none;
          background: #f3f4f6;
          color: #6b7280;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .modal-close svg {
          width: clamp(20px, 4vw, 24px);
          height: clamp(20px, 4vw, 24px);
        }

        .modal-close:hover {
          background: #e5e7eb;
          color: #1f2937;
        }

        .modal-body-modern {
          padding: clamp(1.25rem, 3vw, 2rem);
          overflow-y: auto;
          flex: 1;
        }

        .percentage-section {
          display: flex;
          justify-content: center;
          margin-bottom: clamp(1.5rem, 3vw, 2rem);
        }

        .circular-chart {
          position: relative;
        }

        .circular-chart svg {
          width: clamp(140px, 25vw, 180px);
          height: clamp(140px, 25vw, 180px);
        }

        .modal-section-title {
          font-size: clamp(1rem, 2vw, 1.25rem);
          font-weight: 700;
          color: #1f2937;
          margin-bottom: clamp(0.75rem, 1.5vw, 1rem);
        }

        .modal-table-wrapper {
          overflow-x: auto;
          border: 1px solid #e5e7eb;
          border-radius: clamp(10px, 1.5vw, 12px);
        }

        .modal-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 400px;
        }

        .modal-table thead {
          background: #f9fafb;
        }

        .modal-table th {
          padding: clamp(0.75rem, 1.5vw, 1rem);
          text-align: left;
          font-size: clamp(0.7rem, 1.5vw, 0.85rem);
          font-weight: 700;
          color: #6b7280;
          text-transform: uppercase;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-table td {
          padding: clamp(0.75rem, 1.5vw, 1rem);
          border-bottom: 1px solid #e5e7eb;
          font-size: clamp(0.8rem, 1.5vw, 0.9rem);
        }

        .modal-table tbody tr:last-child td {
          border-bottom: none;
        }

        .modal-footer-modern {
          padding: clamp(1rem, 2vw, 1.5rem) clamp(1.25rem, 3vw, 2rem);
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
          gap: clamp(0.5rem, 1vw, 1rem);
          background: #f9fafb;
          flex-wrap: wrap;
        }

        .btn-download {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-download:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(102, 126, 234, 0.4);
        }

        .btn-cancel {
          background: #f3f4f6;
          color: #6b7280;
        }

        .btn-cancel:hover {
          background: #e5e7eb;
          color: #1f2937;
        }

        /* ================= NO DATA ================= */
        .no-data-modern,
        .no-data-cell {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: clamp(2rem, 5vw, 3rem);
          color: #9ca3af;
          text-align: center;
        }

        .no-data-modern svg {
          margin-bottom: clamp(0.75rem, 1.5vw, 1rem);
          opacity: 0.5;
          width: clamp(40px, 8vw, 64px);
          height: clamp(40px, 8vw, 64px);
        }

        .no-data-modern p,
        .no-data-cell p {
          font-size: clamp(0.9rem, 1.5vw, 1rem);
          font-weight: 500;
        }

        /* ================= RESPONSIVE BREAKPOINTS ================= */
        
        /* Large Desktop (1440px+) */
        @media (min-width: 1440px) {
          .header-text p {
            display: block;
          }
        }

        /* Desktop (1024px - 1439px) */
        @media (max-width: 1439px) and (min-width: 1024px) {
          .stats-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* Tablet (768px - 1023px) */
        @media (max-width: 1023px) {
          .header-content {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .header-left {
            justify-content: center;
          }

          .header-tabs {
            width: 100%;
            max-width: 100%;
          }

          .tab-btn {
            flex: 1;
            justify-content: center;
          }

          .stats-row {
            grid-template-columns: repeat(2, 1fr);
          }

          .header-controls-wide {
            flex-direction: column;
          }

          .search-input-compact,
          .select-modern,
          .date-input-modern {
            max-width: 100%;
            width: 100%;
          }
        }

        /* Small Tablet (640px - 767px) */
        @media (max-width: 767px) {
          .modern-content {
            margin: 1rem auto;
          }

          .card-header,
          .student-list-container,
          .table-wrapper {
            padding: 1rem;
          }

          .stats-row {
            grid-template-columns: 1fr;
            gap: 1rem;
            padding: 1rem;
          }

          .stat-box {
            padding: 1rem;
          }

          .header-controls,
          .header-controls-wide {
            flex-direction: column;
            gap: 0.75rem;
          }

          .search-input-compact {
            flex: 1 1 100%;
            max-width: 100%;
          }

          .student-item {
            flex-direction: column;
            align-items: stretch;
            padding: 1rem;
          }

          .student-info-row {
            width: 100%;
          }

          .attendance-buttons {
            width: 100%;
            justify-content: stretch;
          }

          .attendance-btn {
            flex: 1;
            justify-content: center;
          }

          .modern-table {
            font-size: 0.8rem;
            min-width: 500px;
          }

          .modern-table th,
          .modern-table td {
            padding: 0.65rem 0.5rem;
          }

          .table-student {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .modal-header-modern {
            padding: 1.25rem;
          }

          .modal-body-modern {
            padding: 1.25rem;
          }

          .modal-footer-modern {
            padding: 1rem 1.25rem;
            flex-direction: column;
          }

          .btn-modern {
            width: 100%;
            justify-content: center;
          }
        }

        /* Mobile (480px - 639px) */
        @media (max-width: 639px) {
          .header-icon {
            width: 44px;
            height: 44px;
          }

          .header-icon svg {
            width: 26px;
            height: 26px;
          }

          .stat-value {
            font-size: 1.75rem;
          }

          .student-avatar {
            width: 42px;
            height: 42px;
            font-size: 1.1rem;
          }

          .student-name {
            font-size: 0.9rem;
          }

          .student-room {
            font-size: 0.8rem;
          }

          .attendance-btn {
            padding: 0.55rem 1rem;
            font-size: 0.8rem;
          }

          .modern-table {
            min-width: 450px;
          }

          .table-avatar {
            width: 32px;
            height: 32px;
            font-size: 0.8rem;
          }

          .btn-action {
            padding: 0.45rem 0.85rem;
            font-size: 0.8rem;
          }

          .modal-student-avatar {
            width: 52px;
            height: 52px;
            font-size: 1.35rem;
          }

          .circular-chart svg {
            width: 140px;
            height: 140px;
          }
        }

        /* Small Mobile (320px - 479px) */
        @media (max-width: 479px) {
          .attendance-modern-container {
            font-size: 14px;
          }

          .header-content {
            padding: 0.75rem 1rem;
          }

          .header-icon {
            width: 38px;
            height: 38px;
          }

          .header-icon svg {
            width: 22px;
            height: 22px;
          }

          .header-text h1 {
            font-size: 1rem;
          }

          .tab-btn {
            padding: 0.5rem 0.75rem;
            font-size: 0.75rem;
            gap: 0.25rem;
          }

          .tab-btn svg {
            width: 12px;
            height: 12px;
          }

          .card-title h2 {
            font-size: 1rem;
          }

          .date-badge {
            font-size: 0.7rem;
            padding: 0.25rem 0.65rem;
          }

          .stat-box {
            flex-direction: column;
            text-align: center;
            padding: 0.85rem;
          }

          .stat-icon {
            margin: 0 auto;
          }

          .stat-value {
            font-size: 1.5rem;
          }

          .stat-label {
            font-size: 0.7rem;
          }

          .student-avatar {
            width: 36px;
            height: 36px;
            font-size: 0.95rem;
          }

          .attendance-btn {
            padding: 0.5rem 0.85rem;
            font-size: 0.75rem;
          }

          .attendance-btn svg {
            width: 10px;
            height: 10px;
          }

          .modern-table {
            min-width: 400px;
            font-size: 0.75rem;
          }

          .modern-table th,
          .modern-table td {
            padding: 0.5rem 0.4rem;
          }

          .table-avatar {
            width: 28px;
            height: 28px;
            font-size: 0.75rem;
          }

          .room-badge {
            font-size: 0.7rem;
            padding: 0.25rem 0.5rem;
          }

          .status-pill {
            font-size: 0.7rem;
            padding: 0.35rem 0.65rem;
          }

          .btn-action {
            padding: 0.4rem 0.7rem;
            font-size: 0.75rem;
            gap: 0.25rem;
          }

          .btn-action svg {
            width: 10px;
            height: 10px;
          }

          .modal-modern {
            max-height: 95vh;
            border-radius: 12px;
          }

          .modal-header-modern {
            padding: 1rem;
          }

          .modal-student-avatar {
            width: 44px;
            height: 44px;
            font-size: 1.15rem;
          }

          .modal-student-info h3 {
            font-size: 1rem;
          }

          .modal-student-info p {
            font-size: 0.75rem;
          }

          .modal-close {
            width: 32px;
            height: 32px;
          }

          .modal-close svg {
            width: 18px;
            height: 18px;
          }

          .modal-body-modern {
            padding: 1rem;
          }

          .circular-chart svg {
            width: 120px;
            height: 120px;
          }

          .modal-section-title {
            font-size: 0.95rem;
          }

          .modal-table {
            min-width: 320px;
            font-size: 0.75rem;
          }

          .modal-table th,
          .modal-table td {
            padding: 0.65rem 0.5rem;
          }

          .modal-footer-modern {
            padding: 0.85rem 1rem;
          }

          .btn-modern {
            padding: 0.65rem 1.25rem;
            font-size: 0.8rem;
          }

          .btn-modern svg {
            width: 12px;
            height: 12px;
          }

          .alert-modern {
            padding: 0.75rem 1rem;
            font-size: 0.8rem;
            margin: 1rem;
          }

          .alert-modern svg {
            width: 14px;
            height: 14px;
          }
        }

        /* Extra Small (< 360px) */
        @media (max-width: 359px) {
          .header-text h1 {
            font-size: 0.9rem;
          }

          .tab-btn span {
            display: none;
          }

          .tab-btn {
            padding: 0.5rem;
          }

          .student-name,
          .student-room {
            font-size: 0.75rem;
          }

          .attendance-btn {
            padding: 0.45rem 0.65rem;
            font-size: 0.7rem;
          }
        }

        /* Landscape orientation fixes for mobile */
        @media (max-height: 600px) and (orientation: landscape) {
          .modal-modern {
            max-height: 95vh;
          }

          .modal-body-modern {
            max-height: 60vh;
          }

          .percentage-section {
            margin-bottom: 1rem;
          }

          .circular-chart svg {
            width: 100px;
            height: 100px;
          }
        }

        /* Touch-friendly spacing for mobile */
        @media (pointer: coarse) {
          .tab-btn,
          .attendance-btn,
          .btn-action,
          .btn-modern {
            min-height: 44px;
          }

          .modal-close {
            min-width: 44px;
            min-height: 44px;
          }
        }
      `}</style>
    </div>
  );
};

export default Attendance;