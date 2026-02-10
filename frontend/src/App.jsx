import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ClienteProvider, useCliente } from "./contexts/ClienteContext";
import LoginDNI from "./pages/LoginDNI";
import ClienteReserva from "./pages/ClienteReserva";
import HistorialCliente from "./pages/HistorialCliente";
import AdminDashboard from "./pages/AdminDashboard";
import AdminClientes from "./pages/AdminClientes";
import AdminAgenda from "./pages/AdminAgenda";
import AdminServicios from "./pages/AdminServicios";

// Componente para proteger rutas que requieren autenticación
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useCliente();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Ruta pública - Login */}
      <Route path="/" element={<LoginDNI />} />

      {/* Ruta pública - Historial */}
      <Route path="/historial" element={<HistorialCliente />} />

      {/* Ruta protegida - Reserva */}
      <Route
        path="/reservar"
        element={
          <ProtectedRoute>
            <ClienteReserva />
          </ProtectedRoute>
        }
      />

      {/* Rutas admin */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/clientes" element={<AdminClientes />} />
      <Route path="/admin/agenda" element={<AdminAgenda />} />
      <Route path="/admin/servicios" element={<AdminServicios />} />

      {/* Redirección para rutas no encontradas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <ClienteProvider>
        <div className="min-h-screen">
          <AppRoutes />
        </div>
      </ClienteProvider>
    </Router>
  );
}

export default App;
