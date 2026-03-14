import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import TurnoCard from "../components/admin/TurnoCard";
import axios from "axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    turnosHoy: 0,
    turnosPendientes: 0,
    totalClientes: 0,
    deudaTotal: 0,
  });
  const [actividadReciente, setActividadReciente] = useState([]);
  const [turnosHoy, setTurnosHoy] = useState([]);
  const [mensajeTemplate, setMensajeTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  const hoy = new Date().toISOString().split("T")[0];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [statsRes, actividadRes, turnosRes, configRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/estadisticas"),
        axios.get("http://localhost:5000/api/admin/actividad-reciente"),
        axios.get("http://localhost:5000/api/admin/turnos", { params: { fecha: hoy } }),
        axios.get("http://localhost:5000/api/configuracion/negocio"),
      ]);
      setStats(statsRes.data);
      setActividadReciente(actividadRes.data);
      setTurnosHoy(turnosRes.data);
      if (configRes.data.whatsapp_template) setMensajeTemplate(configRes.data.whatsapp_template);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async (turnoId) => {
    if (!confirm("¿Estás seguro de cancelar este turno?")) return;
    try {
      await axios.put(`http://localhost:5000/api/turnos/${turnoId}/estado`, { estado: "cancelado" });
      const turnosRes = await axios.get("http://localhost:5000/api/admin/turnos", { params: { fecha: hoy } });
      setTurnosHoy(turnosRes.data);
    } catch (error) {
      alert("Error al cancelar el turno");
    }
  };

  const StatCard = ({ icon, label, value, gradient, link }) => (
    <Link
      to={link}
      className="block rounded-2xl p-6 transition-all duration-200 group"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        boxShadow: "var(--neu-shadow)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--brand)";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "var(--neu-shadow), 0 0 20px var(--brand-glow)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "var(--neu-shadow)";
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
            {label}
          </p>
          <p className="text-3xl font-black" style={{ color: "var(--text)", fontFamily: "Outfit, sans-serif" }}>
            {value}
          </p>
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
          style={{ background: gradient, boxShadow: "0 4px 14px rgba(124,58,237,0.3)" }}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="spinner w-12 h-12" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      <Sidebar />
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-1" style={{ color: "var(--text)", fontFamily: "Outfit, sans-serif" }}>
            Dashboard
          </h1>
          <p style={{ color: "var(--text-muted)" }}>Resumen general de tu negocio</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            label="Turnos Hoy"
            value={stats.turnosHoy}
            gradient="linear-gradient(135deg, #7c3aed, #9066ff)"
            link="/admin/agenda"
          />
          <StatCard
            icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            label="Turnos Pendientes"
            value={stats.turnosPendientes}
            gradient="linear-gradient(135deg, #f59e0b, #fbbf24)"
            link="/admin/agenda"
          />
          <StatCard
            icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            label="Total Clientes"
            value={stats.totalClientes}
            gradient="linear-gradient(135deg, #10b981, #34d399)"
            link="/admin/clientes"
          />
          <StatCard
            icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            label="Deuda Total"
            value={`$${stats.deudaTotal.toLocaleString()}`}
            gradient="linear-gradient(135deg, #ef4444, #f87171)"
            link="/admin/clientes"
          />
        </div>

        {/* Dos columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Turnos del día */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              boxShadow: "var(--neu-shadow)",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black" style={{ color: "var(--text)", fontFamily: "Outfit, sans-serif" }}>
                Turnos de Hoy
              </h2>
              <Link
                to="/admin/agenda"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                style={{ color: "var(--brand)", background: "var(--brand-glow)" }}
              >
                Ver agenda
              </Link>
            </div>
            {turnosHoy.length === 0 ? (
              <div className="text-center py-12">
                <p style={{ color: "var(--text-muted)" }}>No hay turnos para hoy</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {turnosHoy
                  .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
                  .map((turno) => (
                    <TurnoCard
                      key={turno.id}
                      turno={turno}
                      onCancelar={handleCancelar}
                      mensajeTemplate={mensajeTemplate}
                    />
                  ))}
              </div>
            )}
          </div>

          {/* Actividad reciente */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              boxShadow: "var(--neu-shadow)",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black" style={{ color: "var(--text)", fontFamily: "Outfit, sans-serif" }}>
                Actividad Reciente
              </h2>
              <Link
                to="/admin/agenda"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                style={{ color: "var(--brand)", background: "var(--brand-glow)" }}
              >
                Ver todo
              </Link>
            </div>
            {actividadReciente.length === 0 ? (
              <div className="text-center py-12">
                <p style={{ color: "var(--text-muted)" }}>No hay actividad reciente</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {actividadReciente.map((turno) => (
                  <div
                    key={turno.id}
                    className="flex items-center justify-between p-4 rounded-xl transition-all"
                    style={{ background: "var(--bg-hover)", border: "1px solid var(--border)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, var(--brand), var(--brand-light))" }}
                      >
                        {turno.cliente_nombre?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                          {turno.cliente_nombre} {turno.apellido}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {turno.servicio_nombre} · {turno.profesional_nombre}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                        {turno.fecha
                          ? new Date(turno.fecha).toLocaleDateString("es-AR", {
                              timeZone: "America/Argentina/Buenos_Aires",
                            })
                          : ""}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {turno.hora_inicio}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
