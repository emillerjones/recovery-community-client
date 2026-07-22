import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CornerDownRight, Lock, Pin } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import "./Forum.css";

const API = import.meta.env.VITE_API;

function formatDate(value) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function initials(username) {
  return username?.slice(0, 2).toUpperCase() || "?";
}

function buildCommentTree(comments) {
  const nodes = new Map(comments.map((comment) => [comment.comment_id, { ...comment, children: [] }]));
  const roots = [];

  nodes.forEach((comment) => {
    const parent = nodes.get(comment.parent_comment_id);
    if (parent) parent.children.push(comment);
    else roots.push(comment);
  });
  return roots;
}

function Comment({ comment, depth, replyingTo, setReplyingTo, replyBody, setReplyBody, submitReply, submitting }) {
  return (
    <div className={`forum-comment depth-${Math.min(depth, 2)}`}>
      <div className="forum-comment-line" />
      <article>
        <div className="forum-comment-head">
          <div className="forum-avatar forum-avatar--small">{initials(comment.author_username)}</div>
          <div><strong>{comment.author_username}</strong><span>{formatDate(comment.created_at)}</span></div>
        </div>
        <p>{comment.body}</p>
        <button className="forum-reply-button" onClick={() => setReplyingTo(replyingTo === comment.comment_id ? null : comment.comment_id)}>
          <CornerDownRight size={15} /> Reply
        </button>
        {replyingTo === comment.comment_id && (
          <form className="forum-inline-reply" onSubmit={(event) => submitReply(event, comment.comment_id)}>
            <textarea autoFocus required rows={3} value={replyBody} onChange={(e) => setReplyBody(e.target.value)} placeholder={`Reply to ${comment.author_username}`} />
            <div><button type="button" onClick={() => setReplyingTo(null)}>Cancel</button><button disabled={submitting}>{submitting ? "Replying…" : "Reply"}</button></div>
          </form>
        )}
      </article>
      {comment.children.map((child) => (
        <Comment key={child.comment_id} comment={child} depth={depth + 1} replyingTo={replyingTo} setReplyingTo={setReplyingTo} replyBody={replyBody} setReplyBody={setReplyBody} submitReply={submitReply} submitting={submitting} />
      ))}
    </div>
  );
}

export default function ForumThread() {
  const { postId } = useParams();
  const { token, user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyBody, setReplyBody] = useState("");
  const [mainReply, setMainReply] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const canModerate = user?.role_id <= 50;

  const fetchThread = useCallback(async () => {
    const response = await fetch(`${API}/api/forum/posts/${postId}`, { headers });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Could not load this conversation.");
    return result;
  }, [headers, postId]);

  useEffect(() => {
    let cancelled = false;
    fetchThread()
      .then((result) => {
        if (cancelled) return;
        setPost(result.post);
        setComments(result.comments);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [fetchThread]);

  async function submitReply(event, parentCommentId = null) {
    event.preventDefault();
    const body = parentCommentId ? replyBody : mainReply;
    setSubmitting(true);
    setError("");
    const response = await fetch(`${API}/api/forum/posts/${postId}/comments`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ body, parent_comment_id: parentCommentId }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.message || "Could not add that reply.");
      setSubmitting(false);
      return;
    }
    setMainReply("");
    setReplyBody("");
    setReplyingTo(null);
    setSubmitting(false);
    const refreshed = await fetchThread();
    setPost(refreshed.post);
    setComments(refreshed.comments);
  }

  async function moderate(changes) {
    const response = await fetch(`${API}/api/forum/posts/${postId}/moderation`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    });
    const result = await response.json();
    if (!response.ok) return setError(result.message || "Could not update this post.");
    setPost((current) => ({ ...current, ...result }));
  }

  if (loading) return <main className="forum-shell"><div className="forum-empty">Loading conversation…</div></main>;
  if (error && !post) return <main className="forum-shell"><Link to="/forum" className="forum-back"><ArrowLeft size={17} /> Back to forum</Link><p className="forum-error">{error}</p></main>;

  const commentTree = buildCommentTree(comments);

  return (
    <main className="forum-shell forum-thread-shell">
      <Link to={`/forum?category=${post.category_slug}`} className="forum-back"><ArrowLeft size={17} /> Back to {post.category_name}</Link>

      <article className="forum-thread-post">
        <div className="forum-thread-topline">
          <span className="forum-category-pill">{post.category_name}</span>
          <div className="forum-post-meta">
            {post.pinned && <span className="forum-state"><Pin size={13} /> Pinned</span>}
            {post.locked && <span className="forum-state"><Lock size={13} /> Locked</span>}
          </div>
        </div>
        <h1>{post.title}</h1>
        <div className="forum-comment-head">
          <div className="forum-avatar">{initials(post.author_username)}</div>
          <div><strong>{post.author_username}</strong><span>{formatDate(post.created_at)}</span></div>
        </div>
        <p className="forum-thread-body">{post.body}</p>
        {canModerate && (
          <div className="forum-moderation">
            <button onClick={() => moderate({ pinned: !post.pinned })}><Pin size={15} /> {post.pinned ? "Unpin" : "Pin"}</button>
            <button onClick={() => moderate({ locked: !post.locked })}><Lock size={15} /> {post.locked ? "Unlock" : "Lock"}</button>
          </div>
        )}
      </article>

      <section className="forum-thread-replies">
        <div className="forum-feed-heading"><div><p className="forum-eyebrow">Community responses</p><h2>{comments.length} {comments.length === 1 ? "reply" : "replies"}</h2></div></div>
        {error && <p className="forum-error" role="alert">{error}</p>}
        {commentTree.length === 0 && <div className="forum-empty"><h3>No replies yet.</h3><p>You can be the first person to respond.</p></div>}
        <div className="forum-comment-tree">
          {commentTree.map((comment) => <Comment key={comment.comment_id} comment={comment} depth={0} replyingTo={replyingTo} setReplyingTo={setReplyingTo} replyBody={replyBody} setReplyBody={setReplyBody} submitReply={submitReply} submitting={submitting} />)}
        </div>
      </section>

      {post.locked ? (
        <div className="forum-locked-note"><Lock size={18} /> This conversation is locked. Existing replies are still available to read.</div>
      ) : (
        <form className="forum-main-reply" onSubmit={(event) => submitReply(event)}>
          <p className="forum-eyebrow">Join the conversation</p>
          <h2>Leave a reply</h2>
          <textarea required rows={5} value={mainReply} onChange={(e) => setMainReply(e.target.value)} placeholder="Share support, experience, or a thoughtful question." />
          <button className="forum-primary-button" disabled={submitting}>{submitting ? "Replying…" : "Post reply"}</button>
        </form>
      )}
    </main>
  );
}
