import {
  format,
  parse,
  addMinutes,
  isAfter,
  isBefore,
  startOfWeek,
  addDays,
} from "date-fns";
import { es } from "date-fns/locale";

export const formatDate = (date) => {
  return format(date, "yyyy-MM-dd");
};

export const formatDisplayDate = (dateString) => {
  const date = new Date(dateString + "T00:00:00");
  return format(date, "EEEE d 'de' MMMM", { locale: es });
};

export const formatTime = (timeString) => {
  return timeString;
};

export const parseTime = (timeString) => {
  const [hours, minutes] = timeString.split(":");
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return date;
};

export const addMinutesToTime = (timeString, minutes) => {
  const time = parseTime(timeString);
  const newTime = addMinutes(time, minutes);
  return format(newTime, "HH:mm");
};

export const generateTimeSlots = (horaInicio, horaFin, duracion) => {
  const slots = [];

  const [startHour, startMin] = horaInicio.split(":").map(Number);
  const [endHour, endMin] = horaFin.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  // El último slot debe poder terminar a la hora de cierre
  // Por ejemplo: si cierra a las 18:00 y el servicio dura 120 min,
  // el último slot puede empezar a las 16:00
  const lastSlotStart = endMinutes - duracion;

  for (
    let minutes = startMinutes;
    minutes <= lastSlotStart;
    minutes += duracion
  ) {
    const hour = Math.floor(minutes / 60);
    const min = minutes % 60;
    const endSlotMinutes = minutes + duracion;
    const endHour = Math.floor(endSlotMinutes / 60);
    const endMin = endSlotMinutes % 60;

    slots.push({
      inicio: `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`,
      fin: `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`,
    });
  }

  return slots;
};

export const getWeekDates = (startDate) => {
  const start = startOfWeek(startDate, { weekStartsOn: 1 }); // Lunes
  const dates = [];

  for (let i = 0; i < 7; i++) {
    dates.push(addDays(start, i));
  }

  return dates;
};

export const getDayName = (dayNumber) => {
  const days = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  return days[dayNumber];
};

export const isTimeSlotAvailable = (slot, turnosExistentes) => {
  return !turnosExistentes.some((turno) => {
    if (turno.estado === "cancelado") return false;

    const turnoInicio = turno.hora_inicio;
    const turnoFin = turno.hora_fin;

    // Verificar si hay superposición
    return (
      (slot.inicio < turnoFin && slot.fin > turnoInicio) ||
      (slot.inicio >= turnoInicio && slot.inicio < turnoFin) ||
      (slot.fin > turnoInicio && slot.fin <= turnoFin)
    );
  });
};

export default {
  formatDate,
  formatDisplayDate,
  formatTime,
  parseTime,
  addMinutesToTime,
  generateTimeSlots,
  getWeekDates,
  getDayName,
  isTimeSlotAvailable,
};
