import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import MentionTextarea from "../../components/MentionTextarea";
import MemberAvatar from "../../components/MemberAvatar";
import PhotoUploader from "../../components/forumPhotos/PhotoUploader";
import {
  discardPendingPhotos,
  photosReady,
  readyMediaIds,
} from "../../components/forumPhotos/photoUploadUtils";

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
  onPublished,
}) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState({ title: "", body: "", tag_ids: [] });
  const [draftMentions, setDraftMentions] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [storedDraft, setStoredDraft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const draftStorageKey = useMemo(() => {
    const userId = user?.id || user?.user_id;
    if (!userId) return null;
    const postType = composingAnnouncement ? "announcement" : "community";
    return `forum-post-draft:${userId}:${postType}`;
  }, [composingAnnouncement, user?.id, user?.user_id]);
  const hasDraftContent = Boolean(
    draft.title.trim() || draft.body.trim() || draft.tag_ids.length || photos.length
  );

  useEffect(() => {
    if (!open || !draftStorageKey || hasDraftContent) return;
    try {
      const stored = JSON.parse(localStorage.getItem(draftStorageKey));
      if (!stored?.title?.trim() && !stored?.body?.trim() && !stored?.tag_ids?.length && !stored?.photos?.length) return;
      Promise.resolve().then(() => setStoredDraft(stored));
    } catch {
      localStorage.removeItem(draftStorageKey);
    }
  }, [draftStorageKey, hasDraftContent, open]);

  useEffect(() => {
    if (!open || !draftStorageKey || storedDraft) return;
    const timeoutId = window.setTimeout(() => {
      if (!hasDraftContent) {
        localStorage.removeItem(draftStorageKey);
        return;
      }
      localStorage.setItem(draftStorageKey, JSON.stringify({
        ...draft,
        mentions: draftMentions,
        photos: photos.filter((photo) => photo.status === "ready").map((photo) => ({
          client_id: `saved-${photo.media_id}`,
          media_id: photo.media_id,
          width: photo.width,
          height: photo.height,
          format: photo.format,
          status: "ready",
        })),
        savedAt: new Date().toISOString(),
      }));
    }, 400);
    return () => window.clearTimeout(timeoutId);
  }, [draft, draftMentions, draftStorageKey, hasDraftContent, open, photos, storedDraft]);

  function discardDraft() {
    discardPendingPhotos(photos, token);
    if (draftStorageKey) localStorage.removeItem(draftStorageKey);
    setDraft({ title: "", body: "", tag_ids: [] });
    setDraftMentions([]);
    setPhotos([]);
    setStoredDraft(null);
    setError("");
  }

  function restoreDraft() {
    setDraft({
      title: storedDraft.title || "",
      body: storedDraft.body || "",
      tag_ids: Array.isArray(storedDraft.tag_ids) ? storedDraft.tag_ids : [],
    });
    setDraftMentions(Array.isArray(storedDraft.mentions) ? storedDraft.mentions : []);
    setPhotos(Array.isArray(storedDraft.photos) ? storedDraft.photos : []);
    setStoredDraft(null);
  }

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
    if (!photosReady(photos)) return setError("Wait for every photo to finish uploading.");

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
        media_ids: readyMediaIds(photos),
      }),
    });
    const result = await response.json();
    setSubmitting(false);
    if (!response.ok) return setError(result.message || "Could not publish that post.");

    // CREATE POST TRACE STEP 6: The API returned PostgreSQL's new post_id, so
    // take the member directly to the thread they just created.
    if (draftStorageKey) localStorage.removeItem(draftStorageKey);
    setDraft({ title: "", body: "", tag_ids: [] });
    setDraftMentions([]);
    setPhotos([]);
    if (onPublished) onPublished(result);
    else navigate(`/forum/${result.post_id}`);
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

        {storedDraft && (
          <div className="forum-draft-recovery" role="status">
            <div>
              <strong>Continue your unfinished post?</strong>
              <span>This draft was saved on this device.</span>
            </div>
            <div>
              <button type="button" onClick={discardDraft}>Discard</button>
              <button type="button" onClick={restoreDraft}>Continue writing</button>
            </div>
          </div>
        )}

        {/* CREATE POST TRACE STEP 1: The Publish button submits this form and
            directly calls createPost(), defined above in this same file. */}
        {!storedDraft && <form onSubmit={createPost}>
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
          <PhotoUploader photos={photos} onChange={setPhotos} token={token} />
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
          {hasDraftContent && (
            <div className="forum-draft-status">
              <span>Draft saved on this device</span>
              <button type="button" onClick={discardDraft}>Discard draft</button>
            </div>
          )}
          <footer>
            <button type="button" onClick={onClose}>Cancel</button>
            <button className="forum-feed-publish" disabled={submitting || !photosReady(photos)}>
              {submitting
                ? "Publishing…"
                : !photosReady(photos)
                  ? "Uploading photos…"
                : composingAnnouncement
                  ? "Publish announcement"
                  : "Publish post"}
            </button>
          </footer>
        </form>}
      </section>
    </div>
  );
}
