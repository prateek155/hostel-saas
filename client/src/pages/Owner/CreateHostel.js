import { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";

const CreateHostel = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    facilities: "",
    hosteltype: "Boys Hostel",
  });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:8083/api/v1/hostel/create-hostel",
        {
          name: data.name,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          hosteltype: data.hosteltype,
          facilities: data.facilities.split(","),
        },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (res.data.success) {
        toast.success("Hostel created successfully");
        navigate("/dashboard/owner");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* ================= MAIN CONTAINER ================= */
        .create-hostel-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
          padding: clamp(16px, 3vw, 40px);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
        }

        /* ================= FORM WRAPPER ================= */
        .form-wrapper {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 
                      0 0 0 1px rgba(255, 255, 255, 0.1);
          width: 100%;
          max-width: 1400px;
          padding: clamp(24px, 4vw, 48px);
          animation: slideUp 0.6s ease-out;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ================= FORM HEADER ================= */
        .form-header {
          text-align: center;
          margin-bottom: clamp(32px, 5vw, 48px);
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

        .form-header h2 {
          font-size: clamp(1.75rem, 4vw, 2.5rem);
          color: #1a202c;
          font-weight: 800;
          margin-bottom: 12px;
          letter-spacing: -0.5px;
        }

        .form-header p {
          color: #4a5568;
          font-size: clamp(0.95rem, 2vw, 1.1rem);
          font-weight: 400;
        }

        /* ================= FORM LAYOUT ================= */
        .hostel-form {
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(20px, 3vw, 28px);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(20px, 3vw, 24px);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
          animation: fadeIn 0.4s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .form-group label {
          font-size: clamp(0.9rem, 2vw, 1rem);
          font-weight: 600;
          color: #2d3748;
          margin-left: 4px;
          letter-spacing: 0.3px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .form-input,
        .form-textarea {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: clamp(0.9rem, 2vw, 1rem);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: inherit;
          background: #ffffff;
          color: #2d3748;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #2c5364;
          box-shadow: 0 0 0 4px rgba(44, 83, 100, 0.1),
                      0 4px 12px rgba(44, 83, 100, 0.15);
          transform: translateY(-1px);
        }

        .form-input:hover:not(:focus),
        .form-textarea:hover:not(:focus) {
          border-color: #cbd5e0;
          background-color: #f7fafc;
        }

        .form-input::placeholder,
        .form-textarea::placeholder {
          color: #a0aec0;
        }

        .form-textarea {
          min-height: 120px;
          resize: vertical;
        }

        /* ================= SECTION DIVIDER ================= */
        .section-title {
          font-size: clamp(1.15rem, 2.5vw, 1.5rem);
          color: #1a202c;
          font-weight: 700;
          margin: clamp(12px, 2vw, 20px) 0 0 0;
          padding-bottom: 12px;
          border-bottom: 3px solid #e2e8f0;
          position: relative;
        }

        .section-title::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          width: 80px;
          height: 3px;
          background: linear-gradient(90deg, #2c5364 0%, #203a43 100%);
          border-radius: 2px;
        }

        /* ================= SUBMIT BUTTON ================= */
        .submit-btn {
          background: linear-gradient(135deg, #2c5364 0%, #203a43 50%, #0f2027 100%);
          background-size: 200% 100%;
          color: white;
          padding: clamp(14px, 3vw, 18px) clamp(24px, 5vw, 40px);
          border: none;
          border-radius: 14px;
          font-size: clamp(1rem, 2.5vw, 1.15rem);
          font-weight: 700;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          margin-top: clamp(12px, 2vw, 20px);
          box-shadow: 0 8px 24px rgba(44, 83, 100, 0.35),
                      0 2px 8px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
          letter-spacing: 0.5px;
          width: 100%;
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .submit-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(44, 83, 100, 0.45),
                      0 4px 12px rgba(0, 0, 0, 0.15);
          background-position: 100% 0;
        }

        .submit-btn:hover::before {
          left: 100%;
        }

        .submit-btn:active {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(44, 83, 100, 0.35);
        }

        /* ================= FACILITIES HINT ================= */
        .facilities-hint {
          font-size: clamp(0.8rem, 1.8vw, 0.9rem);
          color: #718096;
          margin-top: -4px;
          margin-left: 4px;
          font-style: italic;
        }

        /* ================= RESPONSIVE BREAKPOINTS ================= */
        
        /* Small Mobile (360px - 480px) */
        @media (max-width: 480px) {
          .create-hostel-container {
            padding: 12px;
          }

          .form-wrapper {
            padding: 20px 16px;
            border-radius: 18px;
          }

          .form-header {
            margin-bottom: 28px;
          }

          .hostel-form {
            gap: 16px;
          }

          .form-group {
            gap: 8px;
          }

          .form-input,
          .form-textarea {
            padding: 12px 14px;
          }

          .form-textarea {
            min-height: 100px;
          }

          .section-title {
            padding-bottom: 10px;
          }

          .section-title::after {
            width: 60px;
          }
        }

        /* Mobile Landscape & Small Tablets (481px - 767px) */
        @media (min-width: 481px) and (max-width: 767px) {
          .form-row {
            grid-template-columns: 1fr 1fr;
          }
        }

        /* Tablets (768px - 1024px) */
        @media (min-width: 768px) {
          .hostel-form {
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
          }

          .form-row {
            grid-template-columns: 1fr 1fr;
            grid-column: span 2;
          }

          .form-group.full-width {
            grid-column: span 2;
          }

          .section-title {
            grid-column: span 2;
          }

          .submit-btn {
            grid-column: span 2;
          }
        }

        /* Large Tablets & Small Laptops (1025px - 1279px) */
        @media (min-width: 1025px) {
          .form-wrapper {
            padding: 40px 48px;
          }

          .hostel-form {
            grid-template-columns: repeat(2, 1fr);
            gap: 28px;
          }
        }

        /* Laptops & Desktops (1280px - 1599px) */
        @media (min-width: 1280px) {
          .form-wrapper {
            max-width: 1200px;
            padding: 48px 56px;
          }

          .hostel-form {
            grid-template-columns: repeat(3, 1fr);
            gap: 28px;
          }

          .form-row {
            grid-template-columns: 1fr 1fr;
            grid-column: span 3;
            gap: 28px;
          }

          .form-group.full-width {
            grid-column: span 3;
          }

          .section-title {
            grid-column: span 3;
          }

          .submit-btn {
            grid-column: span 3;
            max-width: 400px;
            margin-left: auto;
            margin-right: auto;
          }
        }

        /* Large Desktops (1600px+) */
        @media (min-width: 1600px) {
          .form-wrapper {
            max-width: 1400px;
            padding: 56px 64px;
          }

          .hostel-form {
            grid-template-columns: repeat(3, 1fr);
            gap: 32px;
          }

          .form-row {
            gap: 32px;
          }
        }

        /* Ultra-wide Screens (1920px+) */
        @media (min-width: 1920px) {
          .create-hostel-container {
            padding: 60px;
          }

          .form-wrapper {
            max-width: 1600px;
            padding: 64px 80px;
          }

          .hostel-form {
            grid-template-columns: repeat(4, 1fr);
            gap: 36px;
          }

          .form-row {
            grid-column: span 4;
            grid-template-columns: repeat(2, 1fr);
            gap: 36px;
          }

          .form-group.full-width {
            grid-column: span 4;
          }

          .section-title {
            grid-column: span 4;
          }

          .submit-btn {
            grid-column: span 4;
          }
        }
      `}</style>

      <div className="create-hostel-container">
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        <div className="form-wrapper">
          <div className="form-header">
            <h2>Create New Hostel</h2>
            <p>Fill in the details to register your hostel</p>
          </div>

          <div className="hostel-form">
            {/* Basic Information */}
            <div className="form-group full-width">
              <label>🏨 Hostel Name *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Enter hostel name"
                value={data.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group full-width">
              <label>📍 Address *</label>
              <input
                type="text"
                name="address"
                className="form-input"
                placeholder="Enter full address"
                value={data.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>🏙️ City *</label>
                <input
                  type="text"
                  name="city"
                  className="form-input"
                  placeholder="City"
                  value={data.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>🗺️ State *</label>
                <input
                  type="text"
                  name="state"
                  className="form-input"
                  placeholder="State"
                  value={data.state}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>📮 Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  className="form-input"
                  placeholder="Pincode"
                  value={data.pincode}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>🏢 Hostel Type *</label>
                <select
                  name="hosteltype"
                  className="form-input"
                  value={data.hosteltype}
                  onChange={handleChange}
                  required
                  style={{ cursor: 'pointer' }}
                >
                  <option value="Boys Hostel">Boys Hostel</option>
                  <option value="Girls Hostel">Girls Hostel</option>
                  <option value="Co-ed Hostel">Co-ed Hostel</option>
                  <option value="PG">PG</option>
                </select>
              </div>
            </div>

            {/* Facilities */}
            <div className="form-group full-width">
              <label>✨ Facilities</label>
              <textarea
                name="facilities"
                className="form-input form-textarea"
                placeholder="Wi-Fi, Laundry, Parking, Security, Mess, etc."
                value={data.facilities}
                onChange={handleChange}
              />
              <span className="facilities-hint">
                Separate multiple facilities with commas (e.g., Wi-Fi, Laundry, Parking)
              </span>
            </div>

            {/* Submit Button */}
            <button type="submit" onClick={handleSubmit} className="submit-btn">
              Create Hostel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateHostel;