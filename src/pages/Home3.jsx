import { useEffect, useRef, useState } from "react";
import heroPhoto from "../assets/images/hero-lake.jpg";
import "./Home3.css";
import { Link, useOutletContext } from "react-router-dom";

const COMMUNITY_POSTS = [
  {
    name: "Maya",
    time: "3m ago",
    tag: "First Week",
    text: "Day seven. I still feel shaky, but I do not feel alone anymore.",
    stat: "18 hearts",
  },
  {
    name: "Andre",
    time: "8m ago",
    tag: "Need Advice",
    text: "Cravings are loud tonight. What helped you get through the first month?",
    stat: "9 replies",
  },
  {
    name: "Sam",
    time: "14m ago",
    tag: "Milestone",
    text: "Six months away from opioids. I never thought I would type that sentence.",
    stat: "42 hearts",
  },
];

const PATH_CARDS = [
  {
    number: "01",
    title: "Learn without shame",
    text: "Plain-language resources about cannabis substitution, recovery, harm reduction, and rebuilding stability.",
  },
  {
    number: "02",
    title: "Find people who get it",
    text: "A community feed built around questions, encouragement, milestones, and honest lived experience.",
  },
  {
    number: "03",
    title: "Track your own progress",
    text: "Private journaling and milestones for the days you want to remember — and the hard ones you survived.",
  },
];

const CHANNELS = ["New Members", "Alcohol Recovery", "Opioid Recovery", "Chronic Pain", "Veterans", "Research", "Success Stories"];

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
      { threshold: 0.18 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

function LeafMark() {
  return (
    <svg className="home3-leaf-mark" viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <path
        d="M36 64C36 64 17 46 17 27C17 13 36 5 36 5C36 5 55 13 55 27C55 46 36 64 36 64Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M36 64V12" stroke="currentColor" strokeWidth="1.6" opacity="0.65" />
      <path d="M36 28L24 36" stroke="currentColor" strokeWidth="1.4" opacity="0.55" />
      <path d="M36 40L25 48" stroke="currentColor" strokeWidth="1.4" opacity="0.55" />
      <path d="M36 28L48 36" stroke="currentColor" strokeWidth="1.4" opacity="0.55" />
      <path d="M36 40L47 48" stroke="currentColor" strokeWidth="1.4" opacity="0.55" />
    </svg>
  );
}

export default function Home3() {
  const [pathRef, pathVisible] = useReveal();
  const [communityRef, communityVisible] = useReveal();
  const [journalRef, journalVisible] = useReveal();
  const [resourcesRef, resourcesVisible] = useReveal();
  const { onRegister } = useOutletContext();

  return (
    <main className="home3">
      <section className="home3-hero">
        <div className="home3-hero__photo" style={{ backgroundImage: `url(${heroPhoto})` }} />
        <div className="home3-hero__wash" />
        <div className="home3-hero__grain" />

        <div className="home3-hero__shell">
          <div className="home3-hero__copy">
            <div className="home3-kicker">
              <span className="home3-kicker__line" />
              Recovery With The Exit Drug
            </div>

            <h1>A quieter way back.</h1>

            <p>
              A peer-led recovery community for people exploring cannabis as a path away
              from alcohol, opioids, and other harmful substances.
            </p>

            <div className="home3-actions">
              <button onClick={onRegister} className="home3-cta">
                Join the community
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>    
              <a className="home3-button home3-button--ghost" href="#path">
                Learn the approach
              </a>
            </div>
          </div>

          <aside className="home3-hero-card" aria-label="Community preview">
            <div className="home3-hero-card__top">
              <span className="home3-live-dot" />
              14 people here now
            </div>
            <div className="home3-quote-mark">“</div>
            <p>
              I came here thinking I was the only one trying this. Turns out I just
              needed people who understood the road.
            </p>
            <div className="home3-hero-card__foot">
              <span>Member story</span>
              <span>2 min read</span>
            </div>
          </aside>
        </div>

        <div className="home3-scroll-note">Scroll</div>
      </section>

      <section className="home3-belief" id="path">
        <div className={`home3-reveal ${pathVisible ? "is-visible" : ""}`} ref={pathRef}>
          <div className="home3-section-label">The approach</div>
          <h2>Not a slogan. A support system.</h2>
          <p>
            The site should do more than explain the mission. It should give people a
            place to land, learn, talk, track progress, and feel less alone.
          </p>
        </div>

        <div className="home3-path-grid">
          {PATH_CARDS.map((card) => (
            <article className="home3-path-card" key={card.title}>
              <span>{card.number}</span>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home3-community" id="community">
        <div className="home3-community__inner">
          <div className={`home3-community__copy home3-reveal ${communityVisible ? "is-visible" : ""}`} ref={communityRef}>
            <div className="home3-section-label">Live community</div>
            <h2>The community becomes the destination.</h2>
            <p>
              Posts, questions, victories, hard nights, research, and real-time support —
              all organized around recovery instead of hidden inside a social feed.
            </p>

            <div className="home3-channel-cloud">
              {CHANNELS.map((channel) => (
                <span key={channel}>{channel}</span>
              ))}
            </div>
          </div>

          <div className="home3-feed-stack">
            {COMMUNITY_POSTS.map((post, index) => (
              <article className="home3-post" key={post.text} style={{ "--delay": `${index * 120}ms` }}>
                <div className="home3-post__avatar">{post.name[0]}</div>
                <div>
                  <div className="home3-post__meta">
                    <strong>{post.name}</strong>
                    <span>{post.time}</span>
                    <em>{post.tag}</em>
                  </div>
                  <p>{post.text}</p>
                  <small>{post.stat}</small>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home3-journal">
        <div className={`home3-journal__panel home3-reveal ${journalVisible ? "is-visible" : ""}`} ref={journalRef}>
          <div className="home3-journal__art">
            <LeafMark />
            <div className="home3-calendar-card">
              <span>Today</span>
              <strong>Day 30</strong>
              <p>Still here. Still moving.</p>
            </div>
          </div>

          <div className="home3-journal__copy">
            <div className="home3-section-label">Private progress</div>
            <h2>A journal for the parts you are not ready to post.</h2>
            <p>
              Some recovery moments belong to the community. Some belong only to you.
              Home3 treats journaling and milestones as a private, gentle feature stack.
            </p>
          </div>
        </div>
      </section>

      <section className="home3-resources" ref={resourcesRef}>
        <div className={`home3-resources__inner home3-reveal ${resourcesVisible ? "is-visible" : ""}`}>
          <div>
            <div className="home3-section-label">Resources</div>
            <h2>Clear information when the night gets loud.</h2>
          </div>

          <div className="home3-resource-list">
            <a href="#">Cannabis substitution basics</a>
            <a href="#">Alcohol recovery stories</a>
            <a href="#">Opioid recovery support</a>
            <a href="#">Research and education</a>
          </div>
        </div>
      </section>

      <section className="home3-final">
        <LeafMark />
        <h2>Come as you are.</h2>
        <p>You do not need a perfect plan to take the next step.</p>
        <button onClick={onRegister} className="home3-cta">
          Join the community
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>   
      </section>
    </main>
  );
}
