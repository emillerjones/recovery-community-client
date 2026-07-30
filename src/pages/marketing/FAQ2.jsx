import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import "./FAQ2.css";

/**
 * FAQ2 — demonstrates a sliding-underline tab bar: clicking a chapter
 * switches the visible question list, and a thin underline glides
 * (rather than jumps) to sit beneath whichever chapter is active. The
 * indicator's position/width is measured from the real DOM element via
 * getBoundingClientRect, so it stays correct on resize and works the
 * same on touch as on a mouse click.
 */

const FAQ_GROUPS = [
  {
    title: "About This Community",
    items: [
      {
        q: "Who is this community for?",
        a: "Anyone using cannabis to reduce or replace their use of alcohol, opioids, or other dangerous substances — or anyone curious whether this approach might help them. There's no single right way to recover here, and no one is asked to follow a specific program.",
      },
      {
        q: "Is this replacing AA, NA, or other recovery programs?",
        a: "No. Many of our members use cannabis substitution as a medication-assisted-treatment (MAT) alongside other programs such as Alcoholics Anonymous, Narcotics Anonymous, 12-Step Groups, HAMS, SMART Recovery, Moderation Management, Refuge Recovery, Celebrate Recovery, etc or other alternative paths of their own making. This isn't a replacement for those — it's another option that can work alongside them.",
      },
      {
        q: "Do I have to use cannabis to be part of this community?",
        a: "No. This community exists for people exploring cannabis as part of their recovery, but you don't have to be actively using it to belong here — many people are simply researching whether this approach is right for them.",
      },
    ],
  },
  {
    title: "Privacy & Trust",
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

function TabBar({ groups, active, onSelect }) {
  const railRef = useRef(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    function measure() {
      const rail = railRef.current;
      if (!rail) return;
      const activeEl = rail.querySelector(`[data-tab="${active}"]`);
      if (!activeEl) return;
      const railRect = rail.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();
      setIndicator({ left: elRect.left - railRect.left + rail.scrollLeft, width: elRect.width });
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);

  return (
    <div className="faq2-tabbar" ref={railRef}>
      {groups.map((group) => (
        <button
          key={group.title}
          type="button"
          data-tab={group.title}
          className={`faq2-tab ${active === group.title ? "is-active" : ""}`}
          onClick={() => onSelect(group.title)}
        >
          {group.title}
        </button>
      ))}
      <span className="faq2-tab__indicator" style={{ left: indicator.left, width: indicator.width }} />
    </div>
  );
}

export default function FAQ2() {
  const { onRegister } = useOutletContext();
  const [active, setActive] = useState(FAQ_GROUPS[0].title);
  const activeGroup = FAQ_GROUPS.find((group) => group.title === active);

  return (
    <div className="faq2">
      <section className="faq2-hero" data-nav-theme="light">
        <p className="faq2-kicker">Frequently asked questions</p>
        <h1>Questions are welcome here.</h1>
        <p>Clear answers about the community, cannabis substitution, privacy, and getting involved.</p>

        <aside className="faq2-note" aria-label="Design technique: sliding-underline tab bar">
          <p className="faq2-note__label">Design technique</p>
          <h3>Sliding-underline tab bar</h3>
          <p>
            Tap a chapter below — the underline glides to the new tab
            instead of jumping, and the question list swaps with it. Its
            position comes from measuring the real tab element's
            bounding box, so it's always exactly aligned, even after a
            resize or on a narrow phone screen.
          </p>
        </aside>
      </section>

      <section className="faq2-section">
        <TabBar groups={FAQ_GROUPS} active={active} onSelect={setActive} />

        <div className="faq2-list" key={activeGroup.title}>
          {activeGroup.items.map((item, index) => (
            <details className={`faq2-item ${item.needsReview ? "faq2-item--review" : ""}`} key={item.q} open={index === 0}>
              <summary>
                <span className="faq2-item__q">{item.q}</span>
                <i aria-hidden="true" />
              </summary>
              <div className="faq2-item__answer">
                {item.needsReview && <span className="faq2-item__tag">Needs review</span>}
                <p>{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="faq2-cta" data-nav-theme="light">
        <p className="faq2-cta__text">Still have a question?</p>
        <p className="faq2-cta__script">The community is here too.</p>
        <button type="button" onClick={onRegister} className="faq2-cta__button">
          Enter the Community
        </button>
      </section>
    </div>
  );
}
