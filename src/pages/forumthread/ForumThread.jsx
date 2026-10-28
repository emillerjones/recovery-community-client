import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bell, Flag, Lock, Pencil, Pin, Send, ShieldCheck, Trash2 } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { useNotifications } from "../../contexts/NotificationsContext";
import { useStaffChat } from "../../contexts/StaffChatContext";
import ReportContentDialog from "../../components/ReportContentDialog";
import ReactionBar from "../../components/ReactionBar";
import MentionText from "../../components/MentionText";
import MentionTextarea from "../../components/MentionTextarea";
import MemberAvatar from "../../components/MemberAvatar";
import ForumCategoryGlyph from "../../components/ForumCategoryGlyph";
import ForumComment from "./ForumComment";
import ReplyIdentity from "./ReplyIdentity";
import PostEditHistory from "./PostEditHistory";
import ForumPhotoGallery from "../../components/forumPhotos/ForumPhotoGallery";
import ForumPoll from "../../components/forumPolls/ForumPoll";
import PhotoUploader from "../../components/forumPhotos/PhotoUploader";
import {
  photosReady,
  readyMediaIds,
} from "../../components/forumPhotos/photoUploadUtils";
import "./ForumThread.css";
import "../forum/StaffAnnouncements.css";

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

function editedLabel(content) {
  if (!content.content_edited_at) return null;
  const ownerChangedAnotherMember = content.content_edited_by_role_id === 1
    && content.content_edited_by !== content.author_id;
  return ownerChangedAnotherMember ? "Edited by owner" : "Edited";
}

export default function ForumThread() {
  const { postId } = useParams();
  // A different thread gets fresh drafts and a fresh reply destination.
  return <ForumThreadContent key={postId} />;
}

function ForumThreadContent() {
  const { postId } = useParams();
  const { token, user } = useAuth();
  const { socket } = useNotifications();
  const { refreshAnnouncementsUnread } = useStaffChat() || {};
  const navigate = useNavigate();
  const location = useLocation();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reportTarget, setReportTarget] = useState(null);
  const [reportNotice, setReportNotice] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyBody, setReplyBody] = useState("");
  const [replyMentions, setReplyMentions] = useState([]);
  const [replyPhotos, setReplyPhotos] = useState([]);
  const [mainReply, setMainReply] = useState("");
  const [mainReplyMentions, setMainReplyMentions] = useState([]);
  const [mainReplyPhotos, setMainReplyPhotos] = useState([]);
  const [mainIdentity, setMainIdentity] = useState({ importing: false, name: "" });
  const [replyIdentity, setReplyIdentity] = useState({ importing: false, name: "" });
  const composerRef = useRef(null);
  const replyDrafts = useRef(new Map());
  const [submitting, setSubmitting] = useState(false);
  const [editingPost, setEditingPost] = useState(false);
  const [postDraft, setPostDraft] = useState({ title: "", body: "" });
  const [confirmingPostDelete, setConfirmingPostDelete] = useState(false);
  const [reactingTo, setReactingTo] = useState(null);
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const staffOnly = post?.category_slug === "staff-announcements";
  const canChooseIdentity = user?.role_id === 1;
  const replyTarget = comments.find((comment) => comment.comment_id === replyingTo);
  const activeIdentity = replyingTo ? replyIdentity : mainIdentity;
  const activeBody = replyingTo ? replyBody : mainReply;
  const activePhotos = replyingTo ? replyPhotos : mainReplyPhotos;
  const uploadBusy = activePhotos.some(photo => photo.status === "uploading");
  const mainDisplayName = canChooseIdentity && activeIdentity.importing ? activeIdentity.name.trim() : user?.username;
  useEffect(() => {
    if (loading || post?.locked || !composerRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      document.body.style.setProperty("--forum-composer-height", entry.target.getBoundingClientRect().height + "px");
    });
    observer.observe(composerRef.current);
    return () => { observer.disconnect(); document.body.style.removeProperty("--forum-composer-height"); };
  }, [canChooseIdentity, loading, post?.locked]);
  const canModerate = staffOnly ? [1,10].includes(user?.role_id) : user?.role_id <= 50;
  const canEditOwn = user?.role_id <= 50;
  const canEditOthers = user?.role_id === 1;
  const canDeleteOthers = user?.role_id <= 10;
  const isAuthor = post?.author_id === user?.id;
  const canEditPost = isAuthor || canEditOthers;

  // Run when the thread page first loads, then reload if the post ID
  // or logged-in user's authentication changes.
  const fetchThread = useCallback(async () => {
    const response = await fetch(`${API}/api/forum/posts/${postId}?reaction_format=like`, { headers });
    const result = await response.json();
    if (!response.ok) { const failure = new Error(result.message || "Could not load this conversation."); failure.status = response.status; throw failure; }
    return result;
  }, [headers, postId]);

  const markThreadRead = useCallback((readPost) => {
    // READ TRACE STEP 1: Once the member can see this thread, tell the server
    // to save their latest read point. Continue at PATCH /posts/:id/read.
    fetch(`${API}/api/forum/posts/${postId}/read`, {
      method: "PATCH",
      headers,
    })
      .then(() => {
        if (readPost?.category_slug === "staff-announcements") refreshAnnouncementsUnread?.();
      })
      .catch(() => {});
  }, [headers, postId, refreshAnnouncementsUnread]);

  useEffect(() => {
    let cancelled = false;
    fetchThread()
      .then((result) => {
        if (cancelled) return;
        setPost(result.post);
        setComments(result.comments);
        setLoading(false);
        markThreadRead(result.post);
      })
      .catch((err) => {
        if (cancelled) return;
        setPost(null);
        setComments([]);
        setError(err.message);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [fetchThread, markThreadRead]);

  useEffect(() => {
    if (!staffOnly) return;
    let cancelled = false;
    const refresh = async () => {
      if (document.hidden) return;
      try {
        const result = await fetchThread();
        if (!cancelled) { setPost(result.post); setComments(result.comments); }
      } catch (failure) {
        if (!cancelled && [401,403,404].includes(failure.status)) { setPost(null); setComments([]); setEditingPost(false); setError("This staff announcement is no longer available to your account."); }
      }
    };
    const timer = setInterval(refresh, 20000);
    document.addEventListener("visibilitychange", refresh);
    return () => { cancelled = true; clearInterval(timer); document.removeEventListener("visibilitychange", refresh); };
  }, [staffOnly, fetchThread]);




// This effect then listens for new comments while this thread is open.
//
// We join a socket room for this post so the server sends us only events
// belonging to this thread. When a new comment arrives, setComments()
// adds it to React state and the conversation rerenders immediately.
//
// The cleanup function leaves the room and removes the listener when the
// user leaves this thread, preventing duplicate listeners and updates.
  useEffect(() => {
    if (!socket) return;
    const postIdNumber = Number(postId);

    socket.emit("join_thread", postIdNumber);

    function onNewComment(comment) {
      if (comment.post_id !== postIdNumber) return;
      setComments((current) =>
        current.some((existing) => existing.comment_id === comment.comment_id) ? current : [...current, comment]
      );
      if (document.visibilityState === "visible") markThreadRead();
    }
    socket.on("new_comment", onNewComment);
    const onRevoked = data => {
      if (data.post_id !== postIdNumber) return;
      setPost(null); setComments([]); setEditingPost(false); setError("This conversation is no longer available to your account.");
    };
    socket.on("forum_access_revoked", onRevoked);

    return () => {
      socket.emit("leave_thread", postIdNumber);
      socket.off("new_comment", onNewComment);
      socket.off("forum_access_revoked", onRevoked);
    };
  }, [socket, postId, markThreadRead]);



// NOTIFICATION DEEP LINK:
// A notification can link to a specific reply using a URL such as
// /forum/13#comment-123.
//
// Wait until the comments have loaded and rendered. Then find the HTML
// element with that comment ID and smoothly scroll it into view.
  useEffect(() => {
    if (!comments.length || !location.hash.startsWith("#comment-")) return;
    const target = document.getElementById(location.hash.slice(1));
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [comments, location.hash]);



  async function submitReply(event, parentCommentId = replyingTo) {
    // The selected parent ID is independent of any @mention in the text.
    event.preventDefault();
    if (submitting || post.locked) return;
    const body = parentCommentId ? replyBody : mainReply;
    const selectedMentions = parentCommentId ? replyMentions : mainReplyMentions;
    const selectedPhotos = parentCommentId ? replyPhotos : mainReplyPhotos;
    const identity = parentCommentId ? replyIdentity : mainIdentity;
    if (canChooseIdentity && identity.importing && (!identity.name.trim() || identity.name.trim().length > 80 || /[\p{Cc}\p{Cf}]/u.test(identity.name))) {
      setError("Enter a display name of 1 to 80 characters without control characters.");
      return;
    }
    if (!photosReady(selectedPhotos)) {
      setError("Wait for every photo to finish uploading.");
      return;
    }
    setSubmitting(true);
    setError("");

    // TRACE STEP 3: Send the reply to the server. To continue tracing this
    // request, find this POST route in recovery-community-server/api/forum.js.
    let response;
    let result;
    try {
      response = await fetch(`${API}/api/forum/posts/${postId}/comments`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        // MENTION TRACE STEP 6B: Send the visible reply plus the real IDs chosen
        // from MentionTextarea. Continue at server/api/forum.js.
        body: JSON.stringify({
          body,
          parent_comment_id: parentCommentId,
          mentioned_user_ids: selectedMentions.map((member) => member.user_id),
          media_ids: readyMediaIds(selectedPhotos),
          ...(canChooseIdentity && identity.importing ? { is_imported: true, imported_author_label: identity.name.trim() } : {}),
        }),
      });

      // The server sends JSON back. If it rejected the reply, show its message
      // and stop here without clearing the member's text.
      result = await response.json();
    } catch {
      setError("Could not confirm your reply. Your draft is saved here; check the thread before trying again.");
      setSubmitting(false);
      return;
    }
    if (!response.ok) {
      setError(result.message || "Could not add that reply.");
      setSubmitting(false);
      return;
    }

    // Clear only the submitted composer, preserving the other draft.
    if (parentCommentId) {
      replyDrafts.current.delete(parentCommentId);
      setReplyIdentity({ importing: false, name: "" });
      setReplyBody("");
      setReplyMentions([]);
      setReplyPhotos([]);
      setReplyingTo(null);
    } else {
      setMainIdentity({ importing: false, name: "" });
      setMainReply("");
      setMainReplyMentions([]);
      setMainReplyPhotos([]);
    }
    setSubmitting(false);

    try {
      const refreshed = await fetchThread();
      setPost(refreshed.post);
      setComments(refreshed.comments);
    } catch {
      // The POST succeeded; never suggest resending an already-published reply.
      setError("Your reply was posted. Refresh the page to see the latest conversation.");
    }
  }

  function selectReplyTarget(commentId) {
    if (submitting || post.locked || uploadBusy) return;
    // Keep drafts separate so switching destinations never moves someone's text.
    if (replyingTo) replyDrafts.current.set(replyingTo, {
      body: replyBody, mentions: replyMentions, photos: replyPhotos, identity: replyIdentity,
    });
    const target = comments.find((comment) => comment.comment_id === commentId);
    if (target && !target.deleted_at) {
      // An imported name represents someone else, not the account that imported it.
      const member = !target.is_imported && target.author_id !== user?.id
        ? { user_id: target.author_id, username: target.author_username } : null;
      const draft = replyDrafts.current.get(commentId);
      setReplyingTo(commentId);
      setReplyBody(draft?.body ?? (member ? `@${member.username} ` : ""));
      setReplyMentions(draft?.mentions ?? (member ? [member] : []));
      setReplyPhotos(draft?.photos ?? []);
      setReplyIdentity(draft?.identity ?? { importing: false, name: "" });
    } else setReplyingTo(null);
    // Synchronous focus allows a tap to open the keyboard on mobile.
    composerRef.current?.querySelector("textarea")?.focus({ preventScroll: true });
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

  async function editComment(commentId, body) {
    setError("");
    // COMMENT EDIT TRACE STEP 1: an authorized staff member's reply editor
    // sends the new wording here. Continue at api/forum.js on the server.
    const response = await fetch(`${API}/api/forum/posts/${postId}/comments/${commentId}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(result.message || "Could not save that reply.");
      return false;
    }
    setComments((current) => current.map((comment) => (
      comment.comment_id === commentId ? { ...comment, ...result } : comment
    )));
    return true;
  }

  function togglePostFlag() {
    if (!post.flagged_by_me) { setReportNotice(""); setReportTarget({ postId, commentId: null }); }
  }

  async function togglePostFollow() {
    const isFollowing = post.followed_by_me;
    const response = await fetch(`${API}/api/forum/posts/${postId}/follow`, {
      method: isFollowing ? "DELETE" : "POST",
      headers: { ...headers, "Content-Type": "application/json" },
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setError(result.message || "Could not update that.");
      return;
    }
    setPost((current) => ({
      ...current,
      followed_by_me: !isFollowing,
      // The private count excludes the author, so following your own post
      // changes notification behavior without changing this number.
      follower_count: current.follower_count,
    }));
  }

  function toggleCommentFlag(commentId, isFlagged) {
    if (!isFlagged) { setReportNotice(""); setReportTarget({ postId, commentId }); }
  }

  async function submitReport(reason) {
    const target = reportTarget;
    const suffix = target.commentId ? "/comments/" + target.commentId + "/flag" : "/flag";
    const response = await fetch(API + "/api/forum/posts/" + target.postId + suffix, {
      method: "POST", headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.message || "Your report could not be sent. Please try again.");
    }
    if (target.commentId) setComments(current => current.map(comment => comment.comment_id === target.commentId ? { ...comment, flagged_by_me: true } : comment));
    else setPost(current => ({ ...current, flagged_by_me: true }));
    setReportNotice("Report sent to the admin team.");
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
    if (staffOnly) {
      try { const refreshed = await fetchThread(); setPost(refreshed.post); }
      catch { setError("Reaction saved. Refresh to see the latest acknowledgments."); }
    }
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
    <main className={`forum-shell forum-thread-shell ${staffOnly ? "forum-staff-section" : ""}`}>
      <Link to={staffOnly ? "/forum?view=staff" : post.category_slug === "announcements" ? "/forum?view=announcements" : "/forum"} className="forum-back"><ArrowLeft size={17} /> Back to {staffOnly ? "staff announcements" : post.category_slug === "announcements" ? "announcements" : "main forum"}</Link>
      {staffOnly && <div className="forum-staff-banner"><ShieldCheck size={21} aria-hidden="true" /><strong>Staff only</strong><p>This announcement, its replies, and its edit history are private to moderators, admins, and the owner.</p></div>}

      <article className="forum-thread-post">
        <div className="forum-thread-topline">
          {post.category_slug === "announcements" && <span className="forum-category-pill"><ForumCategoryGlyph name={post.category_name} size={13} />Announcements</span>}
          {(post.tags || []).map((tag) => <span className="forum-tag-pill" key={tag.tag_id}>#{tag.slug}</span>)}
          <div className="forum-post-meta">
            {post.pinned && <span className="forum-state forum-state--pinned"><Pin size={13} /> Pinned</span>}
            {post.locked && <span className="forum-state"><Lock size={13} /> Locked</span>}
          </div>
        </div>

        {editingPost ? (
          <form className="forum-edit-post-form" onSubmit={saveEditedPost}>
            <p>{staffOnly ? "Editing a staff-only announcement. Previous versions remain visible only to staff." : "Previous titles and text remain visible to members in edit history."}</p>
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
              <div><strong>{post.author_username}</strong><span>{formatDate(post.created_at)}{editedLabel(post) && <b className="forum-edited-label" title={`Last edited ${formatDate(post.content_edited_at)}`}>{editedLabel(post)}</b>}</span></div>
            </div>
            {post.content_edited_at && <PostEditHistory key={`${post.post_id}:${post.content_edited_at}`} postId={post.post_id} token={token} />}
            <MentionText className="forum-thread-body" body={post.body} mentions={post.mentions} />
            <ForumPhotoGallery images={post.images} token={token} label={`Photo from ${post.author_username}`} />
            {post.poll && (
              <ForumPoll
                initialPoll={post.poll}
                postId={post.post_id}
                token={token}
                canManage={isAuthor || (staffOnly ? canEditOthers : canModerate)}
                socket={socket}
              />
            )}
            {/* REACTION TRACE STEP 2A: This controls the reaction buttons shown
                directly under the main forum post. `onReact` points to the
                togglePostReaction() function above. This is where the prop gets
                its value: onReact={togglePostReaction}. ReactionBar does not
                import that function; this parent component hands it down. */}
            <ReactionBar
              staffAcknowledgment={staffOnly}
              reactions={post.reactions}
              myReaction={post.my_reaction}
              onReact={togglePostReaction}
              disabled={reactingTo === "post"}
            />
            {staffOnly && <div className="forum-staff-acknowledgments">
              <strong>Got it</strong>
              <p>{post.acknowledgments?.length ? post.acknowledgments.map(person => person.username).join(", ") : "No staff acknowledgments yet. Choose the Got it reaction to add yours."}</p>
              <small>Acknowledgments use reactions; they do not reset when this post is edited.</small>
            </div>}
          </>
        )}

        {!editingPost && (
          <div className="forum-moderation">
            {canEditPost && (
              <button className="forum-action-button" onClick={startEditingPost}><Pencil size={15} /> Edit</button>
            )}
            {canModerate && (
              <>
                <button className="forum-action-button" onClick={() => moderate({ pinned: !post.pinned })}><Pin size={15} /> {post.pinned ? "Unpin" : "Pin"}</button>
                <button className="forum-action-button" onClick={() => moderate({ locked: !post.locked })}><Lock size={15} /> {post.locked ? "Unlock" : "Lock"}</button>
              </>
            )}
            {(isAuthor || canDeleteOthers) && (
              confirmingPostDelete ? (
                <span className="forum-inline-confirm">
                  Delete this post and all of its replies?
                  <button onClick={deletePost}>Yes, delete all</button>
                  <button onClick={() => setConfirmingPostDelete(false)}>Cancel</button>
                </span>
              ) : (
                <button className="forum-action-button forum-action-button--danger" onClick={() => setConfirmingPostDelete(true)}><Trash2 size={15} /> Delete</button>
              )
            )}
            {!isAuthor && (
              <button className={`forum-action-button ${post.flagged_by_me ? "is-flagged" : ""}`} onClick={togglePostFlag} disabled={post.flagged_by_me}>
                <Flag size={15} /> {post.flagged_by_me ? "Reported" : "Report to Admin"}
              </button>
            )}
            <button className={`forum-action-button ${post.followed_by_me ? "is-following" : ""}`} onClick={togglePostFollow}>
              <Bell size={15} fill={post.followed_by_me ? "currentColor" : "none"} /> {staffOnly ? (post.followed_by_me ? "Saved to Following" : "Save to Following") : post.followed_by_me ? "Following" : "Follow"}
            </button>
            {isAuthor && Number(post.follower_count) > 0 && (
              <span className="forum-follower-count">
                {post.follower_count} {Number(post.follower_count) === 1 ? "member is" : "members are"} following
              </span>
            )}
          </div>
        )}
      </article>

      <section className="forum-thread-replies">
        <div className="forum-feed-heading forum-thread-replies__heading"><div><p className="forum-eyebrow">Community responses</p><h2>{comments.filter((c) => !c.deleted_at).length} {comments.filter((c) => !c.deleted_at).length === 1 ? "reply" : "replies"}</h2></div><span>Oldest first</span></div>
        {post.first_unread_comment_id && (
          <button
            type="button"
            className="forum-thread-jump-new"
            onClick={() => document.getElementById(`comment-${post.first_unread_comment_id}`)
              ?.scrollIntoView({ behavior: "smooth", block: "center" })}
          >
            Jump to first new reply
          </button>
        )}
        {error && <p className="forum-error" role="alert">{error}</p>}
        {commentTree.length === 0 && <div className="forum-empty"><h3>No replies yet.</h3><p>You can be the first person to respond.</p></div>}
        <div className="forum-comment-tree">
          {/* Display every top-level comment. Each Comment component then maps
              its own children recursively near the top of this file. */}
          {commentTree.map((comment) => (
            <ForumComment
              staffOnly={staffOnly}
              key={comment.comment_id}
              comment={comment}
              depth={0}
              currentUserId={user?.id}
              canEditOwn={canEditOwn}
              canEditOthers={canEditOthers}
              canDeleteOthers={canDeleteOthers}
              token={token}
              replyingTo={replyingTo}
              toggleReplyTo={selectReplyTarget}
              replyDisabled={submitting || post.locked || uploadBusy}
              editComment={editComment}
              deleteComment={deleteComment}
              toggleCommentFlag={toggleCommentFlag}
              toggleCommentReaction={toggleCommentReaction}
              reactingTo={reactingTo}
              formatDate={formatDate}
              editedLabel={editedLabel}
            />
          ))}
        </div>
      </section>

      {post.locked && (
        <div className="forum-locked-note"><Lock size={18} /> This conversation is locked. Existing replies are still available to read.</div>
      )}

      {!post.locked && (
        /* One composer; the parent comment ID determines the destination. */
        <form data-mobile-action-bar ref={composerRef} className={`forum-persistent-reply ${canChooseIdentity ? "forum-persistent-reply--owner" : ""}`} onSubmit={(event) => submitReply(event)}>
          <div className="forum-persistent-reply__inner">
            {replyingTo && <div className="forum-persistent-reply__target">
              <span role="status">Replying to <strong>{replyTarget?.author_username || "this comment"}</strong></span>
              <button type="button" disabled={submitting || uploadBusy} onClick={() => selectReplyTarget(null)}>Cancel</button>
            </div>}
            {canChooseIdentity && <ReplyIdentity user={user} identity={activeIdentity} onChange={replyingTo ? setReplyIdentity : setMainIdentity} disabled={submitting} />}
            <div className="forum-persistent-reply__row">
              <MentionTextarea
                quiet={staffOnly}
                token={token}
                rows={1}
                highlightMentions
                ariaLabel={replyingTo ? `Reply to ${replyTarget?.author_username || "comment"}` : "Comment on original post"}
                value={activeBody}
                onChange={replyingTo ? setReplyBody : setMainReply}
                mentions={replyingTo ? replyMentions : mainReplyMentions}
                onMentionsChange={replyingTo ? setReplyMentions : setMainReplyMentions}
                placeholder={replyingTo ? `Reply to ${replyTarget?.author_username || "comment"}` : `Comment on this post as ${mainDisplayName || "another name"}`}
              />
              <div className="forum-persistent-reply__actions">
                <PhotoUploader preserveDraftPreviews photos={activePhotos} onChange={replyingTo ? setReplyPhotos : setMainReplyPhotos} token={token} compact pasteSelector="textarea" />
                <button
                  className="forum-persistent-reply__send"
                  aria-label={submitting ? "Posting" : replyingTo ? `Send reply to ${replyTarget?.author_username || "comment"}` : "Send comment on original post"}
                  disabled={submitting || !activeBody.trim() || !photosReady(activePhotos) || (canChooseIdentity && activeIdentity.importing && !activeIdentity.name.trim())}
                >
                  <Send size={18} />
                  {canChooseIdentity && activeIdentity.importing && <span>Reply as {mainDisplayName || "another name"}</span>}
                </button>
              </div>
            </div>
            {uploadBusy && <small className="forum-persistent-reply__uploading" role="status">Uploading photo ? wait to switch between comments and replies.</small>}
            {error && <p className="forum-error" role="alert">{error}</p>}
          </div>
        </form>
      )}
      {reportNotice && <p role="status" className="forum-report-notice">{reportNotice}</p>}
      {reportTarget?.postId === postId && <ReportContentDialog onClose={() => setReportTarget(null)} onSubmit={submitReport} />}
    </main>
  );
}
