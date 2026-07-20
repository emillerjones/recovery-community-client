import { useEffect, useRef, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import gsap from "gsap";
import {
  BookOpen,
  Library,
  Medal,
  MessageCircleMore,
  MoonStar,
  NotebookPen,
  ShieldCheck,
} from "lucide-react";
import "./Community2.css";

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
    icon: MessageCircleMore,
    desc: "Organized conversations around recovery, cannabis, substance dependence, setbacks, and progress.",
  },
  {
    name: "Live community chat",
    icon: BookOpen,
    desc: "A more immediate place to talk when a full post feels like too much.",
  },
  {
    name: "Milestones",
    icon: Medal,
    desc: "A place to mark meaningful days — one day, one week, six months, one year, or starting over.",
  },
  {
    name: "Hard nights",
    icon: MoonStar,
    desc: "A space for the moments people usually face alone.",
  },
  {
    name: "Recovery journals",
    icon: NotebookPen,
    desc: "Private or shared reflections to help members notice patterns, progress, and triggers.",
  },
  {
    name: "Resources",
    icon: Library,
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

export default function Community2() {
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
        gsap.set("[data-community-intro]", {
          opacity: 1,
          clearProps: "transform",
        });
        return;
      }

      gsap.timeline({ defaults: { ease: "power3.out" } })
        .fromTo("[data-community-intro]", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.11 });
    }, hero);

    return () => context.revert();
  }, []);

  return (
    <main className="community-page page--flat community2-study">
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

          <div className="community-card-grid community-moments__board">
            {MOMENTS.map((item, index) => (
              <article className="community-card" key={item.title}>
                <span className="community-card__number">0{index + 1}</span>
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
            {PLANNED_SPACES.map((space, index) => {
              const SpaceIcon = space.icon;
              return (
              <article className="community-space" key={space.name}>
                <span className="community-space__number">0{index + 1}</span>
                <span className="community-space__icon"><SpaceIcon /></span>
                <div><h3>{space.name}</h3><p>{space.desc}</p></div>
              </article>
              );
            })}
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
          <div className="community-culture__mark"><ShieldCheck /></div>
          <div className="community-culture__copy">
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

            <Link to="/guidelines" className="community-text-link">
              View community culture and guidelines →
            </Link>
          </div>
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
