import React from "react";
import "../../styles/judge.css";

const Navbar = () => {
  return (
    <nav className="judge-navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <h1 className="navbar-logo">HackHub</h1>
          <span className="navbar-badge">Judge</span>
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
