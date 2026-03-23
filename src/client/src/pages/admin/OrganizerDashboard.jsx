import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { getOrganizerHackathons } from '../../services/api';
import '../../styles/admin.css';

/* ─── Status colour map ─────────────────────────────── */
const STATUS_CFG = {
  open:      { bg: '#dcfce7', text: '#166534', label: 'OPEN',      icon: '🟢' },
  ongoing:   { bg: '#dbeafe', text: '#1e40af', label: 'ONGOING',   icon: '🔵' },
  completed: { bg: '#f3f4f6', text: '#4b5563', label: 'DONE',      icon: '⚫' },
  cancelled: { bg: '#fee2e2', text: '#991b1b', label: 'CANCELLED', icon: '🔴' },
};
const cfg = (s) => STATUS_CFG[s] || STATUS_CFG.completed;

/* ─── Small stat widget ─────────────────────────────── */
const StatBox = ({ label, value, icon, color }) => (
  <div style={{ background: '#fff', borderRadius: '14px', padding: '18px 22px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '14px' }}>
    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>{icon}</div>
    <div>
      <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#111827', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '2px', fontWeight: 600 }}>{label}</div>
    </div>
  </div>
);

/* ─── Per-hackathon card ───────────────────────────── */
const HackCard = ({ h, navigate }) => {
  const s = cfg(h.status);
  const startDate = h.startDate ? new Date(h.startDate).toLocaleDateString() : '—';
  const endDate   = h.endDate   ? new Date(h.endDate).toLocaleDateString()   : '—';

  return (
    <div style={{ background: '#fff', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'box-shadow 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.07)'}
    >
      {/* Title row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', fontWeight: '800', color: '#111827' }}>{h.title}</h3>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{startDate} → {endDate}</span>
        </div>
        <span style={{ background: s.bg, color: s.text, padding: '5px 12px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: '800', whiteSpace: 'nowrap' }}>
          {s.icon} {s.label}
        </span>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', background: '#f8fafc', borderRadius: '10px', padding: '12px 16px' }}>
        {[
          { label: 'Teams',       value: h.teamCount ?? 0,       icon: '👥' },
          { label: 'Submissions', value: h.submissionCount ?? 0, icon: '📝' },
          { label: 'Max Teams',   value: h.maxTeams ?? '∞',      icon: '🏆' },
        ].map(({ label, value, icon }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1f2937' }}>{icon} {value}</div>
            <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '2px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate(`/admin/hackathons/${h._id}`)}
          style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#111827', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem', transition: 'background 0.2s' }}
          onMouseOver={e => e.currentTarget.style.background = '#374151'}
          onMouseOut={e => e.currentTarget.style.background = '#111827'}
        >📋 View Details</button>

        <button
          onClick={() => navigate(`/admin/hackathons/${h._id}/edit`)}
          style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem', transition: 'background 0.2s' }}
          onMouseOver={e => e.currentTarget.style.background = '#f9fafb'}
          onMouseOut={e => e.currentTarget.style.background = '#fff'}
        >✏️ Edit</button>

        <button
          onClick={() => navigate(`/admin/hackathons/${h._id}/dashboard`)}
          style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1.5px solid #3b82f6', background: '#eff6ff', color: '#1d4ed8', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem', transition: 'background 0.2s' }}
          onMouseOver={e => e.currentTarget.style.background = '#dbeafe'}
          onMouseOut={e => e.currentTarget.style.background = '#eff6ff'}
        >📊 Dashboard</button>
      </div>
    </div>
  );
};

/* ─── Main component ────────────────────────────────── */
function OrganizerDashboard() {
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;
    getOrganizerHackathons()
      .then(res => { if (isMounted) setHackathons(res.data?.data || []); })
      .catch(err => { if (isMounted) setError(err?.response?.data?.message || 'Failed to load dashboard'); })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, []);

  /* Aggregate stats */
  const totalHackathons   = hackathons.length;
  const activeHackathons  = hackathons.filter(h => ['ongoing','open'].includes(h.status)).length;
  const totalTeams        = hackathons.reduce((a, h) => a + (h.teamCount || 0), 0);
  const totalSubmissions  = hackathons.reduce((a, h) => a + (h.submissionCount || 0), 0);

  const displayed = statusFilter === 'all'
    ? hackathons
    : hackathons.filter(h => h.status === statusFilter);

  /* ── Loading ── */
  if (loading) return (
    <div className="admin-layout">
      <AdminNavbar />
      <main className="admin-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏳</div>
          <p>Loading your dashboard...</p>
        </div>
      </main>
    </div>
  );

  /* ── Error ── */
  if (error) return (
    <div className="admin-layout">
      <AdminNavbar />
      <main className="admin-main">
        <div className="admin-container" style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⚠️</div>
          <h2 style={{ color: '#ef4444' }}>{error}</h2>
          <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '12px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Retry</button>
        </div>
      </main>
    </div>
  );

  return (
    <div className="admin-layout">
      <AdminNavbar />

      <main className="admin-main">
        <div className="admin-container">

          {/* ─── Hero header ──────────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '30px', background: 'linear-gradient(135deg, #047857 0%, #064e3b 100%)', padding: '30px 35px', borderRadius: '18px', color: 'white' }}>
            <div>
              <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px' }}>Organizer Panel</p>
              <h1 style={{ fontSize: '2.2rem', margin: '0 0 8px 0', fontWeight: '900' }}>My Hackathons</h1>
              <p style={{ margin: 0, opacity: 0.8, fontSize: '1.05rem' }}>View stats, edit events, and manage submissions.</p>
            </div>
            <button
              style={{ background: '#f59e0b', color: 'white', padding: '14px 28px', borderRadius: '12px', border: 'none', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(245,158,11,0.4)', transition: 'transform 0.1s' }}
              onClick={() => navigate('/admin/hackathons/create')}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              + Host a Hackathon
            </button>
          </div>

          {/* ─── Aggregate stats bar ──────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '35px' }}>
            <StatBox label="Total Hackathons" value={totalHackathons} icon="🗂" color="#ede9fe" />
            <StatBox label="Active / Open"    value={activeHackathons} icon="🔥" color="#dcfce7" />
            <StatBox label="Teams Enrolled"   value={totalTeams}       icon="👥" color="#dbeafe" />
            <StatBox label="Submissions"       value={totalSubmissions} icon="📁" color="#fef3c7" />
          </div>

          {/* ─── Filter bar ───────────────────────────── */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
            {['all', 'open', 'ongoing', 'completed', 'cancelled'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: '8px 18px', borderRadius: '99px', border: '1.5px solid',
                  borderColor: statusFilter === s ? '#2563eb' : '#e5e7eb',
                  background: statusFilter === s ? '#2563eb' : '#fff',
                  color: statusFilter === s ? '#fff' : '#4b5563',
                  fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem', textTransform: 'capitalize', transition: 'all 0.15s',
                }}
              >
                {s === 'all' ? 'All' : cfg(s).icon + ' ' + s.charAt(0).toUpperCase() + s.slice(1)}
                {s !== 'all' && <span style={{ marginLeft: '6px', opacity: 0.7 }}>({hackathons.filter(h => h.status === s).length})</span>}
              </button>
            ))}
          </div>

          {/* ─── Hackathon cards ──────────────────────── */}
          {displayed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '16px', border: '2px dashed #e5e7eb', color: '#9ca3af' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🏁</div>
              {totalHackathons === 0
                ? <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>You haven't created any hackathons yet. Click <strong>"+ Host a Hackathon"</strong> to get started!</p>
                : <p>No hackathons match the selected filter.</p>
              }
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '22px' }}>
              {displayed.map(h => <HackCard key={h._id} h={h} navigate={navigate} />)}
            </div>
          )}

        </div>
      </main>

      <footer className="admin-footer">
        <div className="footer-content">
          <div className="footer-left"><span className="footer-brand">HackPlatform</span></div>
          <div className="footer-right">
            <a href="#about" className="footer-link">About</a>
            <a href="#terms" className="footer-link">Terms & Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default OrganizerDashboard;
