import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import AdminNavbar from "../../components/admin/AdminNavbar";
import { getHackathonById } from "../../services/api";

import "../../styles/admin.css";

function ViewHackathon() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHackathon = async () => {
      try {
        setLoading(true);
        const res = await getHackathonById(id);
        setHackathon(res.data.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load hackathon");
      } finally {
        setLoading(false);
      }
    };

    fetchHackathon();
  }, [id]);

  const statusClass = (status) => {
    switch (status) {
      case "draft":
        return "status-draft";
      case "open":
        return "status-open";
      case "ongoing":
        return "status-live";
      case "closed":
        return "status-closed";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminNavbar />
        <main className="admin-main">
          <div className="admin-container">Loading hackathon...</div>
        </main>
      </div>
    );
  }

  if (error || !hackathon) {
    return (
      <div className="admin-layout">
        <AdminNavbar />
        <main className="admin-main">
          <div className="admin-container error-text">{error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminNavbar />

      <main className="admin-main view-hackathon">
        {/* ================= HERO ================= */}
        <div className="hackathon-hero">
          <div className="hero-content">
            <div className="hero-header">
              <button
                className="back-btn-hero"
                onClick={() => navigate("/admin/dashboard")}
              >
                ← Back to Dashboard
              </button>

              <div className="hero-actions">
                <button
                  className="btn-secondary-hero"
                  onClick={() => navigate(`/admin/hackathons/${id}/dashboard`)}
                >
                  Dashboard
                </button>

                <button
                  className="btn-primary-hero"
                  onClick={() => navigate(`/admin/hackathons/${id}/edit`)}
                >
                  Edit Hackathon
                </button>
              </div>
            </div>

            <h1 className="hero-title">{hackathon.title}</h1>

            <p className="hero-subtitle">
              {new Date(hackathon.startDate).toLocaleDateString()} –{" "}
              {new Date(hackathon.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* ================= DETAILS ================= */}
        <div className="admin-container view-container">
          {/* INFO CARDS */}
          <div className="info-cards">
            <div className="info-card">
              <h3 className="info-label">Max Team Size</h3>
              <p className="info-value">{hackathon.maxTeamSize}</p>
            </div>

            <div className="info-card">
              <h3 className="info-label">Registration Deadline</h3>
              <p className="info-value">
                {new Date(hackathon.registrationDeadline).toLocaleDateString()}
              </p>
            </div>

            <div className="info-card">
              <h3 className="info-label">Prize Pool</h3>
              <p className="info-value">{hackathon.prizePool}</p>
            </div>
          </div>

          {/* ABOUT */}
          <section className="view-section">
            <h2 className="view-section-title">About</h2>
            <p className="view-section-text">{hackathon.description}</p>
          </section>

          {/* PROBLEM STATEMENTS */}
          {hackathon.problemStatements && hackathon.problemStatements.length > 0 && (
            <section className="view-section">
              <h2 className="view-section-title">Problem Statements</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {hackathon.problemStatements.map((ps, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      padding: '20px', 
                      backgroundColor: '#f9fafb', 
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <h3 style={{ 
                      margin: '0 0 12px 0', 
                      fontSize: '1.1rem', 
                      fontWeight: '600', 
                      color: '#111827' 
                    }}>
                      {index + 1}. {ps.title}
                    </h3>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '0.95rem', 
                      lineHeight: '1.6', 
                      color: '#4b5563',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {ps.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ROUNDS */}
          {hackathon.rounds && hackathon.rounds.length > 0 && (
            <section className="view-section">
              <h2 className="view-section-title">Rounds</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {hackathon.rounds.map((round, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      padding: '20px', 
                      backgroundColor: '#fef3c7', 
                      borderRadius: '12px',
                      border: '1px solid #fbbf24'
                    }}
                  >
                    <h3 style={{ 
                      margin: '0 0 12px 0', 
                      fontSize: '1.1rem', 
                      fontWeight: '600', 
                      color: '#92400e' 
                    }}>
                      Round {index + 1}: {round.name}
                    </h3>
                    <p style={{ 
                      margin: '0 0 12px 0', 
                      fontSize: '0.95rem', 
                      lineHeight: '1.6', 
                      color: '#78350f',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {round.description}
                    </p>
                    
                    {(round.startDate || round.endDate) && (
                      <div style={{ 
                        display: 'flex', 
                        gap: '20px', 
                        marginBottom: '12px',
                        fontSize: '0.85rem',
                        color: '#92400e'
                      }}>
                        {round.startDate && (
                          <div>
                            <strong>Start:</strong> {new Date(round.startDate).toLocaleString()}
                          </div>
                        )}
                        {round.endDate && (
                          <div>
                            <strong>End:</strong> {new Date(round.endDate).toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {round.submissionRequirements && (
                      <div style={{ 
                        marginTop: '12px',
                        padding: '12px',
                        backgroundColor: '#fffbeb',
                        borderRadius: '8px',
                        border: '1px solid #fcd34d'
                      }}>
                        <strong style={{ color: '#92400e', fontSize: '0.9rem' }}>Submission Requirements:</strong>
                        <p style={{ 
                          margin: '8px 0 0 0', 
                          fontSize: '0.9rem', 
                          color: '#78350f',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {round.submissionRequirements}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* RULES */}
          <section className="view-section">
            <h2 className="view-section-title">Rules</h2>
            <p className="view-section-text">{hackathon.rules}</p>
          </section>

          {/* TERMS */}
          <section className="view-section">
            <h2 className="view-section-title">Terms & Conditions</h2>
            <p className="view-section-text">{hackathon.terms}</p>
          </section>
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="admin-footer">
        <div className="footer-content">
          <span className="footer-brand">HackPlatform</span>
        </div>
      </footer>
    </div>
  );
}

export default ViewHackathon;
