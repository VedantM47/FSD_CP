import axios from "axios";

/* ================= AXIOS INSTANCE ================= */
export const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

/* ================= AUTH HELPERS ================= */
export const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

export const getAuthHeaders = () => ({
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getAuthToken()}`,
  },
});

/* ================= ADMIN APIs ================= */
export const getAdminDashboard = () => API.get("/admin/dashboard");
export const getAdminHackathons = () => API.get("/admin/hackathons");

/* ================= HACKATHON APIs ================= */
export const getHackathonById = (id) =>
  API.get(`/hackathons/${id}`);

export const createHackathon = (data) =>
  API.post("/hackathons", data, getAuthHeaders());

export const updateHackathon = (id, data) =>
  API.patch(`/hackathons/${id}`, data, getAuthHeaders());

export const updateHackathonStatus = (id, status) =>
  API.patch(`/hackathons/${id}/status`, { status }, getAuthHeaders());

/* ================= JUDGES ================= */
export const getAllJudges = () =>
  API.get("/admin/judges", getAuthHeaders());

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
