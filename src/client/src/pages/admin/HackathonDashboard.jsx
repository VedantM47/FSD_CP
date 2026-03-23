import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import AdminNavbar from '../../components/admin/AdminNavbar';
import { getHackathonById } from '../../services/api';

import '../../styles/admin.css';

function HackathonDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* ================= LOAD HACKATHON ================= */
  useEffect(() => {
    const fetchHackathon = async () => {
      try {
        setLoading(true);
        const res = await getHackathonById(id);
        setHackathon(res.data.data);
      } catch (err) {
        setError('Failed to load hackathon dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchHackathon();
  }, [id]);

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

      <main className="admin-main">
        {/* ================= ADMIN CONTROLS ================= */}
        <div className="admin-container">
          <div className="admin-controls-card">
            <div className="admin-controls-left">
              <h3 className="admin-controls-title">{hackathon.title}</h3>
              <span className={`status-badge status-${hackathon.status}`}>
                {hackathon.status}
              </span>
            </div>

            <div className="admin-controls-actions">
              <button
                className="btn-secondary"
                onClick={() => navigate(`/admin/hackathons/${id}`)}
              >
                View Page
              </button>
              
              <button
                className="btn-secondary"
                onClick={() => navigate(`/hackathon/${id}/discussion`)}
                style={{ marginLeft: '10px', marginRight: '10px' }}
              >
                View Discussion
              </button>

              <button
                className="btn-primary"
                onClick={() => navigate(`/admin/hackathons/${id}/edit`)}
              >
                Edit Hackathon
              </button>
            </div>
          </div>
        </div>

        {/* ================= HERO ================= */}
        <div className="hackathon-hero">
          <div className="hero-content">
            <h1 className="hero-title">{hackathon.title}</h1>
            <p className="hero-subtitle">
              {new Date(hackathon.startDate).toLocaleDateString()} –{' '}
              {new Date(hackathon.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* ================= OVERVIEW ================= */}
        <div className="admin-container">
          <section className="overview-section">
            <h2 className="section-title">Hackathon Overview</h2>

            <div className="stats-grid">
              <div className="stats-card">
                <div className="stats-value">{hackathon.maxTeamSize}</div>
                <div className="stats-label">Max Team Size</div>
              </div>

              <div className="stats-card">
                <div className="stats-value">{hackathon.status}</div>
                <div className="stats-label">Current Status</div>
              </div>

              <div className="stats-card">
                <div className="stats-value">
                  {new Date(hackathon.registrationDeadline).toLocaleDateString()}
                </div>
                <div className="stats-label">Registration Deadline</div>
              </div>
            </div>
          </section>
        </div>

        {/* ================= DETAILS ================= */}
        <div className="admin-container view-container">
          <section className="view-section">
            <h2 className="view-section-title">Description</h2>
            <p className="view-section-text">{hackathon.description}</p>
          </section>

          <section className="view-section">
            <h2 className="view-section-title">Rules</h2>
            <p className="view-section-text">{hackathon.rules}</p>
          </section>

          <section className="view-section">
            <h2 className="view-section-title">Terms & Conditions</h2>
            <p className="view-section-text">{hackathon.terms}</p>
          </section>

          <section className="view-section">
            <h2 className="view-section-title">Prize Pool</h2>
            <p className="view-section-text">{hackathon.prizePool}</p>
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

export default HackathonDashboard;
