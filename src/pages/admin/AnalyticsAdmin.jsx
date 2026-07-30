import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Activity, Eye, LogIn, MapPin, MonitorSmartphone, Users } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import "./AnalyticsAdmin.css";

const API = import.meta.env.VITE_API;
const PAGE_LABELS = {
  home: "Home", login: "Login", register: "Registration", verify_email: "Email verification",
  stories: "Stories", community: "Community", guidelines: "Guidelines", contact: "Contact",
  discount_links: "Discount links", about: "About", resources: "Resources", faq: "FAQ",
  forum: "Forum", forum_thread: "Forum conversation", messages: "Messages", profile: "Profile",
  admin_membership: "Admissions", admin_users: "User management",
  admin_forum_flags: "Flagged content", admin_stats: "Stats",
};

function dateInputValue(date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function presetRange(period) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  if (period === "7d") start.setDate(start.getDate() - 6);
  if (period === "30d") start.setDate(start.getDate() - 29);
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

async function readJson(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Could not load analytics.");
  return data;
}

function eventLabel(event) {
  if (event.event_type === "page_view") return `Viewed ${PAGE_LABELS[event.page_key] || event.page_key}`;
  return event.event_type === "login" ? "Logged in" : "Logged out";
}

function locationLabel(event) {
  return [event.region, event.country_code].filter(Boolean).join(", ") || "Unknown";
}

function EventCard({ event }) {
  return (
    <article className="analytics-event-card">
      <div><strong>{event.username || "Anonymous"}</strong><span>{eventLabel(event)}</span></div>
      <dl>
        <div><dt>Time</dt><dd>{new Date(event.created_at).toLocaleString()}</dd></div>
        <div><dt>Device</dt><dd>{event.device_type}</dd></div>
        <div><dt>Location</dt><dd>{locationLabel(event)}</dd></div>
      </dl>
    </article>
  );
}

export default function AnalyticsAdmin() {
  const { token } = useAuth();
  const [period, setPeriod] = useState("30d");
  const [customStart, setCustomStart] = useState(() => dateInputValue(new Date(Date.now() - 29 * 86_400_000)));
  const [customEnd, setCustomEnd] = useState(() => dateInputValue(new Date()));
  const [eventType, setEventType] = useState("");
  const [summary, setSummary] = useState(null);
  const [events, setEvents] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const sentinelRef = useRef(null);
  const loadMoreControllerRef = useRef(null);

  const range = useMemo(() => {
    if (period !== "custom") return presetRange(period);
    const start = new Date(`${customStart}T00:00:00`);
    const end = new Date(`${customEnd}T00:00:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
      return presetRange("30d");
    }
    end.setDate(end.getDate() + 1);
    return { start: start.toISOString(), end: end.toISOString() };
  }, [period, customStart, customEnd]);

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const queryString = useCallback((before = null) => {
    const params = new URLSearchParams({ start: range.start, end: range.end });
    if (eventType) params.set("type", eventType);
    if (before) params.set("before", String(before));
    return params.toString();
  }, [range, eventType]);

  useEffect(() => {
    loadMoreControllerRef.current?.abort();
    const controller = new AbortController();

    // OWNER STATS TRACE STEP 1: Date/type changes request fresh summary data
    // and the first 20 event rows from the owner-only server endpoints.
    Promise.all([
      fetch(`${API}/api/analytics/admin/summary?${queryString()}`, { headers, signal: controller.signal }).then(readJson),
      fetch(`${API}/api/analytics/admin/events?${queryString()}`, { headers, signal: controller.signal }).then(readJson),
    ]).then(([summaryData, eventData]) => {
      setError("");
      setSummary(summaryData);
      setEvents(eventData.events);
      setCursor(eventData.nextCursor);
      setHasMore(eventData.hasMore);
    }).catch((requestError) => {
      if (requestError.name !== "AbortError") setError(requestError.message);
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [headers, queryString]);

  const loadMore = useCallback(async () => {
    if (!hasMore || !cursor || loadingMore) return;
    const controller = new AbortController();
    loadMoreControllerRef.current = controller;
    setLoadingMore(true);
    try {
      const data = await fetch(`${API}/api/analytics/admin/events?${queryString(cursor)}`, {
        headers,
        signal: controller.signal,
      }).then(readJson);
      setEvents((current) => [...current, ...data.events]);
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (requestError) {
      if (requestError.name !== "AbortError") setError(requestError.message);
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, hasMore, headers, loadingMore, queryString]);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: "280px" }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMore]);

  const deviceTotal = summary?.devices.reduce((total, item) => total + item.sessions, 0) || 0;
  const largestPageCount = summary?.pages[0]?.views || 1;

  return (
    <main className="analytics-admin">
      <header className="analytics-hero">
        <span>Owner tools</span>
        <h1>Community stats</h1>
        <p>A privacy-conscious view of visits, logins, devices, and general location.</p>
      </header>

      <section className="analytics-filters" aria-label="Analytics date range">
        <div className="analytics-presets">
          {[['today', 'Today'], ['7d', '7 days'], ['30d', '30 days'], ['custom', 'Custom']].map(([value, label]) => (
            <button key={value} type="button" className={period === value ? "is-active" : ""} onClick={() => setPeriod(value)}>{label}</button>
          ))}
        </div>
        {period === "custom" && (
          <div className="analytics-custom-dates">
            <label>From<input type="date" value={customStart} max={customEnd} onChange={(event) => setCustomStart(event.target.value)} /></label>
            <label>Through<input type="date" value={customEnd} min={customStart} onChange={(event) => setCustomEnd(event.target.value)} /></label>
          </div>
        )}
      </section>

      {error && <p className="analytics-error" role="alert">{error}</p>}
      {loading && <div className="analytics-loading">Loading community activity…</div>}

      {!loading && summary && (
        <>
          <section className="analytics-cards" aria-label="Analytics summary">
            <article><LogIn /><span>Successful logins</span><strong>{summary.totals.logins}</strong></article>
            <article><Users /><span>Unique members</span><strong>{summary.totals.unique_members}</strong></article>
            <article><Eye /><span>Page views</span><strong>{summary.totals.page_views}</strong></article>
            <article><Activity /><span>Anonymous sessions</span><strong>{summary.totals.anonymous_sessions}</strong></article>
          </section>

          <section className="analytics-grid">
            <article className="analytics-panel">
              <div className="analytics-panel__heading"><div><Eye /><span><strong>Most visited pages</strong><small>Named main pages only</small></span></div></div>
              <div className="analytics-bars">
                {summary.pages.map((page) => <div key={page.page_key}><span>{PAGE_LABELS[page.page_key] || page.page_key}</span><div><i style={{ width: `${(page.views / largestPageCount) * 100}%` }} /></div><strong>{page.views}</strong></div>)}
                {!summary.pages.length && <p>No page views in this period.</p>}
              </div>
            </article>

            <article className="analytics-panel">
              <div className="analytics-panel__heading"><div><MonitorSmartphone /><span><strong>Device use</strong><small>Unique sessions</small></span></div></div>
              <div className="analytics-device-list">
                {summary.devices.map((device) => <div key={device.device_type}><span>{device.device_type}</span><strong>{deviceTotal ? Math.round((device.sessions / deviceTotal) * 100) : 0}%</strong><small>{device.sessions} sessions</small></div>)}
                {!summary.devices.length && <p>No device activity in this period.</p>}
              </div>
            </article>

            <article className="analytics-panel analytics-panel--wide">
              <div className="analytics-panel__heading"><div><MapPin /><span><strong>General location</strong><small>Country and state/region only</small></span></div></div>
              <div className="analytics-location-list">
                {summary.locations.map((location, index) => <div key={`${location.country_code}-${location.region || index}`}><span>{[location.region, location.country_code].filter(Boolean).join(", ")}</span><strong>{location.sessions} sessions</strong></div>)}
                {!summary.locations.length && <p>No general location data in this period.</p>}
              </div>
            </article>
          </section>

          <section className="analytics-history">
            <div className="analytics-history__heading"><div><span>Full event history</span><h2>Behind the scenes</h2></div><label>Event type<select value={eventType} onChange={(event) => setEventType(event.target.value)}><option value="">All events</option><option value="login">Logins</option><option value="logout">Logouts</option><option value="page_view">Page views</option></select></label></div>

            <div className="analytics-table-wrap"><table><thead><tr><th>Time</th><th>Member</th><th>Event</th><th>Device</th><th>Location</th></tr></thead><tbody>{events.map((event) => <tr key={event.event_id}><td>{new Date(event.created_at).toLocaleString()}</td><td>{event.username || "Anonymous"}</td><td>{eventLabel(event)}</td><td>{event.device_type}</td><td>{locationLabel(event)}</td></tr>)}</tbody></table></div>
            <div className="analytics-mobile-events">{events.map((event) => <EventCard key={event.event_id} event={event} />)}</div>
            {!events.length && <p className="analytics-empty">No events match these filters.</p>}
            <div ref={sentinelRef} className="analytics-sentinel" aria-hidden="true" />
            {loadingMore && <p className="analytics-load-more">Loading 20 more events…</p>}
            {!hasMore && events.length > 0 && <p className="analytics-load-more">You’ve reached the beginning of this activity.</p>}
          </section>
        </>
      )}
    </main>
  );
}
