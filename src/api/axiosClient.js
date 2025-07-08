import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://localhost:7116",
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const empresaId = localStorage.getItem("empresaId");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (empresaId) config.headers["X-EmpresaId"] = empresaId;
  return config;
});

export default axiosClient;