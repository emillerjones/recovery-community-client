import { useState } from "react";
import { X } from "lucide-react";

const API = import.meta.env.VITE_API;

export default function ForumTagManagerModal({
  tags,
  token,
  onTagCreated,
  onTagUpdated,
  onClose,
}) {
  const [newTagName, setNewTagName] = useState("");
  const [error, setError] = useState("");

  async function createTag(event) {
    event.preventDefault();
    setError("");

    // TAG CREATE TRACE STEP 1: The Add tag button submits this form.
    // Send the typed name and the logged-in user's token to the API.
    const response = await fetch(`${API}/api/forum/tags`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newTagName }),
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result.message || "Could not create that tag.");
      return;
    }

    // TAG CREATE TRACE STEP 2: The database-created tag came back.
    // Tell Forum.jsx about it because Forum owns the shared list of tags.
    onTagCreated(result);
    setNewTagName("");
  }

  async function toggleTagActive(tag) {
    setError("");

    // TAG STATUS TRACE STEP 1: Clicking Enable or Disable runs this function.
    // Ask the API to save the opposite of the tag's current active value.
    const response = await fetch(`${API}/api/forum/tags/${tag.tag_id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        active: !tag.active,
      }),
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result.message || "Could not update that tag.");
      return;
    }

    // TAG STATUS TRACE STEP 2: The updated database row came back.
    // Forum owns the shared tag list, so give the updated tag back to Forum.
    onTagUpdated(result);
  }

  return (
    <div className="forum-feed-modal" onMouseDown={onClose}>
      <section
        className="forum-feed-tag-manager"
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="forum-feed-close" onClick={onClose} aria-label="Close">
          <X />
        </button>
        <p className="forum-feed-eyebrow">Staff tools</p>
        <h2>Community tags</h2>
        <p>
          Members can choose from this staff-created list when they post. Disable a tag to
          hide it without removing it from older posts.
        </p>
        <form onSubmit={createTag}>
          <label>
            New tag name
            <input
              required
              maxLength={40}
              value={newTagName}
              onChange={(event) => setNewTagName(event.target.value)}
              placeholder="Example: Weekly Check-in"
            />
          </label>
          {error && <p className="forum-feed-error">{error}</p>}
          <button className="forum-feed-publish">Add tag</button>
        </form>
        <div className="forum-feed-managed-tags">
          {tags.map((tag) => (
            <button
              type="button"
              className={tag.active ? "" : "is-disabled"}
              key={tag.tag_id}
              onClick={() => toggleTagActive(tag)}
            >
              <span>
                #{tag.slug}
                <small>{tag.post_count || 0} posts</small>
              </span>
              <b>{tag.active ? "Disable" : "Enable"}</b>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
