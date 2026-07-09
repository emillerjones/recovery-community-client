import { useEffect, useRef, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import "./Home10.css";

const WALL_NOTES = [
  { text: "Day 1. I don't know what I'm doing but I'm here.", t: 0.06, rot: -4, x: -34, y: -24 },
  { text: "Told my sister today. She didn't flinch.", t: 0.14, rot: 3, x: 6, y: -32 },
  { text: "Three weeks off opioids. Sleep is still hard.", t: 0.22, rot: -2, x: -8, y: -2 },
  { text: "I keep this tab open just in case I need it at 2am.", t: 0.30, rot: 5, x: 32, y: -10 },
  { text: "Six months. I still come back to read, not just post.", t: 0.38, rot: -3, x: -38, y: 18 },
  { text: "Someone answered me at midnight once. I never forgot it.", t: 0.46, rot: 2, x: -4, y: 30 },
  { text: "Cannabis got me through nights AA couldn't reach.", t: 0.54, rot: -5, x: 22, y: 26 },
  { text: "One year. My kids have their mom back.", t: 0.62, rot: 4, x: 38, y: 2 },
  { text: "Not ready to post yet. Just reading tonight.", t: 0.70, rot: -2, x: 12, y: -18 },
];

const ORBIT_QUOTES = [
  { text: "You don't have to explain the whole story yet.", meta: "member, 8 months in", angle: 0 },
  { text: "Slower is still forward.", meta: "member, 2 years in", angle: 60 },
  { text: "I read for a month before I said anything.", meta: "member, 1 year in", angle: 120 },
  { text: "It's okay to need this and feel embarrassed about it.", meta: "member, 5 months in", angle: 180 },
  { text: "Nobody here is grading your sobriety.", meta: "member, 3 years in", angle: 240 },
  { text: "Come back even on the bad nights. Especially then.", meta: "member, 11 months in", angle: 300 },
];

const HERO_ORBIT_NOTES = [
  { text: "Day 1. I am here.", angle: 10, radius: 178, speed: 34, size: "sm" },
  { text: "Someone answered me at midnight.", angle: 58, radius: 258, speed: 46, size: "md" },
  { text: "Three weeks off opioids.", angle: 112, radius: 218, speed: 39, size: "sm" },
  { text: "Not ready to post. Just reading.", angle: 168, radius: 288, speed: 52, size: "lg" },
  { text: "Six months. Still coming back.", angle: 224, radius: 236, speed: 43, size: "md" },
  { text: "Cannabis got me through tonight.", angle: 282, radius: 304, speed: 58, size: "lg" },
  { text: "Nobody graded my recovery.", angle: 330, radius: 204, speed: 36, size: "sm" },
];

const PATHS = [
  { title: "Learn", body: "Cannabis-assisted recovery, explained without hype or shame.", cta: "Read the basics", to: "/resources" },
  { title: "Talk", body: "A live community, day or night, built around honesty over performance.", cta: "See who's online", to: "/community" },
  { title: "Track", body: "Private milestones and journaling — just for you, not for an audience.", cta: "Start a journal", to: null },
  { title: "Read", body: "Stories from people further down the road than you are tonight.", cta: "Read stories", to: "/stories" },
];

function useReveal(threshold = 0.16) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

function useSectionProgress(ref) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = null;

    function update() {
      const el = ref.current;
      if (!el) {
        frame = null;
        return;
      }
      const scrollable = el.offsetHeight - window.innerHeight;
      const into = -el.getBoundingClientRect().top;
      setProgress(scrollable > 0 ? Math.min(Math.max(into / scrollable, 0), 1) : 0);
      frame = null;
    }

    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref]);

  return progress;
}

function CentralFire() {
  return (
    <div className="h10-firemark" aria-label="Community fire">
      <span className="h10-firemark__ring" />
      <span className="h10-firemark__flame h10-firemark__flame--one" />
      <span className="h10-firemark__flame h10-firemark__flame--two" />
      <span className="h10-firemark__flame h10-firemark__flame--three" />
      <span className="h10-firemark__core" />
      <span className="h10-firemark__log h10-firemark__log--one" />
      <span className="h10-firemark__log h10-firemark__log--two" />
      <span className="h10-firemark__label">Community</span>
    </div>
  );
}

export default function Home10() {
  const { onRegister, onLogin } = useOutletContext();

  const rootRef = useRef(null);
  const warmth = useSectionProgress(rootRef);
  const wallRef = useRef(null);
  const wall = useSectionProgress(wallRef);

  const [orbitRef, orbitVisible] = useReveal(0.1);
  const [pathsRef, pathsVisible] = useReveal();
  const [finalRef, finalVisible] = useReveal(0.25);

  const [lit, setLit] = useState(false);
  const [bonus, setBonus] = useState(0);
  const effectiveWarmth = Math.min(warmth + bonus, 1);
  const litCount = Math.max(1, Math.min(10, Math.round(wall * 10)));

  function lightNote() {
    if (lit) return;
    setLit(true);
    setBonus(0.05);
  }

  return (
    <main className="h10" ref={rootRef} style={{ "--h10-warmth": effectiveWarmth, "--h10-wall": wall }}>
      <div className="h10-warmth-field" aria-hidden="true" />

      {/* ── HERO ── */}
      <section className="h10-hero">
        <div className="h10-mist h10-mist--1" aria-hidden="true" />
        <div className="h10-mist h10-mist--2" aria-hidden="true" />
        <div className="h10-mist h10-mist--3" aria-hidden="true" />

        <div className="h10-hero__orbit-scene" aria-label="Posts orbiting the community fire">
          <div className="h10-hero__orbit-rings" aria-hidden="true" />
          <CentralFire />
          {HERO_ORBIT_NOTES.map((note, index) => (
            <div
              className={`h10-hero-orbit h10-hero-orbit--${note.size}`}
              key={note.text}
              style={{
                "--angle": `${note.angle}deg`,
                "--radius": `${note.radius}px`,
                "--speed": `${note.speed}s`,
                "--delay": `${index * 140}ms`,
              }}
            >
              <article className="h10-hero-orbit__card" tabIndex={0}>
                {note.text}
              </article>
            </div>
          ))}
        </div>

        <div className="h10-hero__caption">
          <div>
            <p className="h10-hero__kicker">Recovery With The Exit Drug</p>
            <h1>Nobody lights this room alone.</h1>
            <p className="h10-hero__sub">
              A peer-led community for people exploring cannabis as a path away from
              alcohol, opioids, and other harmful substances.
            </p>
          </div>
          <div className="h10-hero__actions">
            <button type="button" className="h10-btn-primary" onClick={onRegister}>
              Add your light
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <a href="#h10-wall" className="h10-btn-ghost">Read the wall first</a>
          </div>
        </div>

        <div className="h10-hero__cue" aria-hidden="true">
          <span />
          Scroll to the wall
        </div>
      </section>

      <div className="h10-seam" aria-hidden="true" />

      {/* ── THE WALL ── */}
      <section className="h10-wall-scroller" id="h10-wall" ref={wallRef}>
        <div className="h10-wall-stage">
          <div className="h10-wall-stage__head">
            <p className="h10-eyebrow">The wall</p>
            <h2>Every note here started as one someone almost didn't post.</h2>
            <p>Keep scrolling — the wall fills in, and the room warms with it.</p>
          </div>

          <div className="h10-ember-gauge">
            <span className="h10-ember-gauge__flame" aria-hidden="true" />
            <span>{litCount} {litCount === 1 ? "person" : "people"} on the wall right now</span>
            <span className="h10-ember-gauge__track">
              <span className="h10-ember-gauge__fill" />
            </span>
          </div>

          <div className="h10-board">
            {WALL_NOTES.map((note) => (
              <div
                className="h10-note"
                key={note.text}
                style={{ "--t": note.t, "--rot": `${note.rot}deg`, "--x": `${note.x}%`, "--y": `${note.y}%` }}
              >
                {note.text}
              </div>
            ))}
            <div
              className={`h10-note h10-note--empty ${lit ? "h10-lit" : ""}`}
              style={{ "--t": 0.8, "--rot": "1deg", "--x": "-16%", "--y": "8%" }}
              role="button"
              tabIndex={0}
              aria-pressed={lit}
              onClick={lightNote}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  lightNote();
                }
              }}
            >
              {lit ? "Day 1. That’s how everyone starts." : "— your day one goes here —"}
            </div>
          </div>
        </div>
      </section>

      <div className="h10-seam" aria-hidden="true" />

      {/* ── ORBIT ── */}
      <section className={`h10-block h10-orbit-block h10-reveal ${orbitVisible ? "h10-in" : ""}`} ref={orbitRef}>
        <div className="h10-wrap">
          <p className="h10-eyebrow">Held in the middle</p>
          <h2>Recovery stays center. Everything else moves around it.</h2>
          <p>Quiet lines from people further down the road. Hover one to let it settle.</p>

          <div className="h10-orbit">
            <div className="h10-orbit-ring">
              {ORBIT_QUOTES.map((quote) => (
                <div className="h10-bubble-wrap" key={quote.text} style={{ "--angle": `${quote.angle}deg`, "--radius": "min(230px,32vw)" }}>
                  <div className="h10-bubble" tabIndex={0}>
                    {quote.text}
                    <span className="h10-bubble__meta">— {quote.meta}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="h10-orbit__center">
              <span>Still</span>
              <span>Here</span>
            </div>
          </div>
        </div>
      </section>

      <div className="h10-seam" aria-hidden="true" />

      {/* ── PATHS ── */}
      <section className={`h10-block h10-reveal ${pathsVisible ? "h10-in" : ""}`} ref={pathsRef}>
        <div className="h10-wrap">
          <div className="h10-paths__head">
            <p className="h10-eyebrow">What's actually here</p>
            <h2>Four quiet reasons people stay.</h2>
          </div>
          <div className="h10-path-grid">
            {PATHS.map((path) => (
              <div className="h10-path" tabIndex={0} key={path.title}>
                <h3>{path.title}</h3>
                <p>{path.body}</p>
                {path.to ? (
                  <Link to={path.to} className="h10-path__arrow">{path.cta} →</Link>
                ) : (
                  <span className="h10-path__arrow">{path.cta} →</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h10-seam" aria-hidden="true" />

      {/* ── FINAL ── */}
      <section className={`h10-block h10-final h10-reveal ${finalVisible ? "h10-in" : ""}`} ref={finalRef}>
        <div className="h10-wrap">
          <h2>The room is this warm because you're in it.</h2>
          <p>You don't have to post today. Come sit by it for a while.</p>
          <div className="h10-hero__actions">
            <button type="button" className="h10-btn-primary" onClick={onRegister}>
              Add your light
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button type="button" className="h10-btn-ghost h10-btn-ghost--solid" onClick={onLogin}>
              Log in
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
