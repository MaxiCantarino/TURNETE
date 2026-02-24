import React, { useState, useEffect } from "react";
import { generateTimeSlotsWithBreak, isTimeSlotAvailable } from "../../utils/dateUtils";
import axios from "axios";

const TimeSlotSelector = ({
  configuracion,
  selectedDate,
  duracionServicio,
  turnosExistentes,
  onTimeSelect,
  selectedTime,
  profesionalId,
}) => {
  const [sobreturnos, setSobreturnos] = useState([]);
  const [bloquesBloqueados, setBloquesBloqueados] = useState([]);

  useEffect(() => {
    if (selectedDate && profesionalId) {
      cargarSobreturnos();
      cargarBloquesBloqueados();
    } else {
      setSobreturnos([]);
      setBloquesBloqueados([]);
    }
  }, [selectedDate, profesionalId]);

  const cargarSobreturnos = async () => {
    if (!selectedDate || !profesionalId) return;

    try {
      const fechaStr = selectedDate.toISOString().split("T")[0];
      const response = await axios.get("http://localhost:5000/api/sobreturnos", {
        params: {
          fecha: fechaStr,
          profesional_id: profesionalId,
        },
      });
      setSobreturnos(response.data);
    } catch (error) {
      console.error("Error cargando sobreturnos:", error);
    }
  };

  const cargarBloquesBloqueados = async () => {
    if (!selectedDate || !profesionalId) return;

    try {
      const fechaStr = selectedDate.toISOString().split("T")[0];
      const response = await axios.get("http://localhost:5000/api/bloques-bloqueados", {
        params: {
          fecha_desde: fechaStr,
          fecha_hasta: fechaStr,
          profesional_id: profesionalId,
        },
      });
      setBloquesBloqueados(response.data);
    } catch (error) {
      console.error("Error cargando bloques bloqueados:", error);
    }
  };

  if (!selectedDate || !configuracion.length) {
    return (
      <div className="card p-12 text-center">
        <div className="w-20 h-20 rounded-full bg-dark-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-dark-900 mb-2">Selecciona una fecha</h3>
        <p className="text-dark-600">Elige un día del calendario para ver los horarios disponibles</p>
      </div>
    );
  }

  // Convertir número de día a nombre del día
  const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const dayName = dayNames[selectedDate.getDay()];

  // Buscar configuración por nombre del día
  const configDelDia = configuracion.find((c) => c.dia_semana === dayName);

  // Generar slots regulares (de los horarios configurados)
  let slotsRegulares = [];
  if (configDelDia && configDelDia.hora_inicio && configDelDia.hora_fin) {
    slotsRegulares = generateTimeSlotsWithBreak(
      configDelDia.hora_inicio,
      configDelDia.hora_fin,
      configDelDia.hora_inicio_tarde,
      configDelDia.hora_fin_tarde,
      duracionServicio,
    );
  }

  // Generar slots de sobreturnos
  const slotsSobreturnos = sobreturnos.flatMap((sobreturno) => {
    const slots = [];
    const [startHour, startMin] = sobreturno.hora_inicio.split(":").map(Number);
    const [endHour, endMin] = sobreturno.hora_fin.split(":").map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const lastSlotStart = endMinutes - duracionServicio;

    for (let minutes = startMinutes; minutes <= lastSlotStart; minutes += duracionServicio) {
      const hour = Math.floor(minutes / 60);
      const min = minutes % 60;
      const endSlotMinutes = minutes + duracionServicio;
      const endHour = Math.floor(endSlotMinutes / 60);
      const endMin = endSlotMinutes % 60;

      slots.push({
        inicio: `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`,
        fin: `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`,
        esSobreturno: true,
      });
    }

    return slots;
  });

  // Combinar slots regulares y sobreturnos, eliminar duplicados
  const todosLosSlots = [...slotsRegulares, ...slotsSobreturnos].sort((a, b) => a.inicio.localeCompare(b.inicio));

  // Filtrar disponibles
  const availableSlots = todosLosSlots.filter((slot) => {
    // Verificar si está bloqueado
    const estaBloqueado = bloquesBloqueados.some(
      (bloque) => slot.inicio >= bloque.hora_inicio && slot.inicio < bloque.hora_fin,
    );

    if (estaBloqueado) return false;

    // Verificar si está disponible (no ocupado por turno)
    return isTimeSlotAvailable(slot, turnosExistentes);
  });

  if (todosLosSlots.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-dark-900 mb-2">Día no laborable</h3>
        <p className="text-dark-600">No hay atención disponible para este día</p>
      </div>
    );
  }

  return (
    <div className="card p-8">
      {/* Header with counter */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-dark-900">Horarios Disponibles</h3>
        <div className="badge-brand text-base px-4 py-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {availableSlots.length} disponibles
        </div>
      </div>

      {/* Time Slots Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {todosLosSlots.map((slot, index) => {
          const isAvailable = isTimeSlotAvailable(slot, turnosExistentes);
          const isSelected = selectedTime?.inicio === slot.inicio;

          return (
            <button
              key={index}
              onClick={() => isAvailable && onTimeSelect(slot)}
              disabled={!isAvailable}
              className={`
                relative
                ${isSelected ? "time-slot-selected" : ""}
                ${!isSelected && isAvailable ? "time-slot-available" : ""}
                ${!isAvailable ? "time-slot-disabled" : ""}
                ${slot.esSobreturno && isAvailable ? "ring-2 ring-orange-400" : ""}
              `}
            >
              {slot.esSobreturno && <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></div>}
              <div className="font-bold text-base">{slot.inicio}</div>
              {!isAvailable && <div className="text-xs mt-1">Ocupado</div>}
              {slot.esSobreturno && isAvailable && <div className="text-xs mt-1 text-orange-600">Extra</div>}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-dark-200">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-r from-brand-500 to-brand-600"></div>
          <span className="text-sm text-dark-600">Seleccionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white border-2 border-dark-200"></div>
          <span className="text-sm text-dark-600">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-dark-50"></div>
          <span className="text-sm text-dark-600">Ocupado</span>
        </div>
        {slotsSobreturnos.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-white border-2 border-orange-400 relative">
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
            </div>
            <span className="text-sm text-dark-600">Horario Extra</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeSlotSelector;
