import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, MessageCircle, Pin, Plus, X } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import "./Forum.css";

const API = import.meta.env.VITE_API;

function timeAgo(value) {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function initials(username) {
  return username?.slice(0, 2).toUpperCase() || "?";
}

export default function Forum() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "";
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState({ category_id: "", title: "", body: "" });

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  useEffect(() => {
    async function loadCategories() {
      const response = await fetch(`${API}/api/forum/categories`, { headers });
      if (!response.ok) throw new Error("Could not load forum categories.");
      setCategories(await response.json());
    }
    loadCategories().catch((err) => setError(err.message));
  }, [headers]);

  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      setError("");
      const query = activeCategory ? `?category=${encodeURIComponent(activeCategory)}` : "";
      const response = await fetch(`${API}/api/forum/posts${query}`, { headers });
      if (!response.ok) throw new Error("Could not load conversations.");
      setPosts(await response.json());
      setLoading(false);
    }
    loadPosts().catch((err) => {
      setError(err.message);
      setLoading(false);
    });
  }, [activeCategory, headers]);

  function openComposer() {
    const selected = categories.find((category) => category.slug === activeCategory);
    setDraft((current) => ({
      ...current,
      category_id: selected?.category_id ? String(selected.category_id) : current.category_id,
    }));
    setError("");
    setComposerOpen(true);
  }

  async function createPost(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const response = await fetch(`${API}/api/forum/posts`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ ...draft, category_id: Number(draft.category_id) }),
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result.message || "Could not publish that post.");
      setSubmitting(false);
      return;
    }

    navigate(`/forum/${result.post_id}`);
  }

  return (
    <main className="forum-shell">
      <section className="forum-hero">
        <div>
          <p className="forum-eyebrow">Private member community</p>
          <h1>Welcome back, {user?.username || "friend"}.</h1>
          <p>Share what is real, ask what you need, and leave something useful for the next person.</p>
        </div>
        <button className="forum-primary-button" onClick={openComposer}>
          <Plus size={18} /> Start a conversation
        </button>
      </section>

      <div className="forum-layout">
        <aside className="forum-categories" aria-label="Forum categories">
          <div className="forum-section-heading">
            <p>Spaces</p>
            <span>{categories.length}</span>
          </div>
          <button
            className={`forum-category ${activeCategory === "" ? "is-active" : ""}`}
            onClick={() => setSearchParams({})}
          >
            <span><strong>All conversations</strong><small>Everything happening now</small></span>
          </button>
          {categories.map((category) => (
            <button
              key={category.category_id}
              className={`forum-category ${activeCategory === category.slug ? "is-active" : ""}`}
              onClick={() => setSearchParams({ category: category.slug })}
            >
              <span><strong>{category.name}</strong><small>{category.description}</small></span>
              <b>{category.post_count}</b>
            </button>
          ))}
        </aside>

        <section className="forum-feed">
          <div className="forum-feed-heading">
            <div>
              <p className="forum-eyebrow">Conversations</p>
              <h2>{categories.find((category) => category.slug === activeCategory)?.name || "Recent activity"}</h2>
            </div>
            <span>{posts.length} {posts.length === 1 ? "post" : "posts"}</span>
          </div>

          {error && <p className="forum-error" role="alert">{error}</p>}
          {loading && <div className="forum-empty">Loading conversations…</div>}
          {!loading && !error && posts.length === 0 && (
            <div className="forum-empty">
              <MessageCircle size={28} />
              <h3>Be the first to start something here.</h3>
              <p>A thoughtful question or honest update is enough.</p>
              <button onClick={openComposer}>Start a conversation</button>
            </div>
          )}

          <div className="forum-post-list">
            {posts.map((post) => (
              <Link to={`/forum/${post.post_id}`} className="forum-post-card" key={post.post_id}>
                <div className="forum-avatar">{initials(post.author_username)}</div>
                <div className="forum-post-copy">
                  <div className="forum-post-meta">
                    <span className="forum-category-pill">{post.category_name}</span>
                    {post.pinned && <span className="forum-state"><Pin size={13} /> Pinned</span>}
                    {post.locked && <span className="forum-state"><Lock size={13} /> Locked</span>}
                  </div>
                  <h3>{post.title}</h3>
                  <p>{post.body}</p>
                  <div className="forum-post-byline">
                    <span>by {post.author_username}</span>
                    <i />
                    <span>{timeAgo(post.latest_activity_at)}</span>
                  </div>
                </div>
                <div className="forum-reply-count">
                  <MessageCircle size={18} />
                  <strong>{post.comment_count}</strong>
                  <span>{post.comment_count === 1 ? "reply" : "replies"}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {composerOpen && (
        <div className="forum-modal-backdrop" role="presentation" onMouseDown={() => setComposerOpen(false)}>
          <section className="forum-composer" role="dialog" aria-modal="true" aria-labelledby="new-post-title" onMouseDown={(e) => e.stopPropagation()}>
            <button className="forum-modal-close" onClick={() => setComposerOpen(false)} aria-label="Close"><X /></button>
            <p className="forum-eyebrow">New conversation</p>
            <h2 id="new-post-title">What would you like to share?</h2>
            <form onSubmit={createPost}>
              <label>Space
                <select required value={draft.category_id} onChange={(e) => setDraft({ ...draft, category_id: e.target.value })}>
                  <option value="">Choose a space</option>
                  {categories.map((category) => <option key={category.category_id} value={category.category_id}>{category.name}</option>)}
                </select>
              </label>
              <label>Title
                <input required maxLength={180} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Give the conversation a clear title" />
              </label>
              <label>Message
                <textarea required rows={8} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} placeholder="You do not have to have the perfect words." />
              </label>
              {error && <p className="forum-error" role="alert">{error}</p>}
              <div className="forum-composer-actions">
                <button type="button" className="forum-secondary-button" onClick={() => setComposerOpen(false)}>Cancel</button>
                <button className="forum-primary-button" disabled={submitting}>{submitting ? "Publishing…" : "Publish post"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
