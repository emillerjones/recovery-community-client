import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Bell, Bookmark, Check, Hash, HeartHandshake, Lock, Megaphone,
  MessageCircle, Plus, Search, Settings2, ShieldCheck,
  TrendingUp, User, X,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import MentionTextarea from "../components/MentionTextarea";
import MemberAvatar from "../components/MemberAvatar";
import "./Forum3.css";

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
  const reactionCount = Object.values(post.reactions || {}).reduce((sum, count) => sum + Number(count), 0);
  return (
    <article className={`f3-card ${post.category_slug === "announcements" ? "f3-card--announcement" : ""}`}>
      <Link className="f3-card__link" to={`/forum/${post.post_id}`} aria-label={`Open ${post.title}`} />
      <header className="f3-card__author">
        <MemberAvatar username={post.author_username} avatarUrl={post.author_avatar_url} size={44} />
        <div><strong>{post.author_username}</strong><span>{timeAgo(post.latest_activity_at)}</span></div>
        {post.category_slug === "announcements" && <b className="f3-official"><Megaphone size={12} /> Official</b>}
        {post.locked && <Lock className="f3-card__lock" size={15} />}
      </header>
      <div className="f3-card__content">
        <div className="f3-card__tags">
          {(post.tags || []).map((tag) => <span key={tag.tag_id}>#{tag.slug}</span>)}
        </div>
        <h2>{post.title}</h2>
        <p>{post.body}</p>
      </div>
      <footer>
        <span><MessageCircle size={15} /> {post.comment_count} {post.comment_count === 1 ? "reply" : "replies"}</span>
        {reactionCount > 0 && <span><HeartHandshake size={15} /> {reactionCount} {reactionCount === 1 ? "reaction" : "reactions"}</span>}
        {post.pinned && <strong>PINNED</strong>}
      </footer>
    </article>
  );
}

export default function Forum3() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get("view") === "announcements" ? "announcements" : "community";
  const activeTag = searchParams.get("tag") || "";
  const isStaff = user?.role_id <= 50;
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  useEffect(() => {
    if (!showLoginWelcome) return;
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    const id = setTimeout(() => setShowLoginWelcome(false), 4000);
    return () => clearTimeout(id);
  }, [showLoginWelcome, navigate, location.pathname, location.search]);

  useEffect(() => {
    const id = setTimeout(() => { setLoading(true); setSearch(searchInput.trim()); }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

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
    const params = new URLSearchParams();
    if (view === "announcements") params.set("category", "announcements");
    if (activeTag) params.set("tag", activeTag);
    if (search) params.set("search", search);
    fetch(`${API}/api/forum/posts?${params}`, { headers })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Could not load conversations.");
        setError("");
        setPosts(view === "community"
          ? data.filter((post) => !["announcements", "success-stories"].includes(post.category_slug))
          : data);
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [view, activeTag, search, headers]);

  const visiblePosts = useMemo(() => {
    let result = posts;
    if (sort === "mine") result = result.filter((post) => post.author_id === user?.id);
    if (sort === "saved") result = result.filter((post) => post.saved_by_me);
    return [...result].sort((a, b) => sort === "discussed"
      ? b.comment_count - a.comment_count
      : new Date(b.latest_activity_at) - new Date(a.latest_activity_at));
  }, [posts, sort, user?.id]);

  const announcementCategory = categories.find((category) => category.slug === "announcements");
  const mainCategory = categories.find((category) => category.slug === "general-recovery")
    || categories.find((category) => !["announcements", "success-stories"].includes(category.slug));
  const composingAnnouncement = view === "announcements" && isStaff;

  function setView(nextView) {
    setLoading(true);
    const next = {};
    if (nextView === "announcements") next.view = "announcements";
    setSearchParams(next);
  }

  function selectTag(slug) {
    setLoading(true);
    const next = {};
    if (view === "announcements") next.view = "announcements";
    if (slug) next.tag = slug;
    setSearchParams(next);
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
    <main className="f3-page">
      {showLoginWelcome && <div className="f3-login-welcome"><Check size={16} /> Welcome back, {user?.username}.</div>}

      <section className="f3-hero">
        <div className="f3-hero__copy">
          <p className="f3-eyebrow">Private member community</p>
          <h1>A place to be heard.</h1>
          <p>Share what is happening, ask a question, or simply let the community know you&rsquo;re here.</p>
        </div>
        <button className="f3-create" onClick={() => setComposerOpen(true)}><Plus size={18} /> Start a post</button>
      </section>

      <section className="f3-shell">
        <div className="f3-main">
          <nav className="f3-views" aria-label="Forum sections">
            <button className={view === "community" ? "is-active" : ""} onClick={() => setView("community")}>
              <MessageCircle size={17} /><span><strong>Main forum</strong><small>Everyday community conversation</small></span>
            </button>
            <button className={view === "announcements" ? "is-active" : ""} onClick={() => setView("announcements")}>
              <Megaphone size={17} /><span><strong>Announcements</strong><small>Updates from the team</small></span>
            </button>
          </nav>

          <div className="f3-tagbar" aria-label="Filter by tag">
            <button className={!activeTag ? "is-active" : ""} onClick={() => selectTag("")}>All topics</button>
            {tags.filter((tag) => tag.active).map((tag) => <button key={tag.tag_id} className={activeTag === tag.slug ? "is-active" : ""} onClick={() => selectTag(tag.slug)}>#{tag.slug}</button>)}
          </div>

          <div className="f3-toolbar">
            <label><Search size={16} /><input type="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search conversations" />{searchInput && <button onClick={() => setSearchInput("")} aria-label="Clear search"><X size={13} /></button>}</label>
            <div>{FILTERS.map(({ key, label, icon: Icon }) => <button key={key} className={sort === key ? "is-active" : ""} onClick={() => setSort(key)}>{Icon && <Icon size={13} />}{label}</button>)}</div>
          </div>

          {error && <p className="f3-error" role="alert">{error}</p>}
          {loading && <div className="f3-loading">Loading conversations…</div>}
          {!loading && !error && visiblePosts.length === 0 && <div className="f3-empty"><HeartHandshake size={30} /><h2>{view === "announcements" ? "No announcements yet" : "No conversations found"}</h2><p>{activeTag ? "Try another tag or view all topics." : "A thoughtful question or honest update is enough to begin."}</p>{view === "community" && <button onClick={() => setComposerOpen(true)}>Start a post</button>}</div>}
          {!loading && visiblePosts.length > 0 && <div className="f3-feed">{visiblePosts.map((post) => <PostCard key={post.post_id} post={post} />)}</div>}
        </div>

        <aside className="f3-side">
          <section className="f3-side__welcome"><HeartHandshake size={22} /><h2>You belong here.</h2><p>You don&rsquo;t need perfect words. Share only what feels comfortable.</p></section>
          <section><h2><Hash size={15} /> Browse topics</h2><div className="f3-topic-list">{tags.filter((tag) => tag.active).slice(0, 8).map((tag) => <button key={tag.tag_id} onClick={() => selectTag(tag.slug)}><span>#{tag.slug}</span><small>{tag.post_count || 0}</small></button>)}</div>{isStaff && <button className="f3-manage" onClick={() => setTagManagerOpen(true)}><Settings2 size={14} /> Manage staff tags</button>}</section>
          <section><h2><Bell size={15} /> Stay connected</h2><p>New conversations appear in your notification list so early posts don&rsquo;t go unanswered.</p></section>
          <section><h2><ShieldCheck size={15} /> Community care</h2><p>Be kind, protect privacy, and share from your own experience.</p><Link to="/guidelines">Read our guidelines →</Link></section>
        </aside>
      </section>

      {composerOpen && <div className="f3-modal" onMouseDown={() => setComposerOpen(false)}><section role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}><button className="f3-close" onClick={() => setComposerOpen(false)} aria-label="Close"><X /></button><p className="f3-eyebrow">{composingAnnouncement ? "Staff announcement" : "New conversation"}</p><h2>{composingAnnouncement ? "Share an official update" : "What would you like to share?"}</h2><div className="f3-identity"><MemberAvatar username={user?.username} avatarUrl={user?.avatar_url} size={38} /><span>Posting as <strong>{user?.username}</strong></span></div><form onSubmit={createPost}><label>Title<input required maxLength={180} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Give your post a clear title" /></label><label>Message<MentionTextarea token={token} rows={7} value={draft.body} onChange={(body) => setDraft((current) => ({ ...current, body }))} mentions={draftMentions} onMentionsChange={setDraftMentions} placeholder="You do not have to have the perfect words." /></label><fieldset><legend>Tags <small>Choose up to 3</small></legend><div className="f3-tag-picker">{tags.filter((tag) => tag.active).map((tag) => <button type="button" key={tag.tag_id} className={draft.tag_ids.includes(tag.tag_id) ? "is-active" : ""} onClick={() => toggleDraftTag(tag.tag_id)}>#{tag.slug}</button>)}</div></fieldset>{error && <p className="f3-error">{error}</p>}<footer><button type="button" onClick={() => setComposerOpen(false)}>Cancel</button><button className="f3-publish" disabled={submitting}>{submitting ? "Publishing…" : composingAnnouncement ? "Publish announcement" : "Publish post"}</button></footer></form></section></div>}

      {tagManagerOpen && <div className="f3-modal" onMouseDown={() => setTagManagerOpen(false)}><section className="f3-tag-manager" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}><button className="f3-close" onClick={() => setTagManagerOpen(false)} aria-label="Close"><X /></button><p className="f3-eyebrow">Staff tools</p><h2>Community tags</h2><p>Members can choose from this staff-created list when they post. Disable a tag to hide it without removing it from older posts.</p><form onSubmit={createTag}><label>New tag name<input required maxLength={40} value={newTagName} onChange={(event) => setNewTagName(event.target.value)} placeholder="Example: Weekly Check-in" /></label><button className="f3-publish">Add tag</button></form><div className="f3-managed-tags">{tags.map((tag) => <button type="button" className={tag.active ? "" : "is-disabled"} key={tag.tag_id} onClick={() => toggleTagActive(tag)}><span>#{tag.slug}<small>{tag.post_count || 0} posts</small></span><b>{tag.active ? "Disable" : "Enable"}</b></button>)}</div></section></div>}
    </main>
  );
}
