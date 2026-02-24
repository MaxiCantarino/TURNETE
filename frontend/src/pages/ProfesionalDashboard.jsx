import React, { useState, useEffect } from "react";
import Sidebar from "../components/admin/Sidebar";
import TurnoCard from "../components/admin/TurnoCard";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

const ProfesionalDashboard = () => {
  const { user } = useAuth();
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    cargarTurnos();
  }, [fecha]);

  const cargarTurnos = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/admin/turnos", {
        params: {
          fecha,
          profesional_id: user.id,
        },
      });
      setTurnos(response.data);
    } catch (error) {
      console.error("Error cargando turnos:", error);
    } finally {
      setLoading(false);
    }
  };

  const turnosPorEstado = {
    pendientes: turnos.filter((t) => t.estado === "pendiente").length,
    confirmados: turnos.filter((t) => t.estado === "confirmado").length,
    completados: turnos.filter((t) => t.estado === "completado").length,
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark-900 mb-2">Mis Turnos</h1>
          <p className="text-dark-600">
            Bienvenido/a, <span className="font-semibold">{user.nombre}</span>
          </p>
        </div>

        {/* Filtro de fecha */}
        <div className="card p-6 mb-6">
          <label className="label">Fecha</label>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="input max-w-xs" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200">
            <p className="text-sm text-yellow-700 mb-1">Pendientes</p>
            <p className="text-3xl font-bold text-yellow-900">{turnosPorEstado.pendientes}</p>
          </div>

          <div className="card p-4 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
            <p className="text-sm text-green-700 mb-1">Confirmados</p>
            <p className="text-3xl font-bold text-green-900">{turnosPorEstado.confirmados}</p>
          </div>

          <div className="card p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
            <p className="text-sm text-blue-700 mb-1">Completados</p>
            <p className="text-3xl font-bold text-blue-900">{turnosPorEstado.completados}</p>
          </div>
        </div>

        {/* Turnos List */}
        {loading ? (
          <div className="card p-12 text-center">
            <div className="spinner w-12 h-12 mx-auto" />
          </div>
        ) : turnos.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-dark-600">No tenés turnos para esta fecha</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {turnos
              .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
              .map((turno) => (
                <TurnoCard key={turno.id} turno={turno} onEstadoChange={cargarTurnos} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfesionalDashboard;
