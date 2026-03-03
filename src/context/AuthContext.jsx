import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../service/authService";

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    console.log("🔐 CHECK AUTH TOKEN:", token);

    if (!token) {
      setLoading(false);
      setUser(null);
      return null;
    }

    try {
      const data = await authAPI.getCurrentUser();
      console.log("CHECK AUTH DATA:", data);

      setUser(data.user);
      setLoading(false);
      return data.user;
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
      setUser(null);
      setLoading(false);
      return null;
    }
  };

  /* -----------------------------
     🔐 ตรวจสอบ token ตอนเปิดแอป
  ------------------------------*/
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkAuth();
  }, []);

  /* -----------------------------
     🔑 Login (email / password)
  ------------------------------*/
  const login = async (email, password) => {
    const data = await authAPI.login(email, password);
    setUser(data.user);
    return data;
  };

  /* -----------------------------
     📝 Register
  ------------------------------*/
  const register = async (userData) => {
    return await authAPI.register(userData);
  };

  /* -----------------------------
     🚪 Logout
  ------------------------------*/
  const logout = async () => {
    await authAPI.logout();
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    register,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
