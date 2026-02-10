import React, { useState, useEffect } from "react";
import Sidebar from "../components/admin/Sidebar";
import TurnoCard from "../components/admin/TurnoCard";
import axios from "axios";

const AdminAgenda = () => {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [enviandoRecordatorios, setEnviandoRecordatorios] = useState(false);

  useEffect(() => {
    cargarTurnos();
  }, [fecha, filtroEstado]);

  const cargarTurnos = async () => {
    setLoading(true);
    try {
      const params = { fecha };
      if (filtroEstado !== "todos") {
        params.estado = filtroEstado;
      }

      const response = await axios.get(
        "http://localhost:5000/api/admin/turnos",
        { params },
      );
      setTurnos(response.data);
    } catch (error) {
      console.error("Error cargando turnos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async (turnoId) => {
    if (!confirm("¿Estás seguro de cancelar este turno?")) return;

    try {
      await axios.put(`http://localhost:5000/api/turnos/${turnoId}/estado`, {
        estado: "cancelado",
      });
      cargarTurnos();
    } catch (error) {
      console.error("Error cancelando turno:", error);
      alert("Error al cancelar el turno");
    }
  };

  const handleEnviarRecordatorios = async () => {
    setEnviandoRecordatorios(true);

    try {
      const response = await axios.get(
        "http://localhost:5000/api/admin/recordatorios",
      );
      const turnosMañana = response.data;

      if (turnosMañana.length === 0) {
        alert("No hay turnos para mañana");
        setEnviandoRecordatorios(false);
        return;
      }

      // Confirmar antes de enviar
      if (
        !confirm(`¿Enviar recordatorios a ${turnosMañana.length} clientes?`)
      ) {
        setEnviandoRecordatorios(false);
        return;
      }

      // Abrir WhatsApp para cada cliente
      turnosMañana.forEach((turno, index) => {
        setTimeout(() => {
          const phone =
            turno.telefono?.replace(/\D/g, "") ||
            turno.cliente_whatsapp?.replace(/\D/g, "");
          if (!phone) return;

          const phoneFormatted = phone.startsWith("549")
            ? phone
            : "549" + phone;
          const mensaje = `Hola ${turno.cliente_nombre}! Te recordamos tu turno de ${turno.servicio_nombre} mañana ${turno.fecha} a las ${turno.hora_inicio} con ${turno.profesional_nombre}. ¡Te esperamos! 😊`;
          const url = `https://wa.me/${phoneFormatted}?text=${encodeURIComponent(mensaje)}`;

          window.open(url, "_blank");
        }, index * 2000); // 2 segundos entre cada ventana
      });

      alert(
        `Se abrirán ${turnosMañana.length} ventanas de WhatsApp. Enviá cada mensaje manualmente.`,
      );
    } catch (error) {
      console.error("Error obteniendo recordatorios:", error);
      alert("Error al obtener los turnos");
    } finally {
      setEnviandoRecordatorios(false);
    }
  };

  const turnosPorHorario = turnos.sort((a, b) => {
    return a.hora_inicio.localeCompare(b.hora_inicio);
  });

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark-900 mb-2">Agenda</h1>
          <p className="text-dark-600">Gestiona los turnos del día</p>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleEnviarRecordatorios}
              disabled={enviandoRecordatorios}
              className="btn-primary btn-md"
            >
              {enviandoRecordatorios ? (
                <>
                  <div className="spinner w-5 h-5" />
                  Preparando...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Enviar Recordatorios (Mañana)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="label">Estado</label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="input"
              >
                <option value="todos">Todos</option>
                <option value="pendiente">Pendientes</option>
                <option value="confirmado">Confirmados</option>
                <option value="completado">Completados</option>
                <option value="cancelado">Cancelados</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
            <p className="text-sm text-blue-700 mb-1">Total del día</p>
            <p className="text-3xl font-bold text-blue-900">{turnos.length}</p>
          </div>

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

          <div className="card p-4 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200">
            <p className="text-sm text-red-700 mb-1">Cancelados</p>
            <p className="text-3xl font-bold text-red-900">
              {turnos.filter((t) => t.estado === "cancelado").length}
            </p>
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-dark-600">No hay turnos para esta fecha</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {turnosPorHorario.map((turno) => (
              <TurnoCard
                key={turno.id}
                turno={turno}
                onCancelar={handleCancelar}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAgenda;
