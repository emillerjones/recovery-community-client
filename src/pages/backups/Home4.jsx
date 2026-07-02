import { useEffect, useRef, useState } from "react";
import heroPhoto from "../assets/images/hero-lake.jpg";
import "./Home4.css";

const STORIES = [
  {
    quote:
      "I didn't think sobriety was possible for me. I'd tried everything. Cannabis gave me something to hold onto while I figured out the rest.",
    name: "Adrienne",
    detail: "3 years free from opioids",
    color: "#5E83A8",
  },
  {
    quote:
      "The community here never made me feel like I was doing it wrong. That was everything.",
    name: "Marcus",
    detail: "18 months alcohol-free",
    color: "#7B6CA8",
  },
  {
    quote:
      "Ruth's approach made sense to me in a way that AA never did. I finally felt like myself again.",
    name: "Dana",
    detail: "2 years cannabis-assisted recovery",
    color: "#5E8C6A",
  },
  {
    quote:
      "I came here skeptical. I stayed because the people here are real. No judgment. Just honesty.",
    name: "James",
    detail: "Joined 4 years ago",
    color: "#C97B5E",
  },
  {
    quote:
      "For the first time in fifteen years, I woke up and didn't immediately dread the day.",
    name: "Priya",
    detail: "Free from alcohol",
    color: "#8C6B5E",
  },
];

function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function StoryReel() {
  const reelRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  function checkScroll() {
    const el = reelRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 12);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 12);
  }

  function nudge(dir) {
    reelRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  }

  return (
    <div className="reel-wrapper">
      <div className="reel" ref={reelRef} onScroll={checkScroll}>
        {STORIES.map((s, i) => (
          <div className="reel-card" key={i}>
            <div className="reel-card__quote">&ldquo;{s.quote}&rdquo;</div>
            <div className="reel-card__byline">
              <span
                className="reel-card__dot"
                style={{ background: s.color }}
              />
              <span className="reel-card__name">{s.name}</span>
              <span className="reel-card__detail">{s.detail}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="reel-nav">
        <button
          className={`reel-btn ${canScrollLeft ? "" : "reel-btn--dim"}`}
          onClick={() => nudge(-1)}
          aria-label="Scroll left"
        >
          ←
        </button>
        <button
          className={`reel-btn ${canScrollRight ? "" : "reel-btn--dim"}`}
          onClick={() => nudge(1)}
          aria-label="Scroll right"
        >
          →
        </button>
      </div>
    </div>
  );
}

export default function Home3() {
  const [pullRef, pullVisible] = useReveal(0.2);
  const [statsRef, statsVisible] = useReveal(0.2);
  const [storiesRef, storiesVisible] = useReveal(0.1);
  const [ctaRef, ctaVisible] = useReveal(0.3);

  return (
    <div className="h3">

      {/* ── HERO: dark, left-aligned, photo bleeds full screen ── */}
      <section className="h3-hero">
        <div
          className="h3-hero__bg"
          style={{ backgroundImage: `url(${heroPhoto})` }}
        />
        <div className="h3-hero__veil" />

        <div className="h3-hero__body">
          
          <h1 className="h3-hero__headline">
            You're&nbsp;not<br />alone.
          </h1>
          <p className="h3-hero__sub">
            A community for people exploring cannabis as a path away from
            alcohol, opioids, and other harmful substances.
          </p>
          <p className="h3-hero__since">Est. 2013 &nbsp;·&nbsp; Peer-led</p>
          <a href="#" className="h3-hero__cta">
            Enter the community
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        <div className="h3-hero__scroll">
          <span />
        </div>
      </section>

      {/* ── PULL QUOTE: Ruth's voice, full-width, cream ── */}
      <section className="h3-pull">
        <div
          ref={pullRef}
          className={`h3-pull__inner ${pullVisible ? "h3-visible" : ""}`}
        >
          <span className="h3-pull__label">Our philosophy</span>
          <blockquote className="h3-pull__quote">
            Recovery looks different for everyone — and that's&nbsp;okay.
          </blockquote>
          <p className="h3-pull__body">
            Recovery With The Exit Drug cultivates acceptance, encourages
            healthy behaviors, and reduces stigma. There is no single right
            path. This community was built for people who need a different one.
          </p>
        </div>
      </section>

      {/* ── STAT BAR: one number, quiet and honest ── */}
      <section className="h3-stats">
        <div
          ref={statsRef}
          className={`h3-stats__inner ${statsVisible ? "h3-visible" : ""}`}
        >
          <div className="h3-stat">
            <span className="h3-stat__num">2013</span>
            <span className="h3-stat__label">Year founded</span>
          </div>
          <div className="h3-stat__divider" />
          <div className="h3-stat">
            <span className="h3-stat__num">Peer-led</span>
            <span className="h3-stat__label">Not clinical. Not corporate.</span>
          </div>
          <div className="h3-stat__divider" />
          <div className="h3-stat">
            <span className="h3-stat__num">Free</span>
            <span className="h3-stat__label">Always has been</span>
          </div>
        </div>
      </section>

      {/* ── STORIES: horizontal scroll reel ── */}
      <section className="h3-stories">
        <div
          ref={storiesRef}
          className={`h3-stories__head ${storiesVisible ? "h3-visible" : ""}`}
        >
          <span className="h3-eyebrow">Real stories</span>
          <h2 className="h3-stories__h">
            People who found<br />their way through.
          </h2>
        </div>
        <StoryReel />
        <a href="#" className="h3-stories__link">
          Read more stories
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </section>

      {/* ── COMMUNITY: dark band, live feel ── */}
      <section className="h3-community">
        <div className="h3-community__inner">
          <div className="h3-community__live">
            <span className="h3-dot" />
            <span>Community is online now</span>
          </div>
          <h2 className="h3-community__h">
            A place to ask questions,<br />share wins, and be heard.
          </h2>
          <p className="h3-community__body">
            Real conversations. No algorithms deciding who gets seen. Just
            people who understand where you're standing.
          </p>
          <a href="#" className="h3-community__cta">
            Join the conversation
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </section>

      {/* ── RESOURCES: quiet grid ── */}
      <section className="h3-resources">
        <span className="h3-eyebrow">Resources &amp; research</span>
        <h2 className="h3-resources__h">Knowledge to help you forward.</h2>
        <div className="h3-resources__grid">
          {[
            { title: "Education", body: "Understand the science and the history of cannabis-assisted recovery." },
            { title: "Cannabis info", body: "What the plant actually does — without hype or stigma." },
            { title: "Support guides", body: "Practical tools for the early days and the hard nights." },
            { title: "Events", body: "Gatherings, conversations, and community online and in person." },
          ].map((r) => (
            <a href="#" className="h3-resource" key={r.title}>
              <div className="h3-resource__title">{r.title}</div>
              <div className="h3-resource__body">{r.body}</div>
              <div className="h3-resource__arrow">→</div>
            </a>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA: quiet and intimate ── */}
      <section className="h3-cta">
        <div
          ref={ctaRef}
          className={`h3-cta__inner ${ctaVisible ? "h3-visible" : ""}`}
        >
          <h2 className="h3-cta__h">Whenever you're ready.</h2>
          <p className="h3-cta__body">This is your space. We'll be here.</p>
          <a href="#" className="h3-cta__link">
            Enter the community
          </a>
        </div>
      </section>

      <footer className="h3-footer">
        Recovery With The Exit Drug &mdash; A peer-led community since 2013. Not a substitute for professional medical treatment.
      </footer>
    </div>
  );
}
