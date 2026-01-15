import AdminNavbar from '../../components/admin/AdminNavbar';
import StatsCard from '../../components/admin/StatsCard';
import AlertBanner from '../../components/admin/AlertBanner';
import HackathonCard from '../../components/admin/HackathonCard';
import { useNavigate } from 'react-router-dom';
import mockHackathon from '../../data/mockHackathon';
import '../../styles/admin.css';

function AdminDashboard() {
  const navigate = useNavigate();

  const hackathons = [mockHackathon];

  return (
    <div className="admin-layout">
      <AdminNavbar />
      
      <main className="admin-main">
        <div className="admin-container">
          <button 
            className="create-hackathon-btn"
            onClick={() => navigate('/admin/hackathons/create')}
          >
            <span className="btn-icon">+</span>
            Create a Hackathon
          </button>

          <section className="overview-section">
            <h2 className="section-title">Overview</h2>
            <div className="stats-grid">
              <StatsCard label="Total Hackathons" value="4" />
              <StatsCard label="Active Hackathons" value="2" />
              <StatsCard label="Upcoming Hackathons" value="1" />
              <StatsCard label="Closed Hackathons" value="1" />
            </div>
          </section>

          <section className="alerts-section">
            <h2 className="section-title">Alerts & Notifications</h2>
            <div className="alerts-list">
              <AlertBanner message="AI Innovation Challenge 2026 registration closes in 2 days" />
              <AlertBanner message="Round 1 submissions pending from 12 teams in Mobile App Marathon" />
            </div>
          </section>

          <section className="hackathons-section">
            <h2 className="section-title">My Hackathons</h2>
            <div className="hackathons-list">
              {hackathons.map((hackathon) => (
                <HackathonCard
                  key={hackathon.id}
                  hackathon={hackathon}
                />
              ))}
            </div>
          </section>

        </div>
      </main>

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