import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API, { getAuthHeaders } from '../../services/api';
import '../../styles/global.css'; // or reuse a specific style

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
        // 1. Get current user
        const userRes = await API.get('/users/me', getAuthHeaders());
        const userData = userRes.data?.data;
        setCurrentUser(userData);

        // 2. Find user's team in this hackathon
        const teamsRes = await API.get(`/hackathons/${id}/teams`, getAuthHeaders());
        const allTeams = teamsRes.data?.data || [];
        const userTeamSummary = allTeams.find(t => 
          t.members.some(m => String(m.userId._id || m.userId) === String(userData._id))
        );

        if (!userTeamSummary) {
          setError("You are not part of any team for this hackathon.");
          return;
        }

        // 3. Fetch full team details
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
      await API.patch(`/teams/${team._id}/manage-member`, { memberId, status }, getAuthHeaders());
      // Refresh team data
      const teamDetailsRes = await API.get(`/teams/${team._id}`, getAuthHeaders());
      setTeam(teamDetailsRes.data?.data);
      alert(`Member ${status} successfully!`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update member status.");
    }
  };

  const handleLeaveTeam = async () => {
    if (window.confirm("Are you sure you want to leave this team?")) {
      try {
        await API.delete(`/teams/${team._id}/leave`, getAuthHeaders());
        alert("You have left the team.");
        navigate(`/user/hackathon/${id}`);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to leave team.");
      }
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}><h2>Loading Team...</h2></div>;
  if (error) return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h2>{error}</h2>
      <button className="btn-primary" onClick={() => navigate(`/user/hackathon/${id}`)}>Back to Hackathon</button>
    </div>
  );
  if (!team) return null;

  const isLeader = currentUser && String(team.leader._id) === String(currentUser._id);
  const acceptedMembers = team.members.filter(m => m.status === 'accepted');
  const pendingMembers = team.members.filter(m => m.status === 'pending');

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <button className="back-btn" onClick={() => navigate(`/user/hackathon/${id}`)} style={{ marginBottom: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#3B82F6', fontWeight: 'bold' }}>
        ← Back to Hackathon
      </button>

      <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <h1 style={{ marginBottom: '10px', fontSize: '2rem' }}>Team: {team.name}</h1>
        <p style={{ color: '#6B7280', marginBottom: '30px' }}>
          Leader: <strong>{team.leader.fullName}</strong> | Members: {acceptedMembers.length} / {team.maxSize}
        </p>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', borderBottom: '2px solid #E5E7EB', paddingBottom: '10px' }}>Current Members</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
          {acceptedMembers.map(m => (
            <div key={m.userId._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
              <div>
                <p style={{ fontWeight: 'bold', margin: '0' }}>{m.userId.fullName}</p>
                <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: '0' }}>{m.userId.email}</p>
              </div>
              <div>
                {String(team.leader._id) === String(m.userId._id) ? (
                  <span style={{ background: '#DBEAFE', color: '#1D4ED8', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>Leader</span>
                ) : (
                  <span style={{ background: '#D1FAE5', color: '#065F46', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>Member</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {pendingMembers.length > 0 && (
          <>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', borderBottom: '2px solid #E5E7EB', paddingBottom: '10px' }}>Pending Requests / Invites</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
              {pendingMembers.map(m => (
                <div key={m.userId._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', background: '#FFFBEB', borderRadius: '8px', border: '1px solid #FEF3C7' }}>
                  <div>
                    <p style={{ fontWeight: 'bold', margin: '0' }}>{m.userId.fullName}</p>
                    <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: '0' }}>{m.userId.email}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {/* The leader can accept/reject requests, OR the invited user can accept/reject their own invite */}
                    {(isLeader || String(m.userId._id) === String(currentUser._id)) ? (
                      <>
                        <button onClick={() => handleManageMember(m.userId._id, 'accepted')} style={{ background: '#10B981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Accept</button>
                        <button onClick={() => handleManageMember(m.userId._id, 'rejected')} style={{ background: '#EF4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Reject</button>
                      </>
                    ) : (
                      <span style={{ background: '#F3F4F6', color: '#4B5563', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>Pending Response</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #E5E7EB', textAlign: 'right' }}>
          {String(team.leader._id) !== String(currentUser._id) && (
            <button onClick={handleLeaveTeam} style={{ background: 'white', color: '#EF4444', border: '1px solid #EF4444', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              Leave Team
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageTeam;
