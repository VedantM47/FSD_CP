import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 
import Navbar from '../../components/common/Navbar'; 
import { getHackathonById } from '../../services/api';
import '../../styles/admin.css';

function HackathonDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); 

  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ─── ROLE-BASED NAVIGATION LOGIC ───
  // If systemRole is 'admin', they get the full Admin Navbar.
  // If systemRole is 'user', they get the restricted Organizer Navbar.
  const navMode = user?.systemRole === "admin" ? "admin" : "organizer";

  useEffect(() => {
    const fetchHackathon = async () => {
      try {
        setLoading(true);
        const res = await getHackathonById(id);
        setHackathon(res.data.data);
      } catch (err) {
        setError('Failed to load hackathon dashboard. Access Denied or Not Found.');
      } finally {
        setLoading(false);
      }
    };
    fetchHackathon();
  }, [id]);

  if (loading) {
    return (
      <div className="admin-layout">
        <Navbar navigationMode={navMode} />
        <main className="admin-main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <div className="loader">Loading secure dashboard...</div>
        </main>
      </div>
    );
  }

  if (error || !hackathon) {
    return (
      <div className="admin-layout">
        <Navbar navigationMode={navMode} />
        <main className="admin-main">
          <div className="admin-container error-text" style={{ color: '#dc2626', textAlign: 'center', marginTop: '50px' }}>
            <h2>{error}</h2>
            <button onClick={() => navigate(-1)} className="btn-secondary">Go Back</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* The Navbar now automatically adapts. 
          Organizer sees: "Organizer Portal" | Logout
          Admin sees: "Admin Dashboard" | Dashboard | Create Hackathon | Logout
      */}
      <Navbar navigationMode={navMode} title="Manage Event" />

      <main className="admin-main">
        {/* ─── ACTION HEADER ─── */}
        <div className="admin-container" style={{ marginTop: '20px' }}>
          {/* Back Button */}
          <button
            onClick={() => navigate('/admin/dashboard')}
            style={{
              background: 'none',
              border: 'none',
              color: '#043873',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '16px',
              padding: '8px 0',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = '#4f9cf9'}
            onMouseLeave={(e) => e.target.style.color = '#043873'}
          >
            ← Back to Dashboard
          </button>

          <div className="admin-controls-card" style={{ background: '#fff', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <div className="admin-controls-left">
              <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>{hackathon.title}</h3>
              <span className={`status-badge status-${hackathon.status}`} style={{ textTransform: 'uppercase', fontSize: '0.7rem', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold' }}>
                {hackathon.status}
              </span>
            </div>

            <div className="admin-controls-actions">
              <button
                className="btn-secondary"
                onClick={() => navigate(`/admin/hackathons/${id}`)}
                style={{ marginRight: '10px' }}
              >
                View Page
              </button>
              
              <button
                className="btn-secondary"
                onClick={() => navigate(`/hackathon/${id}/discussion`)}
                style={{ marginRight: '10px' }}
              >
                View Discussion
              </button>

              <button
                className="btn-primary"
                style={{ backgroundColor: '#111827', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                onClick={() => navigate(`/admin/hackathons/${id}/edit`)}
              >
                Edit Event Details
              </button>
            </div>
          </div>
        </div>

        {/* ─── VISUAL HERO ─── */}
        <div className="hackathon-hero" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '50px 0', color: 'white', textAlign: 'center', marginTop: '20px' }}>
          <div className="hero-content">
            <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{hackathon.title}</h1>
            <p style={{ opacity: 0.8 }}>
              {new Date(hackathon.startDate).toLocaleDateString()} – {new Date(hackathon.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* ─── STATS OVERVIEW ─── */}
        <div className="admin-container" style={{ marginTop: '30px' }}>
          <section className="overview-section">
            <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#475569' }}>Management Overview</h2>
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="stats-card" style={{ background: '#fff', padding: '25px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '2rem', fontWeight: '900' }}>{hackathon.maxTeamSize}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Max Team Size</div>
              </div>

              <div className="stats-card" style={{ background: '#fff', padding: '25px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '2rem', fontWeight: '900', textTransform: 'capitalize' }}>{hackathon.status}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Current Status</div>
              </div>

              <div className="stats-card" style={{ background: '#fff', padding: '25px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '2rem', fontWeight: '900' }}>
                  {new Date(hackathon.registrationDeadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Reg. Deadline</div>
              </div>
            </div>
          </section>
        </div>

        {/* ─── CONTENT DETAILS ─── */}
        <div className="admin-container view-container" style={{ marginTop: '40px', display: 'grid', gap: '30px', paddingBottom: '60px' }}>
          <section className="view-section">
            <h2 style={{ fontSize: '1.1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>Description</h2>
            <p style={{ color: '#334155', lineHeight: '1.6' }}>{hackathon.description}</p>
          </section>

          {/* PROBLEM STATEMENTS */}
          {hackathon.problemStatements && hackathon.problemStatements.length > 0 && (
            <section className="view-section">
              <h2 style={{ fontSize: '1.1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>Problem Statements</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {hackathon.problemStatements.map((ps, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      padding: '20px', 
                      backgroundColor: '#f8fafc', 
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <h3 style={{ 
                      margin: '0 0 12px 0', 
                      fontSize: '1.05rem', 
                      fontWeight: '600', 
                      color: '#0f172a' 
                    }}>
                      {index + 1}. {ps.title}
                    </h3>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '0.95rem', 
                      lineHeight: '1.6', 
                      color: '#475569',
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
              <h2 style={{ fontSize: '1.1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>Rounds</h2>
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
                      fontSize: '1.05rem', 
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

          <section className="view-section">
            <h2 style={{ fontSize: '1.1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>Rules</h2>
            <p style={{ color: '#334155', lineHeight: '1.6' }}>{hackathon.rules}</p>
          </section>

          <section className="view-section">
            <h2 style={{ fontSize: '1.1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>Prize Pool</h2>
            {hackathon.prizes && hackathon.prizes.length > 0 ? (
              <div>
                {hackathon.prizes.map((prize, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '10px 15px', 
                    background: '#f8fafc', 
                    borderRadius: '8px', 
                    marginBottom: '10px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <span style={{ fontWeight: '600', color: '#334155' }}>{prize.position}</span>
                    <span style={{ fontWeight: '700', color: '#059669', fontSize: '1.1rem' }}>
                      ₹{prize.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
                <div style={{ 
                  marginTop: '15px', 
                  paddingTop: '15px', 
                  borderTop: '2px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>Total Prize Pool:</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#059669' }}>
                    ₹{hackathon.prizes.reduce((sum, prize) => sum + prize.amount, 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ) : (
              <p style={{ color: '#334155', fontWeight: '600', fontSize: '1.2rem', color: '#059669' }}>{hackathon.prizePool}</p>
            )}
          </section>
        </div>
      </main>

      <footer className="admin-footer" style={{ textAlign: 'center', padding: '30px', borderTop: '1px solid #e2e8f0', color: '#94a3b8', fontSize: '0.8rem' }}>
        <div className="footer-content">
          <span>&copy; 2026 HackHub Organizer Suite • Secure Management Session</span>
        </div>
      </footer>
    </div>
  );
}

export default HackathonDashboard;