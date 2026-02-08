import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Footer from '../../components/judge/Footer'; 
import { getHackathonById } from '../../services/api'; 
import '../../styles/SingleHackathon.css';

const SingleHackathon = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('About');
  const [lookingForTeam, setLookingForTeam] = useState(true);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchHackathonData = async () => {
      try {
        setLoading(true);
        const response = await getHackathonById(id);
        
        if (response.data && response.data.success) {
            setHackathon(response.data.data);
        } else if (response.success) {
            setHackathon(response.data);
        } else {
            setError("Failed to load details.");
        }
      } catch (err) {
        setError("Error loading hackathon.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchHackathonData();
  }, [id]);

  const scrollToSection = (id) => {
    setActiveTab(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "TBD";
  
  const getDuration = (start, end) => {
    if(!start || !end) return "TBD";
    const diff = Math.ceil(Math.abs(new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
    return `${diff} Days`;
  };

  if (loading) return <div className="hackathon-page" style={{paddingTop:'100px', textAlign:'center'}}><h2>Loading...</h2></div>;
  if (error) return <div className="hackathon-page" style={{paddingTop:'100px', textAlign:'center'}}><h2>{error}</h2></div>;
  if (!hackathon) return null;

  return (
    <div className="hackathon-page">
      
      {/* 1. HERO HEADER */}
      <div className="hackathon-hero">
        <div className="hero-content">
          <h1 className="hero-title">{hackathon.title}</h1>
          <div className="hero-badges">
             <span className="hero-badge status">
                {hackathon.status}
             </span>
             <span className="hero-badge mode">Online Event</span>
          </div>
        </div>
      </div>

      {/* 2. NAVBAR (Fixed Logic) */}
      <div className="hackathon-nav">
        <div className="nav-container">
            <button 
              className={`nav-link ${activeTab === 'About' ? 'active' : ''}`} 
              onClick={() => scrollToSection('About')}
            >
                <span className="nav-icon">ℹ️</span> 
                <span>About</span>
            </button>
            
            <button 
              className={`nav-link ${activeTab === 'Timeline' ? 'active' : ''}`} 
              onClick={() => scrollToSection('Timeline')}
            >
                <span className="nav-icon">📅</span> 
                <span>Timeline</span>
            </button>
            
            <button 
              className={`nav-link ${activeTab === 'Prizes' ? 'active' : ''}`} 
              onClick={() => scrollToSection('Prizes')}
            >
                <span className="nav-icon">🏆</span> 
                <span>Prizes</span>
            </button>
            
            <button 
              className={`nav-link ${activeTab === 'Eligibility' ? 'active' : ''}`} 
              onClick={() => scrollToSection('Eligibility')}
            >
                <span className="nav-icon">✅</span> 
                <span>Rules</span>
            </button>
        </div>
      </div>

      {/* 3. MAIN GRID */}
      <div className="hackathon-container">
        <div className="main-content">
          
          {/* STATS GRID */}
          <div className="stats-grid">
             <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-info">
                   <span className="stat-label">Dates</span>
                   <span className="stat-value">{formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}</span>
                </div>
             </div>
             
             <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-info">
                   <span className="stat-label">Duration</span>
                   <span className="stat-value">{getDuration(hackathon.startDate, hackathon.endDate)}</span>
                </div>
             </div>

             <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                   <span className="stat-label">Team Size</span>
                   <span className="stat-value">1 - {hackathon.maxTeamSize} Members</span>
                </div>
             </div>

             <div className="stat-card">
                <div className="stat-icon">💲</div>
                <div className="stat-info">
                   <span className="stat-label">Registration</span>
                   <span className="stat-value">Free</span>
                </div>
             </div>
          </div>

          {/* About */}
          <div id="About" className="section-card">
            <h2 className="card-title">About the Hackathon</h2>
            <p className="about-text">{hackathon.description}</p>
          </div>

          {/* Timeline */}
          <div id="Timeline" className="section-card">
            <h2 className="card-title">Timeline</h2>
            <div className="timeline-row">
              <div className="t-block">
                <div className="t-dot warning"></div>
                <span className="t-date">{formatDate(hackathon.registrationDeadline)}</span>
                <span className="t-label">Registration Closes</span>
              </div>
              <div className="t-block">
                <div className="t-dot success"></div>
                <span className="t-date">{formatDate(hackathon.startDate)}</span>
                <span className="t-label">Hacking Begins</span>
              </div>
              <div className="t-block">
                <div className="t-dot danger"></div>
                <span className="t-date">{formatDate(hackathon.endDate)}</span>
                <span className="t-label">Submission Deadline</span>
              </div>
            </div>
          </div>

          {/* Prizes */}
          <div id="Prizes" className="section-card">
            <h2 className="card-title">Prizes & Rewards</h2>
            <div style={{background:'#F9FAFB', padding:'24px', borderRadius:'12px', border:'1px solid #E5E7EB', display:'flex', alignItems:'center', gap:'20px'}}>
                <div style={{fontSize:'3rem'}}>🏆</div>
                <div>
                  <h3 style={{margin:'0 0 5px 0', color:'#4B5563', fontSize:'0.9rem', textTransform:'uppercase'}}>Total Prize Pool</h3>
                  <p style={{fontSize:'2rem', fontWeight:'800', color:'#0B2545', margin:0}}>{hackathon.prizePool || "Coming Soon"}</p>
                </div>
            </div>
          </div>

          {/* Rules */}
          <div id="Eligibility" className="section-card">
            <h2 className="card-title">Rules & Eligibility</h2>
            <ul style={{lineHeight:'1.8', paddingLeft:'20px', color:'#4B5563'}}>
               {hackathon.rules ? hackathon.rules.split('.').map((rule, i) => (
                 rule.trim() && <li key={i} style={{marginBottom:'8px'}}>{rule.trim()}.</li>
               )) : <li>Standard hackathon rules apply.</li>}
            </ul>
          </div>

        </div>

        {/* SIDEBAR */}
        <div className="sidebar-sticky">
          <div className="sidebar-card">
             
             {/* Dynamic Buttons */}
             {hackathon.status !== 'closed' ? (
                <>
                  <button className="btn-register" onClick={() => navigate(`/user/hackathon/${id}/register`)}>
                    <span>⚡</span> Register Now
                  </button>
                  <button className="btn-join" onClick={() => navigate(`/user/hackathon/${id}/JoinTeam`)}>
                    <span>👥</span> Join a Team
                  </button>
                </>
             ) : (
                <button className="btn-register disabled" disabled>Registration Closed</button>
             )}
            
            <div className="team-toggle" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'24px', paddingTop:'20px', borderTop:'1px solid #eee'}}>
              <span style={{fontWeight:'600', fontSize:'0.9rem', color:'#4B5563'}}>Looking for Teammates</span>
              <div onClick={() => setLookingForTeam(!lookingForTeam)} style={{
                  width:'44px', height:'24px', background: lookingForTeam ? '#10B981' : '#E5E7EB', 
                  borderRadius:'20px', position:'relative', cursor:'pointer', transition:'0.3s'
              }}>
                <div style={{
                    width:'18px', height:'18px', background:'white', borderRadius:'50%', 
                    position:'absolute', top:'3px', left:'3px', transition:'0.3s',
                    transform: lookingForTeam ? 'translateX(20px)' : 'translateX(0)',
                    boxShadow:'0 1px 2px rgba(0,0,0,0.2)'
                }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default SingleHackathon;