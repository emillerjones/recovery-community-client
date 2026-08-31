import { useEffect, useLayoutEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import "./Register.css";

const API = import.meta.env.VITE_API;

export default function Register() {
  const { register } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite") || "";
  const [invite, setInvite] = useState(inviteToken ? { loading: true } : null);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const returnTo = location.state?.returnTo || "/";
  const returnScrollY = Number.isFinite(location.state?.returnScrollY)
    ? location.state.returnScrollY
    : 0;

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    if (!inviteToken) return;
    // PERSONAL INVITE TRACE STEP 0: the emailed link opens this same form.
    // We ask the server whether the secret is valid and lock its invited email.
    fetch(`${API}/api/registration/invite/${encodeURIComponent(inviteToken)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        setInvite(data);
      })
      .catch((requestError) => {
        setInvite({ invalid: true });
        setError(requestError.message);
      });
  }, [inviteToken]);

  async function submitApplication(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const data = new FormData(event.currentTarget);

    try {
      const response = await register({
        username: data.get("username"),
        email: data.get("email"),
        password: data.get("password"),
        reasonForJoining: data.get("reasonForJoining"),
        howFound: data.get("howFound"),
        accessCode: data.get("accessCode"),
        inviteToken,
        agreeRules: data.get("agreeRules") === "on",
        agreePrivacy: data.get("agreePrivacy") === "on",
      });
      setResult(response);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <main className="registration-page">
        <section className="registration-card registration-card--message">
          <span className="registration-eyebrow">{result.status === "approved" ? "Invitation accepted" : "One more step"}</span>
          <h1>{result.status === "approved" ? "Your account is ready." : "Check your email."}</h1>
          <p>{result.message}</p>
          {result.status !== "approved" && <p className="registration-muted">We sent the link to <strong>{result.email}</strong>. It expires in 24 hours.</p>}
          <button className="registration-primary" onClick={() => navigate("/login")}>Go to login</button>
        </section>
      </main>
    );
  }

  return (
    <main className="registration-page">
      <section className="registration-card">
        {/* This heading is the on-screen start of every admission path. The
            fields below all submit through submitApplication above. */}
        <Link className="registration-back" to={returnTo} replace state={{ restoreScrollY: returnScrollY }}>← Back to the website</Link>
        <span className="registration-eyebrow">Private support community</span>
        <h1>{inviteToken ? "Accept your invitation" : "Request membership"}</h1>
        <p className="registration-intro">
          {inviteToken
            ? "You were personally invited. Complete the form and verify your email to activate your membership."
            : "Tell us a little about yourself. After email verification, an owner or administrator will review your request."}
        </p>

        <form className="registration-form" onSubmit={submitApplication}>
          <div className="registration-grid">
            <label><span>Username</span><input name="username" autoComplete="username" minLength="3" maxLength="30" required /></label>
            <label>
              <span>Email address</span>
              <input key={invite?.email || "open-email"} name="email" type="email" autoComplete="email" defaultValue={invite?.email || ""} readOnly={Boolean(invite?.email)} required />
            </label>
          </div>

          <label><span>Password</span><input name="password" type="password" autoComplete="new-password" minLength="8" maxLength="72" required /><small>At least 8 characters.</small></label>
          <label><span>Why would you like to join our private support community?</span><textarea name="reasonForJoining" maxLength="1500" rows="5" required /></label>
          <label><span>How did you find our website or forum?</span><textarea name="howFound" maxLength="500" rows="3" required /></label>

          {!inviteToken && (
            <label>
              <span>Community access code <em>optional</em></span>
              <input name="accessCode" autoCapitalize="characters" placeholder="Enter a code if you received one" />
              <small>A valid community code skips manual approval after you verify your email.</small>
            </label>
          )}

          <label className="registration-check"><input name="agreeRules" type="checkbox" required /><span>I agree to follow the <Link to="/guidelines" target="_blank">forum rules</Link>.</span></label>
          <label className="registration-check"><input name="agreePrivacy" type="checkbox" required /><span>I agree to the community privacy policy.</span></label>

          {error && <p className="registration-error" role="alert">{error}</p>}
          <button className="registration-primary" disabled={submitting || invite?.loading || invite?.invalid}>
            {submitting ? "Creating your application…" : invite?.loading ? "Checking invitation…" : "Create account"}
          </button>
        </form>

        <p className="registration-login">Already approved? <button onClick={() => navigate("/login")}>Log in</button></p>
      </section>
    </main>
  );
}
