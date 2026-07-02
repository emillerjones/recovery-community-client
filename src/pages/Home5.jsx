import { useEffect, useRef, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import heroPhoto from "../assets/images/hero-lake.jpg";
import "./Home5.css";

const WHAT_YOU_FIND = [
  {
    id: "journal",
    title: "A place to track your days",
    body: "Write privately. Mark milestones. Come back and read how far you've come.",
  },
  {
    id: "community",
    title: "People who get it",
    body: "Not therapists. Not strangers. People who've been where you are and kept going.",
  },
  {
    id: "resources",
    title: "Information without judgment",
    body: "Research, guides, and practical tools — written for people making hard decisions.",
  },
  {
    id: "encouragement",
    title: "Somewhere to be honest",
    body: "Say the thing you can't say anywhere else. Someone here will understand.",
  },
];

const COMMUNITY_POSTS = [
  { text: "Today is six months. I didn't think I'd make it past six days." },
  { text: "I had a rough week but didn't go back. That's new for me." },
  { text: "Does anyone else find mornings the hardest? Just me?" },
  { text: "One year. I came here broken. I'm still here." },
];

function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, visible];
}

export default function Home5() {
  const { onRegister } = useOutletContext();

  const [philRef, philVisible] = useReveal();
  const [whatRef, whatVisible] = useReveal(0.1);
  const [communityRef, communityVisible] = useReveal();
  const [resourcesRef, resourcesVisible] = useReveal();
  const [ctaRef, ctaVisible] = useReveal(0.3);

  return (
    <div className="h5">

      {/* ── HERO ── */}
      <section className="h5-hero">
        <div className="h5-hero__photo" style={{ backgroundImage: `url(${heroPhoto})` }} />
        <div className="h5-hero__overlay" />
        <div className="h5-mist h5-mist-1" />
        <div className="h5-mist h5-mist-2" />
        <div className="h5-mist h5-mist-3" />

        <div className="h5-hero__content">
          <h1>You're not alone.</h1>
          <p>
            A safe, welcoming community for people exploring cannabis as a path to
            freedom from alcohol, opioids, and other harmful substances.
          </p>
          {/* <a href="#community" className="h5-hero__cta">
            Enter the Community
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a> */}
          <button onClick={onRegister} className="h5-cta h5-hero__cta">
            Join the community
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>          
        </div>

        <div className="h5-scroll-cue">
          Scroll to explore
          <span className="h5-chev" />
        </div>
      </section>

      {/* ── PHILOSOPHY ── */}
      <section className="h5-section h5-philosophy" id="philosophy">
        <div className="h5-inner">
          <div className={`h5-phil__text h5-reveal ${philVisible ? "h5-in" : ""}`} ref={philRef}>
            <div className="h5-eyebrow">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 2C9 6 6 9 6 13a6 6 0 0012 0c0-4-3-7-6-11z" stroke="var(--h5-forest)" strokeWidth="1.6" />
              </svg>
              Our Philosophy
            </div>
            <h2>Recovery looks different for everyone.</h2>
            <p>
              There's no one right path. Here, you can move forward at your own
              pace, with people who understand exactly where you're standing.
              Recovery With The Exit Drug cultivates acceptance, encourages
              healthy behaviors, and reduces stigma.
            </p>
          </div>
          <div className="h5-phil__leaf h5-reveal h5-in">
            <svg viewBox="0 0 200 200" fill="none">
              <path d="M100 180C100 180 60 140 60 90C60 50 100 20 100 20C100 20 140 50 140 90C140 140 100 180 100 180Z" stroke="var(--h5-sage)" strokeWidth="1.6" opacity="0.7" />
              <path d="M100 180V20" stroke="var(--h5-sage)" strokeWidth="1.2" opacity="0.5" />
              <path d="M100 50L78 65" stroke="var(--h5-sage)" strokeWidth="1" opacity="0.45" />
              <path d="M100 80L72 98" stroke="var(--h5-sage)" strokeWidth="1" opacity="0.45" />
              <path d="M100 110L78 128" stroke="var(--h5-sage)" strokeWidth="1" opacity="0.45" />
              <path d="M100 50L122 65" stroke="var(--h5-sage)" strokeWidth="1" opacity="0.45" />
              <path d="M100 80L128 98" stroke="var(--h5-sage)" strokeWidth="1" opacity="0.45" />
              <path d="M100 110L122 128" stroke="var(--h5-sage)" strokeWidth="1" opacity="0.45" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── WHAT YOU'LL FIND HERE ── */}
      <section className="h5-section h5-what" id="what">
        <div className="h5-inner">
          <div className={`h5-what__head h5-reveal ${whatVisible ? "h5-in" : ""}`} ref={whatRef}>
            <div className="h5-eyebrow">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="var(--h5-amber)" strokeWidth="1.6" />
              </svg>
              What you'll find here
            </div>
            <h2>Not a list of features.<br />A place to land.</h2>
          </div>
          <div className="h5-what__grid">
            {WHAT_YOU_FIND.map((item, i) => (
              <div
                className="h5-what__card h5-reveal h5-in"
                key={item.id}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                {item.id === "resources" && (
                  <Link to="/resources" className="h5-card-link">Browse resources →</Link>
                )}
                {item.id === "community" && (
                  <a href="/community" className="h5-card-link">See the community →</a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMUNITY ── */}
      <section className="h5-section h5-community" id="community">
        <div className="h5-inner h5-community__inner">
          <div className={`h5-community__text h5-reveal ${communityVisible ? "h5-in" : ""}`} ref={communityRef}>
            <div className="h5-eyebrow h5-eyebrow--light">
              A place where people understand.
            </div>
            <h2>Real conversations.<br />No performance required.</h2>
            <p>
              This isn't a support hotline or a forum full of strangers.
              It's a community of people who've tried the same path and
              want to walk it with others.
            </p>
            <button onClick={onRegister} className="h5-cta h5-cta--light">
              Join the community
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="h5-posts">
            {COMMUNITY_POSTS.map((post, i) => (
              <div
                className="h5-post h5-reveal h5-in"
                key={i}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <p className="h5-post__text">{post.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESOURCES ── */}
      <section className="h5-section h5-resources" id="resources">
        <div className="h5-inner">
          <div className={`h5-resources__head h5-reveal ${resourcesVisible ? "h5-in" : ""}`} ref={resourcesRef}>
            <div className="h5-eyebrow">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M4 19V5a2 2 0 012-2h9l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2z" stroke="var(--h5-forest)" strokeWidth="1.6" />
              </svg>
              Resources & Research
            </div>
            <h2>Knowledge. Options. Hope.</h2>
            <p>
              Articles, research, and practical tools for people making
              hard decisions about their recovery — without the judgment.
            </p>
          </div>
          <div className="h5-resources__grid">
            {[
              { title: "Education", desc: "Learn the history and science of cannabis-assisted recovery." },
              { title: "Cannabis info", desc: "What the plant actually does, without hype or stigma." },
              { title: "Support guides", desc: "Practical tools for the early days and the hard nights." },
              { title: "Events", desc: "Community gatherings, online and in person." },
            ].map((r) => (
              <Link to="/resources" className="h5-resource-card" key={r.title}>
                <div className="h5-resource-card__title">{r.title}</div>
                <div className="h5-resource-card__desc">{r.desc}</div>
                <div className="h5-resource-card__arrow">→</div>
              </Link>
            ))}
          </div>
          <Link to="/resources" className="h5-text-link">
            Browse all resources
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="h5-final-cta">
        <div className={`h5-final-cta__inner h5-reveal ${ctaVisible ? "h5-in" : ""}`} ref={ctaRef}>
          <h2>Recovery doesn't have to happen alone.</h2>
          <p>This is your space. We'll be here.</p>
          <button onClick={onRegister} className="h5-cta">
            Join the community
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </section>

      <footer className="h5-footer">
        Recovery With The Exit Drug — A peer-led community since 2013. Not a substitute for professional medical treatment.
      </footer>
    </div>
  );
}
