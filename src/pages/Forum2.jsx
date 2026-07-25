import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Bookmark,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Compass,
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
import {
  Confetti,
  HandHeart,
  Handshake,
  Heart,
  Lightbulb,
  Plant,
  Sparkle as SparkleIcon,
  Smiley,
  ThumbsUp,
} from "@phosphor-icons/react";
import { useAuth } from "../auth/AuthContext";
import ForumCategoryGlyph from "../components/ForumCategoryGlyph";
import MemberAvatar from "../components/MemberAvatar";
import MentionTextarea from "../components/MentionTextarea";
import "./Forum2.css";

const API = import.meta.env.VITE_API;
const SEARCH_DEBOUNCE_MS = 350;
const NEW_WINDOW_MS = 24 * 60 * 60 * 1000;
const BODY_PREVIEW_LENGTH = 520;

const REACTIONS = [
  { type: "support", Icon: Heart, label: "Support", color: "#b85d6c" },
  { type: "agree", Icon: ThumbsUp, label: "Agree", color: "#537ca6" },
  { type: "relate", Icon: Handshake, label: "I Relate", color: "#9b753e" },
  { type: "encouragement", Icon: Plant, label: "Encouragement", color: "#56805d" },
  { type: "helpful", Icon: Lightbulb, label: "Helpful", color: "#a7792c" },
  { type: "celebrate", Icon: Confetti, label: "Celebrate", color: "#8462a3" },
  { type: "inspiring", Icon: SparkleIcon, label: "Inspiring", color: "#397f80" },
  { type: "care", Icon: HandHeart, label: "Care", color: "#a65773" },
];

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

function reactionTotal(reactions = {}) {
  return Object.values(reactions).reduce((total, count) => total + Number(count || 0), 0);
}

function FeedReactionPicker({ post, onReact, disabled }) {
  const [open, setOpen] = useState(false);
  const selected = REACTIONS.find((reaction) => reaction.type === post.my_reaction);
  const total = reactionTotal(post.reactions);

  useEffect(() => {
    if (!open) return undefined;
    function closeOnEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  function choose(type) {
    onReact(type);
    setOpen(false);
  }

  return (
    <div className="f2-reaction-picker">
      <button
        type="button"
        className={selected ? "is-selected" : ""}
        style={selected ? { "--reaction-color": selected.color } : undefined}
        onClick={() => setOpen((current) => !current)}
        disabled={disabled}
        aria-expanded={open}
      >
        {selected ? <selected.Icon size={19} weight="fill" /> : <Smiley size={19} />}
        <span>{selected?.label || "React"}</span>
        {total > 0 && <b>{total}</b>}
      </button>

      {open && (
        <>
          <button className="f2-reaction-dismiss" type="button" aria-label="Close reactions" onClick={() => setOpen(false)} />
          <div className="f2-reaction-menu" role="dialog" aria-label="Choose a reaction">
            <div className="f2-reaction-menu__heading"><span>Respond with care</span><button type="button" onClick={() => setOpen(false)} aria-label="Close"><X size={16} /></button></div>
            <div>
              {REACTIONS.map((reaction) => {
                const ReactionIcon = reaction.Icon;
                return (
                  <button
                    type="button"
                    key={reaction.type}
                    className={post.my_reaction === reaction.type ? "is-selected" : ""}
                    style={{ "--reaction-color": reaction.color }}
                    onClick={() => choose(reaction.type)}
                  >
                    <ReactionIcon size={23} weight={post.my_reaction === reaction.type ? "fill" : "duotone"} />
                    <span>{reaction.label}</span>
                    {Number(post.reactions?.[reaction.type] || 0) > 0 && <b>{post.reactions[reaction.type]}</b>}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ReplyPreview({ comment }) {
  return (
    <div className="f2-reply-preview">
      <MemberAvatar username={comment.author_username} avatarUrl={comment.author_avatar_url} size={30} />
      <div>
        <p><strong>{comment.author_username}</strong><span>{timeAgo(comment.created_at)}</span></p>
        <div>{comment.body}</div>
      </div>
    </div>
  );
}

function FeedPost({ post, token, user, onReact, onSave, onReply, reacting, saving }) {
  const [expanded, setExpanded] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [reply, setReply] = useState("");
  const [replyMentions, setReplyMentions] = useState([]);
  const [replying, setReplying] = useState(false);
  const [replyError, setReplyError] = useState("");
  const isLong = post.body.length > BODY_PREVIEW_LENGTH;
  const visibleBody = !expanded && isLong ? `${post.body.slice(0, BODY_PREVIEW_LENGTH).trim()}...` : post.body;

  async function submitReply(event) {
    event.preventDefault();
    if (!reply.trim()) return;
    setReplying(true);
    setReplyError("");
    const result = await onReply(post.post_id, reply, replyMentions);
    setReplying(false);
    if (!result.ok) {
      setReplyError(result.message);
      return;
    }
    setReply("");
    setReplyMentions([]);
    setReplyOpen(false);
  }

  return (
    <article className={`f2-post-card ${post.pinned ? "is-pinned" : ""}`}>
      <header className="f2-post-card__header">
        <MemberAvatar username={post.author_username} avatarUrl={post.author_avatar_url} size={46} />
        <div>
          <strong>{post.author_username}</strong>
          <span>
            {timeAgo(post.created_at)}
            <i aria-hidden="true">·</i>
            <Link to={`/forum2?category=${post.category_slug}`}><ForumCategoryGlyph name={post.category_name} size={12} /> {post.category_name}</Link>
          </span>
        </div>
      </header>

      <div className="f2-post-card__status">
        {post.pinned && <span><Pin size={12} /> Pinned by the community team</span>}
        {post.locked && <span><Lock size={12} /> Conversation locked</span>}
        {isNew(post.created_at) && <span className="is-new"><Sparkles size={12} /> New</span>}
      </div>

      <Link className="f2-post-card__title" to={`/forum/${post.post_id}`}>{post.title}</Link>
      <div className="f2-post-card__body">
        <p>{visibleBody}</p>
        {isLong && <button type="button" onClick={() => setExpanded((current) => !current)}>{expanded ? "Show less" : "Read more"}</button>}
      </div>

      {(reactionTotal(post.reactions) > 0 || post.comment_count > 0) && (
        <div className="f2-post-card__social-proof">
          <span>{reactionTotal(post.reactions) > 0 ? `${reactionTotal(post.reactions)} ${reactionTotal(post.reactions) === 1 ? "reaction" : "reactions"}` : ""}</span>
          {post.comment_count > 0 && <Link to={`/forum/${post.post_id}`}>{post.comment_count} {post.comment_count === 1 ? "reply" : "replies"}</Link>}
        </div>
      )}

      <div className="f2-post-card__actions">
        <FeedReactionPicker post={post} onReact={(type) => onReact(post.post_id, type)} disabled={reacting} />
        <button type="button" onClick={() => setReplyOpen((current) => !current)} disabled={post.locked}><MessageCircle size={18} /><span>Reply</span></button>
        <button type="button" className={post.saved_by_me ? "is-selected" : ""} onClick={() => onSave(post.post_id)} disabled={saving}><Bookmark size={18} fill={post.saved_by_me ? "currentColor" : "none"} /><span>{post.saved_by_me ? "Saved" : "Save"}</span></button>
      </div>

      {post.comment_preview?.length > 0 && (
        <div className="f2-post-card__replies">
          {post.comment_preview.map((comment) => <ReplyPreview comment={comment} key={comment.comment_id} />)}
          {post.comment_count > post.comment_preview.length && <Link to={`/forum/${post.post_id}`}>View all {post.comment_count} replies</Link>}
        </div>
      )}

      {replyOpen && !post.locked && (
        <form className="f2-inline-reply" onSubmit={submitReply}>
          <MemberAvatar username={user?.username} avatarUrl={user?.avatar_url} size={34} />
          <div>
            <MentionTextarea
              token={token}
              rows={3}
              value={reply}
              onChange={setReply}
              mentions={replyMentions}
              onMentionsChange={setReplyMentions}
              placeholder={`Reply to ${post.author_username}...`}
            />
            {replyError && <p role="alert">{replyError}</p>}
            <div><button type="button" onClick={() => setReplyOpen(false)}>Cancel</button><button type="submit" disabled={replying || !reply.trim()}>{replying ? "Posting..." : "Post reply"}</button></div>
          </div>
        </form>
      )}
    </article>
  );
}

function SpaceList({ categories, totalPostCount, activeCategory, onSelect }) {
  return (
    <div className="f2-space-list">
      <button className={!activeCategory ? "is-active" : ""} onClick={() => onSelect("")}>
        <i><LayoutGrid size={17} /></i><span><strong>All conversations</strong><small>Everything from the community</small></span><b>{totalPostCount}</b>
      </button>
      {categories.map((category) => (
        <button key={category.category_id} className={activeCategory === category.slug ? "is-active" : ""} onClick={() => onSelect(category.slug)}>
          <i><ForumCategoryGlyph name={category.name} size={17} /></i><span><strong>{category.name}</strong><small>{category.description}</small></span><b>{category.post_count}</b>
        </button>
      ))}
    </div>
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
  const [spacesOpen, setSpacesOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reactingTo, setReactingTo] = useState(null);
  const [savingPost, setSavingPost] = useState(null);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState({ category_id: "", title: "", body: "" });
  const [draftMentions, setDraftMentions] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent");
  const [showLoginWelcome, setShowLoginWelcome] = useState(() => Boolean(location.state?.justLoggedIn));

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  useEffect(() => {
    if (!showLoginWelcome) return undefined;
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
      if (!response.ok) throw new Error("Could not load forum spaces.");
      setCategories(await response.json());
    }
    loadCategories().catch((requestError) => setError(requestError.message));
  }, [headers]);

  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (activeCategory) params.set("category", activeCategory);
      if (search) params.set("search", search);
      const query = params.toString();
      const response = await fetch(`${API}/api/forum/posts${query ? `?${query}` : ""}`, { headers });
      if (!response.ok) throw new Error("Could not load conversations.");
      setPosts(await response.json());
      setLoading(false);
    }
    loadPosts().catch((requestError) => {
      setError(requestError.message);
      setLoading(false);
    });
  }, [activeCategory, search, headers]);

  useEffect(() => {
    if (!composerOpen && !spacesOpen) return undefined;
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setComposerOpen(false);
        setSpacesOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [composerOpen, spacesOpen]);

  // VIEW FLOW: toolbar buttons set `sort`; this block prepares the exact feed
  // array shown below without making another server request.
  const visiblePosts = useMemo(() => {
    let filtered = posts;
    if (sort === "mine") filtered = posts.filter((post) => post.author_id === user?.id);
    if (sort === "saved") filtered = posts.filter((post) => post.saved_by_me);
    if (sort === "unanswered") filtered = posts.filter((post) => post.comment_count === 0);
    return [...filtered].sort((a, b) => {
      if (a.pinned !== b.pinned) return Number(b.pinned) - Number(a.pinned);
      if (sort === "discussed") return b.comment_count - a.comment_count;
      return new Date(b.latest_activity_at) - new Date(a.latest_activity_at);
    });
  }, [posts, sort, user?.id]);

  const totalPostCount = useMemo(() => categories.reduce((sum, category) => sum + category.post_count, 0), [categories]);
  const activeCategoryData = categories.find((category) => category.slug === activeCategory);
  const hasFilters = Boolean(activeCategory || search || sort !== "recent");

  function selectCategory(slug) {
    setSearchParams(slug ? { category: slug } : {});
    setSpacesOpen(false);
  }

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setSearchParams({});
    setSort("recent");
  }

  function openComposer() {
    const selected = categories.find((category) => category.slug === activeCategory);
    setDraft((current) => ({ ...current, category_id: selected?.category_id ? String(selected.category_id) : current.category_id }));
    setError("");
    setComposerOpen(true);
  }

  function applyReaction(post, reactionType) {
    const previous = post.my_reaction;
    const next = previous === reactionType ? null : reactionType;
    const reactions = { ...(post.reactions || {}) };
    if (previous) reactions[previous] = Math.max(0, Number(reactions[previous] || 0) - 1);
    if (next) reactions[next] = Number(reactions[next] || 0) + 1;
    return { ...post, reactions, my_reaction: next };
  }

  async function toggleReaction(postId, reactionType) {
    const post = posts.find((item) => item.post_id === postId);
    const removing = post?.my_reaction === reactionType;
    setReactingTo(postId);
    setPosts((current) => current.map((item) => item.post_id === postId ? applyReaction(item, reactionType) : item));
    const response = await fetch(`${API}/api/forum/posts/${postId}/reaction`, {
      method: removing ? "DELETE" : "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: removing ? undefined : JSON.stringify({ reaction_type: reactionType }),
    });
    setReactingTo(null);
    if (!response.ok) {
      setPosts((current) => current.map((item) => item.post_id === postId ? applyReaction(item, reactionType) : item));
      setError("Could not update that reaction.");
    }
  }

  async function toggleSave(postId) {
    const post = posts.find((item) => item.post_id === postId);
    const removing = Boolean(post?.saved_by_me);
    setSavingPost(postId);
    setPosts((current) => current.map((item) => item.post_id === postId ? { ...item, saved_by_me: !removing } : item));
    const response = await fetch(`${API}/api/forum/posts/${postId}/save`, { method: removing ? "DELETE" : "POST", headers });
    setSavingPost(null);
    if (!response.ok) {
      setPosts((current) => current.map((item) => item.post_id === postId ? { ...item, saved_by_me: removing } : item));
      setError("Could not update that saved post.");
    }
  }

  async function createReply(postId, body, mentions) {
    const response = await fetch(`${API}/api/forum/posts/${postId}/comments`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ body, mentioned_user_ids: mentions.map((member) => member.user_id) }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return { ok: false, message: result.message || "Could not post that reply." };
    setPosts((current) => current.map((post) => post.post_id === postId ? {
      ...post,
      comment_count: post.comment_count + 1,
      latest_activity_at: result.created_at,
      comment_preview: [...(post.comment_preview || []), result].slice(-2),
    } : post));
    return { ok: true };
  }

  async function createPost(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const response = await fetch(`${API}/api/forum/posts`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ ...draft, category_id: Number(draft.category_id), mentioned_user_ids: draftMentions.map((member) => member.user_id) }),
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
    <main className="f2-shell">
      {showLoginWelcome && <div className="f2-login-welcome" role="status"><Check size={16} /> Welcome back, {user?.username || "friend"}.</div>}

      <header className="f2-community-header">
        <div><p>Private member community</p><h1>The Community</h1><span>Real conversations, shared experience, and support from people who understand.</span></div>
        <button onClick={openComposer}><Plus size={18} /> Start a conversation</button>
      </header>

      <div className="f2-layout">
        <section className="f2-feed">
          {/* COMPOSER ENTRY: the first thing in the feed is an invitation to
              participate, using the same real create-post modal below. */}
          <button className="f2-compose-prompt" onClick={openComposer}>
            <MemberAvatar username={user?.username} avatarUrl={user?.avatar_url} size={44} />
            <span>What would you like to share, {user?.username}?</span>
            <b><Plus size={16} /> Post</b>
          </button>

          <div className="f2-controls">
            <div className="f2-controls__top">
              <button className="f2-space-trigger" onClick={() => setSpacesOpen(true)}><Compass size={16} /><span>{activeCategoryData?.name || "All spaces"}</span><ChevronDown size={14} /></button>
              <label className="f2-search"><Search size={16} /><input type="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search the community" aria-label="Search conversations" />{searchInput && <button type="button" onClick={() => setSearchInput("")} aria-label="Clear search"><X size={13} /></button>}</label>
            </div>
            <div className="f2-view-tabs" role="group" aria-label="Choose conversation view">
              <button className={sort === "recent" ? "is-active" : ""} onClick={() => setSort("recent")}><Clock3 size={14} /> Latest</button>
              <button className={sort === "discussed" ? "is-active" : ""} onClick={() => setSort("discussed")}><TrendingUp size={14} /> Popular</button>
              <button className={sort === "unanswered" ? "is-active" : ""} onClick={() => setSort("unanswered")}><CircleHelp size={14} /> Needs a reply</button>
              <button className={sort === "mine" ? "is-active" : ""} onClick={() => setSort("mine")}><User size={14} /> Mine</button>
              <button className={sort === "saved" ? "is-active" : ""} onClick={() => setSort("saved")}><Bookmark size={14} /> Saved</button>
            </div>
          </div>

          {error && <p className="f2-error" role="alert">{error}<button onClick={() => setError("")} aria-label="Dismiss"><X size={14} /></button></p>}

          {loading && <div className="f2-skeleton-list" aria-hidden="true">{[0, 1, 2].map((item) => <div className="f2-skeleton-post" key={item} />)}</div>}

          {!loading && !error && visiblePosts.length === 0 && (
            <div className="f2-empty">
              {sort === "unanswered" ? <Check size={30} /> : sort === "saved" ? <Bookmark size={30} /> : <MessageCircle size={30} />}
              <h2>{sort === "unanswered" ? "Everyone has received a reply" : sort === "saved" ? "Nothing saved yet" : "No conversations found"}</h2>
              <p>{sort === "unanswered" ? "That is a wonderful thing. Check back later for someone who may need support." : "Try another space or filter, or start a conversation of your own."}</p>
              {hasFilters && <button onClick={clearFilters}>Clear filters</button>}
            </div>
          )}

          {!loading && visiblePosts.length > 0 && (
            <div className="f2-post-list">
              {visiblePosts.map((post) => (
                <FeedPost
                  key={post.post_id}
                  post={post}
                  token={token}
                  user={user}
                  onReact={toggleReaction}
                  onSave={toggleSave}
                  onReply={createReply}
                  reacting={reactingTo === post.post_id}
                  saving={savingPost === post.post_id}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="f2-sidebar">
          <section className="f2-sidebar-card f2-sidebar-card--spaces">
            <header><div><span>Explore</span><h2>Community spaces</h2></div><b>{categories.length}</b></header>
            <SpaceList categories={categories} totalPostCount={totalPostCount} activeCategory={activeCategory} onSelect={selectCategory} />
          </section>
          <section className="f2-support-card"><LifeBuoy size={22} /><div><h2>Need support right now?</h2><p>Find trusted resources and practical help whenever you need it.</p></div><Link to="/resources">Open support resources</Link></section>
          <Link className="f2-guidelines-link" to="/guidelines"><ShieldCheck size={18} /><span><strong>Community guidelines</strong><small>How we keep this space safe</small></span></Link>
        </aside>
      </div>

      <button className="f2-mobile-compose" onClick={openComposer} aria-label="Start a conversation"><Plus size={23} /></button>

      {spacesOpen && (
        <div className="f2-spaces-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSpacesOpen(false); }}>
          <section className="f2-spaces-sheet" role="dialog" aria-modal="true" aria-label="Choose a community space">
            <header><div><span>Explore</span><h2>Community spaces</h2></div><button onClick={() => setSpacesOpen(false)} aria-label="Close"><X size={19} /></button></header>
            <SpaceList categories={categories} totalPostCount={totalPostCount} activeCategory={activeCategory} onSelect={selectCategory} />
          </section>
        </div>
      )}

      {/* NEW POST MODAL: MentionTextarea collects visible @mentions and the
          selected member IDs travel with the real forum POST request. */}
      {composerOpen && (
        <div className="f2-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setComposerOpen(false); }}>
          <section className="f2-composer" role="dialog" aria-modal="true" aria-labelledby="f2-new-post-title">
            <button className="f2-modal-close" onClick={() => setComposerOpen(false)} aria-label="Close"><X /></button>
            <p>New conversation</p><h2 id="f2-new-post-title">Share with the community</h2>
            <div className="f2-composer__identity"><MemberAvatar username={user?.username} avatarUrl={user?.avatar_url} size={40} /><span>Posting as <strong>{user?.username}</strong></span></div>
            <form onSubmit={createPost}>
              <label>Choose a space<select required value={draft.category_id} onChange={(event) => setDraft({ ...draft, category_id: event.target.value })}><option value="">Select a community space</option>{categories.map((category) => <option key={category.category_id} value={category.category_id}>{category.name}</option>)}</select></label>
              <label>Conversation title<input required maxLength={180} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="What is this about?" /></label>
              <label>Your message<MentionTextarea token={token} rows={8} value={draft.body} onChange={(body) => setDraft((current) => ({ ...current, body }))} mentions={draftMentions} onMentionsChange={setDraftMentions} placeholder="You do not have to have the perfect words." /></label>
              {error && <p className="f2-composer__error" role="alert">{error}</p>}
              <div className="f2-composer__actions"><button type="button" onClick={() => setComposerOpen(false)}>Cancel</button><button type="submit" disabled={submitting}>{submitting ? "Publishing..." : "Share conversation"}</button></div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
