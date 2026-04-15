import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useAuth } from "../context/auth";

export const ThemeContext = createContext();

const THEME_COLORS = {
  blue: "#4f8ef7",
  green: "#10b981",
  purple: "#8b5cf6",
  orange: "#f59e0b",
};

export const ThemeProvider = ({ children }) => {
  const [auth] = useAuth();

  const [ownerTheme, setOwnerTheme] = useState(
    localStorage.getItem("ownerTheme") || "blue"
  );

  const [studentTheme, setStudentTheme] = useState(
    localStorage.getItem("studentTheme") || "blue"
  );

  // 🔥 Fetch themes (with token safety)
  const fetchThemes = async () => {
    try {
      // ✅ Prevent API call if token not ready
      if (!auth?.token) return;

      const { data } = await axios.get(
        "http://localhost:8083/api/v1/settings",
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (data.success && data.data) {
        const ot = data.data.ownerTheme || "blue";
        const st = data.data.studentTheme || "blue";

        setOwnerTheme(ot);
        setStudentTheme(st);

        localStorage.setItem("ownerTheme", ot);
        localStorage.setItem("studentTheme", st);
      }
    } catch (err) {
      console.error("Theme fetch error:", err.response?.data || err.message);
    }
  };

  // 🔥 Run ONLY when token is available
  useEffect(() => {
    if (auth?.token) {
      fetchThemes();
    }
  }, [auth?.token]);

  // 🔥 Optional: set global axios token (best practice)
  useEffect(() => {
    if (auth?.token) {
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${auth.token}`;
    }
  }, [auth?.token]);

  return (
    <ThemeContext.Provider
      value={{
        ownerTheme,
        studentTheme,
        ownerColor: THEME_COLORS[ownerTheme] || THEME_COLORS.blue,
        studentColor: THEME_COLORS[studentTheme] || THEME_COLORS.blue,
        THEME_COLORS,
        refreshTheme: fetchThemes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);