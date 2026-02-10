import axios from "axios";

const API_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ========== SERVICIOS ==========
export const getServicios = () => api.get("/servicios");
export const createServicio = (data) => api.post("/servicios", data);

// ========== PROFESIONALES ==========
export const getProfesionales = () => api.get("/profesionales");
export const createProfesional = (data) => api.post("/profesionales", data);

// ========== TURNOS ==========
export const getTurnos = (params) => api.get("/turnos", { params });
export const createTurno = (data) => api.post("/turnos", data);
export const updateEstadoTurno = (id, estado) =>
  api.put(`/turnos/${id}/estado`, { estado });
export const deleteTurno = (id) => api.delete(`/turnos/${id}`);

// ========== CONFIGURACIÓN ==========
export const getConfiguracion = () => api.get("/configuracion");

// ========== CLIENTES (NUEVO) ==========
export const buscarClientePorDNI = (dni) => api.get(`/clientes/dni/${dni}`);
export const crearCliente = (data) => api.post("/clientes", data);
export const obtenerHistorialCliente = (clienteId) =>
  api.get(`/clientes/${clienteId}/turnos`);
export const actualizarDeudaCliente = (clienteId, saldoDeuda) =>
  api.put(`/clientes/${clienteId}/deuda`, { saldo_deuda: saldoDeuda });
export const obtenerClientes = () => api.get("/clientes");

export default api;
