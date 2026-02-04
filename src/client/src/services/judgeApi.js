import axios from 'axios';
import { API, getAuthHeaders, handleApiError } from './api';

const judgeApi = {
  // ========================= HACKATHON ENDPOINTS =========================
  
  /**
   * Get all hackathons assigned to the current judge
   * @returns {Promise} List of hackathons
   */
  getAssignedHackathons: async () => {
    try {
      const response = await axios.get(
        `${API}/hackathons`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get specific hackathon details
   * @param {string} hackathonId - Hackathon ID
   * @returns {Promise} Hackathon details
   */
  getHackathonById: async (hackathonId) => {
    try {
      const response = await axios.get(
        `${API}/hackathons/${hackathonId}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get hackathon overview stats (teams count, submissions count)
   * @param {string} hackathonId - Hackathon ID
   * @returns {Promise} Overview statistics
   */
  getHackathonOverview: async (hackathonId) => {
    try {
      const response = await axios.get(
        `${API}/admin/hackathons/${hackathonId}/overview`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ========================= TEAM ENDPOINTS =========================

  /**
   * Get all teams for a specific hackathon
   * @param {string} hackathonId - Hackathon ID
   * @returns {Promise} List of teams
   */
  getTeamsByHackathon: async (hackathonId) => {
    try {
      const response = await axios.get(
        `${API}/hackathons/${hackathonId}/teams`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get specific team details
   * @param {string} teamId - Team ID
   * @returns {Promise} Team details
   */
  getTeamDetails: async (teamId) => {
    try {
      const response = await axios.get(
        `${API}/teams/${teamId}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ========================= SUBMISSION ENDPOINTS =========================

  /**
   * Get submission details
   * @param {string} submissionId - Submission ID
   * @returns {Promise} Submission details
   */
  getSubmission: async (submissionId) => {
    try {
      const response = await axios.get(
        `${API}/submissions/${submissionId}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ========================= EVALUATION ENDPOINTS =========================

  /**
   * Create evaluation for a team
   * @param {string} hackathonId - Hackathon ID
   * @param {string} teamId - Team ID
   * @param {object} evaluationData - Evaluation data
   * @returns {Promise} Created evaluation
   */
  createEvaluation: async (hackathonId, teamId, evaluationData) => {
    try {
      const response = await axios.post(
        `${API}/evaluations/hackathons/${hackathonId}/teams/${teamId}/evaluations`,
        evaluationData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update existing evaluation
   * @param {string} evaluationId - Evaluation ID
   * @param {object} evaluationData - Updated evaluation data
   * @returns {Promise} Updated evaluation
   */
  updateEvaluation: async (evaluationId, evaluationData) => {
    try {
      const response = await axios.patch(
        `${API}/evaluations/${evaluationId}`,
        evaluationData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get all evaluations for a team
   * @param {string} hackathonId - Hackathon ID
   * @param {string} teamId - Team ID
   * @returns {Promise} List of evaluations
   */
  getEvaluationsByTeam: async (hackathonId, teamId) => {
    try {
      const response = await axios.get(
        `${API}/evaluations/hackathons/${hackathonId}/teams/${teamId}/evaluations`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lock evaluation (Admin/Faculty only)
   * @param {string} evaluationId - Evaluation ID
   * @returns {Promise} Success message
   */
  lockEvaluation: async (evaluationId) => {
    try {
      const response = await axios.patch(
        `${API}/evaluations/${evaluationId}/lock`,
        {},
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete evaluation (Admin/Faculty only)
   * @param {string} evaluationId - Evaluation ID
   * @returns {Promise} Success message
   */
  deleteEvaluation: async (evaluationId) => {
    try {
      const response = await axios.delete(
        `${API}/evaluations/${evaluationId}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ========================= USER ENDPOINTS =========================

  /**
   * Get current user details
   * @returns {Promise} User details
   */
  getMe: async () => {
    try {
      const response = await axios.get(
        `${API}/users/me`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default judgeApi;
