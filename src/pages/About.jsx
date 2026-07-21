import { useEffect, useRef, useState } from "react";
import "./About.css";

const CHAPTER_IDS = ["about-purpose", "about-beliefs", "about-support", "about-welcome"];

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
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

const BELIEFS = [
  {
    title: "Harm reduction matters",
    text: "We support people using cannabis as a way to reduce or replace the use of more dangerous and addictive substances.",
    paths: ["M115 10C112 44 101 62 73 78C50 91 35 110 28 141", "M75 77C55 67 37 68 16 82", "M55 92C62 110 60 127 49 149"],
  },
  {
    title: "Recovery has many paths",
    text: "MMRC does not require one specific program, label, or treatment model. People may combine cannabis substitution with AA, NA, SMART Recovery, HAMS, MAT, Refuge Recovery, personalized recovery, or other positive recovery methods.",
    paths: ["M114 8C111 44 103 64 82 82", "M83 81C60 91 37 89 12 73", "M83 82C72 107 73 126 82 150", "M83 82C106 101 125 111 151 112", "M69 89C48 109 35 125 31 148"],
  },
  {
    title: "Peer support is powerful",
    text: "We are not a medical organization. We are people sharing personal experience, practical support, educational resources, and encouragement with others on similar journeys.",
    paths: ["M53 8C50 44 60 68 85 84C106 98 113 119 112 150", "M167 8C170 43 159 66 135 84C114 98 108 119 112 150", "M83 83C98 74 121 74 137 83", "M67 70C84 58 99 57 111 62M153 70C136 57 123 57 111 62"],
  },
  {
    title: "Shame does not heal",
    text: "Our community is built on inclusiveness, mutual respect, acceptance, and reducing stigma around cannabis use in recovery.",
    paths: ["M109 8C109 43 109 65 110 84C110 105 99 125 80 149", "M110 84C90 91 68 88 46 74", "M110 84C130 91 151 87 174 72", "M96 91C78 106 68 122 65 142", "M124 91C143 106 153 121 157 141"],
  },
];

const PROVIDES = [
  { title: "Peer support", text: "A moderated community shaped by lived experience.", x: 17, y: 68, align: "left" },
  { title: "Education", text: "Resources about cannabis, recovery, and harm reduction.", x: 31, y: 29, align: "left" },
  { title: "Personal experience", text: "Honest accounts from people maintaining recovery.", x: 51, y: 12, align: "top" },
  { title: "Recovery stories", text: "Public voices showing what change can look like.", x: 71, y: 30, align: "right" },
  { title: "Programs", text: "Future meetings, events, and community programs.", x: 84, y: 68, align: "right" },
];

function HeroRoots() {
  const paths = [
    "M330 25C326 102 337 158 330 224C324 286 286 334 228 390",
    "M330 171C274 190 218 216 169 257C125 294 87 340 50 420",
    "M316 225C261 252 221 285 198 331C180 367 175 401 177 452",
    "M329 211C377 239 420 275 452 322C478 360 492 398 501 451",
    "M334 149C391 172 448 204 499 253C542 294 578 344 611 420",
    "M257 282C205 277 155 288 105 321",
    "M224 343C253 369 266 404 264 455",
    "M443 309C493 299 537 307 584 335",
    "M382 255C366 304 366 355 383 431",
    "M330 102C295 121 270 144 250 179M331 102C366 121 392 145 413 180",
  ];
  return <svg className="mission-roots" viewBox="0 0 660 470" aria-hidden="true">{paths.map((path, index) => <path d={path} pathLength="1" style={{ "--i": index }} key={path} />)}<circle cx="330" cy="25" r="7" /></svg>;
}

function BeliefRoot({ belief, index }) {
  return (
    <article className="mission-belief">
      <div className="mission-belief__art" aria-hidden="true">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <svg viewBox="0 0 220 160">{belief.paths.map((path, pathIndex) => <path d={path} pathLength="1" style={{ "--path-index": pathIndex }} key={path} />)}</svg>
      </div>
      <div>
        <p>What holds us</p>
        <h3>{belief.title}</h3>
        <span>{belief.text}</span>
      </div>
    </article>
  );
}

export default function About() {
  const pageRef = useRef(null);
  const activeChapter = useActiveChapter(CHAPTER_IDS);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return undefined;

    const drawings = page.querySelectorAll(".mission-belief, .mission-growth__map");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      drawings.forEach((drawing) => drawing.classList.add("mission-draw-in"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("mission-draw-in");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.01,
        rootMargin: "0px 0px 180px 0px",
      }
    );

    drawings.forEach((drawing) => observer.observe(drawing));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="philosophy-page" ref={pageRef}>
      <section className="philosophy-hero">
        <div className="philosophy-hero__soil" aria-hidden="true" />
        <div className="philosophy-inner philosophy-hero__inner">
          <div className="philosophy-hero__copy">
            <p className="philosophy-eyebrow">Established 2013</p>
            <h1>Recovery with cannabis. Without shame.</h1>
            <p className="philosophy-lead">Maintaining My Recovery with Cannabis exists to support people who use cannabis as a form of harm-reduction therapy from dangerous or addictive substances.</p>
          </div>
          <div className="philosophy-hero__roots"><HeroRoots /><p>Everything visible begins with what holds beneath.</p></div>
        </div>
      </section>

      <nav className="about-chapter-nav" aria-label="Our mission chapters">
        <div className="philosophy-inner">
          {[
            ["about-purpose", "01", "Purpose"],
            ["about-beliefs", "02", "Beliefs"],
            ["about-support", "03", "Support"],
            ["about-welcome", "04", "Welcome"],
          ].map(([id, number, label]) => (
            <a
              href={`#${id}`}
              key={id}
              className={activeChapter === id ? "is-active" : undefined}
              aria-current={activeChapter === id ? "true" : undefined}
            >
              <span>{number}</span>{label}
            </a>
          ))}
        </div>
      </nav>

      <section className="philosophy-foundation" id="about-purpose">
        <div className="philosophy-inner">
          <p className="philosophy-eyebrow">Our founding purpose</p>
          <blockquote>The mission of Maintaining My Recovery with Cannabis is to develop a recovery support community of people who use cannabis as a form of harm-reduction therapy from dangerous or addictive substances.</blockquote>
          <p>We provide support through personal experiences, educational resources, and peer support programs—while upholding a culture of inclusiveness and mutual respect.</p>
        </div>
      </section>

      <section className="mission-beliefs" id="about-beliefs">
        <div className="philosophy-inner">
          <div className="mission-beliefs__head">
            <p className="philosophy-eyebrow">What we are rooted in</p>
            <h2>There is more than one way to recover.</h2>
            <p>These beliefs are not decoration around the mission. They are the structure underneath it.</p>
          </div>
          <div className="mission-beliefs__roots">{BELIEFS.map((belief, index) => <BeliefRoot belief={belief} index={index} key={belief.title} />)}</div>
        </div>
      </section>

      <section className="mission-growth" id="about-support">
        <div className="mission-growth__light" aria-hidden="true" />
        <div className="philosophy-inner">
          <div className="mission-growth__head">
            <p className="philosophy-eyebrow">What grows from those beliefs</p>
            <h2>Support made visible.</h2>
            <p>What begins as a shared belief becomes something another person can reach for.</p>
          </div>
          <div className="mission-growth__map">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <path className="mission-growth__trunk" d="M50 100C49 73 51 45 51 10" pathLength="1" />
              <path d="M50 73C38 67 27 67 17 68M50 54C42 40 36 33 31 29M51 31C51 23 51 17 51 12M51 54C61 40 65 34 71 30M51 73C63 67 74 67 84 68" pathLength="1" />
            </svg>
            {PROVIDES.map((item) => <article className={`mission-growth__item mission-growth__item--${item.align}`} style={{ left: `${item.x}%`, top: `${item.y}%` }} key={item.title}><i aria-hidden="true" /><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}
          </div>
        </div>
      </section>

      <section className="philosophy-welcome" id="about-welcome">
        <div className="philosophy-inner philosophy-welcome__inner">
          <div className="philosophy-welcome__mark" aria-hidden="true"><i /><i /><i /></div>
          <div><p className="philosophy-eyebrow">Welcome</p><h2>No single path is required here.</h2></div>
          <div className="philosophy-copy">
            <p>MMRC is a supportive community of people using cannabis to replace or reduce their usage of dangerous and addictive substances. This method is commonly called “marijuana maintenance” or “cannabis substitution.”</p>
            <p>MMRC is not an official program and does not follow a specific treatment plan. We simply are people who use cannabis as an aid in our recovery journeys.</p>
          </div>
        </div>
      </section>

      <section className="philosophy-boundary">
        <div className="philosophy-inner"><p className="philosophy-eyebrow">Our boundary</p><p><strong>Maintaining My Recovery with Cannabis is a volunteer support group sharing practical information.</strong> This is not a professional or medical organization. The information provided is for informational and educational purposes only and is not a substitute for professional care.</p></div>
      </section>
    </main>
  );
}
