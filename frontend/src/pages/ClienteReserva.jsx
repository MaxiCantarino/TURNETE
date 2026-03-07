import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Calendar from "../components/booking/Calendar";
import TimeSlotSelector from "../components/booking/TimeSlotSelector";
import { formatDate } from "../utils/dateUtils";
import { useCliente } from "../contexts/ClienteContext";
import axios from "axios";

const API = "http://localhost:5000/api";

const ClienteReserva = () => {
  const { cliente } = useCliente() || { cliente: null };
  const [searchParams] = useSearchParams();
  const slug = searchParams.get("negocio");

  const [negocio, setNegocio] = useState(null);
  const [negocioError, setNegocioError] = useState("");
  const [step, setStep] = useState(1);
  const [servicios, setServicios] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [configuracion, setConfiguracion] = useState([]);
  const [turnosExistentes, setTurnosExistentes] = useState([]);
  const [formData, setFormData] = useState({
    servicio: null,
    profesional: null,
    fecha: null,
    horario: null,
    nombre: "",
    apellido: "",
    whatsapp: "",
    email: "",
    notas: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) {
      setNegocioError("No se especificó ningún negocio. Usá el link que te proporcionaron.");
      return;
    }
    cargarNegocio();
  }, [slug]);

  useEffect(() => {
    if (formData.fecha && formData.profesional) loadTurnosDelDia();
  }, [formData.fecha, formData.profesional]);

  const cargarNegocio = async () => {
    try {
      const res = await axios.get(`${API}/public/${slug}/configuracion`);
      setNegocio(res.data);
      // Aplicar color primario del negocio
      if (res.data.color_primario) {
        document.documentElement.style.setProperty("--color-brand", res.data.color_primario);
      }
      cargarServicios();
    } catch (error) {
      if (error.response?.status === 404) setNegocioError("Negocio no encontrado.");
      else if (error.response?.status === 403) setNegocioError("Este negocio está temporalmente inactivo.");
      else setNegocioError("Error cargando el negocio.");
    }
  };

  const cargarServicios = async () => {
    try {
      const res = await axios.get(`${API}/public/${slug}/servicios`);
      setServicios(res.data);
    } catch (error) {
      console.error("Error cargando servicios:", error);
    }
  };

  const loadTurnosDelDia = async () => {
    try {
      const fechaStr = formatDate(formData.fecha);
      const res = await axios.get(`${API}/public/${slug}/turnos`, {
        params: { fecha_desde: fechaStr, fecha_hasta: fechaStr, profesional_id: formData.profesional.id },
      });
      setTurnosExistentes(res.data);
    } catch (error) {
      console.error("Error cargando turnos:", error);
    }
  };

  const handleServicioSelect = async (servicio) => {
    setFormData({ ...formData, servicio, profesional: null });
    try {
      const res = await axios.get(`${API}/public/${slug}/servicios/${servicio.id}/profesionales`);
      setProfesionales(res.data);
    } catch (error) {
      console.error("Error cargando profesionales:", error);
    }
    setStep(2);
  };

  const handleProfesionalSelect = async (profesional) => {
    setFormData({ ...formData, profesional, fecha: null, horario: null });
    try {
      const res = await axios.get(`${API}/public/${slug}/profesionales/${profesional.id}/horarios`);
      setConfiguracion(res.data);
    } catch (error) {
      console.error("Error cargando horarios:", error);
    }
    setStep(3);
  };

  const handleDateSelect = (fecha) => setFormData({ ...formData, fecha, horario: null });
  const handleTimeSelect = (horario) => {
    setFormData({ ...formData, horario });
    setStep(4);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const nombreFinal = formData.nombre || cliente?.nombre;
      const apellidoFinal = formData.apellido || cliente?.apellido;
      const whatsappFinal = formData.whatsapp || cliente?.whatsapp;
      const precioServicio = formData.servicio.precio || 0;

      await axios.post(`${API}/public/${slug}/turnos`, {
        servicio_id: formData.servicio.id,
        profesional_id: formData.profesional.id,
        cliente_nombre: `${nombreFinal} ${apellidoFinal}`,
        cliente_whatsapp: whatsappFinal,
        fecha: formatDate(formData.fecha),
        hora_inicio: formData.horario.inicio,
        hora_fin: formData.horario.fin,
        precio_pagado: 0,
        saldo_pendiente: precioServicio,
        notas: formData.notas || null,
      });
      setSuccess(true);
    } catch (error) {
      setError(error.response?.data?.error || "Error al crear el turno");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      servicio: null,
      profesional: null,
      fecha: null,
      horario: null,
      nombre: "",
      apellido: "",
      whatsapp: "",
      email: "",
      notas: "",
    });
    setStep(1);
    setSuccess(false);
    setError("");
  };

  // Error de negocio
  if (negocioError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md w-full p-12 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-dark-900 mb-3">Oops</h2>
          <p className="text-dark-600">{negocioError}</p>
        </div>
      </div>
    );
  }

  if (!negocio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-12 h-12"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
        <div className="max-w-2xl w-full">
          <div className="card text-center p-12">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl ring-8 ring-green-100">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-dark-900 mb-4">¡Reserva Confirmada!</h2>
            <p className="text-xl text-dark-600 mb-8">
              Tu turno ha sido agendado en <strong>{negocio.nombre_negocio}</strong>
            </p>
            <div className="bg-gray-50 rounded-2xl p-8 mb-8">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-600">Servicio</span>
                  <span className="font-bold">{formData.servicio.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-600">Profesional</span>
                  <span className="font-bold">{formData.profesional.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-600">Fecha</span>
                  <span className="font-bold">{formatDate(formData.fecha)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-600">Horario</span>
                  <span className="font-bold">
                    {formData.horario.inicio} - {formData.horario.fin}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={resetForm} className="btn-primary btn-lg">
              Agendar Otro Turno
            </button>
            <p className="text-sm text-dark-500 mt-6">Te enviaremos un recordatorio por WhatsApp 24 horas antes</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 md:py-12">
      <div className="container-custom">
        {/* Header con datos del negocio */}
        <div className="text-center mb-12 animate-fade-in">
          {negocio.logo_url && (
            <img
              src={`http://localhost:5000${negocio.logo_url}`}
              alt={negocio.nombre_negocio}
              className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4 shadow-lg"
            />
          )}
          <h1 className="text-5xl md:text-6xl font-bold text-dark-900 mb-4">{negocio.nombre_negocio}</h1>
          {negocio.slogan && <p className="text-xl text-dark-600 max-w-2xl mx-auto">{negocio.slogan}</p>}
        </div>

        {/* Progress Indicator */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: "Servicio" },
              { num: 2, label: "Especialista" },
              { num: 3, label: "Fecha y Hora" },
              { num: 4, label: "Confirmar" },
            ].map((s, index) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center">
                  <div className={step >= s.num ? "step-active" : step > s.num ? "step-completed" : "step-inactive"}>
                    {step > s.num ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="font-bold">{s.num}</span>
                    )}
                  </div>
                  <span
                    className={`mt-3 text-sm font-semibold hidden sm:block ${step >= s.num ? "text-brand-600" : "text-dark-400"}`}
                  >
                    {s.label}
                  </span>
                </div>
                {index < 3 && <div className={step > s.num ? "step-line-active" : "step-line-inactive"} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {error && (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="alert-error">{error}</div>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          {/* Step 1 */}
          {step === 1 && (
            <div className="card p-8 md:p-12 animate-slide-up">
              <h2 className="text-3xl font-bold text-dark-900 mb-2">Seleccioná tu Servicio</h2>
              <p className="text-dark-600 mb-8">Elegí el tratamiento que deseás realizar</p>
              <div className="grid md:grid-cols-2 gap-4">
                {servicios.map((servicio) => (
                  <button
                    key={servicio.id}
                    onClick={() => handleServicioSelect(servicio)}
                    className="service-card group text-left"
                  >
                    <h3 className="text-xl font-bold text-dark-900 mb-2 group-hover:text-brand-600 transition-colors">
                      {servicio.nombre}
                    </h3>
                    <p className="text-dark-600 text-sm">{servicio.duracion} minutos</p>
                    {servicio.precio > 0 && (
                      <p className="text-brand-600 font-bold mt-1">
                        ${parseInt(servicio.precio).toLocaleString("es-AR")}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="card p-8 md:p-12 animate-slide-up">
              <button onClick={() => setStep(1)} className="btn-ghost btn-sm mb-6">
                ← Volver
              </button>
              <h2 className="text-3xl font-bold text-dark-900 mb-2">Elegí tu Especialista</h2>
              <p className="text-dark-600 mb-8">Seleccioná con quien preferís realizar el tratamiento</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {profesionales.map((prof) => (
                  <button
                    key={prof.id}
                    onClick={() => handleProfesionalSelect(prof)}
                    className="professional-card group"
                  >
                    <div
                      className="professional-avatar group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: prof.color || "#e91e63" }}
                    >
                      <span className="text-white font-bold text-2xl">{prof.nombre.charAt(0)}</span>
                    </div>
                    <h3 className="font-bold text-dark-900 group-hover:text-brand-600 transition-colors">
                      {prof.nombre}
                    </h3>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-6 animate-slide-up">
              <button onClick={() => setStep(2)} className="btn-ghost btn-sm">
                ← Volver
              </button>
              <Calendar selectedDate={formData.fecha} onDateSelect={handleDateSelect} configuracion={configuracion} />
              {formData.fecha && (
                <TimeSlotSelector
                  configuracion={configuracion}
                  selectedDate={formData.fecha}
                  duracionServicio={formData.servicio?.duracion}
                  turnosExistentes={turnosExistentes}
                  onTimeSelect={handleTimeSelect}
                  selectedTime={formData.horario}
                  profesionalId={formData.profesional?.id}
                />
              )}
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="card p-8 md:p-12 animate-slide-up">
              <button onClick={() => setStep(3)} className="btn-ghost btn-sm mb-6">
                ← Volver
              </button>
              <h2 className="text-3xl font-bold text-dark-900 mb-2">Confirmá tu Reserva</h2>
              <p className="text-dark-600 mb-8">Completá tus datos para finalizar</p>
              <form onSubmit={handleSubmit} className="space-y-6">
                {!cliente && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">Nombre *</label>
                        <input
                          type="text"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          className="input"
                          placeholder="María"
                          required
                        />
                      </div>
                      <div>
                        <label className="label">Apellido *</label>
                        <input
                          type="text"
                          value={formData.apellido}
                          onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                          className="input"
                          placeholder="González"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label">WhatsApp *</label>
                      <input
                        type="tel"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        className="input"
                        placeholder="+54 9 11 1234-5678"
                        required
                      />
                      <p className="text-sm text-dark-500 mt-2">Te enviaremos un recordatorio 24hs antes</p>
                    </div>
                  </>
                )}
                <div>
                  <label className="label">Notas (Opcional)</label>
                  <textarea
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    className="input resize-none"
                    rows="3"
                    placeholder="¿Tenés alguna alergia o requerimiento especial?"
                  />
                </div>

                {/* Resumen */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-bold text-lg text-dark-900 mb-4">Resumen</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-dark-600">Servicio</span>
                      <span className="font-bold">{formData.servicio.nombre}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-600">Especialista</span>
                      <span className="font-bold">{formData.profesional.nombre}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-600">Fecha</span>
                      <span className="font-bold">{formatDate(formData.fecha)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-600">Horario</span>
                      <span className="font-bold">
                        {formData.horario.inicio} - {formData.horario.fin}
                      </span>
                    </div>
                    {formData.servicio.precio > 0 && (
                      <div className="flex justify-between pt-3 border-t border-gray-200">
                        <span className="text-dark-600">Precio</span>
                        <span className="font-bold text-brand-600">
                          ${parseInt(formData.servicio.precio).toLocaleString("es-AR")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary btn-xl w-full">
                  {loading ? (
                    <>
                      <div className="spinner w-6 h-6" />
                      Confirmando...
                    </>
                  ) : (
                    "✅ Confirmar Reserva"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClienteReserva;
