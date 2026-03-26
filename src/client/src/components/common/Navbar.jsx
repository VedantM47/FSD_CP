import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
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
              <div className="navbar-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z"
                    fill="white"
                  />
                  <path
                    d="M10 12.5C5.58172 12.5 2 15.5817 2 19.5C2 19.7761 2.22386 20 2.5 20H17.5C17.7761 20 18 19.7761 18 19.5C18 15.5817 14.4183 12.5 10 12.5Z"
                    fill="white"
                  />
                </svg>
              </div>
              <button onClick={logout} className="nav-link logout">
                Logout
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
              >
                Dashboard
              </Link>

              <Link
                to="/admin/hackathons/create"
                className={`nav-link ${isActive("/admin/hackathons/create") ? "active" : ""}`}
              >
                Create Hackathon
              </Link>

              <button onClick={logout} className="nav-link logout">
                Logout
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
              >
                Discovery
              </Link>
              <Link
                to="/calendar"
                className={`nav-item-user ${location.pathname === "/calendar" ? "active" : ""}`}
              >
                Calendar
              </Link>
              {(user?.systemRole === "mentor" ||
                user?.systemRole === "admin") && (
                <Link
                  to="/organizer/dashboard"
                  className={`nav-item-user ${location.pathname.startsWith("/organizer") ? "active" : ""}`}
                >
                  My Hackathons
                </Link>
              )}
              {user?.systemRole === "admin" && (
                <Link
                  to="/admin/dashboard"
                  className={`nav-item-user ${location.pathname.startsWith("/admin") ? "active" : ""}`}
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>

          <div className="navbar-search-user">
            <input
              placeholder="Search hackathons..."
              defaultValue={new URLSearchParams(location.search).get("q") || ""}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (e.target.value.trim()) {
                    window.location.href = `/discovery?q=${encodeURIComponent(e.target.value.trim())}`;
                  } else {
                    window.location.href = `/discovery`;
                  }
                }
              }}
            />
          </div>

          <div className="navbar-right-user">
            {isAuthenticated ? (
              <>
                <button
                  className="navbar-notification-btn"
                  title="Notifications"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2ZM10 16C6.68629 16 4 13.3137 4 10C4 6.68629 6.68629 4 10 4C13.3137 4 16 6.68629 16 10C16 13.3137 13.3137 16 10 16Z" fill="white"/>
                    <path d="M10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" fill="white"/>
                    <path d="M10 12C9.44772 12 9 12.4477 9 13C9 13.5523 9.44772 14 10 14C10.5523 14 11 13.5523 11 13C11 12.4477 10.5523 12 10 12Z" fill="white"/>
                  </svg>
                </button>
                <Link to="/profile" className="navbar-profile-link">
                  <div className="navbar-avatar">{initial}</div>
                </Link>
                <button onClick={logout} className="navbar-logout-btn">
                  Logout
                </button>
              </>
            ) : (
              <div className="navbar-auth-links">
                <Link to="/login" className="navbar-login-link">
                  Login
                </Link>
                <Link to="/signup" className="navbar-signup-link">
                  Sign Up
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
