import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { Toast, useToast } from "../../components/Toast";
import "./ForumReports.css";

const API = import.meta.env.VITE_API;

function snippet(text, max = 140) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

export default function ForumReports() {
  const { token } = useAuth();
  const { toast, showToast } = useToast();
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const response = await fetch(`${API}/api/forum/moderation/reports`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setPosts(data.posts || []);
    setComments(data.comments || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [token]);

  async function resolvePost(postId) {
    const response = await fetch(`${API}/api/forum/moderation/reports/posts/${postId}/resolve`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      setPosts((current) => current.filter((post) => post.post_id !== postId));
      showToast("Report cleared.");
    } else {
      showToast("Could not clear that report.");
    }
  }

  async function resolveComment(commentId) {
    const response = await fetch(`${API}/api/forum/moderation/reports/comments/${commentId}/resolve`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      setComments((current) => current.filter((comment) => comment.comment_id !== commentId));
      showToast("Report cleared.");
    } else {
      showToast("Could not clear that report.");
    }
  }

  return (
    <div className="forum-reports">
      <div className="forum-reports__header">
        <div>
          <h1>Reported Content</h1>
          <p className="forum-reports__subtitle">
            Flagged posts and replies, most-reported first. Clearing a report only removes it
            from this queue — it doesn&rsquo;t change or hide the content. Use the thread itself
            to pin, lock, or delete.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="forum-reports__loading">Loading reports…</p>
      ) : (
        <>
          <section className="forum-reports__section">
            <h2>Posts <span>{posts.length}</span></h2>
            {posts.length === 0 && <p className="forum-reports__empty">No open post reports.</p>}
            {posts.map((post) => (
              <div className="forum-reports__row" key={post.post_id}>
                <div className="forum-reports__count">{post.report_count}</div>
                <div className="forum-reports__body">
                  <strong>{post.title}</strong>
                  <p>{snippet(post.body)}</p>
                  <span className="forum-reports__meta">
                    by {post.author_username} · last reported {new Date(post.last_reported_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="forum-reports__actions">
                  <Link to={`/forum2/${post.post_id}`}>View thread</Link>
                  <button onClick={() => resolvePost(post.post_id)}>Clear</button>
                </div>
              </div>
            ))}
          </section>

          <section className="forum-reports__section">
            <h2>Replies <span>{comments.length}</span></h2>
            {comments.length === 0 && <p className="forum-reports__empty">No open reply reports.</p>}
            {comments.map((comment) => (
              <div className="forum-reports__row" key={comment.comment_id}>
                <div className="forum-reports__count">{comment.report_count}</div>
                <div className="forum-reports__body">
                  <strong>Reply by {comment.author_username}</strong>
                  <p>{snippet(comment.body)}</p>
                  <span className="forum-reports__meta">
                    last reported {new Date(comment.last_reported_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="forum-reports__actions">
                  <Link to={`/forum2/${comment.post_id}`}>View thread</Link>
                  <button onClick={() => resolveComment(comment.comment_id)}>Clear</button>
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
