import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/", // URL de tu backend
  headers: {
    "Content-Type": "application/json",
  },
});

// Si usas autenticación por token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token"); // o donde guardes el JWT
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
