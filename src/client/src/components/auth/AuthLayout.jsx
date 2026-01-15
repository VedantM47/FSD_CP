import React from "react";
import authBg from "../../assets/auth-bg.jpeg";
import '../../styles/auth.css';

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout">
      {/* Left Form Section */}
      <div className="auth-left">
        {children}
      </div>

      {/* Right Branding Section (IMAGE ONLY) */}
      <div
        className="auth-right"
        style={{
          backgroundImage: `url(${authBg})`,
        }}

      />
    </div>
  );
};

export default AuthLayout;
