import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import "./MembershipAdmin.css";

const API = import.meta.env.VITE_API;

async function readResponse(response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(data.message || "The request could not be completed.");
  return data;
}

export default function MembershipAdmin() {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [invites, setInvites] = useState([]);
  const [codes, setCodes] = useState([]);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [newCode, setNewCode] = useState("");

  const authHeaders = useCallback((json = false) => ({
    Authorization: `Bearer ${token}`,
    ...(json ? { "Content-Type": "application/json" } : {}),
  }), [token]);

  useEffect(() => {
    let cancelled = false;
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API}/api/admissions/applications`, { headers }).then(readResponse),
      fetch(`${API}/api/admissions/invites`, { headers }).then(readResponse),
      fetch(`${API}/api/admissions/codes`, { headers }).then(readResponse),
    ]).then(([applicationData, inviteData, codeData]) => {
      if (cancelled) return;
      setApplications(applicationData);
      setInvites(inviteData);
      setCodes(codeData);
    }).catch((error) => {
      if (!cancelled) setNotice(error.message);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [token]);

  async function decide(application, decision) {
    const reason = decision === "rejected"
      ? window.prompt("Optional private note to include in the rejection email:") ?? null
      : "";
    if (reason === null) return;
    try {
      // REVIEW TRACE STEP 0: these buttons call the admissions API; its query
      // records the reviewer and updates login eligibility in one operation.
      await fetch(`${API}/api/admissions/applications/${application.application_id}`, {
        method: "PATCH", headers: authHeaders(true), body: JSON.stringify({ decision, reason }),
      }).then(readResponse);
      setApplications((current) => current.filter((item) => item.application_id !== application.application_id));
      setNotice(`${application.username} was ${decision}.`);
    } catch (error) { setNotice(error.message); }
  }

  async function makeInvite(event) {
    event.preventDefault();
    // React clears event.currentTarget after the handler yields at await.
    // Keep the actual form element so we can safely reset it after success.
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const invite = await fetch(`${API}/api/admissions/invites`, {
        method: "POST", headers: authHeaders(true),
        body: JSON.stringify({ email: data.get("email"), expiresInDays: data.get("expiresInDays") }),
      }).then(readResponse);
      form.reset();
      setInvites((current) => [invite, ...current]);
      setNotice(`The private invitation was emailed to ${invite.email}.`);
    } catch (error) { setNotice(error.message); }
  }

  async function revokeInvite(inviteId) {
    try {
      await fetch(`${API}/api/admissions/invites/${inviteId}/revoke`, { method: "PATCH", headers: authHeaders() }).then(readResponse);
      setInvites((current) => current.map((item) => item.invite_id === inviteId ? { ...item, revoked_at: new Date().toISOString() } : item));
    } catch (error) { setNotice(error.message); }
  }

  async function makeCode(event) {
    event.preventDefault();
    // Same async-event rule as the invitation form above.
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const code = await fetch(`${API}/api/admissions/codes`, {
        method: "POST", headers: authHeaders(true),
        body: JSON.stringify({ code: data.get("code"), expiresInDays: data.get("expiresInDays"), maxUses: data.get("maxUses") }),
      }).then(readResponse);
      form.reset();
      setCodes((current) => [code, ...current]);
      setNewCode(code.code);
      setNotice("Code created. Copy it now—the secure value is only shown once.");
    } catch (error) { setNotice(error.message); }
  }

  async function toggleCode(code) {
    try {
      const updated = await fetch(`${API}/api/admissions/codes/${code.code_id}`, {
        method: "PATCH", headers: authHeaders(true), body: JSON.stringify({ active: !code.active }),
      }).then(readResponse);
      setCodes((current) => current.map((item) => item.code_id === code.code_id ? { ...item, active: updated.active } : item));
    } catch (error) { setNotice(error.message); }
  }

  return (
    <main className="membership-admin">
      <header><span>Owner and administrator tools</span><h1>Membership admissions</h1><p>Review new members and manage the two ways people can bypass manual approval.</p></header>
      {notice && <div className="membership-notice" role="status">{notice}<button onClick={() => setNotice("")}>×</button></div>}

      <section className="membership-section">
        <div className="membership-section__title"><h2>Pending applications</h2><span>{applications.length}</span></div>
        {loading ? <p>Loading admissions…</p> : applications.length === 0 ? <p className="membership-empty">Nobody is waiting for review.</p> : applications.map((application) => (
          <article className="application-card" key={application.application_id}>
            <div className="application-card__identity"><div><strong>{application.username}</strong><span>{application.email}</span></div><small>Email verified {new Date(application.email_verified_at).toLocaleDateString()}</small></div>
            <dl><div><dt>Why they want to join</dt><dd>{application.reason_for_joining}</dd></div><div><dt>How they found us</dt><dd>{application.how_did_you_find_us}</dd></div></dl>
            <div className="application-card__actions"><button onClick={() => decide(application, "rejected")}>Reject</button><button className="membership-primary" onClick={() => decide(application, "approved")}>Approve member</button></div>
          </article>
        ))}
      </section>

      <div className="membership-columns">
        <section className="membership-section">
          <h2>Personal invitations</h2><p className="membership-help">Email a secure, one-use signup link that bypasses manual approval.</p>
          <form className="membership-form" onSubmit={makeInvite}><input name="email" type="email" placeholder="person@example.com" required /><label>Expires in <input name="expiresInDays" type="number" min="1" max="90" defaultValue="14" /> days</label><button className="membership-primary">Email invitation</button></form>
          <div className="membership-list">{invites.map((invite) => { const open = !invite.used_at && !invite.revoked_at && new Date(invite.expires_at) > new Date(); return <div key={invite.invite_id}><span><strong>{invite.email}</strong><small>{invite.used_at ? "Used" : invite.revoked_at ? "Revoked" : open ? `Expires ${new Date(invite.expires_at).toLocaleDateString()}` : "Expired"}</small></span>{open && <button onClick={() => revokeInvite(invite.invite_id)}>Revoke</button>}</div>; })}</div>
        </section>

        <section className="membership-section">
          <h2>Shared community codes</h2><p className="membership-help">Create a temporary code for the current Facebook community.</p>
          {newCode && <div className="new-code"><span>Copy this code now</span><strong>{newCode}</strong><button onClick={() => navigator.clipboard.writeText(newCode)}>Copy</button></div>}
          <form className="membership-form" onSubmit={makeCode}><label>Code<input name="code" placeholder="Example: MMRC420" minLength="6" maxLength="64" autoCapitalize="characters" required /></label><div className="membership-form__row"><label>Days <input name="expiresInDays" type="number" min="1" max="365" defaultValue="90" /></label><label>Use limit <input name="maxUses" type="number" min="1" placeholder="None" /></label></div><button className="membership-primary">Create shared code</button></form>
          <div className="membership-list">{codes.map((code) => <div key={code.code_id}><span><strong>{code.name}</strong><small>{code.use_count}{code.max_uses ? ` / ${code.max_uses}` : ""} uses · expires {new Date(code.expires_at).toLocaleDateString()}</small></span><button onClick={() => toggleCode(code)}>{code.active ? "Disable" : "Enable"}</button></div>)}</div>
        </section>
      </div>
    </main>
  );
}
