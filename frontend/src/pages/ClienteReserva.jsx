import React, { useState, useEffect } from "react";
import Calendar from "../components/booking/Calendar";
import TimeSlotSelector from "../components/booking/TimeSlotSelector";
import {
  getServicios,
  getProfesionales,
  getTurnos,
  createTurno,
  getConfiguracion,
} from "../services/api";
import { formatDate } from "../utils/dateUtils";
import { useCliente } from "../contexts/ClienteContext";
import axios from "axios";

const ClienteReserva = () => {
  const { cliente } = useCliente() || { cliente: null };
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
    apellido: "", // ← AGREGAR
    whatsapp: "",
    email: "",
    notas: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadServicios();
    loadProfesionales();
    loadConfiguracion();
  }, []);

  useEffect(() => {
    if (formData.fecha && formData.profesional) {
      loadTurnosDelDia();
    }
  }, [formData.fecha, formData.profesional]);

  const loadServicios = async () => {
    try {
      const response = await getServicios();
      setServicios(response.data);
    } catch (error) {
      console.error("Error cargando servicios:", error);
    }
  };

  const loadProfesionales = async () => {
    try {
      const response = await getProfesionales();
      setProfesionales(response.data);
    } catch (error) {
      console.error("Error cargando profesionales:", error);
    }
  };

  const loadConfiguracion = async () => {
    try {
      const response = await getConfiguracion();
      setConfiguracion(response.data);
    } catch (error) {
      console.error("Error cargando configuración:", error);
    }
  };

  const loadTurnosDelDia = async () => {
    try {
      const fechaStr = formatDate(formData.fecha);
      const response = await getTurnos({
        fecha_desde: fechaStr,
        fecha_hasta: fechaStr,
        profesional_id: formData.profesional.id,
      });
      setTurnosExistentes(response.data);
    } catch (error) {
      console.error("Error cargando turnos:", error);
    }
  };

  const handleServicioSelect = async (servicio) => {
    setFormData({ ...formData, servicio, profesional: null });

    // Cargar profesionales que ofrecen este servicio
    try {
      const response = await axios.get(
        `http://localhost:5000/api/servicios/${servicio.id}/profesionales`,
      );
      setProfesionales(response.data);
    } catch (error) {
      console.error("Error cargando profesionales del servicio:", error);
    }

    setStep(2);
  };

  const handleProfesionalSelect = async (profesional) => {
    setFormData({ ...formData, profesional, fecha: null, horario: null });

    // Cargar horarios del profesional seleccionado
    try {
      const response = await axios.get(
        `http://localhost:5000/api/profesionales/${profesional.id}/horarios`,
      );
      setConfiguracion(response.data);
    } catch (error) {
      console.error("Error cargando horarios del profesional:", error);
    }

    setStep(3);
  };
  const handleDateSelect = (fecha) => {
    setFormData({ ...formData, fecha, horario: null });
  };

  const handleTimeSelect = (horario) => {
    setFormData({ ...formData, horario });
    setStep(4);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Calcular precio y saldo
      const precioServicio = formData.servicio.precio || 0;

      await createTurno({
        servicio_id: formData.servicio.id,
        profesional_id: formData.profesional.id,
        cliente_id: cliente?.id || null,
        cliente_nombre:
          formData.nombre && formData.apellido
            ? `${formData.nombre} ${formData.apellido}`
            : `${cliente?.nombre} ${cliente?.apellido}`,
        cliente_whatsapp: formData.whatsapp || cliente?.whatsapp,
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
      apellido: "", // ← AGREGAR
      whatsapp: "",
      email: "",
      notas: "",
    });
    setStep(1);
    setSuccess(false);
    setError("");
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
        <div className="max-w-2xl w-full">
          <div className="card text-center p-12">
            {/* Success Icon */}
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl ring-8 ring-green-100 animate-scale-in">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            {/* Success Message */}
            <h2 className="text-4xl font-bold text-dark-900 mb-4">
              ¡Reserva Confirmada!
            </h2>
            <p className="text-xl text-dark-600 mb-8">
              Tu turno ha sido agendado exitosamente
            </p>

            {/* Booking Details */}
            <div className="bg-gradient-to-br from-brand-50 to-accent-50 rounded-2xl p-8 mb-8 border-2 border-brand-200">
              <h3 className="text-lg font-bold text-dark-900 mb-6">
                Detalles de tu Reserva
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-brand-200/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
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
                    <span className="text-sm font-medium text-dark-600">
                      Servicio
                    </span>
                  </div>
                  <span className="text-lg font-bold text-dark-900">
                    {formData.servicio.nombre}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-brand-200/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-dark-600">
                      Profesional
                    </span>
                  </div>
                  <span className="text-lg font-bold text-dark-900">
                    {formData.profesional.nombre}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-brand-200/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
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
                    <span className="text-sm font-medium text-dark-600">
                      Fecha
                    </span>
                  </div>
                  <span className="text-lg font-bold text-dark-900">
                    {formatDate(formData.fecha)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
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
                    </div>
                    <span className="text-sm font-medium text-dark-600">
                      Horario
                    </span>
                  </div>
                  <span className="text-lg font-bold text-dark-900">
                    {formData.horario.inicio}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={resetForm} className="btn-primary btn-lg">
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
                Agendar Otro Turno
              </button>
            </div>

            {/* Footer Note */}
            <p className="text-sm text-dark-500 mt-8">
              Te enviaremos un recordatorio por WhatsApp 24 horas antes
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 md:py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl mb-6 shadow-lg shadow-brand-500/30 rotate-3">
            <svg
              className="w-8 h-8 text-white"
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
          <h1 className="text-5xl md:text-6xl font-bold text-dark-900 mb-4">
            Agenda tu <span className="gradient-text-brand">Cita</span>
          </h1>
          <p className="text-xl text-dark-600 max-w-2xl mx-auto">
            Reserva tu turno en minutos con nuestros especialistas
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {[
              {
                num: 1,
                label: "Servicio",
                icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
              },
              {
                num: 2,
                label: "Especialista",
                icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
              },
              {
                num: 3,
                label: "Fecha y Hora",
                icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
              },
              {
                num: 4,
                label: "Confirmar",
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
              },
            ].map((s, index) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center">
                  <div
                    className={
                      step >= s.num
                        ? "step-active"
                        : step > s.num
                          ? "step-completed"
                          : "step-inactive"
                    }
                  >
                    {step > s.num ? (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={s.icon}
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`mt-3 text-sm font-semibold hidden sm:block ${step >= s.num ? "text-brand-600" : "text-dark-400"}`}
                  >
                    {s.label}
                  </span>
                </div>
                {index < 3 && (
                  <div
                    className={
                      step > s.num ? "step-line-active" : "step-line-inactive"
                    }
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="max-w-3xl mx-auto mb-8 animate-slide-down">
            <div className="alert-error flex items-start gap-3">
              <svg
                className="w-6 h-6 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h4 className="font-bold mb-1">Error al crear la reserva</h4>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Service Selection */}
          {step === 1 && (
            <div className="animate-slide-up">
              <div className="card p-8 md:p-12">
                <h2 className="text-3xl font-bold text-dark-900 mb-2">
                  Selecciona tu Servicio
                </h2>
                <p className="text-dark-600 mb-8">
                  Elige el tratamiento que deseas realizar
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  {servicios.map((servicio) => (
                    <button
                      key={servicio.id}
                      onClick={() => handleServicioSelect(servicio)}
                      className="service-card group text-left"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <svg
                            className="w-6 h-6 text-white"
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
                        <svg
                          className="w-6 h-6 text-brand-500 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>

                      <h3 className="text-xl font-bold text-dark-900 mb-2 group-hover:text-brand-600 transition-colors">
                        {servicio.nombre}
                      </h3>

                      <div className="flex items-center gap-2 text-dark-600">
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
                        <span className="font-medium">
                          {servicio.duracion} minutos
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Professional Selection */}
          {step === 2 && (
            <div className="animate-slide-up">
              <div className="card p-8 md:p-12">
                <button
                  onClick={() => setStep(1)}
                  className="btn-ghost btn-sm mb-6"
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Volver
                </button>

                <h2 className="text-3xl font-bold text-dark-900 mb-2">
                  Elige tu Especialista
                </h2>
                <p className="text-dark-600 mb-8">
                  Selecciona con quien prefieres realizar el tratamiento
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {profesionales.map((prof) => (
                    <button
                      key={prof.id}
                      onClick={() => handleProfesionalSelect(prof)}
                      className="professional-card group"
                    >
                      <div className="professional-avatar group-hover:scale-110 transition-transform">
                        <span className="text-3xl">👤</span>
                      </div>
                      <h3 className="font-bold text-dark-900 group-hover:text-brand-600 transition-colors">
                        {prof.nombre}
                      </h3>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Date and Time Selection */}
          {step === 3 && (
            <div className="space-y-6 animate-slide-up">
              <button onClick={() => setStep(2)} className="btn-ghost btn-sm">
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Volver
              </button>

              <Calendar
                selectedDate={formData.fecha}
                onDateSelect={handleDateSelect}
                configuracion={configuracion}
              />

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

          {/* Step 4: Contact Information */}
          {step === 4 && (
            <div className="animate-slide-up">
              <div className="card p-8 md:p-12">
                <button
                  onClick={() => setStep(3)}
                  className="btn-ghost btn-sm mb-6"
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Volver
                </button>

                {/* Info del cliente logueado - SI EXISTE */}
                {cliente && (
                  <div className="bg-gradient-to-r from-brand-50 to-accent-50 rounded-xl p-4 mb-6 border-2 border-brand-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold">
                        {cliente.nombre.charAt(0)}
                        {cliente.apellido.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-dark-900">
                          {cliente.nombre} {cliente.apellido}
                        </p>
                        <p className="text-sm text-dark-600">
                          WhatsApp: {cliente.whatsapp}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <h2 className="text-3xl font-bold text-dark-900 mb-2">
                  Confirma tu Reserva
                </h2>
                <p className="text-dark-600 mb-8">
                  Completa tus datos para finalizar la agenda
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Solo mostrar campos si NO hay cliente logueado */}
                  {!cliente && (
                    <>
                      <div>
                        <label className="label">Nombre *</label>
                        <input
                          type="text"
                          value={formData.nombre}
                          onChange={(e) =>
                            setFormData({ ...formData, nombre: e.target.value })
                          }
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
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              apellido: e.target.value,
                            })
                          }
                          className="input"
                          placeholder="González"
                          required
                        />
                      </div>

                      <div>
                        <label className="label">WhatsApp *</label>
                        <input
                          type="tel"
                          value={formData.whatsapp}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              whatsapp: e.target.value,
                            })
                          }
                          className="input"
                          placeholder="+54 9 11 1234-5678"
                          required
                        />
                        <p className="text-sm text-dark-500 mt-2">
                          Te enviaremos un recordatorio 24 horas antes
                        </p>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="label">Email (Opcional)</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="input"
                      placeholder="maria@ejemplo.com"
                    />
                  </div>

                  <div>
                    <label className="label">Notas (Opcional)</label>
                    <textarea
                      value={formData.notas}
                      onChange={(e) =>
                        setFormData({ ...formData, notas: e.target.value })
                      }
                      className="input resize-none"
                      rows="3"
                      placeholder="¿Tienes alguna alergia o requerimiento especial?"
                    />
                  </div>

                  {/* Summary */}
                  <div className="bg-gradient-to-br from-brand-50 to-accent-50 rounded-2xl p-6 border-2 border-brand-200">
                    <h3 className="font-bold text-lg text-dark-900 mb-4">
                      Resumen de tu Reserva
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-dark-600">Servicio</span>
                        <span className="font-semibold text-dark-900">
                          {formData.servicio.nombre}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-600">Especialista</span>
                        <span className="font-semibold text-dark-900">
                          {formData.profesional.nombre}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-600">Fecha</span>
                        <span className="font-semibold text-dark-900">
                          {formatDate(formData.fecha)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-600">Horario</span>
                        <span className="font-semibold text-dark-900">
                          {formData.horario.inicio} - {formData.horario.fin}
                        </span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-brand-200">
                        <span className="text-dark-600">Duración</span>
                        <span className="font-semibold text-dark-900">
                          {formData.servicio.duracion} minutos
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary btn-xl w-full"
                  >
                    {loading ? (
                      <>
                        <div className="spinner w-6 h-6" />
                        Confirmando...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Confirmar Reserva
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClienteReserva;
