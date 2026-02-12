import React, { useState, useMemo } from "react";

const Calendar = ({ selectedDate, onDateSelect, configuracion = [] }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Ajustar para que lunes sea el primer día
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      days.push(date);
    }
    return days;
  }, [currentWeekStart]);

  const isDayAvailable = (date) => {
    // No permitir fechas pasadas
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) return false;

    // Si no hay configuración, permitir todos los días futuros
    if (!configuracion || configuracion.length === 0) return true;

    // Verificar si hay horarios para este día de la semana
    const dayNames = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    const dayName = dayNames[date.getDay()];

    return configuracion.some(
      (config) => config.dia_semana === dayName && config.activo !== 0,
    );
  };

  const handlePrevWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const handleToday = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
  };

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
  };

  const getWeekRange = () => {
    const start = weekDays[0];
    const end = weekDays[6];
    return `${start.getDate()} ${start.toLocaleDateString("es-AR", { month: "short" })} - ${end.getDate()} ${end.toLocaleDateString("es-AR", { month: "short", year: "numeric" })}`;
  };

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={handlePrevWeek} className="btn-ghost btn-sm">
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
          Anterior
        </button>

        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-dark-900">{getWeekRange()}</h3>
          <button onClick={handleToday} className="btn-ghost btn-sm text-xs">
            Hoy
          </button>
        </div>

        <button onClick={handleNextWeek} className="btn-ghost btn-sm">
          Siguiente
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-3">
        {["LU", "MA", "MI", "JU", "VI", "SÁ", "DO"].map((dayName, index) => {
          const date = weekDays[index];
          const isAvailable = isDayAvailable(date);
          const isSelected =
            selectedDate && formatDate(date) === formatDate(selectedDate);
          const isToday = formatDate(date) === formatDate(new Date());

          return (
            <button
              key={index}
              onClick={() => isAvailable && onDateSelect(date)}
              disabled={!isAvailable}
              className={`
                flex flex-col items-center p-4 rounded-xl transition-all
                ${isAvailable ? "hover:bg-brand-50 hover:shadow-md cursor-pointer" : "cursor-not-allowed opacity-40"}
                ${isSelected ? "bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg scale-105" : "bg-dark-50"}
                ${isToday && !isSelected ? "ring-2 ring-brand-500" : ""}
              `}
            >
              <span
                className={`text-xs font-semibold mb-1 ${isSelected ? "text-white" : "text-dark-500"}`}
              >
                {dayName}
              </span>
              <span
                className={`text-2xl font-bold ${isSelected ? "text-white" : "text-dark-900"}`}
              >
                {date.getDate()}
              </span>
              <span
                className={`text-xs ${isSelected ? "text-white" : "text-dark-500"}`}
              >
                {formatDisplayDate(date).split(" ")[1]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="flex items-center justify-center gap-6 mt-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-br from-brand-500 to-brand-600 rounded"></div>
          <span className="text-dark-600">Seleccionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-dark-100 rounded"></div>
          <span className="text-dark-600">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-dark-100 opacity-40 rounded"></div>
          <span className="text-dark-600">No disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 ring-2 ring-brand-500 rounded"></div>
          <span className="text-dark-600">Hoy</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
