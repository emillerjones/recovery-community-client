import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Register.css";

const API = import.meta.env.VITE_API;

export default function ResetPassword() {
  const [token] = useState(() => new URLSearchParams(window.location.search).get("token") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(token ? "" : "This password reset link is incomplete.");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) window.history.replaceState(null, "", "/reset-password");
  }, [token]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") || "");
    const confirmation = String(data.get("confirmation") || "");

    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API}/api/password-reset/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not reset your password.");
      setMessage(result.message);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="registration-page">
      <section className="registration-card registration-card--message">
        <span className="registration-eyebrow">Account recovery</span>
        <h1>{message ? "Password changed." : "Choose a new password."}</h1>

        {message ? (
          <>
            <p className="registration-intro">{message}</p>
            <Link className="registration-primary registration-primary--link" to="/login">Log in</Link>
          </>
        ) : (
          <form className="registration-form registration-form--narrow" onSubmit={handleSubmit}>
            <label>
              New password
              <input name="password" type="password" autoComplete="new-password" minLength="8" maxLength="72" required disabled={!token || loading} />
              <small>Use between 8 and 72 characters.</small>
            </label>
            <label>
              Confirm new password
              <input name="confirmation" type="password" autoComplete="new-password" minLength="8" maxLength="72" required disabled={!token || loading} />
            </label>
            {error && <p className="registration-error" role="alert">{error}</p>}
            <button className="registration-primary" type="submit" disabled={!token || loading}>
              {loading ? "Changing password..." : "Change password"}
            </button>
            <Link className="registration-back registration-back--centered" to="/login">Back to login</Link>
          </form>
        )}
      </section>
    </main>
  );
}
