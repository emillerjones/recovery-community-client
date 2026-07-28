import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Bell, Bookmark, Check, Hash, HeartHandshake, Lock, Megaphone,
  MessageCircle, Pin, Plus, Search, Settings2, ShieldCheck,
  TrendingUp, User, X,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import MentionTextarea from "../components/MentionTextarea";
import MemberAvatar from "../components/MemberAvatar";
import "./Forum.css";

const API = import.meta.env.VITE_API;
const SEARCH_DEBOUNCE_MS = 350;

const FILTERS = [
  { key: "recent", label: "Latest" },
  { key: "discussed", label: "Most discussed", icon: TrendingUp },
  { key: "mine", label: "My posts", icon: User },
  { key: "saved", label: "Saved", icon: Bookmark },
];

function timeAgo(value) {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function PostCard({ post }) {
  const reactionCount = Number(post.reaction_count || 0);
  return (
    <article className={`forum-feed-card ${post.category_slug === "announcements" ? "forum-feed-card--announcement" : ""}`}>
      <Link className="forum-feed-card__link" to={`/forum/${post.post_id}`} aria-label={`Open ${post.title}`} />
      <header className="forum-feed-card__author">
        <MemberAvatar username={post.author_username} avatarUrl={post.author_avatar_url} size={44} />
        <div><strong>{post.author_username}</strong><span>{timeAgo(post.latest_activity_at)}</span></div>
        {post.category_slug === "announcements" && <b className="forum-feed-official"><Megaphone size={12} /> Official</b>}
        {post.locked && <Lock className="forum-feed-card__lock" size={15} />}
      </header>
      <div className="forum-feed-card__content">
        <div className="forum-feed-card__tags">
          {(post.tags || []).map((tag) => <span key={tag.tag_id}>#{tag.slug}</span>)}
        </div>
        <h2>{post.title}</h2>
        <p>{post.body}</p>
      </div>
      <footer>
        <span><MessageCircle size={15} /> {post.comment_count} {post.comment_count === 1 ? "reply" : "replies"}</span>
        {reactionCount > 0 && <span><HeartHandshake size={15} /> {reactionCount} {reactionCount === 1 ? "reaction" : "reactions"}</span>}
        {post.pinned && <strong>PINNED BY STAFF</strong>}
      </footer>
    </article>
  );
}

export default function Forum() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get("view") === "announcements" ? "announcements" : "community";
  const activeTagKey = searchParams.get("tags") || "";
  const activeTags = activeTagKey.split(",").filter(Boolean);
  const isStaff = user?.role_id <= 50;
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [tagManagerOpen, setTagManagerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent");
  const [draftMentions, setDraftMentions] = useState([]);
  const [draft, setDraft] = useState({ title: "", body: "", tag_ids: [] });
  const [newTagName, setNewTagName] = useState("");
  const [showLoginWelcome, setShowLoginWelcome] = useState(() => Boolean(location.state?.justLoggedIn));
  const loadMoreRef = useRef(null);
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  useEffect(() => {
    if (!showLoginWelcome) return;
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    const id = setTimeout(() => setShowLoginWelcome(false), 4000);
    return () => clearTimeout(id);
  }, [showLoginWelcome, navigate, location.pathname, location.search]);

  useEffect(() => {
    const id = setTimeout(() => {
      const nextSearch = searchInput.trim();
      if (nextSearch === search) return;
      setPosts([]);
      setPage(0);
      setLoading(true);
      setSearch(nextSearch);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput, search]);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/forum/categories`, { headers }),
      fetch(`${API}/api/forum/tags${isStaff ? "?all=true" : ""}`, { headers }),
    ]).then(async ([categoryResponse, tagResponse]) => {
      if (!categoryResponse.ok || !tagResponse.ok) throw new Error("Could not load the community forum.");
      setCategories(await categoryResponse.json());
      setTags(await tagResponse.json());
    }).catch((requestError) => setError(requestError.message));
  }, [headers, isStaff]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    params.set("section", view);
    if (activeTagKey) params.set("tags", activeTagKey);
    if (search) params.set("search", search);
    params.set("sort", sort);
    params.set("page", String(page));
    fetch(`${API}/api/forum/posts?${params}`, { headers, signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Could not load conversations.");
        setError("");
        setPosts((current) => page === 0 ? data.posts : [
          ...current,
          ...data.posts.filter((post) => !current.some((existing) => existing.post_id === post.post_id)),
        ]);
        setHasMore(data.has_more);
      })
      .catch((requestError) => { if (requestError.name !== "AbortError") setError(requestError.message); })
      .finally(() => { if (!controller.signal.aborted) { setLoading(false); setLoadingMore(false); } });
    return () => controller.abort();
  }, [view, activeTagKey, search, sort, page, headers]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMore || loading || loadingMore) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setLoadingMore(true);
      setPage((current) => current + 1);
    }, { rootMargin: "500px 0px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore]);

  const announcementCategory = categories.find((category) => category.slug === "announcements");
  const mainCategory = categories.find((category) => category.slug === "general-recovery")
    || categories.find((category) => !["announcements", "success-stories"].includes(category.slug));
  const composingAnnouncement = view === "announcements" && isStaff;
  const pinnedPosts = useMemo(() => posts.filter((post) => post.pinned), [posts]);
  const regularPosts = useMemo(() => posts.filter((post) => !post.pinned), [posts]);

  function setView(nextView) {
    if (nextView === view) return;
    setPosts([]);
    setPage(0);
    setLoading(true);
    const next = {};
    if (nextView === "announcements") next.view = "announcements";
    if (activeTagKey) next.tags = activeTagKey;
    setSearchParams(next);
  }

  function selectTag(slug) {
    if (!slug && !activeTags.length) return;
    setPosts([]);
    setPage(0);
    setLoading(true);
    const next = {};
    if (view === "announcements") next.view = "announcements";
    if (slug) {
      const selected = new Set(activeTags);
      if (selected.has(slug)) selected.delete(slug);
      else selected.add(slug);
      if (selected.size) next.tags = [...selected].join(",");
    }
    setSearchParams(next);
  }

  function selectSort(nextSort) {
    if (nextSort === sort) return;
    setPosts([]);
    setPage(0);
    setLoading(true);
    setSort(nextSort);
  }

  function toggleDraftTag(tagId) {
    setDraft((current) => {
      const selected = current.tag_ids.includes(tagId);
      if (!selected && current.tag_ids.length >= 3) return current;
      return { ...current, tag_ids: selected ? current.tag_ids.filter((id) => id !== tagId) : [...current.tag_ids, tagId] };
    });
  }

  async function createPost(event) {
    event.preventDefault();
    if (view === "announcements" && !isStaff) {
      setComposerOpen(false);
      return setError("Only moderators, administrators, and owners can publish announcements.");
    }
    const categoryId = composingAnnouncement ? announcementCategory?.category_id : mainCategory?.category_id;
    if (!categoryId) return setError("The forum needs a Main Forum category before posting.");
    setSubmitting(true);
    setError("");
    const response = await fetch(`${API}/api/forum/posts`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        category_id: categoryId, title: draft.title, body: draft.body,
        tag_ids: draft.tag_ids, mentioned_user_ids: draftMentions.map((member) => member.user_id),
      }),
    });
    const result = await response.json();
    setSubmitting(false);
    if (!response.ok) return setError(result.message || "Could not publish that post.");
    navigate(`/forum/${result.post_id}`);
  }

  async function createTag(event) {
    event.preventDefault();
    const response = await fetch(`${API}/api/forum/tags`, {
      method: "POST", headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTagName }),
    });
    const result = await response.json();
    if (!response.ok) return setError(result.message || "Could not create that tag.");
    setTags((current) => [...current, { ...result, post_count: 0 }]);
    setNewTagName("");
  }

  async function toggleTagActive(tag) {
    const response = await fetch(`${API}/api/forum/tags/${tag.tag_id}`, {
      method: "PATCH", headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ name: tag.name, slug: tag.slug, description: tag.description, active: !tag.active }),
    });
    const result = await response.json();
    if (!response.ok) return setError(result.message || "Could not update that tag.");
    setTags((current) => current.map((item) => item.tag_id === tag.tag_id ? { ...item, ...result } : item));
  }

  return (
    <main className="forum-feed-page">
      {showLoginWelcome && <div className="forum-feed-login-welcome"><Check size={16} /> Welcome back, {user?.username}.</div>}

      <section className="forum-feed-hero">
        <div className="forum-feed-hero__copy">
          <p className="forum-feed-eyebrow">Private member community</p>
          <h1>A place to be heard.</h1>
          <p>Share what is happening, ask a question, or simply let the community know you&rsquo;re here.</p>
        </div>
        {(view === "community" || isStaff) && <button className="forum-feed-create" onClick={() => setComposerOpen(true)}><Plus size={18} /> {view === "announcements" ? "Post an announcement" : "Start a post"}</button>}
      </section>

      <section className="forum-feed-shell">
        <div className="forum-feed-main">
          <nav className="forum-feed-views" aria-label="Forum sections">
            <button className={view === "community" ? "is-active" : ""} onClick={() => setView("community")}>
              <MessageCircle size={17} /><span><strong>Main forum</strong><small>Everyday community conversation</small></span>
            </button>
            <button className={view === "announcements" ? "is-active" : ""} onClick={() => setView("announcements")}>
              <Megaphone size={17} /><span><strong>Announcements</strong><small>Updates from the team</small></span>
            </button>
          </nav>

          <div className="forum-feed-tagbar" aria-label="Filter by tag">
            <button className={!activeTags.length ? "is-active" : ""} onClick={() => selectTag("")}>All topics</button>
            {tags.filter((tag) => tag.active).map((tag) => <button key={tag.tag_id} className={activeTags.includes(tag.slug) ? "is-active" : ""} aria-pressed={activeTags.includes(tag.slug)} onClick={() => selectTag(tag.slug)}>#{tag.slug}</button>)}
          </div>

          <div className="forum-feed-toolbar">
            <label><Search size={16} /><input type="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search conversations" />{searchInput && <button onClick={() => setSearchInput("")} aria-label="Clear search"><X size={13} /></button>}</label>
            <div>{FILTERS.map(({ key, label, icon: Icon }) => <button key={key} className={sort === key ? "is-active" : ""} onClick={() => selectSort(key)}>{Icon && <Icon size={13} />}{label}</button>)}</div>
          </div>

          {error && <p className="forum-feed-error" role="alert">{error}</p>}
          {loading && <div className="forum-feed-loading">Loading conversations…</div>}
          {!loading && !error && posts.length === 0 && <div className="forum-feed-empty"><HeartHandshake size={30} /><h2>{view === "announcements" ? "No announcements yet" : "No conversations found"}</h2><p>{activeTags.length ? "Try removing a tag or view all topics." : "A thoughtful question or honest update is enough to begin."}</p>{view === "community" && <button onClick={() => setComposerOpen(true)}>Start a post</button>}</div>}
          {pinnedPosts.length > 0 && <section className="forum-feed-pinned" aria-labelledby="pinned-posts-heading"><header><span><Pin size={15} /></span><div><h2 id="pinned-posts-heading">Pinned by staff</h2><p>Important conversations selected by the community team.</p></div></header><div className="forum-feed-feed">{pinnedPosts.map((post) => <PostCard key={post.post_id} post={post} />)}</div></section>}
          {regularPosts.length > 0 && <section className="forum-feed-regular" aria-labelledby="latest-posts-heading"><header><h2 id="latest-posts-heading">Latest conversations</h2><span>{activeTags.length ? "Matching selected topics" : view === "announcements" ? "Staff updates" : "From across the community"}</span></header><div className="forum-feed-feed">{regularPosts.map((post) => <PostCard key={post.post_id} post={post} />)}</div></section>}
          <div className="forum-feed-load-more" ref={loadMoreRef} aria-live="polite">{loadingMore ? "Loading more conversations…" : hasMore ? "Scroll for more" : posts.length > 0 ? "You’re all caught up" : ""}</div>
        </div>

        <aside className="forum-feed-side">
          <section className="forum-feed-side__welcome"><HeartHandshake size={22} /><h2>You belong here.</h2><p>You don&rsquo;t need perfect words. Share only what feels comfortable.</p></section>
          <section><h2><Hash size={15} /> Browse topics</h2><div className="forum-feed-topic-list">{tags.filter((tag) => tag.active).slice(0, 8).map((tag) => <button key={tag.tag_id} onClick={() => selectTag(tag.slug)}><span>#{tag.slug}</span><small>{tag.post_count || 0}</small></button>)}</div>{isStaff && <button className="forum-feed-manage" onClick={() => setTagManagerOpen(true)}><Settings2 size={14} /> Manage staff tags</button>}</section>
          <section><h2><Bell size={15} /> Stay connected</h2><p>New conversations appear in your notification list so early posts don&rsquo;t go unanswered.</p></section>
          <section><h2><ShieldCheck size={15} /> Community care</h2><p>Be kind, protect privacy, and share from your own experience.</p><Link to="/guidelines">Read our guidelines →</Link></section>
        </aside>
      </section>

      {composerOpen && <div className="forum-feed-modal" onMouseDown={() => setComposerOpen(false)}><section role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}><button className="forum-feed-close" onClick={() => setComposerOpen(false)} aria-label="Close"><X /></button><p className="forum-feed-eyebrow">{composingAnnouncement ? "Staff announcement" : "New conversation"}</p><h2>{composingAnnouncement ? "Share an official update" : "What would you like to share?"}</h2><div className="forum-feed-identity"><MemberAvatar username={user?.username} avatarUrl={user?.avatar_url} size={38} /><span>Posting as <strong>{user?.username}</strong></span></div><form onSubmit={createPost}><label>Title<input required maxLength={180} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Give your post a clear title" /></label><label>Message<MentionTextarea token={token} rows={7} value={draft.body} onChange={(body) => setDraft((current) => ({ ...current, body }))} mentions={draftMentions} onMentionsChange={setDraftMentions} placeholder="You do not have to have the perfect words." /></label><fieldset><legend>Tags <small>Choose up to 3</small></legend><div className="forum-feed-tag-picker">{tags.filter((tag) => tag.active).map((tag) => <button type="button" key={tag.tag_id} className={draft.tag_ids.includes(tag.tag_id) ? "is-active" : ""} onClick={() => toggleDraftTag(tag.tag_id)}>#{tag.slug}</button>)}</div></fieldset>{error && <p className="forum-feed-error">{error}</p>}<footer><button type="button" onClick={() => setComposerOpen(false)}>Cancel</button><button className="forum-feed-publish" disabled={submitting}>{submitting ? "Publishing…" : composingAnnouncement ? "Publish announcement" : "Publish post"}</button></footer></form></section></div>}

      {tagManagerOpen && <div className="forum-feed-modal" onMouseDown={() => setTagManagerOpen(false)}><section className="forum-feed-tag-manager" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}><button className="forum-feed-close" onClick={() => setTagManagerOpen(false)} aria-label="Close"><X /></button><p className="forum-feed-eyebrow">Staff tools</p><h2>Community tags</h2><p>Members can choose from this staff-created list when they post. Disable a tag to hide it without removing it from older posts.</p><form onSubmit={createTag}><label>New tag name<input required maxLength={40} value={newTagName} onChange={(event) => setNewTagName(event.target.value)} placeholder="Example: Weekly Check-in" /></label><button className="forum-feed-publish">Add tag</button></form><div className="forum-feed-managed-tags">{tags.map((tag) => <button type="button" className={tag.active ? "" : "is-disabled"} key={tag.tag_id} onClick={() => toggleTagActive(tag)}><span>#{tag.slug}<small>{tag.post_count || 0} posts</small></span><b>{tag.active ? "Disable" : "Enable"}</b></button>)}</div></section></div>}
    </main>
  );
}
