import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AdminNavbar from '../../components/admin/AdminNavbar';
import StatsCard from '../../components/admin/StatsCard';
import AlertBanner from '../../components/admin/AlertBanner';
import HackathonCard from '../../components/admin/HackathonCard';
import RoleManagement from '../../components/admin/RoleManagement';

import { 
  getAdminDashboard, 
  getAdminHackathons, 
  getOrganizerApplications, 
  reviewOrganizerApplication,
  sendAdminBroadcast,
  getAdminEmailQueueStatus
} from '../../services/api';

import '../../styles/admin.css';

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [hackathons, setHackathons] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Broadcast state
  const [broadcastTarget, setBroadcastTarget] = useState('all_users');
  const [targetHackathon, setTargetHackathon] = useState('');
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [queueStatus, setQueueStatus] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAdminData = async () => {
      try {
        setLoading(true);
        setError('');

        const [dashboardRes, hackathonsRes, appsRes] = await Promise.all([
          getAdminDashboard(),
          getAdminHackathons(),
          getOrganizerApplications(),
        ]);

        if (!isMounted) return;

        setStats(dashboardRes.data.data);
        setHackathons(hackathonsRes.data.data || []);
        
        // Filter out non-pending applications if preferred, 
        // or just store all and filter in UI. Let's store all.
        setApplications(appsRes.data.data || []);
      } catch (err) {
        console.error('❌ ADMIN DASHBOARD ERROR:', err);

        if (!isMounted) return;

        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Failed to load admin dashboard'
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAdminData();

    // Poll queue status every 4 seconds
    const queuePoll = setInterval(() => {
      getAdminEmailQueueStatus().then(r => setQueueStatus(r.data.data)).catch(() => {});
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(queuePoll);
    };
  }, []);

  const handleReviewApplication = async (id, status) => {
    try {
      await reviewOrganizerApplication(id, status);
      // Remove from list or update status locally
      setApplications(prev => prev.map(app => 
        app._id === id ? { ...app, status } : app
      ));
      alert(`Application ${status} successfully.`);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to review application.');
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastSubject.trim() || !broadcastBody.trim()) {
      return alert("Subject and body are required.");
    }
    if (broadcastTarget === "hackathon_participants" && !targetHackathon) {
      return alert("Please select a hackathon to broadcast to its participants.");
    }

    if (!window.confirm("Are you sure you want to blast this email? It cannot be undone.")) return;

    try {
      setIsBroadcasting(true);
      const res = await sendAdminBroadcast({
        subject: broadcastSubject,
        body: broadcastBody,
        targetGroup: broadcastTarget,
        hackathonId: targetHackathon || undefined
      });
      alert(res.data.message || "Broadcast successfully deployed!");
      setBroadcastSubject('');
      setBroadcastBody('');
    } catch (err) {
      alert(err.response?.data?.message || "Failed to broadcast email.");
    } finally {
      setIsBroadcasting(false);
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="admin-layout">
        <AdminNavbar />
        <main className="admin-main">
          <div className="admin-container">Loading dashboard...</div>
        </main>
      </div>
    );
  }

  /* ================= ERROR ================= */
  if (error) {
    return (
      <div className="admin-layout">
        <AdminNavbar />
        <main className="admin-main">
          <div className="admin-container error-text">{error}</div>
        </main>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="admin-layout">
      <AdminNavbar />

      <main className="admin-main">
        <div className="admin-container">
          {/* PAGE HEADER & CREATE BUTTON */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)', padding: '30px', borderRadius: '12px', color: 'white' }}>
            <div>
              <h1 style={{ fontSize: '2rem', margin: '0 0 10px 0', fontWeight: 'bold' }}>Welcome, Admin</h1>
              <p style={{ margin: 0, opacity: 0.8 }}>Manage hackathons, users, and platform settings.</p>
            </div>
            <button
              style={{ background: '#10b981', color: 'white', padding: '15px 30px', borderRadius: '8px', border: 'none', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
              onClick={() => navigate('/admin/hackathons/create')}
            >
              + Create New Hackathon
            </button>
          </div>

          {/* OVERVIEW */}
          <section className="overview-section">
            <h2 className="section-title">Overview</h2>

            <div className="stats-grid">
              <StatsCard label="Total Hackathons" value={stats?.hackathons ?? 0} />
              <StatsCard
                label="Active Hackathons"
                value={stats?.activeHackathons ?? 0}
              />
              <StatsCard label="Teams" value={stats?.teams ?? 0} />
              <StatsCard label="Submissions" value={stats?.submissions ?? 0} />
              <StatsCard label="Users" value={stats?.users ?? 0} />
            </div>
          </section>

          {/* ALERTS */}
          <section className="alerts-section">
            <h2 className="section-title">Alerts & Notifications</h2>

            <div className="alerts-list">
              <AlertBanner message="Some hackathons are nearing submission deadlines." />
            </div>

            {/* EMAIL QUEUE STATUS */}
            {queueStatus && (
              <div style={{ marginTop: '15px', padding: '14px 20px', borderRadius: '10px', background: queueStatus.smtpConfigured ? '#ecfdf5' : '#fef3c7', border: `1px solid ${queueStatus.smtpConfigured ? '#6ee7b7' : '#fcd34d'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600', color: queueStatus.smtpConfigured ? '#065f46' : '#92400e' }}>
                  <span style={{ fontSize: '1.3rem' }}>{queueStatus.smtpConfigured ? '📡' : '⚠️'}</span>
                  <span>Email {queueStatus.smtpConfigured ? 'SMTP Ready' : 'SMTP Not Configured — Add EMAIL_USER & EMAIL_PASS to .env'}</span>
                </div>
                <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', color: '#4b5563' }}>
                  <span>Queued: <strong>{queueStatus.queued}</strong></span>
                  <span>Processing: <strong>{queueStatus.isProcessing ? 'Yes' : 'No'}</strong></span>
                </div>
              </div>
            )}
          </section>

          {/* BROADCAST SECTION */}
          <section className="applications-section" style={{ marginTop: '40px' }}>
            <h2 className="section-title">📧 Communication & Broadcasts</h2>
            <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <form onSubmit={handleBroadcast}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>Target Audience</label>
                    <select
                      value={broadcastTarget}
                      onChange={(e) => setBroadcastTarget(e.target.value)}
                      style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', background: '#f9fafb' }}
                    >
                      <option value="all_users">All Registered Users</option>
                      <option value="hackathon_participants">Participants of a Specific Hackathon</option>
                    </select>
                  </div>
                  {broadcastTarget === 'hackathon_participants' && (
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>Select Hackathon</label>
                      <select
                        value={targetHackathon}
                        onChange={(e) => setTargetHackathon(e.target.value)}
                        style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', background: '#f9fafb' }}
                      >
                        <option value="">-- Choose Hackathon --</option>
                        {hackathons.map((h) => (
                          <option key={h._id} value={h._id}>{h.title} ({h.status})</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>Email Subject</label>
                  <input
                    type="text"
                    value={broadcastSubject}
                    onChange={(e) => setBroadcastSubject(e.target.value)}
                    placeholder="Enter an engaging subject line..."
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>Email Body (HTML supported)</label>
                  <textarea
                    rows="6"
                    value={broadcastBody}
                    onChange={(e) => setBroadcastBody(e.target.value)}
                    placeholder="Type your email content here. You can use HTML tags like <b>bold</b> or <br>."
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', resize: 'vertical', fontFamily: 'monospace' }}
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isBroadcasting}
                  style={{ background: isBroadcasting ? '#9ca3af' : '#2563eb', color: 'white', padding: '12px 24px', borderRadius: '6px', border: 'none', fontSize: '1rem', fontWeight: 'bold', cursor: isBroadcasting ? 'not-allowed' : 'pointer', width: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'background 0.2s' }}>
                  {isBroadcasting ? 'Sending...' : '🚀 Send Broadcast'}
                </button>
              </form>
            </div>
          </section>

          {/* HACKATHONS */}
          <section className="hackathons-section">
            <h2 className="section-title">My Hackathons</h2>

            {hackathons.length === 0 ? (
              <p>No hackathons created yet.</p>
            ) : (
              <div className="hackathons-list">
                {hackathons.map((hackathon) => (
                  <HackathonCard
                    key={hackathon._id}
                    hackathon={hackathon}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ORGANIZER APPLICATIONS */}
          <section className="applications-section" style={{ marginTop: '40px' }}>
            <h2 className="section-title">Organizer Applications</h2>

            {applications.filter(app => app.status === 'pending').length === 0 ? (
              <p>No pending applications.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {applications.filter(app => app.status === 'pending').map((app) => (
                  <div key={app._id} style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 5px 0' }}>{app.userId?.fullName} ({app.userId?.email})</h3>
                      <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#666' }}>
                        {app.userId?.college} • {app.userId?.department}
                      </p>
                      <p style={{ margin: 0, padding: '10px', background: '#f8fafc', borderRadius: '4px', fontStyle: 'italic' }}>
                        "{app.motivation}"
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginLeft: '20px' }}>
                      <button 
                        onClick={() => handleReviewApplication(app._id, 'approved')}
                        style={{ background: '#10B981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Approve
                      </button>
                      <button 
                        onClick={() => handleReviewApplication(app._id, 'rejected')}
                        style={{ background: '#EF4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ROLE MANAGEMENT */}
          <RoleManagement />

        </div>
      </main>

      {/* FOOTER */}
      <footer className="admin-footer">
        <div className="footer-content">
          <div className="footer-left">
            <span className="footer-brand">HackPlatform</span>
          </div>
          <div className="footer-right">
            <a href="#about" className="footer-link">About</a>
            <a href="#faqs" className="footer-link">FAQs</a>
            <a href="#contact" className="footer-link">Contact</a>
            <a href="#terms" className="footer-link">Terms & Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AdminDashboard;
