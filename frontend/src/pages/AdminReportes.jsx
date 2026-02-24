import React, { useState, useEffect } from "react";
import Sidebar from "../components/admin/Sidebar";
import axios from "axios";

const AdminReportes = () => {
  const [periodo, setPeriodo] = useState("semana");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [loading, setLoading] = useState(false);

  const [reporteAsistencia, setReporteAsistencia] = useState(null);
  const [reporteServicios, setReporteServicios] = useState([]);
  const [reporteProfesionales, setReporteProfesionales] = useState([]);
  const [reporteIngresos, setReporteIngresos] = useState([]);

  useEffect(() => {
    calcularFechas(periodo);
  }, [periodo]);

  useEffect(() => {
    if (fechaDesde && fechaHasta) {
      cargarReportes();
    }
  }, [fechaDesde, fechaHasta]);

  const calcularFechas = (p) => {
    const hoy = new Date();
    let desde = new Date();

    switch (p) {
      case "hoy":
        desde = hoy;
        break;
      case "semana":
        desde.setDate(hoy.getDate() - 7);
        break;
      case "mes":
        desde.setMonth(hoy.getMonth() - 1);
        break;
      case "trimestre":
        desde.setMonth(hoy.getMonth() - 3);
        break;
    }

    setFechaDesde(desde.toISOString().split("T")[0]);
    setFechaHasta(hoy.toISOString().split("T")[0]);
  };

  const cargarReportes = async () => {
    setLoading(true);
    try {
      const params = { fecha_desde: fechaDesde, fecha_hasta: fechaHasta };

      const [asistencia, servicios, profesionales, ingresos] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/reportes/asistencia", { params }),
        axios.get("http://localhost:5000/api/admin/reportes/servicios", { params }),
        axios.get("http://localhost:5000/api/admin/reportes/profesionales", { params }),
        axios.get("http://localhost:5000/api/admin/reportes/ingresos", { params }),
      ]);

      setReporteAsistencia(asistencia.data);
      setReporteServicios(servicios.data);
      setReporteProfesionales(profesionales.data);
      setReporteIngresos(ingresos.data);
    } catch (error) {
      console.error("Error cargando reportes:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-dark-900 mb-2">Reportes</h1>
            <p className="text-dark-600">Análisis y estadísticas de tu negocio</p>
          </div>

          {/* Filtros */}
          <div className="card p-6 mb-8">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="label">Período</label>
                <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} className="input">
                  <option value="hoy">Hoy</option>
                  <option value="semana">Última Semana</option>
                  <option value="mes">Último Mes</option>
                  <option value="trimestre">Último Trimestre</option>
                  <option value="personalizado">Personalizado</option>
                </select>
              </div>

              {periodo === "personalizado" && (
                <>
                  <div className="flex-1 min-w-[200px]">
                    <label className="label">Desde</label>
                    <input
                      type="date"
                      value={fechaDesde}
                      onChange={(e) => setFechaDesde(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="label">Hasta</label>
                    <input
                      type="date"
                      value={fechaHasta}
                      onChange={(e) => setFechaHasta(e.target.value)}
                      className="input"
                    />
                  </div>
                </>
              )}

              <button onClick={cargarReportes} className="btn-primary mt-6">
                Actualizar
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="spinner w-12 h-12"></div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              {reporteAsistencia && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="card p-6">
                    <div className="text-sm text-dark-600 mb-1">Total Turnos</div>
                    <div className="text-3xl font-bold text-dark-900">{reporteAsistencia.total}</div>
                  </div>
                  <div className="card p-6">
                    <div className="text-sm text-dark-600 mb-1">Completados</div>
                    <div className="text-3xl font-bold text-green-600">{reporteAsistencia.completados}</div>
                  </div>
                  <div className="card p-6">
                    <div className="text-sm text-dark-600 mb-1">Cancelados</div>
                    <div className="text-3xl font-bold text-red-600">{reporteAsistencia.cancelados}</div>
                  </div>
                  <div className="card p-6">
                    <div className="text-sm text-dark-600 mb-1">% Asistencia</div>
                    <div className="text-3xl font-bold text-blue-600">{reporteAsistencia.porcentaje_asistencia}%</div>
                  </div>
                </div>
              )}

              {/* Resumen Financiero */}
              <div className="card p-6 mb-8">
                <h2 className="text-2xl font-bold text-dark-900 mb-6">Resumen Financiero</h2>
                {reporteIngresos.length === 0 ? (
                  <p className="text-center py-8 text-dark-500">No hay datos en este período</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
                      <p className="text-sm text-green-700 font-medium mb-1">Total Cobrado</p>
                      <p className="text-3xl font-bold text-green-900">
                        $
                        {reporteIngresos
                          .reduce((sum, dia) => sum + parseInt(dia.total_pagado || 0), 0)
                          .toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200">
                      <p className="text-sm text-orange-700 font-medium mb-1">Saldo Pendiente</p>
                      <p className="text-3xl font-bold text-orange-900">
                        $
                        {reporteIngresos
                          .reduce((sum, dia) => sum + parseInt(dia.total_pendiente || 0), 0)
                          .toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
                      <p className="text-sm text-blue-700 font-medium mb-1">Total Esperado</p>
                      <p className="text-3xl font-bold text-blue-900">
                        $
                        {reporteIngresos
                          .reduce(
                            (sum, dia) => sum + parseInt(dia.total_pagado || 0) + parseInt(dia.total_pendiente || 0),
                            0,
                          )
                          .toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Top Servicios y Profesionales */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="card p-6">
                  <h2 className="text-2xl font-bold text-dark-900 mb-6">Top Servicios</h2>
                  {reporteServicios.length === 0 ? (
                    <p className="text-center py-8 text-dark-500">No hay datos en este período</p>
                  ) : (
                    <div className="space-y-4">
                      {reporteServicios.map((servicio, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-dark-900">{servicio.nombre}</p>
                              <p className="text-sm text-dark-600">{servicio.categoria}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-dark-900">{servicio.cantidad} turnos</p>
                            {servicio.ingresos > 0 && (
                              <p className="text-sm text-green-600">${parseInt(servicio.ingresos).toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card p-6">
                  <h2 className="text-2xl font-bold text-dark-900 mb-6">Performance por Profesional</h2>
                  {reporteProfesionales.length === 0 ? (
                    <p className="text-center py-8 text-dark-500">No hay datos en este período</p>
                  ) : (
                    <div className="space-y-4">
                      {reporteProfesionales.map((prof, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: prof.color }}></div>
                              <span className="font-semibold text-dark-900">{prof.nombre}</span>
                            </div>
                            <span className="font-bold text-dark-900">{prof.total_turnos} turnos</span>
                          </div>
                          <div className="flex gap-4 text-sm">
                            <span className="text-green-600">✓ {prof.completados} completados</span>
                            <span className="text-red-600">✗ {prof.cancelados} cancelados</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Tabla Ingresos */}
              <div className="card p-6">
                <h2 className="text-2xl font-bold text-dark-900 mb-6">Ingresos por Día</h2>
                {reporteIngresos.length === 0 ? (
                  <p className="text-center py-8 text-dark-500">No hay datos en este período</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4">Fecha</th>
                          <th className="text-center py-3 px-4">Turnos</th>
                          <th className="text-right py-3 px-4">Pagado</th>
                          <th className="text-right py-3 px-4">Pendiente</th>
                          <th className="text-right py-3 px-4">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reporteIngresos.map((dia, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-3 px-4">{dia.fecha}</td>
                            <td className="text-center py-3 px-4">{dia.cantidad_turnos}</td>
                            <td className="text-right py-3 px-4 text-green-600">
                              ${parseInt(dia.total_pagado || 0).toLocaleString()}
                            </td>
                            <td className="text-right py-3 px-4 text-orange-600">
                              ${parseInt(dia.total_pendiente || 0).toLocaleString()}
                            </td>
                            <td className="text-right py-3 px-4 font-bold">
                              ${parseInt((dia.total_pagado || 0) + (dia.total_pendiente || 0)).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReportes;
