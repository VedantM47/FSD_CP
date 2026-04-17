import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/judge/Navbar";
import Footer from "../../components/judge/Footer";
import judgeApi from "../../services/judgeApi";
import "../../styles/judge.css";
import "../../styles/judge-additional.css";

const HackathonOverview = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [hackathon, setHackathon] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHackathonData();
  }, [id]);

  const fetchHackathonData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch hackathon details
      const hackathonResponse = await judgeApi.getHackathonById(id);
      if (!hackathonResponse.success) {
        throw new Error("Failed to load hackathon details");
      }
      setHackathon(hackathonResponse.data);

      // Fetch overview statistics
      try {
        const overviewResponse = await judgeApi.getHackathonOverview(id);
        if (overviewResponse.success) {
          setOverview(overviewResponse.data);
        }
      } catch (overviewErr) {
        console.log("Overview endpoint not available, fetching teams directly");
        // Fallback: fetch teams directly
        const teamsResponse = await judgeApi.getTeamsByHackathon(id);
        if (teamsResponse.success) {
          setOverview({
            teamsCount: teamsResponse.count || teamsResponse.data.length,
            submissionsCount: teamsResponse.data.filter((t) => t.project?.title)
              .length,
          });
        }
      }

      // Get evaluation progress for current judge
      const userData = await judgeApi.getMe();
      const teamsResponse = await judgeApi.getTeamsByHackathon(id);

      if (teamsResponse.success) {
        let evaluatedCount = 0;
        for (const team of teamsResponse.data) {
          try {
            const evalResponse = await judgeApi.getEvaluationsByTeam(
              id,
              team._id,
            );
            if (evalResponse.success) {
              const hasJudgeEvaluated = evalResponse.data.some(
                (evaluation) => evaluation.judgeId === userData.data._id,
              );
              if (hasJudgeEvaluated) evaluatedCount++;
            }
          } catch (err) {
            // Continue if evaluation fetch fails
          }
        }

        setOverview((prev) => ({
          ...prev,
          evaluatedCount,
          totalTeams: teamsResponse.data.length,
        }));
      }
    } catch (err) {
      console.error("Error fetching hackathon data:", err);
      setError(err.message || "Failed to load hackathon data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "ongoing":
        return "status-in-progress";
      case "open":
        return "status-pending";
      case "closed":
        return "status-completed";
      default:
        return "status-draft";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "ongoing":
        return "In Progress";
      case "open":
        return "Open";
      case "closed":
        return "Completed";
      case "draft":
        return "Draft";
      default:
        return status;
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="judge-page">
        <Navbar />
        <main className="page-main">
          <div className="page-container">
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading hackathon details...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !hackathon) {
    return (
      <div className="judge-page">
        <Navbar />
        <main className="page-main">
          <div className="page-container">
            <div className="error-container">
              <h2>Error Loading Hackathon</h2>
              <p>{error || "Hackathon not found"}</p>
              <button
                className="btn-primary"
                onClick={() => navigate("/judge/hackathons")}
              >
                Back to Hackathons
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
          <div className="page-header">
            <div className="page-header-top">
              <button
                onClick={() => navigate(-1)}
                className="back-button"
              >
                ← Back
              </button>
            </div>
            <div className="page-header-content">
              <h1 className="page-title">{hackathon.title}</h1>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginBottom: "8px" }}>
                <span
                  className={`status-badge ${getStatusBadgeClass(hackathon.status)}`}
                >
                  {getStatusText(hackathon.status)}
                </span>
                <span className="page-subtitle" style={{ fontSize: "14px" }}>Final Round</span>
              </div>
            </div>
          </div>

          <div className="overview-card">
            <p className="overview-description">
              {hackathon.description || "No description available"}
            </p>

            {/* Problem Statements Section */}
            {hackathon.problemStatements && hackathon.problemStatements.length > 0 && (
              <div style={{ marginTop: '28px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--jdg-secondary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Problem Statements
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {hackathon.problemStatements.map((ps, index) => (
                    <div 
                      key={index} 
                      style={{ 
                        padding: '16px 20px', 
                        backgroundColor: 'var(--jdg-bg)', 
                        borderRadius: '10px',
                        border: '1px solid var(--jdg-border)'
                      }}
                    >
                      <h4 style={{ 
                        margin: '0 0 8px 0', 
                        fontSize: '0.95rem', 
                        fontWeight: '700', 
                        color: 'var(--jdg-contrast)' 
                      }}>
                        {index + 1}. {ps.title}
                      </h4>
                      <p style={{ 
                        margin: 0, 
                        fontSize: '0.875rem', 
                        lineHeight: '1.65', 
                        color: 'var(--jdg-secondary)',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {ps.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rounds Section */}
            {hackathon.rounds && hackathon.rounds.length > 0 && (
              <div style={{ marginTop: '28px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--jdg-secondary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Rounds
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {hackathon.rounds.map((round, index) => (
                    <div 
                      key={index} 
                      style={{ 
                        padding: '16px 20px', 
                        backgroundColor: 'rgba(232, 210, 140, 0.1)', 
                        borderRadius: '10px',
                        border: '1px solid rgba(232, 210, 140, 0.45)',
                        borderLeft: '4px solid var(--jdg-accent)'
                      }}
                    >
                      <h4 style={{ 
                        margin: '0 0 8px 0', 
                        fontSize: '0.95rem', 
                        fontWeight: '700', 
                        color: 'var(--jdg-contrast)' 
                      }}>
                        Round {index + 1}: {round.name}
                      </h4>
                      <p style={{ 
                        margin: '0 0 8px 0', 
                        fontSize: '0.875rem', 
                        lineHeight: '1.65', 
                        color: 'var(--jdg-secondary)',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {round.description}
                      </p>
                      
                      {(round.startDate || round.endDate) && (
                        <div style={{ 
                          display: 'flex', 
                          gap: '20px', 
                          marginBottom: '8px',
                          fontSize: '0.825rem',
                          color: 'var(--jdg-secondary)'
                        }}>
                          {round.startDate && (
                            <div>
                              <strong style={{ color: 'var(--jdg-contrast)' }}>Start:</strong> {new Date(round.startDate).toLocaleString()}
                            </div>
                          )}
                          {round.endDate && (
                            <div>
                              <strong style={{ color: 'var(--jdg-contrast)' }}>End:</strong> {new Date(round.endDate).toLocaleString()}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {round.submissionRequirements && (
                        <div style={{ 
                          marginTop: '10px',
                          padding: '12px 14px',
                          backgroundColor: 'var(--jdg-white)',
                          borderRadius: '8px',
                          border: '1px solid var(--jdg-border)'
                        }}>
                          <strong style={{ color: 'var(--jdg-contrast)', fontSize: '0.825rem' }}>Submission Requirements:</strong>
                          <p style={{ 
                            margin: '6px 0 0 0', 
                            fontSize: '0.825rem', 
                            color: 'var(--jdg-secondary)',
                            whiteSpace: 'pre-wrap'
                          }}>
                            {round.submissionRequirements}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prize Distribution Section */}
            {hackathon.prizes && hackathon.prizes.length > 0 && (
              <div style={{ marginTop: '28px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--jdg-secondary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Prize Distribution
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {hackathon.prizes.map((prize, index) => (
                    <div 
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '13px 18px',
                        background: 'var(--jdg-bg)',
                        border: '1px solid var(--jdg-border)',
                        borderRadius: '10px'
                      }}
                    >
                      <span style={{ 
                        fontSize: '0.9rem', 
                        fontWeight: '600', 
                        color: 'var(--jdg-secondary)' 
                      }}>
                        {prize.position}
                      </span>
                      <span style={{ 
                        fontSize: '1.05rem', 
                        fontWeight: '800', 
                        color: 'var(--jdg-contrast)' 
                      }}>
                        ₹{prize.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                  
                  {/* Total Prize Pool */}
                  <div style={{
                    marginTop: '6px',
                    padding: '14px 18px',
                    background: 'var(--jdg-primary-light)',
                    border: '1.5px solid rgba(74, 144, 226, 0.35)',
                    borderRadius: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--jdg-contrast)' }}>
                      Total Prize Pool
                    </span>
                    <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--jdg-primary)' }}>
                      ₹{hackathon.prizes.reduce((sum, prize) => sum + prize.amount, 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="overview-info-grid">
              <div className="overview-info-item">
                <div className="info-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z"
                      stroke="#4F9CF9"
                      strokeWidth="2"
                    />
                    <path
                      d="M10 6V10L13 13"
                      stroke="#4F9CF9"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="info-text">
                  <p className="info-text-label">Timeline</p>
                  <p className="info-text-value">
                    {formatDate(hackathon.startDate)} -{" "}
                    {formatDate(hackathon.endDate)}
                  </p>
                </div>
              </div>

              <div className="overview-info-item">
                <div className="info-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16 2H4C2.89543 2 2 2.89543 2 4V16C2 17.1046 2.89543 18 4 18H16C17.1046 18 18 17.1046 18 16V4C18 2.89543 17.1046 2 16 2Z"
                      stroke="#4F9CF9"
                      strokeWidth="2"
                    />
                    <path
                      d="M6 1V3M14 1V3M2 7H18"
                      stroke="#4F9CF9"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="info-text">
                  <p className="info-text-label">Judging Deadline</p>
                  <p className="info-text-value">
                    {formatDate(hackathon.endDate)}
                  </p>
                </div>
              </div>

              <div className="overview-info-item">
                <div className="info-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 19C17.2091 19 19 17.2091 19 15C19 12.7909 17.2091 11 15 11C12.7909 11 11 12.7909 11 15C11 17.2091 12.7909 19 15 19Z"
                      stroke="#4F9CF9"
                      strokeWidth="2"
                    />
                    <path
                      d="M5 19C7.20914 19 9 17.2091 9 15C9 12.7909 7.20914 11 5 11C2.79086 11 1 12.7909 1 15C1 17.2091 2.79086 19 5 19Z"
                      stroke="#4F9CF9"
                      strokeWidth="2"
                    />
                    <path
                      d="M10 5C12.2091 5 14 3.20914 14 1C14 -1.20914 12.2091 -3 10 -3C7.79086 -3 6 -1.20914 6 1C6 3.20914 7.79086 5 10 5Z"
                      stroke="#4F9CF9"
                      strokeWidth="2"
                    />
                    <path
                      d="M10 5V11M5 11V8M15 11V8"
                      stroke="#4F9CF9"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="info-text">
                  <p className="info-text-label">Evaluation Progress</p>
                  <p className="info-text-value">
                    {overview?.evaluatedCount || 0} /{" "}
                    {overview?.totalTeams || overview?.teamsCount || 0} teams
                  </p>
                </div>
              </div>
            </div>

            <button
              className="btn-primary btn-large"
              onClick={() => navigate(`/judge/hackathons/${id}/submissions`)}
            >
              View Teams & Submissions
            </button>
          </div>

          <div className="deadline-card">
            <h3 className="deadline-title">Submission Deadline</h3>
            <p className="deadline-text">
              Teams must submit their projects by{" "}
              <strong>{formatDate(hackathon.endDate)}</strong>. You can begin
              evaluating submissions as they come in.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HackathonOverview;
