import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./AuthPanel.css";

/**
 * AuthPanel — slides in from the right over the current page.
 * Handles both login and register in one component.
 * The page behind it stays visible (slightly blurred via Layout).
 *
 * Props:
 *   mode         "login" | "register"
 *   onClose      called when user dismisses the panel
 *   onSwitchMode called when user toggles between login/register
 */
export default function AuthPanel({ mode, onClose, onSwitchMode }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const isLogin = mode === "login";

  // Close on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Focus trap — move focus into panel on open
  useEffect(() => {
    const first = panelRef.current?.querySelector("input");
    if (first) setTimeout(() => first.focus(), 300);
  }, [mode]);

  function switchMode(nextMode) {
    setError(null);
    onSwitchMode(nextMode);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const data = new FormData(e.target);
    const email = data.get("email");
    const password = data.get("password");

    try {
      if (isLogin) {
        await login({ email, password });
        onClose();
        navigate("/forum", { state: { justLoggedIn: true } });
      } else {
        const username = data.get("username");
        await register({ username, email, password });
        onClose();
        window.history.replaceState(null, "", "/");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Backdrop — click to close */}
      <div
        className="ap-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className="ap-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={isLogin ? "Log in" : "Create an account"}
      >
        {/* Close button */}
        <button
          className="ap-close"
          onClick={onClose}
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Icon */}
        <div className="ap-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
            <path
              d="M12 22C12 22 6 16 6 10a6 6 0 0112 0c0 6-6 12-6 12z"
              stroke="#2c3a2d"
              strokeWidth="1.5"
            />
            <path d="M12 22V10" stroke="#2c3a2d" strokeWidth="1.1" />
          </svg>
        </div>

        {/* Heading */}
        <h2 className="ap-title">
          {isLogin ? "Welcome back." : "Join the community."}
        </h2>
        <p className="ap-sub">
          {isLogin
            ? "Good to see you."
            : "A safe space to find your way forward."}
        </p>

        {/* Form */}
        <form className="ap-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <label className="ap-label">
              <span>Username</span>
              <input
                className="ap-input"
                type="text"
                name="username"
                placeholder="yourname"
                autoComplete="username"
                required
              />
            </label>
          )}

          <label className="ap-label">
            <span>Email</span>
            <input
              className="ap-input"
              type="email"
              name="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="ap-label">
            <span>Password</span>
            <input
              className="ap-input"
              type="password"
              name="password"
              placeholder="••••••••"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
            />
          </label>

          {isLogin && (
            <button
              type="button"
              className="ap-forgot"
              onClick={() => {/* TODO: forgot password */}}
            >
              Forgot your password?
            </button>
          )}

          <button
            className="ap-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Just a moment…"
              : isLogin
              ? "Log in"
              : "Create account"}
          </button>

          {error && <p className="ap-error" role="alert">{error}</p>}
        </form>

        {/* Divider */}
        <div className="ap-divider">
          <span /><p>or</p><span />
        </div>

        {/* Switch mode */}
        <button
          className="ap-switch-btn"
          type="button"
          onClick={() => switchMode(isLogin ? "register" : "login")}
        >
          {isLogin ? "Create an account" : "Already have an account? Log in"}
        </button>

        <p className="ap-footer">
          {isLogin
            ? <>Need an account? <button type="button" onClick={() => switchMode("register")}>Sign up here.</button></>
            : <>Already a member? <button type="button" onClick={() => switchMode("login")}>Log in.</button></>
          }
        </p>
      </aside>
    </>
  );
}
