import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/judge/Navbar";
import Footer from "../../components/judge/Footer";
import judgeApi from "../../services/judgeApi";
import "../../styles/judge.css";

const TeamSubmissions = () => {
  const { id: hackathonId } = useParams();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [submissionFilter, setSubmissionFilter] = useState("All");
  const [evaluationFilter, setEvaluationFilter] = useState("All");
  const [currentUser, setCurrentUser] = useState(null);
  const [submitting, setSubmitting] = useState({});

  useEffect(() => {
    fetchTeamsAndEvaluations();
  }, [hackathonId]);

  const fetchTeamsAndEvaluations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const userData = await judgeApi.getMe();
      setCurrentUser(userData.data);

      // Get all teams for this hackathon
      const teamsResponse = await judgeApi.getTeamsByHackathon(hackathonId);

      if (!teamsResponse.success) {
        throw new Error("Failed to load teams");
      }

      // Enrich teams with evaluation data
      const enrichedTeams = await Promise.all(
        teamsResponse.data.map(async (team) => {
          try {
            // Check if team has submitted
            const hasSubmission = team.project && team.project.title;

            // Get evaluations for this team
            let currentJudgeEvaluation = null;
            let allEvaluations = [];

            try {
              const evalResponse = await judgeApi.getEvaluationsByTeam(
                hackathonId,
                team._id,
              );

              if (evalResponse.success) {
                allEvaluations = evalResponse.data;
                currentJudgeEvaluation = allEvaluations.find(
                  (evaluation) => evaluation.judgeId === userData.data._id,
                );
              }
            } catch (evalErr) {
              console.log("No evaluations found for team:", team._id);
            }

            return {
              id: team._id,
              name: team.name,
              ps: team.project?.description || "Not submitted yet",
              pptLink: team.project?.driveUrl || null,
              repoLink: team.project?.repoUrl || null,
              demoLink: team.project?.demoUrl || null,
              marks: currentJudgeEvaluation?.totalScore || 0,
              criteriaScores: currentJudgeEvaluation?.criteriaScores || {
                innovation: { score: 0, weight: 1 },
                technicalImplementation: { score: 0, weight: 1 },
                problemRelevance: { score: 0, weight: 1 },
                presentation: { score: 0, weight: 1 },
                feasibility: { score: 0, weight: 1 },
              },
              remarks: currentJudgeEvaluation?.remarks || "",
              submissionStatus: hasSubmission
                ? currentJudgeEvaluation
                  ? "Evaluated"
                  : "Submitted"
                : "Not Submitted",
              evaluated: !!currentJudgeEvaluation,
              evaluationId: currentJudgeEvaluation?._id || null,
              rawTeam: team,
            };
          } catch (err) {
            console.error("Error enriching team:", err);
            return {
              id: team._id,
              name: team.name,
              ps: "Error loading details",
              pptLink: null,
              repoLink: null,
              demoLink: null,
              marks: 0,
              criteriaScores: {
                innovation: { score: 0, weight: 1 },
                technicalImplementation: { score: 0, weight: 1 },
                problemRelevance: { score: 0, weight: 1 },
                presentation: { score: 0, weight: 1 },
                feasibility: { score: 0, weight: 1 },
              },
              remarks: "",
              submissionStatus: "Not Submitted",
              evaluated: false,
              evaluationId: null,
              rawTeam: team,
            };
          }
        }),
      );

      setTeams(enrichedTeams);
    } catch (err) {
      console.error("Error fetching teams:", err);
      setError(err.message || "Failed to load team submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleCriteriaScoreChange = (teamId, criterion, value) => {
    const numValue = parseFloat(value) || 0;
    if (numValue < 0 || numValue > 10) return;

    setTeams((prevTeams) =>
      prevTeams.map((team) => {
        if (team.id === teamId) {
          const updatedCriteria = {
            ...team.criteriaScores,
            [criterion]: {
              ...team.criteriaScores[criterion],
              score: numValue,
            },
          };

          // Calculate total score
          const totalScore = Object.values(updatedCriteria).reduce(
            (sum, criteria) => sum + criteria.score * criteria.weight,
            0,
          );

          return {
            ...team,
            criteriaScores: updatedCriteria,
            marks: totalScore,
          };
        }
        return team;
      }),
    );
  };

  const handleRemarksChange = (teamId, value) => {
    setTeams((prevTeams) =>
      prevTeams.map((team) =>
        team.id === teamId ? { ...team, remarks: value } : team,
      ),
    );
  };

  const handleSubmit = async (teamId) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;

    try {
      setSubmitting((prev) => ({ ...prev, [teamId]: true }));

      const evaluationData = {
        criteriaScores: team.criteriaScores,
        totalScore: team.marks,
        remarks: team.remarks,
        round: "final", // You can make this dynamic
      };

      let response;
      if (team.evaluationId) {
        // Update existing evaluation
        response = await judgeApi.updateEvaluation(
          team.evaluationId,
          evaluationData,
        );
      } else {
        // Create new evaluation
        response = await judgeApi.createEvaluation(
          hackathonId,
          teamId,
          evaluationData,
        );
      }

      if (response.success) {
        setTeams((prevTeams) =>
          prevTeams.map((t) =>
            t.id === teamId
              ? {
                  ...t,
                  evaluated: true,
                  submissionStatus: "Evaluated",
                  evaluationId: response.data._id,
                }
              : t,
          ),
        );
        alert("Evaluation submitted successfully!");
      }
    } catch (err) {
      console.error("Error submitting evaluation:", err);
      alert(err.message || "Failed to submit evaluation");
    } finally {
      setSubmitting((prev) => ({ ...prev, [teamId]: false }));
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Submitted":
        return "submission-submitted";
      case "Evaluated":
        return "submission-evaluated";
      case "Not Submitted":
        return "submission-not-submitted";
      default:
        return "";
    }
  };

  // Filter teams based on search and filters
  const filteredTeams = teams.filter((team) => {
    const matchesSearch = team.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSubmission =
      submissionFilter === "All" || team.submissionStatus === submissionFilter;
    const matchesEvaluation =
      evaluationFilter === "All" ||
      (evaluationFilter === "Evaluated" && team.evaluated) ||
      (evaluationFilter === "Pending" && !team.evaluated);

    return matchesSearch && matchesSubmission && matchesEvaluation;
  });

  const totalTeams = teams.length;
  const evaluatedCount = teams.filter((t) => t.evaluated).length;
  const pendingCount = totalTeams - evaluatedCount;

  if (loading) {
    return (
      <div className="judge-page">
        <Navbar />
        <main className="page-main">
          <div className="page-container">
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading team submissions...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="judge-page">
        <Navbar />
        <main className="page-main">
          <div className="page-container">
            <div className="error-container">
              <h2>Error Loading Submissions</h2>
              <p>{error}</p>
              <button
                className="btn-primary"
                onClick={fetchTeamsAndEvaluations}
              >
                Retry
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="judge-page">
      <Navbar />

      <main className="page-main">
        <div className="page-container">
          <div className="submissions-header">
            <h1 className="page-title">Team Submissions & Evaluation</h1>

            <div className="summary-pills">
              <div className="summary-pill summary-total">
                <span className="pill-label">Total Teams:</span>
                <span className="pill-value">{totalTeams}</span>
              </div>
              <div className="summary-pill summary-evaluated">
                <span className="pill-label">Evaluated:</span>
                <span className="pill-value">{evaluatedCount}</span>
              </div>
              <div className="summary-pill summary-pending">
                <span className="pill-label">Pending:</span>
                <span className="pill-value">{pendingCount}</span>
              </div>
            </div>
          </div>

          <div className="filters-section">
            <div className="filter-group search-group">
              <label className="filter-label">Search Teams</label>
              <div className="search-input-wrapper">
                <svg
                  className="search-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M7 13C10.3137 13 13 10.3137 13 7C13 3.68629 10.3137 1 7 1C3.68629 1 1 3.68629 1 7C1 10.3137 3.68629 13 7 13Z"
                    stroke="#043873"
                    strokeWidth="2"
                  />
                  <path
                    d="M11.5 11.5L15 15"
                    stroke="#043873"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by team name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Submission Status</label>
              <select
                className="filter-select"
                value={submissionFilter}
                onChange={(e) => setSubmissionFilter(e.target.value)}
              >
                <option>All</option>
                <option>Submitted</option>
                <option>Not Submitted</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Evaluation Status</label>
              <select
                className="filter-select"
                value={evaluationFilter}
                onChange={(e) => setEvaluationFilter(e.target.value)}
              >
                <option>All</option>
                <option>Evaluated</option>
                <option>Pending</option>
              </select>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="submissions-table">
              <thead>
                <tr>
                  <th>Team Name</th>
                  <th>Project Description</th>
                  <th>Links</th>
                  <th>Innovation (0-10)</th>
                  <th>Technical (0-10)</th>
                  <th>Relevance (0-10)</th>
                  <th>Presentation (0-10)</th>
                  <th>Feasibility (0-10)</th>
                  <th>Total Score</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.length === 0 ? (
                  <tr>
                    <td
                      colSpan="11"
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      No teams found
                    </td>
                  </tr>
                ) : (
                  filteredTeams.map((team, index) => (
                    <tr
                      key={team.id}
                      className={index % 2 === 1 ? "row-alt" : ""}
                    >
                      <td>
                        <span className="team-name-link">{team.name}</span>
                      </td>
                      <td>
                        <div className="ps-cell">
                          <span className="ps-text">{team.ps}</span>
                        </div>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexDirection: "column",
                          }}
                        >
                          {team.pptLink && (
                            <a
                              href={team.pptLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="view-link"
                            >
                              PPT
                            </a>
                          )}
                          {team.repoLink && (
                            <a
                              href={team.repoLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="view-link"
                            >
                              Repo
                            </a>
                          )}
                          {team.demoLink && (
                            <a
                              href={team.demoLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="view-link"
                            >
                              Demo
                            </a>
                          )}
                          {!team.pptLink &&
                            !team.repoLink &&
                            !team.demoLink && (
                              <span className="na-text">N/A</span>
                            )}
                        </div>
                      </td>
                      <td>
                        <input
                          type="number"
                          className="marks-input"
                          min="0"
                          max="10"
                          step="0.5"
                          value={team.criteriaScores.innovation.score}
                          onChange={(e) =>
                            handleCriteriaScoreChange(
                              team.id,
                              "innovation",
                              e.target.value,
                            )
                          }
                          disabled={team.evaluated}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="marks-input"
                          min="0"
                          max="10"
                          step="0.5"
                          value={
                            team.criteriaScores.technicalImplementation.score
                          }
                          onChange={(e) =>
                            handleCriteriaScoreChange(
                              team.id,
                              "technicalImplementation",
                              e.target.value,
                            )
                          }
                          disabled={team.evaluated}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="marks-input"
                          min="0"
                          max="10"
                          step="0.5"
                          value={team.criteriaScores.problemRelevance.score}
                          onChange={(e) =>
                            handleCriteriaScoreChange(
                              team.id,
                              "problemRelevance",
                              e.target.value,
                            )
                          }
                          disabled={team.evaluated}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="marks-input"
                          min="0"
                          max="10"
                          step="0.5"
                          value={team.criteriaScores.presentation.score}
                          onChange={(e) =>
                            handleCriteriaScoreChange(
                              team.id,
                              "presentation",
                              e.target.value,
                            )
                          }
                          disabled={team.evaluated}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="marks-input"
                          min="0"
                          max="10"
                          step="0.5"
                          value={team.criteriaScores.feasibility.score}
                          onChange={(e) =>
                            handleCriteriaScoreChange(
                              team.id,
                              "feasibility",
                              e.target.value,
                            )
                          }
                          disabled={team.evaluated}
                        />
                      </td>
                      <td>
                        <strong>{team.marks.toFixed(1)}</strong>
                      </td>
                      <td>
                        <span
                          className={`submission-badge ${getStatusClass(
                            team.submissionStatus,
                          )}`}
                        >
                          {team.submissionStatus}
                        </span>
                      </td>
                      <td>
                        {team.evaluated ? (
                          <button className="btn-submitted" disabled>
                            Submitted
                          </button>
                        ) : (
                          <button
                            className="btn-submit"
                            onClick={() => handleSubmit(team.id)}
                            disabled={
                              team.submissionStatus === "Not Submitted" ||
                              submitting[team.id]
                            }
                          >
                            {submitting[team.id] ? "Submitting..." : "Submit"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TeamSubmissions;
