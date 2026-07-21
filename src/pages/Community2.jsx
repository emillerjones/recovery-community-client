import { useEffect, useRef } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  BookOpen,
  Library,
  Medal,
  MessageCircleMore,
  MoonStar,
  NotebookPen,
} from "lucide-react";
import "./Community2.css";

/**
 * Community2 — demonstrates CSS scroll-driven animations
 * (`animation-timeline: view()`): each card below animates in and out
 * purely based on its own position in the viewport, driven natively by
 * the browser's compositor rather than a scroll event listener or
 * IntersectionObserver. Where the browser doesn't support it yet
 * (Safari, Firefox), a small IntersectionObserver fallback keeps the
 * same reveal from a `@supports not (...)` block.
 */

const MOMENTS = [
  { title: "The first honest post", text: "For the person who is tired, scared, curious, or just ready to say the quiet part out loud." },
  { title: "The hard night", text: "For the moments when cravings, grief, anxiety, or loneliness hit harder than expected." },
  { title: "The small win", text: "For the day someone makes it through, tells the truth, asks for help, or starts again." },
];

const PLANNED_SPACES = [
  { name: "Discussion spaces", icon: MessageCircleMore, desc: "Organized conversations around recovery, cannabis, substance dependence, setbacks, and progress." },
  { name: "Live community chat", icon: BookOpen, desc: "A more immediate place to talk when a full post feels like too much." },
  { name: "Milestones", icon: Medal, desc: "A place to mark meaningful days — one day, one week, six months, one year, or starting over." },
  { name: "Hard nights", icon: MoonStar, desc: "A space for the moments people usually face alone." },
  { name: "Recovery journals", icon: NotebookPen, desc: "Private or shared reflections to help members notice patterns, progress, and triggers." },
  { name: "Resources", icon: Library, desc: "Community-centered tools, links, research, and practical support gathered in one place." },
];

function useViewTimelineFallback(selector) {
  const scopeRef = useRef(null);

  useEffect(() => {
    const supportsTimeline =
      typeof CSS !== "undefined" && CSS.supports && CSS.supports("animation-timeline: view()");
    if (supportsTimeline) return undefined;

    const scope = scopeRef.current;
    if (!scope || !("IntersectionObserver" in window)) return undefined;

    const items = scope.querySelectorAll(selector);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-in-fallback", entry.isIntersecting);
        });
      },
      { threshold: 0.2 }
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [selector]);

  return scopeRef;
}

export default function Community2() {
  const { onRegister } = useOutletContext();
  const momentsRef = useViewTimelineFallback(".community2-card");
  const spacesRef = useViewTimelineFallback(".community2-space");

  return (
    <main className="community2">
      <section className="community2-hero">
        <p className="community2-eyebrow">Inside the community</p>
        <h1>Recovery gets lighter when it is shared.</h1>
        <p>
          A peer-led place to speak honestly about cannabis, substance
          dependence, progress, setbacks, and beginning again — with
          people who understand.
        </p>
        <div className="community2-actions">
          <button onClick={onRegister} className="community2-btn">Join the community</button>
          <Link to="/guidelines" className="community2-link">Read the culture guidelines</Link>
        </div>

        <aside className="community2-note" aria-label="Design technique: CSS scroll-driven animations">
          <p className="community2-note__label">Design technique</p>
          <h3>CSS scroll-driven animation</h3>
          <p>
            The cards below animate purely off scroll position using
            <code>animation-timeline: view()</code> — no scroll listener,
            no IntersectionObserver on browsers that support it. It's the
            newest way to build scroll effects, and it's cheaper on
            mobile battery than the JS-driven equivalent.
          </p>
        </aside>
      </section>

      <section className="community2-section" ref={momentsRef}>
        <p className="community2-kicker">What it's for</p>
        <h2>A place for the moments people usually carry alone.</h2>

        <div className="community2-grid">
          {MOMENTS.map((item, index) => (
            <article className="community2-card" key={item.title} style={{ "--i": index }}>
              <span>0{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="community2-section" ref={spacesRef}>
        <p className="community2-kicker">What we're building</p>
        <h2>Community spaces designed around real recovery.</h2>

        <div className="community2-space-list">
          {PLANNED_SPACES.map((space, index) => {
            const SpaceIcon = space.icon;
            return (
              <article className="community2-space" key={space.name} style={{ "--i": index }}>
                <span className="community2-space__icon"><SpaceIcon /></span>
                <div>
                  <h3>{space.name}</h3>
                  <p>{space.desc}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="community2-cta">
        <p className="community2-kicker">Be part of what comes next</p>
        <h2>Help shape a recovery community that feels human.</h2>
        <p>The goal is simple: build a place where people can show up honestly, find support, and keep moving.</p>
        <button onClick={onRegister} className="community2-btn">Join the community</button>
      </section>
    </main>
  );
}
