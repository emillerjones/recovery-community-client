import { X } from "lucide-react";

export default function ForumTagManagerModal({
  tags,
  newTagName,
  setNewTagName,
  onCreateTag,
  onToggleTagActive,
  onClose,
}) {
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
        <form onSubmit={onCreateTag}>
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
          <button className="forum-feed-publish">Add tag</button>
        </form>
        <div className="forum-feed-managed-tags">
          {tags.map((tag) => (
            <button
              type="button"
              className={tag.active ? "" : "is-disabled"}
              key={tag.tag_id}
              onClick={() => onToggleTagActive(tag)}
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
