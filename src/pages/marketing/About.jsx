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
    title: "Harm-Reduction Saves Lives",
    text: "We promote harm-reduction that is an evidence-based approach to address substance use disorders through prevention, treatment, and recovery that 'meets people where they are at' with dignity, kindness and respect regardless of condition or circumstance.",
    paths: ["M115 10C112 44 101 62 73 78C50 91 35 110 28 141", "M75 77C55 67 37 68 16 82", "M55 92C62 110 60 127 49 149"],
  },
  {
    title: "Recovery has many pathways",
    text: "We recognize that recovery is deeply personal and what works for one person may not work for another. Approaching all recovery methods with openness and without judgment is far more effective than shaming someone because their path to recovery looks different from the traditional approach.",
    paths: ["M114 8C111 44 103 64 82 82", "M83 81C60 91 37 89 12 73", "M83 82C72 107 73 126 82 150", "M83 82C106 101 125 111 151 112", "M69 89C48 109 35 125 31 148"],
  },
  {
    title: "Medication-Assisted-Treatment (MAT) & Plant-Medicine is Health Care",
    text: "These modalities are healthcare because they treat substance use disorders and mental health as real medical conditions. They use science, clinical evidence, and history to heal the brain and the body.",
    paths: ["M53 8C50 44 60 68 85 84C106 98 113 119 112 150", "M167 8C170 43 159 66 135 84C114 98 108 119 112 150", "M83 83C98 74 121 74 137 83", "M67 70C84 58 99 57 111 62M153 70C136 57 123 57 111 62"],
  },
  {
    title: "Connection & Compassion Heal; Shame & Stigma Hurt",
    text: "By placing compassion and connection at the center of recovery, we can help foster healing while also contributing to a broader cultural shift from shame and stigma toward understanding and support.",
    paths: ["M109 8C109 43 109 65 110 84C110 105 99 125 80 149", "M110 84C90 91 68 88 46 74", "M110 84C130 91 151 87 174 72", "M96 91C78 106 68 122 65 142", "M124 91C143 106 153 121 157 141"],
  },
];

const PROVIDES = [
  { title: "Peer support group", text: "A first of its kind moderated community support forum of like-minded individuals sharing personal experience about cannabis and recovery.", x: 17, y: 68, align: "left" },
  { title: "Education", text: "A list of informational articles, scientific research, and other resources to learn about cannabis, recovery and more.", x: 31, y: 29, align: "left" },
  // { title: "Personal experience", text: "Honest accounts from people maintaining recovery.", x: 51, y: 12, align: "top" },
  { title: "Recovery stories", text: "Real voices publicly sharing their journeys of recovery with cannabis to help inspire others.", x: 71, y: 30, align: "right" },
  { title: "Future projects", text: "We are always growing to add additional features that will benefit our community.", x: 84, y: 68, align: "right" },
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
      <section className="philosophy-hero" data-nav-theme="light">
        <div className="philosophy-hero__soil" aria-hidden="true" />
        <div className="philosophy-inner philosophy-hero__inner">
          <div className="philosophy-hero__copy">
            <p className="philosophy-eyebrow">Established 2013</p>
            <h1>Recovery with The Exit-Drug</h1>
            <p className="philosophy-lead">(Formerly known as Maintaining My Recovery with Cannabis/MMRC)</p>
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
            // ["about-welcome", "04", "Welcome"],
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

      <section className="philosophy-foundation" id="about-purpose" data-nav-theme="light">
        <div className="philosophy-inner">
          <p className="philosophy-eyebrow">Our founding purpose</p>
          <blockquote>The mission of Recovery with The Exit-Drug (formerly known as Maintaining My Recovery with Cannabis/MMRC) is to develop a recovery support community of people who use cannabis as a form of harm-reduction therapy from dangerous or addictive substances.</blockquote>
          <p>We provide support through personal experiences, educational resources, and peer support programs — while upholding a culture of inclusiveness and mutual respect.</p>
        </div>
      </section>

      <section className="mission-beliefs" id="about-beliefs" data-nav-theme="light">
        <div className="philosophy-inner">
          <div className="mission-beliefs__head">
            <p className="philosophy-eyebrow">What we are rooted in</p>
            <h2>Principles We Uphold</h2>
            <p>The following principles are what guide and shape our mission:</p>
          </div>
          <div className="mission-beliefs__roots">{BELIEFS.map((belief, index) => <BeliefRoot belief={belief} index={index} key={belief.title} />)}</div>
        </div>
      </section>

      <section className="mission-growth" id="about-support">
        <div className="mission-growth__light" aria-hidden="true" />
        <div className="philosophy-inner">
          <div className="mission-growth__head">
            {/* <p className="philosophy-eyebrow">What grows from those beliefs</p> */}
            {/* <h2>Support made visible.</h2> */}
            <p>WHAT WE PROVIDE</p>
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

      {/* <section className="philosophy-welcome" id="about-welcome">
        <div className="philosophy-inner philosophy-welcome__inner">
          <div className="philosophy-welcome__mark" aria-hidden="true"><i /><i /><i /></div>
          <div><p className="philosophy-eyebrow">Welcome</p><h2>No single path is required here.</h2></div>
          <div className="philosophy-copy">
            <p>MMRC is a supportive community of people using cannabis to replace or reduce their usage of dangerous and addictive substances. This method is commonly called “marijuana maintenance” or “cannabis substitution.”</p>
            <p>MMRC is not an official program and does not follow a specific treatment plan. We simply are people who use cannabis as an aid in our recovery journeys.</p>
          </div>
        </div>
      </section> */}

      <section className="philosophy-boundary" data-nav-theme="light">
        <div className="philosophy-inner"><p className="philosophy-eyebrow">DISCLAIMER</p>
        <p><strong>Recovery with The Exit Drug is a volunteer support group sharing practical information.</strong> This is not a professional or medical organization. The information provided is for informational and educational purposes only and is not a substitute for professional care.</p></div>
      </section>
    </main>
  );
}
