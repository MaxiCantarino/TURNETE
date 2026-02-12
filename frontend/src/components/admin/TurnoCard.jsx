import React from "react";

const TurnoCard = ({ turno, onCancelar, onWhatsApp }) => {
  const getEstadoClass = (estado) => {
    const classes = {
      pendiente: "badge-warning",
      confirmado: "badge-success",
      cancelado: "badge-error",
      completado: "badge-info",
    };
    return classes[estado] || "badge";
  };

  const formatPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("54")) return cleaned;
    if (cleaned.startsWith("9")) return "54" + cleaned;
    return "549" + cleaned;
  };

  const handleWhatsApp = () => {
    const phone = formatPhone(turno.cliente_whatsapp || turno.telefono);
    const mensaje = `Hola ${turno.cliente_nombre || turno.cliente_nombre_completo}! Te recordamos tu turno de ${turno.servicio_nombre} el ${turno.fecha} a las ${turno.hora_inicio}. ¡Te esperamos! 😊`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  // Color del profesional (con fallback)
  const profesionalColor = turno.profesional_color || "#3498db";

  return (
    <div
      className="card p-4 hover:shadow-lg transition-all border-l-4"
      style={{ borderLeftColor: profesionalColor }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-dark-900">{turno.servicio_nombre}</h3>
            <span className={getEstadoClass(turno.estado)}>{turno.estado}</span>
          </div>
          <p className="text-sm text-dark-600">
            {turno.cliente_nombre || turno.cliente_nombre_completo}{" "}
            {turno.apellido || ""}
          </p>
          {turno.dni && (
            <p className="text-xs text-dark-500">DNI: {turno.dni}</p>
          )}
        </div>

        <div className="text-right">
          <p className="font-bold text-dark-900">{turno.hora_inicio}</p>
          <p className="text-sm text-dark-600">{turno.duracion} min</p>
          {turno.precio && (
            <p className="text-sm font-semibold text-brand-600">
              ${turno.precio.toLocaleString()}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs mb-3">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: profesionalColor }}
        />
        <span className="text-dark-500">{turno.profesional_nombre}</span>
      </div>

      {turno.saldo_pendiente > 0 && (
        <div className="bg-red-50 rounded-lg p-2 mb-3">
          <p className="text-xs font-semibold text-red-700">
            Saldo pendiente: ${turno.saldo_pendiente.toLocaleString()}
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleWhatsApp}
          className="btn-ghost btn-sm flex-1 text-green-600 hover:bg-green-50"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </button>

        {turno.estado === "pendiente" && (
          <button
            onClick={() => onCancelar(turno.id)}
            className="btn-ghost btn-sm text-red-600 hover:bg-red-50"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
};

export default TurnoCard;
