// src/services/presupuestoService.ts (o .js)
import api from "@/utils/api";

export const getPresupuestos = () => api.get("/api/presupuesto");
export const getPresupuestoById = (id) => api.get(`/api/presupuesto/${id}`);
export const updatePresupuesto = (id, data) => api.put(`/api/presupuesto/${id}`, data);
export const deletePresupuesto = (id) => api.delete(`/api/presupuesto/${id}`);

export const createPresupuesto = (data) =>
  api.post("/api/presupuestos/importar", data);

/** NUEVO: evidencias por proyecto */
export const getEvidenciasPorProyecto = (proyectoId) =>
  api.get(`/api/evidencia/por-proyecto/${proyectoId}`);


/** NUEVO: evidencias por ítem */
export const getEvidenciasPorItem = (itemId) =>
  api.get(`/api/EvidenciasItem/por-item/${itemId}`, {
    // Swagger te mostró 'accept: text/plain'; normalmente JSON funciona sin esto.
    // Déjalo si tu backend lo requiere:
    headers: { Accept: "text/plain" },
  });