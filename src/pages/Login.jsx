import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import heroPhoto from "../assets/images/hero-lake.jpg";
import "../auth/Auth.css";

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
      navigate("/forum", { replace: true, state: { justLoggedIn: true } });
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <main className="auth-page">

      {/* Full-bleed lake photo */}
      <div className="auth-bg" style={{ backgroundImage: `url(${heroPhoto})` }} />

      {/* Atmospheric depth */}
      <div className="auth-atmosphere" />

      {/* ── Left: hero text over photo ── */}
      <div className="auth-photo-side">
        <div className="auth-hero__logo">
          <div className="auth-hero__mark">
            <svg viewBox="0 0 24 24" fill="none" width="17" height="17">
              <path
                d="M12 22C12 22 6 16 6 10a6 6 0 0112 0c0 6-6 12-6 12z"
                stroke="rgba(246,242,234,0.88)"
                strokeWidth="1.5"
              />
              <path d="M12 22V10" stroke="rgba(246,242,234,0.5)" strokeWidth="1.1" />
            </svg>
          </div>
        </div>

        <div className="auth-hero__body">
          <h1 className="auth-hero__headline">
            You're not<br />alone.
          </h1>
          <div className="auth-hero__rule" />
          <p className="auth-hero__sub">
            A community built on acceptance, not judgment.<br />
            We'll be here whenever you're ready.
          </p>
        </div>

        <div className="auth-hero__footer">
          <p className="auth-hero__since">Peer-led since 2013</p>
        </div>
      </div>

      {/* ── Right: card floating over photo ── */}
      <div className="auth-form-side">
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

            {error && <p className="auth-error" role="alert">{error}</p>}
          </form>

          <div className="auth-divider">
            <span /><p>or</p><span />
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
