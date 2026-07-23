import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CornerDownRight, Flag, Lock, Pencil, Pin, Trash2 } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import "./Forum2.css";

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
  // The API sends comments as one flat array. This function connects each
  // reply to its parent so React can display the conversation as a tree.
  const nodes = new Map(comments.map((comment) => [comment.comment_id, { ...comment, children: [] }]));
  const roots = [];

  nodes.forEach((comment) => {
    const parent = nodes.get(comment.parent_comment_id);
    if (parent) parent.children.push(comment);
    else roots.push(comment);
  });
  return roots;
}

function Comment({ comment, depth, currentUserId, canModerate, replyingTo, setReplyingTo, replyBody, setReplyBody, submitReply, submitting, deleteComment, toggleCommentFlag }) {
  // This component displays ONE comment. Near the bottom, it maps over this
  // comment's children and renders another <Comment /> for every nested reply.
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const isRemoved = Boolean(comment.deleted_at);
  const isOwn = comment.author_id === currentUserId;
  const canDelete = !isRemoved && (isOwn || canModerate);

  return (
    <div className={`f2-comment depth-${Math.min(depth, 2)}`}>
      <div className="f2-comment-line" />
      <article>
        {isRemoved ? (
          <p className="f2-comment-removed">This reply was removed.</p>
        ) : (
          <>
            <div className="f2-comment-head">
              <div className="f2-avatar f2-avatar--small">{initials(comment.author_username)}</div>
              <div><strong>{comment.author_username}</strong><span>{formatDate(comment.created_at)}</span></div>
            </div>
            <p>{comment.body}</p>
            <div className="f2-comment-actions">
              <button className="f2-reply-button" onClick={() => setReplyingTo(replyingTo === comment.comment_id ? null : comment.comment_id)}>
                <CornerDownRight size={15} /> Reply
              </button>
              {canDelete && (
                confirmingDelete ? (
                  <span className="f2-inline-confirm">
                    Delete this reply?
                    <button onClick={() => deleteComment(comment.comment_id)}>Yes, delete</button>
                    <button onClick={() => setConfirmingDelete(false)}>Cancel</button>
                  </span>
                ) : (
                  <button className="f2-reply-button" onClick={() => setConfirmingDelete(true)}>
                    <Trash2 size={14} /> Delete
                  </button>
                )
              )}
              {!isOwn && (
                <button
                  className={`f2-reply-button ${comment.flagged_by_me ? "is-flagged" : ""}`}
                  onClick={() => toggleCommentFlag(comment.comment_id, comment.flagged_by_me)}
                >
                  <Flag size={14} /> {comment.flagged_by_me ? "Flagged" : "Flag"}
                </button>
              )}
            </div>
            {replyingTo === comment.comment_id && (
              <form className="f2-inline-reply" onSubmit={(event) => submitReply(event, comment.comment_id)}>
                <textarea autoFocus required rows={3} value={replyBody} onChange={(e) => setReplyBody(e.target.value)} placeholder={`Reply to ${comment.author_username}`} />
                <div><button type="button" onClick={() => setReplyingTo(null)}>Cancel</button><button disabled={submitting}>{submitting ? "Replying…" : "Reply"}</button></div>
              </form>
            )}
          </>
        )}
      </article>
      {/* Recursive rendering: every child reply uses this same Comment component.
          depth increases for each generation, while the CSS limits visual indentation. */}
      {comment.children.map((child) => (
        <Comment
          key={child.comment_id}
          comment={child}
          depth={depth + 1}
          currentUserId={currentUserId}
          canModerate={canModerate}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          replyBody={replyBody}
          setReplyBody={setReplyBody}
          submitReply={submitReply}
          submitting={submitting}
          deleteComment={deleteComment}
          toggleCommentFlag={toggleCommentFlag}
        />
      ))}
    </div>
  );
}

export default function ForumThread2() {
  const { postId } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyBody, setReplyBody] = useState("");
  const [mainReply, setMainReply] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingPost, setEditingPost] = useState(false);
  const [postDraft, setPostDraft] = useState({ title: "", body: "" });
  const [confirmingPostDelete, setConfirmingPostDelete] = useState(false);
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const canModerate = user?.role_id <= 50;
  const isAuthor = post?.author_id === user?.id;

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
    // TRACE STEP 2: The reply form's onSubmit calls this function.
    // parentCommentId is null for the large "Leave a reply" form. It contains
    // a comment ID when the member is replying directly to another comment.
    event.preventDefault();

    // Both reply forms share this function, so choose the text from whichever
    // form the member used.
    const body = parentCommentId ? replyBody : mainReply;
    setSubmitting(true);
    setError("");

    // TRACE STEP 3: Send the reply to the server. To continue tracing this
    // request, find this POST route in recovery-community-server/api/forum.js.
    const response = await fetch(`${API}/api/forum/posts/${postId}/comments`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ body, parent_comment_id: parentCommentId }),
    });

    // The server sends JSON back. If it rejected the reply, show its message
    // and stop here without clearing the member's text.
    const result = await response.json();
    if (!response.ok) {
      setError(result.message || "Could not add that reply.");
      setSubmitting(false);
      return;
    }

    // TRACE STEP 4: The server saved the reply successfully. Clean up both
    // possible reply forms and return the button to its normal state.
    setMainReply("");
    setReplyBody("");
    setReplyingTo(null);
    setSubmitting(false);

    // TRACE STEP 5: Ask the server for the entire updated thread. Store the
    // returned post/comments in state so React rerenders the new reply.
    const refreshed = await fetchThread();
    setPost(refreshed.post);
    setComments(refreshed.comments);
  }

  async function deleteComment(commentId) {
    const response = await fetch(`${API}/api/forum/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
      headers,
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setError(result.message || "Could not remove that reply.");
      return;
    }
    const refreshed = await fetchThread();
    setPost(refreshed.post);
    setComments(refreshed.comments);
  }

  async function togglePostFlag() {
    const isFlagged = post.flagged_by_me;
    const response = await fetch(`${API}/api/forum/posts/${postId}/flag`, {
      method: isFlagged ? "DELETE" : "POST",
      headers: { ...headers, "Content-Type": "application/json" },
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setError(result.message || "Could not update that flag.");
      return;
    }
    setPost((current) => ({ ...current, flagged_by_me: !isFlagged }));
  }

  async function toggleCommentFlag(commentId, isFlagged) {
    const response = await fetch(`${API}/api/forum/posts/${postId}/comments/${commentId}/flag`, {
      method: isFlagged ? "DELETE" : "POST",
      headers: { ...headers, "Content-Type": "application/json" },
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setError(result.message || "Could not update that flag.");
      return;
    }
    setComments((current) =>
      current.map((comment) =>
        comment.comment_id === commentId ? { ...comment, flagged_by_me: !isFlagged } : comment
      )
    );
  }

  function startEditingPost() {
    setPostDraft({ title: post.title, body: post.body });
    setEditingPost(true);
  }

  async function saveEditedPost(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const response = await fetch(`${API}/api/forum/posts/${postId}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(postDraft),
    });
    const result = await response.json();
    setSubmitting(false);
    if (!response.ok) {
      setError(result.message || "Could not save your changes.");
      return;
    }
    setPost((current) => ({ ...current, ...result }));
    setEditingPost(false);
  }

  async function deletePost() {
    const response = await fetch(`${API}/api/forum/posts/${postId}`, {
      method: "DELETE",
      headers,
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setError(result.message || "Could not delete this post.");
      return;
    }
    navigate(`/forum${post.category_slug ? `?category=${post.category_slug}` : ""}`);
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

  if (loading) return <main className="f2-shell"><div className="f2-empty">Loading conversation…</div></main>;
  if (error && !post) return <main className="f2-shell"><Link to="/forum" className="f2-back"><ArrowLeft size={17} /> Back to forum</Link><p className="f2-error">{error}</p></main>;

  // TRACE STEP 6: Turn the refreshed flat comment array into parent/child
  // branches before the JSX below maps over and displays it.
  const commentTree = buildCommentTree(comments);

  return (
    <main className="f2-shell f2-thread-shell">
      <Link to={`/forum?category=${post.category_slug}`} className="f2-back"><ArrowLeft size={17} /> Back to {post.category_name}</Link>

      <article className="f2-thread-post">
        <div className="f2-thread-topline">
          <span className="f2-category-pill">{post.category_name}</span>
          <div className="f2-post-meta">
            {post.pinned && <span className="f2-state f2-state--pinned"><Pin size={13} /> Pinned</span>}
            {post.locked && <span className="f2-state"><Lock size={13} /> Locked</span>}
          </div>
        </div>

        {editingPost ? (
          <form className="f2-edit-post-form" onSubmit={saveEditedPost}>
            <input required maxLength={180} value={postDraft.title} onChange={(e) => setPostDraft({ ...postDraft, title: e.target.value })} />
            <textarea required rows={8} value={postDraft.body} onChange={(e) => setPostDraft({ ...postDraft, body: e.target.value })} />
            {error && <p className="f2-error" role="alert">{error}</p>}
            <div className="f2-composer-actions">
              <button type="button" className="f2-secondary-button" onClick={() => { setEditingPost(false); setError(""); }}>Cancel</button>
              <button className="f2-primary-button" disabled={submitting}>{submitting ? "Saving…" : "Save changes"}</button>
            </div>
          </form>
        ) : (
          <>
            <h1>{post.title}</h1>
            <div className="f2-comment-head">
              <div className="f2-avatar">{initials(post.author_username)}</div>
              <div><strong>{post.author_username}</strong><span>{formatDate(post.created_at)}</span></div>
            </div>
            <p className="f2-thread-body">{post.body}</p>
          </>
        )}

        {!editingPost && (
          <div className="f2-moderation">
            {isAuthor && !post.locked && (
              <button onClick={startEditingPost}><Pencil size={15} /> Edit</button>
            )}
            {canModerate && (
              <>
                <button onClick={() => moderate({ pinned: !post.pinned })}><Pin size={15} /> {post.pinned ? "Unpin" : "Pin"}</button>
                <button onClick={() => moderate({ locked: !post.locked })}><Lock size={15} /> {post.locked ? "Unlock" : "Lock"}</button>
              </>
            )}
            {(isAuthor || canModerate) && (
              confirmingPostDelete ? (
                <span className="f2-inline-confirm">
                  Delete this post?
                  <button onClick={deletePost}>Yes, delete</button>
                  <button onClick={() => setConfirmingPostDelete(false)}>Cancel</button>
                </span>
              ) : (
                <button onClick={() => setConfirmingPostDelete(true)}><Trash2 size={15} /> Delete</button>
              )
            )}
            {!isAuthor && (
              <button className={post.flagged_by_me ? "is-flagged" : ""} onClick={togglePostFlag}>
                <Flag size={15} /> {post.flagged_by_me ? "Flagged" : "Flag"}
              </button>
            )}
          </div>
        )}
      </article>

      <section className="f2-thread-replies">
        <div className="f2-feed-heading"><div><p className="f2-eyebrow">Community responses</p><h2>{comments.filter((c) => !c.deleted_at).length} {comments.filter((c) => !c.deleted_at).length === 1 ? "reply" : "replies"}</h2></div></div>
        {error && <p className="f2-error" role="alert">{error}</p>}
        {commentTree.length === 0 && <div className="f2-empty"><h3>No replies yet.</h3><p>You can be the first person to respond.</p></div>}
        <div className="f2-comment-tree">
          {/* Display every top-level comment. Each Comment component then maps
              its own children recursively near the top of this file. */}
          {commentTree.map((comment) => (
            <Comment
              key={comment.comment_id}
              comment={comment}
              depth={0}
              currentUserId={user?.id}
              canModerate={canModerate}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyBody={replyBody}
              setReplyBody={setReplyBody}
              submitReply={submitReply}
              submitting={submitting}
              deleteComment={deleteComment}
              toggleCommentFlag={toggleCommentFlag}
            />
          ))}
        </div>
      </section>

      {post.locked ? (
        <div className="f2-locked-note"><Lock size={18} /> This conversation is locked. Existing replies are still available to read.</div>
      ) : (
        /* TRACE STEP 1: Start tracing here. This is the large reply form the
           member sees. Clicking "Post reply" submits this form, and onSubmit
           calls submitReply(event) above. No parent ID means a top-level reply. */
        <form className="f2-main-reply" onSubmit={(event) => submitReply(event)}>
          <p className="f2-eyebrow">Join the conversation</p>
          <h2>Leave a reply</h2>
          <textarea required rows={5} value={mainReply} onChange={(e) => setMainReply(e.target.value)} placeholder="Share support, experience, or a thoughtful question." />
          <button className="f2-primary-button" disabled={submitting}>{submitting ? "Replying…" : "Post reply"}</button>
        </form>
      )}
    </main>
  );
}
