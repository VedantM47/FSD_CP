import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API, { getAuthHeaders, requestJoinTeam, withdrawJoinRequest, getMe } from '../../services/api';

const TeamDetails = () => {
    const { id, teamId } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(false);
    const [joinMessage, setJoinMessage] = useState("");
    const [showJoinForm, setShowJoinForm] = useState(false);

    useEffect(() => {
        fetchData();
    }, [teamId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [teamRes, userRes] = await Promise.all([
                API.get(`/teams/${teamId}`, getAuthHeaders()),
                getMe()
            ]);
            if (teamRes.data.success) setTeam(teamRes.data.data);
            if (userRes.data.success) setUser(userRes.data.data);
        } catch (error) {
            console.error("Failed to load team details", error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        try {
            setRequesting(true);
            await requestJoinTeam(teamId, joinMessage);
            alert("Join request sent!");
            fetchData();
            setShowJoinForm(false);
        } catch (error) {
            alert(error.response?.data?.message || "Failed to send request");
        } finally {
            setRequesting(false);
        }
    };

    const handleWithdraw = async () => {
        if (!window.confirm("Withdraw your request?")) return;
        try {
            setRequesting(true);
            await withdrawJoinRequest(teamId);
            alert("Request withdrawn.");
            fetchData();
        } catch (error) {
            alert("Failed to withdraw request.");
        } finally {
            setRequesting(false);
        }
    };

    if (loading) return <div style={styles.loading}>Loading Team Details...</div>;
    if (!team) return <div style={styles.error}>Team not found.</div>;

    const isMember = team.members.some(m => String(m.userId?._id || m.userId) === String(user?._id) && m.status === 'accepted');
    const isPending = team.members.some(m => String(m.userId?._id || m.userId) === String(user?._id) && m.status === 'pending');
    const isFull = team.members.filter(m => m.status === 'accepted').length >= (team.maxSize || 4);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
                <div style={styles.titleSection}>
                    <h1 style={styles.teamName}>{team.name}</h1>
                    <div style={styles.badgeRow}>
                        {team.isOpenToJoin ? <span style={styles.openBadge}>Open to Join</span> : <span style={styles.closedBadge}>Closed</span>}
                        <span style={styles.memberCount}>{team.members.filter(m => m.status === 'accepted').length} / {team.maxSize || 4} Members</span>
                    </div>
                </div>
            </div>

            <div style={styles.contentGrid}>
                <div style={styles.mainCol}>
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>Project Idea</h2>
                        <p style={styles.description}>{team.projectDescription || "No description provided yet."}</p>
                    </div>

                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>Team Members</h2>
                        <div style={styles.memberList}>
                            {team.members.filter(m => m.status === 'accepted').map(member => (
                                <div key={member.userId?._id} style={styles.memberRow}>
                                    <div style={styles.memberAvatar}>
                                        {member.userId?.fullName?.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={styles.memberInfo}>
                                        <div style={styles.memberName}>{member.userId?.fullName}</div>
                                        <div style={styles.memberRole}>{member.role || "Member"}</div>
                                    </div>
                                    <Link to={`/profile/${member.userId?._id}`} style={styles.viewProfileBtn}>View Profile</Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={styles.sideCol}>
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>Status</h2>
                        {isMember ? (
                            <div style={styles.statusBox}>✅ You are in this team</div>
                        ) : isPending ? (
                            <div style={styles.pendingBox}>
                                <p>⌛ Your request is pending</p>
                                <button onClick={handleWithdraw} disabled={requesting} style={styles.withdrawBtn}>
                                    {requesting ? "Withdrawing..." : "Withdraw Request"}
                                </button>
                            </div>
                        ) : isFull ? (
                            <div style={styles.fullBox}>🚫 Team is full</div>
                        ) : !team.isOpenToJoin ? (
                          <div style={styles.fullBox}>🔒 Not accepting requests</div>
                        ) : showJoinForm ? (
                            <div style={styles.joinForm}>
                                <textarea 
                                    style={styles.textarea}
                                    placeholder="Message to leader (optional)..."
                                    value={joinMessage}
                                    onChange={(e) => setJoinMessage(e.target.value)}
                                />
                                <div style={styles.btnRow}>
                                    <button onClick={() => setShowJoinForm(false)} style={styles.cancelBtn}>Cancel</button>
                                    <button onClick={handleJoin} disabled={requesting} style={styles.confirmJoinBtn}>
                                        {requesting ? "Sending..." : "Send Request"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => setShowJoinForm(true)} style={styles.joinBtn}>Request to Join</button>
                        )}
                    </div>

                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>Team Leader</h2>
                        <div style={styles.leaderRow}>
                            <div style={styles.memberAvatar} className="large">
                                {team.leader?.fullName?.charAt(0).toUpperCase()}
                            </div>
                            <div style={styles.memberInfo}>
                                <div style={styles.memberName}>{team.leader?.fullName}</div>
                                <div style={styles.memberRole}>Leader</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', fontFamily: '"Inter", sans-serif', color: '#1e293b' },
    header: { display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' },
    backBtn: { padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    teamName: { fontSize: '2rem', fontWeight: '800', margin: 0 },
    badgeRow: { display: 'flex', gap: '12px', marginTop: '8px', alignItems: 'center' },
    openBadge: { background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' },
    closedBadge: { background: '#f1f5f9', color: '#64748b', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' },
    memberCount: { fontSize: '0.85rem', color: '#64748b', fontWeight: '600' },
    contentGrid: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' },
    card: { background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' },
    cardTitle: { fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px', color: '#0f172a' },
    description: { fontSize: '1rem', color: '#475569', lineHeight: '1.6' },
    memberList: { display: 'flex', flexDirection: 'column', gap: '16px' },
    memberRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', background: '#f8fafc' },
    memberAvatar: { width: '40px', height: '40px', borderRadius: '50%', background: '#1d4ed8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' },
    memberName: { fontSize: '0.95rem', fontWeight: '700' },
    memberRole: { fontSize: '0.8rem', color: '#64748b' },
    viewProfileBtn: { marginLeft: 'auto', fontSize: '0.85rem', color: '#1d4ed8', fontWeight: '600', textDecoration: 'none' },
    statusBox: { padding: '16px', background: '#dcfce7', color: '#166534', borderRadius: '12px', fontWeight: '700', textAlign: 'center' },
    pendingBox: { padding: '16px', background: '#fef3c7', color: '#92400e', borderRadius: '12px', textAlign: 'center' },
    fullBox: { padding: '16px', background: '#fee2e2', color: '#b91c1c', borderRadius: '12px', fontWeight: '700', textAlign: 'center' },
    joinBtn: { width: '100%', padding: '14px', background: '#111827', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' },
    withdrawBtn: { marginTop: '12px', width: '100%', padding: '10px', background: '#fff', color: '#b91c1c', border: '1px solid #fee2e2', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
    joinForm: { display: 'flex', flexDirection: 'column', gap: '12px' },
    textarea: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '100px', outline: 'none' },
    btnRow: { display: 'flex', gap: '12px' },
    cancelBtn: { flex: 1, padding: '10px', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
    confirmJoinBtn: { flex: 2, padding: '10px', background: '#111827', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
    leaderRow: { display: 'flex', alignItems: 'center', gap: '16px' },
    loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', fontSize: '1.2rem', color: '#64748b' },
    error: { textAlign: 'center', padding: '40px', color: '#ef4444' }
};

export default TeamDetails;
