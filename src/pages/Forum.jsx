import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Bookmark,
  BookOpen,
  Check,
  Coffee,
  HeartHandshake,
  Leaf,
  LayoutGrid,
  LifeBuoy,
  Lock,
  MessageCircle,
  Pin,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Trophy,
  User,
  UsersRound,
  X,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import "./Forum.css";

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

function CategoryGlyph({ name, size = 15 }) {
  const normalizedName = name?.toLowerCase() || "";
  if (normalizedName.includes("introduction")) return <User size={size} />;
  if (normalizedName.includes("cannabis")) return <Leaf size={size} />;
  if (normalizedName.includes("success") || normalizedName.includes("milestone")) return <Trophy size={size} />;
  if (normalizedName.includes("question") || normalizedName.includes("support")) return <HeartHandshake size={size} />;
  if (normalizedName.includes("family") || normalizedName.includes("friend")) return <UsersRound size={size} />;
  if (normalizedName.includes("resource")) return <BookOpen size={size} />;
  if (normalizedName.includes("off topic")) return <Coffee size={size} />;
  return <LifeBuoy size={size} />;
}

function PostCard({ post }) {
  return (
    <Link to={`/forum/${post.post_id}`} className={`forum-post-card ${post.pinned ? "is-pinned" : ""}`}>
      <div className="forum-category-icon" aria-hidden="true"><CategoryGlyph name={post.category_name} size={19} /></div>
      <div className="forum-post-copy">
        <div className="forum-post-meta">
          <span className="forum-category-pill">{post.category_name}</span>
          {post.pinned && <span className="forum-state forum-state--pinned"><Pin size={12} /> Pinned</span>}
          {post.locked && <span className="forum-state"><Lock size={12} /> Locked</span>}
          {isNew(post.created_at) && <span className="forum-state forum-state--new"><Sparkles size={12} /> New</span>}
        </div>
        <h3>{post.title}</h3>
        <p>{post.body}</p>
      </div>
      <div className="forum-post-author">
        <div className="forum-avatar forum-avatar--small">{initials(post.author_username)}</div>
        <span>{post.author_username}</span>
      </div>
      <div className="forum-reply-count">
        <MessageCircle size={17} />
        <strong>{post.comment_count}</strong>
      </div>
      <time className="forum-post-activity">{timeAgo(post.latest_activity_at)}</time>
    </Link>
  );
}

export default function Forum() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
  const [showLoginWelcome, setShowLoginWelcome] = useState(() => Boolean(location.state?.justLoggedIn));

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  useEffect(() => {
    if (!showLoginWelcome) return;
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    const id = setTimeout(() => setShowLoginWelcome(false), 4000);
    return () => clearTimeout(id);
  }, [showLoginWelcome, navigate, location.pathname, location.search]);

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
    let base = posts;
    if (sort === "mine") base = posts.filter((post) => post.author_id === user?.id);
    if (sort === "saved") base = posts.filter((post) => post.saved_by_me);
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
    <main className="forum-shell">
      {showLoginWelcome && (
        <div className="forum-login-welcome" role="status">
          <Check size={16} /> Welcome back, {user?.username || "friend"}. You&rsquo;re logged in.
        </div>
      )}
      <section className="forum-hero">
        <div className="forum-hero__copy">
          <p className="forum-eyebrow">Private member community</p>
          <h1>Community Forum</h1>
          <p>A safe place to share, listen, and support each other. You don&rsquo;t have to have the perfect words.</p>
          <Link to="/resources" className="forum-resources-link">
            <LifeBuoy size={15} /> Need support right now? Visit Resources
          </Link>
        </div>
        <button className="forum-primary-button" onClick={openComposer}>
          <Plus size={18} /> Start a conversation
        </button>
      </section>

      <div className="forum-layout">
        <section className="forum-feed">
          <div className="forum-toolbar">
            <label className="forum-search">
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
            <div className="forum-sort" role="group" aria-label="Sort conversations">
              <button className={sort === "recent" ? "is-active" : ""} onClick={() => setSort("recent")}>
                Recent activity
              </button>
              <button className={sort === "discussed" ? "is-active" : ""} onClick={() => setSort("discussed")}>
                <TrendingUp size={13} /> Most discussed
              </button>
              <button className={sort === "mine" ? "is-active" : ""} onClick={() => setSort("mine")}>
                <User size={13} /> My posts
              </button>
              <button className={sort === "saved" ? "is-active" : ""} onClick={() => setSort("saved")}>
                <Bookmark size={13} /> Saved
              </button>
            </div>
          </div>

          <div className="forum-feed-heading">
            <div>
              <p className="forum-eyebrow">Conversations</p>
              <h2>{sort === "mine" ? "Your posts" : sort === "saved" ? "Saved posts" : categories.find((category) => category.slug === activeCategory)?.name || "Recent activity"}</h2>
            </div>
            <span>{visibleCount} {visibleCount === 1 ? "post" : "posts"}</span>
          </div>

          {error && <p className="forum-error" role="alert">{error}</p>}

          {loading && (
            <div className="forum-skeleton-list" aria-hidden="true">
              {[0, 1, 2].map((i) => <div className="forum-skeleton-card" key={i} />)}
            </div>
          )}

          {!loading && !error && visibleCount === 0 && sort === "mine" && (
            <div className="forum-empty">
              <User size={28} />
              <h3>You haven&rsquo;t posted here yet.</h3>
              <p>Whenever you start a conversation, it will show up in this view.</p>
              <button onClick={openComposer}>Start a conversation</button>
            </div>
          )}

          {!loading && !error && visibleCount === 0 && sort === "saved" && (
            <div className="forum-empty">
              <Bookmark size={28} />
              <h3>Nothing saved yet.</h3>
              <p>Save a post from its page to find it here later.</p>
            </div>
          )}

          {!loading && !error && visibleCount === 0 && sort !== "mine" && sort !== "saved" && hasFilters && (
            <div className="forum-empty">
              <Search size={28} />
              <h3>Nothing matches yet.</h3>
              <p>Try a different word, or clear your filters and browse by space.</p>
              <button onClick={() => { setSearchInput(""); setSearchParams({}); }}>Clear filters</button>
            </div>
          )}

          {!loading && !error && visibleCount === 0 && sort !== "mine" && sort !== "saved" && !hasFilters && (
            <div className="forum-empty">
              <MessageCircle size={28} />
              <h3>Be the first to start something here.</h3>
              <p>A thoughtful question or honest update is enough.</p>
              <button onClick={openComposer}>Start a conversation</button>
            </div>
          )}

          {!loading && !error && visibleCount > 0 && (
            <>
              {pinnedPosts.length > 0 && (
                <div className="forum-pinned-group">
                  <div className="forum-pinned-heading">
                    <h2><Pin size={16} /> Pinned conversations</h2>
                    <span>{pinnedPosts.length}</span>
                  </div>
                  <div className="forum-post-list">
                    {pinnedPosts.map((post) => <PostCard post={post} key={post.post_id} />)}
                  </div>
                </div>
              )}
              <div className="forum-post-list">
                {regularPosts.map((post) => <PostCard post={post} key={post.post_id} />)}
              </div>
            </>
          )}
        </section>

        <aside className="forum-sidebar">
          <section className="forum-categories" aria-label="Forum categories">
            <div className="forum-section-heading">
              <p>Browse categories</p>
              <span>{categories.length}</span>
            </div>
            <button
              className={`forum-category ${activeCategory === "" ? "is-active" : ""}`}
              onClick={() => setSearchParams(search ? { search } : {})}
            >
              <span className="forum-category__copy">
                <i className="forum-category__icon" aria-hidden="true"><LayoutGrid size={15} /></i>
                <span><strong>All conversations</strong><small>Everything happening now</small></span>
              </span>
              <b>{totalPostCount}</b>
            </button>
            {categories.map((category) => (
              <button
                key={category.category_id}
                className={`forum-category ${activeCategory === category.slug ? "is-active" : ""}`}
                onClick={() => setSearchParams(search ? { category: category.slug, search } : { category: category.slug })}
              >
                <span className="forum-category__copy">
                  <i className="forum-category__icon" aria-hidden="true">
                    <CategoryGlyph name={category.name} />
                  </i>
                  <span><strong>{category.name}</strong><small>{category.description}</small></span>
                </span>
                <b>{category.post_count}</b>
              </button>
            ))}
          </section>

          <section className="forum-guidelines-card">
            <div className="forum-guidelines-card__title">
              <ShieldCheck size={19} />
              <h2>Community guidelines</h2>
            </div>
            <p>We&rsquo;re here to support one another with respect, compassion, and honesty.</p>
            <ul>
              <li><Check size={13} /> Be kind and respectful</li>
              <li><Check size={13} /> Share from your own experience</li>
              <li><Check size={13} /> Protect privacy and confidentiality</li>
            </ul>
            <Link to="/guidelines">Read the full guidelines <span aria-hidden="true">&rarr;</span></Link>
          </section>
        </aside>
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
