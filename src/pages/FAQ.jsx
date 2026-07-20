import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import "./FAQ.css";

/**
 * FAQ page.
 *
 * Deliberately NOT a sidebar + search layout — at this size (a
 * handful of real questions) that's more UI than the content needs.
 * Flat list, light grouping by topic with a small icon per group,
 * Q and A both always visible (different weight/font, not hidden
 * behind a click). Same hero/footer/CTA pattern as About/Resources.
 *
 * Two answers below are marked "needs review" — placeholder content
 * that should NOT be treated as final until confirmed (legal stance,
 * privacy practices). See the FAQ_GROUPS data for details.
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

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2C9 6 6 9 6 13a6 6 0 0012 0c0-4-3-7-6-11z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function QuestionIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M9.5 9.2a2.5 2.5 0 014.9.7c0 1.5-2.4 1.9-2.4 3.3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

// Each group is one light topic cluster. "needsReview" on an
// individual item flags it as placeholder content — see the eyebrow
// note rendered for those, plus the dashed-border treatment in CSS.
const FAQ_GROUPS = [
  {
    title: "About This Community",
    icon: <LeafIcon />,
    iconClass: "leaf",
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
        needsReview: false,
      },
    ],
  },
  {
    title: "Privacy & Trust",
    icon: <ShieldIcon />,
    iconClass: "shield",
    items: [
      {
        q: "Is this medical advice?",
        a: "No. Recovery With The Exit Drug is a peer support community, not a medical or professional organization. Nothing here is a substitute for professional care. If you need medical or psychiatric support, please seek it from a licensed provider.",
      },
      {
        q: "Is cannabis substitution legal?",
        a: "Cannabis laws vary by state and country. We encourage members to understand the laws where they live. This community does not provide legal advice.",
        needsReview: false,
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
    icon: <QuestionIcon />,
    iconClass: "question",
    items: [
      {
        q: "Is this free?",
        a: "We do not actively ask for donations, but we gratefully accept them thru our 'Donation' page to help support and sustain our organization.",
        needsReview: true,
      },
      {
        q: "What happened to the Facebook group?",
        a: "Our Facebook group called 'Maintaining My Recovery With Cannabis: Support Group' will continue to be available indefinitely.  Our hope is to fully transition the support group over to this website for better safety, moderation control, and easier access for our members.",
      },
    ],
  },
];

const groupId = (title) => `faq-${title.toLowerCase().replaceAll(" ", "-").replaceAll("&", "and")}`;

export default function FAQ() {
  const { onRegister } = useOutletContext();
  const [contentRef, contentVisible] = useReveal();

  return (
    <div className="faq">
      <section className="faq-hero">
        <span className="faq-hero__mark" aria-hidden="true">?</span>
        <div className="faq-hero__inner">
          <div className="faq-hero__content">
            <p className="faq-kicker">Frequently asked questions</p>
            <h1>Questions are welcome here.</h1>
            <p>Clear answers about the community, cannabis substitution, privacy, and getting involved.</p>
          </div>
          {/* <nav className="faq-hero__nav" aria-label="FAQ categories">
            {FAQ_GROUPS.map((group) => <a href={`#${groupId(group.title)}`} key={group.title}>{group.title}</a>)}
          </nav> */}
        </div>
      </section>

      <section className="faq-section">
        <div
          className={`faq-section__inner reveal ${contentVisible ? "in" : ""}`}
          ref={contentRef}
        >
          {FAQ_GROUPS.map((group, groupIndex) => (
            <section className="faq-group" id={groupId(group.title)} key={group.title}>
              <div className="eyebrow faq-eyebrow">
                <span className={`eyebrow__icon eyebrow__icon--${group.iconClass}`}>
                  {group.icon}
                </span>
                {group.title}
              </div>

              <div className="faq-list">
                {group.items.map((item, itemIndex) => (
                  <details
                    className={`faq-item ${item.needsReview ? "faq-item--review" : ""}`}
                    key={item.q}
                    open={groupIndex === 0 && itemIndex === 0}
                  >
                    <summary>
                      <span className="faq-item__q">{item.q}</span>
                      <i aria-hidden="true" />
                    </summary>
                    <div className="faq-item__answer">
                      {item.needsReview && <span className="faq-item__tag">Needs review</span>}
                      <p className="faq-item__a">{item.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      {/* CLOSING CTA — same restrained pattern as About/Resources */}
      <section className="faq-cta">
        <p className="faq-cta__text">Still have a question?</p>
        <p className="faq-cta__script">
          Join the community and ask in a space where you'll be understood.
        </p>
        <button type="button" onClick={onRegister} className="faq-cta__button">
          Join the Community
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

      {/* <div className="faq-footnote">
        <span className="faq-footnote__icon">
          <LeafIcon />
        </span>
        <p>
          Recovery With The Exit Drug began in 2013 as Maintaining My
          Recovery with Cannabis (MMRC). Thank you to everyone who has been
          part of this community from the very beginning.
        </p>
      </div> */}
    </div>
  );
}
