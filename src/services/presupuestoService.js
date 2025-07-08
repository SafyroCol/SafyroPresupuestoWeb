import api from "@/utils/api";

export const getPresupuestos = () => api.get("/api/presupuesto");
export const getPresupuestoById = (id) => api.get(`/api/presupuesto/${id}`);
export const updatePresupuesto = (id, data) => api.put(`/api/presupuesto/${id}`, data);
export const deletePresupuesto = (id) => api.delete(`/api/presupuesto/${id}`);

export const createPresupuesto = (data) =>
  api.post("/api/presupuestos/importar", data);