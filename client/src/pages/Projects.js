import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../context/auth";

const Projects = () => {
  const [auth] = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "web", label: "Web Development" },
    { value: "mobile", label: "Mobile Development" },
    { value: "ai", label: "AI/ML" },
    { value: "blockchain", label: "Blockchain" },
    { value: "iot", label: "IoT" },
    { value: "game", label: "Game Development" },
    { value: "other", label: "Other" },
  ];

  /* ================= GET ALL PROJECTS ================= */
  const getAllProjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:8083/api/v1/project/all-projects"
      );
      setProjects(res.data);
    } catch (error) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SHOW INTEREST ================= */
  const handleShowInterest = async (projectId) => {
    const reason = prompt("Why do you want to join this project?");

    if (!reason || !reason.trim()) {
      toast.error("Interest reason is required");
      return;
    }

    try {
      await axios.post(
        `http://localhost:8083/api/v1/project/${projectId}/interest`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      toast.success("Interest sent successfully 💚");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send interest");
    }
  };

  /* ================= USE EFFECT ================= */
  useEffect(() => {
    getAllProjects();
  }, []);

  /* ================= FILTER ================= */
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.techStack.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" || p.type === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  /* ================= CLEAR FILTERS ================= */
  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
  };

  /* ================= INLINE STYLES ================= */
  const styles = {
    container: {
      width: "100%",
      padding: "clamp(1rem, 3vw, 3rem) clamp(1rem, 4vw, 4rem)",
      background: "linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%)",
      minHeight: "100vh",
    },
    header: {
      textAlign: "center",
      marginBottom: "clamp(2rem, 4vw, 3rem)",
    },
    title: {
      fontSize: "clamp(1.75rem, 5vw, 3rem)",
      fontWeight: "700",
      color: "#1a202c",
      marginBottom: "0.5rem",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    },
    subtitle: {
      fontSize: "clamp(0.9rem, 2vw, 1.15rem)",
      color: "#64748b",
      fontWeight: "400",
    },
    filterSection: {
      display: "flex",
      gap: "clamp(0.75rem, 2vw, 1rem)",
      marginBottom: "clamp(1.5rem, 3vw, 2rem)",
      flexWrap: "wrap",
      alignItems: "center",
      background: "white",
      padding: "clamp(1rem, 2.5vw, 1.5rem)",
      borderRadius: "12px",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    },
    searchWrapper: {
      position: "relative",
      flex: "1 1 300px",
      minWidth: "200px",
    },
    searchInput: {
      width: "100%",
      padding: "clamp(10px, 2vw, 12px) clamp(40px, 8vw, 45px) clamp(10px, 2vw, 12px) clamp(14px, 3vw, 16px)",
      border: "2px solid #e2e8f0",
      borderRadius: "10px",
      fontSize: "clamp(0.9rem, 2vw, 1rem)",
      outline: "none",
      background: "#f8fafc",
      transition: "all 0.3s ease",
    },
    searchIcon: {
      position: "absolute",
      right: "16px",
      top: "50%",
      transform: "translateY(-50%)",
      fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
      pointerEvents: "none",
    },
    categoryWrapper: {
      flex: "0 1 220px",
      minWidth: "180px",
    },
    categorySelect: {
      width: "100%",
      padding: "clamp(10px, 2vw, 12px) clamp(35px, 7vw, 40px) clamp(10px, 2vw, 12px) clamp(14px, 3vw, 16px)",
      border: "2px solid #e2e8f0",
      borderRadius: "10px",
      fontSize: "clamp(0.9rem, 2vw, 1rem)",
      background: "#f8fafc",
      cursor: "pointer",
      outline: "none",
      appearance: "none",
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23667eea' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 16px center",
      transition: "all 0.3s ease",
    },
    clearBtn: {
      padding: "clamp(10px, 2vw, 12px) clamp(18px, 4vw, 24px)",
      background: "#ef4444",
      color: "white",
      border: "none",
      borderRadius: "10px",
      fontWeight: "600",
      cursor: "pointer",
      whiteSpace: "nowrap",
      fontSize: "clamp(0.9rem, 2vw, 1rem)",
      transition: "all 0.3s ease",
      flex: "0 0 auto",
    },
    resultsCount: {
      fontSize: "clamp(0.9rem, 2vw, 0.95rem)",
      color: "#64748b",
      marginBottom: "1.5rem",
      fontWeight: "500",
    },
    loadingState: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "clamp(3rem, 6vw, 4rem) 2rem",
      gap: "1rem",
    },
    spinner: {
      width: "clamp(40px, 8vw, 50px)",
      height: "clamp(40px, 8vw, 50px)",
      border: "4px solid #e2e8f0",
      borderTopColor: "#667eea",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
    emptyState: {
      textAlign: "center",
      padding: "clamp(3rem, 6vw, 4rem) 2rem",
      background: "white",
      borderRadius: "12px",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    },
    emptyIcon: {
      fontSize: "clamp(3rem, 6vw, 4rem)",
      marginBottom: "1rem",
    },
    projectsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
      gap: "clamp(1rem, 2vw, 2rem)",
      width: "100%",
    },
    projectCard: {
      background: "white",
      borderRadius: "12px",
      padding: "clamp(1.25rem, 3vw, 1.5rem)",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
      transition: "all 0.3s ease",
      display: "flex",
      flexDirection: "column",
      border: "1px solid #e2e8f0",
    },
    cardHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1rem",
      gap: "0.5rem",
      flexWrap: "wrap",
    },
    statusBadge: {
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "clamp(0.8rem, 1.8vw, 0.85rem)",
      fontWeight: "600",
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
    },
    statusBadgeOpen: {
      background: "#d1fae5",
      color: "#065f46",
    },
    statusBadgeClosed: {
      background: "#fee2e2",
      color: "#991b1b",
    },
    typeBadge: {
      padding: "6px 12px",
      background: "#e0e7ff",
      color: "#4338ca",
      borderRadius: "20px",
      fontSize: "clamp(0.8rem, 1.8vw, 0.85rem)",
      fontWeight: "600",
      textTransform: "capitalize",
    },
    projectTitle: {
      fontSize: "clamp(1.25rem, 3vw, 1.4rem)",
      fontWeight: "700",
      color: "#1a202c",
      marginBottom: "0.75rem",
      lineHeight: "1.3",
    },
    projectDescription: {
      color: "#475569",
      fontSize: "clamp(0.9rem, 2vw, 0.95rem)",
      lineHeight: "1.6",
      marginBottom: "1rem",
      flexGrow: "1",
    },
    projectDetails: {
      display: "flex",
      gap: "clamp(1rem, 3vw, 1.5rem)",
      marginBottom: "1rem",
      padding: "0.75rem 0",
      borderTop: "1px solid #f1f5f9",
      borderBottom: "1px solid #f1f5f9",
      flexWrap: "wrap",
    },
    detailItem: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      fontSize: "clamp(0.85rem, 2vw, 0.9rem)",
      color: "#64748b",
    },
    detailIcon: {
      fontSize: "clamp(1rem, 2.2vw, 1.1rem)",
    },
    detailText: {
      fontWeight: "500",
    },
    techStack: {
      display: "flex",
      flexWrap: "wrap",
      gap: "0.5rem",
      marginBottom: "1.25rem",
    },
    techTag: {
      padding: "6px 12px",
      background: "#f0f9ff",
      color: "#0369a1",
      borderRadius: "6px",
      fontSize: "clamp(0.75rem, 1.8vw, 0.8rem)",
      fontWeight: "600",
      border: "1px solid #bae6fd",
    },
    cardFooter: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "1rem",
      marginTop: "auto",
      paddingTop: "1rem",
      borderTop: "1px solid #f1f5f9",
      flexWrap: "wrap",
    },
    creatorInfo: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
    },
    creatorAvatar: {
      width: "clamp(32px, 6vw, 36px)",
      height: "clamp(32px, 6vw, 36px)",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "700",
      fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
    },
    creatorName: {
      fontSize: "clamp(0.85rem, 2vw, 0.9rem)",
      color: "#475569",
      fontWeight: "600",
    },
    interestBtn: {
      padding: "clamp(10px, 2.5vw, 12px) clamp(16px, 4vw, 20px)",
      minHeight: "44px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      fontSize: "clamp(0.85rem, 2vw, 0.9rem)",
    },
    creatorBadge: {
      padding: "clamp(8px, 2vw, 10px) clamp(14px, 3.5vw, 16px)",
      background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
      color: "white",
      borderRadius: "8px",
      fontSize: "clamp(0.8rem, 1.8vw, 0.85rem)",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
  };

  /* ================= RENDER ================= */
  return (
    <>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .project-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
          border-color: #667eea;
        }
        
        .search-input:focus {
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .category-select:focus {
          border-color: #667eea;
          background-color: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .clear-btn:hover {
          background: #dc2626;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }
        
        .interest-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }
        
        .interest-btn:active {
          transform: translateY(0);
        }

        /* ===== MOBILE PORTRAIT (< 576px) ===== */
        @media (max-width: 575px) {
          .filter-section {
            flex-direction: column !important;
            gap: 0.75rem !important;
          }
          
          .search-wrapper,
          .category-wrapper,
          .clear-btn {
            width: 100% !important;
            flex: 1 1 100% !important;
            min-width: 100% !important;
          }
          
          .projects-grid {
            grid-template-columns: 1fr !important;
          }
          
          .card-footer {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.75rem !important;
          }
          
          .interest-btn,
          .creator-badge {
            width: 100% !important;
            justify-content: center !important;
          }
          
          .project-details {
            gap: 0.75rem !important;
          }
        }

        /* ===== MOBILE LANDSCAPE / SMALL TABLET (576px - 767px) ===== */
        @media (min-width: 576px) and (max-width: 767px) {
          .projects-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
          }
          
          .filter-section {
            gap: 1rem !important;
          }
          
          .search-wrapper {
            flex: 1 1 55% !important;
          }
          
          .category-wrapper {
            flex: 1 1 35% !important;
          }
        }

        /* ===== TABLET PORTRAIT (768px - 991px) ===== */
        @media (min-width: 768px) and (max-width: 991px) {
          .projects-grid {
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)) !important;
            gap: 1.5rem !important;
          }
          
          .filter-section {
            flex-wrap: nowrap !important;
          }
          
          .search-wrapper {
            flex: 1 1 50% !important;
          }
          
          .category-wrapper {
            flex: 0 1 35% !important;
          }
          
          .clear-btn {
            flex: 0 0 auto !important;
            width: auto !important;
          }
        }

        /* ===== TABLET LANDSCAPE / SMALL DESKTOP (992px - 1399px) ===== */
        @media (min-width: 992px) and (max-width: 1399px) {
          .projects-grid {
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)) !important;
            gap: 1.75rem !important;
          }
        }

        /* ===== DESKTOP (1400px - 1799px) ===== */
        @media (min-width: 1400px) and (max-width: 1799px) {
          .projects-grid {
            grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)) !important;
            gap: 2rem !important;
          }
        }

        /* ===== LARGE DESKTOP (1800px - 2399px) ===== */
        @media (min-width: 1800px) and (max-width: 2399px) {
          .projects-grid {
            grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)) !important;
            gap: 2.25rem !important;
          }
        }

        /* ===== EXTRA LARGE DESKTOP (>= 2400px) ===== */
        @media (min-width: 2400px) {
          .projects-grid {
            grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)) !important;
            gap: 2.5rem !important;
          }
        }

        /* ===== LANDSCAPE ORIENTATION ===== */
        @media (orientation: landscape) and (max-height: 600px) {
          .projects-container {
            padding: 1.5rem clamp(1rem, 3vw, 2.5rem) !important;
          }
          
          .header {
            margin-bottom: 1.5rem !important;
          }
          
          .projects-title {
            font-size: clamp(1.5rem, 4vw, 2rem) !important;
          }
          
          .filter-section {
            padding: 1rem !important;
          }
        }

        /* ===== VERY SMALL SCREENS ===== */
        @media (max-width: 360px) {
          .project-details {
            flex-direction: column !important;
            gap: 0.5rem !important;
          }
          
          .tech-stack {
            gap: 0.4rem !important;
          }
          
          .card-header {
            gap: 0.4rem !important;
          }
        }

        /* ===== PRINT STYLES ===== */
        @media print {
          .filter-section,
          .interest-btn,
          .clear-btn {
            display: none !important;
          }
          
          .projects-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          
          .project-card {
            break-inside: avoid !important;
          }
        }

        /* ===== HIGH DPI SCREENS ===== */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .project-card {
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1) !important;
          }
        }

        /* ===== ACCESSIBILITY - REDUCED MOTION ===== */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div style={styles.container} className="projects-container">
        <ToastContainer position="top-left" autoClose={3000} theme="dark" />
        <div style={styles.header}>
          <h1 style={styles.title} className="projects-title">
            Discover Student Projects
          </h1>
          <p style={styles.subtitle} className="projects-subtitle">
            Explore innovative projects and collaborate with fellow students
          </p>
        </div>

        {/* FILTER SECTION */}
        <div style={styles.filterSection} className="filter-section">
          <div style={styles.searchWrapper} className="search-wrapper">
            <input
              type="text"
              placeholder="Search by title, description, or technology..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
              className="search-input"
            />
            <span style={styles.searchIcon}>🔍</span>
          </div>

          <div style={styles.categoryWrapper} className="category-wrapper">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={styles.categorySelect}
              className="category-select"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {(search || selectedCategory !== "all") && (
            <button onClick={clearFilters} style={styles.clearBtn} className="clear-btn">
              Clear Filters
            </button>
          )}
        </div>

        {/* RESULTS COUNT */}
        {!loading && (
          <div style={styles.resultsCount}>
            {filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""} found
          </div>
        )}

        {/* PROJECTS GRID */}
        {loading ? (
          <div style={styles.loadingState}>
            <div style={styles.spinner}></div>
            <p>Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📂</div>
            <h3>No projects found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div style={styles.projectsGrid} className="projects-grid">
            {filteredProjects.map((project) => {
              const isCreator = project.creator?._id === auth?.user?.studentId;
              const isOpen = project.status === "open";

              return (
                <div key={project._id} style={styles.projectCard} className="project-card">
                  <div style={styles.cardHeader}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        ...(project.status === "open"
                          ? styles.statusBadgeOpen
                          : styles.statusBadgeClosed),
                      }}
                    >
                      {project.status === "open" ? "🟢 Open" : "🔴 Closed"}
                    </span>
                    <span style={styles.typeBadge}>{project.type}</span>
                  </div>

                  <h3 style={styles.projectTitle}>{project.title}</h3>
                  <p style={styles.projectDescription}>{project.description}</p>

                  <div style={styles.projectDetails} className="project-details">
                    <div style={styles.detailItem}>
                      <span style={styles.detailIcon}>⏱️</span>
                      <span style={styles.detailText}>{project.duration}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailIcon}>👥</span>
                      <span style={styles.detailText}>{project.teamSize} members</span>
                    </div>
                  </div>

                  <div style={styles.techStack}>
                    {project.techStack.map((tech, index) => (
                      <span key={index} style={styles.techTag}>
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div style={styles.cardFooter} className="card-footer">
                    <div style={styles.creatorInfo}>
                      <span style={styles.creatorAvatar}>
                        {project.creator?.name?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                      <span style={styles.creatorName}>
                        {project.creator?.name || "Unknown"}
                      </span>
                    </div>

                    {auth?.token && isOpen && !isCreator && (
                      <button
                        onClick={() => handleShowInterest(project._id)}
                        style={styles.interestBtn}
                        className="interest-btn"
                      >
                        <span>✨</span>
                        Show Interest
                      </button>
                    )}

                    {isCreator && (
                      <div style={styles.creatorBadge} className="creator-badge">
                        <span>👑</span>
                        Your Project
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Projects;