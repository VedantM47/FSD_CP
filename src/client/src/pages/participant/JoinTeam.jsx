import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getHackathonTeams, requestJoinTeam, withdrawJoinRequest, getMe } from '../../services/api'; 
import '../../styles/JoinTeam.css';

const JoinTeam = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [requesting, setRequesting] = useState(null);
  const [user, setUser] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [joinMessage, setJoinMessage] = useState("");

  useEffect(() => {
    fetchUser();
    fetchTeams();
  }, []);

  const fetchUser = async () => {
    try {
      const { data } = await getMe();
      if (data.success) setUser(data.data);
    } catch (error) {
      console.error("Failed to load user", error);
    }
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

  const handleOpenJoinModal = (team) => {
    setSelectedTeam(team);
    setShowJoinModal(true);
  };

  const handleApply = async () => {
    if (!selectedTeam) return;
    try {
      setRequesting(selectedTeam._id);
      await requestJoinTeam(selectedTeam._id, joinMessage);
      setShowJoinModal(false);
      setJoinMessage("");
      alert("Request Sent Successfully! The team leader will review your application.");
      fetchTeams();
    } catch (error) {
      const msg = error.response?.data?.message || "Request failed";
      alert(msg.includes('already') ? "You have already requested this team or are currently in a team." : `Error: ${msg}`);
    } finally {
      setRequesting(null);
    }
  };

  const handleWithdraw = async (teamId) => {
    if (!window.confirm("Are you sure you want to withdraw your join request?")) return;
    try {
      setRequesting(teamId);
      await withdrawJoinRequest(teamId);
      alert("Request withdrawn successfully.");
      fetchTeams();
    } catch (error) {
      alert("Failed to withdraw request.");
    } finally {
      setRequesting(null);
    }
  };



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
              onClick={() => navigate(-1)} 
              style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer', padding: '0 0 10px 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              ← Back to Profile
            </button>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#111827', margin: 0 }}>Join a Team</h1>
            <p style={{ color: '#6b7280', fontSize: '1.1rem', margin: '5px 0 0 0' }}>Discover open teams looking for <strong>talented members</strong>.</p>
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
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => navigate(`/user/hackathon/${id}/team/${team._id}`)}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '10px',
                          border: '1px solid #e5e7eb',
                          background: '#fff',
                          color: '#374151',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                          fontSize: '0.9rem'
                        }}
                      >
                       View Details
                      </button>
                      
                      {user && team.members?.find(m => m.userId?._id === user._id && m.status === 'pending') ? (
                        <button 
                          disabled={requesting === team._id}
                          onClick={() => handleWithdraw(team._id)}
                          style={{ 
                            padding: '10px 16px', 
                            borderRadius: '10px', 
                            border: 'none', 
                            background: '#fee2e2', 
                            color: '#b91c1c', 
                            fontWeight: 'bold', 
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            fontSize: '0.9rem'
                          }}
                        >
                          {requesting === team._id ? 'Processing...' : 'Withdraw'}
                        </button>
                      ) : (
                        <button 
                          disabled={isFull || requesting === team._id}
                          onClick={() => handleOpenJoinModal(team)}
                          style={{ 
                            padding: '10px 16px', 
                            borderRadius: '10px', 
                            border: 'none', 
                            background: (isFull || requesting === team._id) ? '#f3f4f6' : '#111827', 
                            color: (isFull || requesting === team._id) ? '#9ca3af' : 'white', 
                            fontWeight: 'bold', 
                            cursor: (isFull || requesting === team._id) ? 'not-allowed' : 'pointer',
                            transition: 'background 0.2s',
                            fontSize: '0.9rem'
                          }}
                        >
                          {requesting === team._id ? 'Sending...' : (isFull ? 'Filled' : 'Request Join')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Join Message Modal */}
        {showJoinModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '30px', width: '100%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
              <h2 style={{ margin: '0 0 10px 0', fontSize: '1.5rem', color: '#111827' }}>Join {selectedTeam?.name}</h2>
              <p style={{ margin: '0 0 20px 0', color: '#6b7280', fontSize: '0.9rem' }}>Send a short message to the team leader introducing yourself.</p>
              
              <textarea 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.95rem', minHeight: '120px', outline: 'none', marginBottom: '20px' }}
                placeholder="Hi! I saw your team and I'd love to join. I have experience in..."
                value={joinMessage}
                onChange={(e) => setJoinMessage(e.target.value)}
              />

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setShowJoinModal(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleApply}
                  disabled={requesting === selectedTeam?._id}
                  style={{ flex: 2, padding: '12px', borderRadius: '8px', background: '#111827', color: '#fff', fontWeight: '600', border: 'none', cursor: 'pointer' }}
                >
                  {requesting === selectedTeam?._id ? "Sending..." : "Send Request"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinTeam;