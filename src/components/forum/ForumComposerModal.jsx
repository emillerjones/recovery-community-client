import { X } from "lucide-react";
import MentionTextarea from "../MentionTextarea";
import MemberAvatar from "../MemberAvatar";

export default function ForumComposerModal({
  user,
  token,
  composingAnnouncement,
  draft,
  setDraft,
  draftMentions,
  setDraftMentions,
  tags,
  onToggleTag,
  error,
  submitting,
  onSubmit,
  onClose,
}) {
  return (
    <div className="forum-feed-modal" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="forum-feed-close" onClick={onClose} aria-label="Close">
          <X />
        </button>
        <p className="forum-feed-eyebrow">
          {composingAnnouncement ? "Staff announcement" : "New conversation"}
        </p>
        <h2>
          {composingAnnouncement ? "Share an official update" : "What would you like to share?"}
        </h2>
        <div className="forum-feed-identity">
          <MemberAvatar
            username={user?.username}
            avatarUrl={user?.avatar_url}
            size={38}
          />
          <span>Posting as <strong>{user?.username}</strong></span>
        </div>

        {/* CREATE POST TRACE STEP 1: The Publish button submits this form. The
            callback is Forum.jsx's createPost(), where the API request begins. */}
        <form onSubmit={onSubmit}>
          <label>
            Title
            <input
              required
              maxLength={180}
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              placeholder="Give your post a clear title"
            />
          </label>
          <label>
            Message
            <MentionTextarea
              token={token}
              rows={7}
              value={draft.body}
              onChange={(body) => setDraft((current) => ({ ...current, body }))}
              mentions={draftMentions}
              onMentionsChange={setDraftMentions}
              placeholder="You do not have to have the perfect words."
            />
          </label>
          <fieldset>
            <legend>Tags <small>Choose up to 3</small></legend>
            <div className="forum-feed-tag-picker">
              {tags.filter((tag) => tag.active).map((tag) => (
                <button
                  type="button"
                  key={tag.tag_id}
                  className={draft.tag_ids.includes(tag.tag_id) ? "is-active" : ""}
                  onClick={() => onToggleTag(tag.tag_id)}
                >
                  #{tag.slug}
                </button>
              ))}
            </div>
          </fieldset>
          {error && <p className="forum-feed-error">{error}</p>}
          <footer>
            <button type="button" onClick={onClose}>Cancel</button>
            <button className="forum-feed-publish" disabled={submitting}>
              {submitting
                ? "Publishing…"
                : composingAnnouncement
                  ? "Publish announcement"
                  : "Publish post"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
