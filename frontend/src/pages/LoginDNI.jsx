import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { buscarClientePorDNI, crearCliente } from "../services/api";
import { useCliente } from "../contexts/ClienteContext";
import Modal from "../components/booking/common/Modal";

const LoginDNI = () => {
  const navigate = useNavigate();
  const { login } = useCliente();

  const [dni, setDni] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRegistro, setShowRegistro] = useState(false);

  const [nuevoCliente, setNuevoCliente] = useState({
    dni: "",
    nombre: "",
    apellido: "",
    edad: "",
    telefono: "",
    email: "",
  });

  const handleBuscarDNI = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await buscarClientePorDNI(dni);

      if (response.data) {
        // Cliente encontrado
        login(response.data);
        navigate("/reservar");
      } else {
        // Cliente no encontrado, abrir modal de registro
        setNuevoCliente({ ...nuevoCliente, dni });
        setShowRegistro(true);
      }
    } catch (error) {
      console.error("Error buscando cliente:", error);
      setError("Error al buscar el DNI. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await crearCliente(nuevoCliente);

      if (response.data) {
        // Cliente creado exitosamente
        const clienteCompleto = {
          ...nuevoCliente,
          id: response.data.id,
          saldo_deuda: 0,
        };
        login(clienteCompleto);
        setShowRegistro(false);
        navigate("/reservar");
      }
    } catch (error) {
      console.error("Error creando cliente:", error);
      setError("Error al crear el cliente. Verifica los datos.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerHistorial = () => {
    navigate("/historial");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-accent-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-600 rounded-3xl mb-6 shadow-xl shadow-brand-500/30 rotate-3">
            <svg
              className="w-10 h-10 text-white"
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
          <h1 className="text-4xl font-bold text-dark-900 mb-2">
            Bienvenido a <span className="gradient-text-brand">Turnete</span>
          </h1>
          <p className="text-lg text-dark-600">Ingresa tu DNI para continuar</p>
        </div>

        {/* Main Card */}
        <div className="card p-8 animate-slide-up">
          <form onSubmit={handleBuscarDNI} className="space-y-6">
            <div>
              <label className="label">Documento Nacional de Identidad</label>
              <input
                type="text"
                value={dni}
                onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
                className="input text-center text-2xl tracking-wider"
                placeholder="12345678"
                maxLength="8"
                required
                autoFocus
              />
              <p className="text-sm text-dark-500 mt-2 text-center">
                Sin puntos ni espacios
              </p>
            </div>

            {error && (
              <div className="alert-error animate-slide-down">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || dni.length < 7}
              className="btn-primary btn-xl w-full"
            >
              {loading ? (
                <>
                  <div className="spinner w-6 h-6" />
                  Buscando...
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  Continuar
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-dark-200">
            <button onClick={handleVerHistorial} className="btn-ghost w-full">
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
              Ver mis turnos
            </button>
          </div>
        </div>

        {/* Info Footer */}
        <div className="text-center mt-6 text-sm text-dark-500">
          <p>¿Primera vez? Te registraremos automáticamente</p>
        </div>
      </div>

      {/* Modal de Registro */}
      <Modal
        isOpen={showRegistro}
        onClose={() => setShowRegistro(false)}
        title="Completá tus Datos"
        size="md"
      >
        <form onSubmit={handleRegistro} className="space-y-4">
          <div className="bg-brand-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-dark-700">
              <strong>DNI {nuevoCliente.dni}</strong> no está registrado.
              Completá tus datos para crear tu cuenta.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre *</label>
              <input
                type="text"
                value={nuevoCliente.nombre}
                onChange={(e) =>
                  setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })
                }
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Apellido *</label>
              <input
                type="text"
                value={nuevoCliente.apellido}
                onChange={(e) =>
                  setNuevoCliente({ ...nuevoCliente, apellido: e.target.value })
                }
                className="input"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Edad</label>
              <input
                type="number"
                value={nuevoCliente.edad}
                onChange={(e) =>
                  setNuevoCliente({ ...nuevoCliente, edad: e.target.value })
                }
                className="input"
                min="1"
                max="120"
              />
            </div>
            <div>
              <label className="label">Teléfono *</label>
              <input
                type="tel"
                value={nuevoCliente.telefono}
                onChange={(e) =>
                  setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })
                }
                className="input"
                placeholder="11 1234-5678"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Email (opcional)</label>
            <input
              type="email"
              value={nuevoCliente.email}
              onChange={(e) =>
                setNuevoCliente({ ...nuevoCliente, email: e.target.value })
              }
              className="input"
              placeholder="ejemplo@mail.com"
            />
          </div>

          {error && <div className="alert-error">{error}</div>}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowRegistro(false)}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? "Creando..." : "Crear Cuenta"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LoginDNI;
