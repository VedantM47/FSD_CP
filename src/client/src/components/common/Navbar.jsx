import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  Telescope, 
  Calendar as CalendarIcon, 
  Settings, 
  LogOut, 
  LogIn, 
  UserPlus,
  Shield,
  LayoutDashboard,
  PlusCircle
} from "lucide-react";
import "../../styles/navbar.css";

const Navbar = ({ navigationMode = "user", showBadge = "", title = "" }) => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  // Get user initial for avatar
  const initial =
    user?.fullName?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "?";

  const isActive = (path) => location.pathname.startsWith(path);

  // Render content based on navigation mode
  const renderContent = () => {
    if (navigationMode === "judge") {
      return (
        <nav className="judge-navbar">
          <div className="navbar-content">
            <div className="navbar-left">
              <h1 className="navbar-logo">HackHub</h1>
              {showBadge && <span className="navbar-badge">{showBadge}</span>}
            </div>
            <div className="navbar-right">
              <button onClick={logout} className="nav-link logout" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </nav>
      );
    }

    if (navigationMode === "admin") {
      return (
        <nav className="admin-navbar">
          <div className="navbar-content">
            <div className="navbar-left">
              <Link
                to="/"
                className="navbar-logo"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                HackHub
              </Link>
            </div>

            {title && (
              <div className="navbar-center">
                <span className="navbar-title">{title}</span>
              </div>
            )}

            <div className="navbar-right">
              <Link
                to="/admin/dashboard"
                className={`nav-link ${isActive("/admin/dashboard") ? "active" : ""}`}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <LayoutDashboard size={16} /> Dashboard
              </Link>

              <Link
                to="/admin/hackathons/create"
                className={`nav-link ${isActive("/admin/hackathons/create") ? "active" : ""}`}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <PlusCircle size={16} /> Create Hackathon
              </Link>

              <button onClick={logout} className="nav-link logout" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </nav>
      );
    }

    // Default user mode
    return (
      <div className="navbar-user">
        <div className="navbar-content-user">
          <div className="navbar-left-user">
            <Link to="/" className="navbar-logo-user">
              HackHub
            </Link>

            <nav className="navbar-nav-user">
              <Link
                to="/discovery"
                className={`nav-item-user ${location.pathname === "/discovery" ? "active" : ""}`}
                title="Browse Hackathons"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Telescope size={16} /> Discovery
              </Link>
              <Link
                to="/calendar"
                className={`nav-item-user ${location.pathname === "/calendar" ? "active" : ""}`}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <CalendarIcon size={16} /> Calendar
              </Link>
              {(user?.systemRole === "mentor" ||
                user?.systemRole === "admin") && (
                <Link
                  to="/organizer/dashboard"
                  className={`nav-item-user ${location.pathname.startsWith("/organizer") ? "active" : ""}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Settings size={16} /> My Hackathons
                </Link>
              )}
              {user?.systemRole === "admin" && (
                <Link
                  to="/admin/dashboard"
                  className={`nav-item-user ${location.pathname.startsWith("/admin") ? "active" : ""}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Shield size={16} /> Admin
                </Link>
              )}
            </nav>
          </div>

          <div className="navbar-right-user">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="navbar-profile-link">
                  <div className="navbar-avatar">{initial}</div>
                </Link>
                <button onClick={logout} className="navbar-logout-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <div className="navbar-auth-links">
                <Link to="/login" className="navbar-login-link" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <LogIn size={16} /> Login
                </Link>
                <Link to="/signup" className="navbar-signup-link" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserPlus size={16} /> Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return renderContent();
};

export default Navbar;
