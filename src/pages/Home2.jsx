import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import heroPhoto from "../assets/images/hero-lake.jpg";
import { PUBLIC_STORIES } from "../data/publicStories";
import { usePrefersReducedMotion, supportsWebGL } from "./motionSupport";
import "./Home2.css";

// Lazy-loaded: pulls in three.js/R3F/three.quarks. Deferred until the browser
// is idle after first paint so it never competes with the hero photo/fonts.
const HeroFireflies = lazy(() => import("./HeroFireflies"));

/**
 * Home2 — a lab variant of the homepage demonstrating two techniques:
 *
 * 1. Kinetic split-text headline — the hero line animates in word by word
 *    rather than as one block, via CSS translate transitions staggered
 *    with a per-word --i custom property.
 * 2. CSS scroll-driven animation — the philosophy/stories/community
 *    sections use the new `animation-timeline: view()` spec so their
 *    reveal is driven natively by scroll position, no JS scroll
 *    listener required. Falls back to an IntersectionObserver + class
 *    toggle on browsers that don't support it yet (Safari/Firefox).
 */

function TechniqueNote({ name, children }) {
  return (
    <aside className="home2-note" aria-label={`Design technique: ${name}`}>
      <p className="home2-note__label">Design technique</p>
      <h3>{name}</h3>
      <p>{children}</p>
    </aside>
  );
}

function SplitHeadline({ text, in: isIn }) {
  const words = text.split(" ");
  return (
    <h1 className={`home2-split ${isIn ? "is-in" : ""}`}>
      {words.map((word, i) => (
        <span className="home2-split__word" key={`${word}-${i}`}>
          <span className="home2-split__inner" style={{ "--i": i }}>
            {word}
          </span>
        </span>
      ))}
    </h1>
  );
}

function useScrollDrivenFallback(ref) {
  useEffect(() => {
    const supportsTimeline =
      typeof CSS !== "undefined" && CSS.supports && CSS.supports("animation-timeline: view()");
    if (supportsTimeline) return undefined;

    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-in-fallback");
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
}

export default function Home2() {
  const { onRegister } = useOutletContext();
  const reelRef = useRef(null);
  const reduced = usePrefersReducedMotion();
  const [canRender3D] = useState(() => typeof window !== "undefined" && supportsWebGL());
  const [fireflyReady, setFireflyReady] = useState(false);
  const [splitIn, setSplitIn] = useState(false);

  const philosophyRef = useRef(null);
  const storiesHeadRef = useRef(null);
  const communityRef = useRef(null);
  useScrollDrivenFallback(philosophyRef);
  useScrollDrivenFallback(storiesHeadRef);
  useScrollDrivenFallback(communityRef);

  useEffect(() => {
    if (reduced || !canRender3D) return;
    const run = () => setFireflyReady(true);
    if (window.requestIdleCallback) {
      const id = window.requestIdleCallback(run, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(run, 400);
    return () => window.clearTimeout(id);
  }, [reduced, canRender3D]);

  useEffect(() => {
    const id = window.setTimeout(() => setSplitIn(true), 120);
    return () => window.clearTimeout(id);
  }, []);

  function moveStories(direction) {
    const reel = reelRef.current;
    const card = reel?.querySelector(".home-story-card");
    reel?.scrollBy({ left: direction * ((card?.offsetWidth || 360) + 16), behavior: "smooth" });
  }

  return (
    <main className="home home2">
      <section className="home-hero">
        <div className="home-hero__photo" style={{ backgroundImage: `url(${heroPhoto})` }} />
        <div className="home-hero__veil" />

        {fireflyReady && (
          <Suspense fallback={null}>
            <HeroFireflies reduced={reduced} />
          </Suspense>
        )}

        <div className="home-hero__content">
          <p className="home-hero__eyebrow">Peer-led · Established 2013</p>
          <SplitHeadline text="You're not alone." in={splitIn} />
          <p className="home-hero__intro">
            A community for people exploring cannabis as a path away from alcohol, opioids, and other harmful substances.
          </p>
          <div className="home-hero__actions">
            <button type="button" onClick={onRegister}>Join the community <span>→</span></button>
            <Link to="/stories">Read real stories</Link>
          </div>

          <TechniqueNote name="Kinetic split-text headline">
            Refresh this page and watch the headline above, not this box —
            each word of "You're not alone." slides up into place a beat
            after the one before it, rather than the whole line fading in
            at once. That stagger comes from a per-word <code>--i</code>{" "}
            CSS variable driving the transition delay.
          </TechniqueNote>
        </div>
      </section>

      <section className="home-belief home2-view-reveal" id="belief" ref={philosophyRef}>
        <svg className="home-belief__mark" viewBox="0 0 300 300" aria-hidden="true"><path d="M151 281c-7-70-3-135 0-211M150 163c-42-12-73-39-91-81M151 129c40-17 69-44 86-82M151 218c-47-3-85 12-116 44M152 204c44 3 81 20 112 51"/><path d="M59 82c26 0 46 12 60 35M237 47c-24 2-43 14-57 36M35 262c24-3 45 5 62 24M264 255c-24-4-45 3-63 21"/></svg>
        <p className="home-eyebrow">Our philosophy</p>
        <h2>Recovery looks different for everyone—and that&rsquo;s okay.</h2>
        <p>There is no single right way forward. This community makes room for honest questions, lived experience, practical support, and the choices that help each person build a healthier life.</p>

        <TechniqueNote name="CSS scroll-driven animation">
          This section's reveal is tied directly to scroll position using
          the new <code>animation-timeline: view()</code> CSS spec — no
          scroll event listener, no IntersectionObserver, the browser
          drives it off the main thread. Where that isn't supported yet
          (Safari, Firefox), it falls back to the older
          IntersectionObserver approach automatically.
        </TechniqueNote>
      </section>

      <section className="home-stories" id="stories">
        <div className="home-stories__contours" aria-hidden="true"><i/><i/><i/></div>
        <header className="home-stories__head home2-view-reveal" ref={storiesHeadRef}>
          <div>
            <p className="home-eyebrow">Public success stories</p>
            <h2>Real people.<br />Different paths.</h2>
            <p>Shared publicly and with purpose, so someone else might recognize a way forward.</p>
          </div>
          <div className="home-reel-controls" aria-label="Story navigation">
            <button type="button" onClick={() => moveStories(-1)} aria-label="Previous story">←</button>
            <button type="button" onClick={() => moveStories(1)} aria-label="Next story">→</button>
          </div>
        </header>

        <div className="home-story-reel" ref={reelRef}>
          {PUBLIC_STORIES.map((story, index) => (
            <Link className={`home-story-card ${index === 0 ? "home-story-card--featured" : ""}`} to={`/stories#${story.slug}`} key={story.slug}>
              <div className="home-story-card__photo">
                <img src={story.photo} alt={`Portrait of ${story.name}`} />
                {index === 0 && <span>Public success story</span>}
              </div>
              <div className="home-story-card__body">
                <blockquote>“{story.line}”</blockquote>
                <p>{story.preview}</p>
                <footer><strong>{story.name}</strong><span>Read story →</span></footer>
              </div>
            </Link>
          ))}
          <Link className="home-story-card home-story-card--all" to="/stories">
            <span>Continue listening</span>
            <h3>Every voice deserves room.</h3>
            <p>Visit the full public story collection.</p>
            <strong>All stories →</strong>
          </Link>
        </div>
        <p className="home-swipe-hint">Swipe to meet the people <span>→</span></p>
      </section>

      <section className="home-community home2-view-reveal" ref={communityRef}>
        <svg className="home-community__orbit" viewBox="0 0 500 500" aria-hidden="true"><circle cx="250" cy="250" r="190"/><circle cx="250" cy="250" r="122"/><circle cx="250" cy="250" r="48"/><path d="M250 60v380M60 250h380"/></svg>
        <div>
          <p className="home-eyebrow home-eyebrow--light">Inside the community</p>
          <h2>The public stories are only the doorway.</h2>
        </div>
        <div className="home-community__copy">
          <p>Inside, people can ask questions, share a milestone, talk through a difficult day, or simply listen. Private stories stay private. You never have to perform your recovery here.</p>
          <button type="button" onClick={onRegister}>Join the conversation <span>→</span></button>
        </div>
      </section>

      <section className="home-final">
        <div className="home-final__content">
          <p className="home-eyebrow home-eyebrow--light">Whenever you&rsquo;re ready</p>
          <h2>You do not need a perfect plan to begin.</h2>
          <p>Come as you are. Read for a while, or join the conversation.</p>
          <div><button type="button" onClick={onRegister}>Join the community</button><Link to="/stories">Start with a story</Link></div>
        </div>
      </section>
    </main>
  );
}
