import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/auth";
import { toast } from "react-toastify";

const StudentFees = () => {
  const [auth] = useAuth();
  const [month, setMonth] = useState("");

  const downloadBill = async () => {
    if (!month) return toast.error("Select month");

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
    } catch {
      toast.error("Bill not available or unpaid");
    }
  };

  return (
    <div className="container mt-4">
      <h4>My Fee Bills</h4>

      <div className="card p-3">
        <label>Select Month</label>
        <input
          type="month"
          className="form-control mb-3"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />

        <button className="btn btn-primary" onClick={downloadBill}>
          Download Paid Bill
        </button>
      </div>
    </div>
  );
};

export default StudentFees;
