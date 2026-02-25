import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Footer from '../../components/judge/Footer'; 
import API, { getAuthHeaders, getHackathonById } from '../../services/api'; 
import '../../styles/SingleHackathon.css';

const SingleHackathon = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('About');
  const [lookingForTeam, setLookingForTeam] = useState(true);
  
  // State to track if the user is registered
  const [isRegistered, setIsRegistered] = useState(false); 
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // --- FETCH DATA & REGISTRATION STATUS ---
  useEffect(() => {
    const fetchHackathonData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch the hackathon details
        const response = await getHackathonById(id);
        if (response.data && response.data.success) {
            setHackathon(response.data.data);
        } else if (response.success) {
            setHackathon(response.data);
        } else {
            setError("Failed to load details.");
        }

        // 2. Fetch current user to check if they are registered for this hackathon
        try {
          const userRes = await API.get('/users/me', getAuthHeaders());
          const userData = userRes.data?.data || userRes.data;
          
          if (userData && userData.hackathonRoles) {
            // Check if this hackathon ID exists in the user's roles array AS A PARTICIPANT
            const isReg = userData.hackathonRoles.some(
              (role) => String(role.hackathonId) === String(id) && role.role === 'participant'
            );
            setIsRegistered(isReg);
          }
        } catch (authErr) {
          console.log("Could not verify user registration status:", authErr);
        }

      } catch (err) {
        setError("Error loading hackathon.");
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchHackathonData();
  }, [id]);

  // --- LIVE COUNTDOWN LOGIC ---
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

    calculateTimeLeft(); // Run immediately
    const timer = setInterval(calculateTimeLeft, 1000); // Update every second

    return () => clearInterval(timer);
  }, [hackathon]);

  // --- FIXED SCROLL LOGIC ---
  const scrollToSection = (sectionId) => {
    setActiveTab(sectionId);
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 10);
  };

  const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "TBD";
  
  const getDuration = (start, end) => {
    if(!start || !end) return "TBD";
    const diff = Math.ceil(Math.abs(new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
    return `${diff} Days`;
  };

  if (loading) return <div className="sh-loading"><h2>Loading Event Details...</h2></div>;
  if (error) return <div className="sh-error"><h2>{error}</h2></div>;
  if (!hackathon) return null;

  const isHackingStarted = new Date() >= new Date(hackathon.startDate);
  const isSubmissionClosed = new Date() > new Date(hackathon.endDate);

  return (
    <div className="sh-wrapper">
      
      {/* 1. HERO SECTION */}
      <div className="sh-hero">
        <div className="sh-hero-glow"></div>
        <div className="sh-hero-inner">
          <div className="sh-badges">
             <span className={`sh-badge status-${hackathon.status?.toLowerCase() || 'default'}`}>
                {hackathon.status}
             </span>
             <span className="sh-badge mode">🌎 Online Event</span>
          </div>
          <h1 className="sh-title">{hackathon.title}</h1>
          <p className="sh-subtitle">Join developers and creators to build the future.</p>
        </div>
      </div>

      {/* 2. STICKY NAVBAR */}
      <div className="sh-nav">
        <div className="sh-nav-container">
            {['About', 'Timeline', 'Prizes', 'Rules'].map((tab) => (
              <button 
                key={tab}
                className={`sh-nav-link ${activeTab === tab ? 'active' : ''}`} 
                onClick={() => scrollToSection(tab)}
              >
                  {tab}
              </button>
            ))}
        </div>
      </div>

      {/* 3. MAIN LAYOUT */}
      <div className="sh-layout">
        
        {/* LEFT COLUMN: Main Content */}
        <div className="sh-main">
          
          <div id="About" className="sh-card">
            <h2 className="sh-card-title"><span className="title-icon">ℹ️</span> About the Hackathon</h2>
            <div className="sh-card-content about-text">
              {hackathon.description}
            </div>
          </div>

          <div id="Timeline" className="sh-card">
            <h2 className="sh-card-title"><span className="title-icon">🗓️</span> Timeline</h2>
            <div className="sh-timeline-container">
              <div className="sh-timeline-item">
                <div className="t-marker start"></div>
                <div className="t-content">
                  <h4 className="t-date">{formatDate(hackathon.registrationDeadline)}</h4>
                  <p className="t-label">Registration Closes</p>
                </div>
              </div>
              <div className="sh-timeline-item">
                <div className="t-marker active"></div>
                <div className="t-content">
                  <h4 className="t-date">{formatDate(hackathon.startDate)}</h4>
                  <p className="t-label">Hacking Begins</p>
                </div>
              </div>
              <div className="sh-timeline-item">
                <div className="t-marker end"></div>
                <div className="t-content">
                  <h4 className="t-date">{formatDate(hackathon.endDate)}</h4>
                  <p className="t-label">Submission Deadline</p>
                </div>
              </div>
            </div>
          </div>

          <div id="Prizes" className="sh-card">
            <h2 className="sh-card-title"><span className="title-icon">🏆</span> Prizes & Rewards</h2>
            <div className="sh-prize-box">
                <div className="prize-icon-wrapper">
                  <div className="prize-icon">🏅</div>
                </div>
                <div className="prize-details">
                  <span className="prize-label">Total Prize Pool</span>
                  <span className="prize-amount">{hackathon.prizePool || "Coming Soon"}</span>
                </div>
            </div>
          </div>

          <div id="Rules" className="sh-card">
            <h2 className="sh-card-title"><span className="title-icon">📋</span> Rules & Eligibility</h2>
            <ul className="sh-rules-list">
               {hackathon.rules ? hackathon.rules.split('.').map((rule, i) => (
                 rule.trim() && <li key={i}><span className="bullet"></span>{rule.trim()}.</li>
               )) : <li><span className="bullet"></span>Standard hackathon platform rules apply. Please respect code of conduct.</li>}
            </ul>
          </div>

        </div>

        {/* RIGHT COLUMN: Sidebar (Sticky) */}
        <div className="sh-sidebar">
          
          {/* THE CONDITIONAL ACTION CARD */}
          <div className="sh-action-card">
            
            {isRegistered ? (
              // --- PREMIUM PARTICIPANT DASHBOARD VIEW ---
              <div className="dashboard-view">
                
                {/* --- THE BULLETPROOF DASHBOARD HEADER --- */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'flex-start', 
                  gap: '16px', 
                  marginBottom: '24px', 
                  paddingBottom: '20px', 
                  borderBottom: '1px solid #E2E8F0' 
                }}>
                  <div className="status-badge" style={{ 
                    position: 'static', 
                    margin: '0', 
                    transform: 'none' 
                  }}>
                    <span className="status-dot"></span>
                    Registered
                  </div>
                  <h3 className="sidebar-title" style={{ 
                    margin: '0', 
                    padding: '0', 
                    lineHeight: '1' 
                  }}>
                    Your Dashboard
                  </h3>
                </div>
                {/* -------------------------------------- */}
                
                <div className="countdown-container">
                  <p className="countdown-label">
                    {isSubmissionClosed ? "Submissions Closed" : (isHackingStarted ? "Time Left to Submit" : "Hacking Starts In")}
                  </p>
                  
                  {!isSubmissionClosed && (
                    <div className="countdown-grid">
                      <div className="time-box"><span>{timeLeft.days.toString().padStart(2, '0')}</span><small>Days</small></div>
                      <div className="time-box"><span>{timeLeft.hours.toString().padStart(2, '0')}</span><small>Hours</small></div>
                      <div className="time-box"><span>{timeLeft.minutes.toString().padStart(2, '0')}</span><small>Mins</small></div>
                      <div className="time-box"><span>{timeLeft.seconds.toString().padStart(2, '0')}</span><small>Secs</small></div>
                    </div>
                  )}
                </div>

                {isHackingStarted && !isSubmissionClosed ? (
                  <button className="btn-primary-gradient" onClick={() => navigate(`/user/hackathon/${id}/submit`)}>
                    Open Submission Portal &rarr;
                  </button>
                ) : !isHackingStarted ? (
                  <button className="btn-disabled" disabled>Submission Opens Soon</button>
                ) : (
                  <button className="btn-disabled" disabled>Hackathon Ended</button>
                )}
              </div>
            ) : (
              // --- GUEST / UNREGISTERED VIEW ---
              <>
                <h3 className="sidebar-title">Join the Hackathon</h3>
                {hackathon.status !== 'closed' ? (
                    <div className="action-buttons">
                      <button className="btn-primary-gradient" onClick={() => navigate(`/user/hackathon/${id}/register`)}>
                        Register Now
                      </button>
                      <button className="btn-outline" onClick={() => navigate(`/user/hackathon/${id}/JoinTeam`)}>
                        Join a Team
                      </button>
                    </div>
                ) : (
                    <button className="btn-disabled" disabled>Registration Closed</button>
                )}

                <div className="team-toggle-box">
                  <span className="toggle-text">Looking for Teammates</span>
                  <div className={`custom-toggle ${lookingForTeam ? 'on' : 'off'}`} onClick={() => setLookingForTeam(!lookingForTeam)}>
                    <div className="toggle-knob"></div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Details Card */}
          <div className="sh-details-card">
            <h3 className="sidebar-title">Event Details</h3>
            <ul className="details-list">
              <li>
                <div className="d-icon-wrapper"><span className="d-icon">📅</span></div>
                <div className="d-text">
                  <span className="d-label">Dates</span>
                  <span className="d-val">{formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}</span>
                </div>
              </li>
              <li>
                <div className="d-icon-wrapper"><span className="d-icon">⏳</span></div>
                <div className="d-text">
                  <span className="d-label">Duration</span>
                  <span className="d-val">{getDuration(hackathon.startDate, hackathon.endDate)}</span>
                </div>
              </li>
              <li>
                <div className="d-icon-wrapper"><span className="d-icon">👥</span></div>
                <div className="d-text">
                  <span className="d-label">Team Size</span>
                  <span className="d-val">1 - {hackathon.maxTeamSize} Members</span>
                </div>
              </li>
              <li>
                <div className="d-icon-wrapper"><span className="d-icon">💲</span></div>
                <div className="d-text">
                  <span className="d-label">Cost</span>
                  <span className="d-val">Free to Enter</span>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SingleHackathon;