import React, { useState, useEffect } from "react";
import { getTurnos } from "../services/api";
import { useLocation } from "react-router-dom";

const AdminPanel = () => {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Capturar el estado de la vinculación desde la URL
  const query = new URLSearchParams(location.search);
  const googleStatus = query.get("google");

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await getTurnos({
          fecha_desde: "2020-01-01",
          fecha_hasta: "2030-12-31",
        });
        setTurnos(response.data || []);
      } catch (error) {
        console.error("Error al cargar:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Función para iniciar la vinculación (ID 1 para Paula)
  const handleVincularGoogle = () => {
    const profesionalId = 1;
    window.location.href = `http://localhost:5000/api/auth/google/${profesionalId}`;
  };

  if (loading)
    return <div className="p-10 text-center text-xl">Cargando Agenda...</div>;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        🔧 Panel de Administración
      </h1>

      {/* Mensajes de Estado de Google */}
      {googleStatus === "success" && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg border border-green-200">
          ✅ ¡Calendario vinculado con éxito!
        </div>
      )}
      {googleStatus === "error" && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
          ❌ Hubo un error al vincular Google. Reintentá.
        </div>
      )}

      {/* Botón de Vinculación - Optimizado para móvil */}
      <button
        onClick={handleVincularGoogle}
        className="w-full md:w-auto mb-8 bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl shadow-sm flex items-center justify-center gap-3 hover:bg-gray-50 active:scale-95 transition-all"
      >
        <img
          src="https://www.google.com/favicon.ico"
          className="w-5 h-5"
          alt="G"
        />
        Vincular mi Google Calendar
      </button>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-4 text-sm font-semibold">Fecha</th>
              <th className="p-4 text-sm font-semibold">Hora</th>
              <th className="p-4 text-sm font-semibold">Cliente</th>
              <th className="p-4 text-sm font-semibold">Servicio</th>
              <th className="p-4 text-sm font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {turnos.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-10 text-center text-gray-500">
                  No hay turnos registrados
                </td>
              </tr>
            ) : (
              turnos.map((t) => (
                <tr
                  key={t.id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4 text-sm">{t.fecha}</td>
                  <td className="p-4 text-sm">{t.hora_inicio}</td>
                  <td className="p-4 text-sm font-bold text-gray-800">
                    {t.cliente_nombre}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {t.servicio_nombre}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        t.estado === "pendiente"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {t.estado}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
