import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { respondToInvite } from "../../../services/api";

const InvitationsTab = ({ invitations = [], onUpdate }) => {
  const navigate = useNavigate();
  const [responding, setResponding] = useState(null);

  const handleRespond = async (teamId, hackathonId, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this invitation?`)) return;
    try {
      setResponding(teamId);
      await respondToInvite(teamId, { action });
      onUpdate(); // refresh profile data
      if (action === 'accept' && hackathonId) {
        navigate(`/user/hackathon/${hackathonId}/dashboard`);
      }
    } catch (err) {
      alert(err?.response?.data?.message || `Failed to ${action} invitation.`);
    } finally {
      setResponding(null);
    }
  };

  if (invitations.length === 0) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', background: '#fff', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>📭</div>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b', fontWeight: '700' }}>No Pending Invitations</h2>
        <p style={{ color: '#64748b', marginTop: '8px', fontSize: '1rem' }}>When a team leader invites you to join their team, it will appear here.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ margin: '0 0 8px', fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
        Pending Invitations
        <span style={{ marginLeft: '10px', background: '#f59e0b', color: 'white', fontSize: '0.8rem', fontWeight: '700', padding: '2px 10px', borderRadius: '999px', verticalAlign: 'middle' }}>
          {invitations.length}
        </span>
      </h2>

      {invitations.map(inv => (
        <div key={inv.teamId} style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #fde68a', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
              📨
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#0f172a' }}>{inv.teamName}</h3>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                🏆 <strong>{inv.hackathonName}</strong> · Led by <strong>{inv.leaderName}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => handleRespond(inv.teamId, inv.hackathonId, 'accept')}
              disabled={responding === inv.teamId}
              style={{ padding: '10px 22px', borderRadius: '10px', background: responding === inv.teamId ? '#9ca3af' : '#10b981', color: 'white', border: 'none', fontWeight: '700', cursor: responding === inv.teamId ? 'not-allowed' : 'pointer', fontSize: '0.95rem', transition: 'background 0.2s' }}
            >
              {responding === inv.teamId ? 'Processing...' : '✓ Accept'}
            </button>
            <button
              onClick={() => handleRespond(inv.teamId, inv.hackathonId, 'decline')}
              disabled={responding === inv.teamId}
              style={{ padding: '10px 22px', borderRadius: '10px', background: '#fff', color: '#ef4444', border: '1.5px solid #fca5a5', fontWeight: '700', cursor: responding === inv.teamId ? 'not-allowed' : 'pointer', fontSize: '0.95rem', transition: 'all 0.2s' }}
            >
              ✕ Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InvitationsTab;
