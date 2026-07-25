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
  User,
  X,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import MentionTextarea from "../components/MentionTextarea";
import MemberAvatar from "../components/MemberAvatar";
import ForumCategoryGlyph from "../components/ForumCategoryGlyph";
import "./Forum3.css";

const API = import.meta.env.VITE_API;
const SEARCH_DEBOUNCE_MS = 350;
const NEW_WINDOW_MS = 24 * 60 * 60 * 1000;

const SORTS = [
  { key: "recent", label: "Recent", icon: null },
  { key: "discussed", label: "Discussed", icon: TrendingUp },
  { key: "mine", label: "Mine", icon: User },
  { key: "saved", label: "Saved", icon: Bookmark },
];

function timeAgo(value) {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function isNew(value) {
  return Date.now() - new Date(value).getTime() < NEW_WINDOW_MS;
}

function PostRow({ post, showCategory }) {
  return (
    <Link to={`/forum/${post.post_id}`} className="f3-row">
      <MemberAvatar className="f3-row__avatar" username={post.author_username} avatarUrl={post.author_avatar_url} size={46} />
      <div className="f3-row__body">
        <div className="f3-row__line1">
          <strong>{post.author_username}</strong>
          <time>{timeAgo(post.latest_activity_at)}</time>
          {showCategory && <span className="f3-row__category"><ForumCategoryGlyph name={post.category_name} size={11} /> {post.category_name}</span>}
          {post.locked && <span className="f3-row__badge"><Lock size={11} /></span>}
          {isNew(post.created_at) && <span className="f3-row__badge f3-row__badge--new"><Sparkles size={11} /> New</span>}
        </div>
        <h3>{post.title}</h3>
        <p>{post.body}</p>
        <span className="f3-row__replies"><MessageCircle size={14} /> {post.comment_count} {post.comment_count === 1 ? "reply" : "replies"}</span>
      </div>
    </Link>
  );
}

export default function Forum3() {
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
  const [infoOpen, setInfoOpen] = useState(false);
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

  // Close the mobile "channel info" drawer whenever the active channel changes.
  useEffect(() => { setInfoOpen(false); }, [activeCategory]);

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

  const trendingPosts = useMemo(
    () => [...posts].filter((post) => !post.pinned).sort((a, b) => b.comment_count - a.comment_count).slice(0, 3),
    [posts]
  );

  const totalPostCount = useMemo(
    () => categories.reduce((sum, category) => sum + category.post_count, 0),
    [categories]
  );

  const activeTodayCount = useMemo(
    () => posts.filter((post) => isNew(post.latest_activity_at)).length,
    [posts]
  );

  const activeCategoryData = categories.find((category) => category.slug === activeCategory);

  function selectChannel(slug) {
    setSearchParams(search ? (slug ? { category: slug, search } : { search }) : (slug ? { category: slug } : {}));
  }

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

  return (
    <div className="f3-app">
      {showLoginWelcome && (
        <div className="f3-login-welcome" role="status">
          <Check size={16} /> Welcome back, {user?.username || "friend"}. You&rsquo;re logged in.
        </div>
      )}

      {/* ---------- Left rail: channel switcher ---------- */}
      <nav className="f3-rail" aria-label="Forum channels">
        <div className="f3-rail__head">
          <p className="f3-eyebrow">Spaces</p>
          <button type="button" className="f3-rail__compose" onClick={openComposer} aria-label="Start a conversation">
            <Plus size={17} />
          </button>
        </div>
        <button className={`f3-channel f3-channel--all ${activeCategory === "" ? "is-active" : ""}`} onClick={() => selectChannel("")}>
          <i><LayoutGrid size={16} /></i>
          <span>All conversations</span>
          <b>{totalPostCount}</b>
        </button>
        <div className="f3-rail__list">
          {categories.map((category) => (
            <button key={category.category_id} className={`f3-channel ${activeCategory === category.slug ? "is-active" : ""}`} onClick={() => selectChannel(category.slug)}>
              <i><ForumCategoryGlyph name={category.name} size={16} /></i>
              <span>{category.name}</span>
              <b>{category.post_count}</b>
            </button>
          ))}
        </div>
        <Link to="/resources" className="f3-rail__resources"><LifeBuoy size={15} /> Need support now?</Link>
      </nav>

      {/* ---------- Main: feed for the active channel ---------- */}
      <main className="f3-main">
        <header className="f3-main__header">
          <div className="f3-main__heading">
            <p className="f3-eyebrow">{sort === "mine" ? "Filtered" : sort === "saved" ? "Filtered" : "Channel"}</p>
            <h1>{sort === "mine" ? "Your posts" : sort === "saved" ? "Saved posts" : activeCategoryData?.name || "All conversations"}</h1>
            {activeCategoryData?.description && sort !== "mine" && sort !== "saved" && <p>{activeCategoryData.description}</p>}
          </div>
          <div className="f3-main__actions">
            <button type="button" className="f3-primary-button" onClick={openComposer}>
              <Plus size={16} /> Start a conversation
            </button>
            <button type="button" className="f3-info-toggle" onClick={() => setInfoOpen((open) => !open)} aria-expanded={infoOpen}>
              <ShieldCheck size={16} /> Channel info
            </button>
          </div>
        </header>

        <div className="f3-toolbar">
          <label className="f3-search">
            <Search size={15} />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search titles and posts…"
              aria-label="Search conversations"
            />
            {searchInput && (
              <button type="button" aria-label="Clear search" onClick={() => setSearchInput("")}><X size={13} /></button>
            )}
          </label>
          <div className="f3-sort" role="group" aria-label="Sort conversations">
            {SORTS.map(({ key, label, icon: Icon }) => (
              <button key={key} className={sort === key ? "is-active" : ""} onClick={() => setSort(key)}>
                {Icon && <Icon size={13} />} {label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="f3-error" role="alert">{error}</p>}

        {pinnedPosts.length > 0 && (
          <div className="f3-pinned-strip" aria-label="Pinned conversations">
            <span className="f3-pinned-strip__label"><Pin size={12} /> Pinned</span>
            <div className="f3-pinned-strip__list">
              {pinnedPosts.map((post) => (
                <Link key={post.post_id} to={`/forum/${post.post_id}`} className="f3-pinned-chip">{post.title}</Link>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="f3-skeleton-list" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => <div className="f3-skeleton-row" key={i} />)}
          </div>
        )}

        {!loading && !error && visibleCount === 0 && sort === "mine" && (
          <div className="f3-empty">
            <User size={26} />
            <h3>You haven&rsquo;t posted here yet.</h3>
            <p>Whenever you start a conversation, it will show up in this view.</p>
            <button onClick={openComposer}>Start a conversation</button>
          </div>
        )}

        {!loading && !error && visibleCount === 0 && sort === "saved" && (
          <div className="f3-empty">
            <Bookmark size={26} />
            <h3>Nothing saved yet.</h3>
            <p>Save a post from its page to find it here later.</p>
          </div>
        )}

        {!loading && !error && visibleCount === 0 && sort !== "mine" && sort !== "saved" && hasFilters && (
          <div className="f3-empty">
            <Search size={26} />
            <h3>Nothing matches yet.</h3>
            <p>Try a different word, or clear your filters and browse by space.</p>
            <button onClick={() => { setSearchInput(""); setSearchParams({}); }}>Clear filters</button>
          </div>
        )}

        {!loading && !error && visibleCount === 0 && sort !== "mine" && sort !== "saved" && !hasFilters && (
          <div className="f3-empty">
            <MessageCircle size={26} />
            <h3>Be the first to start something here.</h3>
            <p>A thoughtful question or honest update is enough.</p>
            <button onClick={openComposer}>Start a conversation</button>
          </div>
        )}

        {!loading && !error && regularPosts.length > 0 && (
          <div className="f3-row-list">
            {regularPosts.map((post) => <PostRow post={post} key={post.post_id} showCategory={activeCategory === ""} />)}
          </div>
        )}
      </main>

      {/* ---------- Right rail: channel info, collapses to a drawer on mobile ---------- */}
      <aside className={`f3-info ${infoOpen ? "is-open" : ""}`}>
        <button type="button" className="f3-info__close" onClick={() => setInfoOpen(false)} aria-label="Close channel info"><X size={18} /></button>

        <section className="f3-info__stats" aria-label="Community activity">
          <div><strong>{totalPostCount}</strong><span>Conversations</span></div>
          <div><strong>{categories.length}</strong><span>Spaces</span></div>
          <div><Flame size={13} /><strong>{activeTodayCount}</strong><span>Active today</span></div>
        </section>

        {trendingPosts.length > 0 && (
          <section className="f3-info__block">
            <h2><TrendingUp size={15} /> Trending now</h2>
            <ol>
              {trendingPosts.map((post, index) => (
                <li key={post.post_id}>
                  <Link to={`/forum/${post.post_id}`}>
                    <span>{index + 1}</span>
                    <span><strong>{post.title}</strong><small>{post.comment_count} replies</small></span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section className="f3-info__block">
          <h2><ShieldCheck size={15} /> Community guidelines</h2>
          <p>We&rsquo;re here to support one another with respect, compassion, and honesty.</p>
          <ul>
            <li><Check size={12} /> Be kind and respectful</li>
            <li><Check size={12} /> Share from your own experience</li>
            <li><Check size={12} /> Protect privacy and confidentiality</li>
          </ul>
          <Link to="/guidelines">Read the full guidelines &rarr;</Link>
        </section>
      </aside>
      {infoOpen && <div className="f3-info-backdrop" role="presentation" onClick={() => setInfoOpen(false)} />}

      {composerOpen && (
        <div className="f3-modal-backdrop" role="presentation" onMouseDown={() => setComposerOpen(false)}>
          <section className="f3-composer" role="dialog" aria-modal="true" aria-labelledby="new-post-title-3" onMouseDown={(e) => e.stopPropagation()}>
            <button className="f3-modal-close" onClick={() => setComposerOpen(false)} aria-label="Close"><X /></button>
            <p className="f3-eyebrow">New conversation</p>
            <h2 id="new-post-title-3">What would you like to share?</h2>
            <div className="f3-composer-identity"><MemberAvatar username={user?.username} avatarUrl={user?.avatar_url} size={38} /><span>Posting as <strong>{user?.username}</strong></span></div>
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
              {error && <p className="f3-error" role="alert">{error}</p>}
              <div className="f3-composer-actions">
                <button type="button" className="f3-secondary-button" onClick={() => setComposerOpen(false)}>Cancel</button>
                <button className="f3-primary-button" disabled={submitting}>{submitting ? "Publishing…" : "Publish post"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
