import React, { useState } from "react";
import {
  addDays,
  startOfWeek,
  format,
  isSameDay,
  isBefore,
  startOfDay,
} from "date-fns";
import { es } from "date-fns/locale";

const Calendar = ({ selectedDate, onDateSelect, configuracion }) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const getWeekDates = () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const isDayAvailable = (date) => {
    const dayOfWeek = date.getDay();
    return configuracion.some((config) => config.dia_semana === dayOfWeek);
  };

  const weekDates = getWeekDates();
  const today = startOfDay(new Date());

  const nextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7));
  };

  const prevWeek = () => {
    setCurrentWeek(addDays(currentWeek, -7));
  };

  const canGoPrevious = !isBefore(addDays(weekDates[0], -7), today);

  return (
    <div className="card p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={prevWeek}
          disabled={!canGoPrevious}
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <h3 className="text-2xl font-bold text-dark-900">
          {format(weekDates[0], "MMMM yyyy", { locale: es })}
        </h3>

        <button onClick={nextWeek} className="btn-secondary btn-md">
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

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-3">
        {weekDates.map((date, index) => {
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isAvailable = isDayAvailable(date);
          const isPast = isBefore(startOfDay(date), today);
          const isToday = isSameDay(date, new Date());

          return (
            <button
              key={index}
              onClick={() => isAvailable && !isPast && onDateSelect(date)}
              disabled={!isAvailable || isPast}
              className={`
                ${isSelected ? "calendar-day-selected" : ""}
                ${!isSelected && isAvailable && !isPast ? "calendar-day-available" : ""}
                ${!isAvailable || isPast ? "calendar-day-disabled" : ""}
                ${isToday && !isSelected ? "calendar-day-today" : ""}
              `}
            >
              <div className="text-xs font-bold mb-2 uppercase tracking-wider">
                {format(date, "EEEEEE", { locale: es })}
              </div>
              <div className="text-2xl font-bold">{format(date, "d")}</div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-dark-200">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-brand-500 to-brand-600"></div>
          <span className="text-sm text-dark-600">Seleccionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white border-2 border-dark-200"></div>
          <span className="text-sm text-dark-600">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-dark-50"></div>
          <span className="text-sm text-dark-600">No disponible</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
