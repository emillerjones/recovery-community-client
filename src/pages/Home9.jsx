import { useEffect, useRef, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  ArrowRight,
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  Flame,
  HeartHandshake,
  MessageCircleHeart,
  NotebookPen,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import "./Home9.css";

const WALL_NOTES = [
  "Day 4. Dinner was hard, but I stayed.",
  "Can someone talk me through tonight?",
  "I read here for two weeks before I posted.",
  "Thirty days. Quietly proud.",
  "I slipped. I am still here.",
  "Someone replied when I needed it.",
  "What helped you sleep early on?",
  "I made it through the morning.",
  "Tonight I chose not to disappear.",
  "One year away from alcohol.",
];

const ORBIT_QUOTES = [
  "I came back.",
  "Still here.",
  "Need advice.",
  "One more day.",
  "You are not alone.",
  "Quietly proud.",
];

const PATHS = [
  {
    icon: MessageCircleHeart,
    title: "Post honestly",
    body:
      "Ask the question, say the hard thing, or let the room know what part of the day got heavy.",
  },
  {
    icon: HeartHandshake,
    title: "Answer gently",
    body:
      "A reply is not just content. It is someone adding warmth when another person is trying to stay.",
  },
  {
    icon: NotebookPen,
    title: "Mark progress",
    body:
      "Private milestones and reflection make the quiet wins visible enough to keep.",
  },
  {
    icon: BookOpenText,
    title: "Share what helped",
    body:
      "Resources, stories, and lived experience help people make choices without being shamed.",
  },
];

const STORIES = [
  {
    quote:
      "The first time someone answered me, it felt like the room got warmer.",
    name: "Adrienne",
    detail: "3 years free from opioids",
  },
  {
    quote:
      "I mostly read at first. It still helped. I did not feel outside anymore.",
    name: "Marcus",
    detail: "18 months alcohol-free",
  },
  {
    quote:
      "It was the first recovery space where I did not have to perform being okay.",
    name: "Dana",
    detail: "Cannabis-assisted recovery",
  },
  {
    quote:
      "I had stricter rooms. This one helped me stay accountable without disappearing.",
    name: "Priya",
    detail: "Free from alcohol",
  },
  {
    quote:
      "The difference was simple: people kept showing up when the night got loud.",
    name: "James",
    detail: "Joined 4 years ago",
  },
];

function useReveal(threshold = 0.14) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

function useScrollWarmth() {
  const [warmth, setWarmth] = useState(0);

  useEffect(() => {
    let frame = null;

    function update() {
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      setWarmth(Math.min(window.scrollY / max, 1));
      frame = null;
    }

    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return warmth;
}

function BulletinWall({ warmth }) {
  const litCount = Math.max(3, Math.round(3 + warmth * 7));

  return (
    <div className="h9-wall" aria-label="Community bulletin board">
      <div className="h9-wall__rail" />
      {WALL_NOTES.map((note, index) => (
        <article
          className={`h9-note h9-note--${index + 1} ${index < litCount ? "is-lit" : ""}`}
          key={note}
          style={{ "--delay": `${index * 110}ms` }}
        >
          {note}
        </article>
      ))}
      <div className="h9-wall__ember" style={{ "--warmth": warmth }}>
        <Flame size={22} />
        <span>{litCount} notes keeping it warm</span>
      </div>
    </div>
  );
}

function Orbit() {
  return (
    <div className="h9-orbit" aria-label="Story snippets orbiting recovery">
      <div className="h9-orbit__center">
        <Sparkles size={24} />
        <span>Recovery</span>
      </div>
      {ORBIT_QUOTES.map((quote, index) => (
        <span className={`h9-orbit__bubble h9-orbit__bubble--${index + 1}`} key={quote}>
          {quote}
        </span>
      ))}
    </div>
  );
}

function StoryReel() {
  const reelRef = useRef(null);
  const [leftEnabled, setLeftEnabled] = useState(false);
  const [rightEnabled, setRightEnabled] = useState(true);

  function updateControls() {
    const reel = reelRef.current;
    if (!reel) return;
    setLeftEnabled(reel.scrollLeft > 8);
    setRightEnabled(reel.scrollLeft < reel.scrollWidth - reel.clientWidth - 8);
  }

  function move(direction) {
    const reel = reelRef.current;
    if (!reel) return;
    reel.scrollBy({
      left: direction * Math.min(390, reel.clientWidth * 0.86),
      behavior: "smooth",
    });
  }

  useEffect(() => {
    updateControls();
    window.addEventListener("resize", updateControls);
    return () => window.removeEventListener("resize", updateControls);
  }, []);

  return (
    <div className="h9-reel">
      <div className="h9-reel__track" ref={reelRef} onScroll={updateControls}>
        {STORIES.map((story) => (
          <article className="h9-story" key={`${story.name}-${story.detail}`}>
            <p>"{story.quote}"</p>
            <div>
              <strong>{story.name}</strong>
              <span>{story.detail}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="h9-reel__controls">
        <button type="button" onClick={() => move(-1)} disabled={!leftEnabled} aria-label="Previous stories">
          <ChevronLeft size={18} />
        </button>
        <button type="button" onClick={() => move(1)} disabled={!rightEnabled} aria-label="Next stories">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default function Home9() {
  const { onRegister, onLogin } = useOutletContext();
  const warmth = useScrollWarmth();
  const [pathsRef, pathsVisible] = useReveal(0.08);
  const [orbitRef, orbitVisible] = useReveal();
  const [storiesRef, storiesVisible] = useReveal();
  const [finalRef, finalVisible] = useReveal(0.25);

  return (
    <main className="h9" style={{ "--warmth": warmth }}>
      <section className="h9-hero" aria-label="Recovery With The Exit Drug introduction">
        <div className="h9-hero__wash" />
        <div className="h9-hero__smoke h9-hero__smoke--one" />
        <div className="h9-hero__smoke h9-hero__smoke--two" />

        <div className="h9-hero__shell">
          <div className="h9-hero__copy">
            <p className="h9-kicker">Recovery With The Exit Drug</p>
            <h1>The room gets warmer when people show up.</h1>
            <p>
              A peer-led recovery community for people exploring cannabis as a path away
              from alcohol, opioids, and other harmful substances.
            </p>
            <div className="h9-hero__actions">
              <button type="button" className="h9-primary" onClick={onRegister}>
                Add your note
                <ArrowRight size={17} />
              </button>
              <button type="button" className="h9-login" onClick={onLogin}>
                Already a member? Log in
              </button>
            </div>
          </div>

          <BulletinWall warmth={warmth} />
        </div>

        <div className="h9-scroll-mark">
          <span />
          <em>Scroll to warm the room</em>
        </div>
      </section>

      <section className="h9-story-scroll">
        <div className="h9-story-scroll__sticky">
          <div>
            <p className="h9-eyebrow">Scroll-driven story</p>
            <h2>Every new signal makes the page feel less alone.</h2>
          </div>
          <div className="h9-warmth-meter" aria-label="Room warmth meter">
            <span />
          </div>
        </div>
      </section>

      <section className="h9-paths" ref={pathsRef}>
        <div className="h9-paths__head">
          <p className="h9-eyebrow">How people keep it alive</p>
          <h2>The metaphor only works if the actions feel real.</h2>
        </div>

        <div className="h9-path-rail">
          {PATHS.map((path, index) => {
            const Icon = path.icon;
            return (
              <article
                className={`h9-path h9-reveal ${pathsVisible ? "is-visible" : ""}`}
                style={{ transitionDelay: `${index * 80}ms` }}
                key={path.title}
              >
                <Icon size={23} />
                <h3>{path.title}</h3>
                <p>{path.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="h9-orbit-section" ref={orbitRef}>
        <div className={`h9-orbit-section__copy h9-reveal ${orbitVisible ? "is-visible" : ""}`}>
          <p className="h9-eyebrow h9-eyebrow--light">Stories in motion</p>
          <h2>Recovery stays central. The stories keep moving around it.</h2>
          <p>
            This is the version that should feel memorable: not a list of features,
            but a living room of voices circling the same shared reason to continue.
          </p>
          <Link to="/stories" className="h9-secondary h9-secondary--light">
            Read stories first
          </Link>
        </div>
        <Orbit />
      </section>

      <section className="h9-stories" ref={storiesRef}>
        <div className={`h9-stories__head h9-reveal ${storiesVisible ? "is-visible" : ""}`}>
          <p className="h9-eyebrow">Member stories</p>
          <h2>The horizontal pause should feel like sitting with people.</h2>
        </div>
        <StoryReel />
      </section>

      <section className="h9-final">
        <div ref={finalRef} className={`h9-final__inner h9-reveal ${finalVisible ? "is-visible" : ""}`}>
          <ShieldCheck size={26} />
          <p className="h9-eyebrow">Whenever you are ready</p>
          <h2>Come in quietly. Help keep it warm.</h2>
          <p>
            Read for a while, add one honest note, reply to someone who needs it, or
            let the room remind you that recovery does not have to happen alone.
          </p>
          <div className="h9-final__actions">
            <button type="button" className="h9-primary h9-primary--dark" onClick={onRegister}>
              Join the community
              <ArrowRight size={17} />
            </button>
            <button type="button" className="h9-secondary" onClick={onLogin}>
              Log in
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
