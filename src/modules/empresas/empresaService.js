import api from '../../api/axiosClient';

export const getEmpresas = () => api.get('/api/empresas');
export const createEmpresa = (empresa) => api.post('/api/empresas', empresa);
export const updateEmpresa = (id, empresa) => api.put(`/api/empresas/${id}`, empresa);
export const deleteEmpresa = (id) => api.delete(`/api/empresas/${id}`);
