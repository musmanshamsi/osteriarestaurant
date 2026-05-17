import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { findUserByCredentials, registerUser } from "@/lib/store";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("osteria_user");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setUser(u);
        setIsAdmin(u.role === "admin");
      } catch (err) {
        console.error("Failed to parse saved user", err);
        localStorage.removeItem("osteria_user");
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email, password) => {
    const u = await findUserByCredentials(email, password);
    if (!u) throw new Error("Invalid email or password");
    
    setUser(u);
    setIsAdmin(u.role === "admin");
    localStorage.setItem("osteria_user", JSON.stringify(u));
    return u;
  };

  const signUp = async (email, password, name) => {
    const u = await registerUser({ email, password, name });
    setUser(u);
    setIsAdmin(u.role === "admin");
    localStorage.setItem("osteria_user", JSON.stringify(u));
    return u;
  };

  const signOut = async () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem("osteria_user");
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
