import { useState, useEffect, useContext, createContext } from "react";
import axios from "axios";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    token: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = localStorage.getItem("auth");

    if (data) {
      let parsed = null;

      // ✅ SAFE JSON.parse
      try {
        parsed = JSON.parse(data);
      } catch (err) {
        console.error("Invalid auth data in localStorage");
        localStorage.removeItem("auth"); // optional cleanup
      }

      if (parsed) {
        setAuth({
          user: parsed.user,
          token: parsed.token,
        });

        axios.defaults.headers.common["Authorization"] =
          `Bearer ${parsed.token}`;
      }
    }

    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={[auth, setAuth, loading]}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { useAuth, AuthProvider };