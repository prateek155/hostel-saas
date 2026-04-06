import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/auth";
import { toast, ToastContainer  } from "react-toastify";
import {
  Building2,
  MapPin,
  CheckCircle,
  User,
  Mail,
  Phone,
  Home,
  Edit,
  Building
} from "lucide-react";

const MyHostel = () => {
  const [auth] = useAuth();
  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);
 

  const getMyHostel = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:8083/api/v1/hostel/my-hostel",
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (data.success) {
        setHostel(data.hostel);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load hostel");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = () => {
  setEditData({
    name: hostel.name,
    address: hostel.address,
    city: hostel.city,
    state: hostel.state,
    pincode: hostel.pincode,
    hosteltype: hostel.hosteltype,
  });
  setEditOpen(true);
};

  const updateMyHostel = async (updatedData) => {
  try {
    const { data } = await axios.put(
      "http://localhost:8083/api/v1/hostel/update-my-hostel",
      updatedData,
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }
    );

    if (data.success) {
      toast.success("Hostel updated successfully");
      setHostel(data.hostel); // ✅ refresh UI instantly
    }
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Failed to update hostel"
    );
  }
};

  useEffect(() => {
    getMyHostel();
  }, []);

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Loading hostel details...</p>
        </div>
      </>
    );
  }

  if (!hostel) {
    return (
      <>
        <style>{styles}</style>
        <div className="empty-state">
          <div className="empty-icon">
            <Building2 size={80} />
          </div>
          <h2>No Hostel Found</h2>
          <p>Please create your hostel first to get started.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      
      <div className="page-wrapper">
        <div className="hostel-container">
          {/* Header Card */}
          <div className="header-card">
            <div className="header-icon">
              <Building2 size={32} />
            </div>
            <h1 className="page-title">Hostel Details</h1>
          </div>

          {/* Main Content Grid */}
          <div className="content-grid">
            {/* Left Column */}
            <div className="left-column">
              {/* Hostel Name & Status */}
              <div className="info-card hostel-name-card">
                <h2 className="hostel-name">{hostel.name}</h2>
                <span className={`status-badge ${hostel.isActive ? 'active' : 'inactive'}`}>
                  <CheckCircle size={16} />
                  {hostel.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Location Information */}
              <div className="info-card">
                <h3 className="card-title">
                  <MapPin size={20} />
                  Location Information
                </h3>
                <div className="location-grid">
                  <div className="location-item">
                    <span className="location-label">
                      <Home size={16} />
                      Address
                    </span>
                    <span className="location-value">{hostel.address}</span>
                  </div>
                  <div className="location-item">
                    <span className="location-label">
                      <Building size={16} />
                      Hostel Type
                    </span>
                    <span className="location-value">{hostel.hosteltype}</span>
                  </div>
                  <div className="location-item">
                    <span className="location-label">
                      <MapPin size={16} />
                      City
                    </span>
                    <span className="location-value">{hostel.city}</span>
                  </div>
                  <div className="location-item">
                    <span className="location-label">
                      <MapPin size={16} />
                      State
                    </span>
                    <span className="location-value">{hostel.state}</span>
                  </div>
                  <div className="location-item">
                    <span className="location-label">
                      <MapPin size={16} />
                      Pincode
                    </span>
                    <span className="location-value">{hostel.pincode}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="info-card action-buttons-card">
                <button className="btn-primary" onClick={openEditModal}>
                  <Edit size={20} />
                   Edit Hostel
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div className="right-column">
              {/* Facilities */}
              <div className="info-card">
                <h3 className="card-title">Facilities</h3>
                <div className="facilities-container">
                  {hostel.facilities && hostel.facilities.length > 0 ? (
                    hostel.facilities.map((facility, index) => (
                      <div key={index} className="facility-badge">
                        {facility}
                      </div>
                    ))
                  ) : (
                    <p className="no-data">No facilities added</p>
                  )}
                </div>
              </div>


              {/* Owner Information */}
              {hostel.owner && (
                <div className="info-card">
                  <h3 className="card-title">Owner Information</h3>
                  <div className="owner-grid">
                    <div className="owner-item">
                      <div className="owner-icon">
                        <User size={20} />
                      </div>
                      <div className="owner-info">
                        <span className="owner-label">Name</span>
                        <span className="owner-value">{auth?.user?.name}</span>
                      </div>
                    </div>
                    <div className="owner-item">
                      <div className="owner-icon">
                        <Mail size={20} />
                      </div>
                      <div className="owner-info">
                        <span className="owner-label">Email</span>
                        <span className="owner-value">{auth?.user?.email}</span>
                      </div>
                    </div>
                    <div className="owner-item">
                      <div className="owner-icon">
                        <Phone size={20} />
                      </div>
                      <div className="owner-info">
                        <span className="owner-label">Phone</span>
                        <span className="owner-value">{auth?.user?.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {editOpen && editData && (
  <div className="modal-overlay">
          <ToastContainer position="top-left" autoClose={3000} theme="dark" />
    
    <div className="modal-card">
      <h2>Edit Hostel</h2>

      <input
        className="form-input"
        value={editData.name}
        onChange={(e) =>
          setEditData({ ...editData, name: e.target.value })
        }
        placeholder="Hostel Name"
      />

      <input
        className="form-input"
        value={editData.address}
        onChange={(e) =>
          setEditData({ ...editData, address: e.target.value })
        }
        placeholder="Address"
      />

      <div className="modal-grid">
        <input
          className="form-input"
          value={editData.city}
          onChange={(e) =>
            setEditData({ ...editData, city: e.target.value })
          }
          placeholder="City"
        />

        <input
          className="form-input"
          value={editData.state}
          onChange={(e) =>
            setEditData({ ...editData, state: e.target.value })
          }
          placeholder="State"
        />
      </div>

      {/* ✅ HOSTEL TYPE DROPDOWN */}
      <select
        className="form-input"
        value={editData.hosteltype}
        onChange={(e) =>
          setEditData({ ...editData, hosteltype: e.target.value })
        }
      >
        <option value="Boys Hostel">Boys Hostel</option>
        <option value="Girls Hostel">Girls Hostel</option>
        <option value="Co-ed Hostel">Co-ed Hostel</option>
        <option value="PG">PG</option>
      </select>

      <div className="modal-actions">
        <button
          className="btn-secondary"
          onClick={() => setEditOpen(false)}
        >
          Cancel
        </button>

        <button
          className="btn-primary"
          onClick={() => {
            updateMyHostel(editData);
            setEditOpen(false);
          }}
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
)}

    </>
  );
};

const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: linear-gradient(135deg, #1a0f0a 0%, #2d1810 50%, #1a0f0a 100%);
    min-height: 100vh;
  }

  .page-wrapper {
    min-height: 100vh;
    padding: 20px;
  }

  .hostel-container {
    max-width: 1400px;
    margin: 0 auto;
  }

  /* Header Card */
  .header-card {
    background: linear-gradient(135deg, #4a2c1f 0%, #6b3d2a 100%);
    border-radius: 16px;
    padding: 24px 32px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .header-icon {
    background: rgba(255, 255, 255, 0.15);
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffd700;
  }

  .page-title {
    font-size: 28px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: -0.5px;
  }

  /* Content Grid */
  .content-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  .left-column,
  .right-column {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* Info Cards */
  .info-card {
    background: linear-gradient(135deg, #3d2415 0%, #5a3520 100%);
    border-radius: 16px;
    padding: 28px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .info-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  }

  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: #ffd700;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Hostel Name Card */
  .hostel-name-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }

  .hostel-name {
    font-size: 32px;
    font-weight: 700;
    color: #ffffff;
    text-transform: lowercase;
  }

  .status-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 24px;
    font-size: 14px;
    font-weight: 600;
    text-transform: capitalize;
  }

  .status-badge.active {
    background: rgba(76, 175, 80, 0.2);
    color: #81c784;
    border: 1px solid rgba(129, 199, 132, 0.3);
  }

  .status-badge.inactive {
    background: rgba(244, 67, 54, 0.2);
    color: #e57373;
    border: 1px solid rgba(229, 115, 115, 0.3);
  }

  /* Location Grid */
  .location-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .location-item {
    background: rgba(255, 255, 255, 0.05);
    padding: 16px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .location-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #c9a882;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
  }

  .location-value {
    font-size: 16px;
    color: #ffffff;
    font-weight: 600;
    text-transform: lowercase;
  }

  /* Capacity Grid */
  .capacity-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .capacity-card {
    background: rgba(255, 255, 255, 0.05);
    padding: 20px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 16px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: all 0.3s ease;
  }

  .capacity-card:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: scale(1.02);
  }

  .capacity-icon {
    background: linear-gradient(135deg, #ff6b35, #f7931e);
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    flex-shrink: 0;
  }

  .capacity-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .capacity-label {
    font-size: 12px;
    color: #c9a882;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
  }

  .capacity-value {
    font-size: 28px;
    font-weight: 700;
    color: #ffffff;
  }

  /* Action Buttons Card */
  .action-buttons-card {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  .action-buttons-card button {
  flex: 1;
  min-width: 200px;
  padding: 16px 24px;
  border-radius: 12px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  cursor: pointer;     /* ✅ FIX */
  opacity: 1;          /* ✅ FIX */
  transition: all 0.3s ease;
}


  .btn-primary {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #ffffff;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }

  .btn-secondary {
    background: rgba(255, 255, 255, 0.1);
    color: #ffd700;
    border: 2px solid #ffd700;
  }

  .coming-soon-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #ff6b35;
    color: #ffffff;
    font-size: 10px;
    padding: 4px 8px;
    border-radius: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Facilities */
  .facilities-container {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .facility-badge {
    background: rgba(255, 215, 0, 0.15);
    color: #ffd700;
    padding: 10px 18px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
    border: 1px solid rgba(255, 215, 0, 0.3);
    text-transform: lowercase;
    transition: all 0.3s ease;
  }

  .facility-badge:hover {
    background: rgba(255, 215, 0, 0.25);
    transform: translateY(-2px);
  }

  /* Pricing Section */
.pricing-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.pricing-card {
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.pricing-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffd700;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pricing-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.pricing-label {
  font-size: 13px;
  color: #c9a882;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.pricing-value {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
}

/* Responsive */
@media screen and (max-width: 768px) {
  .pricing-grid {
    grid-template-columns: 1fr;
  }
}


  /* Owner Grid */
  .owner-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .owner-item {
    background: rgba(255, 255, 255, 0.05);
    padding: 18px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 16px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .owner-icon {
    background: linear-gradient(135deg, #667eea, #764ba2);
    width: 48px;
    height: 48px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    flex-shrink: 0;
  }

  .owner-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 0;
  }

  .owner-label {
    font-size: 12px;
    color: #c9a882;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
  }

  .owner-value {
    font-size: 16px;
    color: #ffffff;
    font-weight: 600;
    word-break: break-word;
  }

  /* Edit Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}

.modal-card {
  background: #2d1810;
  padding: 24px;
  border-radius: 16px;
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.modal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

  /* Loading & Empty States */
  .loading-container,
  .empty-state {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
  }

  .spinner {
    width: 60px;
    height: 60px;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-top: 4px solid #ffd700;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .loading-text {
    color: #c9a882;
    font-size: 18px;
    font-weight: 500;
  }

  .empty-icon {
    color: #c9a882;
    opacity: 0.5;
  }

  .empty-state h2 {
    color: #ffffff;
    font-size: 28px;
    font-weight: 700;
    margin-top: 20px;
  }

  .empty-state p {
    color: #c9a882;
    font-size: 16px;
  }

  .no-data {
    color: #c9a882;
    font-style: italic;
  }

  /* Responsive Design */
  @media screen and (max-width: 1200px) {
    .content-grid {
      grid-template-columns: 1fr;
    }

    .page-title {
      font-size: 24px;
    }

    .hostel-name {
      font-size: 28px;
    }
  }

  @media screen and (max-width: 768px) {
    .page-wrapper {
      padding: 16px;
    }

    .header-card {
      padding: 20px;
    }

    .header-icon {
      width: 48px;
      height: 48px;
    }

    .page-title {
      font-size: 20px;
    }

    .info-card {
      padding: 20px;
    }

    .hostel-name {
      font-size: 24px;
    }

    .location-grid {
      grid-template-columns: 1fr;
    }

    .capacity-grid {
      grid-template-columns: 1fr;
    }

    .card-title {
      font-size: 16px;
    }

    .capacity-value {
      font-size: 24px;
    }

    .action-buttons-card {
      flex-direction: column;
    }

    .action-buttons-card button {
      min-width: 100%;
    }
  }

  @media screen and (max-width: 480px) {
    .page-wrapper {
      padding: 12px;
    }

    .header-card {
      padding: 16px;
      gap: 12px;
    }

    .header-icon {
      width: 40px;
      height: 40px;
    }

    .page-title {
      font-size: 18px;
    }

    .info-card {
      padding: 16px;
    }

    .hostel-name {
      font-size: 20px;
    }

    .hostel-name-card {
      flex-direction: column;
      align-items: flex-start;
    }

    .capacity-icon {
      width: 48px;
      height: 48px;
    }

    .capacity-value {
      font-size: 22px;
    }

    .owner-icon {
      width: 40px;
      height: 40px;
    }

    .facility-badge {
      padding: 8px 14px;
      font-size: 13px;
    }

    .action-buttons-card button {
      padding: 14px 20px;
      font-size: 14px;
    }
  }
`;

export default MyHostel;