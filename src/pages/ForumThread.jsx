import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bookmark, CornerDownRight, Flag, Lock, Pencil, Pin, Trash2 } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useNotifications } from "../notifications/NotificationsContext";
import ReactionBar from "../components/ReactionBar";
import MentionText from "../components/MentionText";
import MentionTextarea from "../components/MentionTextarea";
import MemberAvatar from "../components/MemberAvatar";
import ForumCategoryGlyph from "../components/ForumCategoryGlyph";
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

function Comment({ comment, depth, currentUserId, canModerate, token, replyingTo, setReplyingTo, replyBody, setReplyBody, replyMentions, setReplyMentions, submitReply, submitting, deleteComment, toggleCommentFlag, toggleCommentReaction, reactingTo }) {
  // This component displays ONE comment. Near the bottom, it maps over this
  // comment's children and renders another <Comment /> for every nested reply.
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const isRemoved = Boolean(comment.deleted_at);
  const isOwn = comment.author_id === currentUserId;
  const canDelete = !isRemoved && (isOwn || canModerate);

  return (
    <div className={`forum-comment depth-${Math.min(depth, 2)}`}>
      <div className="forum-comment-line" />
      <article id={`comment-${comment.comment_id}`}>
        {isRemoved ? (
          <p className="forum-comment-removed">This reply was removed.</p>
        ) : (
          <>
            <div className="forum-comment-head forum-comment-head--reply">
              <MemberAvatar className="forum-avatar forum-avatar--small" username={comment.author_username} avatarUrl={comment.author_avatar_url} size={34} />
              <div><strong>{comment.author_username}</strong><span>{formatDate(comment.created_at)}</span></div>
            </div>
            <MentionText body={comment.body} mentions={comment.mentions} />
            {/* REACTION TRACE STEP 2B: This controls the reaction buttons shown
                under ONE reply. It sends both the reply ID and reaction type
                to toggleCommentReaction() farther down in this file. */}
            <ReactionBar
              reactions={comment.reactions}
              myReaction={comment.my_reaction}
              onReact={(reactionType) => toggleCommentReaction(comment.comment_id, reactionType)}
              disabled={reactingTo === `comment-${comment.comment_id}`}
            />
            <div className="forum-comment-actions">
              <button className="forum-reply-button" onClick={() => setReplyingTo(replyingTo === comment.comment_id ? null : comment.comment_id)}>
                <CornerDownRight size={15} /> Reply
              </button>
              {canDelete && (
                confirmingDelete ? (
                  <span className="forum-inline-confirm">
                    Delete this reply?
                    <button onClick={() => deleteComment(comment.comment_id)}>Yes, delete</button>
                    <button onClick={() => setConfirmingDelete(false)}>Cancel</button>
                  </span>
                ) : (
                  <button className="forum-reply-button" onClick={() => setConfirmingDelete(true)}>
                    <Trash2 size={14} /> Delete
                  </button>
                )
              )}
              {!isOwn && (
                <button
                  className={`forum-reply-button ${comment.flagged_by_me ? "is-flagged" : ""}`}
                  onClick={() => toggleCommentFlag(comment.comment_id, comment.flagged_by_me)}
                >
                  <Flag size={14} /> {comment.flagged_by_me ? "Flagged" : "Flag"}
                </button>
              )}
            </div>
            {replyingTo === comment.comment_id && (
              <form className="forum-inline-reply" onSubmit={(event) => submitReply(event, comment.comment_id)}>
                {/* This controls the small reply box beneath one comment. */}
                <MentionTextarea
                  token={token}
                  autoFocus
                  rows={3}
                  value={replyBody}
                  onChange={setReplyBody}
                  mentions={replyMentions}
                  onMentionsChange={setReplyMentions}
                  placeholder={`Reply to ${comment.author_username}`}
                />
                <div className="forum-inline-reply__actions"><button type="button" onClick={() => setReplyingTo(null)}>Cancel</button><button disabled={submitting}>{submitting ? "Replying…" : "Reply"}</button></div>
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
          token={token}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          replyBody={replyBody}
          setReplyBody={setReplyBody}
          replyMentions={replyMentions}
          setReplyMentions={setReplyMentions}
          submitReply={submitReply}
          submitting={submitting}
          deleteComment={deleteComment}
          toggleCommentFlag={toggleCommentFlag}
          toggleCommentReaction={toggleCommentReaction}
          reactingTo={reactingTo}
        />
      ))}
    </div>
  );
}

export default function ForumThread() {
  const { postId } = useParams();
  const { token, user } = useAuth();
  const { socket } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyBody, setReplyBody] = useState("");
  const [replyMentions, setReplyMentions] = useState([]);
  const [mainReply, setMainReply] = useState("");
  const [mainReplyMentions, setMainReplyMentions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [editingPost, setEditingPost] = useState(false);
  const [postDraft, setPostDraft] = useState({ title: "", body: "" });
  const [confirmingPostDelete, setConfirmingPostDelete] = useState(false);
  const [reactingTo, setReactingTo] = useState(null);
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

  useEffect(() => {
    if (!socket) return;
    const postIdNumber = Number(postId);

    socket.emit("join_thread", postIdNumber);

    function onNewComment(comment) {
      if (comment.post_id !== postIdNumber) return;
      setComments((current) =>
        current.some((existing) => existing.comment_id === comment.comment_id) ? current : [...current, comment]
      );
    }
    socket.on("new_comment", onNewComment);

    return () => {
      socket.emit("leave_thread", postIdNumber);
      socket.off("new_comment", onNewComment);
    };
  }, [socket, postId]);

  useEffect(() => {
    // MENTION TRACE STEP 12: Notification links include #comment-123. After
    // comments render, find that exact reply and scroll it into view.
    if (!comments.length || !location.hash.startsWith("#comment-")) return;
    const target = document.getElementById(location.hash.slice(1));
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [comments, location.hash]);

  async function submitReply(event, parentCommentId = null) {
    // TRACE STEP 2: The reply form's onSubmit calls this function.
    // parentCommentId is null for the large "Leave a reply" form. It contains
    // a comment ID when the member is replying directly to another comment.
    event.preventDefault();

    // Both reply forms share this function, so choose the text from whichever
    // form the member used.
    const body = parentCommentId ? replyBody : mainReply;
    const selectedMentions = parentCommentId ? replyMentions : mainReplyMentions;
    setSubmitting(true);
    setError("");

    // TRACE STEP 3: Send the reply to the server. To continue tracing this
    // request, find this POST route in recovery-community-server/api/forum.js.
    const response = await fetch(`${API}/api/forum/posts/${postId}/comments`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      // MENTION TRACE STEP 6B: Send the visible reply plus the real IDs chosen
      // from MentionTextarea. Continue at server/api/forum.js.
      body: JSON.stringify({
        body,
        parent_comment_id: parentCommentId,
        mentioned_user_ids: selectedMentions.map((member) => member.user_id),
      }),
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
    setReplyMentions([]);
    setReplyingTo(null);
    setMainReplyMentions([]);
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

  async function togglePostSave() {
    const isSaved = post.saved_by_me;
    const response = await fetch(`${API}/api/forum/posts/${postId}/save`, {
      method: isSaved ? "DELETE" : "POST",
      headers: { ...headers, "Content-Type": "application/json" },
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setError(result.message || "Could not update that.");
      return;
    }
    setPost((current) => ({ ...current, saved_by_me: !isSaved }));
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

  function applyReaction(current, reactionType) {
    // REACTION TRACE STEP 7: The server has confirmed the database change.
    // Update the count and the logged-in user's selected reaction in React
    // state. That state change rerenders ReactionBar with the new appearance.
    const previous = current.my_reaction;
    const next = previous === reactionType ? null : reactionType;
    const reactions = { ...(current.reactions || {}) };
    if (previous) reactions[previous] = Math.max(0, Number(reactions[previous] || 0) - 1);
    if (next) reactions[next] = Number(reactions[next] || 0) + 1;
    return { ...current, reactions, my_reaction: next };
  }

  async function togglePostReaction(reactionType) {
    // REACTION TRACE STEP 3A: The main post's ReactionBar leads here.
    // Clicking the already-selected reaction removes it; every other click
    // adds a reaction or changes the member's existing reaction.
    const removing = post.my_reaction === reactionType;
    setReactingTo("post");
    // Optimistic update: apply the change locally before the network round
    // trip so the button reacts instantly. applyReaction() is symmetric, so
    // reapplying the same reactionType again below undoes it on failure.
    setPost((current) => applyReaction(current, reactionType));
    // This request leaves the client here. Continue at REACTION TRACE STEP 4A
    // in recovery-community-server/api/forum.js.
    const response = await fetch(`${API}/api/forum/posts/${postId}/reaction`, {
      method: removing ? "DELETE" : "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: removing ? undefined : JSON.stringify({ reaction_type: reactionType }),
    });
    setReactingTo(null);
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setError(result.message || "Could not update that reaction.");
      setPost((current) => applyReaction(current, reactionType));
      return;
    }
    // REACTION TRACE STEP 7A: The server confirmed the same change we already
    // applied optimistically above, so there is nothing left to do here.
  }

  async function toggleCommentReaction(commentId, reactionType) {
    // REACTION TRACE STEP 3B: A reply's ReactionBar leads here. This is the
    // same flow as a post reaction, but the URL includes the comment ID so the
    // server knows which reply owns the reaction.
    const comment = comments.find((item) => item.comment_id === commentId);
    const removing = comment?.my_reaction === reactionType;
    setReactingTo(`comment-${commentId}`);
    // Optimistic update: same reasoning as togglePostReaction() above.
    setComments((current) => current.map((item) => (
      item.comment_id === commentId ? applyReaction(item, reactionType) : item
    )));
    // Continue at REACTION TRACE STEP 4B in the server api/forum.js file.
    const response = await fetch(`${API}/api/forum/posts/${postId}/comments/${commentId}/reaction`, {
      method: removing ? "DELETE" : "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: removing ? undefined : JSON.stringify({ reaction_type: reactionType }),
    });
    setReactingTo(null);
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setError(result.message || "Could not update that reaction.");
      setComments((current) => current.map((item) => (
        item.comment_id === commentId ? applyReaction(item, reactionType) : item
      )));
      return;
    }
    // REACTION TRACE STEP 7B: The server confirmed the same change already
    // applied optimistically above, so there is nothing left to do here.
  }

  function startEditingPost() {
    setPostDraft({ title: post.title, body: post.body });
    setEditingPost(true);
  }

  async function saveEditedPost(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    // EDIT HISTORY TRACE STEP 1: Save changes sends the new wording to the
    // forum API. Continue at EDIT HISTORY TRACE STEP 3 in server/api/forum.js.
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

  if (loading) return <main className="forum-shell"><div className="forum-empty">Loading conversation…</div></main>;
  if (error && !post) return <main className="forum-shell"><Link to="/forum" className="forum-back"><ArrowLeft size={17} /> Back to forum</Link><p className="forum-error">{error}</p></main>;

  // TRACE STEP 6: Turn the refreshed flat comment array into parent/child
  // branches before the JSX below maps over and displays it.
  const commentTree = buildCommentTree(comments);

  return (
    <main className="forum-shell forum-thread-shell">
      <Link to={`/forum?category=${post.category_slug}`} className="forum-back"><ArrowLeft size={17} /> Back to {post.category_name}</Link>

      <article className="forum-thread-post">
        <div className="forum-thread-topline">
          <span className="forum-category-pill"><ForumCategoryGlyph name={post.category_name} size={13} />{post.category_name}</span>
          <div className="forum-post-meta">
            {post.pinned && <span className="forum-state forum-state--pinned"><Pin size={13} /> Pinned</span>}
            {post.locked && <span className="forum-state"><Lock size={13} /> Locked</span>}
          </div>
        </div>

        {editingPost ? (
          <form className="forum-edit-post-form" onSubmit={saveEditedPost}>
            <input required maxLength={180} value={postDraft.title} onChange={(e) => setPostDraft({ ...postDraft, title: e.target.value })} />
            <textarea required rows={8} value={postDraft.body} onChange={(e) => setPostDraft({ ...postDraft, body: e.target.value })} />
            {error && <p className="forum-error" role="alert">{error}</p>}
            <div className="forum-composer-actions">
              <button type="button" className="forum-secondary-button" onClick={() => { setEditingPost(false); setError(""); }}>Cancel</button>
              <button className="forum-primary-button" disabled={submitting}>{submitting ? "Saving…" : "Save changes"}</button>
            </div>
          </form>
        ) : (
          <>
            <h1>{post.title}</h1>
            <div className="forum-comment-head forum-thread-author">
              <MemberAvatar className="forum-avatar" username={post.author_username} avatarUrl={post.author_avatar_url} size={42} />
              <div><strong>{post.author_username}</strong><span>{formatDate(post.created_at)}{post.content_edited_at && <b className="forum-edited-label" title={`Last edited ${formatDate(post.content_edited_at)}`}>Edited</b>}</span></div>
            </div>
            <MentionText className="forum-thread-body" body={post.body} mentions={post.mentions} />
            {/* REACTION TRACE STEP 2A: This controls the reaction buttons shown
                directly under the main forum post. `onReact` points to the
                togglePostReaction() function above. This is where the prop gets
                its value: onReact={togglePostReaction}. ReactionBar does not
                import that function; this parent component hands it down. */}
            <ReactionBar
              reactions={post.reactions}
              myReaction={post.my_reaction}
              onReact={togglePostReaction}
              disabled={reactingTo === "post"}
            />
          </>
        )}

        {!editingPost && (
          <div className="forum-moderation">
            {isAuthor && !post.locked && (
              <button className="forum-action-button" onClick={startEditingPost}><Pencil size={15} /> Edit</button>
            )}
            {canModerate && (
              <>
                <button className="forum-action-button" onClick={() => moderate({ pinned: !post.pinned })}><Pin size={15} /> {post.pinned ? "Unpin" : "Pin"}</button>
                <button className="forum-action-button" onClick={() => moderate({ locked: !post.locked })}><Lock size={15} /> {post.locked ? "Unlock" : "Lock"}</button>
              </>
            )}
            {(isAuthor || canModerate) && (
              confirmingPostDelete ? (
                <span className="forum-inline-confirm">
                  Delete this post?
                  <button onClick={deletePost}>Yes, delete</button>
                  <button onClick={() => setConfirmingPostDelete(false)}>Cancel</button>
                </span>
              ) : (
                <button className="forum-action-button forum-action-button--danger" onClick={() => setConfirmingPostDelete(true)}><Trash2 size={15} /> Delete</button>
              )
            )}
            {!isAuthor && (
              <button className={`forum-action-button ${post.flagged_by_me ? "is-flagged" : ""}`} onClick={togglePostFlag}>
                <Flag size={15} /> {post.flagged_by_me ? "Flagged" : "Flag"}
              </button>
            )}
            <button className={`forum-action-button ${post.saved_by_me ? "is-saved" : ""}`} onClick={togglePostSave}>
              <Bookmark size={15} fill={post.saved_by_me ? "currentColor" : "none"} /> {post.saved_by_me ? "Saved" : "Save"}
            </button>
          </div>
        )}
      </article>

      <section className="forum-thread-replies">
        <div className="forum-feed-heading forum-thread-replies__heading"><div><p className="forum-eyebrow">Community responses</p><h2>{comments.filter((c) => !c.deleted_at).length} {comments.filter((c) => !c.deleted_at).length === 1 ? "reply" : "replies"}</h2></div><span>Oldest first</span></div>
        {error && <p className="forum-error" role="alert">{error}</p>}
        {commentTree.length === 0 && <div className="forum-empty"><h3>No replies yet.</h3><p>You can be the first person to respond.</p></div>}
        <div className="forum-comment-tree">
          {/* Display every top-level comment. Each Comment component then maps
              its own children recursively near the top of this file. */}
          {commentTree.map((comment) => (
            <Comment
              key={comment.comment_id}
              comment={comment}
              depth={0}
              currentUserId={user?.id}
              canModerate={canModerate}
              token={token}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyBody={replyBody}
              setReplyBody={setReplyBody}
              replyMentions={replyMentions}
              setReplyMentions={setReplyMentions}
              submitReply={submitReply}
              submitting={submitting}
              deleteComment={deleteComment}
              toggleCommentFlag={toggleCommentFlag}
              toggleCommentReaction={toggleCommentReaction}
              reactingTo={reactingTo}
            />
          ))}
        </div>
      </section>

      {post.locked ? (
        <div className="forum-locked-note"><Lock size={18} /> This conversation is locked. Existing replies are still available to read.</div>
      ) : (
        /* TRACE STEP 1: Start tracing here. This is the large reply form the
           member sees. Clicking "Post reply" submits this form, and onSubmit
           calls submitReply(event) above. No parent ID means a top-level reply. */
        <form className="forum-main-reply" onSubmit={(event) => submitReply(event)}>
          <p className="forum-eyebrow">Join the conversation</p>
          <h2>Leave a reply</h2>
          {/* This controls the large reply box at the bottom of the thread. */}
          <MentionTextarea
            token={token}
            rows={5}
            value={mainReply}
            onChange={setMainReply}
            mentions={mainReplyMentions}
            onMentionsChange={setMainReplyMentions}
            placeholder="Share support, experience, or a thoughtful question."
          />
          <div className="forum-main-reply__footer">
            <span>Speak from experience and leave room for someone else&rsquo;s path.</span>
            <button className="forum-primary-button" disabled={submitting}>{submitting ? "Replying…" : "Post reply"}</button>
          </div>
        </form>
      )}
    </main>
  );
}
