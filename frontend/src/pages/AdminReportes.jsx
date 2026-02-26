import React, { useState, useEffect } from "react";
import Sidebar from "../components/admin/Sidebar";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AdminReportes = () => {
  const [periodo, setPeriodo] = useState("semana");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [loading, setLoading] = useState(false);
  const [reporteAsistencia, setReporteAsistencia] = useState(null);
  const [reporteServicios, setReporteServicios] = useState([]);
  const [reporteProfesionales, setReporteProfesionales] = useState([]);
  const [reporteIngresos, setReporteIngresos] = useState([]);
  const reporteRef = React.useRef(null);

  const exportarPDF = async () => {
    const elemento = reporteRef.current;
    if (!elemento) return;
    try {
      const canvas = await html2canvas(elemento, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();
      const fechaHoy = new Date().toLocaleDateString("es-AR");

      pdf.setFontSize(10);
      pdf.setTextColor(150);
      pdf.text(`Salon Paula - Reporte ${fechaDesde} al ${fechaHasta} - Generado el ${fechaHoy}`, pdfWidth / 2, 8, {
        align: "center",
      });

      let heightLeft = imgHeight;
      let position = 12;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight - position;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`reporte-${fechaDesde}-al-${fechaHasta}.pdf`);
    } catch (error) {
      alert("Error al generar el PDF");
      console.error(error);
    }
  };

  useEffect(() => {
    calcularFechas(periodo);
  }, [periodo]);
  useEffect(() => {
    if (fechaDesde && fechaHasta) cargarReportes();
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

  const dataTorta = reporteAsistencia
    ? [
        { name: "Completados", value: reporteAsistencia.completados, color: "#22c55e" },
        { name: "Cancelados", value: reporteAsistencia.cancelados, color: "#ef4444" },
        { name: "Pendientes", value: reporteAsistencia.pendientes, color: "#f59e0b" },
      ].filter((d) => d.value > 0)
    : [];

  const dataIngresos = reporteIngresos.map((dia) => ({
    fecha: new Date(dia.fecha).toLocaleDateString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      day: "2-digit",
      month: "2-digit",
    }),
    pagado: parseInt(dia.total_pagado || 0),
    pendiente: parseInt(dia.total_pendiente || 0),
  }));

  const dataServicios = reporteServicios.map((s) => ({
    nombre: s.nombre.length > 15 ? s.nombre.substring(0, 15) + "..." : s.nombre,
    turnos: parseInt(s.cantidad),
  }));

  const dataProfesionales = reporteProfesionales.map((p) => ({
    nombre: p.nombre,
    completados: parseInt(p.completados),
    cancelados: parseInt(p.cancelados),
  }));

  const totalCobrado = reporteIngresos.reduce((sum, d) => sum + parseInt(d.total_pagado || 0), 0);
  const totalPendiente = reporteIngresos.reduce((sum, d) => sum + parseInt(d.total_pendiente || 0), 0);

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
              <div className="flex gap-3 mt-6">
                <button onClick={cargarReportes} className="btn-primary">
                  Actualizar
                </button>
                <button onClick={exportarPDF} className="btn-secondary flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Exportar PDF
                </button>
              </div>
            </div>
          </div>

          {/* TODO EL CONTENIDO QUE SE EXPORTA */}
          <div ref={reporteRef}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="spinner w-12 h-12"></div>
              </div>
            ) : (
              <>
                {reporteAsistencia && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
                    <p className="text-sm text-green-700 font-medium mb-1">Total Cobrado</p>
                    <p className="text-3xl font-bold text-green-900">${totalCobrado.toLocaleString()}</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200">
                    <p className="text-sm text-orange-700 font-medium mb-1">Saldo Pendiente</p>
                    <p className="text-3xl font-bold text-orange-900">${totalPendiente.toLocaleString()}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
                    <p className="text-sm text-blue-700 font-medium mb-1">Total Esperado</p>
                    <p className="text-3xl font-bold text-blue-900">
                      ${(totalCobrado + totalPendiente).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <div className="card p-6 lg:col-span-2">
                    <h2 className="text-xl font-bold text-dark-900 mb-4">Ingresos por Día</h2>
                    {dataIngresos.length === 0 ? (
                      <p className="text-center py-8 text-dark-500">No hay datos en este período</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={dataIngresos}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                          <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="pagado"
                            name="Cobrado"
                            stroke="#22c55e"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="pendiente"
                            name="Pendiente"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  <div className="card p-6">
                    <h2 className="text-xl font-bold text-dark-900 mb-4">Estado de Turnos</h2>
                    {dataTorta.length === 0 ? (
                      <p className="text-center py-8 text-dark-500">No hay datos</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={dataTorta}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {dataTorta.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="card p-6">
                    <h2 className="text-xl font-bold text-dark-900 mb-4">Top Servicios</h2>
                    {dataServicios.length === 0 ? (
                      <p className="text-center py-8 text-dark-500">No hay datos en este período</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={dataServicios} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis type="number" tick={{ fontSize: 12 }} />
                          <YAxis dataKey="nombre" type="category" tick={{ fontSize: 11 }} width={100} />
                          <Tooltip />
                          <Bar dataKey="turnos" name="Turnos" fill="#e91e63" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  <div className="card p-6">
                    <h2 className="text-xl font-bold text-dark-900 mb-4">Performance por Profesional</h2>
                    {dataProfesionales.length === 0 ? (
                      <p className="text-center py-8 text-dark-500">No hay datos en este período</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={dataProfesionales}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="completados" name="Completados" fill="#22c55e" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="cancelados" name="Cancelados" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className="card p-6">
                  <h2 className="text-xl font-bold text-dark-900 mb-4">Detalle por Día</h2>
                  {reporteIngresos.length === 0 ? (
                    <p className="text-center py-8 text-dark-500">No hay datos en este período</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-100 border-b border-gray-200">
                            <th className="text-left p-3 text-sm font-semibold text-dark-600">Fecha</th>
                            <th className="text-center p-3 text-sm font-semibold text-dark-600">Turnos</th>
                            <th className="text-right p-3 text-sm font-semibold text-dark-600">Cobrado</th>
                            <th className="text-right p-3 text-sm font-semibold text-dark-600">Pendiente</th>
                            <th className="text-right p-3 text-sm font-semibold text-dark-600">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reporteIngresos.map((dia, index) => (
                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="p-3">
                                {new Date(dia.fecha).toLocaleDateString("es-AR", {
                                  timeZone: "America/Argentina/Buenos_Aires",
                                })}
                              </td>
                              <td className="text-center p-3">{dia.cantidad_turnos}</td>
                              <td className="text-right p-3 text-green-600 font-medium">
                                ${parseInt(dia.total_pagado || 0).toLocaleString()}
                              </td>
                              <td className="text-right p-3 text-orange-600 font-medium">
                                ${parseInt(dia.total_pendiente || 0).toLocaleString()}
                              </td>
                              <td className="text-right p-3 font-bold">
                                $
                                {(
                                  parseInt(dia.total_pagado || 0) + parseInt(dia.total_pendiente || 0)
                                ).toLocaleString()}
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
          {/* fin reporteRef */}
        </div>
      </div>
    </div>
  );
};

export default AdminReportes;
