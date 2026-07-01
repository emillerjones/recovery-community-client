import { useEffect, useRef, useState } from "react";
import heroPhoto from "../assets/images/hero-lake.jpg";
import "./About.css";

/**
 * About page.
 *
 * Same visual language as Home (forest/cream palette, Fraunces +
 * Inter type, scroll-reveal sections) but calmer and more like
 * reading something written, less like a product pitch — no stat
 * cards, no icon-grid-of-values, no flashy callouts.
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

export default function About() {
  const [missionRef, missionVisible] = useReveal();
  const [welcomeRef, welcomeVisible] = useReveal();
  const [findRef, findVisible] = useReveal();
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
        <div className={`about-section__inner reveal ${missionVisible ? "in" : ""}`} ref={missionRef}>
          <div className="eyebrow">Our Mission</div>
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

      {/* WELCOME */}
      <section className="about-section about-section--welcome" id="welcome">
        <div className={`about-section__inner reveal ${welcomeVisible ? "in" : ""}`} ref={welcomeRef}>
          <div className="eyebrow">Welcome</div>

          <blockquote className="about-pullquote">
            No one should have to walk through recovery feeling alone.
          </blockquote>

          <p>
            This is a community of people using cannabis to reduce or
            replace their use of more dangerous, more addictive
            substances. This approach is sometimes called marijuana
            maintenance, cannabis substitution, or medication-assisted
            therapy — different names for the same idea: harm reduction.
          </p>
          <p>
            We're all-inclusive and non-judgmental. There's no single
            right way to recover here, and no one is asked to follow a
            specific plan. We're simply people using cannabis as part of
            our own recovery, often alongside other paths — Alcoholics
            Anonymous, Narcotics Anonymous, HAMS, SMART Recovery,
            Moderation Management, Refuge Recovery, Celebrate Recovery,
            medication-assisted treatment, or paths of your own making.
            All of it belongs here.
          </p>
        </div>
      </section>

      {/* WHAT YOU'LL FIND HERE */}
      <section className="about-section about-section--find" id="find-here">
        <div className={`about-section__inner reveal ${findVisible ? "in" : ""}`} ref={findRef}>
          <div className="eyebrow">What You'll Find Here</div>
          <p>
            Real conversations with people who understand. A private
            space to reflect and track your own progress. Stories from
            real members. Live meetings and events. Educational
            resources grounded in research, not stigma.
          </p>
          <p>
            What started as a small group has grown into a home built
            specifically for the people who belong to it.
          </p>
        </div>
      </section>

      {/* A FEW IMPORTANT THINGS */}
      <section className="about-section about-section--important" id="important">
        <div className={`about-section__inner reveal ${importantVisible ? "in" : ""}`} ref={importantRef}>
          <div className="eyebrow">Worth Knowing</div>
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
      </section>

      {/* CLOSING CTA */}
      <section className="about-cta">
        <p className="about-cta__text">
          Whether you're just beginning, starting over, or many years
          into your recovery, you're welcome here.
          <br />
          We hope you'll stay awhile.
        </p>
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
    </div>
  );
}
