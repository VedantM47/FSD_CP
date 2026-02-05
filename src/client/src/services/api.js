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
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};


// Helper function to handle API errors
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    throw {
      status: error.response.status,
      message: error.response.data.message || 'An error occurred',
      data: error.response.data
    };
  } else if (error.request) {
    // Request made but no response
    throw {
      status: 0,
      message: 'Network error. Please check your connection.',
      data: null
    };
  } else {
    // Something else happened
    throw {
      status: 0,
      message: error.message || 'An unexpected error occurred',
      data: null
    };
  }
};

// Axios instance configuration
export const axiosConfig = {
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Add auth token to requests
export const getAuthHeaders = () => ({
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`,
  },
});

export { API, getAuthToken, handleApiError };