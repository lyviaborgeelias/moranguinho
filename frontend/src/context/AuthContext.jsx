import { createContext, useContext, useState } from "react";
import { getUser, updateUser } from "../services/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser() || { name: "Explorador", email: "" });
  function logout() {}
  function syncUser(nextUser) {
    updateUser(nextUser);
    setUser(nextUser);
  }
  return (
    <AuthContext.Provider value={{ user, loading: false, login: syncUser, logout, updateUser: syncUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
