import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import axios from "axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    turnosHoy: 0,
    turnosPendientes: 0,
    totalClientes: 0,
    deudaTotal: 0,
  });
  const [actividadReciente, setActividadReciente] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [statsRes, actividadRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/estadisticas"),
        axios.get("http://localhost:5000/api/admin/actividad-reciente"),
      ]);

      setStats(statsRes.data);
      setActividadReciente(actividadRes.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, label, value, color, link }) => (
    <Link to={link} className="card p-6 hover:shadow-xl transition-all group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-dark-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-dark-900">{value}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={icon}
            />
          </svg>
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="flex items-center justify-center h-96">
            <div className="spinner w-12 h-12" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark-900 mb-2">Dashboard</h1>
          <p className="text-dark-600">Resumen general de tu negocio</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            label="Turnos Hoy"
            value={stats.turnosHoy}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            link="/admin/agenda"
          />

          <StatCard
            icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            label="Turnos Pendientes"
            value={stats.turnosPendientes}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
            link="/admin/agenda"
          />

          <StatCard
            icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            label="Total Clientes"
            value={stats.totalClientes}
            color="bg-gradient-to-br from-green-500 to-green-600"
            link="/admin/clientes"
          />

          <StatCard
            icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            label="Deuda Total"
            value={`$${stats.deudaTotal.toLocaleString()}`}
            color="bg-gradient-to-br from-red-500 to-red-600"
            link="/admin/clientes"
          />
        </div>

        {/* Actividad Reciente */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-dark-900">
              Actividad Reciente
            </h2>
            <Link to="/admin/agenda" className="btn-ghost btn-sm">
              Ver todo
            </Link>
          </div>

          {actividadReciente.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-dark-400"
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
              <p className="text-dark-600">No hay actividad reciente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {actividadReciente.map((turno) => (
                <div
                  key={turno.id}
                  className="flex items-center justify-between p-4 bg-dark-50 rounded-xl hover:bg-dark-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold">
                      {turno.cliente_nombre?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-dark-900">
                        {turno.cliente_nombre} {turno.apellido}
                      </p>
                      <p className="text-sm text-dark-600">
                        {turno.servicio_nombre} - {turno.profesional_nombre}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-dark-900">{turno.fecha}</p>
                    <p className="text-sm text-dark-600">{turno.hora_inicio}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Link
            to="/admin/agenda"
            className="card p-6 hover:shadow-xl transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg
                className="w-6 h-6 text-white"
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
            </div>
            <h3 className="font-bold text-lg text-dark-900 mb-2">Ver Agenda</h3>
            <p className="text-sm text-dark-600">Gestiona los turnos del día</p>
          </Link>

          <Link
            to="/admin/clientes"
            className="card p-6 hover:shadow-xl transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-dark-900 mb-2">Clientes</h3>
            <p className="text-sm text-dark-600">
              Administra tu base de clientes
            </p>
          </Link>

          <Link
            to="/admin/servicios"
            className="card p-6 hover:shadow-xl transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-dark-900 mb-2">Servicios</h3>
            <p className="text-sm text-dark-600">Edita precios y categorías</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
