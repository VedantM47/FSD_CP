import axios from "axios";

/* ================= 1. UNIFIED AXIOS INSTANCE ================= */
// Using Port 3000 (Standardizing on your working backend)


export const API = axios.create({
  baseURL: "http://localhost:8080/api",
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
export const getUserPublicProfile = (userId) => API.get(`/users/profile/${userId}`);
export const uploadUserResume = (formData) => API.post("/users/upload-resume", formData, {
  headers: { "Content-Type": "multipart/form-data", ...getAuthHeaders().headers }
});

/* ================= ADMIN APIs ================= */
export const getAdminDashboard = () => API.get("/admin/dashboard");
export const getAdminHackathons = () => API.get("/admin/hackathons");
export const getAdminSubmissions = () => API.get("/admin/submissions");
export const getAdminTeams = () => API.get("/admin/teams");
export const getHackathonOverview = (id) => API.get(`/admin/hackathons/${id}/overview`);
export const createHackathon = (data) => API.post("/hackathons", data);
export const updateHackathon = (id, data) => API.patch(`/hackathons/${id}`, data);
export const updateHackathonStatus = (id, status) => API.patch(`/hackathons/${id}/status`, { status });
export const sendAdminBroadcast = (data) => API.post("/admin/broadcast", data, getAuthHeaders());
export const getAdminEmailQueueStatus = () => API.get('/admin/email-queue', getAuthHeaders());
export const getAdminUsers = (page = 1, limit = 10, search = '') => {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('limit', limit.toString());
  if (search) params.set('search', search);
  return API.get(`/admin/users?${params.toString()}`, getAuthHeaders());
};
export const updateAdminUserRole = (data) => API.post('/admin/users/role', data, getAuthHeaders());

/* ================= HACKATHON APIs ================= */
// Public — no auth required
export const getAllHackathons = () => API.get("/hackathons");

// Requires auth — supports ?q=<text>&status=<open|ongoing|closed|draft>
export const searchHackathons = (query = '', status = '') => {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (status) params.set('status', status);
  return API.get(`/hackathons/search?${params.toString()}`);
};

export const getHackathonById = (id) => API.get(`/hackathons/${id}`);
export const getHackathonTeams = (id) => API.get(`/hackathons/${id}/teams`);
export const getHackathonDiscussions = (id) => API.get(`/hackathons/${id}/discussions`, getAuthHeaders());

/* ================= PARTICIPANT APIs ================= */
export const getParticipantDashboard = (hackathonId) => API.get(`/participant/hackathon/${hackathonId}/dashboard`, getAuthHeaders());

/* ================= TEAM APIs ================= */
export const registerTeam = (data) => API.post("/teams", data);
export const requestJoinTeam = (teamId, message) => API.post(`/teams/${teamId}/join`, { message });
export const withdrawJoinRequest = (teamId) => API.post(`/teams/${teamId}/withdraw`);
export const searchHackathonMembers = (hackathonId, name = '', tags = '') => {
  const params = new URLSearchParams();
  params.set('hackathonId', hackathonId);
  if (name) params.set('name', name);
  if (tags) params.set('tags', tags);
  return API.get(`/search?${params.toString()}`);
};

export const discoverMembers = (teamId) => API.get(`/teams/${teamId}/discover-members`);
export const inviteMember = (teamId, data) => API.post(`/teams/${teamId}/invite`, data);
export const respondToInvite = (teamId, data) => API.post(`/teams/${teamId}/invites/respond`, data);

/* ================= CALENDAR ================= */
export const getCalendarEvents = () => API.get('/calendar');
export const getMyCalendarEvents = () => API.get('/calendar/my-events');

/* ================= JUDGE APIs ================= */
export const getAllJudges = () => API.get("/admin/judges");
export const assignJudgesToHackathon = (hackathonId, judgeIds) =>
  API.post(
    `/admin/hackathons/${hackathonId}/judges`,
    { judgeIds },
    getAuthHeaders()
  );

export const submitProject = (submissionData) =>
  API.post("/submissions", submissionData, getAuthHeaders());

/* ================= ORGANIZER APIs ================= */
export const applyForOrganizer = (data) => API.post('/organizer/apply', data, getAuthHeaders());
export const getOrganizerApplications = () => API.get('/organizer/applications', getAuthHeaders());
export const reviewOrganizerApplication = (id, data) => API.patch(`/organizer/applications/${id}`, data, getAuthHeaders());
export const getOrganizerHackathons = () => API.get('/organizer/hackathons', getAuthHeaders());

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