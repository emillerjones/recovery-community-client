import {
  Bookmark,
  Megaphone,
  MessageCircle,
  Search,
  TrendingUp,
  User,
  X,
} from "lucide-react";

const FILTERS = [
  { key: "recent", label: "Latest" },
  { key: "discussed", label: "Most discussed", icon: TrendingUp },
  { key: "mine", label: "My posts", icon: User },
  { key: "saved", label: "Saved", icon: Bookmark },
];

export default function ForumControls({
  view,
  tags,
  activeTags,
  searchInput,
  sort,
  onViewChange,
  onTagChange,
  onSearchInputChange,
  onSortChange,
}) {
  return (
    <>
      {/* FORUM LIST TRACE STEP 1A: These section buttons call the callback
          supplied by Forum.jsx. Continue there in setView(). */}
      <nav className="forum-feed-views" aria-label="Forum sections">
        <button
          className={view === "community" ? "is-active" : ""}
          onClick={() => onViewChange("community")}
        >
          <MessageCircle size={17} />
          <span>
            <strong>Main forum</strong>
            <small>Everyday community conversation</small>
          </span>
        </button>
        <button
          className={view === "announcements" ? "is-active" : ""}
          onClick={() => onViewChange("announcements")}
        >
          <Megaphone size={17} />
          <span>
            <strong>Announcements</strong>
            <small>Updates from the team</small>
          </span>
        </button>
      </nav>

      {/* FORUM LIST TRACE STEP 1B: Tag clicks call Forum.jsx's selectTag(). */}
      <div className="forum-feed-tagbar" aria-label="Filter by tag">
        <button
          className={!activeTags.length ? "is-active" : ""}
          onClick={() => onTagChange("")}
        >
          All tags
        </button>
        {tags.filter((tag) => tag.active).map((tag) => (
          <button
            key={tag.tag_id}
            className={activeTags.includes(tag.slug) ? "is-active" : ""}
            aria-pressed={activeTags.includes(tag.slug)}
            onClick={() => onTagChange(tag.slug)}
          >
            #{tag.slug}
          </button>
        ))}
      </div>

      {/* FORUM LIST TRACE STEP 1C: A sort button sends its key back to
          Forum.jsx's selectSort(). Search text follows the same state flow. */}
      <div className="forum-feed-toolbar">
        <label>
          <Search size={16} />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder="Search conversations"
          />
          {searchInput && (
            <button onClick={() => onSearchInputChange("")} aria-label="Clear search">
              <X size={13} />
            </button>
          )}
        </label>
        <div>
          {FILTERS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={sort === key ? "is-active" : ""}
              onClick={() => onSortChange(key)}
            >
              {Icon && <Icon size={13} />}
              {label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
