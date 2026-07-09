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
import "./Home8.css";

const EMBER_NOTES = [
  "Day 3. I needed somewhere to say this.",
  "You can get through the next hour.",
  "I slipped, but I came back.",
  "One month today. I am still here.",
  "Does anyone else dread evenings?",
  "I read quietly before I posted.",
  "Tonight I chose not to disappear.",
  "Someone answered when I needed it.",
];

const KINDLING = [
  "A reply",
  "A story",
  "A resource",
  "A check-in",
  "A milestone",
  "A second try",
];

const PATHS = [
  {
    icon: MessageCircleHeart,
    title: "Answer the post",
    body:
      "Support can be small. A reply, a sentence, a simple 'I have been there' can keep someone connected.",
  },
  {
    icon: NotebookPen,
    title: "Mark the day",
    body:
      "Private progress tools help people notice the days they stayed, even when the win feels quiet.",
  },
  {
    icon: BookOpenText,
    title: "Share what helped",
    body:
      "Resources and lived experience sit side by side, so people can learn without being shamed.",
  },
  {
    icon: HeartHandshake,
    title: "Keep the room warm",
    body:
      "The culture is the product: steady, honest, peer-led, and built around people coming back.",
  },
];

const STORIES = [
  {
    quote:
      "I did not need a perfect plan. I needed one place that stayed warm while I figured out the next day.",
    name: "Adrienne",
    detail: "3 years free from opioids",
  },
  {
    quote:
      "The first time someone replied to me here, I cried. It was not dramatic. It was just enough.",
    name: "Marcus",
    detail: "18 months alcohol-free",
  },
  {
    quote:
      "I had been trying alone for years. The difference was having people help me keep the spark alive.",
    name: "Dana",
    detail: "Cannabis-assisted recovery",
  },
  {
    quote:
      "I came in quietly. I stayed because no one made me perform my recovery for approval.",
    name: "Priya",
    detail: "Free from alcohol",
  },
  {
    quote:
      "This place gave me a way to be accountable without feeling erased.",
    name: "James",
    detail: "Joined 4 years ago",
  },
];

function useReveal(threshold = 0.15) {
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

function FirekeeperDemo() {
  const [count, setCount] = useState(3);

  function addKindling() {
    setCount((current) => (current >= KINDLING.length ? 1 : current + 1));
  }

  return (
    <div className="h8-firekeeper" aria-label="Interactive bonfire metaphor">
      <div className="h8-firekeeper__scene">
        <div className="h8-firekeeper__halo" />
        <div className="h8-firekeeper__fire">
          <div className="h8-css-fire" aria-hidden="true">
            <span className="h8-css-fire__flame h8-css-fire__flame--one" />
            <span className="h8-css-fire__flame h8-css-fire__flame--two" />
            <span className="h8-css-fire__flame h8-css-fire__flame--three" />
            <span className="h8-css-fire__core" />
            <span className="h8-css-fire__log h8-css-fire__log--one" />
            <span className="h8-css-fire__log h8-css-fire__log--two" />
          </div>
          <span className="h8-spark h8-spark--1" />
          <span className="h8-spark h8-spark--2" />
          <span className="h8-spark h8-spark--3" />
          <span className="h8-spark h8-spark--4" />
        </div>

        {KINDLING.slice(0, count).map((item, index) => (
          <div className={`h8-kindling h8-kindling--${index + 1}`} key={`${item}-${index}`}>
            <span>{item}</span>
          </div>
        ))}
      </div>

      <button type="button" className="h8-add-log" onClick={addKindling}>
        <Flame size={17} />
        Add a log
      </button>
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
    <div className="h8-reel">
      <div className="h8-reel__track" ref={reelRef} onScroll={updateControls}>
        {STORIES.map((story) => (
          <article className="h8-story" key={`${story.name}-${story.detail}`}>
            <p>"{story.quote}"</p>
            <div>
              <strong>{story.name}</strong>
              <span>{story.detail}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="h8-reel__controls">
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

export default function Home8() {
  const { onRegister, onLogin } = useOutletContext();
  const [ritualRef, ritualVisible] = useReveal();
  const [pathsRef, pathsVisible] = useReveal(0.1);
  const [storiesRef, storiesVisible] = useReveal();
  const [finalRef, finalVisible] = useReveal(0.25);

  return (
    <main className="h8">
      <section className="h8-hero" aria-label="Recovery With The Exit Drug introduction">
        <div className="h8-hero__aurora" />
        <div className="h8-hero__embers" />
        <div className="h8-hero__smoke h8-hero__smoke--one" />
        <div className="h8-hero__smoke h8-hero__smoke--two" />

        <div className="h8-hero__shell">
          <div className="h8-hero__copy">
            <p className="h8-kicker">Recovery With The Exit Drug</p>
            <h1>Rekindle what recovery can feel like.</h1>
            <p>
              A peer-led community for people exploring cannabis as a path away from
              alcohol, opioids, and other harmful substances.
            </p>
            <div className="h8-hero__actions">
              <button type="button" className="h8-primary" onClick={onRegister}>
                Keep the fire alive
                <ArrowRight size={17} />
              </button>
              <button type="button" className="h8-login" onClick={onLogin}>
                Already a member? Log in
              </button>
            </div>
          </div>

          <div className="h8-hero__fire-wrap">
          <div className="h8-hero__fire-glow" />
            <div className="h8-hero__fire" aria-hidden="true">
              <div className="h8-hero-firemark">
                <span className="h8-hero-firemark__ring" />
                <span className="h8-hero-firemark__flame h8-hero-firemark__flame--one" />
                <span className="h8-hero-firemark__flame h8-hero-firemark__flame--two" />
                <span className="h8-hero-firemark__flame h8-hero-firemark__flame--three" />
                <span className="h8-hero-firemark__core" />
                <span className="h8-hero-firemark__log h8-hero-firemark__log--one" />
                <span className="h8-hero-firemark__log h8-hero-firemark__log--two" />
              </div>
            </div>
            <div className="h8-hero__note h8-hero__note--one">Someone replied when I needed it.</div>
            <div className="h8-hero__note h8-hero__note--two">Day 30. Quietly proud.</div>
            <div className="h8-hero__note h8-hero__note--three">I came back.</div>
          </div>
        </div>

        <div className="h8-scroll-mark">
          <span />
          <em>Scroll</em>
        </div>
      </section>

      <section className="h8-ritual" ref={ritualRef}>
        <div className={`h8-ritual__copy h8-reveal ${ritualVisible ? "is-visible" : ""}`}>
          <p className="h8-eyebrow">The signature idea</p>
          <h2>Every act of support adds warmth.</h2>
          <p>
            Posting, replying, sharing a resource, marking a milestone, or coming back
            after a hard day all become part of the same metaphor: people tending a
            shared fire together.
          </p>
        </div>

        <div className={`h8-reveal ${ritualVisible ? "is-visible" : ""}`}>
          <FirekeeperDemo />
        </div>
      </section>

      <section className="h8-paths" ref={pathsRef}>
        <div className="h8-paths__head">
          <p className="h8-eyebrow">How people tend it</p>
          <h2>Small actions. Real heat.</h2>
        </div>

        <div className="h8-path-rail">
          {PATHS.map((path, index) => {
            const Icon = path.icon;
            return (
              <article
                className={`h8-path h8-reveal ${pathsVisible ? "is-visible" : ""}`}
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

      <section className="h8-live">
        <div className="h8-live__wall" aria-label="Community note wall">
          {EMBER_NOTES.map((note, index) => (
            <div className={`h8-live-note h8-live-note--${index + 1}`} key={note}>
              {note}
            </div>
          ))}
        </div>

        <div className="h8-live__copy">
          <p className="h8-eyebrow h8-eyebrow--light">Inside the community</p>
          <h2>A room that gets warmer when people show up.</h2>
          <p>
            This is the emotional engine of the product: a place where support is visible,
            momentum is shared, and nobody has to make recovery look cleaner than it is.
          </p>
          <Link to="/community" className="h8-secondary h8-secondary--light">
            See the community
          </Link>
        </div>
      </section>

      <section className="h8-stories" ref={storiesRef}>
        <div className={`h8-stories__head h8-reveal ${storiesVisible ? "is-visible" : ""}`}>
          <p className="h8-eyebrow">Member stories</p>
          <h2>People remember the moment the room felt warm enough to stay.</h2>
        </div>
        <StoryReel />
      </section>

      <section className="h8-final">
        <div ref={finalRef} className={`h8-final__inner h8-reveal ${finalVisible ? "is-visible" : ""}`}>
          <Sparkles size={26} />
          <p className="h8-eyebrow">Whenever you are ready</p>
          <h2>Come add one small piece of light.</h2>
          <p>
            Read quietly, reply to someone, mark your day, or let someone else remind
            you that the fire is still here.
          </p>
          <div className="h8-final__actions">
            <button type="button" className="h8-primary h8-primary--dark" onClick={onRegister}>
              Join the community
              <ArrowRight size={17} />
            </button>
            <button type="button" className="h8-secondary" onClick={onLogin}>
              Log in
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
