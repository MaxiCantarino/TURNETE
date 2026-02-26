import React, { useState, useEffect } from "react";
import Sidebar from "../components/admin/Sidebar";
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
        params: { fecha, profesional_id: user.id },
      });
      setTurnos(response.data);
    } catch (error) {
      console.error("Error cargando turnos:", error);
    } finally {
      setLoading(false);
    }
  };

  const cambiarDia = (dias) => {
    const nueva = new Date(fecha + "T00:00:00");
    nueva.setDate(nueva.getDate() + dias);
    setFecha(nueva.toISOString().split("T")[0]);
  };

  const formatearFecha = (f) => {
    const d = new Date(f + "T00:00:00");
    const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return `${dias[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]}`;
  };

  const handleCompletar = async (turnoId) => {
    if (!confirm("¿Marcar este turno como completado?")) return;
    try {
      await axios.put(`http://localhost:5000/api/turnos/${turnoId}/estado`, { estado: "completado" });
      cargarTurnos();
    } catch (error) {
      alert("Error al actualizar el turno");
    }
  };

  const getBadgeEstado = (estado) => {
    const map = {
      pendiente: "bg-yellow-100 text-yellow-800",
      confirmado: "bg-green-100 text-green-800",
      cancelado: "bg-red-100 text-red-800",
      completado: "bg-blue-100 text-blue-800",
    };
    return map[estado] || "bg-gray-100 text-gray-800";
  };

  const turnosActivos = turnos
    .filter((t) => t.estado !== "cancelado")
    .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-dark-900 mb-2">Mis Turnos</h1>
          <p className="text-dark-600">
            Bienvenido/a, <span className="font-semibold">{user.nombre}</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200">
            <p className="text-sm text-yellow-700 mb-1">Pendientes</p>
            <p className="text-3xl font-bold text-yellow-900">
              {turnos.filter((t) => t.estado === "pendiente").length}
            </p>
          </div>
          <div className="card p-4 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
            <p className="text-sm text-green-700 mb-1">Confirmados</p>
            <p className="text-3xl font-bold text-green-900">
              {turnos.filter((t) => t.estado === "confirmado").length}
            </p>
          </div>
          <div className="card p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
            <p className="text-sm text-blue-700 mb-1">Completados</p>
            <p className="text-3xl font-bold text-blue-900">{turnos.filter((t) => t.estado === "completado").length}</p>
          </div>
        </div>

        {/* Navegación fecha */}
        <div className="card p-4 mb-6">
          <div className="flex items-center gap-2">
            <button onClick={() => cambiarDia(-1)} className="btn-secondary btn-sm px-3">
              ◀
            </button>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="input" />
            <button onClick={() => cambiarDia(1)} className="btn-secondary btn-sm px-3">
              ▶
            </button>
            <button
              onClick={() => setFecha(new Date().toISOString().split("T")[0])}
              className="btn-secondary btn-sm whitespace-nowrap"
            >
              Hoy
            </button>
            <p className="text-sm text-dark-500 font-medium ml-2">{formatearFecha(fecha)}</p>
          </div>
        </div>

        {/* Tabla */}
        {loading ? (
          <div className="card p-12 text-center">
            <div className="spinner w-12 h-12 mx-auto" />
          </div>
        ) : turnosActivos.length === 0 ? (
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
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="text-left p-3 text-sm font-semibold text-dark-600 w-20">Horario</th>
                  <th className="text-left p-3 text-sm font-semibold text-dark-600">Cliente</th>
                  <th className="text-left p-3 text-sm font-semibold text-dark-600">Servicio</th>
                  <th className="text-left p-3 text-sm font-semibold text-dark-600 w-28">Estado</th>
                  <th className="text-left p-3 text-sm font-semibold text-dark-600 w-20">Duración</th>
                  <th className="text-left p-3 text-sm font-semibold text-dark-600 w-16">Obs</th>
                  <th className="text-center p-3 text-sm font-semibold text-dark-600 w-28">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {turnosActivos.map((turno) => (
                  <tr
                    key={turno.id}
                    className={`border-b transition-colors ${turno.estado === "completado" ? "bg-blue-50" : "bg-white hover:bg-gray-50"}`}
                  >
                    <td className="p-2">
                      <span className="font-bold text-dark-900">{turno.hora_inicio}</span>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: user?.color || "#3498db" }}
                        >
                          {(turno.cliente_nombre || turno.cliente_nombre_completo || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-dark-900 text-sm">
                            {turno.cliente_nombre || turno.cliente_nombre_completo} {turno.apellido || ""}
                          </p>
                          {turno.cliente_whatsapp && <p className="text-xs text-dark-500">{turno.cliente_whatsapp}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-2">
                      <span className="text-sm text-dark-700">{turno.servicio_nombre}</span>
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getBadgeEstado(turno.estado)}`}>
                        {turno.estado}
                      </span>
                    </td>
                    <td className="p-2">
                      <span className="text-sm text-dark-500">{turno.duracion} min</span>
                    </td>
                    <td className="p-2">
                      {turno.notas ? (
                        <div className="relative group">
                          <svg
                            className="w-5 h-5 text-blue-500 cursor-pointer"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                            />
                          </svg>
                          <div className="absolute z-10 hidden group-hover:block bg-dark-900 text-white text-xs rounded-lg p-2 w-48 bottom-6 left-0 shadow-lg">
                            {turno.notas}
                          </div>
                        </div>
                      ) : null}
                    </td>
                    <td className="p-2">
                      <div className="flex items-center justify-center">
                        {(turno.estado === "pendiente" || turno.estado === "confirmado") && (
                          <button
                            onClick={() => handleCompletar(turno.id)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Marcar como completado"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        {turno.estado === "completado" && (
                          <span className="text-blue-400 text-xs font-medium">✓ Completado</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfesionalDashboard;
