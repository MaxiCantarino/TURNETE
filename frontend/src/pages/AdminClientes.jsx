import React, { useState, useEffect } from "react";
import Sidebar from "../components/admin/Sidebar";
import { obtenerClientes } from "../services/api";

const AdminClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      const response = await obtenerClientes();
      setClientes(response.data);
    } catch (error) {
      console.error("Error cargando clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  const clientesFiltrados = clientes.filter((cliente) => {
    const searchLower = busqueda.toLowerCase();
    return (
      cliente.nombre.toLowerCase().includes(searchLower) ||
      cliente.apellido.toLowerCase().includes(searchLower) ||
      cliente.dni.includes(busqueda) ||
      (cliente.telefono && cliente.telefono.includes(busqueda))
    );
  });

  const handleWhatsApp = (cliente) => {
    const phone = cliente.telefono.replace(/\D/g, "");
    const phoneFormatted = phone.startsWith("549") ? phone : "549" + phone;
    const mensaje = `Hola ${cliente.nombre}! `;
    const url = `https://wa.me/${phoneFormatted}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark-900 mb-2">Clientes</h1>
          <p className="text-dark-600">Base de datos de clientes</p>
        </div>

        {/* Search Bar */}
        <div className="card p-6 mb-6">
          <div className="relative">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, DNI o teléfono..."
              className="input pl-12"
            />
            <svg
              className="w-5 h-5 text-dark-400 absolute left-4 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="card p-12 text-center">
            <div className="spinner w-12 h-12 mx-auto" />
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-dark-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <p className="text-dark-600">
              {busqueda
                ? "No se encontraron clientes"
                : "Aún no hay clientes registrados"}
            </p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-dark-900">
                      Cliente
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-dark-900">
                      DNI
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-dark-900">
                      Contacto
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-dark-900">
                      Edad
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-dark-900">
                      Deuda
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-dark-900">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-200">
                  {clientesFiltrados.map((cliente) => (
                    <tr
                      key={cliente.id}
                      className="hover:bg-dark-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold">
                            {cliente.nombre.charAt(0)}
                            {cliente.apellido.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-dark-900">
                              {cliente.nombre} {cliente.apellido}
                            </p>
                            {cliente.email && (
                              <p className="text-xs text-dark-500">
                                {cliente.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-dark-700">{cliente.dni}</td>
                      <td className="px-6 py-4 text-dark-700">
                        {cliente.telefono}
                      </td>
                      <td className="px-6 py-4 text-dark-700">
                        {cliente.edad || "-"}
                      </td>
                      <td className="px-6 py-4">
                        {cliente.saldo_deuda > 0 ? (
                          <span className="badge-error">
                            ${cliente.saldo_deuda.toLocaleString()}
                          </span>
                        ) : (
                          <span className="badge-success">Al día</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleWhatsApp(cliente)}
                          className="btn-ghost btn-sm text-green-600 hover:bg-green-50"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                          WhatsApp
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats Footer */}
        {!loading && clientesFiltrados.length > 0 && (
          <div className="mt-6 flex items-center justify-between text-sm text-dark-600">
            <p>
              Mostrando {clientesFiltrados.length} de {clientes.length} clientes
            </p>
            <p>
              Deuda total:{" "}
              <span className="font-bold text-dark-900">
                $
                {clientes
                  .reduce((sum, c) => sum + (c.saldo_deuda || 0), 0)
                  .toLocaleString()}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminClientes;
