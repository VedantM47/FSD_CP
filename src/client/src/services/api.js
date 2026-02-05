import axios from "axios";

/* ================= AXIOS INSTANCE ================= */
export const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

/* ================= AUTH HELPERS ================= */
export const getAuthToken = () => {
  return localStorage.getItem("authToken");
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
 bcac1889cbd99d24e6cbb4a14e6cc58ee3e1ce47
export const getAuthHeaders = () => ({
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getAuthToken()}`,
  },
});
