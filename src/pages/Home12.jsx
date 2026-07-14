import { useRef } from "react";
import { Link, useOutletContext } from "react-router-dom";
import heroPhoto from "../assets/images/hero-lake.jpg";
import { PUBLIC_STORIES } from "../data/publicStories";
import "./Home12.css";
import "./Home12Refine.css";

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

export default function Home12() {
  const { onRegister } = useOutletContext();
  const reelRef = useRef(null);

  function moveStories(direction) {
    const reel = reelRef.current;
    const card = reel?.querySelector(".home12-story-card");
    reel?.scrollBy({ left: direction * ((card?.offsetWidth || 360) + 16), behavior: "smooth" });
  }

  return (
    <main className="home12">
      <section className="home12-hero">
        <div className="home12-hero__photo" style={{ backgroundImage: `url(${heroPhoto})` }} />
        <div className="home12-hero__veil" />
        <svg className="home12-hero__line-art" viewBox="0 0 620 300" aria-hidden="true"><path d="M8 251C96 209 145 224 222 177c82-51 125-32 199-86 58-42 112-41 191-76"/><path d="M34 278c91-37 160-20 239-70 72-46 123-31 192-74 48-30 89-36 139-36"/></svg>
        <div className="home12-hero__content">
          <p className="home12-hero__eyebrow">Peer-led · Established 2013</p>
          <h1>You&rsquo;re not alone.</h1>
          <p className="home12-hero__intro">A community for people exploring cannabis as a path away from alcohol, opioids, and other harmful substances.</p>
          <div className="home12-hero__actions">
            <button type="button" onClick={onRegister}>Join the community <span>→</span></button>
            <Link to="/stories">Read real stories</Link>
          </div>
        </div>
        <a className="home12-hero__scroll" href="#belief" aria-label="Continue to our philosophy"><span /></a>
      </section>

      <section className="home12-belief" id="belief">
        <svg className="home12-belief__mark" viewBox="0 0 300 300" aria-hidden="true"><path d="M151 281c-7-70-3-135 0-211M150 163c-42-12-73-39-91-81M151 129c40-17 69-44 86-82M151 218c-47-3-85 12-116 44M152 204c44 3 81 20 112 51"/><path d="M59 82c26 0 46 12 60 35M237 47c-24 2-43 14-57 36M35 262c24-3 45 5 62 24M264 255c-24-4-45 3-63 21"/></svg>
        <p className="home12-eyebrow">Our philosophy</p>
        <h2>Recovery looks different for everyone—and that&rsquo;s okay.</h2>
        <p>There is no single right way forward. This community makes room for honest questions, lived experience, practical support, and the choices that help each person build a healthier life.</p>
      </section>

      <section className="home12-stories" id="stories">
        <div className="home12-stories__contours" aria-hidden="true"><i/><i/><i/></div>
        <header className="home12-stories__head">
          <div>
            <p className="home12-eyebrow">Public success stories</p>
            <h2>Real people.<br />Different paths.</h2>
            <p>Shared publicly and with purpose, so someone else might recognize a way forward.</p>
          </div>
          <div className="home12-reel-controls" aria-label="Story navigation">
            <button type="button" onClick={() => moveStories(-1)} aria-label="Previous story">←</button>
            <button type="button" onClick={() => moveStories(1)} aria-label="Next story">→</button>
          </div>
        </header>

        <div className="home12-story-reel" ref={reelRef}>
          {PUBLIC_STORIES.map((story, index) => (
            <Link className={`home12-story-card ${index === 0 ? "home12-story-card--featured" : ""}`} to={`/stories#${story.slug}`} key={story.slug}>
              <div className="home12-story-card__photo">
                <img src={story.photo} alt={`Portrait of ${story.name}`} />
                {index === 0 && <span>Public success story</span>}
              </div>
              <div className="home12-story-card__body">
                <blockquote>“{story.line}”</blockquote>
                <p>{story.preview}</p>
                <footer><strong>{story.name}</strong><span>Read story →</span></footer>
              </div>
            </Link>
          ))}
          <Link className="home12-story-card home12-story-card--all" to="/stories">
            <span>Continue listening</span>
            <h3>Every voice deserves room.</h3>
            <p>Visit the full public story collection.</p>
            <strong>All stories →</strong>
          </Link>
        </div>
        <p className="home12-swipe-hint">Swipe to meet the people <span>→</span></p>
      </section>

      <section className="home12-community">
        <svg className="home12-community__orbit" viewBox="0 0 500 500" aria-hidden="true"><circle cx="250" cy="250" r="190"/><circle cx="250" cy="250" r="122"/><circle cx="250" cy="250" r="48"/><path d="M250 60v380M60 250h380"/></svg>
        <div>
          <p className="home12-eyebrow home12-eyebrow--light">Inside the community</p>
          <h2>The public stories are only the doorway.</h2>
        </div>
        <div className="home12-community__copy">
          <p>Inside, people can ask questions, share a milestone, talk through a difficult day, or simply listen. Private stories stay private. You never have to perform your recovery here.</p>
          <button type="button" onClick={onRegister}>Join the conversation <span>→</span></button>
        </div>
      </section>

      <section className="home12-final">
        <div className="home12-final__glow" aria-hidden="true" />
        <div className="home12-final__scene" aria-hidden="true">
          <svg className="home12-final__constellation" viewBox="0 0 1200 260" preserveAspectRatio="xMidYMid slice">
            {CONSTELLATION_EDGES.map(([from, to], i) => {
              const a = CONSTELLATION_NODES[from];
              const b = CONSTELLATION_NODES[to];
              const d = `M${a.x} ${a.y} L${b.x} ${b.y}`;
              return (
                <g key={`${from}-${to}`}>
                  <path className="home12-final__edge" d={d} />
                  <path className="home12-final__edge home12-final__edge--signal" d={d} pathLength="1" style={{ "--delay": `${i * 0.55}s` }} />
                </g>
              );
            })}
            {CONSTELLATION_NODES.map((node, i) => (
              <circle key={i} className="home12-final__node" cx={node.x} cy={node.y} r={node.r} style={{ "--delay": `${i * 0.35}s` }} />
            ))}
          </svg>
        </div>
        <div className="home12-final__content">
          <p className="home12-final__caption">Every point of light began exactly where you are.</p>
          <p className="home12-eyebrow home12-eyebrow--light">Whenever you&rsquo;re ready</p>
          <h2>You do not need a perfect plan to begin.</h2>
          <p>Come as you are. Read for a while, or join the conversation.</p>
          <div><button type="button" onClick={onRegister}>Join the community</button><Link to="/stories">Start with a story</Link></div>
        </div>
      </section>
    </main>
  );
}
