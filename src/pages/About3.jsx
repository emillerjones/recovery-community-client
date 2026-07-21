import { useEffect, useRef, useState } from "react";
import TechniqueNote from "../components/TechniqueNote";
import "./About3.css";

const STAGES = [
  {
    key: "seed",
    number: "01",
    eyebrow: "The seed",
    title: "A community begins with one clear purpose.",
    caption: "Purpose becomes the first visible mark.",
  },
  {
    key: "roots",
    number: "02",
    eyebrow: "What holds beneath",
    title: "Beliefs give that purpose somewhere to stand.",
    caption: "The seed sends roots into shared beliefs.",
  },
  {
    key: "path",
    number: "03",
    eyebrow: "The recovery path",
    title: "Progress does not have to travel in a straight line.",
    caption: "The same line becomes a route with room for setbacks.",
  },
  {
    key: "branches",
    number: "04",
    eyebrow: "Many ways forward",
    title: "No single program or label is required here.",
    caption: "One route branches without declaring one branch correct.",
  },
  {
    key: "people",
    number: "05",
    eyebrow: "Human connection",
    title: "Shared experience turns a private path into support.",
    caption: "Separate lives become a connected community.",
  },
  {
    key: "door",
    number: "06",
    eyebrow: "An open doorway",
    title: "You do not have to arrive with everything figured out.",
    caption: "The journey resolves into an entrance, not an ending.",
  },
];

const BELIEFS = [
  ["Harm reduction matters", "Reducing danger is meaningful progress."],
  ["Recovery has many paths", "No single model fits every person."],
  ["Peer support is powerful", "Lived experience can help someone feel less alone."],
  ["Shame does not heal", "Respect and inclusion are part of recovery."],
];

const SUPPORT = ["Peer support", "Education", "Personal experience", "Recovery stories", "Future programs"];

function JourneyDrawing({ stage }) {
  const common = <circle className="about3-drawing__seed" cx="180" cy="70" r="8" />;

  if (stage === "seed") {
    return <>{common}<path d="M180 78C178 111 178 138 180 169" /><path className="about3-drawing__soft" d="M144 197C154 173 166 163 180 163s27 10 38 34" /></>;
  }

  if (stage === "roots") {
    return <>{common}<path d="M180 78C178 128 181 166 178 210C174 257 145 292 108 327M178 180C137 200 103 229 75 273M179 213C211 235 239 267 258 320M179 159C216 178 247 207 282 257M150 244C122 248 99 259 79 279M217 250C232 273 238 296 238 327" /></>;
  }

  if (stage === "path") {
    return <><path d="M62 322C113 292 102 249 158 229S248 206 224 165 151 145 174 103 236 88 285 52" /><circle cx="62" cy="322" r="7" /><circle cx="158" cy="229" r="5" /><circle cx="224" cy="165" r="5" /><circle cx="285" cy="52" r="7" /><path className="about3-drawing__soft" d="m271 48 14 4-5 14" /></>;
  }

  if (stage === "branches") {
    return <><path d="M180 330C178 270 181 214 180 155M180 233C144 216 113 190 91 153M180 211C213 192 239 165 258 126M180 178C151 150 134 118 129 79M180 184C208 158 223 126 228 82" /><circle cx="91" cy="153" r="7" /><circle cx="258" cy="126" r="7" /><circle cx="129" cy="79" r="7" /><circle cx="228" cy="82" r="7" /><circle className="about3-drawing__seed" cx="180" cy="330" r="8" /></>;
  }

  if (stage === "people") {
    return <><path d="M180 180 97 105M180 180l82-73M180 180l-87 85M180 180l89 82M180 180v-105" /><circle cx="180" cy="180" r="23" /><circle cx="97" cy="105" r="15" /><circle cx="262" cy="107" r="15" /><circle cx="93" cy="265" r="15" /><circle cx="269" cy="262" r="15" /><circle cx="180" cy="75" r="15" /><path className="about3-drawing__pulse" d="M180 143c21 0 38 17 38 38s-17 38-38 38-38-17-38-38 17-38 38-38Z" /></>;
  }

  return <><path d="M91 324V151C91 92 130 52 180 52s89 40 89 99v173M91 324h178M129 324V160c0-34 20-58 51-58s51 24 51 58v164" /><path className="about3-drawing__door" d="M180 104v220h51V160c0-34-20-58-51-58Z" /><circle cx="216" cy="218" r="4" /><path className="about3-drawing__light" d="m180 104 50 56v164h-50Z" /></>;
}

function StageContent({ stage }) {
  if (stage.key === "seed") {
    return <blockquote>The mission of Maintaining My Recovery with Cannabis is to develop a recovery support community for people using cannabis as harm-reduction therapy from dangerous or addictive substances.</blockquote>;
  }

  if (stage.key === "roots") {
    return <div className="about3-beliefs">{BELIEFS.map(([title, text], index) => <div key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></div>)}</div>;
  }

  if (stage.key === "path") {
    return <><p>We support people using cannabis to reduce or replace the use of more dangerous and addictive substances. Progress, setbacks, and beginning again can all belong to the same recovery journey.</p><strong>The path is allowed to bend without becoming a failure.</strong></>;
  }

  if (stage.key === "branches") {
    return <><p>People may combine cannabis substitution with established programs, medication-assisted treatment, peer groups, or a recovery practice of their own making.</p><div className="about3-branches">{["AA / NA", "SMART Recovery", "HAMS", "MAT", "Refuge Recovery", "Personalized recovery"].map((item) => <span key={item}>{item}</span>)}</div></>;
  }

  if (stage.key === "people") {
    return <><p>We are not a medical organization. We are people sharing lived experience, practical support, education, and encouragement with others on similar journeys.</p><ul>{SUPPORT.map((item) => <li key={item}>{item}</li>)}</ul></>;
  }

  return <><p>MMRC is a supportive community of people using cannabis to replace or reduce their use of dangerous and addictive substances. No official program or single treatment plan is required.</p><p>You are welcome to listen, learn, and find the path that fits your life.</p></>;
}

export default function About3() {
  const pageRef = useRef(null);
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const page = pageRef.current;
    if (!page || !("IntersectionObserver" in window)) return undefined;

    const chapters = page.querySelectorAll("[data-about3-stage]");
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveStage(Number(entry.target.dataset.about3Stage));
      }),
      { rootMargin: "-38% 0px -48%", threshold: 0 }
    );
    chapters.forEach((chapter) => observer.observe(chapter));
    return () => observer.disconnect();
  }, []);

  const current = STAGES[activeStage];

  return (
    <main className="about3-final" ref={pageRef}>
      <section className="about3-hero">
        <div className="about3-hero__grain" aria-hidden="true" />
        <div className="about3-inner about3-hero__inner">
          <p className="about3-eyebrow">Our mission · Established 2013</p>
          <h1>Recovery can grow in more than one direction.</h1>
          <p>Our purpose, the beliefs beneath it, and the people those beliefs bring together.</p>
        </div>
        <svg className="about3-hero__seed" viewBox="0 0 420 420" aria-hidden="true"><circle cx="210" cy="92" r="9" /><path pathLength="1" d="M210 101c-2 62 5 105-3 151-8 48-43 86-92 124M207 213c-45 17-82 46-113 88M208 177c42 21 78 55 109 104M204 251c32 33 46 73 44 121" /></svg>
      </section>

      <TechniqueNote
        number="Final"
        title="Semantic sticky-stage scrollytelling"
        how="The illustration stays in one physical place while each chapter changes what the same gold visual language means. The chapter—not raw page distance—controls the drawing."
        watch="The image should read as a sequence: seed, roots, winding path, branching choices, connected people, and finally an open doorway. On mobile the stage remains compact above the active text."
      />

      <section className="about3-journey">
        <div className="about3-inner about3-journey__grid">
          <aside className="about3-stage" aria-live="polite">
            <div className="about3-stage__meta"><span>{current.number}</span><p>{current.eyebrow}</p></div>
            <svg className={`about3-drawing about3-drawing--${current.key}`} viewBox="0 0 360 380" key={current.key} aria-hidden="true">
              <JourneyDrawing stage={current.key} />
            </svg>
            <p className="about3-stage__caption">{current.caption}</p>
            <div className="about3-stage__progress" aria-hidden="true">{STAGES.map((stage, index) => <i className={index <= activeStage ? "is-passed" : ""} key={stage.key} />)}</div>
          </aside>

          <div className="about3-chapters">
            {STAGES.map((stage, index) => (
              <article className={index === activeStage ? "is-active" : ""} data-about3-stage={index} key={stage.key}>
                <p className="about3-eyebrow">{stage.number} · {stage.eyebrow}</p>
                <h2>{stage.title}</h2>
                <div className="about3-chapter__body"><StageContent stage={stage} /></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about3-boundary">
        <div className="about3-inner"><p className="about3-eyebrow">Our boundary</p><p><strong>Maintaining My Recovery with Cannabis is a volunteer peer-support group.</strong> Information shared here is educational and is not a substitute for professional medical care.</p></div>
      </section>
    </main>
  );
}
