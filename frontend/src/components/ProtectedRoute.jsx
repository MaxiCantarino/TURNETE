import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, requireDueno = false, requireSuperAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-12 h-12" />
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;

  // Si requiere superadmin y no lo es
  if (requireSuperAdmin && user.tipo !== "superadmin") {
    return <Navigate to="/admin/login" replace />;
  }

  // Si es superadmin intentando acceder a rutas de admin normal
  if (!requireSuperAdmin && user.tipo === "superadmin") {
    return <Navigate to="/superadmin" replace />;
  }

  // Si la ruta requiere ser dueño y no lo es
  if (requireDueno && !user.es_dueno) {
    return <Navigate to="/profesional/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
