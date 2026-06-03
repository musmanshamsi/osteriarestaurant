import { createContext, useContext, useEffect, useState } from "react";
import { findUserByCredentials, registerUser } from "@/lib/store";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount (only the user object, DB is source of truth)
  useEffect(() => {
    const saved = localStorage.getItem("osteria_session");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        setUser(u);
        setIsAdmin(u.role === "admin");
      } catch {
        localStorage.removeItem("osteria_session");
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email, password) => {
    // Calls POST /api/auth/login → validates against SQLite users table
    const u = await findUserByCredentials(email, password);
    if (!u) throw new Error("Invalid email or password");
    setUser(u);
    setIsAdmin(u.role === "admin");
    localStorage.setItem("osteria_session", JSON.stringify(u));
    return u;
  };

  const signUp = async (email, password, name) => {
    // Calls POST /api/auth/register → inserts into SQLite users table
    const u = await registerUser({ email, password, name });
    setUser(u);
    setIsAdmin(u.role === "admin");
    localStorage.setItem("osteria_session", JSON.stringify(u));
    return u;
  };

  const signOut = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem("osteria_session");
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
