import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import "./Profile.css";

const API = import.meta.env.VITE_API;
const ROLE_LABELS = { 1: "Owner", 10: "Administrator", 50: "Moderator", 100: "Member" };

function initials(username) {
  const words = String(username || "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "?";
  return (words.length > 1 ? words[0][0] + words.at(-1)[0] : words[0].slice(0, 2)).toUpperCase();
}

export default function Profile() {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ bio: "", phoneNumber: "", dateOfBirth: "", gender: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  useEffect(() => {
    let cancelled = false;
    // PROFILE TRACE STEP 1: opening /profile fetches the private account row.
    fetch(`${API}/api/users/me`, { headers: authHeaders })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Your profile could not be loaded.");
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
        setForm({
          bio: data.bio || "",
          phoneNumber: data.phone_number || "",
          dateOfBirth: data.date_of_birth ? String(data.date_of_birth).slice(0, 10) : "",
          gender: data.gender || "",
        });
      })
      .catch((requestError) => { if (!cancelled) setError(requestError.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [authHeaders]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      // PROFILE TRACE STEP 2: Save sends only fields members may edit. Continue
      // at PROFILE TRACE STEP 3 in server/api/users.js.
      const response = await fetch(`${API}/api/users/me/profile`, {
        method: "PATCH",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Your profile could not be saved.");
      setProfile(data);
      setMessage("Your profile was saved.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className="profile-page"><p className="profile-loading">Loading your profile…</p></main>;
  if (!profile) return <main className="profile-page"><p className="profile-error">{error}</p></main>;

  return (
    <main className="profile-page">
      <section className="profile-shell">
        {/* On-screen identity summary. Avatar upload will replace this initials
            fallback later without changing the rest of the profile layout. */}
        <header className="profile-header">
          <div className="profile-avatar" aria-hidden="true">{initials(profile.username)}</div>
          <div><span className="profile-eyebrow">My profile</span><h1>{profile.username}</h1><p>{ROLE_LABELS[profile.role_id] || "Member"} · Joined {new Date(profile.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p></div>
          <button className="profile-photo-placeholder" type="button" disabled>Photo upload coming later</button>
        </header>

        <form className="profile-form" onSubmit={saveProfile}>
          <section className="profile-section">
            <div className="profile-section__heading"><div><h2>Community identity</h2><p>Your username identifies you throughout posts, replies, and mentions.</p></div></div>
            <div className="profile-readonly-grid">
              <label><span>Username</span><div className="profile-readonly">{profile.username}</div><small>Username changes are not currently allowed.</small></label>
              <label><span>Email</span><div className="profile-readonly">{profile.email}</div><small>Private. Used only for login and account emails.</small></label>
            </div>
            <label className="profile-field"><span>About me</span><textarea name="bio" value={form.bio} onChange={updateField} rows="6" maxLength="1000" placeholder="Share as much or as little as feels comfortable." /><small>{form.bio.length}/1000 · This may appear on a future member-facing profile.</small></label>
          </section>

          <section className="profile-section">
            <div className="profile-section__heading"><div><h2>Personal details</h2><p>These details are private and are not shown on posts, comments, or member listings.</p></div><span className="profile-private-badge">Private</span></div>
            <div className="profile-fields-grid">
              <label className="profile-field"><span>Phone number <em>optional</em></span><input name="phoneNumber" type="tel" value={form.phoneNumber} onChange={updateField} maxLength="30" autoComplete="tel" placeholder="(555) 555-0123" /></label>
              <label className="profile-field"><span>Date of birth <em>optional</em></span><input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={updateField} max={new Date().toISOString().slice(0, 10)} autoComplete="bday" /></label>
              <label className="profile-field profile-field--wide"><span>Gender <em>optional</em></span><input name="gender" value={form.gender} onChange={updateField} maxLength="50" autoComplete="sex" placeholder="Describe in your own words" /></label>
            </div>
          </section>

          {(message || error) && <div className={error ? "profile-status profile-status--error" : "profile-status"} role="status">{error || message}</div>}
          <div className="profile-actions"><button className="profile-save" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button></div>
        </form>
      </section>
    </main>
  );
}
