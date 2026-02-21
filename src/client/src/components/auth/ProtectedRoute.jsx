import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * ProtectedRoute
 * - Shows a spinner while auth state is loading
 * - Redirects to /login if not authenticated (preserves intended URL)
 * - Optionally restricts by role via `allowedRoles` prop
 *
 * Usage in App.jsx:
 *   <Route element={<ProtectedRoute />}>  ...child routes...  </Route>
 *   <Route element={<ProtectedRoute allowedRoles={["admin"]} />}> ... </Route>
 */
const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading, isAuthenticated } = useAuth();
    const location = useLocation();

    /* Still checking token / calling /me */
    if (loading) {
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100vh",
                    background: "#f8fafc",
                }}
            >
                <div
                    style={{
                        width: 40,
                        height: 40,
                        border: "4px solid #e2e8f0",
                        borderTopColor: "#6366f1",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                    }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    /* Not logged in → redirect to /login */
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    /* Role check (optional) */
    if (allowedRoles && !allowedRoles.includes(user?.systemRole)) {
        return <Navigate to="/" replace />;
    }

    /* Authorized → render children */
    return <Outlet />;
};

export default ProtectedRoute;
