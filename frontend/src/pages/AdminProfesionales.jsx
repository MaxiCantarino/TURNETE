import React, { useState, useEffect } from "react";
import Sidebar from "../components/admin/Sidebar";
import Modal from "../components/booking/common/Modal";
import { getProfesionales, getServicios } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

const COLORES = [
  "#e74c3c",
  "#3498db",
  "#2ecc71",
  "#f39c12",
  "#9b59b6",
  "#1abc9c",
  "#e91e63",
  "#ff5722",
  "#607d8b",
  "#795548",
];

const AdminProfesionales = () => {
  const { user } = useAuth();
  const [profesionales, setProfesionales] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState(null);
  const [serviciosProfesional, setServiciosProfesional] = useState([]);
  const [limiteError, setLimiteError] = useState("");
  const [creando, setCreando] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    color: "#3498db",
    email: "",
    password: "",
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [profRes, servRes] = await Promise.all([getProfesionales(), getServicios()]);
      setProfesionales(profRes.data);
      setServicios(servRes.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearProfesional = async () => {
    if (!form.nombre) {
      alert("El nombre es requerido");
      return;
    }
    setCreando(true);
    setLimiteError("");
    try {
      await axios.post("http://localhost:5000/api/admin/profesionales", form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setShowCrearModal(false);
      setForm({ nombre: "", apellido: "", color: "#3498db", email: "", password: "" });
      cargarDatos();
    } catch (error) {
      if (error.response?.status === 403) {
        setLimiteError(error.response.data.error);
      } else {
        alert(error.response?.data?.error || "Error al crear profesional");
      }
    } finally {
      setCreando(false);
    }
  };

  const handleGestionarServicios = async (profesional) => {
    setProfesionalSeleccionado(profesional);
    try {
      const response = await axios.get(`http://localhost:5000/api/profesionales/${profesional.id}/servicios`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setServiciosProfesional(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error cargando servicios:", error);
    }
  };

  const handleAsignarServicio = async (servicioId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/profesionales/${profesionalSeleccionado.id}/servicios`,
        { servicio_id: servicioId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } },
      );
      const response = await axios.get(
        `http://localhost:5000/api/profesionales/${profesionalSeleccionado.id}/servicios`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } },
      );
      setServiciosProfesional(response.data);
    } catch (error) {
      if (error.response?.data?.error === "Servicio ya asignado") {
        alert("Este servicio ya está asignado");
      }
    }
  };

  const handleDesasignarServicio = async (servicioId) => {
    if (!confirm("¿Desasignar este servicio?")) return;
    try {
      await axios.delete(
        `http://localhost:5000/api/profesionales/${profesionalSeleccionado.id}/servicios/${servicioId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } },
      );
      const response = await axios.get(
        `http://localhost:5000/api/profesionales/${profesionalSeleccionado.id}/servicios`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } },
      );
      setServiciosProfesional(response.data);
    } catch (error) {
      console.error("Error desasignando servicio:", error);
    }
  };

  const serviciosDisponibles = servicios.filter((s) => !serviciosProfesional.find((sp) => sp.id === s.id));

  // Info del plan
  const getPlanInfo = () => {
    const total = profesionales.filter((p) => p.activo).length;
    // El plan lo obtenemos del token - por ahora lo mostramos genérico
    return { total };
  };

  const { total } = getPlanInfo();

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-dark-900 mb-2">Profesionales</h1>
            <p className="text-dark-600">Gestioná tu equipo y sus servicios</p>
          </div>
          <button
            onClick={() => {
              setLimiteError("");
              setShowCrearModal(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nuevo Profesional
          </button>
        </div>

        {limiteError && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <svg
              className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="font-semibold text-orange-800">Límite de plan alcanzado</p>
              <p className="text-orange-700 text-sm mt-1">{limiteError}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="card p-12 text-center">
            <div className="spinner w-12 h-12 mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profesionales.map((prof) => (
              <div key={prof.id} className="card p-6 hover:shadow-xl transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                    style={{ backgroundColor: prof.color || "#3498db" }}
                  >
                    {prof.nombre.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-dark-900">
                      {prof.nombre} {prof.apellido || ""}
                    </h3>
                    <p className="text-sm text-dark-600">{prof.es_dueno ? "Dueño/a" : "Profesional"}</p>
                    {!prof.activo && <span className="text-xs text-red-500 font-semibold">Inactivo</span>}
                  </div>
                </div>
                <button onClick={() => handleGestionarServicios(prof)} className="btn-primary w-full">
                  Gestionar Servicios
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Crear Profesional */}
      {showCrearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-dark-900">Nuevo Profesional</h3>
              <button onClick={() => setShowCrearModal(false)} className="text-dark-400 hover:text-dark-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Nombre *</label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="input"
                    placeholder="María"
                  />
                </div>
                <div>
                  <label className="label">Apellido</label>
                  <input
                    type="text"
                    value={form.apellido}
                    onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                    className="input"
                    placeholder="González"
                  />
                </div>
              </div>

              <div>
                <label className="label">Color en agenda</label>
                <div className="flex gap-2 flex-wrap mt-1">
                  {COLORES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setForm({ ...form, color: c })}
                      className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${form.color === c ? "ring-4 ring-offset-2 ring-gray-400 scale-110" : ""}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-semibold text-dark-700 mb-3">Acceso al sistema (opcional)</p>
                <div className="space-y-3">
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="input"
                      placeholder="maria@salon.com"
                    />
                  </div>
                  <div>
                    <label className="label">Contraseña</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="input"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  <p className="text-xs text-dark-400">
                    Si completás email y contraseña, el profesional podrá ver su agenda desde el sistema.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCrearModal(false)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button onClick={handleCrearProfesional} disabled={creando} className="btn-primary flex-1">
                {creando ? "Creando..." : "Crear Profesional"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Servicios */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Servicios de ${profesionalSeleccionado?.nombre}`}
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-dark-900 mb-3">
              Servicios Asignados ({serviciosProfesional.length})
            </h3>
            {serviciosProfesional.length === 0 ? (
              <p className="text-dark-500 text-sm">No tiene servicios asignados</p>
            ) : (
              <div className="space-y-2">
                {serviciosProfesional.map((servicio) => (
                  <div
                    key={servicio.id}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div>
                      <p className="font-semibold text-dark-900">{servicio.nombre}</p>
                      <p className="text-sm text-dark-600">{servicio.categoria}</p>
                    </div>
                    <button
                      onClick={() => handleDesasignarServicio(servicio.id)}
                      className="btn-ghost btn-sm text-red-600 hover:bg-red-50"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-dark-900 mb-3">
              Servicios Disponibles ({serviciosDisponibles.length})
            </h3>
            {serviciosDisponibles.length === 0 ? (
              <p className="text-dark-500 text-sm">Todos los servicios ya están asignados</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {serviciosDisponibles.map((servicio) => (
                  <div
                    key={servicio.id}
                    className="flex items-center justify-between p-3 bg-dark-50 rounded-lg border border-dark-200"
                  >
                    <div>
                      <p className="font-semibold text-dark-900">{servicio.nombre}</p>
                      <p className="text-sm text-dark-600">
                        {servicio.categoria} - {servicio.duracion} min
                      </p>
                    </div>
                    <button onClick={() => handleAsignarServicio(servicio.id)} className="btn-primary btn-sm">
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
