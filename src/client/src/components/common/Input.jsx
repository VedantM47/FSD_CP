import React, { useState } from 'react';

const Input = ({ label, type = 'text', placeholder, name, required = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="input-group">
      <label htmlFor={name} className="input-label">
        {label}
      </label>

      <div className="input-wrapper">
        <input
          name={name}
          type={inputType}
          placeholder={placeholder}
          className="input-field"
          required={required}
        />

        {isPassword && (
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label="Toggle password visibility"
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;
