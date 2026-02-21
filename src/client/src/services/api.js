import axios from "axios";

/* ================= 1. UNIFIED AXIOS INSTANCE ================= */
// Using Port 3000 (Standardizing on your working backend)
const API = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

/* ================= 2. AUTH COMPATIBILITY LAYER ================= */
// PROBLEM: You save token in 'profile', Vedant looks for 'authToken'.
// SOLUTION: We make these helper functions look at YOUR 'profile' storage.
// This ensures Vedant's components work even when logged in via your system.

export const getAuthToken = () => {
  // Primary: unified key
  const token = localStorage.getItem("authToken");
  if (token) return token;

  // Legacy fallback: profile object
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

// Vedant's pages call this function manually. We keep it so they don't crash.
export const getAuthHeaders = () => ({
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getAuthToken()}`,
  },
});

/* ================= 3. AUTOMATIC INTERCEPTOR (Best Practice) ================= */
// This handles auth for all YOUR new requests automatically
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
// We use API.patch directly, but if Vedant's code passed headers manually, the interceptor handles it now.
export const updateHackathon = (id, data) => API.patch(`/hackathons/${id}`, data);
export const updateHackathonStatus = (id, status) => API.patch(`/hackathons/${id}/status`, { status });
export const getHackathonById = (id) => API.get(`/hackathons/${id}`);
export const getHackathonTeams = (id) => API.get(`/hackathons/${id}/teams`);
export const registerTeam = (data) => API.post("/teams", data);
export const requestJoinTeam = (teamId) => API.post(`/teams/${teamId}/join`);
export const getCalendarEvents = () => API.get("/calendar");

/* ================= JUDGE APIs (From Vedant) ================= */
// We keep these exports so his Admin Dashboard works
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