import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar"
import Footer from "../../components/common/Footer";
import { searchHackathonMembers, inviteMember } from "../../services/api";


const FindMembers = () => {
  const { id, teamId } = useParams();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [invitingId, setInvitingId] = useState(null);
  const [nameQuery, setNameQuery] = useState("");
  const [tagQuery, setTagQuery] = useState("");

  const fetchMembers = useCallback(async (name = "", tags = "") => {
    try {
      setLoading(true);
      setError("");
      const res = await searchHackathonMembers(id, name, tags);
      setUsers(res.data.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load members.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const formatSkill = (skill) => {
    if (!skill || typeof skill !== 'string') return '';
    const cleaned = skill.trim();
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
  };

  const handleInvite = async (userId) => {
    try {
      setInvitingId(userId);
      await inviteMember(teamId, { userId });
      
      // Remove the invited user from the list
      setUsers(prev => prev.filter(u => u._id !== userId));
      
      // Optional: Show a toast notification here if you have one
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to send invitation.");
    } finally {
      setInvitingId(null);
    }
  };

  const applySearch = async () => {
    const tagsString = tagQuery.split(',').map(t => t.trim()).filter(Boolean).join(',');
    try {
      setLoading(true);
      setError("");
      const res = await searchHackathonMembers(id, nameQuery.trim(), tagsString);
      setUsers(res.data.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load members.");
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setNameQuery("");
    setTagQuery("");
    fetchMembers();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <Navbar />

      <div style={{ flex: 1, padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
          <div>
            <button 
              onClick={() => navigate(`/user/hackathon/${id}/manage-team`)}
              style={{ background: 'none', border: 'none', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '0', fontSize: '1rem', fontWeight: '500', marginBottom: '10px' }}
            >
              &larr; Back to Manage Team
            </button>
            <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.5px' }}>
              Discover Members
            </h1>
            <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '1.05rem' }}>
              Find and invite available participants to join your team.
            </p>

            <div style={{ marginTop: '18px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <input
                type="text"
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
                placeholder="Search by name or email"
                style={{ flexGrow: 1, minWidth: '220px', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', outline: 'none' }}
              />
              <input
                type="text"
                value={tagQuery}
                onChange={(e) => setTagQuery(e.target.value)}
                placeholder="Search by skills (comma-separated tags)"
                style={{ flexGrow: 2, minWidth: '240px', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', outline: 'none' }}
              />
              <button
                onClick={applySearch}
                style={{ padding: '10px 18px', borderRadius: '10px', border: 'none', background: '#4f46e5', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
              >
                Search
              </button>
              <button
                onClick={clearSearch}
                style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: '#64748b' }}>
            <div className="spinner" style={{ margin: '0 auto 15px', width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <h2>Searching for members...</h2>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px', background: '#fee2e2', borderRadius: '16px', color: '#b91c1c' }}>
            <h3>Oops! Something went wrong</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} style={{ marginTop: '15px', padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#b91c1c', color: 'white', cursor: 'pointer' }}>Retry</button>
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '20px', fontWeight: 'bold', color: '#64748b' }}>NO MEMBERS</div>
            <h2 style={{ fontSize: '1.8rem', color: '#1e293b', marginBottom: '10px' }}>No Available Members Found</h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
              It looks like everyone has already found a team or no participants are currently available for this hackathon.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {users.map(user => (
              <div key={user._id} style={{ background: '#fff', borderRadius: '20px', padding: '24px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)', display: 'flex', flexDirection: 'column', border: '1px solid #f1f5f9', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-4px)' } }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                  {user.profilePic ? (
                    <img src={user.profilePic} alt={user.fullName} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {user.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: '700' }}>{user.fullName}</h3>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{user.email || 'No email provided'}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  {user.college && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.4' }}>{user.college}</span>
                    </div>
                  )}
                  
                  {(user.major || user.degree || user.year) && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.4' }}>
                        {[user.degree, user.major, user.year ? `Year: ${user.year}` : ''].filter(Boolean).join(' • ')}
                      </span>
                    </div>
                  )}

                  <div style={{ marginTop: 'auto', paddingTop: '15px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {user.skills && user.skills.length > 0 ? (
                        user.skills.slice(0, 4).map(skill => (
                          <span key={skill} style={{ padding: '4px 10px', background: '#f1f5f9', color: '#475569', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', border: '1px solid #e2e8f0' }}>
                            {formatSkill(skill)}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>No skills listed</span>
                      )}
                      {user.skills && user.skills.length > 4 && (
                        <span style={{ padding: '4px 8px', color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>
                          +{user.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                  <Link 
                    to={`/profile/${user._id}`}
                    target="_blank"
                    style={{ flex: 1, padding: '10px 0', textAlign: 'center', borderRadius: '10px', background: '#f8fafc', color: '#475569', fontWeight: '600', textDecoration: 'none', border: '1px solid #e2e8f0', transition: 'all 0.2s', fontSize: '0.95rem' }}
                  >
                    View Profile
                  </Link>
                  <button 
                    onClick={() => handleInvite(user._id)}
                    disabled={invitingId === user._id}
                    style={{ flex: 1, padding: '10px 0', borderRadius: '10px', background: invitingId === user._id ? '#94a3b8' : '#10b981', color: 'white', fontWeight: '600', border: 'none', cursor: invitingId === user._id ? 'not-allowed' : 'pointer', transition: 'background 0.2s', fontSize: '0.95rem' }}
                  >
                    {invitingId === user._id ? 'Sending...' : 'Send Invite'}
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default FindMembers;
