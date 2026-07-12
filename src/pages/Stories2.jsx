import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Flame } from "lucide-react";
import { PUBLIC_STORIES, SHAWN_MEMORIAL } from "../data/publicStories";
import { STORY_VISUALS } from "./storyMotifs";
import "./Stories2.css";

const ORBIT_STORIES = PUBLIC_STORIES.map((story, index) => ({
  ...story,
  angle: [8, 44, 80, 116, 152, 188, 224, 260, 296, 332][index],
  radius: [255, 305, 270, 315, 280, 310, 250, 313, 273, 300][index],
  speed: 76,
}));

const WARMTH_STAGES = ["Ready for a spark", "Spark caught", "Glowing", "Blazing", "Full bonfire"];

function useReveal(threshold = 0.2) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

function StoryFire2({ warmth, flare }) {
  return (
    <div className="s2-fire-anchor">
    <div
      className={`s2-fire ${warmth ? "s2-fire--fed" : ""} ${flare ? "s2-fire--flare" : ""}`}
      style={{
        position: "relative",
        left: 0,
        top: 0,
        translate: "none",
        "--fire-growth": 1 + Math.min(warmth, 4) * 0.08,
        "--fire-brightness": 1 + Math.min(warmth, 4) * 0.08,
        "--outer-growth": `${Math.min(warmth, 4) * 7}px`,
        "--middle-growth": `${Math.min(warmth, 4) * 6}px`,
      }}
      aria-label="A community fire surrounded by real recovery stories"
    >
      <span className="s2-fire__aura" />
      <span className="s2-fire__ghost" aria-hidden="true">
        <img src={SHAWN_MEMORIAL.photo} alt="" />
      </span>
      <span className="s2-fire__flame s2-fire__flame--outer" />
      <span className="s2-fire__flame s2-fire__flame--middle" />
      <span className="s2-fire__flame s2-fire__flame--inner" />
      <span className="s2-fire__coal s2-fire__coal--one" />
      <span className="s2-fire__coal s2-fire__coal--two" />
      <span className="s2-fire__log s2-fire__log--one" />
      <span className="s2-fire__log s2-fire__log--two" />
      {[0, 1, 2, 3, 4].map((spark) => (
        <span className={`s2-fire__spark s2-fire__spark--${spark + 1}`} key={spark} />
      ))}
      <a className="s2-fire__memorial" href="#shawn">
        <span>
          <small>In loving memory</small>
          <strong>Shawn · Remembered {SHAWN_MEMORIAL.year}</strong>
        </span>
      </a>
    </div>
    </div>
  );
}

function StorySection({ story, index }) {
  const [ref, visible] = useReveal(0.16);
  const visual = STORY_VISUALS[story.slug];
  const flip = index % 2 === 1;

  return (
    <article
      ref={ref}
      className={`s2-story ${visible ? "is-visible" : ""} ${flip ? "s2-story--flip" : ""}`}
      id={story.slug}
      style={{ "--accent": visual.accent, "--motif-rotate": `${visual.rotate}deg` }}
    >
      <div className="s2-story__motif" aria-hidden="true">
        <svg viewBox="0 0 240 240">
          {visual.motif.map((d, i) => (
            <path key={i} d={d} pathLength="1" style={{ transitionDelay: `${0.12 + i * 0.04}s` }} />
          ))}
        </svg>
      </div>

      <div className={`s2-story__portrait s2-frame--${visual.frame}`}>
        <img src={story.photo} alt={`Portrait of ${story.name}`} />
        <span className="s2-story__number">{String(index + 1).padStart(2, "0")}</span>
      </div>

      <div className="s2-story__content">
        <p className="s2-story__path">{story.path}</p>
        <h2>
          <span className="s2-story__quote-mark" aria-hidden="true">&ldquo;</span>
          {story.line}
        </h2>
        {story.contentNote && <p className="s2-content-note">Content note: {story.contentNote}</p>}
        <div className="s2-story__body">
          {story.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <p className="s2-story__name">— {story.name}</p>
      </div>
    </article>
  );
}

export default function Stories2() {
  const { onRegister } = useOutletContext();
  const [quickStory, setQuickStory] = useState("");
  const [visitorStories, setVisitorStories] = useState([]);
  const [tossing, setTossing] = useState(false);
  const [flare, setFlare] = useState(false);

  function tossLog(event) {
    event.preventDefault();
    const text = quickStory.trim();
    if (!text || tossing) return;

    const index = visitorStories.length;
    setTossing(true);
    window.setTimeout(() => {
      setVisitorStories((stories) => [
        ...stories,
        {
          id: `${Date.now()}-${index}`,
          text,
          angle: (22 + index * 67) % 360,
          radius: 260 + (index % 2) * 42,
          speed: 60 + (index % 3) * 7,
        },
      ]);
      setQuickStory("");
      setTossing(false);
      setFlare(true);
      window.setTimeout(() => setFlare(false), 900);
    }, 600);
  }

  const stage = WARMTH_STAGES[Math.min(visitorStories.length, WARMTH_STAGES.length - 1)];

  return (
    <main className="s2-page">
      <section className="s2-gathering">
        <div className="s2-gathering__mist" aria-hidden="true" />
        <div className="s2-gathering__embers" aria-hidden="true">
          {[...Array(9)].map((_, i) => (
            <span key={i} className={`s2-ember-drift s2-ember-drift--${i + 1}`} />
          ))}
        </div>
        <div className="s2-gathering__rings" aria-hidden="true" />
        <StoryFire2 warmth={visitorStories.length} flare={flare} />

        {ORBIT_STORIES.map((story, index) => (
          <div
            className="s2-orbit"
            key={story.slug}
            style={{
              "--angle": `${story.angle}deg`,
              "--radius": `${story.radius}px`,
              "--speed": `${story.speed}s`,
              "--arrival": `${0.72 + index * 0.1}s`,
            }}
          >
            <a
              className="s2-orbit__card"
              href={`#${story.slug}`}
              aria-label={`Read ${story.name}'s story: ${story.line}`}
            >
              <img src={story.photo} alt="" />
              <span>
                <strong>{story.name}</strong>
                <small>&ldquo;{story.line}&rdquo;</small>
              </span>
            </a>
          </div>
        ))}

        {visitorStories.map((story, index) => (
          <div
            className="s2-orbit s2-orbit--visitor"
            key={story.id}
            style={{
              "--angle": `${story.angle}deg`,
              "--radius": `${story.radius}px`,
              "--speed": `${story.speed}s`,
              "--arrival": `${index * 0.08}s`,
            }}
          >
            <div className="s2-orbit__card s2-orbit__card--visitor">
              <span className="s2-orbit__ember" aria-hidden="true" />
              <span>
                <strong>Your light</strong>
                <small>&ldquo;{story.text}&rdquo;</small>
              </span>
            </div>
          </div>
        ))}

        <div className="s2-gathering__copy">
          <p>Public success stories</p>
          <h1>Every voice adds light.</h1>
          <span>Real people. Different paths. Stories shared so someone else might find their way.</span>
        </div>

        <div className={`s2-feed ${tossing ? "s2-feed--tossing" : ""}`}>
          <div className="s2-feed__header">
            <span className="s2-feed__icon" aria-hidden="true">
              <Flame size={18} strokeWidth={2.2} />
            </span>
            <div>
              <strong>Feed the fire</strong>
              <span>Toss in a small win and watch it catch. Nothing is posted — this fire is just for you.</span>
            </div>
          </div>

          <form className="s2-feed__form" onSubmit={tossLog}>
            <input
              id="quick-story"
              type="text"
              value={quickStory}
              maxLength={48}
              placeholder="10 days sober, a hard call made…"
              aria-label="A small win to add to the fire"
              onChange={(event) => setQuickStory(event.target.value)}
            />
            <button type="submit" disabled={!quickStory.trim() || tossing}>
              Toss it in
              <Flame size={14} strokeWidth={2.4} aria-hidden="true" />
            </button>
          </form>

          <div className="s2-feed__meter" aria-hidden="true">
            {[0, 1, 2, 3].map((segment) => (
              <span key={segment} className={`s2-feed__segment ${visitorStories.length > segment ? "is-lit" : ""}`} />
            ))}
          </div>
          <div className="s2-feed__status">
            <span>{stage}</span>
            {visitorStories.length > 0 && (
              <span className="s2-feed__count">
                {visitorStories.length} spark{visitorStories.length === 1 ? "" : "s"} added tonight
              </span>
            )}
          </div>
        </div>

        <a className="s2-gathering__cue" href="#story-collection">
          Meet the people <span>↓</span>
        </a>
      </section>

      <section className="s2-intro">
        <div className="s2-inner s2-intro__grid">
          <div>
            <p className="s2-eyebrow">Public success stories</p>
            <h1>There is more than one way through.</h1>
          </div>
          <p className="s2-intro__text">
            These stories were shared publicly and with purpose: so someone who is struggling might
            recognize a piece of themselves — and see that another life can be possible. Each one
            was hand-picked, and each is presented on its own terms. The words below are the
            storytellers&rsquo; own.
          </p>
        </div>
      </section>

      <section className="s2-collection" id="story-collection" aria-label="Public recovery stories">
        {PUBLIC_STORIES.map((story, index) => (
          <StorySection story={story} index={index} key={story.slug} />
        ))}
      </section>

      <section className="s2-memorial" id="shawn">
        <div className="s2-inner s2-memorial__inner">
          <div className="s2-memorial__portrait">
            <img src={SHAWN_MEMORIAL.photo} alt={`Portrait of ${SHAWN_MEMORIAL.name}`} />
          </div>
          <div>
            <p className="s2-eyebrow s2-eyebrow--memorial">In loving memory · {SHAWN_MEMORIAL.year}</p>
            <h2>{SHAWN_MEMORIAL.line}</h2>
            <div className="s2-memorial__body">
              {SHAWN_MEMORIAL.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <strong>Shawn · A founding light</strong>
          </div>
        </div>
      </section>

      <section className="s2-private">
        <div className="s2-inner s2-private__inner">
          <div>
            <p className="s2-eyebrow">Some stories are not public</p>
            <h2>A safer place for what you only want to share with people who understand.</h2>
          </div>
          <div>
            <p>
              Inside the community, members can share more privately, ask for support, or simply
              read without having their experience displayed on the public site.
            </p>
            <button type="button" onClick={onRegister}>Join the community</button>
          </div>
        </div>
      </section>
    </main>
  );
}
