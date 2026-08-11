import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, Compass, HeartHandshake, MapPin, MessageCircle, Plus, Sparkles } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import MemberAvatar from "../../components/MemberAvatar";
import ProtectedImage from "../../components/forumPhotos/ProtectedImage";
import ForumComposerModal from "../forum/ForumComposerModal";
import "./CommunityJourney.css";

const API = import.meta.env.VITE_API;
const MARKER_TONES = ["gold", "sage", "clay", "blue", "cream"];

function timeAgo(value) {
  if (!value) return "Recently";
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function CommunityJourney() {
  const { token, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [composerOpen, setComposerOpen] = useState(false);
  const [newMarkerId, setNewMarkerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const worldRef = useRef(null);
  const trackRef = useRef(null);
  const backLayerRef = useRef(null);
  const middleLayerRef = useRef(null);
  const activeIndexRef = useRef(0);
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const loadJourney = useCallback(async () => {
    const [postResponse, categoryResponse, tagResponse] = await Promise.all([
      fetch(`${API}/api/forum/posts?section=community&scope=all&order=recent&page=0`, { headers }),
      fetch(`${API}/api/forum/categories`, { headers }),
      fetch(`${API}/api/forum/tags`, { headers }),
    ]);
    const [postData, categoryData, tagData] = await Promise.all([
      postResponse.json(), categoryResponse.json(), tagResponse.json(),
    ]);
    if (!postResponse.ok || !categoryResponse.ok || !tagResponse.ok) {
      throw new Error(postData.message || "The Journey could not be loaded.");
    }
    setPosts(postData.posts);
    setCategories(categoryData);
    setTags(tagData);
  }, [headers]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(`${API}/api/forum/posts?section=community&scope=all&order=recent&page=0`, { headers }),
      fetch(`${API}/api/forum/categories`, { headers }),
      fetch(`${API}/api/forum/tags`, { headers }),
    ])
      .then(async ([postResponse, categoryResponse, tagResponse]) => {
        const [postData, categoryData, tagData] = await Promise.all([postResponse.json(), categoryResponse.json(), tagResponse.json()]);
        if (!postResponse.ok || !categoryResponse.ok || !tagResponse.ok) throw new Error(postData.message || "The Journey could not be loaded.");
        if (!cancelled) {
          setPosts(postData.posts);
          setCategories(categoryData);
          setTags(tagData);
          setError("");
        }
      })
      .catch((requestError) => { if (!cancelled) setError(requestError.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [headers]);

  useEffect(() => {
    let frameId;
    function moveCamera() {
      frameId = 0;
      const world = worldRef.current;
      const track = trackRef.current;
      if (!world || !track) return;
      const rect = world.getBoundingClientRect();
      const scrollDistance = Math.max(1, world.offsetHeight - window.innerHeight);
      const progress = Math.max(0, Math.min(1, -rect.top / scrollDistance));
      const travel = Math.max(0, track.scrollWidth - window.innerWidth);
      track.style.transform = `translate3d(${-progress * travel}px,0,0)`;
      if (backLayerRef.current) backLayerRef.current.style.transform = `translate3d(${-progress * travel * .11}px,0,0)`;
      if (middleLayerRef.current) middleLayerRef.current.style.transform = `translate3d(${-progress * travel * .24}px,0,0)`;
      const nextIndex = Math.min(posts.length - 1, Math.max(0, Math.round(progress * Math.max(0, posts.length - 1))));
      if (nextIndex !== activeIndexRef.current) {
        activeIndexRef.current = nextIndex;
        setActiveIndex(nextIndex);
      }
    }
    function queueCamera() {
      if (!frameId) frameId = window.requestAnimationFrame(moveCamera);
    }
    moveCamera();
    window.addEventListener("scroll", queueCamera, { passive: true });
    window.addEventListener("resize", queueCamera);
    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", queueCamera);
      window.removeEventListener("resize", queueCamera);
    };
  }, [posts.length]);

  const mainCategory = categories.find((category) => category.slug === "general-recovery")
    || categories.find((category) => !["announcements", "success-stories"].includes(category.slug));
  const worldHeight = `${Math.max(2.2, posts.length * .68 + 1.3) * 100}vh`;

  async function markerPublished(post) {
    setComposerOpen(false);
    setNewMarkerId(post.post_id);
    try {
      await loadJourney();
      window.requestAnimationFrame(() => window.scrollTo({
        top: (worldRef.current?.offsetTop || 0) + 8,
        behavior: "smooth",
      }));
      window.setTimeout(() => setNewMarkerId(null), 3500);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <main className="community-journey" data-nav-theme="dark">
      <section className="community-journey__opening">
        <div className="community-journey__opening-sun" />
        <div className="community-journey__opening-copy">
          <p><Compass size={15} /> The community in motion</p>
          <h1>Our Journey</h1>
          <blockquote>Every conversation leaves a marker. Every reply reminds us that we are traveling together.</blockquote>
          <div><button type="button" onClick={() => setComposerOpen(true)}><Plus size={17} /> Place a new marker</button><a href="#journey-world">Begin the journey <ArrowDown size={16} /></a></div>
        </div>
        <div className="community-journey__opening-path"><i /><i /><i /><i /></div>
      </section>

      <section className="community-journey__world" id="journey-world" ref={worldRef} style={{ height: worldHeight }}>
        <div className="community-journey__stage">
          <header className="community-journey__hud">
            <span><MapPin size={14} /><strong>{posts.length ? activeIndex + 1 : 0}</strong> of {posts.length} recent markers</span>
            <button type="button" onClick={() => setComposerOpen(true)}><Plus size={15} /> Place a marker</button>
          </header>

          <div className="community-journey__sky" />
          <div className="community-journey__mountains community-journey__mountains--back" ref={backLayerRef} />
          <div className="community-journey__mountains community-journey__mountains--middle" ref={middleLayerRef} />
          <div className="community-journey__ground" />
          <div className="community-journey__track" ref={trackRef}>
            <div className="community-journey__trail" />
            {posts.map((post, index) => {
              const firstImage = post.images?.[0];
              const reactionCount = Number(post.reaction_count || 0);
              return (
                <article
                  className={`community-journey__marker tone-${MARKER_TONES[index % MARKER_TONES.length]} ${activeIndex === index ? "is-active" : ""} ${newMarkerId === post.post_id ? "is-arriving" : ""}`}
                  style={{ "--marker-y": `${index % 3 === 0 ? 1 : index % 3 === 1 ? -1 : 0}` }}
                  key={post.post_id}
                >
                  <span className="community-journey__marker-post"><MapPin size={18} /></span>
                  {firstImage && <div className="community-journey__marker-photo"><ProtectedImage mediaId={firstImage.media_id} token={token} thumbnail alt={`Shared by ${post.author_username}`} /></div>}
                  <div className="community-journey__marker-body">
                    <header><MemberAvatar username={post.author_username} avatarUrl={post.author_avatar_url} size={39} /><span><strong>{post.author_username}</strong><small>{timeAgo(post.latest_activity_at)}</small></span></header>
                    <div className="community-journey__marker-tags">{post.is_unread && <b>NEW</b>}{post.tags?.slice(0, 2).map((tag) => <span key={tag.tag_id}>#{tag.slug}</span>)}</div>
                    <h2>{post.title}</h2><p>{post.body}</p>
                    <footer><span><MessageCircle size={14} />{post.comment_count || 0}</span>{reactionCount > 0 && <span><HeartHandshake size={14} />{reactionCount}</span>}<Link to={`/forum/${post.post_id}`}>Enter conversation <ArrowRight size={14} /></Link></footer>
                  </div>
                  {newMarkerId === post.post_id && <div className="community-journey__arrival"><Sparkles />Your marker joined the journey</div>}
                </article>
              );
            })}
            <div className="community-journey__trail-end"><Compass size={26} /><strong>The trail continues.</strong><Link to="/forum">Explore the complete Forum</Link></div>
          </div>

          {loading && <div className="community-journey__loading">Preparing the trail…</div>}
          {error && <div className="community-journey__error">{error}</div>}
          {!loading && !error && posts.length === 0 && <div className="community-journey__empty"><strong>No markers yet.</strong><button type="button" onClick={() => setComposerOpen(true)}>Place the first one</button></div>}
          <div className="community-journey__scroll-hint"><ArrowDown size={15} /><span>Scroll to travel</span></div>
        </div>
      </section>

      <section className="community-journey__closing"><p>The path is made by participation.</p><h2>Your words do not disappear into a feed. They become part of where this community has been.</h2><button type="button" onClick={() => setComposerOpen(true)}>Leave something here</button></section>

      <ForumComposerModal open={composerOpen} user={user} token={token} categoryId={mainCategory?.category_id} canPublish composingAnnouncement={false} tags={tags} onClose={() => setComposerOpen(false)} onPublished={markerPublished} />
    </main>
  );
}
