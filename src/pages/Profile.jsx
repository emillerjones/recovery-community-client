import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import MemberAvatar from "../components/MemberAvatar";
import { memberInitials } from "../components/memberAvatarUtils";
import "./Profile.css";

const API = import.meta.env.VITE_API;
const ROLE_LABELS = { 1: "Owner", 10: "Administrator", 50: "Moderator", 100: "Member" };
// Phosphor contains thousands of exports, so the browser downloads the avatar
// studio only when somebody actually opens it (or already has a preset avatar).
const AvatarStudio = lazy(() => import("../components/AvatarStudio"));

export default function Profile() {
  const { token, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ bio: "", phoneNumber: "", dateOfBirth: "", gender: "", avatarPreset: "" });
  const [avatarStudioOpen, setAvatarStudioOpen] = useState(false);
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
          avatarPreset: data.avatar_url || "",
        });
      })
      .catch((requestError) => { if (!cancelled) setError(requestError.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [authHeaders, updateUser]);

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
      updateUser(data);
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
        {/* PROFILE SCREEN: this is the identity summary at the very top. The
            round avatar itself is the button that opens the picker below. */}
        <header className="profile-header">
          <button className="profile-avatar-button" type="button" onClick={() => setAvatarStudioOpen(true)} aria-label="Choose your profile avatar">
            <span className="profile-avatar">
              <MemberAvatar username={profile.username} avatarUrl={form.avatarPreset} size={82} />
            </span>
            <span className="profile-avatar-edit">Edit</span>
          </button>
          <div><span className="profile-eyebrow">My profile</span><h1>{profile.username}</h1><p>{ROLE_LABELS[profile.role_id] || "Member"} · Joined {new Date(profile.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p></div>
          <button className="profile-choose-avatar" type="button" onClick={() => setAvatarStudioOpen(true)}>Choose avatar</button>
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
      {/* PROFILE SCREEN: this dialog sits over the page after the avatar circle
          is clicked. Choosing an icon updates the form; Save changes is what
          sends it through the profile API and into users.avatar_url. */}
      {avatarStudioOpen && <Suspense fallback={<div className="avatar-studio-loading">Loading avatar choices…</div>}><AvatarStudio value={form.avatarPreset} fallback={memberInitials(profile.username)} onClose={() => setAvatarStudioOpen(false)} onChoose={(avatarPreset) => { setForm((current) => ({ ...current, avatarPreset })); setAvatarStudioOpen(false); }} /></Suspense>}
    </main>
  );
}
