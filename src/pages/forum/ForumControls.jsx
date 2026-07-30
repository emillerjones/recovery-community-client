import { useState } from "react";
import {
  Check,
  Megaphone,
  MessageCircle,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

const SCOPES = [
  { key: "all", label: "All posts" },
  { key: "mine", label: "My posts" },
  { key: "following", label: "Following" },
];

const ORDERS = [
  { key: "recent", label: "Latest" },
  { key: "discussed", label: "Most discussed" },
];

export default function ForumControls({
  view,
  tags,
  activeTags,
  searchInput,
  scope,
  order,
  onViewChange,
  onSearchInputChange,
  onApplyFilters,
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftScope, setDraftScope] = useState(scope);
  const [draftOrder, setDraftOrder] = useState(order);
  const [draftTags, setDraftTags] = useState(activeTags);
  const activeFilterCount = activeTags.length
    + (scope !== "all" ? 1 : 0)
    + (order !== "recent" ? 1 : 0);

  function openFilters() {
    setDraftScope(scope);
    setDraftOrder(order);
    setDraftTags(activeTags);
    setFiltersOpen(true);
  }

  function toggleDraftTag(slug) {
    setDraftTags((current) => current.includes(slug)
      ? current.filter((tag) => tag !== slug)
      : [...current, slug]);
  }

  function applyAndClose(next = {
    scope: draftScope,
    order: draftOrder,
    tags: draftTags,
  }) {
    onApplyFilters(next);
    setFiltersOpen(false);
  }

  return (
    <>
      {/* FORUM LIST TRACE STEP 1A: These section buttons call the callback
          supplied by Forum.jsx. Continue there in setView(). */}
      <nav className="forum-feed-views" aria-label="Forum sections">
        <button
          type="button"
          className={view === "community" ? "is-active" : ""}
          onClick={() => onViewChange("community")}
          aria-current={view === "community" ? "page" : undefined}
        >
          <MessageCircle size={17} />
          <span>
            <strong>Main forum</strong>
            <small>Everyday community conversation</small>
          </span>
        </button>
        <button
          type="button"
          className={view === "announcements" ? "is-active" : ""}
          onClick={() => onViewChange("announcements")}
          aria-current={view === "announcements" ? "page" : undefined}
        >
          <Megaphone size={17} />
          <span>
            <strong>Announcements</strong>
            <small>Updates from the team</small>
          </span>
        </button>
      </nav>

      {/* FORUM LIST TRACE STEP 1B: Search remains immediate. The Filters
          button collects scope, order, and tags before one server request. */}
      <div className="forum-feed-toolbar forum-feed-toolbar--condensed">
        <label>
          <Search size={16} />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder="Search conversations"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => onSearchInputChange("")}
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </label>
        <button type="button" className="forum-feed-filter-trigger" onClick={openFilters}>
          <SlidersHorizontal size={16} />
          Filters
          {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
        </button>
      </div>

      {activeFilterCount > 0 && (
        <div className="forum-feed-active-filters" aria-label="Active conversation filters">
          {scope !== "all" && <button type="button" onClick={() => applyAndClose({ scope: "all", order, tags: activeTags })}>
            {scope === "mine" ? "My posts" : "Following"} <X size={11} />
          </button>}
          {order !== "recent" && <button type="button" onClick={() => applyAndClose({ scope, order: "recent", tags: activeTags })}>
            Most discussed <X size={11} />
          </button>}
          {activeTags.map((slug) => <button type="button" key={slug} onClick={() => applyAndClose({
            scope,
            order,
            tags: activeTags.filter((tag) => tag !== slug),
          })}>
            #{slug} <X size={11} />
          </button>)}
          <button type="button" className="forum-feed-active-filters__clear" onClick={() => applyAndClose({ scope: "all", order: "recent", tags: [] })}>
            Clear all
          </button>
        </div>
      )}

      {filtersOpen && (
        <div className="forum-feed-filter-layer" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) applyAndClose();
        }}>
          <section className="forum-feed-filter-panel" role="dialog" aria-modal="true" aria-labelledby="forum-filter-title">
            <header>
              <div>
                <p className="forum-feed-eyebrow">Refine the conversation list</p>
                <h2 id="forum-filter-title">Filter conversations</h2>
              </div>
              <button type="button" onClick={() => applyAndClose()} aria-label="Apply and close filters"><X size={20} /></button>
            </header>

            <fieldset>
              <legend>Show</legend>
              <div className="forum-feed-filter-options">
                {SCOPES.map((option) => <button
                  type="button"
                  key={option.key}
                  className={draftScope === option.key ? "is-active" : ""}
                  aria-pressed={draftScope === option.key}
                  onClick={() => setDraftScope(option.key)}
                >
                  {option.label}{draftScope === option.key && <Check size={14} />}
                </button>)}
              </div>
            </fieldset>

            <fieldset>
              <legend>Order by</legend>
              <div className="forum-feed-filter-options">
                {ORDERS.map((option) => <button
                  type="button"
                  key={option.key}
                  className={draftOrder === option.key ? "is-active" : ""}
                  aria-pressed={draftOrder === option.key}
                  onClick={() => setDraftOrder(option.key)}
                >
                  {option.label}{draftOrder === option.key && <Check size={14} />}
                </button>)}
              </div>
            </fieldset>

            <fieldset>
              <legend>Tags <small>Choose any that apply</small></legend>
              <div className="forum-feed-filter-tags">
                {tags.filter((tag) => tag.active).map((tag) => <button
                  type="button"
                  key={tag.tag_id}
                  className={draftTags.includes(tag.slug) ? "is-active" : ""}
                  aria-pressed={draftTags.includes(tag.slug)}
                  onClick={() => toggleDraftTag(tag.slug)}
                >
                  #{tag.slug}{draftTags.includes(tag.slug) && <Check size={12} />}
                </button>)}
              </div>
            </fieldset>

            <footer>
              <button type="button" onClick={() => {
                setDraftScope("all");
                setDraftOrder("recent");
                setDraftTags([]);
              }}>Clear all</button>
              <button type="button" className="forum-feed-publish" onClick={() => applyAndClose()}>
                Show results
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
