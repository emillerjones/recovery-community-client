import { useState } from "react";
import { CornerDownRight, Flag, Pencil, Trash2 } from "lucide-react";
import MemberAvatar from "../../components/MemberAvatar";
import MentionText from "../../components/MentionText";
import MentionTextarea from "../../components/MentionTextarea";
import ReactionBar from "../../components/ReactionBar";
import ForumPhotoGallery from "../../components/forumPhotos/ForumPhotoGallery";
import PhotoUploader from "../../components/forumPhotos/PhotoUploader";
import { photosReady } from "../../components/forumPhotos/photoUploadUtils";

export default function ForumComment({
  comment, depth, currentUserId, canEditOwn, canEditOthers, canDeleteOthers,
  token, replyingTo, toggleReplyTo, replyBody, setReplyBody, replyMentions,
  setReplyMentions, replyPhotos, setReplyPhotos, submitReply, submitting, editComment, deleteComment,
  toggleCommentFlag, toggleCommentReaction, reactingTo, formatDate,
  editedLabel,
}) {
  // This displays ONE comment. At the bottom it renders another
  // <ForumComment /> for every child, which is how nested replies continue.
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(comment.body || "");
  const [savingEdit, setSavingEdit] = useState(false);
  const isRemoved = Boolean(comment.deleted_at);
  const isOwn = comment.author_id === currentUserId;
  const canEdit = !isRemoved && ((isOwn && canEditOwn) || canEditOthers);
  const canDelete = !isRemoved && (isOwn || canDeleteOthers);

  async function saveEdit(event) {
    event.preventDefault();
    setSavingEdit(true);
    const saved = await editComment(comment.comment_id, editBody);
    setSavingEdit(false);
    if (saved) setEditing(false);
  }

  // CSS visually indents only the first two depths, preventing deeply nested
  // replies from becoming too narrow or overflowing on mobile.
  return (
    <div className={`forum-comment depth-${depth}`}>
      <div className="forum-comment-line" />
      <article id={`comment-${comment.comment_id}`}>
        {isRemoved ? (
          <p className="forum-comment-removed">This reply was removed.</p>
        ) : (
          <>
            <div className="forum-comment-head forum-comment-head--reply">
              <MemberAvatar
                className="forum-avatar forum-avatar--small"
                username={comment.author_username}
                avatarUrl={comment.author_avatar_url}
                size={34}
              />
              <div>
                <strong>{comment.author_username}</strong>
                <span>
                  {formatDate(comment.created_at)}
                  {editedLabel(comment) && (
                    <b
                      className="forum-edited-label"
                      title={`Last edited ${formatDate(comment.content_edited_at)}`}
                    >
                      {editedLabel(comment)}
                    </b>
                  )}
                </span>
              </div>
            </div>

            {editing ? (
              <form className="forum-inline-reply" onSubmit={saveEdit}>
                <textarea
                  required autoFocus rows={4} value={editBody}
                  onChange={(event) => setEditBody(event.target.value)}
                />
                <div className="forum-inline-reply__actions">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setEditBody(comment.body);
                    }}
                  >
                    Cancel
                  </button>
                  <button disabled={savingEdit || !editBody.trim()}>
                    {savingEdit ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </form>
            ) : (
              <MentionText body={comment.body} mentions={comment.mentions} />
            )}
            {!editing && <ForumPhotoGallery images={comment.images} token={token} label={`Photo from ${comment.author_username}`} />}

            {/* REACTION TRACE STEP 2B: These buttons belong to one comment or
                nested reply. A click sends its ID and the selected type back
                to toggleCommentReaction() in ForumThread.jsx. */}
            <ReactionBar
              reactions={comment.reactions}
              myReaction={comment.my_reaction}
              onReact={(reactionType) => (
                toggleCommentReaction(comment.comment_id, reactionType)
              )}
              disabled={reactingTo === `comment-${comment.comment_id}`}
            />

            <div className="forum-comment-actions">
              <button
                className="forum-reply-button"
                onClick={() => toggleReplyTo(comment.comment_id)}
              >
                <CornerDownRight size={15} /> Reply
              </button>
              {canEdit && !editing && (
                <button
                  className="forum-reply-button"
                  onClick={() => {
                    setEditBody(comment.body);
                    setEditing(true);
                  }}
                >
                  <Pencil size={14} /> Edit
                </button>
              )}
              {canDelete && (
                confirmingDelete ? (
                  <span className="forum-inline-confirm">
                    Delete this reply and all replies beneath it?
                    <button onClick={() => deleteComment(comment.comment_id)}>
                      Yes, delete all
                    </button>
                    <button onClick={() => setConfirmingDelete(false)}>Cancel</button>
                  </span>
                ) : (
                  <button
                    className="forum-reply-button"
                    onClick={() => setConfirmingDelete(true)}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                )
              )}
              {!isOwn && (
                <button
                  className={`forum-reply-button ${comment.flagged_by_me ? "is-flagged" : ""}`}
                  onClick={() => toggleCommentFlag(
                    comment.comment_id,
                    comment.flagged_by_me
                  )}
                >
                  <Flag size={14} /> {comment.flagged_by_me ? "Flagged" : "Flag"}
                </button>
              )}
            </div>

            {replyingTo === comment.comment_id && (
              <form
                className="forum-inline-reply"
                onSubmit={(event) => submitReply(event, comment.comment_id)}
              >
                {/* This controls the small reply box beneath one comment. */}
                <MentionTextarea
                  token={token} autoFocus rows={3} value={replyBody}
                  onChange={setReplyBody} mentions={replyMentions}
                  onMentionsChange={setReplyMentions}
                  placeholder={`Reply to ${comment.author_username}`}
                />
                <PhotoUploader photos={replyPhotos} onChange={setReplyPhotos} token={token} compact />
                <div className="forum-inline-reply__actions">
                  <button type="button" onClick={() => toggleReplyTo(comment.comment_id)}>
                    Cancel
                  </button>
                  <button disabled={submitting || !photosReady(replyPhotos)}>
                    {submitting ? "Replying…" : !photosReady(replyPhotos) ? "Uploading…" : "Reply"}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </article>

      {/* Recursive rendering: every child reply uses this same component. */}
      {!isRemoved && comment.children.map((child) => (
        <ForumComment
          key={child.comment_id}
          comment={child}
          depth={depth + 1}
          currentUserId={currentUserId}
          canEditOwn={canEditOwn}
          canEditOthers={canEditOthers}
          canDeleteOthers={canDeleteOthers}
          token={token}
          replyingTo={replyingTo}
          toggleReplyTo={toggleReplyTo}
          replyBody={replyBody}
          setReplyBody={setReplyBody}
          replyMentions={replyMentions}
          setReplyMentions={setReplyMentions}
          replyPhotos={replyPhotos}
          setReplyPhotos={setReplyPhotos}
          submitReply={submitReply}
          submitting={submitting}
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
  );
}
