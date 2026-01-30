import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

// ADMIN APIs
export const getAdminDashboard = () => API.get("/admin/dashboard");
export const getAdminHackathons = () => API.get("/admin/hackathons");
export const getHackathonById = (id) => API.get(`/hackathons/${id}`);
export const createHackathon = (data) => API.post("/hackathons", data);
export const updateHackathon = (id, data) =>
  API.patch(`/hackathons/${id}`, data);
export const updateHackathonStatus = (id, status) =>
  API.patch(`/hackathons/${id}/status`, { status });

export default API;
