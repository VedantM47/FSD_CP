import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import SocialButtons from './SocialButtons';
import { signIn, signUp } from '../../services/api'; 

const AuthForm = ({ type }) => {
  const isSignup = type === 'signup';
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // FIX 1: Grab values directly from the form event (Bypasses state issues)
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;
    
    // FIX 2: Check if fullName exists (only for signup)
    const fullName = isSignup ? form.fullName.value : null;

    const payload = isSignup 
      ? { fullName, email, password } 
      : { email, password };

    console.log("📤 Sending Payload:", payload); // Debugging: Check console to see data

    try {
      let response;
      
      if (isSignup) {
        response = await signUp(payload);
      } else {
        response = await signIn(payload);
      }

      if (response.data.token) {
        localStorage.setItem('profile', JSON.stringify({ token: response.data.token }));
        alert(isSignup ? "✅ Account Created!" : "✅ Login Successful!");
        navigate('/user/dashboard'); 
      }

    } catch (error) {
      console.error("Auth Error:", error);
      const msg = error.response?.data?.message || "Authentication failed.";
      alert(`❌ Error: ${msg}`);
    } finally {
      setLoading(false);
    }
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
            label="Full Name"
            name="fullName" /* ⚠️ FIX 3: Changed 'name' to 'fullName' to match Backend */
            type="text"
            placeholder="Enter your full name"
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

        <Button 
          text={loading ? (isSignup ? 'Registering...' : 'Logging in...') : (isSignup ? 'Register' : 'Login')} 
          type="submit" 
          disabled={loading}
        />
      </form>

      <div className="divider">
        <span>Or</span>
      </div>

      <SocialButtons />

      <p className="auth-footer">
        {isSignup ? (
          <>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Login</Link>
          </>
        ) : (
          <>
            Don't have an account?{' '}
            <Link to="/signup" className="auth-link">Signup</Link>
          </>
        )}
      </p>
    </div>
  );
};

export default AuthForm;