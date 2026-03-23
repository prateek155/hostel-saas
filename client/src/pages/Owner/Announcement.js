import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../../context/auth";

const Announcement = () => {
  const [auth] = useAuth();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !message) {
      toast.error("Title and message are required");
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.post(
        "http://localhost:8083/api/v1/announcement/announcement-create",
        { title, message },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (data.success) {
        toast.success("Announcement sent successfully 📢");
        setTitle("");
        setMessage("");
      } else {
        toast.error("Failed to send announcement");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="container mt-4">
        <ToastContainer position="top-left" autoClose={3000} theme="dark" />
        <div className="card shadow-sm p-4">
          <h3 className="mb-3">📢 Create Hostel Announcement</h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Announcement Title</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter announcement title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Message</label>
              <textarea
                className="form-control"
                rows="5"
                placeholder="Write the announcement message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Announcement"}
            </button>
          </form>
        </div>
      </div>
  );
};

export default Announcement;
