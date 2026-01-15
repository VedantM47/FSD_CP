import { Link, useLocation } from 'react-router-dom';

function AdminNavbar() {
  const { pathname } = useLocation();

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
            className={`nav-link ${pathname.includes('/dashboard') ? 'active' : ''}`}
          >
            Dashboard
          </Link>

          <Link
            to="/admin/create-hackathon"
            className={`nav-link ${pathname.includes('/create') ? 'active' : ''}`}
          >
            Create Hackathon
          </Link>

          <Link to="/login" className="nav-link logout">
            Logout
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default AdminNavbar;
