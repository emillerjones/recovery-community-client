import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import "./Community.css";

const SNAPSHOTS = [
  { text: "Today is six months. I didn't think I'd make it past six days." },
  { text: "I had a rough week but didn't go back. That's new for me." },
  { text: "Does anyone have experience with high-CBD strains for anxiety? Looking for guidance." },
  { text: "One year. I came here broken. I'm still here." },
  { text: "First time posting. I don't know where else to say this but I think it's working." },
  { text: "Mornings are still hard. But they're getting shorter." },
];

const CHANNELS = [
  { name: "First steps", desc: "For people just starting out. No judgment, no pressure." },
  { name: "Alcohol recovery", desc: "Conversations specific to leaving alcohol behind." },
  { name: "Opioid recovery", desc: "Support for people navigating opioid recovery." },
  { name: "Cannabis info", desc: "Questions, research, and real talk about the plant." },
  { name: "Milestones", desc: "A place to mark the days that matter." },
  { name: "Hard nights", desc: "For when you need someone at 2am." },
  { name: "Research & resources", desc: "Links, studies, and tools the community has found useful." },
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

export default function Community() {
  const { onRegister } = useOutletContext();
  const [introRef, introVisible] = useReveal(0.1);
  const [snapshotsRef, snapshotsVisible] = useReveal(0.1);
  const [channelsRef, channelsVisible] = useReveal(0.1);
  const [ctaRef, ctaVisible] = useReveal(0.3);

  return (
    <div className="comm page--flat">

      {/* ── INTRO ── */}
      <section className="comm-section comm-intro">
        <div className="comm-inner">
          <div
            className={`comm-intro__text comm-reveal ${introVisible ? "comm-in" : ""}`}
            ref={introRef}
          >
            <div className="comm-eyebrow">The community</div>
            <h1>A place people actually use.</h1>
            <p className="comm-intro__lead">
              Not a hotline. Not a chatbot. Not a forum full of strangers
              who don't get it. A peer-led community of people who've chosen
              the same path and want to walk it with others.
            </p>
            <p className="comm-intro__body">
              Recovery With The Exit Drug has been running since 2013. The
              community is the core of it — always has been. People come
              here when they have nowhere else to say the things they need
              to say.
            </p>
          </div>
        </div>
      </section>

      {/* ── SNAPSHOTS ── */}
      <section className="comm-section comm-snapshots">
        <div className="comm-inner">
          <div
            className={`comm-snapshots__head comm-reveal ${snapshotsVisible ? "comm-in" : ""}`}
            ref={snapshotsRef}
          >
            <div className="comm-eyebrow">What it sounds like</div>
            <h2>The kind of thing people actually say here.</h2>
            <p>These aren't testimonials. They're the kinds of posts you'll find on any given day.</p>
          </div>
          <div className="comm-snapshots__grid">
            {SNAPSHOTS.map((s, i) => (
              <div
                className="comm-snapshot comm-reveal comm-in"
                key={i}
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <p>"{s.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHANNELS ── */}
      <section className="comm-section comm-channels">
        <div className="comm-inner">
          <div
            className={`comm-channels__head comm-reveal ${channelsVisible ? "comm-in" : ""}`}
            ref={channelsRef}
          >
            <div className="comm-eyebrow">Where conversations happen</div>
            <h2>Organized around what you're actually going through.</h2>
          </div>
          <div className="comm-channels__list">
            {CHANNELS.map((ch, i) => (
              <div
                className="comm-channel comm-reveal comm-in"
                key={ch.name}
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <div className="comm-channel__name">{ch.name}</div>
                <div className="comm-channel__desc">{ch.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO'S HERE ── */}
      <section className="comm-section comm-who">
        <div className="comm-inner">
          <div className="comm-eyebrow">Who's here</div>
          <h2>Peers. Not professionals.</h2>
          <p>
            Everyone in this community is here because they've been where
            you are, or they're still in it. There are no counselors
            running the show, no algorithms deciding what you see. Just
            people being honest with each other.
          </p>
          <p>
            It's free. It's peer-led. It has been since 2013.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="comm-cta-section">
        <div
          className={`comm-inner comm-cta__inner comm-reveal ${ctaVisible ? "comm-in" : ""}`}
          ref={ctaRef}
        >
          <h2>Ready to be part of it?</h2>
          <p>Joining is free. Always has been.</p>
          <button onClick={onRegister} className="comm-cta-btn">
            Join the community
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </section>

      <footer className="comm-footer">
        Recovery With The Exit Drug — A peer-led community since 2013. Not a substitute for professional medical treatment.
      </footer>
    </div>
  );
}
