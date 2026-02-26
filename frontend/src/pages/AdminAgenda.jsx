import React, { useState, useEffect } from "react";
import Sidebar from "../components/admin/Sidebar";
import Modal from "../components/booking/common/Modal";
import axios from "axios";

const AdminAgenda = () => {
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [profesionalId, setProfesionalId] = useState("");
  const [profesionales, setProfesionales] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [bloques, setBloques] = useState([]);
  const [sobreturnos, setSobreturnos] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensajeTemplate, setMensajeTemplate] = useState(null);
  const [enviandoRecordatorios, setEnviandoRecordatorios] = useState(false);

  const [showModalBloqueo, setShowModalBloqueo] = useState(false);
  const [bloqueoPorCrear, setBloqueoPorCrear] = useState(null);
  const [motivoBloqueo, setMotivoBloqueo] = useState("");

  const [showModalSobreturno, setShowModalSobreturno] = useState(false);
  const [formSobreturno, setFormSobreturno] = useState({
    profesional_id: "",
    fecha: new Date().toISOString().split("T")[0],
    hora_inicio: "",
    hora_fin: "",
    motivo: "",
  });

  useEffect(() => {
    cargarProfesionales();
    cargarMensajeTemplate();
  }, []);

  useEffect(() => {
    if (profesionalId) cargarDatosDelDia();
  }, [fecha, profesionalId]);

  const cargarMensajeTemplate = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/configuracion/negocio");
      if (response.data.whatsapp_template) setMensajeTemplate(response.data.whatsapp_template);
    } catch (error) {
      console.error("Error cargando template:", error);
    }
  };

  const cargarProfesionales = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/profesionales");
      setProfesionales(response.data);
      if (response.data.length > 0) setProfesionalId(response.data[0].id);
    } catch (error) {
      console.error("Error cargando profesionales:", error);
    }
  };

  const cargarDatosDelDia = async () => {
    setLoading(true);
    try {
      const [horariosRes, turnosRes, bloquesRes, sobreturnosRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/profesionales/${profesionalId}/horarios`),
        axios.get("http://localhost:5000/api/admin/turnos", { params: { fecha, profesional_id: profesionalId } }),
        axios.get("http://localhost:5000/api/bloques-bloqueados", {
          params: { fecha_desde: fecha, fecha_hasta: fecha, profesional_id: profesionalId },
        }),
        axios.get("http://localhost:5000/api/sobreturnos", { params: { fecha, profesional_id: profesionalId } }),
      ]);
      setHorarios(horariosRes.data);
      setTurnos(turnosRes.data);
      setBloques(bloquesRes.data);
      setSobreturnos(sobreturnosRes.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const cambiarDia = (dias) => {
    const nueva = new Date(fecha + "T00:00:00");
    nueva.setDate(nueva.getDate() + dias);
    setFecha(nueva.toISOString().split("T")[0]);
  };

  const formatearFecha = (f) => {
    const d = new Date(f + "T00:00:00");
    const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return `${dias[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]}`;
  };

  const generarSlotsDeRango = (inicio, fin, duracion = 30) => {
    const slots = [];
    const [sH, sM] = inicio.split(":").map(Number);
    const [eH, eM] = fin.split(":").map(Number);
    let min = sH * 60 + sM;
    const endMin = eH * 60 + eM;
    while (min < endMin) {
      const h = Math.floor(min / 60);
      const m = min % 60;
      const eMin = min + duracion;
      slots.push({
        inicio: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
        fin: `${String(Math.floor(eMin / 60)).padStart(2, "0")}:${String(eMin % 60).padStart(2, "0")}`,
      });
      min += duracion;
    }
    return slots;
  };

  const generarSlots = () => {
    const slots = [];
    const d = new Date(fecha + "T00:00:00");
    const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const diaSemana = dias[d.getDay()];
    const horarioDelDia = horarios.find((h) => h.dia_semana === diaSemana && h.activo);

    if (!horarioDelDia) return slots;

    // Slots de mañana
    if (horarioDelDia.hora_inicio && horarioDelDia.hora_fin) {
      generarSlotsDeRango(horarioDelDia.hora_inicio, horarioDelDia.hora_fin).forEach((s) =>
        slots.push({ ...s, tipo: "normal" }),
      );
    }

    // Bloque almuerzo
    if (horarioDelDia.hora_fin && horarioDelDia.hora_inicio_tarde) {
      slots.push({
        inicio: horarioDelDia.hora_fin,
        fin: horarioDelDia.hora_inicio_tarde,
        tipo: "cerrado",
        label: "Cerrado / Descanso",
      });
    }

    // Slots de tarde
    if (horarioDelDia.hora_inicio_tarde && horarioDelDia.hora_fin_tarde) {
      generarSlotsDeRango(horarioDelDia.hora_inicio_tarde, horarioDelDia.hora_fin_tarde).forEach((s) =>
        slots.push({ ...s, tipo: "normal" }),
      );
    }

    // Sobreturnos
    sobreturnos.forEach((st) => {
      generarSlotsDeRango(st.hora_inicio, st.hora_fin).forEach((s) => slots.push({ ...s, tipo: "sobreturno" }));
    });

    return slots.sort((a, b) => a.inicio.localeCompare(b.inicio));
  };

  const getEstadoSlot = (slot) => {
    if (slot.tipo === "cerrado") return { tipo: "cerrado", data: slot };
    const turno = turnos.find((t) => t.hora_inicio === slot.inicio);
    if (turno) return { tipo: "turno", data: turno };
    const bloque = bloques.find((b) => slot.inicio >= b.hora_inicio && slot.inicio < b.hora_fin);
    if (bloque) return { tipo: "bloqueado", data: bloque };
    return { tipo: slot.tipo === "sobreturno" ? "sobreturno_libre" : "libre", data: slot };
  };

  const handleWhatsApp = (turno) => {
    const phone = turno.cliente_whatsapp || turno.whatsapp || turno.telefono;
    if (!phone) {
      alert("Este cliente no tiene teléfono registrado");
      return;
    }
    const cleaned = phone.replace(/\D/g, "");
    const phoneFormatted = cleaned.startsWith("54") ? cleaned : "549" + cleaned;
    const template =
      mensajeTemplate ||
      "Hola {$CLIENTE_NOMBRE}! Te recordamos tu turno de {$SERVICIOS} el {$TURNO_DIA} a las {$TURNO_HORA}. ¡Te esperamos!";
    const mensaje = template
      .replace(/\{\$CLIENTE_NOMBRE\}/g, turno.cliente_nombre || turno.cliente_nombre_completo || "")
      .replace(
        /\{\$TURNO_DIA\}/g,
        turno.fecha
          ? new Date(turno.fecha).toLocaleDateString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })
          : "",
      )
      .replace(/\{\$TURNO_HORA\}/g, turno.hora_inicio || "")
      .replace(/\{\$MARCA\}/g, turno.negocio_nombre || "")
      .replace(/\{\$SERVICIOS\}/g, turno.servicio_nombre || "")
      .replace(/\{\$TURNO_DIRECCION\}/g, turno.direccion || "")
      .replace(
        /\{\$TURNO_MAPA\}/g,
        turno.direccion ? `https://maps.google.com/?q=${encodeURIComponent(turno.direccion)}` : "",
      );
    window.open(`https://wa.me/${phoneFormatted}?text=${encodeURIComponent(mensaje)}`, "_blank");
  };
  const handleCompletar = async (turnoId) => {
    if (!confirm("¿Marcar como completado?")) return;
    try {
      await axios.put(`http://localhost:5000/api/turnos/${turnoId}/estado`, { estado: "completado" });
      cargarDatosDelDia();
    } catch (error) {
      alert("Error al completar el turno");
    }
  };
  const handleCancelar = async (turnoId) => {
    if (!confirm("¿Cancelar este turno?")) return;
    try {
      await axios.put(`http://localhost:5000/api/turnos/${turnoId}/estado`, { estado: "cancelado" });
      cargarDatosDelDia();
    } catch (error) {
      alert("Error al cancelar el turno");
    }
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
        fecha,
        hora_inicio: bloqueoPorCrear.inicio,
        hora_fin: bloqueoPorCrear.fin,
        motivo: motivoBloqueo,
      });
      setShowModalBloqueo(false);
      cargarDatosDelDia();
    } catch (error) {
      alert("Error al bloquear el horario");
    }
  };

  const handleDesbloquear = async (bloqueId) => {
    if (!confirm("¿Desbloquear este horario?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/bloques-bloqueados/${bloqueId}`);
      cargarDatosDelDia();
    } catch (error) {
      alert("Error al desbloquear");
    }
  };

  const handleCrearSobreturno = async () => {
    if (!formSobreturno.hora_inicio || !formSobreturno.hora_fin) {
      alert("Completá hora inicio y fin");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/sobreturnos", {
        ...formSobreturno,
        profesional_id: profesionalId,
        fecha,
      });
      setShowModalSobreturno(false);
      setFormSobreturno({ profesional_id: "", fecha, hora_inicio: "", hora_fin: "", motivo: "" });
      cargarDatosDelDia();
    } catch (error) {
      alert("Error al crear sobreturno");
    }
  };

  const handleEnviarRecordatorios = async () => {
    setEnviandoRecordatorios(true);
    try {
      const response = await axios.get("http://localhost:5000/api/admin/recordatorios");
      const turnosMañana = response.data;
      if (turnosMañana.length === 0) {
        alert("No hay turnos para mañana");
        return;
      }
      if (!confirm(`¿Enviar recordatorios a ${turnosMañana.length} clientes?`)) return;
      const template =
        mensajeTemplate ||
        "Hola {$CLIENTE_NOMBRE}! Te recordamos tu turno de {$SERVICIOS} el {$TURNO_DIA} a las {$TURNO_HORA}. ¡Te esperamos!";
      turnosMañana.forEach((turno, index) => {
        setTimeout(() => {
          const phone = turno.telefono?.replace(/\D/g, "") || turno.cliente_whatsapp?.replace(/\D/g, "");
          if (!phone) return;
          const phoneFormatted = phone.startsWith("549") ? phone : "549" + phone;
          const mensaje = template
            .replace(/\{\$CLIENTE_NOMBRE\}/g, turno.cliente_nombre || "")
            .replace(
              /\{\$TURNO_DIA\}/g,
              turno.fecha
                ? new Date(turno.fecha).toLocaleDateString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })
                : "",
            )
            .replace(/\{\$TURNO_HORA\}/g, turno.hora_inicio || "")
            .replace(/\{\$MARCA\}/g, turno.negocio_nombre || "")
            .replace(/\{\$SERVICIOS\}/g, turno.servicio_nombre || "")
            .replace(/\{\$TURNO_DIRECCION\}/g, turno.direccion || "")
            .replace(
              /\{\$TURNO_MAPA\}/g,
              turno.direccion ? `https://maps.google.com/?q=${encodeURIComponent(turno.direccion)}` : "",
            );
          window.open(`https://wa.me/${phoneFormatted}?text=${encodeURIComponent(mensaje)}`, "_blank");
        }, index * 2000);
      });
      alert(`Se abrirán ${turnosMañana.length} ventanas de WhatsApp.`);
    } catch (error) {
      alert("Error al obtener los turnos");
    } finally {
      setEnviandoRecordatorios(false);
    }
  };

  const slots = generarSlots();
  const profesionalSeleccionado = profesionales.find((p) => p.id == profesionalId);

  const getBadgeEstado = (estado) => {
    const map = {
      pendiente: "bg-yellow-100 text-yellow-800",
      confirmado: "bg-green-100 text-green-800",
      cancelado: "bg-red-100 text-red-800",
      completado: "bg-blue-100 text-blue-800",
    };
    return map[estado] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-dark-900 mb-2">Agenda</h1>
          <p className="text-dark-600">Gestiona los turnos del día</p>
          <div className="flex gap-3 mt-4 flex-wrap">
            <button onClick={handleEnviarRecordatorios} disabled={enviandoRecordatorios} className="btn-primary btn-md">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {enviandoRecordatorios ? "Preparando..." : "Enviar Recordatorios"}
            </button>
            <button onClick={() => setShowModalSobreturno(true)} className="btn-secondary btn-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Habilitar Sobreturno
            </button>
          </div>
        </div>

        {/* Controles fecha + profesional */}
        <div className="card p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Fecha</label>
              <div className="flex items-center gap-2">
                <button onClick={() => cambiarDia(-1)} className="btn-secondary btn-sm px-3">
                  ◀
                </button>
                <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="input" />
                <button onClick={() => cambiarDia(1)} className="btn-secondary btn-sm px-3">
                  ▶
                </button>
                <button
                  onClick={() => setFecha(new Date().toISOString().split("T")[0])}
                  className="btn-secondary btn-sm whitespace-nowrap"
                >
                  Hoy
                </button>
              </div>
              <p className="text-sm text-dark-500 mt-1 font-medium">{formatearFecha(fecha)}</p>
            </div>
            <div>
              <label className="label">Profesional</label>
              <select value={profesionalId} onChange={(e) => setProfesionalId(e.target.value)} className="input">
                {profesionales.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de agenda */}
        {loading ? (
          <div className="card p-12 text-center">
            <div className="spinner w-12 h-12 mx-auto" />
          </div>
        ) : slots.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-dark-600">No hay horarios configurados para este día</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="text-left p-4 text-sm font-semibold text-dark-600 w-24">Horario</th>
                  <th className="text-left p-4 text-sm font-semibold text-dark-600">Cliente</th>
                  <th className="text-left p-4 text-sm font-semibold text-dark-600">Servicio</th>
                  <th className="text-left p-4 text-sm font-semibold text-dark-600 w-28">Estado</th>
                  <th className="text-left p-4 text-sm font-semibold text-dark-600 w-20">Precio</th>
                  <th className="text-left p-4 text-sm font-semibold text-dark-600 w-20">Tiempo</th>
                  <th className="text-left p-4 text-sm font-semibold text-dark-600 w-24">Obs</th>
                  <th className="text-right p-3 text-sm font-semibold text-dark-600 w-40">Bloquear Horario</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((slot, index) => {
                  const estado = getEstadoSlot(slot);
                  const esCerrado = slot.tipo === "cerrado";
                  const esTurno = !esCerrado && estado.tipo === "turno";
                  const esBloqueado = !esCerrado && estado.tipo === "bloqueado";
                  const esSobreturno = !esCerrado && estado.tipo === "sobreturno_libre";

                  const rowClass = esCerrado
                    ? "bg-gray-200 border-gray-300"
                    : esTurno
                      ? "bg-blue-50 border-blue-100"
                      : esBloqueado
                        ? "bg-gray-300 border-gray-400"
                        : esSobreturno
                          ? "bg-orange-50 border-orange-100"
                          : "bg-white hover:bg-gray-50";

                  return (
                    <tr key={index} className={`border-b ${rowClass} transition-colors`}>
                      {/* Horario */}
                      <td className="">
                        <span className="font-semibold text-dark-900 text-base">{slot.inicio}</span>
                      </td>

                      {/* Cliente */}
                      <td className="p-2">
                        {esCerrado ? (
                          <span className="text-gray-500 text-sm font-medium italic">{slot.label}</span>
                        ) : esTurno ? (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{ backgroundColor: profesionalSeleccionado?.color || "#3498db" }}
                            >
                              {(estado.data.cliente_nombre || estado.data.cliente_nombre_completo || "?")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-dark-900 text-sm">
                                {estado.data.cliente_nombre || estado.data.cliente_nombre_completo}{" "}
                                {estado.data.apellido || ""}
                              </p>
                              {estado.data.saldo_pendiente > 0 && (
                                <p className="text-xs text-red-600 font-medium">
                                  Saldo: ${estado.data.saldo_pendiente.toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : esBloqueado ? (
                          <span className="text-red-700 font-semibold text-sm">
                            🔒 Bloqueado{estado.data.motivo ? ` — ${estado.data.motivo}` : ""}
                          </span>
                        ) : esSobreturno ? (
                          <span className="text-orange-600 text-sm font-medium">Sobreturno disponible</span>
                        ) : (
                          <span className="text-green-600 text-sm">Disponible</span>
                        )}
                      </td>

                      {/* Servicio */}
                      <td className="p-2">
                        {esTurno ? <span className="text-sm text-dark-700">{estado.data.servicio_nombre}</span> : null}
                      </td>

                      {/* Estado */}
                      <td className="p-2">
                        {esTurno && (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getBadgeEstado(estado.data.estado)}`}
                          >
                            {estado.data.estado}
                          </span>
                        )}
                      </td>

                      {/* Precio */}
                      <td className="p-2">
                        {esTurno && estado.data.precio && (
                          <span className="text-sm font-semibold text-dark-800">
                            ${Number(estado.data.precio).toLocaleString()}
                          </span>
                        )}
                      </td>

                      {/* Tiempo */}
                      <td className="p-2">
                        {esTurno ? (
                          <span className="text-sm text-dark-500">{estado.data.duracion} min</span>
                        ) : (
                          <span className="text-xs text-dark-400">30 min</span>
                        )}
                      </td>

                      {/* Observaciones */}
                      <td className="p-2">
                        {esTurno && estado.data.notas ? (
                          <div className="relative group">
                            <svg
                              className="w-5 h-5 text-blue-500 cursor-pointer"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                              />
                            </svg>
                            <div className="absolute z-10 hidden group-hover:block bg-dark-900 text-white text-xs rounded-lg p-2 w-48 bottom-6 left-0 shadow-lg">
                              {estado.data.notas}
                            </div>
                          </div>
                        ) : null}
                      </td>

                      {/* Bloquear horario */}
                      <td className="p-2">
                        <div className="flex items-center justify-center gap-2">
                          {esTurno && (
                            <>
                              <button
                                onClick={() => handleWhatsApp(estado.data)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="WhatsApp"
                              >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                              </button>
                              {(estado.data.estado === "pendiente" || estado.data.estado === "confirmado") && (
                                <button
                                  onClick={() => handleCompletar(estado.data.id)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Completar turno"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </button>
                              )}
                              {(estado.data.estado === "pendiente" || estado.data.estado === "confirmado") && (
                                <button
                                  onClick={() => handleCancelar(estado.data.id)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Cancelar turno"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              )}
                            </>
                          )}
                          {(estado.tipo === "libre" || esSobreturno) && (
                            <button
                              onClick={() => handleBloquear(slot)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Bloquear horario"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                              </svg>
                            </button>
                          )}
                          {esBloqueado && (
                            <button
                              onClick={() => handleDesbloquear(estado.data.id)}
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Desbloquear"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                                />
                              </svg>
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
        )}
      </div>

      {/* Modal Bloqueo */}
      <Modal isOpen={showModalBloqueo} onClose={() => setShowModalBloqueo(false)} title="Bloquear Horario" size="sm">
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              <strong>Horario:</strong> {bloqueoPorCrear?.inicio} - {bloqueoPorCrear?.fin}
            </p>
          </div>
          <div>
            <label className="label">Motivo (opcional)</label>
            <input
              type="text"
              value={motivoBloqueo}
              onChange={(e) => setMotivoBloqueo(e.target.value)}
              placeholder="Ej: Turno médico"
              className="input"
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowModalBloqueo(false)} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button onClick={handleConfirmarBloqueo} className="btn-primary flex-1 bg-red-600 hover:bg-red-700">
              Bloquear
            </button>
          </div>
        </div>
      </Modal>

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
              <strong>💡 Info:</strong> Habilitá horarios fuera del horario habitual.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Hora Inicio *</label>
              <input
                type="time"
                value={formSobreturno.hora_inicio}
                onChange={(e) => setFormSobreturno({ ...formSobreturno, hora_inicio: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Hora Fin *</label>
              <input
                type="time"
                value={formSobreturno.hora_fin}
                onChange={(e) => setFormSobreturno({ ...formSobreturno, hora_fin: e.target.value })}
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="label">Motivo (opcional)</label>
            <input
              type="text"
              value={formSobreturno.motivo}
              onChange={(e) => setFormSobreturno({ ...formSobreturno, motivo: e.target.value })}
              placeholder="Ej: Sobreturno excepcional"
              className="input"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModalSobreturno(false)} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button onClick={handleCrearSobreturno} className="btn-primary flex-1">
              Crear Sobreturno
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminAgenda;
