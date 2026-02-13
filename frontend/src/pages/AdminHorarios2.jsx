import React, { useState, useEffect } from "react";
import Sidebar from "../components/admin/Sidebar";
import Modal from "../components/booking/common/Modal";
import axios from "axios";

const AdminHorarios2 = () => {
  const [profesionales, setProfesionales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [guardando, setGuardando] = useState(false);

  const diasSemana = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  useEffect(() => {
    cargarProfesionales();
  }, []);

  const cargarProfesionales = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/profesionales",
      );
      setProfesionales(response.data);
    } catch (error) {
      console.error("Error cargando profesionales:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGestionarHorarios = async (profesional) => {
    setProfesionalSeleccionado(profesional);

    try {
      const response = await axios.get(
        `http://localhost:5000/api/profesionales/${profesional.id}/horarios/all`,
      );

      const horariosExistentes = response.data;
      const horariosCompletos = diasSemana.map((dia) => {
        const existente = horariosExistentes.find((h) => h.dia_semana === dia);
        return (
          existente || {
            dia_semana: dia,
            hora_inicio: "09:00",
            hora_fin: "13:00",
            hora_inicio_tarde: "14:00",
            hora_fin_tarde: "20:00",
            activo: 0,
            profesional_id: profesional.id,
          }
        );
      });

      setHorarios(horariosCompletos);
      setShowModal(true);
    } catch (error) {
      console.error("Error cargando horarios:", error);
    }
  };

  const handleHorarioChange = (index, field, value) => {
    const nuevosHorarios = [...horarios];
    nuevosHorarios[index][field] = value;
    setHorarios(nuevosHorarios);
  };

  const handleToggleActivo = (index) => {
    const nuevosHorarios = [...horarios];
    nuevosHorarios[index].activo = nuevosHorarios[index].activo ? 0 : 1;
    setHorarios(nuevosHorarios);
  };

  const handleToggleMañana = (index) => {
    const nuevosHorarios = [...horarios];
    if (nuevosHorarios[index].hora_inicio) {
      // Deshabilitar mañana
      nuevosHorarios[index].hora_inicio = null;
      nuevosHorarios[index].hora_fin = null;
    } else {
      // Habilitar mañana
      nuevosHorarios[index].hora_inicio = "09:00";
      nuevosHorarios[index].hora_fin = "13:00";
    }
    setHorarios(nuevosHorarios);
  };

  const handleToggleTarde = (index) => {
    const nuevosHorarios = [...horarios];
    if (nuevosHorarios[index].hora_inicio_tarde) {
      // Deshabilitar tarde
      nuevosHorarios[index].hora_inicio_tarde = null;
      nuevosHorarios[index].hora_fin_tarde = null;
    } else {
      // Habilitar tarde
      nuevosHorarios[index].hora_inicio_tarde = "14:00";
      nuevosHorarios[index].hora_fin_tarde = "20:00";
    }
    setHorarios(nuevosHorarios);
  };

  const handleGuardar = async () => {
    setGuardando(true);

    try {
      for (const horario of horarios) {
        await axios.post(
          `http://localhost:5000/api/profesionales/${profesionalSeleccionado.id}/horarios`,
          {
            dia_semana: horario.dia_semana,
            hora_inicio: horario.hora_inicio,
            hora_fin: horario.hora_fin,
            hora_inicio_tarde: horario.hora_inicio_tarde,
            hora_fin_tarde: horario.hora_fin_tarde,
            activo: horario.activo,
          },
        );
      }

      alert("Horarios guardados correctamente");
      setShowModal(false);
    } catch (error) {
      console.error("Error guardando horarios:", error);
      alert("Error al guardar los horarios");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark-900 mb-2">
            Horarios de Trabajo
          </h1>
          <p className="text-dark-600">
            Configura los días y horarios de cada profesional (mañana y tarde)
          </p>
        </div>

        {loading ? (
          <div className="card p-12 text-center">
            <div className="spinner w-12 h-12 mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profesionales.map((prof) => (
              <div
                key={prof.id}
                className="card p-6 hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                    style={{
                      background: `linear-gradient(135deg, ${prof.color} 0%, ${prof.color}dd 100%)`,
                    }}
                  >
                    {prof.nombre.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-dark-900">
                      {prof.nombre}
                    </h3>
                    <p className="text-sm text-dark-600">Profesional</p>
                  </div>
                </div>

                <button
                  onClick={() => handleGestionarHorarios(prof)}
                  className="btn-primary w-full"
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Configurar Horarios
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Horarios de ${profesionalSeleccionado?.nombre}`}
        size="xl"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> Podés desactivar mañana, tarde, o todo el
              día según necesites.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-dark-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-bold text-dark-900">
                    Día
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-bold text-dark-900">
                    Día
                    <br />
                    Activo
                  </th>
                  <th className="px-2 py-3 text-center text-xs text-dark-600">
                    Inicio
                  </th>
                  <th className="px-2 py-3 text-center text-xs text-dark-600">
                    Fin
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-bold text-dark-900">
                    🌅 MAÑANA
                    <br />
                    ON/OFF
                  </th>
                  <th className="px-2 py-3 text-center text-xs text-dark-600">
                    Inicio
                  </th>
                  <th className="px-2 py-3 text-center text-xs text-dark-600">
                    Fin
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-bold text-dark-900">
                    🌆 TARDE
                    <br />
                    ON/OFF
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-200">
                {horarios.map((horario, index) => (
                  <tr
                    key={index}
                    className={
                      horario.activo ? "bg-white" : "bg-dark-50 opacity-60"
                    }
                  >
                    <td className="px-3 py-3 font-semibold text-dark-900">
                      {horario.dia_semana}
                    </td>

                    {/* Toggle Día Completo */}
                    <td className="px-3 py-3 text-center">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={horario.activo === 1}
                          onChange={() => handleToggleActivo(index)}
                          className="sr-only peer"
                        />
                        <div className="relative w-10 h-5 bg-dark-200 peer-focus:outline-none peer-focus:ring-3 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600"></div>
                      </label>
                    </td>

                    {/* === MAÑANA === */}

                    {/* Hora Inicio Mañana */}
                    <td className="px-2 py-3">
                      <input
                        type="time"
                        value={horario.hora_inicio || ""}
                        onChange={(e) =>
                          handleHorarioChange(
                            index,
                            "hora_inicio",
                            e.target.value,
                          )
                        }
                        disabled={!horario.activo || !horario.hora_inicio}
                        className="input input-sm text-xs w-24"
                      />
                    </td>

                    {/* Hora Fin Mañana */}
                    <td className="px-2 py-3">
                      <input
                        type="time"
                        value={horario.hora_fin || ""}
                        onChange={(e) =>
                          handleHorarioChange(index, "hora_fin", e.target.value)
                        }
                        disabled={!horario.activo || !horario.hora_inicio}
                        className="input input-sm text-xs w-24"
                      />
                    </td>

                    {/* Toggle Mañana */}
                    <td className="px-2 py-3 text-center">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!horario.hora_inicio}
                          onChange={() => handleToggleMañana(index)}
                          disabled={!horario.activo}
                          className="sr-only peer"
                        />
                        <div className="relative w-10 h-5 bg-dark-200 peer-focus:outline-none peer-focus:ring-3 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-40"></div>
                      </label>
                    </td>

                    {/* === TARDE === */}

                    {/* Hora Inicio Tarde */}
                    <td className="px-2 py-3">
                      <input
                        type="time"
                        value={horario.hora_inicio_tarde || ""}
                        onChange={(e) =>
                          handleHorarioChange(
                            index,
                            "hora_inicio_tarde",
                            e.target.value,
                          )
                        }
                        disabled={!horario.activo || !horario.hora_inicio_tarde}
                        className="input input-sm text-xs w-24"
                      />
                    </td>

                    {/* Hora Fin Tarde */}
                    <td className="px-2 py-3">
                      <input
                        type="time"
                        value={horario.hora_fin_tarde || ""}
                        onChange={(e) =>
                          handleHorarioChange(
                            index,
                            "hora_fin_tarde",
                            e.target.value,
                          )
                        }
                        disabled={!horario.activo || !horario.hora_inicio_tarde}
                        className="input input-sm text-xs w-24"
                      />
                    </td>

                    {/* Toggle Tarde */}
                    <td className="px-2 py-3 text-center">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!horario.hora_inicio_tarde}
                          onChange={() => handleToggleTarde(index)}
                          disabled={!horario.activo}
                          className="sr-only peer"
                        />
                        <div className="relative w-10 h-5 bg-dark-200 peer-focus:outline-none peer-focus:ring-3 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600 peer-disabled:opacity-40"></div>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Leyenda */}
          <div className="bg-dark-50 rounded-lg p-4 text-xs">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <strong className="text-dark-900">Día Activo:</strong>
                <p className="text-dark-600">
                  Habilita/deshabilita todo el día
                </p>
              </div>
              <div>
                <strong className="text-blue-700">Mañana ON:</strong>
                <p className="text-dark-600">
                  Habilita/deshabilita solo la mañana
                </p>
              </div>
              <div>
                <strong className="text-green-700">Tarde ON:</strong>
                <p className="text-dark-600">
                  Habilita/deshabilita solo la tarde
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-dark-200">
            <button
              onClick={() => setShowModal(false)}
              className="btn-secondary flex-1"
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              className="btn-primary flex-1"
              disabled={guardando}
            >
              {guardando ? (
                <>
                  <div className="spinner w-5 h-5" />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminHorarios2;
