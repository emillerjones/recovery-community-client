import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, ShieldCheck, X } from "lucide-react";
import MentionTextarea from "../../components/MentionTextarea";
import MemberAvatar from "../../components/MemberAvatar";
import PhotoUploader from "../../components/forumPhotos/PhotoUploader";
import PollComposer from "../../components/forumPolls/PollComposer";
import {
  createPollDraft,
  pollDraftToRequest,
} from "../../components/forumPolls/pollDraft";
import {
  discardPendingPhotos,
  photosReady,
  readyMediaIds,
} from "../../components/forumPhotos/photoUploadUtils";

const API = import.meta.env.VITE_API;
const emptyDraft = () => ({ title: "", body: "", tag_ids: [], poll: null, is_imported: false, imported_author_label: "" });

export default function ForumComposerModal({
  open,
  user,
  token,
  categoryId,
  canPublish,
  composingAnnouncement,
  staffOnly = false,
  tags,
  onClose,
}) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(emptyDraft);
  const canImport = user?.role_id === 1;
  const importing = canImport && draft.is_imported;
  const authorName = importing ? draft.imported_author_label.trim() || "Imported name" : user?.username;
  const [draftMentions, setDraftMentions] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [storedDraft, setStoredDraft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const panelRef = useRef(null);
  const draftStorageKey = useMemo(() => {
    const userId = user?.id || user?.user_id;
    if (!userId) return null;
    const postType = staffOnly ? "staff" : composingAnnouncement ? "announcement" : "community";
    return `forum-post-draft:${userId}:${postType}`;
  }, [staffOnly, composingAnnouncement, user?.id, user?.user_id]);
  const hasDraftContent = Boolean(
    draft.title.trim() || draft.body.trim() || draft.tag_ids.length || draft.poll || photos.length || (importing && draft.imported_author_label.trim())
  );

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector("button")?.focus();
    function onKey(event) {
      if (event.key === "Escape" && !submitting) onClose();
      if (event.key !== "Tab") return;
      const items = [...panelRef.current.querySelectorAll('button:not(:disabled), input, textarea, select, [tabindex="0"]')].filter(item => item.getClientRects().length);
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = oldOverflow; document.removeEventListener("keydown", onKey); if (previousFocus?.isConnected) previousFocus.focus(); };
  }, [open, onClose, submitting]);

  useEffect(() => {
    if (!open || !draftStorageKey || hasDraftContent) return;
    try {
      const stored = JSON.parse(localStorage.getItem(draftStorageKey));
      if (!stored?.title?.trim() && !stored?.body?.trim() && !stored?.tag_ids?.length && !stored?.poll && !stored?.photos?.length && !stored?.imported_author_label?.trim()) return;
      Promise.resolve().then(() => setStoredDraft(stored));
    } catch {
      localStorage.removeItem(draftStorageKey);
    }
  }, [draftStorageKey, hasDraftContent, open]);

  useEffect(() => {
    if (!open || !draftStorageKey || storedDraft) return;
      if (!hasDraftContent) {
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
  }, [draft, draftMentions, draftStorageKey, hasDraftContent, open, photos, storedDraft]);

  function discardDraft() {
    if ((hasDraftContent || storedDraft) && !window.confirm("Discard this unfinished post? This cannot be undone.")) return;
    discardPendingPhotos(photos, token);
    if (draftStorageKey) localStorage.removeItem(draftStorageKey);
    setDraft(emptyDraft());
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
      poll: storedDraft.poll && typeof storedDraft.poll === "object" ? storedDraft.poll : null,
      is_imported: canImport && storedDraft.is_imported === true,
      imported_author_label: canImport && typeof storedDraft.imported_author_label === "string" ? storedDraft.imported_author_label : "",
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
    if (!categoryId) return setError("This posting destination is unavailable. Refresh the page and try again.");
    if (!photosReady(photos)) return setError("Wait for every photo to finish uploading.");
    if (importing && !draft.imported_author_label.trim()) return setError("Enter the imported author's display name.");

    let poll = null;
    try {
      poll = pollDraftToRequest(draft.poll);
    } catch (pollError) {
      return setError(pollError.message);
    }

    setSubmitting(true);
    setError("");
    try {
    const response = await fetch(`${API}/api/forum/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        category_id: categoryId,
        audience: staffOnly ? "staff" : "members",
        title: draft.title,
        body: draft.body,
        tag_ids: draft.tag_ids,
        mentioned_user_ids: draftMentions.map((member) => member.user_id),
        media_ids: readyMediaIds(photos),
        poll,
        ...(importing ? { is_imported: true, imported_author_label: draft.imported_author_label.trim() } : {}),
      }),
    });
    const result = await response.json();
    setSubmitting(false);
    if (!response.ok) return setError(result.message || "Could not publish that post.");

    // CREATE POST TRACE STEP 6: The API returned PostgreSQL's new post_id, so
    // take the member directly to the thread they just created.
    if (draftStorageKey) localStorage.removeItem(draftStorageKey);
    setDraft(emptyDraft());
    setDraftMentions([]);
    setPhotos([]);
    navigate(`/forum/${result.post_id}`);
    } catch {
      setError("Could not connect. Your draft is still here; please try again.");
    } finally { setSubmitting(false); }
  }

  if (!open) return null;

  return (
    <div className={`forum-feed-modal ${staffOnly ? "forum-staff-composer" : ""}`} onMouseDown={submitting ? undefined : onClose}>
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="forum-compose-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="forum-feed-close" disabled={submitting} onClick={onClose} aria-label="Close">
          <X />
        </button>
        <p className="forum-feed-eyebrow">
          {staffOnly ? "Private staff announcement" : composingAnnouncement ? "Community announcement" : "New conversation"}
        </p>
        <h2 id="forum-compose-title">
          {staffOnly ? "Share with your staff team" : composingAnnouncement ? "Share an official update" : "What would you like to share?"}
        </h2>
        <div className={staffOnly ? "forum-staff-banner" : "forum-audience-label"}>
          {staffOnly && <ShieldCheck size={20} aria-hidden="true" />}
          <strong>{staffOnly ? "Staff only — regular members cannot see this post." : "Visible to all community members"}</strong>
        </div>
        <div className="forum-feed-identity">
          <MemberAvatar
            username={authorName}
            avatarUrl={importing ? null : user?.avatar_url}
            size={38}
          />
          {canImport && !storedDraft ? (
            <div className="forum-posting-as">
              <span id="forum-posting-as-label">Posting as</span>
              <div className="forum-posting-as__choices" role="group" aria-labelledby="forum-posting-as-label">
                <button type="button" aria-pressed={!importing} disabled={submitting} onClick={() => setDraft(current => ({ ...current, is_imported: false }))}>Myself</button>
                <button type="button" aria-pressed={importing} disabled={submitting} onClick={() => setDraft(current => ({ ...current, is_imported: true }))}>Imported name</button>
              </div>
            </div>
          ) : <span>Posting as <strong>{user?.username}</strong></span>}
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
          {importing && (
            <label>
              Display name
              <input required maxLength={80} disabled={submitting} value={draft.imported_author_label}
                onChange={event => setDraft(current => ({ ...current, imported_author_label: event.target.value }))}
                placeholder="Anonymous, Participant A, or another name" aria-describedby="forum-imported-name-help" />
              <small id="forum-imported-name-help" className="forum-imported-name-help">
                Shown as {authorName} · Imported post. Your Owner account records who published it.
              </small>
            </label>
          )}
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
              quiet={staffOnly}
              token={token}
              rows={7}
              value={draft.body}
              onChange={(body) => setDraft((current) => ({ ...current, body }))}
              mentions={draftMentions}
              onMentionsChange={setDraftMentions}
              placeholder="You do not have to have the perfect words."
            />
          </label>
          {draft.poll ? (
            <PollComposer
              value={draft.poll}
              onChange={(poll) => setDraft((current) => ({ ...current, poll }))}
              onRemove={() => setDraft((current) => ({ ...current, poll: null }))}
            />
          ) : (
            <button
              type="button"
              className="forum-poll-add-button"
              onClick={() => setDraft((current) => ({ ...current, poll: createPollDraft() }))}
            >
              <BarChart3 size={17} /> Add a poll
            </button>
          )}
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
          <p className="forum-audience-label">{staffOnly ? "Audience: moderators, admins, and owner only" : "Audience: all community members"}</p>
          <footer>
            <button type="button" disabled={submitting} onClick={onClose}>Close & keep draft</button>
            <button className="forum-feed-publish" disabled={submitting || !photosReady(photos)}>
              {submitting
                ? "Publishing…"
                : !photosReady(photos)
                  ? "Uploading photos…"
                : staffOnly ? "Publish to staff" : composingAnnouncement
                  ? "Publish announcement"
                  : "Publish post"}
            </button>
          </footer>
        </form>}
      </section>
    </div>
  );
}
