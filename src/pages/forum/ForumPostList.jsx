import { HeartHandshake, Pin } from "lucide-react";
import ForumPostCard from "./ForumPostCard";

export default function ForumPostList({
  token,
  view,
  activeTags,
  posts,
  pinnedPosts,
  regularPosts,
  error,
  loading,
  loadingMore,
  hasMore,
  loadMoreRef,
  onStartPost,
}) {
  return (
    <>
      {error && (
        <p className="forum-feed-error" role="alert">
          {error}
        </p>
      )}
      {loading && <div className="forum-feed-loading">Loading conversations…</div>}
      {!loading && !error && posts.length === 0 && (
        <div className="forum-feed-empty">
          <HeartHandshake size={30} />
          <h2>
            {view === "announcements" ? "No announcements yet" : "No conversations found"}
          </h2>
          <p>
            {activeTags.length
              ? "Try removing a tag or view all tags."
              : "A thoughtful question or honest update is enough to begin."}
          </p>
          {view === "community" && <button onClick={onStartPost}>Start a post</button>}
        </div>
      )}

      {/* FORUM LIST TRACE STEP 7A: Forum.jsx already split its `posts` state.
          Mapping here turns each returned object into a visible card. */}
      {pinnedPosts.length > 0 && (
        <section className="forum-feed-pinned" aria-labelledby="pinned-posts-heading">
          <header>
            <span><Pin size={15} /></span>
            <div>
              <h2 id="pinned-posts-heading">Pinned by staff</h2>
              <p>Important conversations selected by the community team.</p>
            </div>
          </header>
          <div className="forum-feed-feed">
            {pinnedPosts.map((post) => (
              <ForumPostCard key={post.post_id} post={post} token={token} />
            ))}
          </div>
        </section>
      )}

      {/* FORUM LIST TRACE STEP 7B: Regular post objects use the same card. */}
      {regularPosts.length > 0 && (
        <section className="forum-feed-regular" aria-labelledby="latest-posts-heading">
          <header>
            <h2 id="latest-posts-heading">Latest conversations</h2>
            <span>
              {activeTags.length
                ? "Matching selected tags"
                : view === "announcements"
                  ? "Staff updates"
                  : "From across the community"}
            </span>
          </header>
          <div className="forum-feed-feed">
            {regularPosts.map((post) => (
              <ForumPostCard key={post.post_id} post={post} token={token} />
            ))}
          </div>
        </section>
      )}

      <div className="forum-feed-load-more" ref={loadMoreRef} aria-live="polite">
        {loadingMore
          ? "Loading more conversations…"
          : hasMore
            ? "Scroll for more"
            : posts.length > 0
              ? "You’re all caught up"
              : ""}
      </div>
    </>
  );
}
