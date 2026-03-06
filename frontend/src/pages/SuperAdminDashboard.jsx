import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [tenantsRes, statsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/superadmin/tenants"),
        axios.get("http://localhost:5000/api/superadmin/estadisticas"),
      ]);
      setTenants(tenantsRes.data);
      setEstadisticas(statsRes.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActivo = async (tenant) => {
    try {
      await axios.put(`http://localhost:5000/api/superadmin/tenants/${tenant.id}`, {
        activo: !tenant.activo,
        plan: tenant.plan,
      });
      cargarDatos();
    } catch (error) {
      alert("Error actualizando negocio");
    }
  };

  const handleCambiarPlan = async (tenant, nuevoPlan) => {
    try {
      await axios.put(`http://localhost:5000/api/superadmin/tenants/${tenant.id}`, {
        activo: tenant.activo,
        plan: nuevoPlan,
      });
      cargarDatos();
    } catch (error) {
      alert("Error actualizando plan");
    }
  };

  const getPlanBadge = (plan) => {
    const map = {
      basic: "bg-gray-100 text-gray-800",
      premium: "bg-purple-100 text-purple-800",
      enterprise: "bg-yellow-100 text-yellow-800",
    };
    return map[plan] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-dark-900">Turnete</h1>
            <p className="text-xs text-purple-600 font-semibold">Super Admin Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-dark-600">
            Hola, <strong>{user?.nombre}</strong>
          </span>
          <button onClick={logout} className="btn-secondary btn-sm">
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-dark-900 mb-1">Panel de Control</h2>
          <p className="text-dark-600">Gestión global de todos los negocios</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="spinner w-12 h-12"></div>
          </div>
        ) : (
          <>
            {/* Stats globales */}
            {estadisticas && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="card p-6">
                  <p className="text-sm text-dark-600 mb-1">Negocios Activos</p>
                  <p className="text-3xl font-bold text-purple-600">{estadisticas.totalNegocios}</p>
                </div>
                <div className="card p-6">
                  <p className="text-sm text-dark-600 mb-1">Total Turnos</p>
                  <p className="text-3xl font-bold text-blue-600">{estadisticas.totalTurnos}</p>
                </div>
                <div className="card p-6">
                  <p className="text-sm text-dark-600 mb-1">Total Clientes</p>
                  <p className="text-3xl font-bold text-green-600">{estadisticas.totalClientes}</p>
                </div>
                <div className="card p-6">
                  <p className="text-sm text-dark-600 mb-1">Profesionales</p>
                  <p className="text-3xl font-bold text-orange-600">{estadisticas.totalProfesionales}</p>
                </div>
              </div>
            )}

            {/* Lista de negocios */}
            <div className="card overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-dark-900">Negocios</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left p-4 text-sm font-semibold text-dark-600">Negocio</th>
                    <th className="text-left p-4 text-sm font-semibold text-dark-600">Contacto</th>
                    <th className="text-left p-4 text-sm font-semibold text-dark-600">Plan</th>
                    <th className="text-left p-4 text-sm font-semibold text-dark-600">Estado</th>
                    <th className="text-left p-4 text-sm font-semibold text-dark-600">Creado</th>
                    <th className="text-center p-4 text-sm font-semibold text-dark-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((tenant) => (
                    <tr key={tenant.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4">
                        <p className="font-semibold text-dark-900">{tenant.nombre}</p>
                        <p className="text-xs text-dark-500">{tenant.slug}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-dark-700">{tenant.nombre_negocio}</p>
                        <p className="text-xs text-dark-500">{tenant.email_contacto}</p>
                      </td>
                      <td className="p-4">
                        <select
                          value={tenant.plan}
                          onChange={(e) => handleCambiarPlan(tenant, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1"
                        >
                          <option value="basic">Basic</option>
                          <option value="premium">Premium</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${tenant.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                        >
                          {tenant.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-dark-500">
                          {new Date(tenant.fecha_creacion).toLocaleDateString("es-AR")}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleToggleActivo(tenant)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                              tenant.activo
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                          >
                            {tenant.activo ? "Desactivar" : "Activar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
