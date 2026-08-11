import { useCallback, useEffect, useMemo, useState } from "react";
import { CloudRain, Footprints, Heart, HeartHandshake, Leaf, Shield, Sparkles, Sun, X } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import MemberAvatar from "../../components/MemberAvatar";
import { useMessages } from "../../contexts/MessagesContext";
import "./CommunityGrove.css";

const API = import.meta.env.VITE_API;
const MOODS = [
  { key: "steady", label: "Steady", detail: "I feel grounded today", Icon: Shield },
  { key: "hopeful", label: "Hopeful", detail: "I can see some light", Icon: Sun },
  { key: "one_day", label: "One day at a time", detail: "I am taking the next step", Icon: Footprints },
  { key: "difficult", label: "Having a hard day", detail: "Today feels heavy", Icon: CloudRain },
  { key: "support", label: "I could use support", detail: "I do not want to carry this alone", Icon: HeartHandshake },
  { key: "celebrating", label: "Celebrating", detail: "Something good happened", Icon: Sparkles },
];
const MOOD_MAP = Object.fromEntries(MOODS.map((mood) => [mood.key, mood]));

function grovePosition(checkin, index) {
  const seed = Number(checkin.user_id || checkin.checkin_id || index + 1);
  return {
    "--grove-x": `${8 + ((seed * 37 + index * 11) % 84)}%`,
    "--grove-y": `${31 + ((seed * 53 + index * 17) % 55)}%`,
    "--grove-scale": 0.82 + ((seed * 7) % 27) / 100,
    "--grove-delay": `${(seed * 83) % 1700}ms`,
  };
}

function localDate() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

export default function CommunityGrove() {
  const { token, user } = useAuth();
  const { socket } = useMessages();
  const [checkins, setCheckins] = useState([]);
  const [summary, setSummary] = useState({ checkin_count: 0, support_count: 0 });
  const [selectedId, setSelectedId] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [mood, setMood] = useState("hopeful");
  const [note, setNote] = useState("");
  const [openToSupport, setOpenToSupport] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [burst, setBurst] = useState(0);
  const viewerId = Number(user?.user_id || user?.id);
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const checkinDate = useMemo(() => localDate(), []);

  const loadGrove = useCallback(async () => {
    try {
      const response = await fetch(`${API}/api/grove/today?date=${checkinDate}`, { headers });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "The Grove could not be loaded.");
      setCheckins(data.checkins);
      setSummary(data.summary);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [checkinDate, headers]);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API}/api/grove/today?date=${checkinDate}`, { headers })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "The Grove could not be loaded.");
        if (!cancelled) {
          setCheckins(data.checkins);
          setSummary(data.summary);
          setError("");
        }
      })
      .catch((requestError) => { if (!cancelled) setError(requestError.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [checkinDate, headers]);

  useEffect(() => {
    if (!socket) return;
    function onCheckin(updated) {
      setCheckins((current) => {
        const existing = current.find((item) => item.checkin_id === updated.checkin_id);
        if (existing) return current.map((item) => item.checkin_id === updated.checkin_id ? { ...updated, viewer_supported: existing.viewer_supported } : item);
        return [updated, ...current];
      });
    }
    function onSupport(updated) {
      setCheckins((current) => current.map((item) => item.checkin_id === updated.checkin_id ? {
        ...item,
        support_count: updated.support_count,
        viewer_supported: Number(updated.actor_user_id) === viewerId ? updated.supported : item.viewer_supported,
      } : item));
      loadGrove();
    }
    socket.on("grove_checkin_updated", onCheckin);
    socket.on("grove_support_updated", onSupport);
    return () => {
      socket.off("grove_checkin_updated", onCheckin);
      socket.off("grove_support_updated", onSupport);
    };
  }, [loadGrove, socket, viewerId]);

  const myCheckin = checkins.find((checkin) => Number(checkin.user_id) === viewerId);
  const selected = checkins.find((checkin) => checkin.checkin_id === selectedId);

  function openEditor() {
    setMood(myCheckin?.mood || "hopeful");
    setNote(myCheckin?.note || "");
    setOpenToSupport(myCheckin?.open_to_support || false);
    setError("");
    setEditorOpen(true);
  }

  async function saveCheckin(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`${API}/api/grove/check-in`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ mood, note, open_to_support: openToSupport, checkin_date: checkinDate }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Your check-in could not be saved.");
      setCheckins((current) => {
        const exists = current.some((item) => item.checkin_id === data.checkin_id);
        return exists
          ? current.map((item) => item.checkin_id === data.checkin_id ? { ...data, viewer_supported: item.viewer_supported } : item)
          : [data, ...current];
      });
      setSelectedId(data.checkin_id);
      setBurst((current) => current + 1);
      setEditorOpen(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleSupport(checkin) {
    if (Number(checkin.user_id) === viewerId) return;
    try {
      const response = await fetch(`${API}/api/grove/check-ins/${checkin.checkin_id}/support`, { method: "POST", headers });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Support could not be sent.");
      setCheckins((current) => current.map((item) => item.checkin_id === checkin.checkin_id ? { ...item, ...data } : item));
      if (data.supported) setBurst((current) => current + 1);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <main className="community-grove" data-nav-theme="dark">
      <header className="community-grove__intro">
        <div><p><Leaf size={14} /> A shared daily ritual</p><h1>The Grove</h1><span>Check in. Be seen. Leave a little support for someone else.</span></div>
        <button type="button" onClick={openEditor}>{myCheckin ? "Update today’s check-in" : "Enter the Grove"}</button>
      </header>

      <section className="community-grove__world" aria-label="Today’s community check-ins">
        <div className="community-grove__sky-glow" />
        <div className="community-grove__moon"><span /></div>
        <div className="community-grove__stars" />
        <div className="community-grove__hill community-grove__hill--back" />
        <div className="community-grove__hill community-grove__hill--front" />
        <div className="community-grove__trees" aria-hidden="true">{Array.from({ length: 13 }, (_, index) => <i key={index} style={{ left: `${index * 8.1}%`, bottom: `${(index % 3) * 7}px`, "--tree-scale": .75 + (index % 4) * .12, "--tree-rotate": `${(index % 2) * 8}deg` }} />)}</div>
        <div className="community-grove__fireflies" aria-hidden="true">{Array.from({ length: 15 }, (_, index) => <i key={index} style={{ left: `${(index * 29) % 97}%`, top: `${24 + ((index * 17) % 62)}%`, "--fly-duration": `${5 + (index % 5)}s`, "--fly-delay": `${index * -430}ms` }} />)}</div>

        <aside className="community-grove__summary">
          <span><strong>{checkins.length}</strong><small>checked in today</small></span>
          <span><strong>{summary.support_count}</strong><small>moments of support</small></span>
        </aside>

        <div className="community-grove__spirits">
          {checkins.map((checkin, index) => {
            const moodInfo = MOOD_MAP[checkin.mood] || MOODS[0];
            return (
              <button
                type="button"
                key={checkin.checkin_id}
                className={`community-grove__spirit mood-${checkin.mood} ${selectedId === checkin.checkin_id ? "is-selected" : ""} ${Number(checkin.user_id) === viewerId ? "is-mine" : ""}`}
                style={grovePosition(checkin, index)}
                onClick={() => setSelectedId((current) => current === checkin.checkin_id ? null : checkin.checkin_id)}
                aria-label={`${checkin.username} checked in feeling ${moodInfo.label}`}
              >
                <span className="community-grove__spirit-orb"><i /></span>
                <span className="community-grove__spirit-stem" />
                <small>{checkin.username}</small>
              </button>
            );
          })}
        </div>

        {loading && <div className="community-grove__world-message">The Grove is waking up…</div>}
        {!loading && checkins.length === 0 && <button className="community-grove__world-message is-empty" type="button" onClick={openEditor}>Be the first light in today’s Grove.</button>}
        {burst > 0 && <div className="community-grove__heart-burst" key={burst} aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <Heart key={index} style={{ "--heart": index }} />)}</div>}

        {selected && (
          <article className="community-grove__card">
            <button type="button" onClick={() => setSelectedId(null)} aria-label="Close check-in"><X size={17} /></button>
            <div className="community-grove__card-person"><MemberAvatar username={selected.username} avatarUrl={selected.avatar_url} size={45} /><span><strong>{selected.username}</strong><small>{MOOD_MAP[selected.mood]?.label}</small></span></div>
            {selected.note && <blockquote>“{selected.note}”</blockquote>}
            {selected.open_to_support && <p><HeartHandshake size={15} /> Welcoming extra support today</p>}
            <footer>
              {Number(selected.user_id) === viewerId ? <button type="button" onClick={openEditor}>Update my check-in</button> : <button type="button" className={selected.viewer_supported ? "is-supported" : ""} onClick={() => toggleSupport(selected)}><Heart size={16} fill={selected.viewer_supported ? "currentColor" : "none"} />{selected.viewer_supported ? "Support sent" : "Send support"}</button>}
              <span>{selected.support_count || 0} supporting</span>
            </footer>
          </article>
        )}
      </section>

      <section className="community-grove__meaning"><p>The Grove changes because people show up.</p><h2>No scores. No rankings. Just a visible reminder that none of us is doing this alone.</h2></section>
      {error && !editorOpen && <p className="community-grove__error" role="alert">{error}</p>}

      {editorOpen && (
        <div className="grove-checkin-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setEditorOpen(false); }}>
          <form className="grove-checkin" onSubmit={saveCheckin}>
            <header><div><p>Today’s check-in</p><h2>How are you arriving?</h2><span>Your choice will become a light in the shared Grove.</span></div><button type="button" onClick={() => setEditorOpen(false)} disabled={saving} aria-label="Close check-in"><X /></button></header>
            <div className="grove-checkin__moods">{MOODS.map((option) => {
              const MoodIcon = option.Icon;
              return <button type="button" key={option.key} className={mood === option.key ? "is-selected" : ""} onClick={() => { setMood(option.key); if (option.key === "support") setOpenToSupport(true); }}><MoodIcon size={21} /><span><strong>{option.label}</strong><small>{option.detail}</small></span></button>;
            })}</div>
            <label className="grove-checkin__note"><span>Leave a note <small>optional · visible to approved members</small></span><textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength="180" rows="3" placeholder="A sentence is enough…" /><small>{note.length}/180</small></label>
            <label className="grove-checkin__support"><input type="checkbox" checked={openToSupport} onChange={(event) => setOpenToSupport(event.target.checked)} /><span><strong>I welcome extra support today</strong><small>Members will see a gentle support marker on your check-in.</small></span></label>
            {mood === "support" && <p className="grove-checkin__safety">The Grove offers peer connection, but it is not an emergency or crisis-response service.</p>}
            {error && <p className="grove-checkin__error" role="alert">{error}</p>}
            <footer><button type="button" onClick={() => setEditorOpen(false)} disabled={saving}>Cancel</button><button type="submit" disabled={saving}>{saving ? "Joining the Grove…" : myCheckin ? "Update my light" : "Add my light"}</button></footer>
          </form>
        </div>
      )}
    </main>
  );
}
