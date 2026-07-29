import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Check, Plus } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import ForumComposerModal from "../components/forum/ForumComposerModal";
import ForumControls from "../components/forum/ForumControls";
import ForumPostList from "../components/forum/ForumPostList";
import ForumSidebar from "../components/forum/ForumSidebar";
import ForumTagManagerModal from "../components/forum/ForumTagManagerModal";
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
    // FORUM LIST TRACE STEP 3: A section, tag, search, sort, or page change
    // reaches this effect. Put those choices in the URL and ask the server for
    // only the matching page. Continue at TRACE STEP 4 in server/api/forum.js.
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
  }, [view, activeTagKey, search, sort, page, headers]);

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

  function selectSort(nextSort) {
    // FORUM LIST TRACE STEP 2C: Latest / Most discussed / My posts / Saved
    // comes here. setSort() changes state, so TRACE STEP 3 makes a fresh API
    // request instead of filtering an old complete list in the browser.
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
      return {
        ...current,
        tag_ids: selected
          ? current.tag_ids.filter((id) => id !== tagId)
          : [...current.tag_ids, tagId],
      };
    });
  }

  async function createPost(event) {
    // CREATE POST TRACE STEP 2: ForumComposerModal's form submits here. Gather
    // the draft into JSON and POST it to the forum API. Continue at CREATE POST
    // TRACE STEP 3 in recovery-community-server/api/forum.js.
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
    // CREATE POST TRACE STEP 6: The API returned the row PostgreSQL inserted.
    // Use its new post_id to open the full thread page.
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
      body: JSON.stringify({
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        active: !tag.active,
      }),
    });
    const result = await response.json();
    if (!response.ok) return setError(result.message || "Could not update that tag.");
    setTags((current) => current.map((item) => item.tag_id === tag.tag_id ? { ...item, ...result } : item));
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
          <h1>A place to be heard.</h1>
          <p>
            Share what is happening, ask a question, or simply let the community know you&rsquo;re here.
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
            sort={sort}
            onViewChange={setView}
            onTagChange={selectTag}
            onSearchInputChange={setSearchInput}
            onSortChange={selectSort}
          />
          <ForumPostList
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

      {/* SCREEN SECTION: The Start a post modal. Submitting it follows the
          separate createPost() write path, not the forum-list query above. */}
      {composerOpen && (
        <ForumComposerModal
          user={user}
          token={token}
          composingAnnouncement={composingAnnouncement}
          draft={draft}
          setDraft={setDraft}
          draftMentions={draftMentions}
          setDraftMentions={setDraftMentions}
          tags={tags}
          onToggleTag={toggleDraftTag}
          error={error}
          submitting={submitting}
          onSubmit={createPost}
          onClose={() => setComposerOpen(false)}
        />
      )}

      {tagManagerOpen && (
        <ForumTagManagerModal
          tags={tags}
          newTagName={newTagName}
          setNewTagName={setNewTagName}
          onCreateTag={createTag}
          onToggleTagActive={toggleTagActive}
          onClose={() => setTagManagerOpen(false)}
        />
      )}
    </main>
  );
}
