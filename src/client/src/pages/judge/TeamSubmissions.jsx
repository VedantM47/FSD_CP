import React, { useState } from "react";
import Navbar from "../../components/judge/Navbar";
import Footer from "../../components/judge/Footer";
import "../../styles/judge.css";

const TeamSubmissions = () => {
  const [teams, setTeams] = useState([
    {
      id: 1,
      name: "Team Alpha",
      ps: "AI-Powered Healthcare Assistant for Remote Patient Monitoring",
      pptLink: "View",
      marks: 0,
      submissionStatus: "Submitted",
      evaluated: false,
    },
    {
      id: 2,
      name: "Code Ninjas",
      ps: "Smart City Traffic Management System Using ML",
      pptLink: "View",
      marks: 8.5,
      submissionStatus: "Evaluated",
      evaluated: true,
    },
    {
      id: 3,
      name: "Innovators Hub",
      ps: "Blockchain-Based Supply Chain Transparency Platform",
      pptLink: "N/A",
      marks: 0,
      submissionStatus: "Not Submitted",
      evaluated: false,
    },
    {
      id: 4,
      name: "Tech Titans",
      ps: "ML-Based Fraud Detection System for Financial Transactions",
      pptLink: "View",
      marks: 0,
      submissionStatus: "Submitted",
      evaluated: false,
    },
    {
      id: 5,
      name: "Digital Dreamers",
      ps: "Renewable Energy Optimization Using AI",
      pptLink: "View",
      marks: 9.0,
      submissionStatus: "Evaluated",
      evaluated: true,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [submissionFilter, setSubmissionFilter] = useState("All");
  const [evaluationFilter, setEvaluationFilter] = useState("All");

  const handleMarksChange = (id, value) => {
    setTeams(
      teams.map((team) =>
        team.id === id ? { ...team, marks: parseFloat(value) || 0 } : team
      )
    );
  };

  const handleSubmit = (id) => {
    setTeams(
      teams.map((team) =>
        team.id === id
          ? { ...team, evaluated: true, submissionStatus: "Evaluated" }
          : team
      )
    );
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

  const totalTeams = teams.length;
  const evaluatedCount = teams.filter((t) => t.evaluated).length;
  const pendingCount = totalTeams - evaluatedCount;

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
                  <th>PS</th>
                  <th>PPT / Link</th>
                  <th>Marks (0-10)</th>
                  <th>Submission Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team, index) => (
                  <tr
                    key={team.id}
                    className={index % 2 === 1 ? "row-alt" : ""}
                  >
                    <td>
                      <a href="#" className="team-name-link">
                        {team.name}
                      </a>
                    </td>
                    <td>
                      <div className="ps-cell">
                        <svg
                          className="ps-icon"
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                        >
                          <path
                            d="M8 1H3C2.44772 1 2 1.44772 2 2V12C2 12.5523 2.44772 13 3 13H11C11.5523 13 12 12.5523 12 12V5M8 1L12 5M8 1V5H12"
                            stroke="#043873"
                            strokeWidth="1.5"
                          />
                        </svg>
                        <span className="ps-text">{team.ps}</span>
                      </div>
                    </td>
                    <td>
                      {team.pptLink === "View" ? (
                        <a href="#" className="view-link">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M1 6H11M11 6L6 1M11 6L6 11"
                              stroke="#4F9CF9"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                          View
                        </a>
                      ) : (
                        <span className="na-text">N/A</span>
                      )}
                    </td>
                    <td>
                      <input
                        type="number"
                        className="marks-input"
                        min="0"
                        max="10"
                        step="0.5"
                        value={team.marks}
                        onChange={(e) =>
                          handleMarksChange(team.id, e.target.value)
                        }
                        disabled={team.evaluated}
                      />
                    </td>
                    <td>
                      <span
                        className={`submission-badge ${getStatusClass(
                          team.submissionStatus
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
                          disabled={team.submissionStatus === "Not Submitted"}
                        >
                          Submit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
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
