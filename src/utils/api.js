// src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://localhost:44381/api",
});

// Interceptor para adjuntar token, empresaId y roles automáticamente
api.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const user = JSON.parse(storedUser);

      // Token JWT
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }

      // EmpresaId
      if (user.empresaId) {
        config.headers["EmpresaId"] = user.empresaId;
      }

      // Roles (como JSON string o lista separada por comas)
      if (user.roles) {
        if (Array.isArray(user.roles)) {
          config.headers["Roles"] = user.roles.join(",");
        } else {
          config.headers["Roles"] = user.roles; // por si ya viene como string
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
