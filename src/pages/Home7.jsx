import { useEffect, useRef, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  ArrowRight,
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  MessageCircleHeart,
  NotebookPen,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import "./Home7.css";

const QUIET_NOTES = [
  "Day 4. Dinner was hard, but I stayed.",
  "Can someone talk me through tonight?",
  "I don't know if this counts, but I came back.",
  "Thirty days. Quietly proud.",
  "I need a place where I can be honest.",
  "What helped you sleep early on?",
  "I read here for two weeks before I posted.",
  "Today I chose not to disappear.",
  "I slipped. I am still here.",
  "One year away from alcohol.",
  "Does anyone else feel nervous starting over?",
  "I made it through the morning.",
];

const PATHS = [
  {
    icon: MessageCircleHeart,
    title: "Find people who understand",
    body:
      "Ask questions, share the hard part, or sit with people who know what this stretch can feel like.",
  },
  {
    icon: NotebookPen,
    title: "Keep private track",
    body:
      "Milestones, reflection, and the small proof that you kept choosing the next day.",
  },
  {
    icon: BookOpenText,
    title: "Learn without shame",
    body:
      "Resources about cannabis-assisted recovery, harm reduction, and rebuilding stability.",
  },
  {
    icon: ShieldCheck,
    title: "Stay in a safer room",
    body:
      "Peer-led support with culture, boundaries, and a tone that puts care before performance.",
  },
];

const STORIES = [
  {
    quote:
      "I did not need someone to sell me hope. I needed a place calm enough to tell the truth.",
    name: "Adrienne",
    detail: "3 years free from opioids",
  },
  {
    quote:
      "The first week I mostly read. That still counted. I was here, and I was trying.",
    name: "Marcus",
    detail: "18 months alcohol-free",
  },
  {
    quote:
      "No one treated my recovery like a performance. They helped me keep choosing the next day.",
    name: "Dana",
    detail: "Cannabis-assisted recovery",
  },
  {
    quote:
      "I came in skeptical. What changed me was how normal everyone made honesty feel.",
    name: "Priya",
    detail: "Free from alcohol",
  },
  {
    quote:
      "I had stricter rooms. This was the first one where I could breathe and still be accountable.",
    name: "James",
    detail: "Joined 4 years ago",
  },
];

function useReveal(threshold = 0.16) {
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

function NoteField() {
  return (
    <div className="h7-note-field" aria-label="Anonymous community notes">
      {QUIET_NOTES.map((note, index) => (
        <div className={`h7-note h7-note--${index + 1}`} key={note}>
          {note}
        </div>
      ))}
      <div className="h7-note-field__center">
        <Sparkles size={21} />
        <span>Quiet room</span>
      </div>
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
    <div className="h7-reel">
      <div className="h7-reel__track" ref={reelRef} onScroll={updateControls}>
        {STORIES.map((story) => (
          <article className="h7-story" key={`${story.name}-${story.detail}`}>
            <p>"{story.quote}"</p>
            <div>
              <strong>{story.name}</strong>
              <span>{story.detail}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="h7-reel__controls">
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

export default function Home7() {
  const { onRegister, onLogin } = useOutletContext();
  const [pathsRef, pathsVisible] = useReveal(0.1);
  const [roomRef, roomVisible] = useReveal();
  const [storiesRef, storiesVisible] = useReveal();
  const [finalRef, finalVisible] = useReveal(0.24);

  return (
    <main className="h7">
      <section className="h7-quiet-hero" aria-label="Recovery With The Exit Drug introduction">
        <div className="h7-quiet-hero__glow" />
        <div className="h7-quiet-hero__grain" />
        <NoteField />

        <div className="h7-hero-copy">
          <p className="h7-kicker">Recovery With The Exit Drug</p>
          <h1>You can start quietly.</h1>
          <p>
            A peer-led recovery community for people exploring cannabis as a path away
            from alcohol, opioids, and other harmful substances.
          </p>
          <div className="h7-hero-actions">
            <button type="button" className="h7-primary" onClick={onRegister}>
              Find your people
              <ArrowRight size={17} />
            </button>
            <button type="button" className="h7-login" onClick={onLogin}>
              Already a member? Log in
            </button>
          </div>
        </div>

        <div className="h7-scroll-mark">
          <span />
          <em>Scroll</em>
        </div>
      </section>

      <section className="h7-room" ref={roomRef}>
        <div className={`h7-room__inner h7-reveal ${roomVisible ? "is-visible" : ""}`}>
          <p className="h7-eyebrow">The quiet room</p>
          <h2>Not a pitch. A place to exhale.</h2>
          <p>
            The first screen is intentionally not a billboard. It is a room full of
            small honest signals: people arriving, trying again, asking for help, and
            marking progress that might be invisible anywhere else.
          </p>
        </div>
      </section>

      <section className="h7-paths" ref={pathsRef}>
        <div className="h7-paths__head">
          <p className="h7-eyebrow">What lives here</p>
          <h2>Four ways to begin without having to explain everything.</h2>
        </div>

        <div className="h7-path-rail" aria-label="Community support paths">
          {PATHS.map((path, index) => {
            const Icon = path.icon;
            return (
              <article
                className={`h7-path h7-reveal ${pathsVisible ? "is-visible" : ""}`}
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

      <section className="h7-stories" ref={storiesRef}>
        <div className={`h7-stories__head h7-reveal ${storiesVisible ? "is-visible" : ""}`}>
          <p className="h7-eyebrow">Member stories</p>
          <h2>The part people remember is how it felt to be understood.</h2>
        </div>
        <StoryReel />
      </section>

      <section className="h7-split">
        <div className="h7-split__copy">
          <p className="h7-eyebrow h7-eyebrow--light">Peer-led since 2013</p>
          <h2>Care before performance. Honesty before perfection.</h2>
          <p>
            This community should feel useful before it feels impressive: a safer place
            to read, post, learn, reflect, and find people who understand the version of
            recovery you are actually living.
          </p>
          <div className="h7-split__actions">
            <button type="button" className="h7-primary h7-primary--pale" onClick={onRegister}>
              Join the community
              <ArrowRight size={17} />
            </button>
            <Link to="/stories" className="h7-secondary h7-secondary--light">
              Read stories first
            </Link>
          </div>
        </div>

        <div className="h7-phone-preview" aria-label="Mobile community preview">
          <div className="h7-phone-preview__bar" />
          <div className="h7-phone-note">I read here for two weeks before I posted.</div>
          <div className="h7-phone-note">Day 30. Quietly proud.</div>
          <div className="h7-phone-note">Can someone talk me through tonight?</div>
          <div className="h7-phone-preview__reply">You are not the only one awake.</div>
        </div>
      </section>

      <section className="h7-final">
        <div ref={finalRef} className={`h7-final__inner h7-reveal ${finalVisible ? "is-visible" : ""}`}>
          <p className="h7-eyebrow">Whenever you are ready</p>
          <h2>Come in quietly. Stay as long as you need.</h2>
          <p>
            Make an account, read for a while, ask one question, or simply remember
            that a place like this exists.
          </p>
          <div className="h7-final__actions">
            <button type="button" className="h7-primary h7-primary--dark" onClick={onRegister}>
              Find your people
              <ArrowRight size={17} />
            </button>
            <button type="button" className="h7-secondary" onClick={onLogin}>
              Log in
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
