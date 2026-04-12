import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

export const ThemeContext = createContext();

const THEME_COLORS = {
  blue:   "#4f8ef7",
  green:  "#10b981",
  purple: "#8b5cf6",
  orange: "#f59e0b",
};

export const ThemeProvider = ({ children }) => {
  const [ownerTheme,   setOwnerTheme]   = useState(localStorage.getItem("ownerTheme")   || "blue");
  const [studentTheme, setStudentTheme] = useState(localStorage.getItem("studentTheme") || "blue");

  const fetchThemes = async () => {
    try {
      const { data } = await axios.get("http://localhost:8083/api/v1/settings");
      if (data.success && data.data) {
        const ot = data.data.ownerTheme   || "blue";
        const st = data.data.studentTheme || "blue";
        setOwnerTheme(ot);
        setStudentTheme(st);
        localStorage.setItem("ownerTheme",   ot);
        localStorage.setItem("studentTheme", st);
      }
    } catch (err) {
      // fallback to localStorage values already in state
    }
  };

  useEffect(() => { fetchThemes(); }, []);

  return (
    <ThemeContext.Provider value={{
      ownerTheme,
      studentTheme,
      ownerColor:   THEME_COLORS[ownerTheme]   || THEME_COLORS.blue,
      studentColor: THEME_COLORS[studentTheme] || THEME_COLORS.blue,
      THEME_COLORS,
      refreshTheme: fetchThemes,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);