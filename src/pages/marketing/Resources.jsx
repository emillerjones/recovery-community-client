import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { LEARN_GROUPS, ORGANIZATIONS } from "./resourceData";
import "./Resources.css";

/**
 * Resources page.
 *
 * Merges the old site's two separate pages — "Educational Resources"
 * and "Cannabis Friendly Organizations" — into one page with two
 * sections: Learn (articles/studies/videos, regrouped by topic
 * instead of format) and Find Support (the organization directory).
 *
 * Every link from the original pages is preserved. Nothing cut.
 */

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M4 19.5V5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M4 19.5A2.5 2.5 0 006.5 22H20" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function CompassIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M15 9l-2 5-5 2 2-5 5-2z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---------- Learn section data ----------
// Grouped by topic rather than by media format, so it's easier to
// find what's actually relevant to someone, instead of a flat
// alphabetical link dump.


// ---------- Find Support section data ----------
// Full verbatim descriptions, quoted and attributed — preserving
// the original framing that these are the organizations' own words,
// not adopted as site copy or an implied endorsement.


const GROUP_IDS = {
  "Substitution & Harm Reduction": "resource-substitution",
  "Alcohol-Specific": "resource-alcohol",
  "Opioid-Specific": "resource-opioid",
  "Personal Accounts": "resource-personal",
  "Research & Safety": "resource-research",
};

function FieldGuideArt() {
  return (
    <div className="resources-field-art" aria-hidden="true">
      <svg viewBox="0 0 620 520">
        <g className="resources-field-art__contours">
          <path d="M68 199C98 103 202 45 318 57c128 13 226 111 231 229 5 105-67 176-170 190-112 15-248-16-302-111-28-49-27-110-9-166Z" />
          <path d="M105 211c28-73 112-119 207-112 104 8 187 83 197 174 11 91-50 149-133 160-94 12-203-15-243-84-24-41-44-92-28-138Z" />
          <path d="M146 225c25-51 89-82 159-78 76 5 139 57 151 121 13 66-32 111-91 121-69 11-149-8-179-56-20-32-54-72-40-108Z" />
        </g>

        <g className="resources-field-art__branches">
          <path pathLength="1" d="M310 405c-4-59 6-111 2-163-3-43-20-82-42-115" />
          <path pathLength="1" d="M311 306c-49-10-86-37-111-78" />
          <path pathLength="1" d="M312 273c45-12 82-40 108-83" />
          <path pathLength="1" d="M311 346c53 1 96-16 132-50" />
          <path pathLength="1" d="M270 127c-13 27-7 49 18 65-29-1-47-17-53-46 8-12 20-19 35-19Z" />
          <path pathLength="1" d="M200 228c6-24 22-37 48-39-9 26-25 40-48 39Z" />
          <path pathLength="1" d="M420 190c-2 27-15 45-40 54 1-27 14-45 40-54Z" />
          <path pathLength="1" d="M443 296c-17 23-39 31-67 23 17-22 39-30 67-23Z" />
          <circle cx="270" cy="127" r="5" />
          <circle cx="200" cy="228" r="4" />
          <circle cx="420" cy="190" r="5" />
          <circle cx="443" cy="296" r="4" />
        </g>

        <g className="resources-field-art__book">
          <path d="M310 414c-43-30-99-37-170-20v-91c68-17 124-9 170 24v87Z" />
          <path d="M310 414c43-30 99-37 170-20v-91c-68-17-124-9-170 24v87Z" />
          <path d="M310 327v87" />
          <path d="M161 329c57-11 101-4 132 19M161 353c53-10 94-4 123 14M459 329c-57-11-101-4-132 19M459 353c-53-10-94-4-123 14" />
          <path className="resources-field-art__gold-line" pathLength="1" d="M140 394c71-17 127-10 170 20 43-30 99-37 170-20" />
        </g>

        <g className="resources-field-art__marks">
          <circle cx="99" cy="112" r="3" />
          <circle cx="512" cy="118" r="3" />
          <path d="M91 112h16M99 104v16M504 118h16M512 110v16" />
        </g>
      </svg>
    </div>
  );
}

function TopicMark({ index }) {
  const paths = [
    "M8 63C30 58 34 28 58 20C50 43 64 55 88 58M57 20C57 47 44 67 25 84",
    "M25 12V45C25 62 39 76 57 76S89 62 89 45V12M16 33H98M45 76V91M31 91H71",
    "M9 54C24 22 46 22 58 50S83 79 98 45M20 73C39 54 55 55 75 75",
    "M12 68C24 25 44 16 59 36C72 54 62 73 44 80M59 36C77 22 91 36 86 55",
    "M12 80L31 57L47 66L68 28L96 41M20 19H85M20 27H65",
  ];
  return <svg className="resource-topic-mark" viewBox="0 0 110 100" aria-hidden="true"><path d={paths[index]} /></svg>;
}

function ResourceAtlas({ activeIndex }) {
  const activeGroup = LEARN_GROUPS[activeIndex];

  return (
    <aside className="resources-atlas" aria-label="Resource field guide chapters">
      <div className="resources-atlas__topline">
        <span>Field guide</span>
        <span>{String(activeIndex + 1).padStart(2, "0")} / 05</span>
      </div>

      <div className="resources-atlas__visual" aria-hidden="true">
        <svg viewBox="0 0 360 310">
          <path className="resources-atlas__orbit" d="M48 154C48 78 103 32 181 32c80 0 132 47 132 123 0 77-53 123-133 123S48 231 48 154Z" />
          <path className="resources-atlas__route" pathLength="1" d="M91 196c24-64 47-91 89-92 45-1 69 39 89 93" />
          <path className="resources-atlas__stem" pathLength="1" d="M180 238c-3-42 4-77 1-113-2-31-13-57-28-79M181 164c-31-6-54-23-69-48M181 142c28-7 51-26 68-55M180 193c35 0 63-12 87-35" />
          {[0, 1, 2, 3, 4].map((index) => {
            const points = [
              [91, 196],
              [112, 116],
              [180, 104],
              [249, 87],
              [269, 197],
            ];
            const [cx, cy] = points[index];
            const state = index === activeIndex ? "is-active" : index < activeIndex ? "is-past" : "";
            return (
              <g className={`resources-atlas__node ${state}`} key={index}>
                <circle cx={cx} cy={cy} r="14" />
                <circle cx={cx} cy={cy} r="3" />
              </g>
            );
          })}
          <path className="resources-atlas__book" d="M117 236c27-8 48-4 63 10 15-14 36-18 63-10v39c-27-7-48-3-63 11-15-14-36-18-63-11Z" />
          <path className="resources-atlas__book" d="M180 246v40" />
        </svg>
      </div>

      <div className="resources-atlas__current" key={activeGroup.title}>
        <span>Current chapter</span>
        <strong>{activeGroup.title}</strong>
        <small>{activeGroup.links.length} selected resources</small>
      </div>

      <nav className="resources-atlas__nav" aria-label="Jump to a resource chapter">
        {LEARN_GROUPS.map((group, index) => (
          <a
            href={`#${GROUP_IDS[group.title]}`}
            className={index === activeIndex ? "is-active" : undefined}
            aria-current={index === activeIndex ? "location" : undefined}
            key={group.title}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <span className="resources-atlas__nav-label">{group.title}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}

export default function Resources() {
  const { onRegister } = useOutletContext();
  const [learnRef, learnVisible] = useReveal();
  const [supportRef, supportVisible] = useReveal();
  const [activeGroup, setActiveGroup] = useState(0);

  useEffect(() => {
    const groups = LEARN_GROUPS.map((group) =>
      document.getElementById(GROUP_IDS[group.title])
    ).filter(Boolean);

    if (!groups.length || !("IntersectionObserver" in window)) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry) {
          setActiveGroup(Number(visibleEntry.target.dataset.resourceIndex));
        }
      },
      {
        rootMargin: "-24% 0px -52% 0px",
        threshold: [0, 0.15, 0.4, 0.7],
      }
    );

    groups.forEach((group) => observer.observe(group));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="resources">
      <section className="resources-hero" data-nav-theme="light">
        <div className="resources-hero__light" aria-hidden="true" />
        <div className="resources-hero__inner">
          <div className="resources-hero__content">
            <p className="resources-kicker">The recovery field guide</p>
            <h1>Information for finding your own way.</h1>
            <p>Research, lived experience, and outside support—collected carefully so the next useful direction is easier to find.</p>
            <a href="#learn" className="resources-hero__start">Open the field guide <span>↓</span></a>
          </div>
          <FieldGuideArt />
        </div>
      </section>

      {/* LEARN */}
      <section className="resources-section" id="learn">
        <div
          className={`resources-section__inner reveal ${learnVisible ? "in" : ""}`}
          ref={learnRef}
        >
          <div className="eyebrow resources-eyebrow">
            <span className="eyebrow__icon eyebrow__icon--book"><BookIcon /></span>
            Learn
          </div>
          <p className="resources-intro">
            A starting point, not a substitute for medical advice. These
            are articles, studies, and videos members have found useful
            over the years.
          </p>

          <div className="resources-reading-layout">
            <ResourceAtlas activeIndex={activeGroup} />

            <div className="learn-groups resources-chapters">
              {LEARN_GROUPS.map((group, index) => (
                <article
                  className={`learn-group resources-chapter ${index === activeGroup ? "is-active" : ""}`}
                  data-resource-index={index}
                  id={GROUP_IDS[group.title]}
                  key={group.title}
                >
                  <TopicMark index={index} />
                  <div className="resources-group-heading">
                    <span>Field note {String(index + 1).padStart(2, "0")}</span>
                    <h3 className="learn-group__title">{group.title}</h3>
                    <small>{group.links.length} selected resources</small>
                  </div>
                  <ul className="learn-group__list">
                    {group.links.map((link) => (
                      <li key={link.text} className="learn-link">
                        <a href={link.url} target="_blank" rel="noreferrer">
                          {link.text}
                        </a>
                        {link.tag && <span className="learn-link__tag">{link.tag}</span>}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FIND SUPPORT */}
      <section className="resources-section resources-section--support" id="find-support">
        <div
          className={`resources-section__inner reveal ${supportVisible ? "in" : ""}`}
          ref={supportRef}
        >
          <div className="eyebrow resources-eyebrow">
            <span className="eyebrow__icon eyebrow__icon--compass"><CompassIcon /></span>
            Find Support
          </div>
          <p className="resources-intro">
            These are independent organizations, not part of Recovery
            With The Exit Drug. We're sharing them because members have
            found them useful — not as a guarantee or medical
            endorsement. Always do your own research.
          </p>

          <div className="org-list">
            {ORGANIZATIONS.map((org, index) => (
              <div className="org-card" key={org.name}>
                <span className="resources-org-number">0{index + 1}</span>
                <div className="org-card__header">
                  <h3 className="org-card__name">{org.name}</h3>
                  <span className="org-card__type">{org.type}</span>
                </div>
                <details className="org-card__details">
                  <summary>Read their description</summary>
                  <blockquote className="org-card__quote">“{org.quote}”</blockquote>
                </details>
                <a href={org.url} className="org-card__link" target="_blank" rel="noreferrer">
                  Visit site →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING — quiet, no stat block, matches About's restraint */}
      <section className="resources-cta" data-nav-theme="light">
        <p className="resources-cta__text">
          Looking for more than information?
        </p>
        <p className="resources-cta__script">The community is here too.</p>
        <button type="button" onClick={onRegister} className="resources-cta__button">
          Enter the Community
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </section>
    </div>
  );
}
