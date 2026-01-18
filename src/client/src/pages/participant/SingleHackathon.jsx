import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // 1. Import Hooks
import Footer from '../../components/judge/Footer'; 
import { mockHackathon } from '../../data/mockHackathon'; 
import '../../styles/SingleHackathon.css';

// Simple Icons 
const Icons = {
  About: () => <span>ℹ️</span>,
  Timeline: () => <span>📅</span>,
  Prizes: () => <span>🏆</span>,
  Eligibility: () => <span>👥</span>,
  FAQ: () => <span>❓</span>,
  Check: () => <span style={{color: '#22c55e', fontWeight: 'bold'}}>✓</span>,
  Trophy: () => <span>🏅</span>
};

const SingleHackathon = () => {
  // 2. Initialize Navigation
  const navigate = useNavigate();
  const { id } = useParams(); 
  
  // Use the ID from URL, or default to "1" if testing without params
  const hackathonId = id || "1";

  const [activeTab, setActiveTab] = useState('About');
  const [activeFaq, setActiveFaq] = useState(null);
  const [lookingForTeam, setLookingForTeam] = useState(true);

  // FIXED SCROLL FUNCTION
  const scrollToSection = (id) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const eligibilityList = mockHackathon.rules 
    ? mockHackathon.rules.split('.').filter(rule => rule.trim().length > 0)
    : [];

  return (
    <div className="hackathon-page">
      
      {/* 1. HERO SECTION */}
      <div className="hackathon-hero">
        <div className="hero-content">
          <h1 className="hero-title">{mockHackathon.name}</h1>
          <p className="hero-subtitle">
            Organized by {mockHackathon.organization} • {mockHackathon.location} • {mockHackathon.status}
          </p>
        </div>
      </div>

      {/* 2. NAVIGATION BAR */}
      <div className="hackathon-nav">
        <div className="nav-container">
          {['About', 'Timeline', 'Prizes', 'Eligibility', 'FAQs'].map((item) => (
            <button
              key={item}
              className={`nav-link ${activeTab === item ? 'active' : ''}`}
              onClick={() => scrollToSection(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* 3. MAIN CONTENT */}
      <div className="hackathon-container">
        
        {/* Left Column */}
        <div className="main-content">
          
          {/* About */}
          <div id="About" className="section-card">
            <h2 className="card-title"><Icons.About /> About</h2>
            <p className="about-text">{mockHackathon.description}</p>
            
            <div className="key-highlights">
              <span className="key-label">Problem Statement:</span>
              <p className="about-text">{mockHackathon.problemStatement}</p>
            </div>
          </div>

          {/* Timeline */}
          <div id="Timeline" className="section-card">
            <h2 className="card-title"><Icons.Timeline /> Timeline</h2>
            <div className="timeline-list">
              {mockHackathon.rounds.map((round) => (
                <div key={round.id} className="timeline-item">
                  <span className="t-date">{round.startDate} - {round.endDate}</span>
                  <div className="t-title">{round.name}</div>
                  <div className="t-desc">{round.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Prizes */}
          <div id="Prizes" className="section-card">
            <h2 className="card-title"><Icons.Prizes /> Prizes</h2>
            <p className="about-text" style={{marginBottom: '20px'}}>Total Prize Pool: <strong>{mockHackathon.totalPrizes}</strong></p>
            <div className="prizes-grid">
              {mockHackathon.prizes.map((prize, index) => (
                <div key={index} className="prize-card">
                  <span className="prize-icon"><Icons.Trophy /></span>
                  <h4 style={{fontWeight: '700', fontSize:'1.1rem'}}>{prize.amount}</h4>
                  <span style={{color: '#6b7280', fontSize:'0.9rem'}}>{prize.place}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Eligibility */}
          <div id="Eligibility" className="section-card">
            <h2 className="card-title"><Icons.Eligibility /> Eligibility & Rules</h2>
            <ul className="eligibility-list">
              {eligibilityList.map((rule, index) => (
                <li key={index}><Icons.Check /> {rule.trim()}.</li>
              ))}
              <li><Icons.Check /> Registration Fee: {mockHackathon.registrationFee}</li>
              <li><Icons.Check /> Team Size: {mockHackathon.minTeamSize} - {mockHackathon.maxTeamSize} members.</li>
            </ul>
          </div>

          {/* FAQs */}
          <div id="FAQs" className="section-card">
            <h2 className="card-title"><Icons.FAQ /> FAQs</h2>
            <div>
              {mockHackathon.faqs.map((faq, index) => (
                <div key={index} className="faq-item">
                  <button 
                    className="faq-btn"
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  >
                    {faq.question}
                    <span>{activeFaq === index ? '−' : '+'}</span>
                  </button>
                  {activeFaq === index && (
                    <div className="faq-answer">{faq.answer}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Sidebar (Sticky) */}
        <div className="sidebar-sticky">
          <div className="sidebar-card">
            
            {/* 3. UPDATED REGISTER BUTTON */}
            <button 
              className="btn-register"
              onClick={() => navigate(`/user/hackathon/${hackathonId}/register`)}
            >
              Register Now
            </button>

            <button className="btn-join" onClick={()=>navigate(`/user/hackathon/${hackathonId}/JoinTeam`)}>Join a Team</button>
            
            <div className="team-toggle">
              <span style={{fontWeight: '600', fontSize:'0.9rem'}}>Looking for Teammates</span>
              <div 
                className={`toggle-switch ${lookingForTeam ? 'on' : ''}`}
                onClick={() => setLookingForTeam(!lookingForTeam)}
              >
                <div className="toggle-circle"></div>
              </div>
            </div>
            
            <div style={{marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', fontSize: '0.85rem', color: '#6b7280'}}>
              <p><strong>Registration closes:</strong><br/> {mockHackathon.registrationDeadline}</p>
            </div>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default SingleHackathon;