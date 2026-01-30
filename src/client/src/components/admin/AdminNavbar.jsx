import { Link, useLocation, useNavigate } from 'react-router-dom';

function AdminNavbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => pathname.startsWith(path);

  const handleLogout = () => {
    // later you can also clear token / user state here
    navigate('/login');
  };

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
            onClick={handleLogout}
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
