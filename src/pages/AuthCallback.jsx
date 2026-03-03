import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROUTES = {
  login: "/login",
  update: "/update",
  dashboard: "/dashboard",
};

export default function AuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const token = params.get("token");
      const profileCompleted = params.get("profileCompleted");

      if (!token) {
        navigate(ROUTES.login);
        return;
      }

      localStorage.setItem("token", token);
      const user = await checkAuth();

      if (!user) {
        navigate(ROUTES.login);
        return;
      }

      const nextPath =
        profileCompleted === "false" ? ROUTES.update : ROUTES.dashboard;
      navigate(nextPath);
    };

    handleAuthCallback();
  }, [checkAuth, navigate, params]);

  return <p>กำลังเข้าสู่ระบบ...</p>;
}
