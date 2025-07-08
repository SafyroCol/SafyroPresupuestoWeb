// src/services/authService.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const login = (data) => api.post("/api/Auth/login", data).then((res) => res.data);

export const activar2FA = (email) =>
  api.post("/api/Auth/activar-2fa", { email }).then((res) => res.data);
