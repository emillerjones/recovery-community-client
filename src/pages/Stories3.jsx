import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Flame } from "lucide-react";
import { PUBLIC_STORIES, SHAWN_MEMORIAL } from "../data/publicStories";
import { STORY_VISUALS } from "./storyMotifs";
import "./Stories3.css";

const FEATURED_SLUG = "dee";
const featuredStory = PUBLIC_STORIES.find((story) => story.slug === FEATURED_SLUG);
const restOfCollection = PUBLIC_STORIES.filter((story) => story.slug !== FEATURED_SLUG);
const honorRoll = [...PUBLIC_STORIES, SHAWN_MEMORIAL];
const READABLE_COUNT = PUBLIC_STORIES.length + 1; // ten storytellers + Shawn's memorial

const GATHERING = honorRoll.map((person, index) => ({
  ...person,
  angle: Math.round((360 / honorRoll.length) * index + (index % 2 === 0 ? -7 : 7)),
  radius: 250 + (index % 3) * 24,
  speed: 76 + (index % 4) * 6,
}));

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

// Tracks how much of the scroll-linked hero has been passed, for a gentle
// camera-push feel as the visitor leaves the monument.
function useScrollProgress(ref) {
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;

    let frame = null;
    function update() {
      frame = null;
      const rect = node.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -rect.top / (rect.height * 0.7)));
      node.style.setProperty("--scroll-progress", progress.toFixed(3));
    }
    function onScroll() {
      if (frame === null) frame = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [ref]);
}

function StorySection({ story, index, total, onRead }) {
  const [ref, visible] = useReveal(0.16);
  const visual = STORY_VISUALS[story.slug];
  const flip = index % 2 === 1;

  useEffect(() => {
    if (visible) onRead(story.slug);
  }, [visible, story.slug, onRead]);

  return (
    <article
      ref={ref}
      className={`s3-story ${visible ? "is-visible" : ""} ${flip ? "s3-story--flip" : ""}`}
      id={story.slug}
      style={{
        "--accent": visual.accent,
        "--motif-rotate": `${visual.rotate}deg`,
        "--progress": total > 1 ? index / (total - 1) : 0,
      }}
    >
      <div className="s3-story__motif" aria-hidden="true">
        <svg viewBox="0 0 240 240">
          {visual.motif.map((d, i) => (
            <path key={i} d={d} pathLength="1" style={{ transitionDelay: `${0.12 + i * 0.04}s` }} />
          ))}
        </svg>
      </div>

      <div className={`s3-story__portrait s3-frame--${visual.frame}`}>
        <img src={story.photo} alt={`Portrait of ${story.name}`} />
        <span className="s3-story__number">{String(index + 1).padStart(2, "0")}</span>
      </div>

      <div className="s3-story__content">
        <p className="s3-story__path">{story.path}</p>
        <h2>
          <span className="s3-story__quote-mark" aria-hidden="true">&ldquo;</span>
          {story.line}
        </h2>
        {story.contentNote && <p className="s3-content-note">Content note: {story.contentNote}</p>}
        <div className="s3-story__body">
          {story.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <p className="s3-story__name">— {story.name}</p>
      </div>
    </article>
  );
}

function GatheringFire({ warmth }) {
  return (
    <div
      className={`s3-gfire ${warmth ? "s3-gfire--fed" : ""}`}
      style={{
        "--fire-growth": 1 + Math.min(warmth, 4) * 0.08,
        "--fire-brightness": 1 + Math.min(warmth, 4) * 0.08,
        "--outer-growth": `${Math.min(warmth, 4) * 7}px`,
        "--middle-growth": `${Math.min(warmth, 4) * 6}px`,
      }}
      aria-hidden="true"
    >
      <span className="s3-gfire__aura" />
      <span className="s3-gfire__ghost">
        <img src={SHAWN_MEMORIAL.photo} alt="" />
      </span>
      <span className="s3-gfire__flame s3-gfire__flame--outer" />
      <span className="s3-gfire__flame s3-gfire__flame--middle" />
      <span className="s3-gfire__flame s3-gfire__flame--inner" />
      <span className="s3-gfire__coal s3-gfire__coal--one" />
      <span className="s3-gfire__coal s3-gfire__coal--two" />
      <span className="s3-gfire__log s3-gfire__log--one" />
      <span className="s3-gfire__log s3-gfire__log--two" />
      {[0, 1, 2, 3, 4].map((spark) => (
        <span className={`s3-gfire__spark s3-gfire__spark--${spark + 1}`} key={spark} />
      ))}
    </div>
  );
}

export default function Stories3() {
  const { onRegister } = useOutletContext();
  const [featuredRef, featuredVisible] = useReveal(0.14);
  const [memorialRef, memorialVisible] = useReveal(0.16);
  const [honorRef, honorVisible] = useReveal(0.15);
  const readRef = useRef(new Set());
  const [readCount, setReadCount] = useState(0);
  const heroSceneRef = useRef(null);
  useScrollProgress(heroSceneRef);

  function markRead(slug) {
    if (readRef.current.has(slug)) return;
    readRef.current.add(slug);
    setReadCount(readRef.current.size);
  }

  useEffect(() => {
    if (featuredVisible) markRead(FEATURED_SLUG);
  }, [featuredVisible]);

  useEffect(() => {
    if (memorialVisible) markRead("shawn");
  }, [memorialVisible]);

  const featuredVisual = STORY_VISUALS[featuredStory.slug];

  return (
    <main className="s3-page">
      {/* ---------- The Monument ---------- */}
      <section className="s3-monument-hero">
        <div className="s3-monument-hero__stars" aria-hidden="true" />
        <div className="s3-monument-hero__glow" aria-hidden="true" />

        <p className="s3-monument-hero__eyebrow">In honor of public success stories</p>
        <h1 className="s3-monument-hero__plaque">
          Eleven who fought their way back —
          <br />
          and chose, in the open,
          <br />
          to light the way for others.
        </h1>
        <p className="s3-monument-hero__sub">
          Hand-chosen from hundreds of stories. Held here in a place of honor.
        </p>

        <div className="s3-hero-scene" ref={heroSceneRef}>
          <div className="s3-flame-monument">
            <span className="s3-flame-monument__glow" aria-hidden="true" />
            <span className="s3-flame-monument__flame" aria-hidden="true">
              <span className="s3-flame-monument__outer" />
              <span className="s3-flame-monument__middle" />
              <span className="s3-flame-monument__inner" />
              <span className="s3-flame-monument__core" />
            </span>
            <span className="s3-flame-monument__embers" aria-hidden="true">
              {[1, 2, 3, 4, 5, 6, 7].map((ember) => <i className={`s3-flame-monument__ember s3-flame-monument__ember--${ember}`} key={ember} />)}
            </span>
            <span className="s3-flame-monument__plinth" aria-hidden="true">
              <span className="s3-flame-monument__plinth-top" />
            </span>
          </div>

          <ul ref={honorRef} className={`s3-honor-roll-list ${honorVisible ? "is-visible" : ""}`}>
            {honorRoll.map((person, index) => {
              const isMemorial = person.slug === "shawn";
              const visual = STORY_VISUALS[person.slug];
              return (
                <li key={person.slug} style={{ "--i": index }}>
                  <a
                    className={`s3-medallion ${isMemorial ? "s3-medallion--memorial" : ""}`}
                    href={`#${person.slug}`}
                    style={visual ? { "--accent": visual.accent } : undefined}
                  >
                    <span className="s3-medallion__ring">
                      <img src={person.photo} alt="" />
                    </span>
                    {isMemorial && <Flame className="s3-medallion__flame" size={12} aria-hidden="true" />}
                    <span>{person.name}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <a className="s3-monument-hero__cue" href="#dee">Meet the people <span>↓</span></a>
      </section>

      {/* ---------- Featured story: Dee ---------- */}
      <section
        ref={featuredRef}
        className={`s3-featured ${featuredVisible ? "is-visible" : ""}`}
        id={featuredStory.slug}
        style={{ "--accent": featuredVisual.accent }}
      >
        <div className="s3-featured__media">
          <img src={featuredStory.photo} alt={`Portrait of ${featuredStory.name}`} />
          <span className="s3-featured__ribbon">Featured story</span>
        </div>
        <div className="s3-featured__content">
          <p className="s3-eyebrow">Hand-picked by our founder</p>
          <p className="s3-featured__tag">The story we lead with</p>
          <h2>
            <span className="s3-story__quote-mark" aria-hidden="true">&ldquo;</span>
            {featuredStory.line}
          </h2>
          <p className="s3-story__path">{featuredStory.path}</p>
          <div className="s3-story__body">
            {featuredStory.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <p className="s3-story__name">— {featuredStory.name}</p>
        </div>
      </section>

      <section className="s3-intro">
        <div className="s3-inner s3-intro__grid">
          <div>
            <p className="s3-eyebrow">Public success stories</p>
            <h1>There is more than one way through.</h1>
          </div>
          <p className="s3-intro__text">
            These stories were shared publicly and with purpose: so someone who is struggling might
            recognize a piece of themselves — and see that another life can be possible. Each one
            was hand-picked, and each is presented on its own terms. The words below are the
            storytellers&rsquo; own.
          </p>
        </div>
      </section>

      <section className="s3-collection" aria-label="Public recovery stories">
        {restOfCollection.map((story, index) => (
          <StorySection
            story={story}
            index={index + 1}
            total={PUBLIC_STORIES.length}
            onRead={markRead}
            key={story.slug}
          />
        ))}
      </section>

      {/* ---------- Shawn: the founding memorial ---------- */}
      <section ref={memorialRef} className={`s3-memorial ${memorialVisible ? "is-visible" : ""}`} id="shawn">
        <div className="s3-memorial__stars" aria-hidden="true" />
        <div className="s3-inner s3-memorial__inner">
          <div className="s3-memorial__portrait">
            <img src={SHAWN_MEMORIAL.photo} alt={`Portrait of ${SHAWN_MEMORIAL.name}`} />
            <span className="s3-memorial__eternal-flame" aria-hidden="true">
              <span />
              <span />
            </span>
          </div>
          <div>
            <p className="s3-eyebrow s3-eyebrow--memorial">Founding light · {SHAWN_MEMORIAL.year}</p>
            <h2>{SHAWN_MEMORIAL.line}</h2>
            <div className="s3-memorial__body">
              {SHAWN_MEMORIAL.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <blockquote className="s3-memorial__epigraph">
              All that is gold does not glitter
              <br />
              Not all those who wander are lost
              <br />
              <br />
              The old that is strong does not wither
              <br />
              Deep roots are not reached by the frost
              <br />
              <br />
              From the ashes a fire shall be woken
              <br />
              A light from the shadows shall spring
              <br />
              <br />
              Renewed shall be blade that was broken
              <br />
              The crownless again shall be king
            </blockquote>

            <div className="s3-plaque">
              <p className="s3-plaque__line1">In memory</p>
              <p className="s3-plaque__line2">of</p>
              <p className="s3-plaque__body">
                Shawn — who fought a longer, harder road
                <br />
                than most will ever know,
                <br />
                and still left light behind
                <br />
                for those who came after.
              </p>
              <div className="s3-plaque__rule" aria-hidden="true" />
              <p className="s3-plaque__motto">One day at a time</p>
              <p className="s3-plaque__translation">(the road that brought eleven of us home)</p>
            </div>

            <strong>Shawn · A founding light</strong>
          </div>
        </div>
      </section>

      {/* ---------- Everyone, gathered ---------- */}
      <section className="s3-gathering" aria-label="Everyone gathered together">
        <div className="s3-gathering__mist" aria-hidden="true" />

        <div className="s3-gathering__stage">
          <div className="s3-gathering__rings" aria-hidden="true" />
          <GatheringFire warmth={readCount} />

          {GATHERING.map((person, index) => (
            <div
              className="s3-gorbit"
              key={person.slug}
              style={{
                "--angle": `${person.angle}deg`,
                "--radius": `${person.radius}px`,
                "--speed": `${person.speed}s`,
                "--arrival": `${0.5 + index * 0.09}s`,
              }}
            >
              <a
                className="s3-gorbit__card"
                href={`#${person.slug}`}
                aria-label={`Revisit ${person.name}${person.slug === "shawn" ? "'s memorial" : "'s story"}`}
              >
                <img src={person.photo} alt="" />
                <span>{person.name}</span>
              </a>
            </div>
          ))}
        </div>

        <div className="s3-gathering__copy">
          <p className="s3-eyebrow">Everyone you just met</p>
          <h2>Eleven stories. One fire.</h2>
          <span>
            {readCount >= READABLE_COUNT
              ? "You've met all eleven. This is what they built, together."
              : "Read every story above and watch this fire fill with everyone who kept it going."}
          </span>
        </div>
      </section>

      <section className="s3-private">
        <div className="s3-inner s3-private__inner">
          <div>
            <p className="s3-eyebrow">Some stories are not public</p>
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
