import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./Registration.css";

const API = import.meta.env.VITE_API;

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const started = useRef(false);
  const [state, setState] = useState(() => token
    ? { loading: true, message: "Verifying your email…" }
    : { error: true, message: "This verification link is incomplete." });

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!token) return;
    // EMAIL VERIFY TRACE STEP 0: the email link lands here. Posting its token
    // consumes it on the server and returns either pending or approved.
    fetch(`${API}/api/registration/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        setState({ status: data.status, message: data.message });
      })
      .catch((error) => setState({ error: true, message: error.message }));
  }, [token]);

  return (
    <main className="registration-page">
      <section className="registration-card registration-card--message">
        <span className="registration-eyebrow">Email verification</span>
        <h1>{state.loading ? "Just a moment…" : state.error ? "We couldn't verify that link." : state.status === "approved" ? "Welcome to the community." : "You're in the review queue."}</h1>
        <p className={state.error ? "registration-error" : ""}>{state.message}</p>
        {!state.loading && <Link className="registration-primary registration-primary--link" to={state.status === "approved" ? "/login" : "/"}>{state.status === "approved" ? "Log in" : "Return home"}</Link>}
      </section>
    </main>
  );
}
