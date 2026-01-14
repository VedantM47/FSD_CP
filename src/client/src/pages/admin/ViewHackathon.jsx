// src/pages/admin/ViewHackathon.jsx
import { useParams, useNavigate } from 'react-router-dom';
import AdminNavbar from '../../components/admin/AdminNavbar';
import mockHackathon from '../../data/mockHackathon';
import '../../styles/admin.css';

function ViewHackathon() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // For now, using mock data. Replace with API call later
  const hackathon = mockHackathon;

  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'live': return 'status-live';
      case 'draft': return 'status-draft';
      case 'closed': return 'status-closed';
      default: return '';
    }
  };

  return (
    <div className="admin-layout">
      <AdminNavbar />
      
      <main className="admin-main view-hackathon">
        {/* Hero Section */}
        <div className="hackathon-hero">
          <div className="hero-content">
            <div className="hero-header">
              <button 
                className="back-btn-hero"
                onClick={() => navigate('/admin/dashboard')}
              >
                ← Back to Dashboard
              </button>
              <div className="hero-actions">
                <button className="btn-secondary-hero">Share</button>
                <button 
                  className="btn-primary-hero"
                  onClick={() => navigate(`/admin/hackathons/${id}/edit`)}
                >
                  Edit Details
                </button>
              </div>
            </div>
            
            <h1 className="hero-title">{hackathon.name}</h1>
            <p className="hero-subtitle">Organized by {hackathon.organization}</p>
            <span className={`status-badge ${getStatusClass(hackathon.status)}`}>
              {hackathon.status}
            </span>
          </div>
        </div>

        <div className="admin-container view-container">
          {/* Info Cards */}
          <div className="info-cards">
            <div className="info-card">
              <div className="info-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="info-content">
                <h3 className="info-label">Team Size</h3>
                <p className="info-value">{hackathon.minTeamSize}-{hackathon.maxTeamSize} members per team</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4.93 4.93L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16.24 16.24L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4.93 19.07L7.76 16.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="info-content">
                <h3 className="info-label">Registration Fee</h3>
                <p className="info-value">{hackathon.registrationFee}</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="info-content">
                <h3 className="info-label">Total Prizes</h3>
                <p className="info-value">{hackathon.totalPrizes}</p>
              </div>
            </div>
          </div>

          {/* About Section */}
          <section className="view-section">
            <h2 className="view-section-title">About</h2>
            <p className="view-section-text">{hackathon.description}</p>
          </section>

          {/* Eligibility */}
          <section className="view-section">
            <h2 className="view-section-title">Eligibility</h2>
            <p className="view-section-text">{hackathon.rules}</p>
          </section>

          {/* Timeline & Rounds */}
          <section className="view-section">
            <h2 className="view-section-title">Timeline & Rounds</h2>
            <div className="rounds-timeline">
              {hackathon.rounds.map((round, index) => (
                <div className="timeline-item" key={round.id}>
                  <div className="timeline-marker">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="8" fill="#4f9cf9"/>
                      <circle cx="10" cy="10" r="4" fill="white"/>
                    </svg>
                  </div>
                  <div className="timeline-content">
                    <h3 className="timeline-title">{round.name}</h3>
                    <p className="timeline-date">
                      {new Date(round.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(round.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="timeline-description">{round.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Rewards */}
          <section className="view-section">
            <h2 className="view-section-title">Rewards</h2>
            <div className="rewards-grid">
              {hackathon.prizes.map((prize, index) => (
                <div className="reward-card" key={index}>
                  <div className="reward-icon">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <path d="M20 25C27.1797 25 33 19.1797 33 12C33 4.8203 27.1797 -1 20 -1C12.8203 -1 7 4.8203 7 12C7 19.1797 12.8203 25 20 25Z" stroke="#4f9cf9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M13.21 22.89L11 41L20 36L29 41L26.79 22.88" stroke="#4f9cf9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="reward-place">{prize.place}</h3>
                  <p className="reward-amount">{prize.amount}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQs */}
          <section className="view-section">
            <h2 className="view-section-title">FAQs</h2>
            <div className="faqs-list">
              {hackathon.faqs.map((faq, index) => (
                <div className="faq-item" key={index}>
                  <h3 className="faq-question">{faq.question}</h3>
                  <p className="faq-answer">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

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

export default ViewHackathon;