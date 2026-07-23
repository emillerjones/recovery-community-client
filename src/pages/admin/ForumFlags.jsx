import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { Toast, useToast } from "../../components/Toast";
import "./ForumFlags.css";

const API = import.meta.env.VITE_API;

function snippet(text, max = 140) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

export default function ForumFlags() {
  const { token } = useAuth();
  const { toast, showToast } = useToast();
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API}/api/forum/moderation/flags`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Could not load flagged content.");
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;
        setPosts(data.posts || []);
        setComments(data.comments || []);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [token]);

  async function reviewPost(postId) {
    const response = await fetch(`${API}/api/forum/moderation/flags/posts/${postId}/review`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      setPosts((current) => current.filter((post) => post.post_id !== postId));
      showToast("Flags marked reviewed.");
    } else {
      showToast("Could not mark those flags reviewed.");
    }
  }

  async function reviewComment(commentId) {
    const response = await fetch(`${API}/api/forum/moderation/flags/comments/${commentId}/review`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      setComments((current) => current.filter((comment) => comment.comment_id !== commentId));
      showToast("Flags marked reviewed.");
    } else {
      showToast("Could not mark those flags reviewed.");
    }
  }

  return (
    <div className="forum-flags">
      <div className="forum-flags__header">
        <div>
          <h1>Flagged Content</h1>
          <p className="forum-flags__subtitle">
            Member-flagged posts and replies, with the most-flagged content first.
            Marking flags reviewed removes them from this queue but does not delete the content.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="forum-flags__loading">Loading flagged content…</p>
      ) : (
        <>
          <section className="forum-flags__section">
            <h2>Posts <span>{posts.length}</span></h2>
            {posts.length === 0 && <p className="forum-flags__empty">No posts are waiting for review.</p>}
            {posts.map((post) => (
              <div className="forum-flags__row" key={post.post_id}>
                <div className="forum-flags__count">{post.flag_count}</div>
                <div className="forum-flags__body">
                  <strong>{post.title}</strong>
                  <p>{snippet(post.body)}</p>
                  <span className="forum-flags__meta">
                    by {post.author_username} · last flagged {new Date(post.last_flagged_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="forum-flags__actions">
                  <Link to={`/forum2/${post.post_id}`}>View thread</Link>
                  <button onClick={() => reviewPost(post.post_id)}>Mark reviewed</button>
                </div>
              </div>
            ))}
          </section>

          <section className="forum-flags__section">
            <h2>Replies <span>{comments.length}</span></h2>
            {comments.length === 0 && <p className="forum-flags__empty">No replies are waiting for review.</p>}
            {comments.map((comment) => (
              <div className="forum-flags__row" key={comment.comment_id}>
                <div className="forum-flags__count">{comment.flag_count}</div>
                <div className="forum-flags__body">
                  <strong>Reply by {comment.author_username}</strong>
                  <p>{snippet(comment.body)}</p>
                  <span className="forum-flags__meta">
                    last flagged {new Date(comment.last_flagged_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="forum-flags__actions">
                  <Link to={`/forum2/${comment.post_id}`}>View thread</Link>
                  <button onClick={() => reviewComment(comment.comment_id)}>Mark reviewed</button>
                </div>
              </div>
            ))}
          </section>
        </>
      )}

      <Toast toast={toast} />
    </div>
  );
}
