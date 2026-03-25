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
    try {
      setRequesting(teamId);
      await requestJoinTeam(teamId);
      alert("Request Sent Successfully! The team leader will review your application.");
    } catch (error) {
      const msg = error.response?.data?.message || "Request failed";
      alert(msg.includes('already') ? "You have already requested this team or are currently in a team." : `Error: ${msg}`);
    } finally {
      setRequesting(null);
    }
  };

  if (step === 'intake') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)', padding: '20px' }}>
        <div style={{ background: '#ffffff', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>👋</div>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '2rem', color: '#111827', fontWeight: '800' }}>Builder Profile</h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '1.1rem' }}>Let's introduce yourself to potential teammates.</p>
          </div>
          
          <form onSubmit={handleIntakeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>Your Technical Stack</label>
              <input 
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '1rem', transition: 'border-color 0.2s', outline: 'none' }}
                placeholder="React, Python, UI/UX..." 
                value={participantData.skills}
                onChange={(e) => setParticipantData({...participantData, skills: e.target.value})}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>Experience Level</label>
              <select 
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '1rem', outline: 'none', background: '#fff', cursor: 'pointer' }}
                value={participantData.experience}
                onChange={(e) => setParticipantData({...participantData, experience: e.target.value})}
              >
                <option>Novice (First Hackathon)</option>
                <option>Intermediate (1-2 Hackathons)</option>
                <option>Advanced (Hackathon Veteran)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>Quick Pitch</label>
              <textarea 
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '1rem', outline: 'none', resize: 'vertical', minHeight: '100px' }}
                placeholder="Hi! I am a frontend developer looking to build something awesome..." 
                value={participantData.bio}
                onChange={(e) => setParticipantData({...participantData, bio: e.target.value})}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
              <button 
                type="button" 
                onClick={() => navigate(-1)} 
                style={{ flex: 1, padding: '15px', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
              >
                Back
              </button>
              <button 
                type="submit" 
                style={{ flex: 2, padding: '15px', background: 'linear-gradient(to right, #2563eb, #3b82f6)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)', transition: 'transform 0.1s' }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Find Teams 🚀
              </button>
            </div>
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
    <div style={{ background: '#f9fafb', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <button 
              onClick={() => setStep('intake')} 
              style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer', padding: '0 0 10px 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              ← Back to Profile
            </button>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#111827', margin: 0 }}>Join a Team</h1>
            <p style={{ color: '#6b7280', fontSize: '1.1rem', margin: '5px 0 0 0' }}>Discover open teams looking for <strong>{participantData.skills || "talented members"}</strong>.</p>
          </div>
          
          <div style={{ position: 'relative', width: '100%', maxWidth: '350px' }}>
            <input 
              style={{ width: '100%', padding: '15px 15px 15px 45px', borderRadius: '50px', border: '1px solid #e5e7eb', fontSize: '1rem', outline: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
              placeholder="Search teams by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#6b7280', fontSize: '1.2rem' }}>Loading teams...</div>
          ) : filteredTeams.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '16px', border: '2px dashed #e5e7eb', color: '#6b7280', fontSize: '1.2rem' }}>
              No open teams found. Try adjusting your search!
            </div>
          ) : (
            filteredTeams.map((team) => {
              const memberCount = team.members?.filter(m => m.status === 'accepted').length || 0;
              const max = team.maxSize || 4;
              const percentage = (memberCount / max) * 100;
              const isFull = memberCount >= max;

              return (
                <div key={team._id} style={{ background: '#ffffff', borderRadius: '20px', padding: '25px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: '#1f2937' }}>{team.name}</h3>
                    <span style={{ padding: '6px 12px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px', background: isFull ? '#fee2e2' : '#dcfce7', color: isFull ? '#991b1b' : '#166534' }}>
                      {isFull ? 'FULL CAPACITY' : 'ACCEPTING MEMBERS'}
                    </span>
                  </div>

                  <p style={{ color: '#4b5563', fontSize: '0.95rem', lineHeight: '1.5', flex: 1, marginBottom: '25px' }}>
                    {team.projectDescription || "Looking for passionate teammates to build an innovative solution. Let's create something amazing together!"}
                  </p>

                  <div style={{ marginBottom: '25px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 'bold', color: '#6b7280', marginBottom: '8px' }}>
                      <span>Team Capacity</span>
                      <span>{memberCount} / {max} Filled</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: isFull ? '#ef4444' : '#3b82f6', borderRadius: '10px', transition: 'width 0.5s ease-out' }}></div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        {team.leader?.fullName?.charAt(0).toUpperCase() || "L"}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 'bold', letterSpacing: '1px' }}>Team Leader</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>{team.leader?.fullName || "Leader"}</div>
                      </div>
                    </div>
                    
                    <button 
                      disabled={isFull || requesting === team._id}
                      onClick={() => handleApply(team._id)}
                      style={{ 
                        padding: '10px 20px', 
                        borderRadius: '10px', 
                        border: 'none', 
                        background: (isFull || requesting === team._id) ? '#f3f4f6' : '#111827', 
                        color: (isFull || requesting === team._id) ? '#9ca3af' : 'white', 
                        fontWeight: 'bold', 
                        cursor: (isFull || requesting === team._id) ? 'not-allowed' : 'pointer',
                        transition: 'background 0.2s'
                      }}
                    >
                      {requesting === team._id ? 'Sending...' : (isFull ? 'Filled' : 'Request Join')}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinTeam;