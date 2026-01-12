import React from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import SocialButtons from './SocialButtons';

const AuthForm = ({ type }) => {
  const isSignup = type === 'signup';

  const handleSubmit = (e) => {
    e.preventDefault();
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
            type="text"
            placeholder="Enter your name"
            required
          />
        )}

        <Input
          label="Email address"
          type="email"
          placeholder="Enter your email"
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          required
        />

        {!isSignup && (
          <div className="forgot-password-wrapper">
            <a href="#" className="forgot-password" onClick={(e) => e.preventDefault()}>
              Forgot your password?
            </a>
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
            <a href="/login" className="auth-link">
              Login
            </a>
          </>
        ) : (
          <>
            Don&apos;t have an account?{' '}
            <a href="/signup" className="auth-link">
              Signup
            </a>
          </>
        )}
      </p>

    </div>
  );
};

export default AuthForm;
