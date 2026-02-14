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

  // --- HANDLERS ---
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

  // --- VIEW 1: INTAKE CARD ---
  if (step === 'intake') {
    return (
      <div className="join-team-wrapper intake-container">
        <div className="intake-card">
          <div className="intake-icon">🚀</div>
          <h1 className="intake-title">Build Your Profile</h1>
          <p className="intake-subtitle">Before you browse, let teams know what you bring to the table.</p>
          
          <form onSubmit={handleIntakeSubmit} className="intake-form">
            <div className="form-group">
              <label>Top Skills (comma separated)</label>
              <input 
                className="intake-input"
                placeholder="React, Python, Design..." 
                value={participantData.skills}
                onChange={(e) => setParticipantData({...participantData, skills: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Experience Level</label>
              <select 
                className="intake-select"
                value={participantData.experience}
                onChange={(e) => setParticipantData({...participantData, experience: e.target.value})}
              >
                <option>Beginner (Student)</option>
                <option>Intermediate (1-2 Hackathons)</option>
                <option>Advanced (Hackathon Veteran)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Short Bio / Pitch</label>
              <textarea 
                className="intake-textarea"
                rows="3"
                placeholder="I am a backend dev looking for a frontend partner..." 
                value={participantData.bio}
                onChange={(e) => setParticipantData({...participantData, bio: e.target.value})}
                required
              />
            </div>

            <button type="submit" className="btn-continue">Find Teams →</button>
            <button type="button" onClick={() => navigate(-1)} style={{background:'none', border:'none', color:'#9CA3AF', marginTop:'15px', cursor:'pointer', fontSize:'0.9rem'}}>Cancel</button>
          </form>
        </div>
      </div>
    );
  }

  // --- VIEW 2: MODERN BROWSER ---
  const filteredTeams = teams.filter(team => {
    if(!team.isOpenToJoin) return false;
    return team.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="join-team-wrapper">
      {/* Sticky Header */}
      <div className="browse-header">
        <div className="browse-title">
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
             <button onClick={() => setStep('intake')} style={{border:'none', background:'none', fontSize:'1.2rem', cursor:'pointer'}}>←</button>
             <h2>Join a Team</h2>
          </div>
          <p className="browse-subtitle">Showing open teams for <strong>{participantData.skills || "your skills"}</strong></p>
        </div>
        
        <div className="search-bar-wrapper">
          <span className="search-icon">🔍</span>
          <input 
            className="browse-search" 
            placeholder="Search teams..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="teams-grid">
        {loading ? <p style={{textAlign:'center', gridColumn:'1/-1', color:'#6B7280'}}>Loading teams...</p> : 
         filteredTeams.length === 0 ? <p style={{textAlign:'center', gridColumn:'1/-1', color:'#6B7280'}}>No teams found.</p> :
         filteredTeams.map((team) => {
           const memberCount = team.members.filter(m => m.status === 'accepted').length;
           const max = team.maxSize || 4;
           const percentage = (memberCount / max) * 100;
           const isFull = memberCount >= max;

           return (
             <div key={team._id} className="team-card">
               <div className="card-header">
                 <div className="t-name">{team.name}</div>
                 <div className="t-status">OPEN</div>
               </div>

               <p className="t-desc">
                 {team.projectDescription || "No description provided. Join to help define the project!"}
               </p>

               <div className="member-progress">
                 <div className="progress-label">
                   <span>Team Capacity</span>
                   <span>{memberCount}/{max}</span>
                 </div>
                 <div className="progress-track">
                   <div className="progress-fill" style={{width: `${percentage}%`, background: isFull ? '#EF4444' : '#3B82F6'}}></div>
                 </div>
               </div>

               {/* UPDATED FOOTER SECTION */}
               <div className="card-footer">
                 <div className="leader-badge">
                   <div className="leader-pic">
                     {team.leader?.fullName?.charAt(0).toUpperCase() || "U"}
                   </div>
                   <div className="leader-text">
                     <span className="leader-label">Team Lead</span>
                     <span className="leader-name">{team.leader?.fullName || "Unknown"}</span>
                   </div>
                 </div>
                 
                 <button 
                   className="btn-join"
                   disabled={isFull || requesting === team._id}
                   onClick={() => handleApply(team._id)}
                 >
                   {requesting === team._id ? 'Sending...' : (isFull ? 'Full' : 'Join Team')}
                 </button>
               </div>
             </div>
           );
         })}
      </div>
    </div>
  );
};

export default JoinTeam;