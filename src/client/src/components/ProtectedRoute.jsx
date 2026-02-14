import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  isAuthenticated,
  isTokenExpired,
  getAuthToken,
  removeAuthToken,
} from "../utils/authUtils";

/**
 * Protected Route Component
 * Protects routes from unauthorized access
 *
 * @param {object} props - Component props
 * @param {React.Component} props.children - Child components to render
 * @param {Array<string>} props.allowedRoles - Array of roles allowed to access the route
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const token = getAuthToken();

  // Check if user is authenticated
  if (!isAuthenticated()) {
    // Redirect to login page, saving the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if token is expired
  if (isTokenExpired(token)) {
    removeAuthToken();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If allowedRoles is specified, check user role
  if (allowedRoles.length > 0) {
    // You'll need to fetch user data or decode token to get role
    // For now, this is a placeholder
    // const user = getCurrentUser();
    // const hasRequiredRole = allowedRoles.includes(user.systemRole);
    // if (!hasRequiredRole) {
    //   return <Navigate to="/unauthorized" replace />;
    // }
  }

  return children;
};

export default ProtectedRoute;
