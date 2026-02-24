import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ClienteProvider } from "./contexts/ClienteContext";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Páginas públicas
import LandingPage from "./pages/LandingPage";
import ClienteReserva from "./pages/ClienteReserva";
import HistorialCliente from "./pages/HistorialCliente";

// Páginas admin
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminConfiguracion from "./pages/AdminConfiguracion";
import AdminClientes from "./pages/AdminClientes";
import AdminAgenda from "./pages/AdminAgenda";
import AdminServicios from "./pages/AdminServicios";
import AdminProfesionales from "./pages/AdminProfesionales";
import AdminHorarios2 from "./pages/AdminHorarios2";
import AdminReportes from "./pages/AdminReportes";

// Páginas profesional
import ProfesionalDashboard from "./pages/ProfesionalDashboard";

function AppRoutes() {
  return (
    <Routes>
      {/* RUTAS PÚBLICAS */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/reservar" element={<ClienteReserva />} />
      <Route path="/historial" element={<HistorialCliente />} />

      {/* LOGIN */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* RUTAS ADMIN (Solo dueños) */}
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

      {/* RUTAS PROFESIONAL (Empleados) */}
      <Route
        path="/profesional/dashboard"
        element={
          <ProtectedRoute>
            <ProfesionalDashboard />
          </ProtectedRoute>
        }
      />

      {/* REDIRECCIÓN */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ClienteProvider>
          <div className="min-h-screen">
            <AppRoutes />
          </div>
        </ClienteProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
