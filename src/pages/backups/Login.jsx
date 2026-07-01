import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import heroPhoto from "../assets/images/hero-lake.jpg";
import "../auth/auth.css";

/**
 * Login — full-bleed lake photo background, floating form card.
 * The photo fills the entire viewport. Brand + headline sit
 * bottom-left. The form card floats center-right.
 * On mobile: photo becomes background, card fills the screen.
 */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const tryLogin = async (formData) => {
    setError(null);
    const email = formData.get("email");
    const password = formData.get("password");
    try {
      await login({ email, password });
      navigate("/");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <main className="auth-page">

      {/* Full-bleed background photo */}
      <div
        className="auth-bg"
        style={{ backgroundImage: `url(${heroPhoto})` }}
      />

      {/* Layered atmospheric overlays */}
      <div className="auth-overlay" />

      {/* Brand + headline — bottom left */}
      <div className="auth-brand" aria-hidden="true">
        <div className="auth-brand__logo">
          <div className="auth-brand__mark">
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
              <path
                d="M12 22C12 22 6 16 6 10a6 6 0 0112 0c0 6-6 12-6 12z"
                stroke="rgba(246,242,234,0.88)"
                strokeWidth="1.5"
              />
              <path
                d="M12 22V10"
                stroke="rgba(246,242,234,0.5)"
                strokeWidth="1.1"
              />
            </svg>
          </div>
          <div className="auth-brand__name">
            Recovery With<br />The Exit Drug
          </div>
        </div>

        <h1 className="auth-brand__headline">
          You're not<br />alone.
        </h1>

        <div className="auth-brand__rule" />

        <p className="auth-brand__sub">
          A community built on acceptance, not judgment.<br />
          We'll be here whenever you're ready.
        </p>

        <p className="auth-brand__since">Peer-led since 2013</p>
      </div>

      {/* Floating form card — center right */}
      <div className="auth-card-wrap">
        <div className="auth-card">

          <div className="auth-card__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
              <path
                d="M12 22C12 22 6 16 6 10a6 6 0 0112 0c0 6-6 12-6 12z"
                stroke="#2c3a2d"
                strokeWidth="1.5"
              />
              <path d="M12 22V10" stroke="#2c3a2d" strokeWidth="1.1" />
            </svg>
          </div>

          <h2 className="auth-card__title">Welcome back.</h2>
          <p className="auth-card__sub">Good to see you.</p>

          <form className="auth-form" action={tryLogin}>
            <label className="auth-label">
              <span>Email</span>
              <input
                className="auth-input"
                type="email"
                name="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="auth-label">
              <span>Password</span>
              <input
                className="auth-input"
                type="password"
                name="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </label>

            <button
              type="button"
              className="auth-forgot"
              onClick={() => {/* TODO: forgot password */}}
            >
              Forgot your password?
            </button>

            <button className="auth-button" type="submit">
              Log in
            </button>

            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}
          </form>

          <div className="auth-divider">
            <span />
            <p>or</p>
            <span />
          </div>

          <button
            className="auth-secondary"
            type="button"
            onClick={() => navigate("/register")}
          >
            Create an account
          </button>

          <p className="auth-switch">
            Need an account?{" "}
            <button type="button" onClick={() => navigate("/register")}>
              Sign up here.
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
