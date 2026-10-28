import { useEffect, useId, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { Toast, useToast } from "../../components/Toast";
import MemberAvatar from "../../components/MemberAvatar";
import "./ForumFlags.css";

const API = import.meta.env.VITE_API;

function ReportCard({ item, isPost = false, onReview }) {
  const [expanded, setExpanded] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const contentId = useId();
  const body = item.body || "";
  const long = body.length > 140;
  const kind = isPost ? "post" : item.parent_comment_id ? "reply" : "comment";
  const visibleBody = expanded || !long ? body : body.slice(0, 140).trimEnd() + "…";
  const threadLink = "/forum/" + item.post_id + (isPost ? "" : "#comment-" + item.comment_id);

  async function review() {
    if (reviewing) return;
    setReviewing(true); setReviewError("");
    try { await onReview(); }
    catch { setReviewError("Could not mark these reports reviewed. Please try again."); }
    finally { setReviewing(false); }
  }

  return <article className="forum-flags__card" aria-label={"Reported " + kind + " by " + item.author_username}>
    <header className="forum-flags__card-heading">
      <span>Reported {kind}</span>
      <span className="forum-flags__count">{item.flag_count} {item.flag_count === 1 ? "report" : "reports"}</span>
    </header>
    <div className="forum-flags__content">
      <MemberAvatar username={item.author_username} avatarUrl={item.author_avatar_url} size={44} />
      <div className="forum-flags__body">
        <strong className="forum-flags__author">{item.author_username}</strong>
        <small className="forum-flags__meta">{item.created_at ? new Date(item.created_at).toLocaleString() : "Last reported " + new Date(item.last_flagged_at).toLocaleString()}</small>
        {isPost && <h3>{item.title}</h3>}
        <p id={contentId} className="forum-flags__reported-text">{visibleBody}</p>
        {long && <button type="button" className="forum-flags__expand" aria-expanded={expanded} aria-controls={contentId} onClick={() => setExpanded(current => !current)}>
          {expanded ? "Show less" : "Show full " + kind}{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>}
      </div>
    </div>
    <section className="forum-flags__report-section" aria-label="Reports to Admin">
      <h4>Reports to Admin</h4>
      <ul className="forum-flags__reports">{(item.reports || []).map(report => <li key={report.flag_id}>
        <div className="forum-flags__reporter">
          <MemberAvatar username={report.reporter_username} avatarUrl={report.reporter_avatar_url} size={36} />
          <div><small>Reported by</small><strong>{report.reporter_username}</strong><small>{new Date(report.created_at).toLocaleString()}</small></div>
        </div>
        <div className="forum-flags__reason"><small>Reason</small><p>{report.reason || "No explanation provided (earlier report)."}</p></div>
      </li>)}</ul>
    </section>
    <footer className="forum-flags__actions">
      {reviewError && <p role="alert">{reviewError}</p>}
      <Link to={threadLink}>View thread</Link>
      <button type="button" disabled={reviewing} onClick={review}>{reviewing ? "Saving…" : "Mark reviewed"}</button>
    </footer>
  </article>;
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
            {posts.map(post => <ReportCard key={post.post_id} item={post} isPost onReview={() => reviewPost(post.post_id)} />)}
          </section>

          <section className="forum-flags__section">
            <h2>Comments &amp; replies <span>{comments.length}</span></h2>
            {comments.length === 0 && <p className="forum-flags__empty">No replies are waiting for review.</p>}
            {comments.map(comment => <ReportCard key={comment.comment_id} item={comment} onReview={() => reviewComment(comment.comment_id)} />)}
          </section>
        </>
      )}

      <Toast toast={toast} />
    </div>
  );
}
