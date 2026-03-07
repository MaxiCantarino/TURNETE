import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showEliminarModal, setShowEliminarModal] = useState(false);
  const [tenantSeleccionado, setTenantSeleccionado] = useState(null);
  const [creando, setCreando] = useState(false);
  const [errorModal, setErrorModal] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [montoPago, setMontoPago] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    slug: "",
    nombre_dueno: "",
    email_dueno: "",
    password_dueno: "",
    plan: "basic",
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [tenantsRes, statsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/superadmin/tenants"),
        axios.get("http://localhost:5000/api/superadmin/estadisticas"),
      ]);
      setTenants(tenantsRes.data);
      setEstadisticas(statsRes.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearNegocio = async () => {
    setErrorModal("");
    if (!form.nombre || !form.slug || !form.nombre_dueno || !form.email_dueno || !form.password_dueno) {
      setErrorModal("Completá todos los campos");
      return;
    }
    setCreando(true);
    try {
      await axios.post("http://localhost:5000/api/superadmin/tenants", form);
      setShowModal(false);
      setForm({ nombre: "", slug: "", nombre_dueno: "", email_dueno: "", password_dueno: "", plan: "basic" });
      cargarDatos();
      alert("✅ Negocio creado correctamente");
    } catch (error) {
      setErrorModal(error.response?.data?.error || "Error al crear el negocio");
    } finally {
      setCreando(false);
    }
  };

  const handleRegistrarPago = async () => {
    try {
      await axios.post(`http://localhost:5000/api/superadmin/tenants/${tenantSeleccionado.id}/pago`, {
        monto: parseFloat(montoPago) || tenantSeleccionado.monto_mensual,
      });
      setShowPagoModal(false);
      setMontoPago("");
      cargarDatos();
      alert("✅ Pago registrado");
    } catch (error) {
      alert("Error registrando pago");
    }
  };

  const handleResetPassword = async () => {
    if (!nuevaPassword || nuevaPassword.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    try {
      await axios.post(`http://localhost:5000/api/superadmin/tenants/${tenantSeleccionado.id}/reset-password`, {
        nueva_password: nuevaPassword,
      });
      setShowResetModal(false);
      setNuevaPassword("");
      alert("✅ Contraseña reseteada");
    } catch (error) {
      alert("Error reseteando contraseña");
    }
  };

  const handleEliminar = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/superadmin/tenants/${tenantSeleccionado.id}`);
      setShowEliminarModal(false);
      cargarDatos();
      alert("✅ Negocio eliminado permanentemente");
    } catch (error) {
      alert(error.response?.data?.error || "Error eliminando negocio");
    }
  };

  const handleToggleActivo = async (tenant) => {
    try {
      await axios.put(`http://localhost:5000/api/superadmin/tenants/${tenant.id}`, {
        activo: !tenant.activo,
        plan: tenant.plan,
      });
      cargarDatos();
    } catch (error) {
      alert("Error actualizando negocio");
    }
  };

  const handleCambiarPlan = async (tenant, nuevoPlan) => {
    try {
      await axios.put(`http://localhost:5000/api/superadmin/tenants/${tenant.id}`, {
        activo: tenant.activo,
        plan: nuevoPlan,
      });
      cargarDatos();
    } catch (error) {
      alert("Error actualizando plan");
    }
  };

  const handleNombreChange = (valor) => {
    const slug = valor
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
    setForm({ ...form, nombre: valor, slug });
  };

  const getSemaforo = (tenant) => {
    if (!tenant.fecha_vencimiento) return { color: "gray", texto: "Sin vencimiento", dias: null };
    const hoy = new Date();
    const vence = new Date(tenant.fecha_vencimiento);
    const dias = Math.ceil((vence - hoy) / (1000 * 60 * 60 * 24));
    if (dias < 0) return { color: "red", texto: `${Math.abs(dias)} días atrasado`, dias };
    if (dias <= 5) return { color: "yellow", texto: `Vence en ${dias} días`, dias };
    return { color: "green", texto: `Al día (vence ${vence.toLocaleDateString("es-AR")})`, dias };
  };

  const semaforoClasses = {
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    red: "bg-red-100 text-red-800",
    gray: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-dark-900">Turnete</h1>
            <p className="text-xs text-purple-600 font-semibold">Super Admin Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-dark-600">
            Hola, <strong>{user?.nombre}</strong>
          </span>
          <button onClick={logout} className="btn-secondary btn-sm">
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-dark-900 mb-1">Panel de Control</h2>
            <p className="text-dark-600">Gestión global de todos los negocios</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nuevo Negocio
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="spinner w-12 h-12"></div>
          </div>
        ) : (
          <>
            {estadisticas && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="card p-6">
                  <p className="text-sm text-dark-600 mb-1">Negocios Activos</p>
                  <p className="text-3xl font-bold text-purple-600">{estadisticas.totalNegocios}</p>
                </div>
                <div className="card p-6">
                  <p className="text-sm text-dark-600 mb-1">Total Turnos</p>
                  <p className="text-3xl font-bold text-blue-600">{estadisticas.totalTurnos}</p>
                </div>
                <div className="card p-6">
                  <p className="text-sm text-dark-600 mb-1">Total Clientes</p>
                  <p className="text-3xl font-bold text-green-600">{estadisticas.totalClientes}</p>
                </div>
                <div className="card p-6">
                  <p className="text-sm text-dark-600 mb-1">Profesionales</p>
                  <p className="text-3xl font-bold text-orange-600">{estadisticas.totalProfesionales}</p>
                </div>
              </div>
            )}

            <div className="card overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-dark-900">Negocios ({tenants.length})</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left p-4 text-sm font-semibold text-dark-600">Negocio</th>
                    <th className="text-left p-4 text-sm font-semibold text-dark-600">Plan</th>
                    <th className="text-left p-4 text-sm font-semibold text-dark-600">Pago</th>
                    <th className="text-left p-4 text-sm font-semibold text-dark-600">Estado</th>
                    <th className="text-center p-4 text-sm font-semibold text-dark-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((tenant) => {
                    const semaforo = getSemaforo(tenant);
                    return (
                      <tr key={tenant.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4">
                          <p className="font-semibold text-dark-900">{tenant.nombre}</p>
                          <p className="text-xs text-dark-500">{tenant.email_contacto}</p>
                          <p className="text-xs text-dark-400">{tenant.slug}</p>
                        </td>
                        <td className="p-4">
                          <select
                            value={tenant.plan}
                            onChange={(e) => handleCambiarPlan(tenant, e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1"
                          >
                            <option value="basic">Basic</option>
                            <option value="premium">Premium</option>
                            <option value="enterprise">Enterprise</option>
                          </select>
                          {tenant.monto_mensual > 0 && (
                            <p className="text-xs text-dark-500 mt-1">
                              {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(
                                tenant.monto_mensual,
                              )}
                              /mes
                            </p>
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${semaforoClasses[semaforo.color]}`}
                          >
                            {semaforo.color === "red" && "🔴 "}
                            {semaforo.color === "yellow" && "🟡 "}
                            {semaforo.color === "green" && "🟢 "}
                            {semaforo.color === "gray" && "⚪ "}
                            {semaforo.texto}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${tenant.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                          >
                            {tenant.activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center gap-2 flex-wrap">
                            {/* Registrar Pago */}
                            <button
                              onClick={() => {
                                setTenantSeleccionado(tenant);
                                setShowPagoModal(true);
                              }}
                              className="px-2 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-700 hover:bg-purple-200"
                              title="Registrar pago"
                            >
                              💰 Pago
                            </button>

                            {/* Reset Password */}
                            <button
                              onClick={() => {
                                setTenantSeleccionado(tenant);
                                setShowResetModal(true);
                              }}
                              className="px-2 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200"
                              title="Resetear contraseña"
                            >
                              🔑 Password
                            </button>

                            {/* Activar/Desactivar */}
                            <button
                              onClick={() => handleToggleActivo(tenant)}
                              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                tenant.activo
                                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                                  : "bg-green-100 text-green-700 hover:bg-green-200"
                              }`}
                            >
                              {tenant.activo ? "Desactivar" : "Activar"}
                            </button>

                            {/* Eliminar - solo si inactivo */}
                            {!tenant.activo && (
                              <button
                                onClick={() => {
                                  setTenantSeleccionado(tenant);
                                  setShowEliminarModal(true);
                                }}
                                className="px-2 py-1 rounded-lg text-xs font-semibold bg-gray-200 text-gray-700 hover:bg-red-100 hover:text-red-700"
                                title="Eliminar permanentemente"
                              >
                                🗑️ Eliminar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal Nuevo Negocio */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-dark-900">Nuevo Negocio</h3>
              <button onClick={() => setShowModal(false)} className="text-dark-400 hover:text-dark-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {errorModal && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-700 text-sm">{errorModal}</p>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="label">Nombre del Negocio *</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => handleNombreChange(e.target.value)}
                  placeholder="Ej: Barbería Central"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Slug (URL) *</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-dark-500">turnete.com/</span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) =>
                      setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })
                    }
                    placeholder="barberia_central"
                    className="input flex-1"
                  />
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-semibold text-dark-700 mb-3">Datos del Dueño</p>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={form.nombre_dueno}
                    onChange={(e) => setForm({ ...form, nombre_dueno: e.target.value })}
                    placeholder="Nombre del dueño *"
                    className="input"
                  />
                  <input
                    type="email"
                    value={form.email_dueno}
                    onChange={(e) => setForm({ ...form, email_dueno: e.target.value })}
                    placeholder="Email del dueño *"
                    className="input"
                  />
                  <input
                    type="password"
                    value={form.password_dueno}
                    onChange={(e) => setForm({ ...form, password_dueno: e.target.value })}
                    placeholder="Contraseña temporal *"
                    className="input"
                  />
                </div>
              </div>
              <div>
                <label className="label">Plan</label>
                <select
                  value={form.plan}
                  onChange={(e) => setForm({ ...form, plan: e.target.value })}
                  className="input"
                >
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button onClick={handleCrearNegocio} disabled={creando} className="btn-primary flex-1">
                {creando ? "Creando..." : "Crear Negocio"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Registrar Pago */}
      {showPagoModal && tenantSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <h3 className="text-xl font-bold text-dark-900 mb-2">Registrar Pago</h3>
            <p className="text-dark-600 mb-6">{tenantSeleccionado.nombre}</p>
            <div className="space-y-4">
              <div>
                <label className="label">Monto pagado</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 font-semibold">$</span>
                  <input
                    type="number"
                    value={montoPago}
                    onChange={(e) => setMontoPago(e.target.value)}
                    placeholder={tenantSeleccionado.monto_mensual || "0"}
                    className="input pl-7"
                  />
                </div>
                <p className="text-xs text-dark-400 mt-1">Pesos argentinos (ARS)</p>
              </div>
              <p className="text-xs text-dark-500">Se registrará el pago y el próximo vencimiento será en 30 días.</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowPagoModal(false)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button onClick={handleRegistrarPago} className="btn-primary flex-1">
                ✅ Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {showResetModal && tenantSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <h3 className="text-xl font-bold text-dark-900 mb-2">Resetear Contraseña</h3>
            <p className="text-dark-600 mb-6">{tenantSeleccionado.nombre}</p>
            <div>
              <label className="label">Nueva contraseña</label>
              <input
                type="password"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="input"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setNuevaPassword("");
                }}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button onClick={handleResetPassword} className="btn-primary flex-1">
                🔑 Resetear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {showEliminarModal && tenantSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <h3 className="text-xl font-bold text-red-600 mb-2">⚠️ Eliminar Negocio</h3>
            <p className="text-dark-700 mb-2">Estás por eliminar permanentemente:</p>
            <p className="font-bold text-dark-900 text-lg mb-4">{tenantSeleccionado.nombre}</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-red-700 text-sm">
                Esta acción es irreversible. Se eliminarán todos los datos, turnos, clientes y configuración del
                negocio.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowEliminarModal(false)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                className="flex-1 bg-red-600 text-white rounded-xl px-4 py-3 font-semibold hover:bg-red-700"
              >
                Eliminar Permanentemente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
