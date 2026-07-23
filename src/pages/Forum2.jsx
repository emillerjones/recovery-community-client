import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  LifeBuoy,
  Lock,
  MessageCircle,
  Pin,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import "./Forum2.css";

const API = import.meta.env.VITE_API;
const SEARCH_DEBOUNCE_MS = 350;
const NEW_WINDOW_MS = 24 * 60 * 60 * 1000;

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

function isNew(value) {
  return Date.now() - new Date(value).getTime() < NEW_WINDOW_MS;
}

function PostCard({ post }) {
  return (
    <Link to={`/forum/${post.post_id}`} className={`f2-post-card ${post.pinned ? "is-pinned" : ""}`}>
      <div className="f2-avatar">{initials(post.author_username)}</div>
      <div className="f2-post-copy">
        <div className="f2-post-meta">
          <span className="f2-category-pill">{post.category_name}</span>
          {post.pinned && <span className="f2-state f2-state--pinned"><Pin size={12} /> Pinned</span>}
          {post.locked && <span className="f2-state"><Lock size={12} /> Locked</span>}
          {isNew(post.created_at) && <span className="f2-state f2-state--new"><Sparkles size={12} /> New</span>}
        </div>
        <h3>{post.title}</h3>
        <p>{post.body}</p>
        <div className="f2-post-byline">
          <span>{post.author_username}</span>
          <i />
          <span>{timeAgo(post.latest_activity_at)}</span>
        </div>
      </div>
      <div className="f2-reply-count">
        <MessageCircle size={17} />
        <strong>{post.comment_count}</strong>
        <span>{post.comment_count === 1 ? "reply" : "replies"}</span>
      </div>
    </Link>
  );
}

export default function Forum2() {
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
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent");

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

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
      const params = new URLSearchParams();
      if (activeCategory) params.set("category", activeCategory);
      if (search) params.set("search", search);
      const query = params.toString() ? `?${params.toString()}` : "";
      const response = await fetch(`${API}/api/forum/posts${query}`, { headers });
      if (!response.ok) throw new Error("Could not load conversations.");
      setPosts(await response.json());
      setLoading(false);
    }
    loadPosts().catch((err) => {
      setError(err.message);
      setLoading(false);
    });
  }, [activeCategory, search, headers]);

  useEffect(() => {
    if (!composerOpen) return;
    function onKeyDown(event) {
      if (event.key === "Escape") setComposerOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [composerOpen]);

  const { pinnedPosts, regularPosts } = useMemo(() => {
    const base = sort === "mine" ? posts.filter((post) => post.author_id === user?.id) : posts;
    const sorted = [...base].sort((a, b) => {
      if (sort === "discussed") return b.comment_count - a.comment_count;
      return new Date(b.latest_activity_at) - new Date(a.latest_activity_at);
    });
    return {
      pinnedPosts: sorted.filter((post) => post.pinned),
      regularPosts: sorted.filter((post) => !post.pinned),
    };
  }, [posts, sort, user?.id]);

  const totalPostCount = useMemo(
    () => categories.reduce((sum, category) => sum + category.post_count, 0),
    [categories]
  );

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

  const hasFilters = Boolean(activeCategory || search);
  const visibleCount = pinnedPosts.length + regularPosts.length;

  return (
    <main className="f2-shell">
      <section className="f2-hero">
        <div>
          <p className="f2-eyebrow">Private member community</p>
          <h1>Welcome back, {user?.username || "friend"}.</h1>
          <p>Share what is real, ask what you need, and leave something useful for the next person.</p>
          <Link to="/resources" className="f2-resources-link">
            <LifeBuoy size={15} /> Need support right now? Visit Resources
          </Link>
        </div>
        <button className="f2-primary-button" onClick={openComposer}>
          <Plus size={18} /> Start a conversation
        </button>
      </section>

      <div className="f2-layout">
        <aside className="f2-categories" aria-label="Forum categories">
          <div className="f2-section-heading">
            <p>Spaces</p>
            <span>{categories.length}</span>
          </div>
          <button
            className={`f2-category ${activeCategory === "" ? "is-active" : ""}`}
            onClick={() => setSearchParams(search ? { search } : {})}
          >
            <span><strong>All conversations</strong><small>Everything happening now</small></span>
            <b>{totalPostCount}</b>
          </button>
          {categories.map((category) => (
            <button
              key={category.category_id}
              className={`f2-category ${activeCategory === category.slug ? "is-active" : ""}`}
              onClick={() => setSearchParams(search ? { category: category.slug, search } : { category: category.slug })}
            >
              <span><strong>{category.name}</strong><small>{category.description}</small></span>
              <b>{category.post_count}</b>
            </button>
          ))}
        </aside>

        <section className="f2-feed">
          <button type="button" className="f2-composer-bar" onClick={openComposer}>
            <div className="f2-avatar">{initials(user?.username)}</div>
            <span>What&rsquo;s on your mind, {user?.username || "friend"}?</span>
          </button>

          <div className="f2-toolbar">
            <label className="f2-search">
              <Search size={16} />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search titles and posts…"
                aria-label="Search conversations"
              />
              {searchInput && (
                <button type="button" aria-label="Clear search" onClick={() => setSearchInput("")}>
                  <X size={14} />
                </button>
              )}
            </label>
            <div className="f2-sort" role="group" aria-label="Sort conversations">
              <button className={sort === "recent" ? "is-active" : ""} onClick={() => setSort("recent")}>
                Recent activity
              </button>
              <button className={sort === "discussed" ? "is-active" : ""} onClick={() => setSort("discussed")}>
                <TrendingUp size={13} /> Most discussed
              </button>
              <button className={sort === "mine" ? "is-active" : ""} onClick={() => setSort("mine")}>
                <User size={13} /> My posts
              </button>
            </div>
          </div>

          <div className="f2-feed-heading">
            <div>
              <p className="f2-eyebrow">Conversations</p>
              <h2>{sort === "mine" ? "Your posts" : categories.find((category) => category.slug === activeCategory)?.name || "Recent activity"}</h2>
            </div>
            <span>{visibleCount} {visibleCount === 1 ? "post" : "posts"}</span>
          </div>

          {error && <p className="f2-error" role="alert">{error}</p>}

          {loading && (
            <div className="f2-skeleton-list" aria-hidden="true">
              {[0, 1, 2].map((i) => <div className="f2-skeleton-card" key={i} />)}
            </div>
          )}

          {!loading && !error && visibleCount === 0 && sort === "mine" && (
            <div className="f2-empty">
              <User size={28} />
              <h3>You haven&rsquo;t posted here yet.</h3>
              <p>Whenever you start a conversation, it will show up in this view.</p>
              <button onClick={openComposer}>Start a conversation</button>
            </div>
          )}

          {!loading && !error && visibleCount === 0 && sort !== "mine" && hasFilters && (
            <div className="f2-empty">
              <Search size={28} />
              <h3>Nothing matches yet.</h3>
              <p>Try a different word, or clear your filters and browse by space.</p>
              <button onClick={() => { setSearchInput(""); setSearchParams({}); }}>Clear filters</button>
            </div>
          )}

          {!loading && !error && visibleCount === 0 && sort !== "mine" && !hasFilters && (
            <div className="f2-empty">
              <MessageCircle size={28} />
              <h3>Be the first to start something here.</h3>
              <p>A thoughtful question or honest update is enough.</p>
              <button onClick={openComposer}>Start a conversation</button>
            </div>
          )}

          {!loading && !error && visibleCount > 0 && (
            <>
              {pinnedPosts.length > 0 && (
                <div className="f2-pinned-group">
                  <p className="f2-pinned-label"><Pin size={13} /> Pinned</p>
                  <div className="f2-post-list">
                    {pinnedPosts.map((post) => <PostCard post={post} key={post.post_id} />)}
                  </div>
                </div>
              )}
              <div className="f2-post-list">
                {regularPosts.map((post) => <PostCard post={post} key={post.post_id} />)}
              </div>
            </>
          )}
        </section>
      </div>

      {composerOpen && (
        <div className="f2-modal-backdrop" role="presentation" onMouseDown={() => setComposerOpen(false)}>
          <section className="f2-composer" role="dialog" aria-modal="true" aria-labelledby="new-post-title" onMouseDown={(e) => e.stopPropagation()}>
            <button className="f2-modal-close" onClick={() => setComposerOpen(false)} aria-label="Close"><X /></button>
            <p className="f2-eyebrow">New conversation</p>
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
              {error && <p className="f2-error" role="alert">{error}</p>}
              <div className="f2-composer-actions">
                <button type="button" className="f2-secondary-button" onClick={() => setComposerOpen(false)}>Cancel</button>
                <button className="f2-primary-button" disabled={submitting}>{submitting ? "Publishing…" : "Publish post"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
