import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import AdminNavbar from "../../components/admin/AdminNavbar";
import { HackathonDomainsBadges } from "../../components/HackathonDomainsBadges";
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

          {/* NEW: PROBLEM DOMAINS */}
          {hackathon.domains && hackathon.domains.length > 0 && (
            <section className="view-section">
              <h2 className="view-section-title">Problem Domains</h2>
              <HackathonDomainsBadges
                domains={hackathon.domains}
                size="medium"
              />
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
