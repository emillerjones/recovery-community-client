import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Bookmark,
  Check,
  Flame,
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
  Users,
  User,
  X,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import MentionTextarea from "../components/MentionTextarea";
import MemberAvatar from "../components/MemberAvatar";
import ForumCategoryGlyph from "../components/ForumCategoryGlyph";
import "./Forum2.css";

const API = import.meta.env.VITE_API;
const SEARCH_DEBOUNCE_MS = 350;
const NEW_WINDOW_MS = 24 * 60 * 60 * 1000;

// Every category gets a stable accent color derived from its name, so the
// same category always reads the same color without hand-maintaining a map.
const ACCENTS = ["#3f6a4c", "#a3742c", "#5c6fa0", "#a3564f", "#5c8a86", "#8a6aa3"];
function accentFor(name) {
  const hash = [...(name || "")].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return ACCENTS[hash % ACCENTS.length];
}

function timeAgo(value) {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function isNew(value) {
  return Date.now() - new Date(value).getTime() < NEW_WINDOW_MS;
}

function PostTile({ post }) {
  return (
    <Link to={`/forum/${post.post_id}`} className={`f2-tile ${post.pinned ? "is-pinned" : ""}`} style={{ "--accent": accentFor(post.category_name) }}>
      <div className="f2-tile__rail" aria-hidden="true" />
      <div className="f2-tile__body">
        <div className="f2-tile__meta">
          <span className="f2-tile__category"><ForumCategoryGlyph name={post.category_name} size={12} /> {post.category_name}</span>
          {post.pinned && <span className="f2-tag f2-tag--pinned"><Pin size={11} /> Pinned</span>}
          {post.locked && <span className="f2-tag"><Lock size={11} /> Locked</span>}
          {isNew(post.created_at) && <span className="f2-tag f2-tag--new"><Sparkles size={11} /> New</span>}
        </div>
        <h3>{post.title}</h3>
        <p>{post.body}</p>
        <div className="f2-tile__footer">
          <span className="f2-tile__author">
            <MemberAvatar className="f2-avatar" username={post.author_username} avatarUrl={post.author_avatar_url} size={26} />
            {post.author_username}
          </span>
          <span className="f2-tile__dot" aria-hidden="true">&middot;</span>
          <span>{timeAgo(post.latest_activity_at)}</span>
          <span className="f2-tile__replies"><MessageCircle size={14} /> {post.comment_count}</span>
        </div>
      </div>
    </Link>
  );
}

export default function Forum2() {
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
  const [draftMentions, setDraftMentions] = useState([]);
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

  // NEW: a small "Trending now" widget for the sidebar, built from posts
  // already in memory. No extra request — just the busiest recent threads.
  const trendingPosts = useMemo(
    () => [...posts].filter((post) => !post.pinned).sort((a, b) => b.comment_count - a.comment_count).slice(0, 3),
    [posts]
  );

  const totalPostCount = useMemo(
    () => categories.reduce((sum, category) => sum + category.post_count, 0),
    [categories]
  );

  // NEW: quick community pulse for the masthead stat strip.
  const activeTodayCount = useMemo(
    () => posts.filter((post) => isNew(post.latest_activity_at)).length,
    [posts]
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
      body: JSON.stringify({
        ...draft,
        category_id: Number(draft.category_id),
        mentioned_user_ids: draftMentions.map((member) => member.user_id),
      }),
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
  const activeCategoryData = categories.find((category) => category.slug === activeCategory);

  return (
    <main className="f2-shell">
      {showLoginWelcome && (
        <div className="f2-login-welcome" role="status">
          <Check size={16} /> Welcome back, {user?.username || "friend"}. You&rsquo;re logged in.
        </div>
      )}

      <section className="f2-masthead">
        <div className="f2-masthead__top">
          <div className="f2-masthead__copy">
            <p className="f2-eyebrow">Private member community</p>
            <h1>Community Forum</h1>
            <p>A safe place to share, listen, and support each other. You don&rsquo;t have to have the perfect words.</p>
          </div>
          <div className="f2-masthead__actions">
            <button className="f2-primary-button" onClick={openComposer}>
              <Plus size={18} /> Start a conversation
            </button>
            <Link to="/resources" className="f2-resources-link">
              <LifeBuoy size={15} /> Need support right now?
            </Link>
          </div>
        </div>
        <div className="f2-stats" role="list" aria-label="Community activity">
          <div className="f2-stats__item" role="listitem"><strong>{totalPostCount}</strong><span>Conversations</span></div>
          <div className="f2-stats__item" role="listitem"><strong>{categories.length}</strong><span>Spaces</span></div>
          <div className="f2-stats__item" role="listitem"><Flame size={14} /><strong>{activeTodayCount}</strong><span>Active today</span></div>
        </div>
      </section>

      <div className="f2-search-row">
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
          <button className={sort === "recent" ? "is-active" : ""} onClick={() => setSort("recent")}>Recent</button>
          <button className={sort === "discussed" ? "is-active" : ""} onClick={() => setSort("discussed")}><TrendingUp size={13} /> Discussed</button>
          <button className={sort === "mine" ? "is-active" : ""} onClick={() => setSort("mine")}><User size={13} /> Mine</button>
          <button className={sort === "saved" ? "is-active" : ""} onClick={() => setSort("saved")}><Bookmark size={13} /> Saved</button>
        </div>
      </div>

      <div className="f2-category-rail" role="tablist" aria-label="Forum categories">
        <button
          role="tab"
          aria-selected={activeCategory === ""}
          className={`f2-chip ${activeCategory === "" ? "is-active" : ""}`}
          onClick={() => setSearchParams(search ? { search } : {})}
        >
          <LayoutGrid size={14} /> All <b>{totalPostCount}</b>
        </button>
        {categories.map((category) => (
          <button
            key={category.category_id}
            role="tab"
            aria-selected={activeCategory === category.slug}
            className={`f2-chip ${activeCategory === category.slug ? "is-active" : ""}`}
            style={{ "--accent": accentFor(category.name) }}
            onClick={() => setSearchParams(search ? { category: category.slug, search } : { category: category.slug })}
          >
            <ForumCategoryGlyph name={category.name} size={14} /> {category.name} <b>{category.post_count}</b>
          </button>
        ))}
      </div>

      <div className="f2-layout">
        <section className="f2-feed">
          <div className="f2-feed-heading">
            <div>
              <p className="f2-eyebrow">
                {sort === "mine" ? "Your posts" : sort === "saved" ? "Saved posts" : activeCategoryData?.description || "Recent activity"}
              </p>
              <h2>{sort === "mine" ? "Your posts" : sort === "saved" ? "Saved posts" : activeCategoryData?.name || "Recent activity"}</h2>
            </div>
            <span>{visibleCount} {visibleCount === 1 ? "post" : "posts"}</span>
          </div>

          {error && <p className="f2-error" role="alert">{error}</p>}

          {loading && (
            <div className="f2-skeleton-list" aria-hidden="true">
              {[0, 1, 2].map((i) => <div className="f2-skeleton-tile" key={i} />)}
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

          {!loading && !error && visibleCount === 0 && sort === "saved" && (
            <div className="f2-empty">
              <Bookmark size={28} />
              <h3>Nothing saved yet.</h3>
              <p>Save a post from its page to find it here later.</p>
            </div>
          )}

          {!loading && !error && visibleCount === 0 && sort !== "mine" && sort !== "saved" && hasFilters && (
            <div className="f2-empty">
              <Search size={28} />
              <h3>Nothing matches yet.</h3>
              <p>Try a different word, or clear your filters and browse by space.</p>
              <button onClick={() => { setSearchInput(""); setSearchParams({}); }}>Clear filters</button>
            </div>
          )}

          {!loading && !error && visibleCount === 0 && sort !== "mine" && sort !== "saved" && !hasFilters && (
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
                  <div className="f2-pinned-heading">
                    <h2><Pin size={15} /> Pinned conversations</h2>
                    <span>{pinnedPosts.length}</span>
                  </div>
                  <div className="f2-tile-list">
                    {pinnedPosts.map((post) => <PostTile post={post} key={post.post_id} />)}
                  </div>
                </div>
              )}
              <div className="f2-tile-list">
                {regularPosts.map((post) => <PostTile post={post} key={post.post_id} />)}
              </div>
            </>
          )}
        </section>

        <aside className="f2-sidebar">
          {trendingPosts.length > 0 && (
            <section className="f2-widget f2-trending">
              <div className="f2-widget__title"><TrendingUp size={17} /><h2>Trending now</h2></div>
              <ol>
                {trendingPosts.map((post, index) => (
                  <li key={post.post_id}>
                    <Link to={`/forum/${post.post_id}`}>
                      <span className="f2-trending__rank">{index + 1}</span>
                      <span className="f2-trending__copy">
                        <strong>{post.title}</strong>
                        <small><MessageCircle size={11} /> {post.comment_count} replies</small>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section className="f2-widget">
            <div className="f2-widget__title"><Users size={17} /><h2>Community guidelines</h2></div>
            <p>We&rsquo;re here to support one another with respect, compassion, and honesty.</p>
            <ul className="f2-guideline-list">
              <li><Check size={13} /> Be kind and respectful</li>
              <li><Check size={13} /> Share from your own experience</li>
              <li><Check size={13} /> Protect privacy and confidentiality</li>
            </ul>
            <Link to="/guidelines" className="f2-widget__link"><ShieldCheck size={14} /> Read the full guidelines <span aria-hidden="true">&rarr;</span></Link>
          </section>
        </aside>
      </div>

      {composerOpen && (
        <div className="f2-modal-backdrop" role="presentation" onMouseDown={() => setComposerOpen(false)}>
          <section className="f2-composer" role="dialog" aria-modal="true" aria-labelledby="new-post-title-2" onMouseDown={(e) => e.stopPropagation()}>
            <button className="f2-modal-close" onClick={() => setComposerOpen(false)} aria-label="Close"><X /></button>
            <p className="f2-eyebrow">New conversation</p>
            <h2 id="new-post-title-2">What would you like to share?</h2>
            <div className="f2-composer-identity"><MemberAvatar username={user?.username} avatarUrl={user?.avatar_url} size={38} /><span>Posting as <strong>{user?.username}</strong></span></div>
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
                <MentionTextarea
                  token={token}
                  rows={8}
                  value={draft.body}
                  onChange={(body) => setDraft((current) => ({ ...current, body }))}
                  mentions={draftMentions}
                  onMentionsChange={setDraftMentions}
                  placeholder="You do not have to have the perfect words."
                />
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
