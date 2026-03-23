import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/auth";

const Project = () => {
  const [auth] = useAuth();
  const userId = auth?.user?._id || auth?.user?.studentId;

  // ================= ALL STATES AT TOP =================
  const [data, setData] = useState({
    title: "",
    description: "",
    type: "",
    techStack: "",
    teamSize: "",
    duration: "",
    github: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myProjects, setMyProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingAllProjects, setLoadingAllProjects] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [interestReason, setInterestReason] = useState("");
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [milestoneData, setMilestoneData] = useState({
    title: "",
    description: "",
    dueDate: "",
  });
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  });

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  // ================= CREATE PROJECT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        title: data.title,
        description: data.description,
        type: data.type,
        techStack: data.techStack.split(",").map((tech) => tech.trim()),
        teamSize: Number(data.teamSize),
        duration: data.duration,
        github: data.github,
      };

      const res = await axios.post(
        "http://localhost:8083/api/v1/project/new-project",
        payload,
        {
          headers: {
           Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (res.data) {
        toast.success("Project created successfully! 🎉");
        setData({
          title: "",
          description: "",
          type: "",
          techStack: "",
          teamSize: "",
          duration: "",
          github: "",
        });
        setShowCreateModal(false);
        getMyProjects();
        getAllProjects();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Project creation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================= GET MY PROJECTS =================
  const getMyProjects = async () => {
    try {
      setLoadingProjects(true);
      const res = await axios.get(
        "http://localhost:8083/api/v1/project/my-projects",
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      setMyProjects(res.data);
    } catch (error) {
      toast.error("Unable to fetch your projects");
    } finally {
      setLoadingProjects(false);
    }
  };

  // ================= GET ALL PROJECTS =================
  const getAllProjects = async () => {
    try {
      setLoadingAllProjects(true);
      const res = await axios.get("http://localhost:8083/api/v1/project/all-projects");
      setAllProjects(res.data);
    } catch (error) {
      toast.error("Unable to fetch projects");
    } finally {
      setLoadingAllProjects(false);
    }
  };

  // ================= UPDATE PROJECT =================
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        title: data.title,
        description: data.description,
        type: data.type,
        techStack: data.techStack.split(",").map((tech) => tech.trim()),
        teamSize: Number(data.teamSize),
        duration: data.duration,
        github: data.github,
      };

      const res = await axios.put(
        `http://localhost:8083/api/v1/project/${editingProject._id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (res.data) {
        toast.success("Project updated successfully! ✅");
        setEditingProject(null);
        setShowCreateModal(false);
        setData({
          title: "",
          description: "",
          type: "",
          techStack: "",
          teamSize: "",
          duration: "",
          github: "",
        });
        getMyProjects();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================= DELETE PROJECT =================
  const handleDeleteProject = async (projectId) => {

    try {
      await axios.delete(`http://localhost:8083/api/v1/project/${projectId}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      toast.success("Project deleted successfully");
      getMyProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  // ================= SHOW INTEREST =================
  const handleShowInterest = async () => {
    if (!interestReason.trim()) {
      toast.error("Please provide a reason for your interest");
      return;
    }

    try {
      await axios.post(
        `http://localhost:8083/api/v1/project/${selectedProject._id}/interest`,
        { reason: interestReason },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      toast.success("Interest submitted successfully! 💚");
      setShowInterestModal(false);
      setInterestReason("");
      setSelectedProject(null);
      getAllProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to show interest");
    }
  };

  // ================= ACCEPT STUDENT =================
  const handleAcceptStudent = async (projectId, studentId) => {
    try {
      await axios.put(
        `http://localhost:8083/api/v1/project/${projectId}/accept/${studentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      toast.success("Student accepted! 🎉");
      getMyProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept");
    }
  };

  // ================= REJECT STUDENT =================
  const handleRejectStudent = async (projectId, studentId) => {
    try {
      await axios.put(
        `http://localhost:8083/api/v1/project/${projectId}/reject/${studentId}`,
        {},
        {
          headers: {
           Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      toast.success("Student rejected");
      getMyProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject");
    }
  };

  // ================= CLOSE PROJECT =================
  const handleCloseProject = async (projectId) => {
    try {
      await axios.put(
        `http://localhost:8083/api/v1/project/${projectId}/close`,
        {},
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      toast.success("Project started! 🎉");
      getMyProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to close");
    }
  };

  // ================= ADD MILESTONE =================
  const handleAddMilestone = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `http://localhost:8083/api/v1/project/${selectedProject._id}/milestones`,
        milestoneData,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      toast.success("Milestone added! 📌");
      setShowMilestoneModal(false);
      setMilestoneData({ title: "", description: "", dueDate: "" });
      getMyProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add milestone");
    }
  };

  // ================= ADD TASK =================
  const handleAddTask = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `http://localhost:8083/api/v1/project/${selectedProject._id}/tasks`,
        taskData,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      toast.success("Task added! ✅");
      setShowTaskModal(false);
      setTaskData({ title: "", description: "", priority: "medium", dueDate: "" });
      getMyProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add task");
    }
  };

  // ================= UPDATE TASK STATUS =================
  const handleUpdateTaskStatus = async (projectId, taskId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:8083/api/v1/project/${projectId}/tasks/${taskId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      toast.success("Task updated! ✓");
      getMyProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update task");
    }
  };

  // ================= OPEN EDIT MODAL =================
  const openEditModal = (project) => {
    setEditingProject(project);
    setData({
      title: project.title,
      description: project.description,
      type: project.type,
      techStack: project.techStack.join(", "),
      teamSize: project.teamSize,
      duration: project.duration,
      github: project.github || "",
    });
    setShowCreateModal(true);
  };

  // ================= FILTER PROJECTS =================
  const getFilteredProjects = () => {
    let filtered = [];

    if (activeTab === "all") {
      filtered = allProjects;
    } else if (activeTab === "my-projects") {
      filtered = myProjects;
    } else if (activeTab === "active-teams") {
      filtered = myProjects.filter((p) => p.status === "in-progress");
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.techStack.some((tech) =>
            tech.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    return filtered;
  };

  // ================= USE EFFECTS =================
  useEffect(() => {
    if (auth?.token) {
      getMyProjects();
      getAllProjects();
    }
  }, [auth?.token]);

  const filteredProjects = getFilteredProjects();

  // ================= RENDER =================
  return (

     <>
    <style>{`
    /* ================= PROJECTS PAGE ================= */
.projects-page {
  padding: 2rem 0;
  min-height: 100vh;
  position: relative;
}

/* Animated background */
.bg-decoration {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.bg-decoration::before {
  content: '';
  position: absolute;
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
  top: -200px;
  right: -200px;
  animation: float 20s ease-in-out infinite;
}

.bg-decoration::after {
  content: '';
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%);
  bottom: -100px;
  left: -100px;
  animation: float 15s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(30px, -30px) rotate(120deg); }
  66% { transform: translate(-20px, 20px) rotate(240deg); }
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
}

/* ================= HERO SECTION ================= */
.hero {
  text-align: center;
  margin-bottom: 3rem;
  animation: fadeInUp 0.8s ease-out;
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

.hero h1 {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #6366f1, #22d3ee);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero p {
  font-size: 1.25rem;
  color: #94a3b8;
  max-width: 600px;
  margin: 0 auto;
}

/* ================= TABS ================= */
.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 0.5rem;
  background: #1e293b;
  border-radius: 12px;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.tab {
  flex: 1;
  padding: 0.875rem 1.5rem;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-family: inherit;
}

.tab:hover {
  color: #f1f5f9;
  background: rgba(99, 102, 241, 0.1);
}

.tab.active {
  background: #6366f1;
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

/* ================= ACTION BAR ================= */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  animation: fadeInUp 0.8s ease-out 0.3s both;
}

.search-box {
  flex: 1;
  max-width: 500px;
  position: relative;
}

.search-box input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  color: #f1f5f9;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s;
}

.search-box input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

/* ================= BUTTONS ================= */
.btn {
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #334155;
  color: #f1f5f9;
  border: 1px solid #334155;
}

.btn-secondary:hover {
  background: #1e293b;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
  transform: scale(1.05);
}

.btn-danger {
  background: transparent;
  color: #ef4444;
  border: 1px solid #ef4444;
}

.btn-danger:hover {
  background: #ef4444;
  color: white;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border-radius: 8px;
}

.interest-btn {
  border: 2px solid #6366f1;
  color: #6366f1;
  background: transparent;
}

.interest-btn:hover {
  background: #6366f1;
  color: white;
}

/* ================= PROJECTS GRID ================= */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 2rem;
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.project-card-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.project-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 1.75rem;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.project-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #6366f1, #ec4899);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s;
  border-radius: 16px 16px 0 0;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  border-color: #6366f1;
}

.project-card:hover::before {
  transform: scaleX(1);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.project-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #f1f5f9;
}

.badge-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

/* ================= STATUS BADGES ================= */
.status-badge {
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
}

.status-badge.open {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.status-badge.in-progress {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.status-badge.completed {
  background: rgba(99, 102, 241, 0.15);
  color: #6366f1;
}

.status-badge.closed {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.status-badge.my-project {
  background: linear-gradient(135deg, #6366f1, #ec4899);
  color: white;
}

.status-badge.team-count {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

/* ================= PROJECT TYPE BADGES ================= */
.project-type {
  padding: 0.375rem 0.875rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.project-type.web { background: rgba(99, 102, 241, 0.15); color: #6366f1; }
.project-type.mobile { background: rgba(236, 72, 153, 0.15); color: #ec4899; }
.project-type.ai { background: rgba(34, 211, 238, 0.15); color: #22d3ee; }
.project-type.blockchain { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
.project-type.iot { background: rgba(16, 185, 129, 0.15); color: #10b981; }
.project-type.game { background: rgba(168, 85, 247, 0.15); color: #a855f7; }
.project-type.other { background: rgba(148, 163, 184, 0.15); color: #94a3b8; }

.project-description {
  color: #94a3b8;
  margin-bottom: 1.25rem;
  line-height: 1.7;
}

/* ================= PROJECT META ================= */
.project-meta {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 0.875rem;
}

.meta-item.warning {
  color: #f59e0b;
}

.meta-item svg {
  color: #6366f1;
}

/* ================= TECH STACK ================= */
.tech-stack {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}

.tech-tag {
  padding: 0.375rem 0.75rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #94a3b8;
  font-family: 'JetBrains Mono', monospace;
}

/* ================= PROJECT FOOTER ================= */
.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.25rem;
  border-top: 1px solid #334155;
}

.creator-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #ec4899);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  font-size: 0.875rem;
}

.avatar-lg {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  font-size: 1.5rem;
}

.creator-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #f1f5f9;
}

.project-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* ================= INTERESTED STUDENTS SECTION ================= */
.interested-section {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 1.75rem;
  animation: slideDown 0.4s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.interested-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #334155;
}

.interested-header h4 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: #f1f5f9;
}

.interested-header span {
  color: #94a3b8;
  font-size: 0.875rem;
}

.interested-students-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.interested-student-card {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s;
}

.interested-student-card:hover {
  border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.student-main-info {
  display: flex;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}

.student-details {
  flex: 1;
}

.student-details h5 {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #f1f5f9;
}

.contact-info {
  display: flex;
  gap: 1.5rem;
  color: #94a3b8;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.reason-box {
  background: #334155;
  padding: 1rem;
  border-radius: 8px;
  border-left: 3px solid #6366f1;
  margin-top: 0.75rem;
}

.reason-box strong {
  font-size: 0.875rem;
  display: block;
  margin-bottom: 0.5rem;
  color: #f1f5f9;
}

.reason-box p {
  color: #94a3b8;
  font-size: 0.875rem;
  line-height: 1.6;
  margin: 0;
}

.student-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #334155;
}

/* ================= TASKS SECTION ================= */
.tasks-section {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 1.75rem;
  margin-top: 1.5rem;
}

.tasks-section h4 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #f1f5f9;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-item {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s;
}

.task-item:hover {
  border-color: #6366f1;
}

.task-info {
  flex: 1;
}

.task-info h5 {
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: #f1f5f9;
}

.task-info p {
  color: #94a3b8;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.priority-badge {
  padding: 0.25rem 0.625rem;
  border-radius: 4px;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
}

.priority-badge.high {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.priority-badge.medium {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.priority-badge.low {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.task-status-select {
  padding: 0.5rem 1rem;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  color: #f1f5f9;
  font-size: 0.875rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s;
}

.task-status-select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* ================= MODALS ================= */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: #1e293b;
  border-radius: 20px;
  padding: 2.5rem;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: slideUp 0.4s ease-out;
  border: 1px solid #334155;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.modal-title {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #6366f1, #22d3ee);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 2rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.3s;
}

.close-btn:hover {
  background: #334155;
  color: #f1f5f9;
}

/* ================= FORMS ================= */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #f1f5f9;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.875rem 1rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 10px;
  color: #f1f5f9;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.form-actions button {
  flex: 1;
}

/* ================= LOADING & EMPTY STATES ================= */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.spinner {
  border: 3px solid #334155;
  border-top: 3px solid #6366f1;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #94a3b8;
  grid-column: 1 / -1;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #f1f5f9;
}

/* ================= RESPONSIVE ================= */
@media (max-width: 768px) {
  .hero h1 {
    font-size: 2.5rem;
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .action-bar {
    flex-direction: column;
  }

  .search-box {
    max-width: 100%;
  }

  .tabs {
    flex-direction: column;
  }

  .project-actions {
    width: 100%;
  }

  .project-actions .btn {
    flex: 1;
  }

  .student-actions {
    flex-direction: column;
  }

  .modal-content {
    padding: 1.5rem;
  }

  .modal-title {
    font-size: 1.5rem;
  }
}
    `}</style>
    <div className="projects-page">
      <div className="bg-decoration"></div>

      <div className="container">
        {/* Hero Section */}
        <div className="hero">
          <h1>Student Project Hub</h1>
          <p>Create projects, find teammates, and collaborate together</p>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Projects
          </button>
          <button
            className={`tab ${activeTab === "my-projects" ? "active" : ""}`}
            onClick={() => setActiveTab("my-projects")}
          >
            My Projects
          </button>
          <button
            className={`tab ${activeTab === "active-teams" ? "active" : ""}`}
            onClick={() => setActiveTab("active-teams")}
          >
            Active Teams
          </button>
        </div>

        {/* Action Bar */}
        <div className="action-bar">
          <div className="search-box">
            <svg
              className="search-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Search projects by name, tech stack, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingProject(null);
              setData({
                title: "",
                description: "",
                type: "",
                techStack: "",
                teamSize: "",
                duration: "",
                github: "",
              });
              setShowCreateModal(true);
            }}
          >
            + Create Project
          </button>
        </div>

        {/* Projects Grid */}
        <div className="projects-grid">
          {loadingAllProjects && activeTab === "all" ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : loadingProjects && activeTab !== "all" ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="empty-state">
              <h3>No projects found</h3>
              <p>Be the first to create a project!</p>
            </div>
          ) : (
            filteredProjects.map((project) => {
              const isMyProject =
              project.creator &&
              project.creator._id?.toString() === userId?.toString();


              const pendingInterests =
                project.interestedStudents?.filter(
                  (i) => i.status === "pending"
                ) || [];
              const spotsLeft =
                project.teamSize - (project.selectedMembers?.length || 0) - 1;

              return (
                <div key={project._id} className="project-card-container">
                  {/* Project Card */}
                  <div className="project-card">
                    <div className="project-header">
                      <div>
                        <h3 className="project-title">{project.title}</h3>
                        <div className="badge-group">
                          <span className={`status-badge ${project.status}`}>
                            {project.status.replace("-", " ")}
                          </span>
                          {isMyProject && (
                            <span className="status-badge my-project">
                              MY PROJECT
                            </span>
                          )}
                          {project.status === "in-progress" && (
                            <span className="status-badge team-count">
                              {(project.selectedMembers?.length || 0) + 1}/
                              {project.teamSize} Members
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`project-type ${project.type}`}>
                        {project.type}
                      </span>
                    </div>

                    <p className="project-description">{project.description}</p>

                    <div className="project-meta">
                      <div className="meta-item">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        {project.teamSize} members needed
                      </div>
                      <div className="meta-item">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        {project.duration}
                      </div>
                      {isMyProject && project.status === "open" && (
                        <div className="meta-item warning">
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                          </svg>
                          {spotsLeft} spots left
                        </div>
                      )}
                    </div>

                    <div className="tech-stack">
                      {project.techStack?.map((tech, index) => (
                        <span key={index} className="tech-tag">
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="project-footer">
                      <div className="creator-info">
                        <div className="avatar">
                          {project.creator?.name || "Unknown Creator"
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .substring(0, 2)}
                        </div>
                        <span className="creator-name">
                          {project.creator?.name || "Unknown Creator"}
                        </span>
                      </div>

                      <div className="project-actions">

                        {isMyProject && (
                          <>
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => openEditModal(project)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteProject(project._id)}
                            >
                              Delete
                            </button>
                            {project.status === "open" && (
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleCloseProject(project._id)}
                              >
                                Close Applications
                              </button>
                            )}
                            {project.status === "in-progress" && (
                              <>
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => {
                                    setSelectedProject(project);
                                    setShowMilestoneModal(true);
                                  }}
                                >
                                  Add Milestone
                                </button>
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => {
                                    setSelectedProject(project);
                                    setShowTaskModal(true);
                                  }}
                                >
                                  Add Task
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Interested Students Section */}
                  {isMyProject &&
                    pendingInterests.length > 0 &&
                    project.status === "open" && (
                      <div className="interested-section">
                        <div className="interested-header">
                          <h4>Interested Students ({pendingInterests.length})</h4>
                          <span>Review and select your team members</span>
                        </div>

                        <div className="interested-students-list">
                          {pendingInterests.map((interest) => (
                            <div
                              key={interest.student?._id || interest._id}
                              className="interested-student-card"
                            >
                              <div className="student-main-info">
                                <div className="avatar avatar-lg">
                                  {(interest.student?.name || "U")
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                   .substring(0, 2)}

                                </div>
                                <div className="student-details">
                                  <h5>{interest.student?.name || "Unknown Student"}</h5>
                                  <div className="contact-info">
                                    <span>{interest.student?.email || "N/A"}</span>
                                    <span>{interest.student?.phone || "N/A"}</span>
                                  </div>
                                  <div className="reason-box">
                                    <strong>Why I'm interested:</strong>
                                    <p>{interest.reason}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="student-actions">
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() =>
                                    handleAcceptStudent(
                                      project._id,
                                      interest.student._id
                                    )
                                  }
                                >
                                  Accept
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() =>
                                    handleRejectStudent(
                                      project._id,
                                      interest.student._id
                                    )
                                  }
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Tasks Section for In-Progress Projects */}
                  {isMyProject &&
                    project.status === "in-progress" &&
                    project.tasks &&
                    project.tasks.length > 0 && (
                      <div className="tasks-section">
                        <h4>Project Tasks</h4>
                        <div className="tasks-list">
                          {project.tasks.map((task) => (
                            <div key={task._id} className="task-item">
                              <div className="task-info">
                                <h5>{task.title}</h5>
                                {task.description && <p>{task.description}</p>}
                                <span className={`priority-badge ${task.priority}`}>
                                  {task.priority}
                                </span>
                              </div>
                              <select
                                value={task.status}
                                onChange={(e) =>
                                  handleUpdateTaskStatus(
                                    project._id,
                                    task._id,
                                    e.target.value
                                  )
                                }
                                className="task-status-select"
                              >
                                <option value="todo">To Do</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create/Edit Project Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingProject ? "Edit Project" : "Create New Project"}
              </h2>
              <button
                className="close-btn"
                onClick={() => setShowCreateModal(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={editingProject ? handleUpdateProject : handleSubmit}>
              <div className="form-group">
                <label className="form-label">Project Name *</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  placeholder="Enter project name"
                  value={data.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Project Type *</label>
                  <select
                    name="type"
                    className="form-select"
                    value={data.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select type</option>
                    <option value="web">Web Development</option>
                    <option value="mobile">Mobile App</option>
                    <option value="ai">AI/ML</option>
                    <option value="blockchain">Blockchain</option>
                    <option value="iot">IoT</option>
                    <option value="game">Game Development</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Team Size Needed *</label>
                  <input
                    type="number"
                    name="teamSize"
                    className="form-input"
                    placeholder="e.g., 3"
                    min="1"
                    max="10"
                    value={data.teamSize}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  name="description"
                  className="form-textarea"
                  placeholder="Describe your project idea, goals, and what kind of team members you're looking for..."
                  value={data.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">GitHub Repository</label>
                  <input
                    type="url"
                    name="github"
                    className="form-input"
                    placeholder="https://github.com/username/repo"
                    value={data.github}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration *</label>
                  <input
                    type="text"
                    name="duration"
                    className="form-input"
                    placeholder="e.g., 8 weeks"
                    value={data.duration}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Tech Stack * (comma separated)
                </label>
                <input
                  type="text"
                  name="techStack"
                  className="form-input"
                  placeholder="React, Node.js, MongoDB"
                  value={data.techStack}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingProject
                    ? "Update Project"
                    : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Show Interest Modal */}
      {showInterestModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowInterestModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Show Interest</h2>
              <button
                className="close-btn"
                onClick={() => setShowInterestModal(false)}
              >
                &times;
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">
                Why are you interested in this project? *
              </label>
              <textarea
                className="form-textarea"
                placeholder="Tell the project creator why you want to join and what you can contribute..."
                value={interestReason}
                onChange={(e) => setInterestReason(e.target.value)}
                rows="5"
              />
            </div>

            <div className="form-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowInterestModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleShowInterest}>
                Submit Interest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      {showMilestoneModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowMilestoneModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add Milestone</h2>
              <button
                className="close-btn"
                onClick={() => setShowMilestoneModal(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddMilestone}>
              <div className="form-group">
                <label className="form-label">Milestone Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter milestone title"
                  value={milestoneData.title}
                  onChange={(e) =>
                    setMilestoneData({ ...milestoneData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe the milestone..."
                  value={milestoneData.description}
                  onChange={(e) =>
                    setMilestoneData({
                      ...milestoneData,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={milestoneData.dueDate}
                  onChange={(e) =>
                    setMilestoneData({ ...milestoneData, dueDate: e.target.value })
                  }
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowMilestoneModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add Task</h2>
              <button
                className="close-btn"
                onClick={() => setShowTaskModal(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddTask}>
              <div className="form-group">
                <label className="form-label">Task Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter task title"
                  value={taskData.title}
                  onChange={(e) =>
                    setTaskData({ ...taskData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe the task..."
                  value={taskData.description}
                  onChange={(e) =>
                    setTaskData({ ...taskData, description: e.target.value })
                  }
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={taskData.priority}
                    onChange={(e) =>
                      setTaskData({ ...taskData, priority: e.target.value })
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={taskData.dueDate}
                    onChange={(e) =>
                      setTaskData({ ...taskData, dueDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowTaskModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
   </> 
  );
};

export default Project;