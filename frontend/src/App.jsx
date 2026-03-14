import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ClienteProvider } from "./contexts/ClienteContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import NegocioLanding from "./pages/NegocioLanding";
import ClienteReserva from "./pages/ClienteReserva";
import HistorialCliente from "./pages/HistorialCliente";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminConfiguracion from "./pages/AdminConfiguracion";
import AdminClientes from "./pages/AdminClientes";
import AdminAgenda from "./pages/AdminAgenda";
import AdminServicios from "./pages/AdminServicios";
import AdminProfesionales from "./pages/AdminProfesionales";
import AdminHorarios2 from "./pages/AdminHorarios2";
import AdminReportes from "./pages/AdminReportes";
import ProfesionalDashboard from "./pages/ProfesionalDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/negocio/:slug" element={<NegocioLanding />} />
      <Route path="/reservar" element={<ClienteReserva />} />
      <Route path="/historial" element={<HistorialCliente />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/superadmin"
        element={
          <ProtectedRoute requireSuperAdmin={true}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireDueno={true}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/configuracion"
        element={
          <ProtectedRoute requireDueno={true}>
            <AdminConfiguracion />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/clientes"
        element={
          <ProtectedRoute requireDueno={true}>
            <AdminClientes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profesionales"
        element={
          <ProtectedRoute requireDueno={true}>
            <AdminProfesionales />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/agenda"
        element={
          <ProtectedRoute requireDueno={true}>
            <AdminAgenda />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/servicios"
        element={
          <ProtectedRoute requireDueno={true}>
            <AdminServicios />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/horarios"
        element={
          <ProtectedRoute requireDueno={true}>
            <AdminHorarios2 />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reportes"
        element={
          <ProtectedRoute requireDueno={true}>
            <AdminReportes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profesional/dashboard"
        element={
          <ProtectedRoute>
            <ProfesionalDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const observer = new MutationObserver(() => forceUpdate((n) => n + 1));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ClienteProvider>
            <div className="min-h-screen">
              <AppRoutes />
            </div>
          </ClienteProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
