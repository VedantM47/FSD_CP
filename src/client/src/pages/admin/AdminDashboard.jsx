import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AdminNavbar from '../../components/admin/AdminNavbar';
import StatsCard from '../../components/admin/StatsCard';
import AlertBanner from '../../components/admin/AlertBanner';
import HackathonCard from '../../components/admin/HackathonCard';

import { getAdminDashboard, getAdminHackathons, getOrganizerApplications, reviewOrganizerApplication } from '../../services/api';

import '../../styles/admin.css';

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [hackathons, setHackathons] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

    return () => {
      isMounted = false;
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
