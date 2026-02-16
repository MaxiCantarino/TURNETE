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
import Home from "./pages/Home";
import LoginDNI from "./pages/LoginDNI";
import ClienteReserva from "./pages/ClienteReserva";
import HistorialCliente from "./pages/HistorialCliente";

// Páginas admin
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminClientes from "./pages/AdminClientes";
import AdminAgenda from "./pages/AdminAgenda";
import AdminAgendaSemanal from "./pages/AdminAgendaSemanal";
import AdminServicios from "./pages/AdminServicios";
import AdminProfesionales from "./pages/AdminProfesionales";
import AdminHorarios2 from "./pages/AdminHorarios2";

function AppRoutes() {
  return (
    <Routes>
      {/* Ruta pública - Home */}
      <Route path="/" element={<Home />} />

      {/* Ruta pública - Login DNI (legacy) */}
      <Route path="/login" element={<LoginDNI />} />

      {/* Ruta pública - Historial */}
      <Route path="/historial" element={<HistorialCliente />} />

      {/* Ruta pública - Reserva directa */}
      <Route path="/reservar" element={<ClienteReserva />} />

      {/* Ruta de login admin (NO protegida) */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Rutas protegidas - Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
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

      {/* Redirección para rutas no encontradas */}
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
