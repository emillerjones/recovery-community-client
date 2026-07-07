import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import "./Community.css";

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

  const [heroRef, heroVisible] = useReveal(0.1);
  const [momentsRef, momentsVisible] = useReveal(0.1);
  const [spacesRef, spacesVisible] = useReveal(0.1);
  const [cultureRef, cultureVisible] = useReveal(0.1);
  const [ctaRef, ctaVisible] = useReveal(0.25);

  return (
    <main className="community-page page--flat">
      {/* HERO */}
      <section className="community-hero">
        <div
          ref={heroRef}
          className={`community-inner community-reveal ${
            heroVisible ? "community-in" : ""
          }`}
        >
          <p className="community-eyebrow">Inside the community</p>

          <h1>Recovery is easier when you stop doing it alone.</h1>

          <p className="community-hero__lead">
            We’re building a peer-led recovery community for people who need a
            safer place to talk honestly about cannabis, substance dependence,
            progress, setbacks, and starting again.
          </p>

          <p className="community-hero__note">
            The logged-in community is still being shaped with the owner’s
            approval. This page explains the experience we’re building toward.
          </p>

          <div className="community-hero__actions">
            <button onClick={onRegister} className="community-btn">
              Join the community
            </button>
            <a href="/guidelines" className="community-link">
              Read the culture guidelines
            </a>
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