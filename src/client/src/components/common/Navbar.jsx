import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  // Get user initial for avatar
  const initial = user?.fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="bg-[#002b5b] text-white px-8 py-4 flex items-center justify-between sticky top-0 z-[100] shadow-lg">
      <div className="flex items-center gap-12">
        <Link to="/" className="font-bold text-2xl tracking-tight text-white hover:text-blue-200 transition-colors">
          Hackplatform
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/discovery"
            className={`text-xl transition-all hover:scale-110 active:scale-95 ${location.pathname === '/discovery' ? 'opacity-100' : 'opacity-60'}`}
            title="Discovery"
          >
            🏠
          </Link>
          <Link
            to="/calendar"
            className={`text-sm font-semibold transition-all hover:text-blue-200 ${location.pathname === '/calendar' ? 'text-white border-b-2 border-white pb-1' : 'text-white/70'}`}
          >
            Calendar
          </Link>
        </nav>
      </div>

      <div className="relative w-1/3 max-w-md hidden sm:block">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
          🔍
        </span>
        <input
          placeholder="Search hackathons..."
          defaultValue={new URLSearchParams(location.search).get('q') || ''}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (e.target.value.trim()) {
                window.location.href = `/discovery?q=${encodeURIComponent(e.target.value.trim())}`;
              } else {
                window.location.href = `/discovery`;
              }
            }
          }}
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 text-white placeholder:text-white/40 text-sm border border-white/10 focus:outline-none focus:bg-white/10 focus:border-white/30 transition-all font-medium"
        />
      </div>

      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <button className="p-2 rounded-full hover:bg-white/10 transition-colors" title="Notifications">
              <span className="text-xl">🔔</span>
            </button>
            <Link to="/profile" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg border-2 border-white/20 group-hover:border-white/50 transition-all overflow-hidden shadow-md">
                {initial}
              </div>
            </Link>
            <button
              onClick={logout}
              className="text-sm font-semibold text-white/70 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all"
              title="Logout"
            >
              Logout
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-white/80 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="text-sm font-semibold bg-white/10 border border-white/20 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;