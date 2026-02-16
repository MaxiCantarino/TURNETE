import React, { useState, useEffect } from "react";
import Sidebar from "../components/admin/Sidebar";
import TurnoCard from "../components/admin/TurnoCard";
import Modal from "../components/booking/common/Modal";
import axios from "axios";

const AdminAgenda = () => {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [enviandoRecordatorios, setEnviandoRecordatorios] = useState(false);

  // Estados para sobreturnos
  const [showModalSobreturno, setShowModalSobreturno] = useState(false);
  const [profesionales, setProfesionales] = useState([]);
  const [sobreturnos, setSobreturnos] = useState([]);
  const [formSobreturno, setFormSobreturno] = useState({
    profesional_id: "",
    fecha: new Date().toISOString().split("T")[0],
    hora_inicio: "",
    hora_fin: "",
    motivo: "",
  });

  // Estados para bloques bloqueados
  const [showModalBloqueo, setShowModalBloqueo] = useState(false);
  const [bloquesBloqueados, setBloquesBloqueados] = useState([]);
  const [formBloqueo, setFormBloqueo] = useState({
    profesional_id: "",
    fecha: new Date().toISOString().split("T")[0],
    hora_inicio: "",
    hora_fin: "",
    motivo: "",
  });

  useEffect(() => {
    cargarTurnos();
    cargarProfesionales();
    cargarSobreturnos();
    cargarBloquesBloqueados();
  }, [fecha, filtroEstado]);

  const cargarProfesionales = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/profesionales",
      );
      setProfesionales(response.data);
    } catch (error) {
      console.error("Error cargando profesionales:", error);
    }
  };

  const cargarSobreturnos = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/sobreturnos",
        {
          params: { fecha },
        },
      );
      setSobreturnos(response.data);
    } catch (error) {
      console.error("Error cargando sobreturnos:", error);
    }
  };

  const cargarBloquesBloqueados = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/bloques-bloqueados",
        {
          params: {
            fecha_desde: fecha,
            fecha_hasta: fecha,
          },
        },
      );
      setBloquesBloqueados(response.data);
    } catch (error) {
      console.error("Error cargando bloques bloqueados:", error);
    }
  };

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

  const handleCrearSobreturno = async () => {
    if (
      !formSobreturno.profesional_id ||
      !formSobreturno.hora_inicio ||
      !formSobreturno.hora_fin
    ) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/sobreturnos", formSobreturno);

      alert("Sobreturno habilitado correctamente");
      setShowModalSobreturno(false);
      setFormSobreturno({
        profesional_id: "",
        fecha: new Date().toISOString().split("T")[0],
        hora_inicio: "",
        hora_fin: "",
        motivo: "",
      });
      cargarSobreturnos();
    } catch (error) {
      console.error("Error creando sobreturno:", error);
      alert("Error al crear el sobreturno");
    }
  };

  const handleEliminarSobreturno = async (sobreturnoId) => {
    if (!confirm("¿Eliminar este sobreturno?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/sobreturnos/${sobreturnoId}`,
      );
      cargarSobreturnos();
    } catch (error) {
      console.error("Error eliminando sobreturno:", error);
      alert("Error al eliminar el sobreturno");
    }
  };

  const handleCrearBloqueo = async () => {
    if (
      !formBloqueo.profesional_id ||
      !formBloqueo.fecha ||
      !formBloqueo.hora_inicio ||
      !formBloqueo.hora_fin
    ) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/bloques-bloqueados",
        formBloqueo,
      );

      alert("Bloque bloqueado correctamente");
      setShowModalBloqueo(false);
      setFormBloqueo({
        profesional_id: "",
        fecha: new Date().toISOString().split("T")[0],
        hora_inicio: "",
        hora_fin: "",
        motivo: "",
      });
      cargarBloquesBloqueados();
    } catch (error) {
      console.error("Error bloqueando bloque:", error);
      alert("Error al bloquear el bloque");
    }
  };

  const handleEliminarBloqueo = async (bloqueoId) => {
    if (!confirm("¿Eliminar este bloqueo?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/bloques-bloqueados/${bloqueoId}`,
      );
      cargarBloquesBloqueados();
    } catch (error) {
      console.error("Error eliminando bloqueo:", error);
      alert("Error al eliminar el bloqueo");
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

      if (
        !confirm(`¿Enviar recordatorios a ${turnosMañana.length} clientes?`)
      ) {
        setEnviandoRecordatorios(false);
        return;
      }

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
        }, index * 2000);
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

          <div className="flex gap-3 mt-4 flex-wrap">
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
                  Enviar Recordatorios
                </>
              )}
            </button>

            <button
              onClick={() => setShowModalSobreturno(true)}
              className="btn-secondary btn-md"
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Habilitar Sobreturno
            </button>

            <button
              onClick={() => setShowModalBloqueo(true)}
              className="btn-secondary btn-md bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
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
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
              Bloquear Horario
            </button>
          </div>
        </div>

        {/* Bloques bloqueados */}
        {bloquesBloqueados.length > 0 && (
          <div className="card p-4 mb-6 bg-red-50 border-2 border-red-200">
            <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
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
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
              Horarios Bloqueados para Hoy
            </h3>
            <div className="space-y-2">
              {bloquesBloqueados.map((bloqueo) => {
                const prof = profesionales.find(
                  (p) => p.id === bloqueo.profesional_id,
                );
                return (
                  <div
                    key={bloqueo.id}
                    className="flex items-center justify-between bg-white rounded-lg p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: prof?.color || "#dc2626" }}
                      >
                        {prof?.nombre.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-dark-900">
                          {prof?.nombre || "Desconocido"}
                        </p>
                        <p className="text-sm text-dark-600">
                          {bloqueo.hora_inicio} - {bloqueo.hora_fin}
                        </p>
                        {bloqueo.motivo && (
                          <p className="text-xs text-red-700 italic">
                            {bloqueo.motivo}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleEliminarBloqueo(bloqueo.id)}
                      className="text-red-600 hover:text-red-800"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sobreturnos activos */}
        {sobreturnos.length > 0 && (
          <div className="card p-4 mb-6 bg-orange-50 border-2 border-orange-200">
            <h3 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Sobreturnos Habilitados para Hoy
            </h3>
            <div className="space-y-2">
              {sobreturnos.map((st) => {
                const prof = profesionales.find(
                  (p) => p.id === st.profesional_id,
                );
                return (
                  <div
                    key={st.id}
                    className="flex items-center justify-between bg-white rounded-lg p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: prof?.color || "#3498db" }}
                      >
                        {prof?.nombre.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-dark-900">
                          {prof?.nombre}
                        </p>
                        <p className="text-sm text-dark-600">
                          {st.hora_inicio} - {st.hora_fin}
                        </p>
                        {st.motivo && (
                          <p className="text-xs text-orange-700 italic">
                            {st.motivo}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleEliminarSobreturno(st.id)}
                      className="text-red-600 hover:text-red-800"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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

      {/* Modal Sobreturno */}
      <Modal
        isOpen={showModalSobreturno}
        onClose={() => setShowModalSobreturno(false)}
        title="Habilitar Sobreturno"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-orange-800">
              <strong>💡 Info:</strong> Los sobreturnos permiten habilitar
              horarios fuera del horario habitual (ej: almuerzo, sábado tarde,
              domingo).
            </p>
          </div>

          <div>
            <label className="label">Fecha *</label>
            <input
              type="date"
              value={formSobreturno.fecha}
              onChange={(e) =>
                setFormSobreturno({ ...formSobreturno, fecha: e.target.value })
              }
              className="input"
            />
          </div>

          <div>
            <label className="label">Profesional *</label>
            <select
              value={formSobreturno.profesional_id}
              onChange={(e) =>
                setFormSobreturno({
                  ...formSobreturno,
                  profesional_id: e.target.value,
                })
              }
              className="input"
            >
              <option value="">Selecciona un profesional</option>
              {profesionales.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Hora Inicio *</label>
              <input
                type="time"
                value={formSobreturno.hora_inicio}
                onChange={(e) =>
                  setFormSobreturno({
                    ...formSobreturno,
                    hora_inicio: e.target.value,
                  })
                }
                className="input"
              />
            </div>
            <div>
              <label className="label">Hora Fin *</label>
              <input
                type="time"
                value={formSobreturno.hora_fin}
                onChange={(e) =>
                  setFormSobreturno({
                    ...formSobreturno,
                    hora_fin: e.target.value,
                  })
                }
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Motivo (opcional)</label>
            <input
              type="text"
              value={formSobreturno.motivo}
              onChange={(e) =>
                setFormSobreturno({ ...formSobreturno, motivo: e.target.value })
              }
              placeholder="Ej: Sobreturno excepcional"
              className="input"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowModalSobreturno(false)}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              onClick={handleCrearSobreturno}
              className="btn-primary flex-1"
            >
              Crear Sobreturno
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Bloqueo de Horario */}
      <Modal
        isOpen={showModalBloqueo}
        onClose={() => setShowModalBloqueo(false)}
        title="Bloquear Horario Específico"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              <strong>⚠️ Atención:</strong> Bloquea un bloque de horario
              específico. Los clientes no podrán reservar en ese rango horario.
            </p>
          </div>

          <div>
            <label className="label">Fecha *</label>
            <input
              type="date"
              value={formBloqueo.fecha}
              onChange={(e) =>
                setFormBloqueo({ ...formBloqueo, fecha: e.target.value })
              }
              className="input"
            />
          </div>

          <div>
            <label className="label">Profesional *</label>
            <select
              value={formBloqueo.profesional_id}
              onChange={(e) =>
                setFormBloqueo({
                  ...formBloqueo,
                  profesional_id: e.target.value,
                })
              }
              className="input"
            >
              <option value="">Selecciona un profesional</option>
              {profesionales.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Hora Inicio *</label>
              <input
                type="time"
                value={formBloqueo.hora_inicio}
                onChange={(e) =>
                  setFormBloqueo({
                    ...formBloqueo,
                    hora_inicio: e.target.value,
                  })
                }
                className="input"
              />
            </div>
            <div>
              <label className="label">Hora Fin *</label>
              <input
                type="time"
                value={formBloqueo.hora_fin}
                onChange={(e) =>
                  setFormBloqueo({ ...formBloqueo, hora_fin: e.target.value })
                }
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Motivo (opcional)</label>
            <input
              type="text"
              value={formBloqueo.motivo}
              onChange={(e) =>
                setFormBloqueo({ ...formBloqueo, motivo: e.target.value })
              }
              placeholder="Ej: Turno médico, Evento personal"
              className="input"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowModalBloqueo(false)}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              onClick={handleCrearBloqueo}
              className="btn-primary flex-1 bg-red-600 hover:bg-red-700"
            >
              Bloquear Horario
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminAgenda;
