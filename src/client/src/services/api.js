import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

API.interceptors.request.use((req) => {
  if (localStorage.getItem("profile")) {
    req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem("profile")).token}`;
  }
  return req;
});

/* ================= AUTH APIs ================= */
export const signIn = (formData) => API.post("/users/login", formData);
export const signUp = (formData) => API.post("/users/register", formData);

/* ================= ADMIN APIs ================= */
export const getAdminDashboard = () => API.get("/admin/dashboard");
export const getAdminHackathons = () => API.get("/admin/hackathons");
export const createHackathon = (data) => API.post("/hackathons", data);
export const updateHackathon = (id, data) => API.patch(`/hackathons/${id}`, data);
export const updateHackathonStatus = (id, status) => API.patch(`/hackathons/${id}/status`, { status });

/* ================= PARTICIPANT APIs ================= */
export const getHackathonById = (id) => API.get(`/hackathons/${id}`);
export const registerTeam = (data) => API.post("/teams", data);
export const getHackathonTeams = (hackathonId) => API.get(`/hackathons/${hackathonId}/teams`);
export const searchUsers = (query) => API.get(`/users/search?query=${query}`);
export const requestJoinTeam = (teamId) => API.post(`/teams/${teamId}/join`);
export default API;