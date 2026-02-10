import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { buscarClientePorDNI, obtenerHistorialCliente } from "../services/api";
import { formatDisplayDate } from "../utils/dateUtils";

const HistorialCliente = () => {
  const navigate = useNavigate();

  const [dni, setDni] = useState("");
  const [cliente, setCliente] = useState(null);
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBuscar = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setCliente(null);
    setTurnos([]);

    try {
      const responseCliente = await buscarClientePorDNI(dni);

      if (responseCliente.data) {
        setCliente(responseCliente.data);

        // Obtener turnos del cliente
        const responseTurnos = await obtenerHistorialCliente(
          responseCliente.data.id,
        );
        setTurnos(responseTurnos.data || []);
      } else {
        setError("No se encontró ningún cliente con ese DNI");
      }
    } catch (error) {
      console.error("Error buscando historial:", error);
      setError("Error al buscar el historial. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: "badge-warning",
      confirmado: "badge-success",
      cancelado: "badge-error",
      completado: "badge-info",
    };
    return badges[estado] || "badge";
  };

  const turnosPendientes = turnos.filter(
    (t) => t.estado === "pendiente" || t.estado === "confirmado",
  );

  const turnosAnteriores = turnos.filter(
    (t) => t.estado === "completado" || t.estado === "cancelado",
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-accent-50 py-8 px-4">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <button
            onClick={() => navigate("/")}
            className="btn-ghost btn-sm mb-4"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver
          </button>

          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl mb-4 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-dark-900 mb-2">
            Mi <span className="gradient-text-brand">Historial</span>
          </h1>
          <p className="text-lg text-dark-600">
            Consulta tus turnos y reservas
          </p>
        </div>

        {/* Search Form */}
        <div className="card p-6 mb-6 animate-slide-up">
          <form onSubmit={handleBuscar} className="flex gap-3">
            <input
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
              className="input flex-1"
              placeholder="Ingresa tu DNI"
              maxLength="8"
              required
            />
            <button
              type="submit"
              disabled={loading || dni.length < 7}
              className="btn-primary btn-lg"
            >
              {loading ? (
                <div className="spinner w-5 h-5" />
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Buscar
                </>
              )}
            </button>
          </form>

          {error && <div className="alert-error mt-4">{error}</div>}
        </div>

        {/* Cliente Info */}
        {cliente && (
          <div className="card p-6 mb-6 animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {cliente.nombre.charAt(0)}
                {cliente.apellido.charAt(0)}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-dark-900">
                  {cliente.nombre} {cliente.apellido}
                </h2>
                <p className="text-dark-600">DNI: {cliente.dni}</p>
              </div>
              {cliente.saldo_deuda > 0 && (
                <div className="badge-error text-base px-4 py-2">
                  Saldo: ${cliente.saldo_deuda.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Turnos Pendientes */}
        {cliente && turnosPendientes.length > 0 && (
          <div className="card p-6 mb-6 animate-slide-up">
            <h3 className="text-2xl font-bold text-dark-900 mb-4 flex items-center gap-2">
              <svg
                className="w-6 h-6 text-brand-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Turnos Próximos
            </h3>

            <div className="space-y-3">
              {turnosPendientes.map((turno) => (
                <div
                  key={turno.id}
                  className="bg-gradient-to-r from-brand-50 to-accent-50 rounded-xl p-4 border-2 border-brand-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-lg text-dark-900">
                        {turno.servicio_nombre}
                      </h4>
                      <p className="text-sm text-dark-600">{turno.categoria}</p>
                    </div>
                    <span className={getEstadoBadge(turno.estado)}>
                      {turno.estado}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-dark-700">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="font-semibold">{turno.fecha}</span>
                    </div>
                    <div className="flex items-center gap-2 text-dark-700">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="font-semibold">{turno.hora_inicio}</span>
                    </div>
                    <div className="flex items-center gap-2 text-dark-700">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>{turno.profesional_nombre}</span>
                    </div>
                    {turno.precio && (
                      <div className="flex items-center gap-2 text-dark-700">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="font-semibold">
                          ${turno.precio.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {turno.saldo_pendiente > 0 && (
                    <div className="mt-3 pt-3 border-t border-brand-200">
                      <p className="text-sm text-red-700 font-semibold">
                        Saldo pendiente: $
                        {turno.saldo_pendiente.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Turnos Anteriores */}
        {cliente && turnosAnteriores.length > 0 && (
          <div className="card p-6 animate-slide-up">
            <h3 className="text-2xl font-bold text-dark-900 mb-4 flex items-center gap-2">
              <svg
                className="w-6 h-6 text-dark-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Historial Anterior
            </h3>

            <div className="space-y-2">
              {turnosAnteriores.map((turno) => (
                <div
                  key={turno.id}
                  className="bg-dark-50 rounded-xl p-4 border border-dark-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-dark-900">
                        {turno.servicio_nombre}
                      </h4>
                      <p className="text-sm text-dark-600">
                        {turno.fecha} - {turno.hora_inicio} con{" "}
                        {turno.profesional_nombre}
                      </p>
                    </div>
                    <span className={getEstadoBadge(turno.estado)}>
                      {turno.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No hay turnos */}
        {cliente && turnos.length === 0 && (
          <div className="card p-12 text-center animate-slide-up">
            <div className="w-20 h-20 rounded-full bg-dark-100 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-dark-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-dark-900 mb-2">
              Sin turnos registrados
            </h3>
            <p className="text-dark-600 mb-6">Aún no tienes turnos agendados</p>
            <button
              onClick={() => navigate("/")}
              className="btn-primary btn-lg"
            >
              Agendar mi primer turno
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorialCliente;
