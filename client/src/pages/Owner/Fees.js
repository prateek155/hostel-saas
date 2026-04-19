import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/auth";
import { toast, ToastContainer } from "react-toastify";

const Fees = () => {
  const [auth] = useAuth();

  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= MONTH & YEAR DATA ================= */

  const months = [
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

  const years = Array.from({ length: 11 }, (_, i) => 2026 + i);

  const fullMonth =
    selectedYear && selectedMonth
      ? `${selectedYear}-${selectedMonth}`
      : "";

  /* ================= LOAD FEES ================= */

  const loadFees = async () => {
    if (!fullMonth)
      return toast.error("Please select both month and year");

    try {
      setLoading(true);

      const res = await axios.get(
        "https://hostelwers.onrender.com/api/v1/fees/by-month",
        {
          params: { month: fullMonth },
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );

      setFees(res.data.fees || []);
    } catch {
      toast.error("Failed to load fees");
    } finally {
      setLoading(false);
    }
  };

  /* ================= GENERATE FEES ================= */

  const generateFees = async () => {
    if (!fullMonth)
      return toast.error("Please select both month and year");

    try {
      await axios.post(
        "https://hostelwers.onrender.com/api/v1/fees/generate",
        { month: fullMonth },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );

      toast.success("Fees generated successfully");
      loadFees();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Fees already generated for this month"
      );
    }
  };

  /* ================= MARK PAID ================= */

  const markPaid = async (feeId) => {
    try {
      await axios.put(
        `https://hostelwers.onrender.com/api/v1/fees/mark-paid/${feeId}`,
        { paymentMode: "Cash" },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );

      toast.success("Marked as Paid");
      loadFees();
    } catch {
      toast.error("Failed to update status");
    }
  };

  /* ================= AUTO LOAD WHEN MONTH CHANGES ================= */

  useEffect(() => {
    if (fullMonth) {
      loadFees();
    }
  }, [selectedMonth, selectedYear]);

  return (
    <div className="container mt-4">
      <ToastContainer position="top-left" autoClose={3000} theme="dark" />

      <h3 className="mb-3">Fees Management</h3>

      {/* ================= FILTER SECTION ================= */}
      <div className="card p-3 mb-3">
        <div className="row g-3 align-items-end">

          {/* Month Dropdown */}
          <div className="col-md-4">
            <label className="form-label">Select Month</label>
            <select
              className="form-control"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">Select Month</option>
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Year Dropdown */}
          <div className="col-md-4">
            <label className="form-label">Select Year</label>
            <select
              className="form-control"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">Select Year</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="col-md-4 d-flex gap-2">
            <button className="btn btn-primary" onClick={generateFees}>
              Generate Fees
            </button>

            <button className="btn btn-success" onClick={loadFees}>
              Load Fees
            </button>
          </div>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="card">
        <div className="card-body p-0">
          <table className="table table-bordered table-hover mb-0">
            <thead className="table-dark">
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Room</th>
                <th>Type</th>
                <th>Month</th>
                <th>Amount</th>
                <th>Status</th>
                <th width="180">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    Loading...
                  </td>
                </tr>
              ) : fees.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-muted">
                    No fee records found
                  </td>
                </tr>
              ) : (
                fees.map((f) => (
                  <tr key={f._id}>
                    <td>{f.studentId?.name}</td>
                    <td>{f.studentId?.phone}</td>
                    <td>
                      {f.roomSnapshot?.roomNumber} /{" "}
                      {f.roomSnapshot?.bedNumber}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          f.roomSnapshot?.roomType === "AC"
                            ? "bg-success"
                            : "bg-secondary"
                        }`}
                      >
                        {f.roomSnapshot?.roomType}
                      </span>
                    </td>
                    <td>{f.month}</td>
                    <td>₹{f.monthlyRent}</td>
                    <td>
                      <span
                        className={`badge ${
                          f.status === "PAID"
                            ? "bg-success"
                            : "bg-warning"
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>
                    <td>
                      {f.status === "PENDING" && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => markPaid(f._id)}
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Fees;
