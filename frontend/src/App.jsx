import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
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
import AdminAgendaSemanal from "./pages/AdminAgendaSemanal";
import AdminServicios from "./pages/AdminServicios";
import AdminProfesionales from "./pages/AdminProfesionales";
import AdminHorarios2 from "./pages/AdminHorarios2";

function AppRoutes() {
  return (
    <Routes>
      {/* 1. RUTA RAÍZ: Ahora muestra la Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* 2. RUTAS PÚBLICAS CLIENTES */}
      <Route path="/reservar" element={<ClienteReserva />} />
      <Route path="/historial" element={<HistorialCliente />} />

      {/* 3. LOGIN ADMIN (Sin protección) */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* 4. RUTAS PROTEGIDAS - ADMIN */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/configuracion"
        element={
          <ProtectedRoute>
            <AdminConfiguracion />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/clientes"
        element={
          <ProtectedRoute>
            <AdminClientes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profesionales"
        element={
          <ProtectedRoute>
            <AdminProfesionales />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/agenda"
        element={
          <ProtectedRoute>
            <AdminAgenda />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/agenda-semanal"
        element={
          <ProtectedRoute>
            <AdminAgendaSemanal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/servicios"
        element={
          <ProtectedRoute>
            <AdminServicios />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/horarios"
        element={
          <ProtectedRoute>
            <AdminHorarios2 />
          </ProtectedRoute>
        }
      />

      {/* 5. REDIRECCIÓN GLOBAL: Si la ruta no existe, vuelve al inicio */}
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
