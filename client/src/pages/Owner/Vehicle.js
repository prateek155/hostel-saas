import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/auth";
import { toast , ToastContainer} from "react-toastify";

const Vehicle = () => {
  const [auth] = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  /* =========================
     🔐 ACCESS CHECK
     ========================= */
  useEffect(() => {
    if (!auth?.user?.vehicleAccess) {
      toast.error("Vehicle parking access not enabled for you");
    }
  }, [auth]);

  /* =========================
     🚗 FETCH VEHICLES
     ========================= */
  const getVehicles = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://hostelwers.onrender.com/api/v1/vehicle/owner",
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (res.data.success) {
        setVehicles(res.data.vehicles);
      }
    } catch (error) {
      toast.error("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.user?.vehicleAccess) {
      getVehicles();
    }
  }, [auth]);

  /* =========================
     UI
     ========================= */
  if (!auth?.user?.vehicleAccess) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>🚫 Access Restricted</h2>
        <p>Admin has not enabled vehicle parking for your hostel.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "30px" }}>
            <ToastContainer position="top-left" autoClose={3000} theme="dark" />
      <h2 style={{ marginBottom: "20px" }}>🚗 Vehicle Parking</h2>

      {loading ? (
        <p>Loading vehicles...</p>
      ) : vehicles.length === 0 ? (
        <p>No vehicles added yet.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#fff",
          }}
        >
          <thead>
            <tr style={{ background: "#f1f5f9" }}>
              <th style={th}>#</th>
              <th style={th}>Vehicle Number</th>
              <th style={th}>Type</th>
              <th style={th}>Owner Name</th>
              <th style={th}>Created At</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v, index) => (
              <tr key={v._id}>
                <td style={td}>{index + 1}</td>
                <td style={td}>{v.vehicleNumber}</td>
                <td style={td}>{v.vehicleType}</td>
                <td style={td}>{v.ownerName}</td>
                <td style={td}>
                  {new Date(v.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

/* =========================
   SIMPLE STYLES
   ========================= */
const th = {
  padding: "12px",
  textAlign: "left",
  borderBottom: "1px solid #e2e8f0",
  fontWeight: "600",
};

const td = {
  padding: "12px",
  borderBottom: "1px solid #f1f5f9",
};

export default Vehicle;
