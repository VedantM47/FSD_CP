import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getHackathonTeams, requestJoinTeam } from '../../services/api'; 
import '../../styles/JoinTeam.css';

const JoinTeam = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState('intake');
  const [participantData, setParticipantData] = useState({ skills: '', bio: '', experience: 'Beginner' });
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [requesting, setRequesting] = useState(null);

  const handleIntakeSubmit = (e) => {
    e.preventDefault();
    setStep('browse');
    fetchTeams();
  };

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const { data } = await getHackathonTeams(id);
      if(data.success) setTeams(data.data);
    } catch (error) {
      console.error("Failed to load teams", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (teamId) => {
    if(!window.confirm("Send a request to join this team?")) return;
    try {
      setRequesting(teamId);
      await requestJoinTeam(teamId);
      alert("✅ Request Sent!");
    } catch (error) {
      const msg = error.response?.data?.message || "Request failed";
      alert(msg.includes('already') ? "⚠️ You have already requested this team." : `❌ Error: ${msg}`);
    } finally {
      setRequesting(null);
    }
  };

  if (step === 'intake') {
    return (
      <div className="jt-wrapper jt-intake-bg">
        <div className="jt-intake-card">
          <div className="jt-intake-icon">🚀</div>
          <h1 className="jt-intake-title">Build Your Profile</h1>
          <p className="jt-intake-subtitle">Let teams know what skills you bring to the hackathon.</p>
          
          <form onSubmit={handleIntakeSubmit} className="jt-intake-form">
            <div className="jt-form-group">
              <label>Top Skills</label>
              <input 
                className="jt-input"
                placeholder="React, C++, Machine Learning..." 
                value={participantData.skills}
                onChange={(e) => setParticipantData({...participantData, skills: e.target.value})}
                required
              />
            </div>

            <div className="jt-form-group">
              <label>Experience Level</label>
              <select 
                className="jt-select"
                value={participantData.experience}
                onChange={(e) => setParticipantData({...participantData, experience: e.target.value})}
              >
                <option>Beginner (Student)</option>
                <option>Intermediate (1-2 Hackathons)</option>
                <option>Advanced (Hackathon Veteran)</option>
              </select>
            </div>

            <div className="jt-form-group">
              <label>Bio / Pitch</label>
              <textarea 
                className="jt-textarea"
                rows="3"
                placeholder="Tell teams why they should pick you..." 
                value={participantData.bio}
                onChange={(e) => setParticipantData({...participantData, bio: e.target.value})}
                required
              />
            </div>

            <button type="submit" className="jt-btn-primary">Find Your Team →</button>
            <button type="button" onClick={() => navigate(-1)} className="jt-btn-ghost">Cancel</button>
          </form>
        </div>
      </div>
    );
  }

  const filteredTeams = teams.filter(team => {
    if(!team.isOpenToJoin) return false;
    return team.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="jt-wrapper jt-browse-bg">
      <div className="jt-browse-header">
        <div className="jt-header-content">
          <div className="jt-back-nav">
             <button onClick={() => setStep('intake')} className="jt-icon-btn">←</button>
             <div>
                <h2 className="jt-browse-title">Join a Team</h2>
                <p className="jt-browse-subtitle">Browse teams looking for <strong>{participantData.skills || "talented members"}</strong></p>
             </div>
          </div>
          
          <div className="jt-search-wrapper">
            <span className="jt-search-icon">🔍</span>
            <input 
              className="jt-search-input" 
              placeholder="Search by team name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="jt-teams-grid">
        {loading ? (
          <div className="jt-state-msg">Loading available teams...</div>
        ) : filteredTeams.length === 0 ? (
          <div className="jt-state-msg">No open teams found for this search.</div>
        ) : (
          filteredTeams.map((team) => {
            const memberCount = team.members?.filter(m => m.status === 'accepted').length || 0;
            const max = team.maxSize || 4;
            const percentage = (memberCount / max) * 100;
            const isFull = memberCount >= max;

            return (
              <div key={team._id} className="jt-card">
                <div className="jt-card-top">
                  <div className="jt-team-info">
                    <h3 className="jt-team-name">{team.name}</h3>
                    <span className={`jt-status-tag ${isFull ? 'full' : 'open'}`}>
                      {isFull ? 'FULL' : 'OPEN'}
                    </span>
                  </div>
                </div>

                <p className="jt-team-desc">
                  {team.projectDescription || "This team is looking for creative minds to help shape their vision. Join to get started!"}
                </p>

                <div className="jt-progress-section">
                  <div className="jt-progress-meta">
                    <span>Capacity</span>
                    <span>{memberCount} / {max}</span>
                  </div>
                  <div className="jt-progress-bar">
                    <div 
                      className="jt-progress-fill" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="jt-card-footer">
                  <div className="jt-leader-info">
                    <div className="jt-leader-avatar">
                      {team.leader?.fullName?.charAt(0).toUpperCase() || "L"}
                    </div>
                    <div className="jt-leader-details">
                      <span className="jt-leader-label">Leader</span>
                      <span className="jt-leader-name">{team.leader?.fullName || "Lead"}</span>
                    </div>
                  </div>
                  
                  <button 
                    className={`jt-btn-join ${isFull ? 'disabled' : ''}`}
                    disabled={isFull || requesting === team._id}
                    onClick={() => handleApply(team._id)}
                  >
                    {requesting === team._id ? '...' : (isFull ? 'Full' : 'Join')}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default JoinTeam;