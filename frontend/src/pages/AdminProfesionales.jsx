import React, { useState, useEffect } from "react";
import Sidebar from "../components/admin/Sidebar";
import Modal from "../components/booking/common/Modal";
import { getProfesionales, getServicios } from "../services/api";
import axios from "axios";

const AdminProfesionales = () => {
  const [profesionales, setProfesionales] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState(null);
  const [serviciosProfesional, setServiciosProfesional] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [profRes, servRes] = await Promise.all([
        getProfesionales(),
        getServicios(),
      ]);
      setProfesionales(profRes.data);
      setServicios(servRes.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGestionarServicios = async (profesional) => {
    setProfesionalSeleccionado(profesional);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/profesionales/${profesional.id}/servicios`,
      );
      setServiciosProfesional(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error cargando servicios del profesional:", error);
    }
  };

  const handleAsignarServicio = async (servicioId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/profesionales/${profesionalSeleccionado.id}/servicios`,
        {
          servicio_id: servicioId,
        },
      );

      // Recargar servicios del profesional
      const response = await axios.get(
        `http://localhost:5000/api/profesionales/${profesionalSeleccionado.id}/servicios`,
      );
      setServiciosProfesional(response.data);
    } catch (error) {
      if (error.response?.data?.error === "Servicio ya asignado") {
        alert("Este servicio ya está asignado");
      } else {
        console.error("Error asignando servicio:", error);
      }
    }
  };

  const handleDesasignarServicio = async (servicioId) => {
    if (!confirm("¿Desasignar este servicio?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/profesionales/${profesionalSeleccionado.id}/servicios/${servicioId}`,
      );

      // Recargar servicios del profesional
      const response = await axios.get(
        `http://localhost:5000/api/profesionales/${profesionalSeleccionado.id}/servicios`,
      );
      setServiciosProfesional(response.data);
    } catch (error) {
      console.error("Error desasignando servicio:", error);
    }
  };

  const serviciosDisponibles = servicios.filter(
    (s) => !serviciosProfesional.find((sp) => sp.id === s.id),
  );

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark-900 mb-2">
            Profesionales
          </h1>
          <p className="text-dark-600">Gestiona tu equipo y sus servicios</p>
        </div>

        {loading ? (
          <div className="card p-12 text-center">
            <div className="spinner w-12 h-12 mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profesionales.map((prof) => (
              <div
                key={prof.id}
                className="card p-6 hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-2xl font-bold">
                    {prof.nombre.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-dark-900">
                      {prof.nombre}
                    </h3>
                    <p className="text-sm text-dark-600">Profesional</p>
                  </div>
                </div>

                <button
                  onClick={() => handleGestionarServicios(prof)}
                  className="btn-primary w-full"
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
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                  Gestionar Servicios
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Servicios */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Servicios de ${profesionalSeleccionado?.nombre}`}
        size="lg"
      >
        <div className="space-y-6">
          {/* Servicios Asignados */}
          <div>
            <h3 className="text-lg font-bold text-dark-900 mb-3">
              Servicios Asignados ({serviciosProfesional.length})
            </h3>

            {serviciosProfesional.length === 0 ? (
              <p className="text-dark-500 text-sm">
                No tiene servicios asignados
              </p>
            ) : (
              <div className="space-y-2">
                {serviciosProfesional.map((servicio) => (
                  <div
                    key={servicio.id}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div>
                      <p className="font-semibold text-dark-900">
                        {servicio.nombre}
                      </p>
                      <p className="text-sm text-dark-600">
                        {servicio.categoria}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDesasignarServicio(servicio.id)}
                      className="btn-ghost btn-sm text-red-600 hover:bg-red-50"
                    >
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Servicios Disponibles */}
          <div>
            <h3 className="text-lg font-bold text-dark-900 mb-3">
              Servicios Disponibles ({serviciosDisponibles.length})
            </h3>

            {serviciosDisponibles.length === 0 ? (
              <p className="text-dark-500 text-sm">
                Todos los servicios ya están asignados
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {serviciosDisponibles.map((servicio) => (
                  <div
                    key={servicio.id}
                    className="flex items-center justify-between p-3 bg-dark-50 rounded-lg border border-dark-200 hover:bg-dark-100 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-dark-900">
                        {servicio.nombre}
                      </p>
                      <p className="text-sm text-dark-600">
                        {servicio.categoria} - {servicio.duracion} min
                      </p>
                    </div>
                    <button
                      onClick={() => handleAsignarServicio(servicio.id)}
                      className="btn-primary btn-sm"
                    >
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
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Asignar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminProfesionales;
