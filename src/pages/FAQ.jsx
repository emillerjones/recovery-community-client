import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import "./FAQ.css";

const FAQ_GROUPS = [
  {
    title: "About This Community",
    shortTitle: "Community",
    icon: "leaf",
    items: [
      {
        q: "Who is this community for?",
        a: "Anyone using cannabis to reduce or replace their use of alcohol, opioids, or other dangerous substances — or anyone curious whether this approach might help them. There's no single right way to recover here, and no one is asked to follow a specific program.",
      },
      {
        q: "Is this replacing AA, NA, or other recovery programs?",
        a: "No. Many of our members use cannabis substitution as a medication-assisted-treatment (MAT) alongside other programs such as Alcoholics Anonymous, Narcotics Anonymous, 12-Step Groups, HAMS, SMART Recovery, Moderation Management, Refuge Recovery, Celebrate Recovery, etc or other alternative paths of their own making. — This isn’t a replacement for those — it's another option that can work alongside them.",
      },
      {
        q: "Do I have to use cannabis to be part of this community?",
        a: "No. This community exists for people exploring cannabis as part of their recovery, but you don't have to be actively using it to belong here — many people are simply researching whether this approach is right for them.",
      },
    ],
  },
  {
    title: "Privacy & Trust",
    shortTitle: "Privacy & trust",
    icon: "shield",
    items: [
      {
        q: "Is this medical advice?",
        a: "No. Recovery With The Exit Drug is a peer support community, not a medical or professional organization. Nothing here is a substitute for professional care. If you need medical or psychiatric support, please seek it from a licensed provider.",
      },
      {
        q: "Is cannabis substitution legal?",
        a: "Cannabis laws vary by state and country. We encourage members to understand the laws where they live. This community does not provide legal advice.",
      },
      {
        q: "Is my information private?",
        a: "[Placeholder — real privacy practices needed before this goes live: who can see journal entries, whether messages are private, data retention, and any third-party analytics.]",
        needsReview: true,
      },
    ],
  },
  {
    title: "Joining",
    shortTitle: "Joining",
    icon: "door",
    items: [
      {
        q: "Is this free?",
        a: "We do not actively ask for donations, but we gratefully accept them thru our 'Donation' page to help support and sustain our organization.",
        needsReview: true,
      },
      {
        q: "What happened to the Facebook group?",
        a: "Our Facebook group called 'Maintaining My Recovery With Cannabis: Support Group' will continue to be available indefinitely. Our hope is to fully transition the support group over to this website for better safety, moderation control, and easier access for our members.",
      },
    ],
  },
];

const groupId = (title) =>
  `faq-${title.toLowerCase().replaceAll(" ", "-").replaceAll("&", "and")}`;

function CategoryIcon({ type }) {
  if (type === "shield") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M32 7 51 15v16c0 13-8 22-19 27C21 53 13 44 13 31V15Z" />
        <path d="m23 31 6 6 13-15" />
      </svg>
    );
  }

  if (type === "door") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M15 56h36M20 56V10h29v46M28 55V18h14v37" />
        <circle cx="38" cy="37" r="1.6" />
        <path d="M10 19c5-6 10-9 17-10" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 57c-1-17 0-31 4-43M35 34C20 33 11 25 9 12c14 0 24 7 28 20M34 42c13-1 21-8 25-20-13-1-22 5-25 18" />
    </svg>
  );
}

function ConversationArt() {
  return (
    <svg className="faq-hero__art" viewBox="0 0 560 390" aria-hidden="true">
      <path className="faq-hero__orbit" d="M48 198C48 91 142 31 282 31c142 0 230 62 230 168 0 108-91 162-232 162S48 306 48 198Z" />
      <path className="faq-hero__bubble faq-hero__bubble--back" d="M256 73h178c31 0 56 25 56 56v64c0 31-25 56-56 56h-53l-43 38 8-38h-90c-31 0-56-25-56-56v-64c0-31 25-56 56-56Z" />
      <path className="faq-hero__bubble" pathLength="1" d="M108 129h203c34 0 61 27 61 61v72c0 34-27 61-61 61h-82l-56 43 14-43h-79c-34 0-61-27-61-61v-72c0-34 27-61 61-61Z" />
      <path className="faq-hero__question" pathLength="1" d="M170 207c3-27 22-43 49-43 29 0 50 17 50 43 0 34-43 37-43 65M226 294v2" />
      <path className="faq-hero__answer" pathLength="1" d="M287 134h116M287 165h87" />
      <circle className="faq-hero__point" cx="93" cy="84" r="4" />
      <circle className="faq-hero__point" cx="467" cy="314" r="4" />
    </svg>
  );
}

function useActiveChapter(ids) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!sections.length || !("IntersectionObserver" in window)) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

const CHAPTER_IDS = FAQ_GROUPS.map((group) => groupId(group.title));

export default function FAQ() {
  const { onRegister } = useOutletContext();
  const questionCount = FAQ_GROUPS.reduce((total, group) => total + group.items.length, 0);
  const activeChapter = useActiveChapter(CHAPTER_IDS);
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    if (!normalizedQuery) return FAQ_GROUPS;
    return FAQ_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.q.toLowerCase().includes(normalizedQuery) ||
          item.a.toLowerCase().includes(normalizedQuery)
      ),
    }));
  }, [normalizedQuery]);

  const matchCount = useMemo(
    () => filteredGroups.reduce((total, group) => total + group.items.length, 0),
    [filteredGroups]
  );

  return (
    <main className="faq">
      <section className="faq-hero">
        <div className="faq-hero__glow" aria-hidden="true" />
        <div className="faq-container faq-hero__inner">
          <div className="faq-hero__copy">
            <p className="faq-kicker">A clear place to begin</p>
            <h1>Good questions deserve honest answers.</h1>
            <p className="faq-hero__intro">
              The essentials about this community, cannabis substitution,
              privacy, and finding your place here.
            </p>
            <nav className="faq-hero__nav" aria-label="FAQ categories">
              {FAQ_GROUPS.map((group, index) => {
                const id = groupId(group.title);
                return (
                  <a
                    href={`#${id}`}
                    key={group.title}
                    className={activeChapter === id ? "is-active" : undefined}
                    aria-current={activeChapter === id ? "true" : undefined}
                  >
                    <span>0{index + 1}</span>
                    {group.shortTitle}
                  </a>
                );
              })}
            </nav>
          </div>
          <ConversationArt />
        </div>
      </section>

      <section className="faq-body">
        <div className="faq-container faq-layout">
          <aside className="faq-index">
            <p className="faq-index__label">Search</p>
            <div className="faq-search">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search questions…"
                aria-label="Search frequently asked questions"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
                  ×
                </button>
              )}
            </div>
            {normalizedQuery && (
              <p className="faq-search__count">
                {matchCount} {matchCount === 1 ? "result" : "results"} for “{query.trim()}”
              </p>
            )}

            <p className="faq-index__label">On this page</p>
            <nav aria-label="FAQ contents">
              {FAQ_GROUPS.map((group, index) => {
                const id = groupId(group.title);
                return (
                  <a
                    href={`#${id}`}
                    key={group.title}
                    className={activeChapter === id ? "is-active" : undefined}
                    aria-current={activeChapter === id ? "true" : undefined}
                  >
                    <span>0{index + 1}</span>
                    {group.shortTitle}
                  </a>
                );
              })}
            </nav>
            <div className="faq-index__count">
              <strong>{questionCount}</strong>
              <span>questions<br />in three chapters</span>
            </div>
          </aside>

          <div className="faq-chapters">
            {filteredGroups.map((group, groupIndex) => (
              <section className="faq-chapter" id={groupId(group.title)} data-chapter={`0${groupIndex + 1}`} key={group.title}>
                <header className="faq-chapter__header">
                  <div className="faq-chapter__mark">
                    <CategoryIcon type={group.icon} />
                  </div>
                  <div>
                    <p>Chapter 0{groupIndex + 1}</p>
                    <h2>{group.title}</h2>
                  </div>
                  <span>{group.items.length} questions</span>
                </header>

                {group.items.length === 0 ? (
                  <p className="faq-chapter__empty">No questions in this chapter match “{query.trim()}”.</p>
                ) : (
                  <div className="faq-list">
                    {group.items.map((item, itemIndex) => (
                      <details
                        className={`faq-item ${item.needsReview ? "faq-item--review" : ""}`}
                        key={item.q}
                        open={normalizedQuery ? true : groupIndex === 0 && itemIndex === 0}
                      >
                        <summary>
                          <span className="faq-item__number">
                            {String(itemIndex + 1).padStart(2, "0")}
                          </span>
                          <span className="faq-item__question">{item.q}</span>
                          <i aria-hidden="true" />
                        </summary>
                        <div className="faq-item__answer">
                          <span className="faq-item__answer-mark">A</span>
                          <div>
                            {item.needsReview && (
                              <span className="faq-item__tag">Needs owner review</span>
                            )}
                            <p>{item.a}</p>
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="faq-closing">
        <div className="faq-closing__rings" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className="faq-container faq-closing__inner">
          <p className="faq-kicker">The question after the questions</p>
          <h2>Still wondering whether you belong here?</h2>
          <p>You do not need to have everything figured out before joining the conversation.</p>
          <button type="button" onClick={onRegister}>
            Join the community
            <span>→</span>
          </button>
        </div>
      </section>
    </main>
  );
}
