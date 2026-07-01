import { useEffect, useRef, useState } from "react";
import heroPhoto from "../assets/images/hero-lake.jpg";
import "./Home.css";

const FEED_MESSAGES = [
  {
    name: "Jess",
    time: "2m ago",
    badge: null,
    text: "Today I'm 30 days sober from alcohol. Feeling more like myself every day.",
    reactions: "❤ 12",
    color: "#C97B5E",
  },
  {
    name: "Mike",
    time: "5m ago",
    badge: "Need Advice",
    text: "Struggling with cravings tonight. Could use some support.",
    reactions: "💬 8",
    color: "#5E83A8",
  },
  {
    name: "Priya",
    time: "9m ago",
    badge: "Milestone",
    text: "One year alcohol-free today. Cannabis helped me rebuild a life I didn't think was possible.",
    reactions: "❤ 48 · 💬 12",
    color: "#7B6CA8",
  },
  {
    name: "Tom",
    time: "just now",
    badge: null,
    text: "Welcome to the newest member who joined us today 👋 glad you're here.",
    reactions: "❤ 6",
    color: "#5E8C6A",
  },
];

const RESOURCE_ITEMS = [
  { title: "Education", desc: "Learn and explore" },
  { title: "Cannabis Info", desc: "Understand the plant" },
  { title: "Support Guides", desc: "Tools for healing" },
  { title: "Events", desc: "Local & online" },
];

function initials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
}

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

function LiveFeed() {
  const [visibleMessages, setVisibleMessages] = useState(FEED_MESSAGES.slice(0, 3));
  const [typingName, setTypingName] = useState(null);
  const [active, setActive] = useState(false);
  const panelRef = useRef(null);
  const idxRef = useRef(3);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;

    function cycle() {
      const next = FEED_MESSAGES[idxRef.current % FEED_MESSAGES.length];
      setTypingName(next.name);

      const typingTimeout = setTimeout(() => {
        setTypingName(null);
        setVisibleMessages((prev) => {
          const updated = [...prev, next];
          return updated.length > 4 ? updated.slice(updated.length - 4) : updated;
        });
        idxRef.current += 1;
      }, 1800);

      return typingTimeout;
    }

    const interval = setInterval(cycle, 5000);
    const firstRun = cycle();

    return () => {
      clearInterval(interval);
      clearTimeout(firstRun);
    };
  }, [active]);

  return (
    <div className="cl-panel reveal in" ref={panelRef}>
      <div className="cl-panel-header">
        <span>Community Feed</span>
        <span className="cl-live-label">
          <span className="dot-live dot-live--small" />
          Live
        </span>
      </div>

      <div className="cl-feed">
        {visibleMessages.map((msg, i) => (
          <div className="cl-msg" key={`${msg.name}-${i}-${msg.text.slice(0, 6)}`}>
            <div className="cl-avatar" style={{ background: msg.color }}>
              {initials(msg.name)}
            </div>
            <div className="cl-msg-body">
              <div className="cl-msg-top">
                <span className="cl-name">{msg.name}</span>
                <span className="cl-time">{msg.time}</span>
                {msg.badge && (
                  <span
                    className={`cl-badge ${msg.badge === "Milestone" ? "milestone" : ""}`}
                  >
                    {msg.badge}
                  </span>
                )}
              </div>
              <div className="cl-msg-text">{msg.text}</div>
              <div className="cl-reactions">{msg.reactions}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="typing-row" style={{ display: typingName ? "flex" : "none" }}>
        <div className="typing-dots">
          <span /> <span /> <span />
        </div>
        <span>{typingName} is typing…</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [philRef, philVisible] = useReveal();
  const [storyRef, storyVisible] = useReveal();
  const [communityTextRef, communityTextVisible] = useReveal();
  const [resourcesRef, resourcesVisible] = useReveal();

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-photo" style={{ backgroundImage: `url(${heroPhoto})` }} />
        <div className="hero-overlay" />
        <div className="mist mist-1" />
        <div className="mist mist-2" />
        <div className="mist mist-3" />

        <div className="hero-content">
          <h1>You're not alone.</h1>
          <p>
            A safe, welcoming community for people exploring cannabis as a path to
            freedom from alcohol, opioids, and other harmful substances.
          </p>
          <a href="#community" className="hero-cta">
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
        </div>

        <div className="scroll-cue">
          Scroll to explore
          <span className="chev" />
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="philosophy section" id="philosophy">
        <div className="section-inner">
          <div className={`phil-text reveal ${philVisible ? "in" : ""}`} ref={philRef}>
            <div className="eyebrow">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C9 6 6 9 6 13a6 6 0 0012 0c0-4-3-7-6-11z"
                  stroke="var(--forest)"
                  strokeWidth="1.6"
                />
              </svg>
              Our Philosophy
            </div>
            <h2>Recovery looks different for everyone.</h2>
            <p>
              There's no one right path. Here, you can move forward at your own pace,
              with people who understand exactly where you're standing.
            </p>
          </div>
          <div className="phil-leaf reveal in">
            <svg viewBox="0 0 200 200" fill="none">
              <path
                d="M100 180C100 180 60 140 60 90C60 50 100 20 100 20C100 20 140 50 140 90C140 140 100 180 100 180Z"
                stroke="var(--sage)"
                strokeWidth="1.6"
                opacity="0.7"
              />
              <path d="M100 180V20" stroke="var(--sage)" strokeWidth="1.2" opacity="0.5" />
              <path d="M100 50L78 65" stroke="var(--sage)" strokeWidth="1" opacity="0.45" />
              <path d="M100 80L72 98" stroke="var(--sage)" strokeWidth="1" opacity="0.45" />
              <path d="M100 110L78 128" stroke="var(--sage)" strokeWidth="1" opacity="0.45" />
              <path d="M100 50L122 65" stroke="var(--sage)" strokeWidth="1" opacity="0.45" />
              <path d="M100 80L128 98" stroke="var(--sage)" strokeWidth="1" opacity="0.45" />
              <path d="M100 110L122 128" stroke="var(--sage)" strokeWidth="1" opacity="0.45" />
            </svg>
          </div>
        </div>
      </section>

      {/* STORIES */}
      <section className="stories section" id="stories">
        <div className="section-inner">
          <div className="story-art reveal in">
            <svg className="story-figure" viewBox="0 0 100 130" fill="none">
              <ellipse cx="50" cy="118" rx="22" ry="6" fill="#1B231C" opacity="0.3" />
              <path
                d="M30 130V90C30 75 38 64 50 64C62 64 70 75 70 90V130"
                fill="#3A4A3C"
              />
              <circle cx="50" cy="48" r="14" fill="#5A6B5C" />
              <path d="M40 50C40 40 60 40 60 50" stroke="#2B3830" strokeWidth="2" />
            </svg>
          </div>
          <div className={`story-text reveal ${storyVisible ? "in" : ""}`} ref={storyRef}>
            <div className="eyebrow">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="var(--amber)" strokeWidth="1.6" />
              </svg>
              Real Stories
            </div>
            <h2>Real people. Real journeys.</h2>
            <p>
              Read honest stories from people who've been there. Find hope, strength,
              and reminders that change is possible — one day at a time.
            </p>
            <a href="#" className="story-link">
              Read Stories
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* COMMUNITY LIVE */}
      <section className="community-live section" id="community">
        <div className="section-inner">
          <div
            className={`cl-text reveal ${communityTextVisible ? "in" : ""}`}
            ref={communityTextRef}
          >
            <div className="status-pill">
              <span className="dot-live" />
              14 people online
            </div>
            <h2 style={{ marginTop: 22 }}>A place to connect, share, and grow.</h2>
            <p>
              Ask questions. Get support. Celebrate wins. This is where the community
              actually lives — real conversations, happening right now.
            </p>
            <a href="#" className="hero-cta hero-cta--static hero-cta--light">
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
          </div>

          <LiveFeed />
        </div>
      </section>

      {/* RESOURCES & RESEARCH */}
      <section className="resources section" id="resources">
        <div className="section-inner resources-inner">
          <div
            className={`resources-text reveal ${resourcesVisible ? "in" : ""}`}
            ref={resourcesRef}
          >
            <div className="eyebrow">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 19V5a2 2 0 012-2h9l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2z"
                  stroke="var(--forest)"
                  strokeWidth="1.6"
                />
              </svg>
              Resources & Research
            </div>
            <h2>Knowledge. Options. Hope.</h2>
          </div>

          <div className="resources-grid">
            {RESOURCE_ITEMS.map((item) => (
              <div className="resource-card" key={item.title}>
                <div className="resource-icon" />
                <div className="resource-title">{item.title}</div>
                <div className="resource-desc">{item.desc}</div>
              </div>
            ))}
          </div>

          <a href="#" className="story-link resources-link">
            Browse Resources
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <h2>Whenever you're ready.</h2>
        <p>This is your space. We'll be here.</p>
        <a href="#" className="hero-cta hero-cta--static">
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

      <footer className="home-footer">
        Recovery With The Exit Drug — A peer-led community. Not a substitute for
        professional medical treatment.
      </footer>
    </div>
  );
}
