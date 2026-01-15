const adminStats = {
  participants: 189,
  teams: 47,
  judges: 3,
  currentRound: 'Round 1: Ideation',
  submittedTeams: 32,
  pendingTeams: 15
};

import { useParams, useNavigate } from 'react-router-dom';
import AdminNavbar from '../../components/admin/AdminNavbar';
import mockHackathon from '../../data/mockHackathon';
import '../../styles/admin.css';

function HackathonDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const hackathon = mockHackathon;

  return (
    <div className="admin-layout">
      <AdminNavbar />

      <main className="admin-main">
        {/* ADMIN CONTROLS */}
        <div className="admin-container">
          <div className="admin-controls-card">
            <div className="admin-controls-left">
              <h3 className="admin-controls-title">{hackathon.name}</h3>
              <span className={`status-badge status-live`}>
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
                className="btn-primary"
                onClick={() => navigate(`/admin/hackathons/${id}/edit`)}
              >
                Edit Hackathon
              </button>
            </div>
          </div>
        </div>

        

        {/* HERO */}
        <div className="hackathon-hero">
          <div className="hero-content">
            <h1 className="hero-title">{hackathon.name}</h1>
            <p className="hero-subtitle">
              Organized by {hackathon.organization}
            </p>
          </div>
        </div>

        {/* ADMIN METRICS */}
<div className="admin-container">
  <section className="overview-section">
    <h2 className="section-title">Hackathon Overview</h2>

    <div className="stats-grid">
      <div className="stats-card">
        <div className="stats-value">{adminStats.participants}</div>
        <div className="stats-label">Total Participants</div>
      </div>

      <div className="stats-card">
        <div className="stats-value">{adminStats.teams}</div>
        <div className="stats-label">Total Teams</div>
      </div>

      <div className="stats-card">
        <div className="stats-value">{adminStats.submittedTeams}</div>
        <div className="stats-label">Teams Submitted</div>
      </div>

      <div className="stats-card">
        <div className="stats-value">{adminStats.pendingTeams}</div>
        <div className="stats-label">Teams Pending</div>
      </div>
    </div>

    <div style={{ marginTop: '16px' }} className="stats-grid">
      <div className="stats-card">
        <div className="stats-value">{adminStats.judges}</div>
        <div className="stats-label">Judges</div>
      </div>

      <div className="stats-card">
        <div className="stats-value">✔</div>
        <div className="stats-label">{adminStats.currentRound}</div>
      </div>
    </div>
  </section>
</div>


        {/* CONTENT */}
        <div className="admin-container view-container">
          {/* INFO CARDS */}
          <div className="info-cards">
            <div className="info-card">
              <h4 className="info-label">Team Size</h4>
              <p className="info-value">
                {hackathon.minTeamSize}–{hackathon.maxTeamSize} members
              </p>
            </div>

            <div className="info-card">
              <h4 className="info-label">Registration Fee</h4>
              <p className="info-value">{hackathon.registrationFee}</p>
            </div>

            <div className="info-card">
              <h4 className="info-label">Total Prizes</h4>
              <p className="info-value">{hackathon.totalPrizes}</p>
            </div>
          </div>

          {/* ABOUT */}
          <section className="view-section">
            <h2 className="view-section-title">About</h2>
            <p className="view-section-text">{hackathon.description}</p>
          </section>

          {/* ROUNDS */}
          <section className="view-section">
            <h2 className="view-section-title">Timeline & Rounds</h2>

            {hackathon.rounds.map(r => (
              <div key={r.id} className="round-card">
                <h3 className="round-title">{r.name}</h3>
                <p className="round-description">{r.description}</p>
                <span className="round-dates">
                  {r.startDate} → {r.endDate}
                </span>
              </div>
            ))}
          </section>

          {/* REWARDS */}
          <section className="view-section">
            <h2 className="view-section-title">Rewards</h2>
            <div className="rewards-grid">
              {hackathon.prizes.map((p, i) => (
                <div key={i} className="reward-card">
                  <h4 className="reward-place">{p.place}</h4>
                  <p className="reward-amount">{p.amount}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="admin-footer">
        <div className="footer-content">
          <div className="footer-left">
            <span className="footer-brand">HackPlatform</span>
          </div>
          <div className="footer-right">
            <a href="#about" className="footer-link">About</a>
            <a href="#faqs" className="footer-link">FAQs</a>
            <a href="#contact" className="footer-link">Contact</a>
            <a href="#terms" className="footer-link">Terms & Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HackathonDashboard;
