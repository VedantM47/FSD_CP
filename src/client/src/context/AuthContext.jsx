import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API, { getMe } from "../services/api";
import {
    saveAuthToken,
    getAuthToken,
    removeAuthToken,
    isTokenExpired,
} from "../utils/authUtils";

/* =============== CONTEXT =============== */
const AuthContext = createContext(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
    return ctx;
};

/* =============== PROVIDER =============== */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true); // true while hydrating on mount
    const isLoggingIn = useRef(false); // prevents 401 interceptor from racing

    const navigate = useNavigate();

    /* ---------- Logout ---------- */
    const logout = useCallback(() => {
        if (isLoggingIn.current) return; // don't logout mid-login
        removeAuthToken();
        localStorage.removeItem("profile");
        setUser(null);
        setToken(null);
        navigate("/login", { replace: true });
    }, [navigate]);

    /* ---------- Hydrate user from /me ---------- */
    const hydrateUser = useCallback(async (jwt) => {
        if (!jwt) {
            setLoading(false);
            return null;
        }

        // Check expiry before calling server
        if (isTokenExpired(jwt)) {
            removeAuthToken();
            localStorage.removeItem("profile");
            setUser(null);
            setToken(null);
            setLoading(false);
            return null;
        }

        try {
            const res = await getMe();
            // Backend returns { success, data: { fullName, email, systemRole, ... } }
            const userData = res.data.data;
            setUser(userData);
            setToken(jwt);
            setLoading(false);
            return userData;
        } catch (err) {
            console.error("Failed to hydrate user:", err);
            removeAuthToken();
            localStorage.removeItem("profile");
            setUser(null);
            setToken(null);
            setLoading(false);
            return null;
        }
    }, []);

    /* ---------- Login ---------- */
    const login = useCallback(
        async (jwt) => {
            isLoggingIn.current = true;
            saveAuthToken(jwt);
            localStorage.setItem("profile", JSON.stringify({ token: jwt }));
            const userData = await hydrateUser(jwt);
            isLoggingIn.current = false;
            return userData;
        },
        [hydrateUser]
    );

    /* ---------- Mount: rehydrate from stored token ---------- */
    useEffect(() => {
        const stored = getAuthToken();
        if (stored) {
            hydrateUser(stored);
        } else {
            setLoading(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    /* ---------- 401 Interceptor: auto-logout on expired token ---------- */
    useEffect(() => {
        const id = API.interceptors.response.use(
            (res) => res,
            (err) => {
                if (err.response?.status === 401 && !isLoggingIn.current) {
                    logout();
                }
                return Promise.reject(err);
            }
        );
        return () => API.interceptors.response.eject(id);
    }, [logout]);

    /* ---------- Value ---------- */
    const value = { user, token, loading, login, logout, isAuthenticated: !!user };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

