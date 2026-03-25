import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API, { getAuthHeaders } from '../../services/api';

const ManageTeam = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // hackathonId
  const [team, setTeam] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        const userRes = await API.get('/users/me', getAuthHeaders());
        const userData = userRes.data?.data;
        setCurrentUser(userData);

        const teamsRes = await API.get(`/hackathons/${id}/teams`, getAuthHeaders());
        const allTeams = teamsRes.data?.data || [];
        const userTeamSummary = allTeams.find(t => 
          t.members.some(m => String(m.userId._id || m.userId) === String(userData._id))
        );

        if (!userTeamSummary) {
          setError("You are not part of any team for this hackathon.");
          return;
        }

        const teamDetailsRes = await API.get(`/teams/${userTeamSummary._id}`, getAuthHeaders());
        setTeam(teamDetailsRes.data?.data);

      } catch (err) {
        console.error(err);
        setError("Failed to load team data.");
      } finally {
        setLoading(false);
      }
    };
    fetchTeamData();
  }, [id]);

  const handleManageMember = async (memberId, status) => {
    try {
      await API.patch(`/teams/${team._id}/member`, { memberId, status }, getAuthHeaders());
      // Refresh
      const teamDetailsRes = await API.get(`/teams/${team._id}`, getAuthHeaders());
      setTeam(teamDetailsRes.data?.data);
      alert(`Member request ${status} successfully!`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update member status.");
    }
  };

  const handleLeaveTeam = async () => {
    if (window.confirm("Are you sure you want to leave this team? This action is permanent!")) {
      try {
        await API.delete(`/teams/${team._id}/leave`, getAuthHeaders());
        alert("You have left the team.");
        navigate(`/user/hackathon/${id}`);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to leave team.");
      }
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', color: '#6b7280', fontSize: '1.2rem', fontWeight: 'bold' }}>
      Loading Team Headquarters...
    </div>
  );
  
  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🚫</div>
        <h2 style={{ margin: '0 0 10px 0', color: '#111827' }}>Oops!</h2>
        <p style={{ color: '#6b7280', marginBottom: '30px' }}>{error}</p>
        <button onClick={() => navigate(`/user/hackathon/${id}`)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>Back to Hackathon</button>
      </div>
    </div>
  );
  
  if (!team) return null;

  const isLeader = currentUser && String(team.leader._id) === String(currentUser._id);
  const acceptedMembers = team.members.filter(m => m.status === 'accepted');
  const pendingMembers = team.members.filter(m => m.status === 'pending');

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Navigation */}
        <button onClick={() => navigate(`/user/hackathon/${id}`)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: '#4b5563', fontWeight: 'bold', cursor: 'pointer', padding: '0 0 20px 0', fontSize: '1rem', transition: 'color 0.2s' }}>
          <span style={{ fontSize: '1.2rem' }}>←</span> Return to Dashboard
        </button>

        {/* Hero Header */}
        <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)', borderRadius: '24px', padding: '40px', color: 'white', marginBottom: '30px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '15px', backdropFilter: 'blur(10px)' }}>
              Team Headquarters
            </div>
            <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0', fontWeight: '900', letterSpacing: '-1px' }}>{team.name}</h1>
            <p style={{ fontSize: '1.1rem', margin: 0, opacity: 0.9 }}>
              Led by <strong>{team.leader.fullName}</strong> • {acceptedMembers.length} / {team.maxSize} Members
            </p>
          </div>
          
          {!isLeader && (
            <button onClick={handleLeaveTeam} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px rgba(239, 68, 68, 0.3)', transition: 'transform 0.1s' }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span>🚪</span> Leave Team
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
          
          {/* Left Column: Accepted Members */}
          <div style={{ background: 'white', borderRadius: '24px', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <h2 style={{ margin: '0 0 25px 0', fontSize: '1.5rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Roster
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {acceptedMembers.map(m => (
                <div key={m.userId._id} style={{ display: 'flex', alignItems: 'center', padding: '15px', border: '1px solid #e5e7eb', borderRadius: '16px', background: '#f9fafb' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', marginRight: '15px' }}>
                    {m.userId.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 2px 0', fontSize: '1rem', color: '#1f2937' }}>{m.userId.fullName}</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>{m.userId.email}</p>
                  </div>
                  <div>
                    {String(team.leader._id) === String(m.userId._id) ? (
                      <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '6px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid #c7d2fe' }}>LEADER</span>
                    ) : (
                      <span style={{ background: '#f3f4f6', color: '#4b5563', padding: '6px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid #e5e7eb' }}>MEMBER</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Pending Requests */}
          <div style={{ background: 'white', borderRadius: '24px', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <h2 style={{ margin: '0 0 25px 0', fontSize: '1.5rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
              <span>📥</span> Inbox / Requests
              {pendingMembers.length > 0 && (
                <span style={{ position: 'absolute', top: '-5px', right: 0, background: '#ef4444', color: 'white', width: '24px', height: '24px', borderRadius: '50%', fontSize: '0.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{pendingMembers.length}</span>
              )}
            </h2>

            {pendingMembers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', border: '2px dashed #e5e7eb', borderRadius: '16px', color: '#9ca3af' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📫</div>
                <p style={{ margin: 0, fontWeight: '500' }}>No pending requests.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {pendingMembers.map(m => (
                  <div key={m.userId._id} style={{ padding: '20px', border: '1px solid #fef3c7', borderRadius: '16px', background: '#fffbeb', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#f59e0b' }}></div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fcd34d', color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem', marginRight: '15px' }}>
                        {m.userId.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 style={{ margin: '0 0 2px 0', fontSize: '1rem', color: '#92400e' }}>{m.userId.fullName}</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#b45309' }}>{m.userId.email}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      {(isLeader || String(m.userId._id) === String(currentUser._id)) ? (
                        <>
                          <button 
                            onClick={() => handleManageMember(m.userId._id, 'accepted')} 
                            style={{ flex: 1, background: '#10b981', color: 'white', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 2px 4px rgba(16,185,129,0.2)' }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#059669'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#10b981'}
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleManageMember(m.userId._id, 'rejected')} 
                            style={{ flex: 1, background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', padding: '10px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#fecaca'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#fee2e2'}
                          >
                            Decline
                          </button>
                        </>
                      ) : (
                        <div style={{ width: '100%', textAlign: 'center', padding: '10px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '10px', color: '#b45309', fontWeight: '500', fontSize: '0.9rem' }}>
                          Awaiting Leader Approval
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ManageTeam;
