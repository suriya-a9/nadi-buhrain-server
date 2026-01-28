import axios from "axios";

const token = localStorage.getItem("token");

const api = axios.create({
  // baseURL: "http://localhost:8080/api",
  // baseURL: "https://nadi-buhrain-render-site.onrender.com/api",
  baseURL: "https://srv1252888.hstgr.cloud/api",
  // headers: { Authorization: `Bearer ${token}` },
});
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;