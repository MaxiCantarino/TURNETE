import React, { createContext, useState, useContext, useEffect } from "react";

const ClienteContext = createContext();

export const useCliente = () => {
  const context = useContext(ClienteContext);
  if (!context) {
    throw new Error("useCliente debe usarse dentro de ClienteProvider");
  }
  return context;
};

export const ClienteProvider = ({ children }) => {
  const [cliente, setCliente] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Cargar cliente desde localStorage al iniciar
  useEffect(() => {
    const clienteGuardado = localStorage.getItem("cliente");
    if (clienteGuardado) {
      const clienteData = JSON.parse(clienteGuardado);
      setCliente(clienteData);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (clienteData) => {
    setCliente(clienteData);
    setIsAuthenticated(true);
    localStorage.setItem("cliente", JSON.stringify(clienteData));
  };

  const logout = () => {
    setCliente(null);
    setIsAuthenticated(false);
    localStorage.removeItem("cliente");
  };

  const updateCliente = (clienteData) => {
    setCliente(clienteData);
    localStorage.setItem("cliente", JSON.stringify(clienteData));
  };

  const value = {
    cliente,
    isAuthenticated,
    login,
    logout,
    updateCliente,
  };

  return (
    <ClienteContext.Provider value={value}>{children}</ClienteContext.Provider>
  );
};

export default ClienteContext;
