import React, { useState, useEffect, useMemo } from 'react';
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

  /* ── Filter / sort state ── */
  const [search, setSearch]             = useState('');
  const [filterSystemRole, setFilterSystemRole] = useState('all');
  const [filterHackRole, setFilterHackRole]     = useState('all');
  const [filterHackathon, setFilterHackathon]   = useState('all'); // hackathon _id or 'all'
  const [sortBy, setSortBy]             = useState('name_asc');

  useEffect(() => {
    Promise.all([getAdminUsers(), getAdminHackathons()])
      .then(([uRes, hRes]) => {
        setUsers(uRes.data.data || []);
        setHackathons(hRes.data.data || []);
      })
      .catch(() => showToast('Failed to load data', 'error'))
      .finally(() => setLoading(false));
  }, []);

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
      await updateAdminUserRole(payload);

      setUsers(prev => prev.map(u => {
        if (u._id !== uid) return u;
        const up = { ...u };
        if (edit.systemRole) up.systemRole = edit.systemRole;
        if (edit.hackathonId && edit.hackathonRole) {
          up.hackathonRoles = [
            ...(up.hackathonRoles || []).filter(r => r.hackathonId !== edit.hackathonId),
            { hackathonId: edit.hackathonId, role: edit.hackathonRole },
          ];
        }
        return up;
      }));
      setEdits(prev => { const n = { ...prev }; delete n[uid]; return n; });
      showToast('Role updated!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed.', 'error');
    } finally {
      setSaving(null);
    }
  };

  /* ── Derived, filtered & sorted list ── */
  const displayed = useMemo(() => {
    let list = [...users];

    // Text search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    }

    // Filter: platform system role
    if (filterSystemRole !== 'all') {
      list = list.filter(u => (u.systemRole || 'user') === filterSystemRole);
    }

    // Filter: hackathon role (any)
    if (filterHackRole !== 'all') {
      list = list.filter(u => (u.hackathonRoles || []).some(r => r.role === filterHackRole));
    }

    // Filter: specific hackathon linked
    if (filterHackathon !== 'all') {
      list = list.filter(u =>
        (u.hackathonRoles || []).some(r =>
          (r.hackathonId?._id || r.hackathonId) === filterHackathon
        )
      );
    }

    // Sort
    if (sortBy === 'name_asc')  list.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
    if (sortBy === 'name_desc') list.sort((a, b) => (b.fullName || '').localeCompare(a.fullName || ''));
    if (sortBy === 'role_asc')  list.sort((a, b) => (a.systemRole || '').localeCompare(b.systemRole || ''));
    if (sortBy === 'email_asc') list.sort((a, b) => (a.email || '').localeCompare(b.email || ''));

    return list;
  }, [users, search, filterSystemRole, filterHackRole, filterHackathon, sortBy]);

  const summaryText = `Showing ${displayed.length} of ${users.length} users`;

  return (
    <section style={{ marginTop: '40px', position: 'relative' }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999, background: toast.type === 'error' ? '#ef4444' : '#10b981', color: 'white', padding: '14px 24px', borderRadius: '12px', fontWeight: 'bold', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', fontSize: '0.95rem' }}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🎭 Role Management
        </h2>
        <span style={{ fontSize: '0.85rem', color: '#6b7280', background: '#f3f4f6', padding: '5px 12px', borderRadius: '99px' }}>{summaryText}</span>
      </div>

      {/* ── Filter toolbar ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', background: '#fff', padding: '16px 20px', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '10px', opacity: 0.4 }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name or email..."
            style={{ ...SELECT_STYLE, width: '100%', paddingLeft: '34px' }}
          />
        </div>

        {/* Platform role filter */}
        <select value={filterSystemRole} onChange={e => setFilterSystemRole(e.target.value)} style={{ ...SELECT_STYLE, flex: '0 0 auto' }}>
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="mentor">Mentor / Organizer</option>
          <option value="admin">Admin</option>
        </select>

        {/* Hackathon role filter */}
        <select value={filterHackRole} onChange={e => setFilterHackRole(e.target.value)} style={{ ...SELECT_STYLE, flex: '0 0 auto' }}>
          <option value="all">Any Hackathon Role</option>
          <option value="judge">Judge</option>
          <option value="organizer">Organizer</option>
          <option value="participant">Participant</option>
        </select>

        {/* Specific hackathon filter */}
        <select value={filterHackathon} onChange={e => setFilterHackathon(e.target.value)} style={{ ...SELECT_STYLE, flex: '0 0 auto', maxWidth: '210px' }}>
          <option value="all">Any Hackathon</option>
          {hackathons.map(h => (
            <option key={h._id} value={h._id}>{h.title}</option>
          ))}
        </select>

        {/* Sort */}
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...SELECT_STYLE, flex: '0 0 auto' }}>
          <option value="name_asc">Sort: Name A→Z</option>
          <option value="name_desc">Sort: Name Z→A</option>
          <option value="email_asc">Sort: Email A→Z</option>
          <option value="role_asc">Sort: Role A→Z</option>
        </select>

        {/* Reset filters */}
        {(search || filterSystemRole !== 'all' || filterHackRole !== 'all' || filterHackathon !== 'all' || sortBy !== 'name_asc') && (
          <button
            onClick={() => { setSearch(''); setFilterSystemRole('all'); setFilterHackRole('all'); setFilterHackathon('all'); setSortBy('name_asc'); }}
            style={{ padding: '9px 16px', borderRadius: '8px', border: '1.5px solid #fca5a5', background: '#fee2e2', color: '#b91c1c', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem', flex: '0 0 auto' }}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af', fontWeight: 'bold' }}>Loading users...</div>
      ) : (
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
              {displayed.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '50px', color: '#9ca3af' }}>No users match current filters.</td></tr>
              )}
              {displayed.map((user, idx) => {
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
      )}
    </section>
  );
}
