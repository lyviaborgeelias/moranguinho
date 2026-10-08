import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { clearAuth, getUser, isAuthenticated, saveAuth, updateUser } from "../services/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getUser);
  const [loading, setLoading] = useState(isAuthenticated);
  useEffect(() => {
    let active = true;
    const sync = () => setUser(getUser());
    window.addEventListener("auth-change", sync);
    if (isAuthenticated()) {
      api
        .get("/me/")
        .then(({ data }) => {
          if (active) updateUser(data.user);
        })
        .catch(() => {
          if (active) setUser(getUser());
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }
    return () => {
      active = false;
      window.removeEventListener("auth-change", sync);
    };
  }, []);

  function login(data, remember) {
    saveAuth(data.access, data.refresh, data.user, remember);
    setUser(data.user);
  }
  function logout() {
    clearAuth();
    setUser(null);
  }
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
