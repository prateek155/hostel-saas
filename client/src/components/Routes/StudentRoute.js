import { useEffect, useState } from "react";
import { useAuth } from "../../context/auth";
import { Outlet, Navigate } from "react-router-dom";
import axios from "axios";
import Spinner from "../Spinner";

export default function StudentRoute() {
  const [auth, , loading] = useAuth();
  const [ok, setOk] = useState(null);

  useEffect(() => {
    if (loading) return; // ⏳ WAIT

    if (!auth?.token || auth?.user?.role !== "student") {
      setOk(false);
      return;
    }

    const authCheck = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8083/api/v1/auth/student-auth",
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );

        setOk(res.data.success === true);
      } catch (error) {
        console.error("Student auth error:", error);
        setOk(false);
      }
    };

    authCheck();
  }, [auth, loading]);

  if (loading || ok === null) return <Spinner />;

  if (!ok) return <Navigate to="/login" />;

  return <Outlet />;
}
