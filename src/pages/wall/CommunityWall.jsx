import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, Flame, MessageCircle, Plus, Sparkles } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import MemberAvatar from "../../components/MemberAvatar";
import ProtectedImage from "../../components/forumPhotos/ProtectedImage";
import { useLounge } from "../../contexts/LoungeContext";
import { getLoungeActivity } from "../../utils/loungeActivity";
import "./CommunityWall.css";

const API = import.meta.env.VITE_API;
const NOTE_STYLES = [
  { color: "sage", tilt: "-1.4deg" },
  { color: "sun", tilt: "1.1deg" },
  { color: "clay", tilt: "-.7deg" },
  { color: "cream", tilt: "1.6deg" },
  { color: "blue", tilt: "-.9deg" },
];

function timeAgo(value) {
  if (!value) return "Recently";
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function CommunityWall() {
  const { token } = useAuth();
  const { status: loungeStatus, openLounge } = useLounge();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadMoreRef = useRef(null);
  const wallRef = useRef(null);
  const loungeActivity = getLoungeActivity(loungeStatus);
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      section: "community",
      scope: "all",
      order: "recent",
      page: String(page),
    });
    fetch(`${API}/api/forum/posts?${params}`, { headers, signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "The Wall could not be loaded.");
        setPosts((current) => page === 0 ? data.posts : [
          ...current,
          ...data.posts.filter((post) => !current.some((existing) => existing.post_id === post.post_id)),
        ]);
        setHasMore(data.has_more);
        setError("");
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
          setHasMore(false);
        }
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [headers, page]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || loading || !hasMore) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setLoading(true);
        setPage((current) => current + 1);
      }
    }, { rootMargin: "500px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  useEffect(() => {
    const notes = wallRef.current?.querySelectorAll(".community-wall__note:not(.is-visible)") || [];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6%" });
    notes.forEach((note) => observer.observe(note));
    return () => observer.disconnect();
  }, [posts]);

  return (
    <main className="community-wall" data-nav-theme="dark">
      <section className="community-wall__hero">
        <div className="community-wall__hero-glow" />
        <div className="community-wall__hero-copy">
          <p><Sparkles size={14} /> The community, together</p>
          <h1>The Wall</h1>
          <blockquote>“A living record of the people, conversations, and moments that make this place ours.”</blockquote>
          <div className="community-wall__hero-actions">
            <Link to="/forum" state={{ openComposer: true }}><Plus size={17} /> Add your voice</Link>
            <button type="button" onClick={openLounge}><Flame size={17} /> Open the Lounge</button>
          </div>
        </div>

        <aside className="community-wall__presence">
          <span className={`community-wall__presence-light lounge-activity--${loungeActivity.level}`} />
          <div><small>Happening now</small><strong>{loungeActivity.label}</strong><p>{loungeStatus.participants_today || 0} voices have gathered today.</p></div>
          <div className="community-wall__faces">
            {loungeStatus.recent_people.slice(0, 5).map((person) => (
              <MemberAvatar key={person.user_id} username={person.username} avatarUrl={person.avatar_url} size={40} />
            ))}
          </div>
        </aside>

        <a className="community-wall__scroll" href="#community-notes"><span>See what the community is sharing</span><ArrowDown size={18} /></a>
      </section>

      <section className="community-wall__board" id="community-notes" ref={wallRef}>
        <header>
          <div><p>Written by the community</p><h2>Every note belongs to someone.</h2></div>
          <Link to="/forum">See the forum <ArrowRight size={16} /></Link>
        </header>

        {error && <p className="community-wall__error">{error}</p>}
        <div className="community-wall__notes">
          {posts.map((post, index) => {
            const noteStyle = NOTE_STYLES[index % NOTE_STYLES.length];
            const firstImage = post.images?.[0];
            return (
              <article
                className={`community-wall__note community-wall__note--${noteStyle.color} ${firstImage ? "has-photo" : ""}`}
                style={{ "--note-tilt": noteStyle.tilt, "--note-delay": `${(index % 6) * 55}ms` }}
                key={post.post_id}
              >
                <span className="community-wall__pin" />
                {firstImage && <div className="community-wall__photo"><ProtectedImage mediaId={firstImage.media_id} token={token} thumbnail alt={`Shared by ${post.author_username}`} /></div>}
                <Link to={`/forum/${post.post_id}`}>
                  <div className="community-wall__author"><MemberAvatar username={post.author_username} avatarUrl={post.author_avatar_url} size={34} /><span><strong>{post.author_username}</strong><small>{timeAgo(post.latest_activity_at || post.created_at)}</small></span></div>
                  <h3>{post.title}</h3>
                  <p>{post.body}</p>
                  <footer><span><MessageCircle size={14} /> {post.comment_count || 0}</span><span>{post.reaction_count || 0} supportive reactions</span><ArrowRight size={15} /></footer>
                </Link>
              </article>
            );
          })}
        </div>

        {!loading && posts.length === 0 && !error && <div className="community-wall__empty"><h2>The first note is waiting.</h2><p>Start a conversation and help bring the Wall to life.</p><Link to="/forum" state={{ openComposer: true }}>Add the first note</Link></div>}
        <div className="community-wall__loader" ref={loadMoreRef}>{loading ? <span>Gathering more voices…</span> : hasMore ? <span>Keep scrolling</span> : posts.length > 0 && <span>You have reached the beginning of the Wall.</span>}</div>
      </section>
    </main>
  );
}
