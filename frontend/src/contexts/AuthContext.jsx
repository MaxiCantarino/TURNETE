import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay sesión guardada al cargar
  useEffect(() => {
    const savedUser = localStorage.getItem("turnete_admin");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // TODO: Más adelante esto será con API y BD
    // Por ahora hardcodeamos usuario de prueba
    if (email === "admin@salon.com" && password === "admin123") {
      const userData = {
        email: "admin@salon.com",
        nombre: "Administrador",
        role: "admin",
        businessId: 1,
      };
      setUser(userData);
      localStorage.setItem("turnete_admin", JSON.stringify(userData));
      return { success: true };
    } else {
      return { success: false, error: "Credenciales incorrectas" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("turnete_admin");
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
