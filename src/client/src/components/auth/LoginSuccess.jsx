import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// Aapki utility functions ko use karna better hai consistency ke liye
import { saveAuthToken } from '../../utils/authUtils'; 

const LoginSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // FIX: 'token' ki jagah 'authToken' use karo
      // Ya phir seedha utility function call karo:
      localStorage.setItem('authToken', token); 
      
      console.log("✓ OAuth Token Saved as 'authToken'. Redirecting...");
      
      // Force reload taaki ProtectedRoute naya token dekh sake
      window.location.href = '/discovery'; 
    } else {
      console.error("✗ No token found");
      navigate('/login?error=no_token');
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Completing Login...</h2>
      <p>Please wait while we sync your account.</p>
    </div>
  );
};

export default LoginSuccess;