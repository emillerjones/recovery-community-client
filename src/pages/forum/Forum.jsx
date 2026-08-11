import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Check, Plus } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import WelcomeOverlay from "../../components/WelcomeOverlay";
import ForumComposerModal from "./ForumComposerModal";
import ForumControls from "./ForumControls";
import ForumPostList from "./ForumPostList";
import ForumSidebar from "./ForumSidebar";
import ForumTagManagerModal from "./ForumTagManagerModal";
import "./Forum.css";

const API = import.meta.env.VITE_API;
const SEARCH_DEBOUNCE_MS = 350;

export default function Forum() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get("view") === "announcements" ? "announcements" : "community";
  const activeTagKey = searchParams.get("tags") || "";
  const showWelcomeOverlay = searchParams.get("welcome") === "1";
  const activeTags = activeTagKey.split(",").filter(Boolean);
  const isStaff = user?.role_id <= 50;
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  // This is the list behind the cards. The API returns `data.posts`,
  // setPosts() saves that array here, and the JSX below maps each object to a
  // <PostCard />. Changing this state makes React redraw the list.
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [tagManagerOpen, setTagManagerOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState("all");
  const [order, setOrder] = useState("recent");
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
    // Categories and the staff-controlled tags support the tabs and composer.
    // The actual list of post cards is loaded by the next effect.
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
    // FORUM LIST TRACE STEP 3: A section, tag, search, scope, order, or page change
    // reaches this effect. Put those choices in the URL and ask the server for
    // only the matching page. Continue at TRACE STEP 4 in server/api/forum.js.
    const controller = new AbortController();
    const params = new URLSearchParams();
    params.set("section", view);
    if (activeTagKey) params.set("tags", activeTagKey);
    if (search) params.set("search", search);
    params.set("scope", scope);
    params.set("order", order);
    params.set("page", String(page));
    fetch(`${API}/api/forum/posts?${params}`, { headers, signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Could not load conversations.");
        setError("");
        // FORUM LIST TRACE STEP 6: PostgreSQL's results are back. Page zero
        // replaces the screen; later pages append for infinite scrolling.
        // setPosts() then causes the card JSX near the bottom to render again.
        setPosts((current) => page === 0 ? data.posts : [
          ...current,
          ...data.posts.filter((post) => !current.some((existing) => existing.post_id === post.post_id)),
        ]);
        setHasMore(data.has_more);
      })
      .catch((requestError) => { if (requestError.name !== "AbortError") setError(requestError.message); })
      .finally(() => { if (!controller.signal.aborted) { setLoading(false); setLoadingMore(false); } });
    return () => controller.abort();
  }, [view, activeTagKey, search, scope, order, page, headers]);

  useEffect(() => {
    // Infinite scrolling does not load the entire posts table. When this
    // invisible marker gets close, increment `page`; TRACE STEP 3 then asks
    // the server for the next 20 matching rows.
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
  // No extra database call happens here. We only divide the post objects that
  // are already in state into two visual groups on the screen.
  const pinnedPosts = useMemo(() => posts.filter((post) => post.pinned), [posts]);
  const regularPosts = useMemo(() => posts.filter((post) => !post.pinned), [posts]);

  function setView(nextView) {
    // FORUM LIST TRACE STEP 2A: Main Forum / Announcements comes here first.
    // Changing the URL changes `view`, which makes TRACE STEP 3 fetch again.
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
    // FORUM LIST TRACE STEP 2B: Tag buttons come here. Selected slugs live in
    // the URL so stacked filters remain visible/shareable; that URL change
    // makes TRACE STEP 3 fetch the newly filtered list.
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

  function applyFilters(nextFilters) {
    // FORUM LIST TRACE STEP 2C: The filter panel sends three separate choices:
    // whose posts to show, how to order them, and which tags must match.
    // Updating them makes TRACE STEP 3 request a fresh page from the server.
    const currentTagsKey = [...activeTags].sort().join(",");
    const nextTagsKey = [...nextFilters.tags].sort().join(",");
    if (
      nextFilters.scope === scope
      && nextFilters.order === order
      && nextTagsKey === currentTagsKey
    ) {
      // Closing an unchanged panel should leave the already-loaded cards alone.
      return;
    }
    setPosts([]);
    setPage(0);
    setLoading(true);
    setScope(nextFilters.scope);
    setOrder(nextFilters.order);
    const next = {};
    if (view === "announcements") next.view = "announcements";
    if (nextFilters.tags.length) next.tags = nextFilters.tags.join(",");
    setSearchParams(next);
  }

  async function markAllRead() {
    // READ TRACE STEP 1B: The filter panel's button reaches this authenticated
    // request. Continue in server/api/forum.js at PATCH /posts/read-all.
    try {
      const response = await fetch(`${API}/api/forum/posts/read-all`, {
        method: "PATCH",
        headers,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not mark conversations read.");
      setError("");
      setPosts((current) => current.map((post) => ({ ...post, is_unread: false })));
      return true;
    } catch (requestError) {
      setError(requestError.message);
      return false;
    }
  }

  return (
    <main className="forum-feed-page">
      {showLoginWelcome && (
        <div className="forum-feed-login-welcome">
          <Check size={16} /> Welcome back, {user?.username}.
        </div>
      )}

      <section className="forum-feed-hero">
        <div className="forum-feed-hero__copy">
          <p className="forum-feed-eyebrow">Private member community</p>
          <h1>
            <span className="forum-feed-hero__desktop-title">A place to be heard.</span>
            <span className="forum-feed-hero__mobile-title">Community Forum</span>
          </h1>
          <p>
            <span className="forum-feed-hero__desktop-description">
              Share what is happening, ask a question, or simply let the community know you&rsquo;re here.
            </span>
            <span className="forum-feed-hero__mobile-description">A place to be heard.</span>
          </p>
        </div>
        {(view === "community" || isStaff) && (
          <button className="forum-feed-create" onClick={() => setComposerOpen(true)}>
            <Plus size={18} />
            {view === "announcements" ? "Post an announcement" : "Start a post"}
          </button>
        )}
      </section>

      <section className="forum-feed-shell">
        <div className="forum-feed-main">
          <ForumControls
            view={view}
            tags={tags}
            activeTags={activeTags}
            searchInput={searchInput}
            scope={scope}
            order={order}
            onViewChange={setView}
            onSearchInputChange={setSearchInput}
            onApplyFilters={applyFilters}
            onMarkAllRead={markAllRead}
          />
          <ForumPostList
            token={token}
            view={view}
            activeTags={activeTags}
            posts={posts}
            pinnedPosts={pinnedPosts}
            regularPosts={regularPosts}
            error={error}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            loadMoreRef={loadMoreRef}
            onStartPost={() => setComposerOpen(true)}
          />
        </div>

        {/* SCREEN SECTION: Supporting cards in the desktop right rail. They use
            already-loaded data and do not render the main post-card list. */}
        <ForumSidebar
          tags={tags}
          isStaff={isStaff}
          onSelectTag={selectTag}
          onManageTags={() => setTagManagerOpen(true)}
        />
      </section>

      {/* SCREEN SECTION: Forum keeps this mounted so an unfinished draft
          survives closing and reopening. The modal owns its form state and
          createPost() request; `open` controls whether it is visible. */}
      <ForumComposerModal
        open={composerOpen}
        user={user}
        token={token}
        categoryId={composingAnnouncement
          ? announcementCategory?.category_id
          : mainCategory?.category_id}
        canPublish={view !== "announcements" || isStaff}
        composingAnnouncement={composingAnnouncement}
        tags={tags}
        onClose={() => setComposerOpen(false)}
      />

      {tagManagerOpen && (
        <ForumTagManagerModal
          tags={tags}
          token={token}
          onTagCreated={(newTag) => {
            // TAG CREATE TRACE STEP 3: The modal finished the API request.
            // Add the returned tag to Forum's shared list so the screen rerenders.
            setTags((current) => [
              ...current,
              { ...newTag, post_count: 0 },
            ]);
          }}
          onTagUpdated={(updatedTag) => {
            // TAG STATUS TRACE STEP 3: The modal finished the API request.
            // Replace that tag in Forum's shared state with its updated version.
            setTags((current) => current.map((tag) => (
              tag.tag_id === updatedTag.tag_id
                ? { ...tag, ...updatedTag }
                : tag
            )));
          }}
          onClose={() => setTagManagerOpen(false)}
        />
      )}

      {/* The real forum above is already loaded behind this fixed layer.
          Opening the doors removes only the overlay; it does not load a
          second forum or navigate away from this page. */}
      {showWelcomeOverlay && (
        <WelcomeOverlay
          onComplete={() => {
            const nextParams = new URLSearchParams(searchParams);
            nextParams.delete("welcome");
            setSearchParams(nextParams, { replace: true });
          }}
        />
      )}
    </main>
  );
}
