import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/auth";
import { toast } from "react-toastify";

const DailyMenu = () => {
  const [auth] = useAuth();
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= TODAY ================= */
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });

  const MEALS = ["breakfast", "lunch", "dinner"];

  /* ================= LOAD MENU ================= */
  const loadMenu = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://hostelwers.onrender.com/api/v1/mess/menu",
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (res.data.menu?.menu) {
        setMenuData(res.data.menu.menu);
      } else {
        toast.info("Menu not available");
      }
    } catch (error) {
      toast.error("Failed to load mess menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const getMealIcon = (meal) => {
    if (meal === "breakfast") return "☕";
    if (meal === "lunch") return "🍛";
    return "🌙";
  };

  if (loading || !menuData) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>Loading today's menu...</div>
      </div>
    );
  }

  const todayMenu = menuData[today];

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🍽️ Today’s Mess Menu</h1>
        <h2 style={styles.day}>{today}</h2>

        {MEALS.map((meal) => (
          <div key={meal} style={styles.mealRow}>
            <div style={styles.mealLabel}>
              <span style={styles.icon}>{getMealIcon(meal)}</span>
              <strong>{capitalize(meal)}</strong>
            </div>

            <div style={styles.mealItems}>
              {todayMenu?.[meal]?.length > 0 ? (
                todayMenu[meal].join(", ")
              ) : (
                <span style={styles.notServed}>Not served</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ================= STYLES ================= */

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    backgroundColor: "white",
    width: "100%",
    maxWidth: "500px",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: "26px",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "6px",
  },
  day: {
    textAlign: "center",
    color: "#f97316",
    marginBottom: "24px",
    fontSize: "20px",
  },
  mealRow: {
    marginBottom: "18px",
    paddingBottom: "14px",
    borderBottom: "1px solid #eee",
  },
  mealLabel: {
    display: "flex",
    gap: "8px",
    marginBottom: "6px",
    fontSize: "15px",
  },
  icon: {
    fontSize: "18px",
  },
  mealItems: {
    fontSize: "14px",
    color: "#6b7280",
    paddingLeft: "26px",
  },
  notServed: {
    fontStyle: "italic",
    color: "#9ca3af",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
  },
  loadingText: {
    fontSize: "18px",
    color: "#6b7280",
  },
};

export default DailyMenu;
