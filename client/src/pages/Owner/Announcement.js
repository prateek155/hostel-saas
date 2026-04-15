import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../../context/auth";

const Announcement = () => {
  const [auth] = useAuth();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ GET ALL ANNOUNCEMENTS
  const getAnnouncements = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:8083/api/v1/announcement/all",
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (data.success) {
        setAnnouncements(data.announcements);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (auth?.token) getAnnouncements();
  }, [auth?.token]);

  // ✅ CREATE / UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !message) {
      toast.error("Title and message are required");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        // ✏️ UPDATE
        const { data } = await axios.put(
          `http://localhost:8083/api/v1/announcement/update/${editingId}`,
          { title, message },
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );

        if (data.success) {
          toast.success("Announcement updated ✏️");
        }
      } else {
        // ➕ CREATE
        const { data } = await axios.post(
          "http://localhost:8083/api/v1/announcement/create",
          { title, message },
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );

        if (data.success) {
          toast.success("Announcement created 📢");
        }
      }

      setTitle("");
      setMessage("");
      setEditingId(null);
      getAnnouncements();

    } catch (error) {
      toast.error(error.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ✅ DELETE
  const handleDelete = async (id) => {
    try {
      const { data } = await axios.delete(
        `http://localhost:8083/api/v1/announcement/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (data.success) {
        toast.success("Deleted successfully ❌");
        getAnnouncements();
      }
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  // ✅ EDIT
  const handleEdit = (a) => {
    setTitle(a.title);
    setMessage(a.message);
    setEditingId(a._id);
  };

  return (
    <div className="container mt-4">
      <ToastContainer position="top-left" autoClose={3000} theme="dark" />

      {/* FORM */}
      <div className="card shadow-sm p-4 mb-4">
        <h3>{editingId ? "✏️ Edit Announcement" : "📢 Create Announcement"}</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Title</label>
            <input
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label>Message</label>
            <textarea
              className="form-control"
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" disabled={loading}>
            {loading
              ? "Processing..."
              : editingId
              ? "Update Announcement"
              : "Create Announcement"}
          </button>
        </form>
      </div>

      {/* LIST */}
      <div className="card shadow-sm p-4">
        <h4>📋 Your Announcements</h4>

        {announcements.length === 0 ? (
          <p>No announcements yet</p>
        ) : (
          announcements.map((a) => (
            <div
              key={a._id}
              className="border p-3 mb-3 rounded"
            >
              <h5>{a.title}</h5>
              <p>{a.message}</p>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-warning btn-sm"
                  onClick={() => handleEdit(a)}
                >
                  Edit
                </button>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(a._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Announcement;