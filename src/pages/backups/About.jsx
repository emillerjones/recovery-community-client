import { useEffect, useRef, useState } from "react";
import heroPhoto from "../assets/images/hero-lake.jpg";
import "./About.css";

/**
 * About page.
 *
 * Same visual language as Home (forest/cream palette, Fraunces +
 * Inter type, scroll-reveal sections) but calmer and more like
 * reading something written, less like a product pitch.
 *
 * v2: consolidated from 6 sections down to 4 (merged "What You'll
 * Find Here" into "Welcome"), added one small colored icon per
 * section eyebrow, and split the closing CTA into two lines with
 * different tones (formal welcome line + a warmer script-style line).
 */

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

// Small inline icon set — one per section, kept simple (stroke-only,
// no fills) so they read as quiet accents, not decoration competing
// with the content.
function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2C9 6 6 9 6 13a6 6 0 0012 0c0-4-3-7-6-11z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M12 20s-7-4.4-9.5-9C0.8 7.4 2.6 4 6 4c2 0 3.5 1.2 4.2 2.4C10.9 5.2 12.4 4 14.4 4c3.4 0 5.2 3.4 3.5 7-2.5 4.6-9.5 9-9.5 9z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function About() {
  const [missionRef, missionVisible] = useReveal();
  const [welcomeRef, welcomeVisible] = useReveal();
  const [importantRef, importantVisible] = useReveal();

  return (
    <div className="about">
      {/* Smaller hero than Home — this isn't the front door, it
          doesn't need the full-height treatment */}
      <section className="about-hero">
        <div
          className="about-hero__photo"
          style={{ backgroundImage: `url(${heroPhoto})` }}
        />
        <div className="about-hero__overlay" />
        <div className="about-hero__content">
          <h1>Why we exist.</h1>
          <p>
            A peer-led community for people exploring cannabis as a path
            away from alcohol, opioids, and other harmful substances —
            since 2013.
          </p>
        </div>
      </section>

      {/* MISSION */}
      <section className="about-section about-section--mission" id="mission">
        <div
          className={`about-section__inner reveal ${missionVisible ? "in" : ""}`}
          ref={missionRef}
        >
          <div className="eyebrow">
            <span className="eyebrow__icon eyebrow__icon--leaf"><LeafIcon /></span>
            Our Mission
          </div>
          <p className="about-lead">
            Recovery With The Exit Drug began in 2013 as Maintaining My
            Recovery with Cannabis (MMRC) — a recovery support community
            for people who use cannabis as a form of harm reduction from
            dangerous or addictive substances.
          </p>
          <p>
            We provide support through personal experience, education,
            and peer support, while cultivating acceptance, encouraging
            healthy behaviors, and reducing stigma.
          </p>
        </div>
      </section>

      {/* WELCOME — now also covers what you'll find here, merged
          from what used to be a separate section */}
      <section className="about-section about-section--welcome" id="welcome">
        <div
          className={`about-section__inner reveal ${welcomeVisible ? "in" : ""}`}
          ref={welcomeRef}
        >
          <div className="eyebrow">
            <span className="eyebrow__icon eyebrow__icon--heart"><HeartIcon /></span>
            Welcome
          </div>

          <blockquote className="about-pullquote">
            No one should have to walk through recovery feeling alone.
          </blockquote>

          <div className="about-two-col">
            <p>
              This is a community of people using cannabis to reduce or
              replace their use of more dangerous, more addictive
              substances — sometimes called marijuana maintenance,
              cannabis substitution, or medication-assisted therapy.
              Different names for the same idea: harm reduction.
            </p>
            <p>
              We're all-inclusive and non-judgmental. There's no single
              right way to recover here. We're simply people using
              cannabis as part of our own recovery, often alongside other
              paths — Alcoholics Anonymous, Narcotics Anonymous, HAMS,
              SMART Recovery, Moderation Management, Refuge Recovery,
              Celebrate Recovery, medication-assisted treatment, or paths
              of your own making. All of it belongs here.
            </p>
          </div>
        </div>
      </section>

      {/* WORTH KNOWING (the disclaimer) */}
      <section className="about-section about-section--important" id="important">
        <div
          className={`about-section__inner reveal ${importantVisible ? "in" : ""}`}
          ref={importantRef}
        >
          <div className="eyebrow">
            <span className="eyebrow__icon eyebrow__icon--shield"><ShieldIcon /></span>
            Worth Knowing
          </div>

          <div className="about-two-col">
            <p>
              Recovery With The Exit Drug is a peer support community, not
              a medical or professional organization. Nothing here is a
              substitute for professional care — if you need it, please
              seek it.
            </p>
            <p>
              What we offer is something else: people who've been where
              you are, sharing what's actually helped, without judgment.
            </p>
          </div>
        </div>
      </section>

      {/* CLOSING CTA — two lines, two tones: a calm, formal welcome
          line, then a warmer script-style line underneath it */}
      <section className="about-cta">
        <p className="about-cta__text">
          Whether you're just beginning, starting over, or many years
          into your recovery, you're welcome here.
        </p>
        <p className="about-cta__script">We hope you'll stay awhile.</p>
        <a href="#" className="about-cta__button">
          Enter the Community
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </section>

      {/* Small, quiet footer line — not part of the main reading
          flow, just a dated acknowledgment of the community's history */}
      <div className="about-footnote">
        <span className="about-footnote__icon"><LeafIcon /></span>
        <p>
          Recovery With The Exit Drug began in 2013 as Maintaining My
          Recovery with Cannabis (MMRC). Thank you to everyone who has
          been part of this community from the very beginning.
        </p>
      </div>
    </div>
  );
}
