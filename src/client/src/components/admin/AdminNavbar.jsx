import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function AdminNavbar() {
  const { pathname } = useLocation();
  const { logout, user } = useAuth(); // Assuming 'user' contains 'systemRole'

  const isActive = (path) => pathname.startsWith(path);
  
  // Logic to determine role
  const isAdmin = user?.systemRole === 'admin';
  const isMentor = user?.systemRole === 'mentor';
  const isOrganizer = user?.systemRole === 'organizer';

  return (
    <nav className="admin-navbar">
      <div className="navbar-content">
        {/* Left: Logo always leads to Home (Discovery) */}
        <div className="navbar-left">
          <Link to="/" className="navbar-logo" style={{ textDecoration: 'none', color: 'inherit' }}>
            HackPlatform
          </Link>
        </div>

        {/* Center: Dynamic Title */}
        <div className="navbar-center">
          <span className="navbar-title">
            {isAdmin ? 'Admin Panel' : isOrganizer ? 'Organizer Panel' : 'Dashboard'}
          </span>
        </div>

        {/* Right: Conditional Links */}
        <div className="navbar-right">
          {/* Everyone gets a link back to the main Home/Discovery page */}
          <Link to="/" className="nav-link">
            Home
          </Link>

          <Link
            to={isAdmin || isMentor ? "/admin/dashboard" : "/organizer/dashboard"}
            className={`nav-link ${isActive('/admin/dashboard') || isActive('/organizer/dashboard') ? 'active' : ''}`}
          >
            Dashboard
          </Link>

          {/* Only Admin/Mentor can see 'Create' */}
          {(isAdmin || isMentor) && (
            <Link
              to="/admin/hackathons/create"
              className={`nav-link ${isActive('/admin/hackathons/create') ? 'active' : ''}`}
            >
              Create Hackathon
            </Link>
          )}

          <button onClick={logout} className="nav-link logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default AdminNavbar;