import React, { useState, useEffect } from "react";
import Sidebar from "../components/admin/Sidebar";
import Modal from "../components/booking/common/Modal";
import { getServicios } from "../services/api";
import axios from "axios";

const AdminServicios = () => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [servicioEditando, setServicioEditando] = useState(null);

  const [formData, setFormData] = useState({
    nombre: "",
    duracion: "",
    precio: "",
    categoria: "",
    descripcion: "",
  });

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    try {
      const response = await getServicios();
      setServicios(response.data);
    } catch (error) {
      console.error("Error cargando servicios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNuevo = () => {
    setServicioEditando(null);
    setFormData({
      nombre: "",
      duracion: "",
      precio: "",
      categoria: "",
      descripcion: "",
    });
    setShowModal(true);
  };

  const handleEditar = (servicio) => {
    setServicioEditando(servicio);
    setFormData({
      nombre: servicio.nombre,
      duracion: servicio.duracion,
      precio: servicio.precio || "",
      categoria: servicio.categoria || "",
      descripcion: servicio.descripcion || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (servicioEditando) {
        // Editar
        await axios.put(
          `http://localhost:5000/api/admin/servicios/${servicioEditando.id}`,
          formData,
        );
      } else {
        // Crear nuevo
        await axios.post("http://localhost:5000/api/admin/servicios", formData);
      }

      setShowModal(false);
      cargarServicios();
    } catch (error) {
      console.error("Error guardando servicio:", error);
      alert("Error al guardar el servicio");
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este servicio?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/servicios/${id}`);
      cargarServicios();
    } catch (error) {
      console.error("Error eliminando servicio:", error);
      alert("Error al eliminar el servicio");
    }
  };

  const categorias = [
    ...new Set(servicios.map((s) => s.categoria).filter(Boolean)),
  ];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-dark-900 mb-2">Servicios</h1>
            <p className="text-dark-600">Gestiona tu catálogo de servicios</p>
          </div>

          <button onClick={handleNuevo} className="btn-primary btn-lg">
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Nuevo Servicio
          </button>
        </div>

        {/* Services by Category */}
        {loading ? (
          <div className="card p-12 text-center">
            <div className="spinner w-12 h-12 mx-auto" />
          </div>
        ) : (
          <div className="space-y-8">
            {categorias.length === 0 ? (
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
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                </div>
                <p className="text-dark-600">No hay servicios registrados</p>
              </div>
            ) : (
              categorias.map((categoria) => (
                <div key={categoria}>
                  <h2 className="text-2xl font-bold text-dark-900 mb-4">
                    {categoria}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {servicios
                      .filter((s) => s.categoria === categoria)
                      .map((servicio) => (
                        <div
                          key={servicio.id}
                          className="card p-6 hover:shadow-lg transition-all"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-dark-900 mb-2">
                                {servicio.nombre}
                              </h3>
                              {servicio.descripcion && (
                                <p className="text-sm text-dark-600 mb-3">
                                  {servicio.descripcion}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-dark-600">Duración</span>
                              <span className="font-semibold text-dark-900">
                                {servicio.duracion} min
                              </span>
                            </div>

                            {servicio.precio > 0 && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-dark-600">Precio</span>
                                <span className="font-bold text-brand-600 text-lg">
                                  ${servicio.precio.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 pt-4 border-t border-dark-200">
                            <button
                              onClick={() => handleEditar(servicio)}
                              className="btn-ghost btn-sm flex-1"
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
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              Editar
                            </button>

                            <button
                              onClick={() => handleEliminar(servicio.id)}
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={servicioEditando ? "Editar Servicio" : "Nuevo Servicio"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Nombre del Servicio *</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              className="input"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Duración (minutos) *</label>
              <input
                type="number"
                value={formData.duracion}
                onChange={(e) =>
                  setFormData({ ...formData, duracion: e.target.value })
                }
                className="input"
                min="1"
                required
              />
            </div>

            <div>
              <label className="label">Precio ($)</label>
              <input
                type="number"
                value={formData.precio}
                onChange={(e) =>
                  setFormData({ ...formData, precio: e.target.value })
                }
                className="input"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="label">Categoría</label>
            <input
              type="text"
              value={formData.categoria}
              onChange={(e) =>
                setFormData({ ...formData, categoria: e.target.value })
              }
              className="input"
              placeholder="Ej: Cejas, Pestañas, Faciales..."
            />
          </div>

          <div>
            <label className="label">Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              className="input resize-none"
              rows="3"
              placeholder="Describe brevemente el servicio..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1">
              {servicioEditando ? "Guardar Cambios" : "Crear Servicio"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminServicios;
