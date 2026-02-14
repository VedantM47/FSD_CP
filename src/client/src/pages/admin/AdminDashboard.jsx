import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AdminNavbar from '../../components/admin/AdminNavbar';
import StatsCard from '../../components/admin/StatsCard';
import AlertBanner from '../../components/admin/AlertBanner';
import HackathonCard from '../../components/admin/HackathonCard';

import { getAdminDashboard, getAdminHackathons } from '../../services/api';

import '../../styles/admin.css';

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchAdminData = async () => {
      try {
        setLoading(true);
        setError('');

        const [dashboardRes, hackathonsRes] = await Promise.all([
          getAdminDashboard(),
          getAdminHackathons(),
        ]);

        if (!isMounted) return;

        setStats(dashboardRes.data.data);
        setHackathons(hackathonsRes.data.data || []);
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
          {/* CREATE BUTTON */}
          <button
            className="create-hackathon-btn"
            onClick={() => navigate('/admin/hackathons/create')}
          >
            <span className="btn-icon">+</span>
            Create a Hackathon
          </button>

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
