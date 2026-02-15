import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthForm from "../../components/auth/AuthForm";
import { saveAuthToken } from "../../utils/authUtils";
import API from "../../services/api";

import "../../styles/auth.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get the redirect path (where user was trying to go before being redirected to login)
  const from = location.state?.from?.pathname || "/judge/hackathons";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Make login request
      const response = await axios.post(`${API}/users/login`, formData);

      if (response.data.success && response.data.token) {
        // Save token to localStorage
        saveAuthToken(response.data.token);

        // Redirect to intended page or default to judge dashboard
        navigate(from, { replace: true });
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);

      if (err.response) {
        // Server responded with error
        setError(err.response.data.message || "Invalid credentials");
      } else if (err.request) {
        // Request made but no response
        setError("Unable to connect to server. Please try again.");
      } else {
        // Something else happened
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthLayout>
      <AuthForm type="login" />
    </AuthLayout>
  );
};

export default Login;
