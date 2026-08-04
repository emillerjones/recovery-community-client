/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getAnalyticsSessionId } from "../utils/analytics";

const API = import.meta.env.VITE_API;

const AuthContext = createContext();

function decodeToken(token) {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => decodeToken(localStorage.getItem("token")));

  // The token proves identity, while /me supplies current profile details such
  // as the avatar. This keeps the navbar current after a reload without making
  // profile data part of authorization decisions.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetch(API + "/api/users/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        if (response.status === 401) {
          if (!cancelled) {
            setToken(null);
            setUser(null);
            localStorage.removeItem("token");
          }
          return null;
        }
        return response.ok ? response.json() : null;
      })
      .then((profile) => {
        if (!cancelled && profile) setUser((current) => ({ ...current, ...profile, id: profile.user_id }));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [token]);

  
  const register = async (credentials) => {
    // REGISTRATION TRACE STEP 0: callers hand the complete application to the
    // public registration API. Registration never stores a login token; email
    // verification and (when needed) staff approval happen first.
    const response = await fetch(API + "/api/registration/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const result = await response.json();
    if (!response.ok) {
      throw Error(result.message);
    }
    return result;
  };


  const login = async (credentials) => {
    const response = await fetch(API + "/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...credentials,
        analyticsSessionId: getAnalyticsSessionId(),
      }),
    });
    const text = await response.text();

    if (!response.ok) {
      throw Error(text || "Login failed");
    }

    const result = JSON.parse(text);
    setToken(result.token);
    localStorage.setItem("token", result.token);
    const tokenUser = decodeToken(result.token);
    setUser({ ...tokenUser, ...result.user, id: tokenUser?.id });
  };


  const logout = useCallback(() => {
    if (token) {
      // Logout clears the JWT locally, so send this authenticated event first.
      // keepalive lets the small request finish during navigation/page closing.
      fetch(API + "/api/analytics/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventType: "logout",
          sessionId: getAnalyticsSessionId(),
        }),
        keepalive: true,
      }).catch(() => {});
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  }, [token]);


  const updateUser = useCallback((profile) => setUser((current) => ({ ...current, ...profile, id: profile.user_id || current?.id })), []);
  const value = { token, user, register, login, logout, updateUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}




export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw Error("useAuth must be used within AuthProvider");
  return context;
}
