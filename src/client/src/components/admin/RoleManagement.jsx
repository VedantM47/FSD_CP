import React, { useState, useEffect } from 'react';
import { getAdminUsers, updateAdminUserRole, getAdminHackathons } from '../../services/api';

/* ────────────────────────────────────────────────
   Role colour mapping
   ──────────────────────────────────────────────── */
const ROLE_COLOR = {
  admin:     { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  mentor:    { bg: '#ede9fe', text: '#5b21b6', border: '#c4b5fd' },
  user:      { bg: '#f3f4f6', text: '#4b5563', border: '#e5e7eb' },
  judge:     { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  organizer: { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
  participant:{ bg: '#fce7f3', text: '#9d174d', border: '#fbcfe8' },
};

const Pill = ({ label }) => {
  const c = ROLE_COLOR[label] || ROLE_COLOR.user;
  return (
    <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, padding: '3px 10px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );
};

const SELECT_STYLE = {
  padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb',
  fontSize: '0.88rem', outline: 'none', background: '#f9fafb', cursor: 'pointer',
  color: '#374151',
};

/* ────────────────────────────────────────────────
   Main Component
   ──────────────────────────────────────────────── */
export default function RoleManagement() {
  const [users, setUsers]         = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(null);
  const [toast, setToast]         = useState(null);
  const [edits, setEdits]         = useState({});

  /* ── Pagination & Search state ── */
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [totalUsers, setTotalUsers]   = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  const USERS_PER_PAGE = 10;

  /* ── Fetch users with pagination ── */
  const fetchUsers = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const [uRes, hRes] = await Promise.all([
        getAdminUsers(page, USERS_PER_PAGE, search),
        hackathons.length > 0 ? Promise.resolve({ data: { data: hackathons } }) : getAdminHackathons()
      ]);

      setUsers(uRes.data.data || []);
      setTotalPages(uRes.data.pagination?.totalPages || 1);
      setTotalUsers(uRes.data.pagination?.total || 0);
      setCurrentPage(uRes.data.pagination?.page || 1);
      setHasNextPage(uRes.data.pagination?.hasNextPage || false);
      setHasPrevPage(uRes.data.pagination?.hasPrevPage || false);
      
      if (hackathons.length === 0) {
        setHackathons(hRes.data.data || []);
      }
    } catch (err) {
      showToast('Failed to load data', 'error');
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, '');
  }, []);

  /* ── Handle search ── */
  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
    fetchUsers(1, searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(1);
    fetchUsers(1, '');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  /* ── Pagination handlers ── */
  const handleNextPage = () => {
    if (hasNextPage) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchUsers(nextPage, searchQuery);
    }
  };

  const handlePrevPage = () => {
    if (hasPrevPage) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      fetchUsers(prevPage, searchQuery);
    }
  };

  const handleGoToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchUsers(page, searchQuery);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const getEdit = (uid) => edits[uid] || {};
  const setEdit = (uid, field, value) =>
    setEdits(prev => ({ ...prev, [uid]: { ...prev[uid], [field]: value } }));

  const handleSave = async (uid) => {
    const edit = getEdit(uid);
    if (!edit.systemRole && !edit.hackathonRole) {
      showToast('Select at least one role to save.', 'error');
      return;
    }
    setSaving(uid);
    try {
      const payload = { userId: uid };
      if (edit.systemRole)    payload.systemRole    = edit.systemRole;
      if (edit.hackathonId)   payload.hackathonId   = edit.hackathonId;
      if (edit.hackathonRole) payload.hackathonRole  = edit.hackathonRole;
      
      const response = await updateAdminUserRole(payload);

      // Update local state with response data
      if (response.data.success && response.data.data) {
        setUsers(prev => prev.map(u => {
          if (u._id !== uid) return u;
          return {
            ...u,
            systemRole: response.data.data.systemRole,
            hackathonRoles: response.data.data.hackathonRoles
          };
        }));
      }

      setEdits(prev => { const n = { ...prev }; delete n[uid]; return n; });
      showToast('Role updated successfully!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed.', 'error');
      console.error('Role update error:', err);
    } finally {
      setSaving(null);
    }
  };

  const summaryText = searchQuery 
    ? `Found ${totalUsers} user${totalUsers !== 1 ? 's' : ''} matching "${searchQuery}"`
    : `Showing ${users.length} of ${totalUsers} users`;

  return (
    <section style={{ marginTop: '40px', position: 'relative' }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999, background: toast.type === 'error' ? '#ef4444' : '#10b981', color: 'white', padding: '14px 24px', borderRadius: '12px', fontWeight: 'bold', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', fontSize: '0.95rem' }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Role Management
        </h2>
        <span style={{ fontSize: '0.85rem', color: '#6b7280', background: '#f3f4f6', padding: '5px 12px', borderRadius: '99px' }}>{summaryText}</span>
      </div>

      {/* Search Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', background: '#fff', padding: '16px 20px', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ position: 'relative', flex: '1' }}>
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search by name or email..."
            style={{ ...SELECT_STYLE, width: '100%', paddingLeft: '12px' }}
          />
        </div>
        <button
          onClick={handleSearch}
          style={{ padding: '9px 24px', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '0.88rem', whiteSpace: 'nowrap', transition: 'background 0.15s' }}
          onMouseOver={e => e.currentTarget.style.background = '#1d4ed8'}
          onMouseOut={e => e.currentTarget.style.background = '#2563eb'}
        >
          Search
        </button>
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            style={{ padding: '9px 16px', borderRadius: '8px', border: '1.5px solid #fca5a5', background: '#fee2e2', color: '#b91c1c', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af', fontWeight: 'bold' }}>Loading users...</div>
      ) : (
        <>
          <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', minWidth: '860px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                  {['User', 'Current Roles', 'Platform Role', 'Hackathon', 'Hackathon Role', 'Save'].map((h, i) => (
                    <th key={i} style={{ padding: '13px 16px', textAlign: 'left', fontWeight: '700', color: '#6b7280', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '50px', color: '#9ca3af' }}>
                    {searchQuery ? `No users found matching "${searchQuery}"` : 'No users found.'}
                  </td></tr>
                )}
                {users.map((user, idx) => {
                  const edit = getEdit(user._id);
                  return (
                    <tr key={user._id}
                      style={{ borderBottom: '1px solid #f3f4f6', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                      onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#fafafa'}
                    >
                      {/* User */}
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                            {user.fullName?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: '#1f2937' }}>{user.fullName}</div>
                            <div style={{ color: '#9ca3af', fontSize: '0.78rem' }}>{user.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Current roles */}
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                          <Pill label={user.systemRole || 'user'} />
                          {(user.hackathonRoles || []).slice(0, 3).map((r, i) => <Pill key={i} label={r.role} />)}
                          {(user.hackathonRoles || []).length > 3 && (
                            <span style={{ fontSize: '0.72rem', color: '#9ca3af', alignSelf: 'center' }}>+{user.hackathonRoles.length - 3} more</span>
                          )}
                        </div>
                      </td>

                      {/* Platform role */}
                      <td style={{ padding: '13px 16px' }}>
                        <select value={edit.systemRole || user.systemRole || 'user'} onChange={e => setEdit(user._id, 'systemRole', e.target.value)} style={{ ...SELECT_STYLE, minWidth: '140px' }}>
                          <option value="user">User</option>
                          <option value="mentor">Mentor / Organizer</option>
                          <option value="judge">Judge</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      {/* Hackathon */}
                      <td style={{ padding: '13px 16px' }}>
                        <select value={edit.hackathonId || ''} onChange={e => setEdit(user._id, 'hackathonId', e.target.value)} style={{ ...SELECT_STYLE, maxWidth: '180px' }}>
                          <option value="">-- Hackathon --</option>
                          {hackathons.map(h => <option key={h._id} value={h._id}>{h.title}</option>)}
                        </select>
                      </td>

                      {/* Hackathon role */}
                      <td style={{ padding: '13px 16px' }}>
                        <select value={edit.hackathonRole || ''} onChange={e => setEdit(user._id, 'hackathonRole', e.target.value)} disabled={!edit.hackathonId} style={{ ...SELECT_STYLE, minWidth: '130px', opacity: edit.hackathonId ? 1 : 0.5 }}>
                          <option value="">-- Role --</option>
                          <option value="judge">Judge</option>
                          <option value="organizer">Organizer</option>
                          <option value="participant">Participant</option>
                        </select>
                      </td>

                      {/* Save */}
                      <td style={{ padding: '13px 16px' }}>
                        <button
                          onClick={() => handleSave(user._id)}
                          disabled={saving === user._id}
                          style={{ padding: '9px 18px', background: saving === user._id ? '#9ca3af' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: saving === user._id ? 'not-allowed' : 'pointer', fontSize: '0.83rem', whiteSpace: 'nowrap', transition: 'background 0.15s' }}
                          onMouseOver={e => { if (saving !== user._id) e.currentTarget.style.background = '#1d4ed8'; }}
                          onMouseOut={e => { if (saving !== user._id) e.currentTarget.style.background = '#2563eb'; }}
                        >
                          {saving === user._id ? '...' : 'Save'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '16px 20px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '0.88rem', color: '#6b7280' }}>
                Page {currentPage} of {totalPages}
              </div>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={handlePrevPage}
                  disabled={!hasPrevPage}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: hasPrevPage ? '#fff' : '#f9fafb', color: hasPrevPage ? '#374151' : '#9ca3af', fontWeight: '600', cursor: hasPrevPage ? 'pointer' : 'not-allowed', fontSize: '0.85rem', transition: 'all 0.15s' }}
                  onMouseOver={e => { if (hasPrevPage) e.currentTarget.style.background = '#f3f4f6'; }}
                  onMouseOut={e => { if (hasPrevPage) e.currentTarget.style.background = '#fff'; }}
                >
                  ← Previous
                </button>

                {/* Page numbers */}
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleGoToPage(pageNum)}
                        style={{ 
                          padding: '8px 12px', 
                          borderRadius: '8px', 
                          border: pageNum === currentPage ? 'none' : '1.5px solid #e5e7eb', 
                          background: pageNum === currentPage ? '#2563eb' : '#fff', 
                          color: pageNum === currentPage ? '#fff' : '#374151', 
                          fontWeight: '600', 
                          cursor: 'pointer', 
                          fontSize: '0.85rem',
                          minWidth: '36px',
                          transition: 'all 0.15s'
                        }}
                        onMouseOver={e => { if (pageNum !== currentPage) e.currentTarget.style.background = '#f3f4f6'; }}
                        onMouseOut={e => { if (pageNum !== currentPage) e.currentTarget.style.background = '#fff'; }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={!hasNextPage}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: hasNextPage ? '#fff' : '#f9fafb', color: hasNextPage ? '#374151' : '#9ca3af', fontWeight: '600', cursor: hasNextPage ? 'pointer' : 'not-allowed', fontSize: '0.85rem', transition: 'all 0.15s' }}
                  onMouseOver={e => { if (hasNextPage) e.currentTarget.style.background = '#f3f4f6'; }}
                  onMouseOut={e => { if (hasNextPage) e.currentTarget.style.background = '#fff'; }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
