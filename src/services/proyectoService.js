import api from "@/utils/api";

export const getProyectos = (page = 1, pageSize = 10) =>
  api.get(`/api/Proyecto?page=${page}&pageSize=${pageSize}`);

export const getProyectoById = (id) =>
  api.get(`/api/Proyecto/${id}`);

export const createProyecto = (data) =>
  api.post("/api/Proyecto", data);

export const updateProyecto = (id, data) =>
  api.put(`/api/Proyecto/${id}`, data);

export const deleteProyecto = (id) =>
  api.delete(`/api/Proyecto/${id}`);
