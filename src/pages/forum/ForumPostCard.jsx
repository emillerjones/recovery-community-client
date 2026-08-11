import { Link } from "react-router-dom";
import {
  HeartHandshake,
  Lock,
  Megaphone,
  MessageCircle,
} from "lucide-react";
import MemberAvatar from "../../components/MemberAvatar";
import ForumPhotoGallery from "../../components/forumPhotos/ForumPhotoGallery";

function timeAgo(value) {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function ForumPostCard({ post, token }) {
  // FORUM LIST TRACE STEP 7: Forum.jsx maps one object from its `posts` state
  // into this component. That object began as one row from the posts table;
  // the list SQL also attached its author, tags, comment count, and reactions.
  // Everything below is display-only. Clicking the invisible Link opens the
  // separate ForumThread page for this post_id.
  const reactionCount = Number(post.reaction_count || 0);

  return (
    <article
      className={`forum-feed-card ${
        post.category_slug === "announcements" ? "forum-feed-card--announcement" : ""
      }`}
    >
      <Link
        className="forum-feed-card__link"
        to={`/forum/${post.post_id}`}
        aria-label={`Open ${post.title}`}
      />
      <header className="forum-feed-card__author">
        <MemberAvatar
          username={post.author_username}
          avatarUrl={post.author_avatar_url}
          size={44}
        />
        <div>
          <strong>{post.author_username}</strong>
          <span>{timeAgo(post.latest_activity_at)}</span>
        </div>
        {post.category_slug === "announcements" && (
          <b className="forum-feed-official">
            <Megaphone size={12} /> Official
          </b>
        )}
        {post.locked && <Lock className="forum-feed-card__lock" size={15} />}
      </header>
      <div className="forum-feed-card__content">
        <div className="forum-feed-card__tags">
          {post.is_unread && <span className="is-new">NEW</span>}
          {(post.tags || []).map((tag) => <span key={tag.tag_id}>#{tag.slug}</span>)}
        </div>
        <h2>{post.title}</h2>
        <p>{post.body}</p>
        <ForumPhotoGallery images={post.images} token={token} compact label={`Photo from ${post.author_username}`} />
      </div>
      <footer>
        <span>
          <MessageCircle size={15} /> {post.comment_count}{" "}
          {post.comment_count === 1 ? "reply" : "replies"}
        </span>
        {reactionCount > 0 && (
          <span>
            <HeartHandshake size={15} /> {reactionCount}{" "}
            {reactionCount === 1 ? "reaction" : "reactions"}
          </span>
        )}
        {post.pinned && <strong>PINNED BY STAFF</strong>}
      </footer>
    </article>
  );
}
