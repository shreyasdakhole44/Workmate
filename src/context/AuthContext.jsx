import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../api/endpoints";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("wm_user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res  = await authAPI.login({ email, password });
    const data = res.data.data;
    localStorage.setItem("wm_token", data.token);
    localStorage.setItem("wm_user",  JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const isAdmin = () => user?.role === "ADMIN";
  const isHR    = () => ["ADMIN","HR_MANAGER"].includes(user?.role);

  return (
    <Ctx.Provider value={{ user, loading, login, logout, isAdmin, isHR }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
