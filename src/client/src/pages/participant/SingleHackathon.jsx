import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Footer from '../../components/judge/Footer'; 
import API, { getAuthHeaders, getHackathonById } from '../../services/api'; 
import '../../styles/SingleHackathon.css';

const SingleHackathon = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // --- 1. FULL STATE MANAGEMENT ---
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('About');
  const [isRegistered, setIsRegistered] = useState(false); 
  const [isJudge, setIsJudge] = useState(false); 
  const [userTeam, setUserTeam] = useState(null); 
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // --- 2. FETCH DATA & AUTH SYNC ---
  useEffect(() => {
    const fetchHackathonData = async () => {
      try {
        setLoading(true);
        
        // Fetch hackathon details (now includes minTeamSize and maxTeamSize)
        const response = await getHackathonById(id);
        const hackData = response.data?.data || response.data;
        setHackathon(hackData);

        const userRes = await API.get('/users/me', getAuthHeaders());
        const userData = userRes.data?.data || userRes.data;
        
        if (userData) {
          const judgeRole = userData.hackathonRoles?.some(
            (role) => String(role.hackathonId) === String(id) && role.role === 'judge'
          );
          setIsJudge(judgeRole);

          const participantRole = userData.hackathonRoles?.some(
            (role) => String(role.hackathonId) === String(id) && role.role === 'participant'
          );

          let teamDetails = null;
          try {
            const teamsRes = await API.get(`/hackathons/${id}/teams`, getAuthHeaders());
            const allTeams = teamsRes.data?.data || [];
            teamDetails = allTeams.find(team => 
              team.members.some(m => String(m.userId._id || m.userId) === String(userData._id))
            );
          } catch (teamErr) {
            console.error("Team sync lookup failed.");
          }

          setIsRegistered(participantRole || !!teamDetails);
          setUserTeam(teamDetails);
        }
      } catch (err) {
        setError("Error loading hackathon details. Please refresh.");
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchHackathonData();
  }, [id]);

  // --- 3. COUNTDOWN TIMER LOGIC ---
  useEffect(() => {
    if (!hackathon?.endDate) return;

    const calculateTimeLeft = () => {
      const difference = new Date(hackathon.endDate) - new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [hackathon]);

  const scrollToSection = (sectionId) => {
    setActiveTab(sectionId); 
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    }) : "TBD";
  };

  if (loading) return <div className="sh-loading"><h2>Initializing Portal...</h2></div>;
  if (error) return <div className="sh-error"><h2>{error}</h2></div>;
  if (!hackathon) return null;

  // --- DYNAMIC LOGIC HELPERS ---
  const isOngoing = hackathon.status === 'ongoing';
  const isRegistrationOpen = hackathon.status === 'open' && (!hackathon.registrationDeadline || new Date() <= new Date(hackathon.registrationDeadline));
  const isSubmissionClosed = new Date() > new Date(hackathon.endDate);
  
  // Dynamic Team Size Logic
  const minRequired = hackathon.minTeamSize || 1; 
  const maxAllowed = hackathon.maxTeamSize || 4;
  const acceptedMembers = userTeam?.members?.filter(m => m.status === 'accepted') || [];
  const meetsCriteria = acceptedMembers.length >= minRequired;

  return (
    <div className="sh-wrapper">
      <div className="sh-topbar">
        <button className="sh-back-btn" onClick={() => navigate(-1)}> &larr; Back </button>
      </div>

      <div className="sh-hero-container">
        <div className="sh-hero-card">
          <div className="sh-badges">
             <span className={`sh-badge status-${hackathon.status?.toLowerCase() || 'default'}`}>
                {hackathon.status}
             </span>
             <span className="sh-badge mode">Online Event</span>
          </div>
          <h1 className="sh-title">{hackathon.title}</h1>
          <p className="sh-subtitle">Collaborate with developers and build the future.</p>
        </div>
      </div>

      <div className="sh-layout">
        <div className="sh-main">
          <div className="sh-tabs-container">
            {['About', 'Timeline', 'Prizes', 'Rules'].map((tab) => (
              <button key={tab} className={`sh-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => scrollToSection(tab)}>
                  {tab}
              </button>
            ))}
          </div>
          
          <div id="About" className="sh-content-card">
            <h2 className="sh-card-title">About the Hackathon</h2>
            <div className="sh-card-content about-text">{hackathon.description}</div>
          </div>

          <div id="Timeline" className="sh-content-card">
            <h2 className="sh-card-title">Timeline</h2>
            <div className="modern-timeline">
              <div className="timeline-step">
                <div className="timeline-indicator"></div>
                <div className="timeline-content">
                  <h4 className="timeline-date">{formatDate(hackathon.registrationDeadline)}</h4>
                  <p className="timeline-event">Registration Closes</p>
                </div>
              </div>
              <div className="timeline-step active">
                <div className="timeline-indicator"></div>
                <div className="timeline-content">
                  <h4 className="timeline-date">{formatDate(hackathon.startDate)}</h4>
                  <p className="timeline-event">Hacking Begins</p>
                </div>
              </div>
              <div className="timeline-step">
                <div className="timeline-indicator"></div>
                <div className="timeline-content">
                  <h4 className="timeline-date">{formatDate(hackathon.endDate)}</h4>
                  <p className="timeline-event">Submission Deadline</p>
                </div>
              </div>
            </div>
          </div>

          <div id="Prizes" className="sh-content-card">
            <h2 className="sh-card-title">Prizes & Rewards</h2>
            <div className="prize-banner">
                <div className="prize-icon">🏆</div>
                <div className="prize-details">
                  <span className="prize-label">Total Prize Pool</span>
                  <span className="prize-amount">{hackathon.prizePool || "Coming Soon"}</span>
                </div>
            </div>
          </div>

          <div id="Rules" className="sh-content-card">
            <h2 className="sh-card-title">Rules & Eligibility</h2>
            <ul className="sh-rules-list">
               {hackathon.rules ? hackathon.rules.split('.').map((rule, i) => (
                 rule.trim() && <li key={i}>{rule.trim()}.</li>
               )) : <li>Standard platform rules apply.</li>}
            </ul>
          </div>
        </div>

        <div className="sh-sidebar">
          <div className="sh-sidebar-card action-card">
            
            {isJudge ? (
              <div className="sh-judge-view" style={{ textAlign: 'center', padding: '10px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⚖️</div>
                <h3 className="dashboard-title">Judge Panel</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '10px' }}>
                  Evaluation portal is active for registered judges.
                </p>
                <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => navigate('/judge/hackathons')}>
                  Go to Judge Panel
                </button>
              </div>
            ) : isRegistered ? (
              <div className="dashboard-view">
                <div className="dashboard-header">
                  <div className="registered-badge-pill"><span className="dot"></span>REGISTERED</div>
                  <h3 className="dashboard-title">Your Dashboard</h3>
                </div>
                
                <button 
                  className="btn-primary" 
                  style={{ width: '100%', marginBottom: '1rem', backgroundColor: '#0f172a' }}
                  onClick={() => navigate(`/user/hackathon/${id}/dashboard`)}
                >
                  🚀 Go To Full Dashboard
                </button>
                
                <div className="countdown-section">
                  {meetsCriteria && isOngoing && !isSubmissionClosed ? (
                    <>
                      <p className="countdown-text">Time Left to Submit</p>
                      <div className="time-blocks">
                        <div className="time-block"><span>{timeLeft.days.toString().padStart(2, '0')}</span><small>Days</small></div>
                        <div className="time-block"><span>{timeLeft.hours.toString().padStart(2, '0')}</span><small>Hrs</small></div>
                        <div className="time-block"><span>{timeLeft.minutes.toString().padStart(2, '0')}</span><small>Mins</small></div>
                        <div className="time-block"><span>{timeLeft.seconds.toString().padStart(2, '0')}</span><small>Secs</small></div>
                      </div>
                    </>
                  ) : !meetsCriteria && !isSubmissionClosed ? (
                    /* DYNAMIC WARNING BOX */
                    <div className="sh-warning-box" style={{ padding: '15px', background: '#FFFBEB', borderRadius: '10px', border: '1px solid #FDE68A', textAlign: 'center' }}>
                      <p style={{ margin: 0, color: '#92400E', fontWeight: '700', fontSize: '0.85rem' }}>⚠️ Action Required</p>
                      <p style={{ margin: '5px 0 0', color: '#B45309', fontSize: '0.75rem' }}>
                        Need {minRequired} accepted members to submit. Current: {acceptedMembers.length}.
                      </p>
                    </div>
                  ) : (
                    <p className="countdown-text">{isSubmissionClosed ? "Hackathon Ended" : "Submissions not yet open"}</p>
                  )}
                </div>

                {meetsCriteria && isOngoing && !isSubmissionClosed ? (
                  <button className="btn-primary" onClick={() => navigate(`/user/hackathon/${id}/submit`)}>Open Submission Portal</button>
                ) : (
                  <button className="btn-secondary" onClick={() => navigate(`/user/hackathon/${id}/manage-team`)}>Manage Team Members</button>
                )}
              </div>
            ) : (
              <div className="join-view">
                <h3 className="dashboard-title">Registration</h3>
                {isRegistrationOpen ? (
                  <div className="action-buttons">
                    <button className="btn-primary" onClick={() => navigate(`/user/hackathon/${id}/register`)}>Register Now</button>
                    <button className="btn-secondary" onClick={() => navigate(`/user/hackathon/${id}/JoinTeam`)}>Join a Team</button>
                  </div>
                ) : (
                  <div className="sh-closed-box" style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⌛</div>
                    <p style={{ fontWeight: '800', color: '#64748B', margin: 0 }}>Registration Closed</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="sh-sidebar-card">
            <h3 className="sidebar-title">Requirements</h3>
            <div className="detail-row">
              <span className="detail-label">Team Size</span>
              {/* DISPLAY DYNAMIC RANGE */}
              <span className="detail-value">{minRequired} - {maxAllowed} Members</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status</span>
              <span className="detail-value" style={{textTransform:'capitalize'}}>{hackathon.status}</span>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SingleHackathon;