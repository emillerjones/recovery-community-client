import { useEffect, useRef, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import gsap from "gsap";
import "./Community.css";

const COMMUNITY_NODES = [
  { label: "You", note: "Come exactly as you are.", x: 50, y: 49, home: true },
  { label: "An honest post", note: "I need to say this somewhere.", x: 15, y: 24 },
  { label: "Someone listens", note: "You do not have to explain everything.", x: 48, y: 15 },
  { label: "A kind reply", note: "I have been there too.", x: 83, y: 29 },
  { label: "The hard night", note: "Stay for the next few minutes.", x: 82, y: 72 },
  { label: "A small win", note: "Today counted.", x: 49, y: 84 },
  { label: "Begin again", note: "Starting over still means starting.", x: 16, y: 69 },
];

const COMMUNITY_PATHS = [
  "M50 49 C38 39 27 29 15 24",
  "M50 49 C49 35 48 25 48 15",
  "M50 49 C63 40 72 33 83 29",
  "M50 49 C64 58 73 65 82 72",
  "M50 49 C50 64 49 74 49 84",
  "M50 49 C37 58 27 65 16 69",
  "M15 24 C25 12 36 12 48 15",
  "M83 29 C91 43 90 59 82 72",
  "M49 84 C36 86 25 80 16 69",
];

const MOMENTS = [
  {
    title: "The first honest post",
    text: "For the person who is tired, scared, curious, or just ready to say the quiet part out loud.",
  },
  {
    title: "The hard night",
    text: "For the moments when cravings, grief, anxiety, or loneliness hit harder than expected.",
  },
  {
    title: "The small win",
    text: "For the day someone makes it through, tells the truth, asks for help, or starts again.",
  },
];

const PLANNED_SPACES = [
  {
    name: "Discussion spaces",
    desc: "Organized conversations around recovery, cannabis, substance dependence, setbacks, and progress.",
  },
  {
    name: "Live community chat",
    desc: "A more immediate place to talk when a full post feels like too much.",
  },
  {
    name: "Milestones",
    desc: "A place to mark meaningful days — one day, one week, six months, one year, or starting over.",
  },
  {
    name: "Hard nights",
    desc: "A space for the moments people usually face alone.",
  },
  {
    name: "Recovery journals",
    desc: "Private or shared reflections to help members notice patterns, progress, and triggers.",
  },
  {
    name: "Resources",
    desc: "Community-centered tools, links, research, and practical support gathered in one place.",
  },
];

function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

export default function Community() {
  const { onRegister } = useOutletContext();

  const heroRef = useRef(null);
  const [momentsRef, momentsVisible] = useReveal(0.1);
  const [spacesRef, spacesVisible] = useReveal(0.1);
  const [cultureRef, cultureVisible] = useReveal(0.1);
  const [ctaRef, ctaVisible] = useReveal(0.25);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return undefined;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const context = gsap.context(() => {
      if (reducedMotion) {
        gsap.set("[data-community-intro], .community-network__path, .community-network__node", {
          opacity: 1,
          clearProps: "transform",
        });
        return;
      }

      gsap.timeline({ defaults: { ease: "power3.out" } })
        .fromTo("[data-community-intro]", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.11 })
        .fromTo(".community-network__path", { opacity: 0, strokeDashoffset: 1 }, { opacity: 1, strokeDashoffset: 0, duration: 1.15, stagger: 0.07 }, "-=0.55")
        .fromTo(".community-network__node", { opacity: 0, scale: 0.82 }, { opacity: 1, scale: 1, duration: 0.65, stagger: 0.09 }, "-=0.65");
    }, hero);

    return () => context.revert();
  }, []);

  return (
    <main className="community-page page--flat">
      {/* HERO */}
      <section className="community-hero community-hero--network" ref={heroRef}>
        <div className="community-hero__glow" aria-hidden="true" />
        <div className="community-inner community-hero__layout">
          <div className="community-hero__copy">
            <p className="community-eyebrow" data-community-intro>Inside the community</p>
            <h1 data-community-intro>Recovery gets lighter when it is shared.</h1>
            <p className="community-hero__lead" data-community-intro>
              A peer-led place to speak honestly about cannabis, substance dependence,
              progress, setbacks, and beginning again—with people who understand.
            </p>
            <div className="community-hero__trust" data-community-intro>
              <span>Private by design</span>
              <span>Peer-led</span>
              <span>No judgment</span>
            </div>
            <div className="community-hero__actions" data-community-intro>
              <button onClick={onRegister} className="community-btn">
                Join the community
              </button>
              <Link to="/guidelines" className="community-link">
                Read the culture guidelines
              </Link>
            </div>
          </div>

          <div className="community-network" aria-label="A message moving through a connected support community">
            <div className="community-network__halo" aria-hidden="true" />
            <svg className="community-network__lines" viewBox="0 0 100 100" aria-hidden="true">
              {COMMUNITY_PATHS.map((path, index) => (
                <g key={path}>
                  <path className="community-network__path" d={path} pathLength="1" />
                  <path
                    className="community-network__signal"
                    d={path}
                    pathLength="1"
                    style={{ "--signal-delay": `${index * -0.72}s` }}
                  />
                </g>
              ))}
            </svg>
            {COMMUNITY_NODES.map((node, index) => (
              <button
                className={`community-network__node ${node.home ? "community-network__node--home" : ""}`}
                type="button"
                style={{ left: `${node.x}%`, top: `${node.y}%`, "--node-delay": `${index * -0.63}s` }}
                key={node.label}
                aria-label={`${node.label}: ${node.note}`}
              >
                <i aria-hidden="true" />
                <span>{node.label}</span>
                <em>{node.note}</em>
              </button>
            ))}
            <p className="community-network__caption">One person reaches out. Someone answers.</p>
          </div>
        </div>
      </section>

      {/* MOMENTS */}
      <section className="community-section community-moments">
        <div
          ref={momentsRef}
          className={`community-inner community-reveal ${
            momentsVisible ? "community-in" : ""
          }`}
        >
          <p className="community-eyebrow">What it’s for</p>
          <h2>A place for the moments people usually carry alone.</h2>

          <div className="community-card-grid">
            {MOMENTS.map((item) => (
              <article className="community-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PLANNED SPACES */}
      <section className="community-section community-spaces">
        <div
          ref={spacesRef}
          className={`community-inner community-reveal ${
            spacesVisible ? "community-in" : ""
          }`}
        >
          <p className="community-eyebrow">What we’re building</p>
          <h2>Community spaces designed around real recovery.</h2>

          <div className="community-space-list">
            {PLANNED_SPACES.map((space) => (
              <article className="community-space" key={space.name}>
                <h3>{space.name}</h3>
                <p>{space.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CULTURE */}
      <section className="community-section community-culture">
        <div
          ref={cultureRef}
          className={`community-inner community-reveal ${
            cultureVisible ? "community-in" : ""
          }`}
        >
          <p className="community-eyebrow">How it stays safe</p>
          <h2>Peer-led does not mean anything goes.</h2>

          <p>
            The community is being built around privacy, kindness, honesty, and
            clear boundaries. Members will be expected to follow guidelines that
            protect the group from spam, judgment, illegal activity, harassment,
            and unsafe advice.
          </p>

          <p>
            This is not a replacement for medical care, therapy, detox, or
            emergency support. It is a place for peer connection, shared
            experience, and practical encouragement.
          </p>

          <a href="/guidelines" className="community-text-link">
            View community culture and guidelines →
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="community-cta-section">
        <div
          ref={ctaRef}
          className={`community-inner community-cta community-reveal ${
            ctaVisible ? "community-in" : ""
          }`}
        >
          <p className="community-eyebrow">Be part of what comes next</p>
          <h2>Help shape a recovery community that feels human.</h2>
          <p>
            The goal is simple: build a place where people can show up honestly,
            find support, and keep moving.
          </p>

          <button onClick={onRegister} className="community-btn">
            Join the community
          </button>
        </div>
      </section>
    </main>
  );
}
