import API, { getAuthHeaders, handleApiError } from './api';

const judgeApi = {
  /* ================= HACKATHONS ================= */

  getAssignedHackathons: async () => {
    try {
      const res = await API.get('/hackathons', getAuthHeaders());
      return res.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getHackathonById: async (hackathonId) => {
    try {
      const res = await API.get(`/hackathons/${hackathonId}`, getAuthHeaders());
      return res.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getHackathonOverview: async (hackathonId) => {
    try {
      const res = await API.get(
        `/admin/hackathons/${hackathonId}/overview`,
        getAuthHeaders()
      );
      return res.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /* ================= TEAMS ================= */

  getTeamsByHackathon: async (hackathonId) => {
    try {
      const res = await API.get(
        `/hackathons/${hackathonId}/teams`,
        getAuthHeaders()
      );
      return res.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getTeamDetails: async (teamId) => {
    try {
      const res = await API.get(`/teams/${teamId}`, getAuthHeaders());
      return res.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /* ================= SUBMISSIONS ================= */

  getSubmission: async (submissionId) => {
    try {
      const res = await API.get(
        `/submissions/${submissionId}`,
        getAuthHeaders()
      );
      return res.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /* ================= EVALUATIONS ================= */

  createEvaluation: async (hackathonId, teamId, evaluationData) => {
    try {
      const res = await API.post(
        `/evaluations/hackathons/${hackathonId}/teams/${teamId}/evaluations`,
        evaluationData,
        getAuthHeaders()
      );
      return res.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateEvaluation: async (evaluationId, evaluationData) => {
    try {
      const res = await API.patch(
        `/evaluations/${evaluationId}`,
        evaluationData,
        getAuthHeaders()
      );
      return res.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getEvaluationsByTeam: async (hackathonId, teamId) => {
    try {
      const res = await API.get(
        `/evaluations/hackathons/${hackathonId}/teams/${teamId}/evaluations`,
        getAuthHeaders()
      );
      return res.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  lockEvaluation: async (evaluationId) => {
    try {
      const res = await API.patch(
        `/evaluations/${evaluationId}/lock`,
        {},
        getAuthHeaders()
      );
      return res.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  deleteEvaluation: async (evaluationId) => {
    try {
      const res = await API.delete(
        `/evaluations/${evaluationId}`,
        getAuthHeaders()
      );
      return res.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /* ================= USER ================= */

  getMe: async () => {
    try {
      const res = await API.get('/users/me', getAuthHeaders());
      return res.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default judgeApi;
