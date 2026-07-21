import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import heroPhoto from "../assets/images/hero-lake.jpg";
import { PUBLIC_STORIES } from "../data/publicStories";
import { usePrefersReducedMotion, supportsWebGL } from "./motionSupport";
import "./Home.css";

// Lazy-loaded: pulls in three.js/R3F/three.quarks. Deferred until the browser
// is idle after first paint (see `fireflyReady` below) so it never competes
// with the hero photo/fonts for bandwidth on first load.
const HeroFireflies = lazy(() => import("./HeroFireflies"));

const CONSTELLATION_NODES = [
  { x: 80, y: 190, r: 5 },
  { x: 220, y: 110, r: 7 },
  { x: 150, y: 50, r: 3 },
  { x: 380, y: 170, r: 4 },
  { x: 470, y: 70, r: 8 },
  { x: 610, y: 150, r: 5 },
  { x: 700, y: 55, r: 6 },
  { x: 830, y: 160, r: 4 },
  { x: 940, y: 85, r: 7 },
  { x: 1010, y: 35, r: 3 },
  { x: 1090, y: 180, r: 5 },
];

const CONSTELLATION_EDGES = [
  [0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [4, 6],
  [5, 7], [6, 8], [8, 9], [7, 10], [8, 10],
];

export default function Home() {
  const { onRegister } = useOutletContext();
  const reelRef = useRef(null);
  const reduced = usePrefersReducedMotion();
  const [canRender3D] = useState(() => typeof window !== "undefined" && supportsWebGL());
  const [fireflyReady, setFireflyReady] = useState(false);

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

  function moveStories(direction) {
    const reel = reelRef.current;
    const card = reel?.querySelector(".home-story-card");
    reel?.scrollBy({ left: direction * ((card?.offsetWidth || 360) + 16), behavior: "smooth" });
  }

  return (
    <main className="home">
      <section className="home-hero">
        <div className="home-hero__photo" style={{ backgroundImage: `url(${heroPhoto})` }} />
        <div className="home-hero__veil" />

        {/* Experimental — remove this Suspense block to take the ambient particle layer back out. */}
        {fireflyReady && (
          <Suspense fallback={null}>
            <HeroFireflies reduced={reduced} />
          </Suspense>
        )}

        <div className="home-hero__content">
          <p className="home-hero__eyebrow">Peer-led · Established 2013</p>
          <h1>You&rsquo;re not alone.</h1>
          <p className="home-hero__intro">A community for people exploring cannabis as a path away from alcohol, opioids, and other harmful substances.</p>
          <div className="home-hero__actions">
            <button type="button" onClick={onRegister}>Join the community <span>→</span></button>
            <Link to="/stories">Read real stories</Link>
          </div>
          <div className="home-hero-proof" aria-label="Community values">
            <span><i>01</i>Private by design</span>
            <span><i>02</i>Peer-led support</span>
            <span><i>03</i>No judgment</span>
          </div>
        </div>
        <a className="home-hero__scroll" href="#belief" aria-label="Continue to our philosophy"><span /></a>
      </section>

      <section className="home-belief" id="belief">
        <span className="home-section-number" aria-hidden="true">01</span>
        <svg className="home-belief__mark" viewBox="0 0 300 300" aria-hidden="true"><path d="M151 281c-7-70-3-135 0-211M150 163c-42-12-73-39-91-81M151 129c40-17 69-44 86-82M151 218c-47-3-85 12-116 44M152 204c44 3 81 20 112 51"/><path d="M59 82c26 0 46 12 60 35M237 47c-24 2-43 14-57 36M35 262c24-3 45 5 62 24M264 255c-24-4-45 3-63 21"/></svg>
        <p className="home-eyebrow">Our philosophy</p>
        <h2>Recovery looks different for everyone—and that&rsquo;s okay.</h2>
        <p>There is no single right way forward. This community makes room for honest questions, lived experience, practical support, and the choices that help each person build a healthier life.</p>
      </section>

      <section className="home-stories" id="stories">
        <span className="home-stories-number" aria-hidden="true">02</span>
        <div className="home-stories__contours" aria-hidden="true"><i/><i/><i/></div>
        <header className="home-stories__head">
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

      <section className="home-community">
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
        <div className="home-final__glow" aria-hidden="true" />
        <div className="home-final__scene" aria-hidden="true">
          <svg className="home-final__constellation" viewBox="0 0 1200 260" preserveAspectRatio="xMidYMid slice">
            {CONSTELLATION_EDGES.map(([from, to], i) => {
              const a = CONSTELLATION_NODES[from];
              const b = CONSTELLATION_NODES[to];
              const d = `M${a.x} ${a.y} L${b.x} ${b.y}`;
              return (
                <g key={`${from}-${to}`}>
                  <path className="home-final__edge" d={d} />
                  <path className="home-final__edge home-final__edge--signal" d={d} pathLength="1" style={{ "--delay": `${i * 0.55}s` }} />
                </g>
              );
            })}
            {CONSTELLATION_NODES.map((node, i) => (
              <circle key={i} className="home-final__node" cx={node.x} cy={node.y} r={node.r} style={{ "--delay": `${i * 0.35}s` }} />
            ))}
          </svg>
        </div>
        <div className="home-final__content">
          <p className="home-final__caption">Every point of light began exactly where you are.</p>
          <p className="home-eyebrow home-eyebrow--light">Whenever you&rsquo;re ready</p>
          <h2>You do not need a perfect plan to begin.</h2>
          <p>Come as you are. Read for a while, or join the conversation.</p>
          <div><button type="button" onClick={onRegister}>Join the community</button><Link to="/stories">Start with a story</Link></div>
        </div>
      </section>
    </main>
  );
}
