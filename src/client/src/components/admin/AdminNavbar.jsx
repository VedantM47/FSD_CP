import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function AdminNavbar() {
  const { pathname } = useLocation();
  const { logout } = useAuth();

  const isActive = (path) => pathname.startsWith(path);

  return (
    <nav className="admin-navbar">
      <div className="navbar-content">
        {/* Left */}
        <div className="navbar-left">
          <span className="navbar-logo">HackPlatform</span>
        </div>

        {/* Center */}
        <div className="navbar-center">
          <span className="navbar-title">Admin Dashboard</span>
        </div>

        {/* Right */}
        <div className="navbar-right">
          <Link
            to="/admin/dashboard"
            className={`nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`}
          >
            Dashboard
          </Link>

          <Link
            to="/admin/hackathons/create"
            className={`nav-link ${isActive('/admin/hackathons/create') ? 'active' : ''}`}
          >
            Create Hackathon
          </Link>

          <button
            onClick={logout}
            className="nav-link logout"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default AdminNavbar;
