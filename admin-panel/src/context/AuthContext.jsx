import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [id, setId] = useState(null);
  const [name, setName] = useState(null);
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setId(null);
    setName(null);
    setRole(null);
    setPermissions([]);
  };

  const login = (jwtToken) => {
    localStorage.setItem("token", jwtToken);
    setToken(jwtToken);
    const decoded = jwtDecode(jwtToken);
    setId(decoded.id);
    setName(decoded.name);
    setRole(decoded.role);
    setPermissions(decoded.permissions || []);
  };

  const isTokenExpired = (jwtToken) => {
    try {
      const decoded = jwtDecode(jwtToken);
      if (!decoded.exp) return false;
      return Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      if (isTokenExpired(storedToken)) {
        logout();
        setLoading(false);
      } else {
        setToken(storedToken);
        const decoded = jwtDecode(storedToken);
        setId(decoded.id);
        setName(decoded.name);
        setRole(decoded.role);
        setPermissions(decoded.permissions || []);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    const decoded = jwtDecode(token);
    if (decoded.exp) {
      const expiryTime = decoded.exp * 1000 - Date.now();
      const timer = setTimeout(() => {
        logout();
      }, expiryTime);

      return () => clearTimeout(timer);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, id, name, role, permissions, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);