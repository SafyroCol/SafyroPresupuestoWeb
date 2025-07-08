import api from "@/utils/api";

export const getEmpresas = (page = 1, pageSize = 10, search = "") =>
  api.get(`/api/Empresa?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`);

export const getEmpresaById = (id) =>
  api.get(`/api/Empresa/${id}`);

export const createEmpresa = (data) =>
  api.post("/api/Empresa", data);

export const updateEmpresa = (id, data) =>
  api.put(`/api/Empresa/${id}`, data);

export const deleteEmpresa = (id) =>
  api.delete(`/api/Empresa/${id}`);
