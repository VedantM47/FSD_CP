import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import SocialButtons from './SocialButtons';

const AuthForm = ({ type }) => {
  const isSignup = type === 'signup';
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Only check admin credentials on LOGIN
    if (!isSignup) {
      const email = e.target.email.value;
      const password = e.target.password.value;

      // 🔐 HARDCODED ADMIN LOGIN (UI ONLY)
      if (email === 'admin@example.com' && password === '1234') {
        navigate('/admin/dashboard');
        return;
      }
    }

    console.log(`${type} form submitted (UI only)`);
  };

  return (
    <div className="auth-form-container">
      <div className="auth-header">
        <h1 className="auth-title">
          {isSignup ? 'Get Started Now' : 'Welcome Back!'}
        </h1>
        <p className="auth-subtitle">
          {isSignup
            ? 'Create your account and join the hackathon community'
            : 'Enter your credentials to access your account'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {isSignup && (
          <Input
            label="Name"
            name="name"
            type="text"
            placeholder="Enter your name"
            required
          />
        )}

        <Input
          label="Email address"
          name="email"
          type="email"
          placeholder="Enter your email"
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Enter your password"
          required
        />

        {!isSignup && (
          <div className="forgot-password-wrapper">
            <span className="forgot-password">Forgot your password?</span>
          </div>
        )}

        {isSignup && (
          <div className="checkbox-wrapper">
            <input type="checkbox" id="terms" required />
            <label htmlFor="terms" className="checkbox-label">
              I agree to the terms & conditions
            </label>
          </div>
        )}

        <Button text={isSignup ? 'Register' : 'Login'} type="submit" />
      </form>

      <div className="divider">
        <span>Or</span>
      </div>

      <SocialButtons />

      <p className="auth-footer">
        {isSignup ? (
          <>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Login
            </Link>
          </>
        ) : (
          <>
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="auth-link">
              Signup
            </Link>
          </>
        )}
      </p>
    </div>
  );
};

export default AuthForm;
