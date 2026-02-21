import axios from "axios";

/* ================= 1. UNIFIED AXIOS INSTANCE ================= */
<<<<<<< HEAD
// Using Port 3000 (Standardizing on your working backend)
export const API = axios.create({
  baseURL: "http://localhost:3000/api",
=======
const API = axios.create({
  baseURL: "http://localhost:8080/api",
>>>>>>> 41a8399a1e11d148aeff7148603dd6b1e4043a78
  withCredentials: true,
});

/* ================= 2. AUTH COMPATIBILITY LAYER ================= */
export const getAuthToken = () => {
  const token = localStorage.getItem("authToken");
  if (token) return token;

  try {
    const profile = localStorage.getItem("profile");
    if (profile) {
      const parsed = JSON.parse(profile);
      return parsed?.token || null;
    }
  } catch (err) {
    console.error("❌ Auth Token Error:", err);
  }
  return null;
};

export const getAuthHeaders = () => ({
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getAuthToken()}`,
  },
});

/* ================= 3. AUTOMATIC INTERCEPTOR ================= */
API.interceptors.request.use((req) => {
  const token = getAuthToken();
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

/* ================= AUTH APIs ================= */
export const signIn = (formData) => API.post("/users/login", formData);
export const signUp = (formData) => API.post("/users/register", formData);
export const getMe = () => API.get("/users/me");
export const searchUsers = (query) => API.get(`/users/search?q=${query}`);

/* ================= PROFILE APIs ================= */
export const getMyProfile = () => API.get("/profile/me");
export const updateMyProfile = (data) => API.put("/users/me", data);

/* ================= ADMIN APIs ================= */
export const getAdminDashboard = () => API.get("/admin/dashboard");
export const getAdminHackathons = () => API.get("/admin/hackathons");
export const getAdminSubmissions = () => API.get("/admin/submissions");
export const getAdminTeams = () => API.get("/admin/teams");
export const getHackathonOverview = (id) => API.get(`/admin/hackathons/${id}/overview`);
export const createHackathon = (data) => API.post("/hackathons", data);
export const updateHackathon = (id, data) => API.patch(`/hackathons/${id}`, data);
export const updateHackathonStatus = (id, status) => API.patch(`/hackathons/${id}/status`, { status });

/* ================= HACKATHON APIs ================= */
// Public — no auth required
export const getAllHackathons = () => API.get("/hackathons");

// Requires auth — supports ?q=<text>&status=<open|ongoing|closed|draft>
export const searchHackathons = (query = '', status = '') => {
  const params = new URLSearchParams();
  if (query)  params.set('q', query);
  if (status) params.set('status', status);
  return API.get(`/hackathons/search?${params.toString()}`);
};

export const getHackathonById = (id) => API.get(`/hackathons/${id}`);
export const getHackathonTeams = (id) => API.get(`/hackathons/${id}/teams`);

/* ================= TEAM APIs ================= */
export const registerTeam = (data) => API.post("/teams", data);
export const requestJoinTeam = (teamId) => API.post(`/teams/${teamId}/join`);

/* ================= CALENDAR ================= */
export const getCalendarEvents = () => API.get("/calendar");

/* ================= JUDGE APIs ================= */
export const getAllJudges = () => API.get("/admin/judges");
export const assignJudgesToHackathon = (hackathonId, judgeIds) =>
  API.post(
    `/admin/hackathons/${hackathonId}/judges`,
    { judgeIds },
    getAuthHeaders()
  );

/* ================= ERROR HANDLER ================= */
export const handleApiError = (error) => {
  if (error.response) {
    return {
      success: false,
      status: error.response.status,
      message: error.response.data?.message || 'Server error',
      data: error.response.data,
    };
  }
  if (error.request) {
    return {
      success: false,
      status: 0,
      message: 'Network error. Server not reachable.',
      data: null,
    };
  }
  return {
    success: false,
    status: 0,
    message: error.message || 'Unexpected error',
    data: null,
  };
};

export default API;