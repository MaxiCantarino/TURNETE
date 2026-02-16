import React, { useState, useEffect } from "react";
import Sidebar from "../components/admin/Sidebar";
import Modal from "../components/booking/common/Modal";
import axios from "axios";

const AdminAgendaSemanal = () => {
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [profesionalId, setProfesionalId] = useState("");
  const [profesionales, setProfesionales] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [bloques, setBloques] = useState([]);
  const [sobreturnos, setSobreturnos] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModalBloqueo, setShowModalBloqueo] = useState(false);
  const [bloqueoPorCrear, setBloqueoPorCrear] = useState(null);
  const [motivoBloqueo, setMotivoBloqueo] = useState("");

  useEffect(() => {
    cargarProfesionales();
  }, []);

  useEffect(() => {
    if (profesionalId) {
      cargarDatosDelDia();
    }
  }, [fecha, profesionalId]);

  const cargarProfesionales = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/profesionales",
      );
      setProfesionales(response.data);
      if (response.data.length > 0) {
        setProfesionalId(response.data[0].id);
      }
    } catch (error) {
      console.error("Error cargando profesionales:", error);
    }
  };

  const cargarDatosDelDia = async () => {
    setLoading(true);
    try {
      // Cargar horarios del profesional
      const horariosRes = await axios.get(
        `http://localhost:5000/api/profesionales/${profesionalId}/horarios`,
      );
      setHorarios(horariosRes.data);

      // Cargar turnos
      const turnosRes = await axios.get("http://localhost:5000/api/turnos", {
        params: {
          fecha_desde: fecha,
          fecha_hasta: fecha,
          profesional_id: profesionalId,
        },
      });
      setTurnos(turnosRes.data);

      // Cargar bloques bloqueados
      const bloquesRes = await axios.get(
        "http://localhost:5000/api/bloques-bloqueados",
        {
          params: {
            fecha_desde: fecha,
            fecha_hasta: fecha,
            profesional_id: profesionalId,
          },
        },
      );
      setBloques(bloquesRes.data);

      // Cargar sobreturnos
      const sobreturnosRes = await axios.get(
        "http://localhost:5000/api/sobreturnos",
        {
          params: {
            fecha: fecha,
            profesional_id: profesionalId,
          },
        },
      );
      setSobreturnos(sobreturnosRes.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const generarSlots = () => {
    const slots = [];

    // Obtener día de la semana
    const fechaObj = new Date(fecha + "T00:00:00");
    const dias = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    const diaSemana = dias[fechaObj.getDay()];

    // Buscar horario del día
    const horarioDelDia = horarios.find(
      (h) => h.dia_semana === diaSemana && h.activo === 1,
    );

    if (!horarioDelDia) return slots;

    // Generar slots de mañana
    if (horarioDelDia.hora_inicio && horarioDelDia.hora_fin) {
      const slotsM = generarSlotsDeRango(
        horarioDelDia.hora_inicio,
        horarioDelDia.hora_fin,
        30,
      );
      slots.push(...slotsM);
    }

    // Generar slots de tarde
    if (horarioDelDia.hora_inicio_tarde && horarioDelDia.hora_fin_tarde) {
      const slotsT = generarSlotsDeRango(
        horarioDelDia.hora_inicio_tarde,
        horarioDelDia.hora_fin_tarde,
        30,
      );
      slots.push(...slotsT);
    }

    // Agregar sobreturnos
    sobreturnos.forEach((st) => {
      const slotsST = generarSlotsDeRango(st.hora_inicio, st.hora_fin, 30);
      slotsST.forEach((slot) => {
        slot.esSobreturno = true;
      });
      slots.push(...slotsST);
    });

    return slots.sort((a, b) => a.inicio.localeCompare(b.inicio));
  };

  const generarSlotsDeRango = (inicio, fin, duracion) => {
    const slots = [];
    const [startH, startM] = inicio.split(":").map(Number);
    const [endH, endM] = fin.split(":").map(Number);

    let minutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    while (minutes < endMinutes) {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      const endMin = minutes + duracion;
      const endH = Math.floor(endMin / 60);
      const endM = endMin % 60;

      slots.push({
        inicio: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
        fin: `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`,
      });

      minutes += duracion;
    }

    return slots;
  };

  const getEstadoSlot = (slot) => {
    // Verificar si hay turno
    const turno = turnos.find((t) => t.hora_inicio === slot.inicio);
    if (turno) {
      return { tipo: "turno", data: turno };
    }

    // Verificar si está bloqueado
    const bloque = bloques.find(
      (b) => slot.inicio >= b.hora_inicio && slot.inicio < b.hora_fin,
    );
    if (bloque) {
      return { tipo: "bloqueado", data: bloque };
    }

    // Libre
    return { tipo: "libre", data: slot };
  };

  const handleBloquear = (slot) => {
    setBloqueoPorCrear(slot);
    setMotivoBloqueo("");
    setShowModalBloqueo(true);
  };

  const handleConfirmarBloqueo = async () => {
    try {
      await axios.post("http://localhost:5000/api/bloques-bloqueados", {
        profesional_id: profesionalId,
        fecha: fecha,
        hora_inicio: bloqueoPorCrear.inicio,
        hora_fin: bloqueoPorCrear.fin,
        motivo: motivoBloqueo,
      });

      alert("Horario bloqueado correctamente");
      setShowModalBloqueo(false);
      setBloqueoPorCrear(null);
      setMotivoBloqueo("");
      cargarDatosDelDia();
    } catch (error) {
      console.error("Error bloqueando:", error);
      alert("Error al bloquear el horario");
    }
  };

  const handleDesbloquear = async (bloqueId) => {
    if (!confirm("¿Desbloquear este horario?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/bloques-bloqueados/${bloqueId}`,
      );
      cargarDatosDelDia();
    } catch (error) {
      console.error("Error desbloqueando:", error);
      alert("Error al desbloquear");
    }
  };

  const cambiarDia = (dias) => {
    const nuevaFecha = new Date(fecha + "T00:00:00");
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    setFecha(nuevaFecha.toISOString().split("T")[0]);
  };

  const slots = generarSlots();
  const profesionalSeleccionado = profesionales.find(
    (p) => p.id == profesionalId,
  );

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark-900 mb-2">
            Agenda Diaria
          </h1>
          <p className="text-dark-600">Vista detallada con bloqueos</p>
        </div>

        {/* Controles */}
        <div className="card p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Profesional</label>
              <select
                value={profesionalId}
                onChange={(e) => setProfesionalId(e.target.value)}
                className="input"
              >
                {profesionales.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Fecha</label>
              <div className="flex gap-2">
                <button
                  onClick={() => cambiarDia(-1)}
                  className="btn-secondary btn-sm"
                >
                  ◀
                </button>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="input"
                />
                <button
                  onClick={() => cambiarDia(1)}
                  className="btn-secondary btn-sm"
                >
                  ▶
                </button>
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFecha(new Date().toISOString().split("T")[0])}
                className="btn-secondary w-full"
              >
                Ir a Hoy
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Horarios */}
        {loading ? (
          <div className="card p-12 text-center">
            <div className="spinner w-12 h-12 mx-auto" />
          </div>
        ) : slots.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-dark-600">
              No hay horarios configurados para este día
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {slots.map((slot, index) => {
              const estado = getEstadoSlot(slot);

              return (
                <div
                  key={index}
                  className={`card p-4 flex items-center justify-between transition-all ${
                    estado.tipo === "libre"
                      ? "hover:shadow-lg hover:border-brand-300"
                      : estado.tipo === "turno"
                        ? "bg-blue-50 border-blue-200"
                        : estado.tipo === "bloqueado"
                          ? "bg-red-50 border-red-200"
                          : ""
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Hora */}
                    <div className="text-center min-w-[80px]">
                      <div className="text-2xl font-bold text-dark-900">
                        {slot.inicio}
                      </div>
                      <div className="text-xs text-dark-500">{slot.fin}</div>
                    </div>

                    {/* Estado */}
                    <div className="flex-1">
                      {estado.tipo === "libre" && (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="font-semibold text-green-700">
                            LIBRE
                          </span>
                          {slot.esSobreturno && (
                            <span className="badge-brand text-xs">
                              Sobreturno
                            </span>
                          )}
                        </div>
                      )}

                      {estado.tipo === "turno" && (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <div>
                            <div className="font-semibold text-blue-900">
                              {estado.data.cliente_nombre}
                            </div>
                            <div className="text-sm text-blue-600">
                              Estado: {estado.data.estado}
                            </div>
                          </div>
                        </div>
                      )}

                      {estado.tipo === "bloqueado" && (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div>
                            <div className="font-semibold text-red-900">
                              BLOQUEADO
                            </div>
                            {estado.data.motivo && (
                              <div className="text-sm text-red-600">
                                {estado.data.motivo}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2">
                    {estado.tipo === "libre" && (
                      <>
                        <button
                          onClick={() => handleBloquear(slot)}
                          className="btn-secondary btn-sm bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                          title="Bloquear este horario"
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
                              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                            />
                          </svg>
                          Bloquear
                        </button>
                      </>
                    )}

                    {estado.tipo === "bloqueado" && (
                      <button
                        onClick={() => handleDesbloquear(estado.data.id)}
                        className="btn-secondary btn-sm"
                        title="Desbloquear"
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
                        Desbloquear
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Confirmación Bloqueo */}
      <Modal
        isOpen={showModalBloqueo}
        onClose={() => setShowModalBloqueo(false)}
        title="Bloquear Horario"
        size="sm"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>¿Bloquear este horario?</strong>
            </p>
            <p className="text-sm text-red-600 mt-2">
              {bloqueoPorCrear?.inicio} - {bloqueoPorCrear?.fin}
            </p>
          </div>

          <div>
            <label className="label">Motivo (opcional)</label>
            <input
              type="text"
              value={motivoBloqueo}
              onChange={(e) => setMotivoBloqueo(e.target.value)}
              placeholder="Ej: Turno médico, Evento personal"
              className="input"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowModalBloqueo(false)}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmarBloqueo}
              className="btn-primary flex-1 bg-red-600 hover:bg-red-700"
            >
              Bloquear
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminAgendaSemanal;
