import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar'; // CHANGED: Using universal Navbar
import API, { getAuthHeaders } from "../../services/api";
import { getOrganizerHackathons } from '../../services/api';
import '../../styles/admin.css';

/* ─── Status colour map ─────────────────────────────── */
const STATUS_CFG = {
  draft:     { bg: '#fef3c7', text: '#92400e', label: 'DRAFT' },
  open:      { bg: '#dcfce7', text: '#166534', label: 'OPEN' },
  ongoing:   { bg: '#dbeafe', text: '#1e40af', label: 'ONGOING' },
  completed: { bg: '#f3f4f6', text: '#4b5563', label: 'DONE' },
  cancelled: { bg: '#fee2e2', text: '#991b1b', label: 'CANCELLED' },
};
const cfg = (s) => STATUS_CFG[s] || STATUS_CFG.completed;

/* ─── Small stat widget ─────────────────────────────── */
const StatBox = ({ label, value, color }) => (
  <div style={{ background: '#fff', borderRadius: '14px', padding: '18px 22px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '14px' }}>
    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#374151' }}>
      #
    </div>
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
  
  const canEdit = h.status === 'draft' || h.status === 'open';

  return (
    <div style={{ background: '#fff', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'box-shadow 0.2s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', fontWeight: '800', color: '#111827' }}>{h.title}</h3>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{startDate} → {endDate}</span>
        </div>
        <span style={{ background: s.bg, color: s.text, padding: '5px 12px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: '800', whiteSpace: 'nowrap' }}>
          {s.label}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', background: '#f8fafc', borderRadius: '10px', padding: '12px 16px' }}>
        {[
          { label: 'Teams',       value: h.teamsCount ?? h.teamCount ?? 0 },
          { label: 'Submissions', value: h.submissionsCount ?? h.submissionCount ?? 0 },
          { label: 'Max Teams',   value: h.maxTeams ?? '∞' },
        ].map(({ label, value }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1f2937' }}>{value}</div>
            <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '2px' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate(`/admin/hackathons/${h._id}/dashboard`)}
          style={{ flex: 1.5, padding: '10px', borderRadius: '10px', border: 'none', background: '#111827', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
        >Manage Event</button>

        <button
          onClick={() => navigate(`/admin/hackathons/${h._id}/edit`)}
          disabled={!canEdit}
          style={{ 
            flex: 1, 
            padding: '10px', 
            borderRadius: '10px', 
            border: '1.5px solid #e5e7eb', 
            background: canEdit ? '#fff' : '#f3f4f6', 
            color: canEdit ? '#374151' : '#9ca3af', 
            fontWeight: 'bold', 
            cursor: canEdit ? 'pointer' : 'not-allowed', 
            fontSize: '0.85rem'
          }}
        >Edit</button>
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

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await getOrganizerHackathons();
        const list = res.data?.data || [];
        if (isMounted) setHackathons(list);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        if (isMounted) setError(err?.response?.data?.message || 'Failed to load dashboard');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => { isMounted = false; };
  }, []);

  /* Aggregate stats */
  const totalHackathons   = hackathons.length;
  const activeHackathons  = hackathons.filter(h => ['ongoing','open'].includes(h.status)).length;
  const totalTeams        = hackathons.reduce((a, h) => a + (h.teamsCount || h.teamCount || 0), 0);
  const totalSubmissions  = hackathons.reduce((a, h) => a + (h.submissionsCount || h.submissionCount || 0), 0);

  const displayed = statusFilter === 'all'
    ? hackathons
    : hackathons.filter(h => h.status === statusFilter);

  if (loading) return (
    <div className="admin-layout">
      {/* FIXED: navigationMode set to organizer to hide Admin links */}
      <Navbar navigationMode="organizer" title="Organizer Portal" />
      <main className="admin-main" style={{ display: 'flex', alignItems: 'center', justifyContent: "center", minHeight: '80vh' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Loading your dashboard...</p>
      </main>
    </div>
  );

  return (
    <div className="admin-layout">
      {/* FIXED: navigationMode set to organizer */}
      <Navbar navigationMode="organizer" title="Organizer Portal" />
      <main className="admin-main">
        <div className="admin-container" style={{ paddingTop: '20px' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '30px', background: 'linear-gradient(135deg, #047857 0%, #064e3b 100%)', padding: '30px 35px', borderRadius: '18px', color: 'white' }}>
            <div>
              <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px' }}>Management Area</p>
              <h1 style={{ fontSize: '2.2rem', margin: '0 0 8px 0', fontWeight: '900' }}>Organizer Dashboard</h1>
              <p style={{ margin: 0, opacity: 0.8, fontSize: '1.05rem' }}>Monitor stats and manage events assigned to your account.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '35px' }}>
            <StatBox label="Assigned Events" value={totalHackathons} color="#ede9fe" />
            <StatBox label="Live / Open"      value={activeHackathons} color="#dcfce7" />
            <StatBox label="Total Teams"      value={totalTeams}       color="#dbeafe" />
            <StatBox label="Total Submissions" value={totalSubmissions} color="#fef3c7" />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
            {['all', 'draft', 'open', 'ongoing', 'completed', 'cancelled'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: '8px 18px', borderRadius: '99px', border: '1.5px solid',
                  borderColor: statusFilter === s ? '#111827' : '#e5e7eb',
                  background: statusFilter === s ? '#111827' : '#fff',
                  color: statusFilter === s ? '#fff' : '#4b5563',
                  fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem', textTransform: 'capitalize'
                }}
              >
                {s} {s !== 'all' && `(${hackathons.filter(h => h.status === s).length})`}
              </button>
            ))}
          </div>

          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

          {displayed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '16px', border: '2px dashed #e5e7eb', color: '#9ca3af' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>No hackathons found for this filter.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '22px' }}>
              {displayed.map(h => <HackCard key={h._id} h={h} navigate={navigate} />)}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default OrganizerDashboard;