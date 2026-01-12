import axios from "axios";

const token = localStorage.getItem("token");

export default axios.create({
  // baseURL: "http://localhost:8080/api",
  // baseURL: "https://nadi-buhrain-render-site.onrender.com/api",
  baseURL: "https://srv1252888.hstgr.cloud/api",
  headers: { Authorization: `Bearer ${token}` },
});