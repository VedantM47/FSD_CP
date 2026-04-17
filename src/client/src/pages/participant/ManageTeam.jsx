import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { API, getAuthHeaders } from '../../services/api';
import Navbar from '../../components/common/Navbar';

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
    <div>
      <Navbar />
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', color: '#6b7280', fontSize: '1.2rem', fontWeight: 'bold' }}>
        Loading Team Headquarters...
      </div>
    </div>
  );
  
  if (error) return (
    <div>
      <Navbar />
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px', fontWeight: 'bold', color: '#dc2626' }}>ERROR</div>
          <h2 style={{ margin: '0 0 10px 0', color: '#111827' }}>Oops!</h2>
          <p style={{ color: '#6b7280', marginBottom: '30px' }}>{error}</p>
          <button onClick={() => navigate(`/user/hackathon/${id}`)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>Back to Hackathon</button>
        </div>
      </div>
    </div>
  );
  
  if (!team) return null;

  const isLeader = currentUser && String(team.leader._id) === String(currentUser._id);
  const acceptedMembers = team.members.filter(m => m.status === 'accepted');
  const pendingMembers = team.members.filter(m => m.status === 'pending');

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
      <div style={styles.headerNav}>
        <button onClick={() => navigate(`/user/hackathon/${id}`)} style={styles.backLink}>
           ← Return to Dashboard
        </button>
      </div>

      <div style={styles.heroSection}>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>Team Headquarters</div>
          <h1 style={styles.teamName}>{team.name}</h1>
          <p style={styles.teamSub}>
            Led by <strong>{team.leader.fullName}</strong> • {acceptedMembers.length} / {team.maxSize} Members
          </p>
        </div>
        {!isLeader ? (
          <button onClick={handleLeaveTeam} style={styles.btnLeave}>
            Leave Team
          </button>
        ) : (
          <button 
            onClick={() => navigate(`/user/hackathon/${id}/team/${team._id}/find-members`)} 
            style={{ ...styles.btnLeave, background: '#10b981', color: 'white' }}
          >
            Find Members
          </button>
        )}
      </div>

      <div style={styles.layoutGrid}>
        {/* Left Column: Team Members */}
        <div style={styles.column}>
          <h2 style={styles.sectionTitle}>Team Roster</h2>
          <div style={styles.rosterGrid}>
            {acceptedMembers.map(m => {
              const memberId = m.userId?._id || m.userId;
              const isMemberLeader = String(team.leader._id || team.leader) === String(memberId);
              
              return (
                <div key={memberId} style={styles.memberCard}>
                  <div style={styles.cardHeader}>
                    <div style={styles.cardAvatar}>
                      {m.userId?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div style={styles.cardMeta}>
                      <h3 style={styles.memberName}>{m.userId?.fullName || 'Unknown User'}</h3>
                      <p style={styles.memberEmail}>{m.userId?.email || ''}</p>
                    </div>
                    {isMemberLeader && <span style={styles.leaderPill}>Leader</span>}
                  </div>
                  
                  <div style={styles.skillsSection}>
                    <label style={styles.miniLabel}>Skills</label>
                    <div style={styles.pillContainer}>
                      {m.userId?.skills?.length > 0 ? (
                        m.userId.skills.slice(0, 3).map(skill => (
                          <span key={skill} style={styles.skillPill}>{skill}</span>
                        ))
                      ) : (
                        <span style={styles.emptyPill}>No skills listed</span>
                      )}
                      {m.userId?.skills?.length > 3 && <span style={styles.morePill}>+{m.userId.skills.length - 3}</span>}
                    </div>
                  </div>

                  <div style={styles.cardActions}>
                    <Link to={`/profile/${memberId}`} style={styles.viewProfileLink}>View Profile</Link>
                    {isLeader && !isMemberLeader && (
                      <button 
                        onClick={() => handleManageMember(memberId, 'rejected')} 
                        style={styles.btnKick}
                      >
                        Kick
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Pending Requests */}
        <div style={styles.column}>
          <h2 style={styles.sectionTitle}>
            Join Requests {pendingMembers.length > 0 && <span style={styles.counter}>{pendingMembers.length}</span>}
          </h2>
          
          <div style={styles.requestStack}>
            {pendingMembers.length === 0 ? (
              <div style={styles.emptyRequests}>
                <div style={{ fontSize: '1.2rem', marginBottom: '10px', fontWeight: 'bold', color: '#6b7280' }}>No Requests</div>
                <p>No pending requests at the moment.</p>
              </div>
            ) : (
              pendingMembers.map(m => {
                const memberId = m.userId?._id || m.userId;
                const isOwnRequest = String(memberId) === String(currentUser?._id);

                return (
                  <div key={memberId} style={styles.requestCard}>
                    <div style={styles.requestTop}>
                       <div style={styles.requestAvatar}>
                         {m.userId?.fullName?.charAt(0).toUpperCase() || 'U'}
                       </div>
                       <div style={styles.requestMeta}>
                         <h4 style={styles.requestName}>{m.userId?.fullName || 'Unknown User'}</h4>
                         <p style={styles.requestEmail}>{m.userId?.email || ''}</p>
                       </div>
                    </div>

                    {m.message && (
                      <div style={styles.messageBox}>
                        <label style={styles.miniLabel}>Message:</label>
                        <p style={styles.messageText}>"{m.message}"</p>
                      </div>
                    )}

                    <div style={styles.requestSkills}>
                      <div style={styles.pillContainer}>
                        {m.userId?.skills?.slice(0, 3).map(skill => (
                          <span key={skill} style={styles.requestSkillPill}>{skill}</span>
                        ))}
                      </div>
                    </div>

                    <div style={styles.requestActions}>
                      {(isLeader || isOwnRequest) ? (
                        <>
                          <button 
                            onClick={() => handleManageMember(memberId, 'accepted')} 
                            style={styles.btnAccept}
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleManageMember(memberId, 'rejected')} 
                            style={styles.btnDecline}
                          >
                            Decline
                          </button>
                        </>
                      ) : (
                        <div style={styles.awaitingStatus}>Awaiting Leader Approval</div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    padding: '2rem 1rem',
    fontFamily: '"Inter", sans-serif',
  },
  headerNav: {
    maxWidth: '1200px',
    margin: '0 auto 1.5rem',
  },
  backLink: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  heroSection: {
    maxWidth: '1200px',
    margin: '0 auto 2.5rem',
    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    borderRadius: '20px',
    padding: '3rem',
    color: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
  },
  heroBadge: {
    background: 'rgba(255,255,255,0.1)',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '1rem',
    display: 'inline-block',
  },
  teamName: {
    fontSize: '2.5rem',
    fontWeight: '800',
    margin: '0 0 0.5rem 0',
  },
  teamSub: {
    fontSize: '1.1rem',
    opacity: 0.8,
  },
  btnLeave: {
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '10px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(239,68,68,0.2)',
  },
  layoutGrid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1.6fr 1fr',
    gap: '2.5rem',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  counter: {
    background: '#ef4444',
    color: '#fff',
    fontSize: '0.75rem',
    padding: '2px 8px',
    borderRadius: '99px',
  },
  rosterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  memberCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    position: 'relative',
  },
  cardAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: '#f1f5f9',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    fontWeight: '700',
  },
  cardMeta: {
    flex: 1,
  },
  memberName: {
    fontSize: '1rem',
    fontWeight: '700',
    margin: 0,
    color: '#1e293b',
  },
  memberEmail: {
    fontSize: '0.8rem',
    color: '#64748b',
    margin: 0,
  },
  leaderPill: {
    position: 'absolute',
    top: 0,
    right: 0,
    background: '#ecfdf5',
    color: '#059669',
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '4px 8px',
    borderRadius: '6px',
  },
  miniLabel: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.5rem',
    display: 'block',
  },
  pillContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  skillPill: {
    background: '#eff6ff',
    color: '#1d4ed8',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  emptyPill: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  morePill: {
    fontSize: '0.75rem',
    color: '#64748b',
    padding: '4px 0',
  },
  cardActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1rem',
    borderTop: '1px solid #f1f5f9',
  },
  viewProfileLink: {
    fontSize: '0.85rem',
    color: '#2563eb',
    fontWeight: '600',
    textDecoration: 'none',
  },
  btnKick: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  requestStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  requestCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    borderLeft: '4px solid #f59e0b',
  },
  requestTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
  },
  requestAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: '#fef3c7',
    color: '#d97706',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
  },
  requestMeta: {
    flex: 1,
  },
  requestName: {
    fontSize: '0.95rem',
    fontWeight: '700',
    margin: 0,
  },
  requestEmail: {
    fontSize: '0.75rem',
    color: '#64748b',
    margin: 0,
  },
  messageBox: {
    background: '#f8fafc',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  messageText: {
    fontSize: '0.85rem',
    color: '#475569',
    margin: 0,
    fontStyle: 'italic',
  },
  requestSkillPill: {
    background: '#f1f5f9',
    color: '#475569',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '0.7rem',
    fontWeight: '600',
  },
  requestActions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1.25rem',
  },
  btnAccept: {
    flex: 1,
    padding: '10px',
    background: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  btnDecline: {
    flex: 1,
    padding: '10px',
    background: '#f1f5f9',
    color: '#64748b',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  awaitingStatus: {
    width: '100%',
    textAlign: 'center',
    fontSize: '0.85rem',
    color: '#f59e0b',
    fontWeight: '600',
    background: '#fffbeb',
    padding: '8px',
    borderRadius: '8px',
  },
  emptyRequests: {
    textAlign: 'center',
    padding: '3rem 1rem',
    background: '#fff',
    borderRadius: '16px',
    border: '2px dashed #e2e8f0',
    color: '#94a3b8',
  }
};

export default ManageTeam;
