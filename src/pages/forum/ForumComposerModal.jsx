import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import MentionTextarea from "../../components/MentionTextarea";
import MemberAvatar from "../../components/MemberAvatar";

const API = import.meta.env.VITE_API;

export default function ForumComposerModal({
  open,
  user,
  token,
  categoryId,
  canPublish,
  composingAnnouncement,
  tags,
  onClose,
}) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState({ title: "", body: "", tag_ids: [] });
  const [draftMentions, setDraftMentions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function toggleDraftTag(tagId) {
    setDraft((current) => {
      const selected = current.tag_ids.includes(tagId);
      if (!selected && current.tag_ids.length >= 3) return current;
      return {
        ...current,
        tag_ids: selected
          ? current.tag_ids.filter((id) => id !== tagId)
          : [...current.tag_ids, tagId],
      };
    });
  }

  async function createPost(event) {
    // CREATE POST TRACE STEP 2: This function lives beside the form that calls
    // it. Validate the form context, then send its local draft to the API.
    // Continue at CREATE POST TRACE STEP 3 in server/api/forum.js.
    event.preventDefault();
    if (!canPublish) {
      onClose();
      return setError("Only moderators, administrators, and owners can publish announcements.");
    }
    if (!categoryId) return setError("The forum needs a Main Forum category before posting.");

    setSubmitting(true);
    setError("");
    const response = await fetch(`${API}/api/forum/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        category_id: categoryId,
        title: draft.title,
        body: draft.body,
        tag_ids: draft.tag_ids,
        mentioned_user_ids: draftMentions.map((member) => member.user_id),
      }),
    });
    const result = await response.json();
    setSubmitting(false);
    if (!response.ok) return setError(result.message || "Could not publish that post.");

    // CREATE POST TRACE STEP 6: The API returned PostgreSQL's new post_id, so
    // take the member directly to the thread they just created.
    navigate(`/forum/${result.post_id}`);
  }

  if (!open) return null;

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

        {/* CREATE POST TRACE STEP 1: The Publish button submits this form and
            directly calls createPost(), defined above in this same file. */}
        <form onSubmit={createPost}>
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
                  onClick={() => toggleDraftTag(tag.tag_id)}
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
