import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { PUBLIC_STORIES, SHAWN_MEMORIAL } from "../data/publicStories";
import "./Stories.css";

const ORBIT_STORIES = PUBLIC_STORIES.map((story, index) => ({
  ...story,
  angle: [8, 44, 80, 116, 152, 188, 224, 260, 296, 332][index],
  radius: [260, 310, 275, 320, 285, 315, 255, 318, 278, 305][index],
  speed: 72,
}));

function StoryFire({ warmth }) {
  return (
    <div className="stories-fire-anchor">
    <div
      className={`stories-fire ${warmth ? "stories-fire--fed" : ""}`}
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
      <span className="stories-fire__aura" />
      <span className="stories-fire__ghost" aria-hidden="true">
        <img src={SHAWN_MEMORIAL.photo} alt="" />
      </span>
      <span className="stories-fire__flame stories-fire__flame--outer" />
      <span className="stories-fire__flame stories-fire__flame--middle" />
      <span className="stories-fire__flame stories-fire__flame--inner" />
      <span className="stories-fire__coal stories-fire__coal--one" />
      <span className="stories-fire__coal stories-fire__coal--two" />
      <span className="stories-fire__log stories-fire__log--one" />
      <span className="stories-fire__log stories-fire__log--two" />
      {[0, 1, 2, 3, 4].map((spark) => (
        <span className={`stories-fire__spark stories-fire__spark--${spark + 1}`} key={spark} />
      ))}
      <a className="stories-fire__memorial" href="#shawn">
        <span>
          <small>In loving memory</small>
          <strong>Shawn · Remembered {SHAWN_MEMORIAL.year}</strong>
        </span>
      </a>
    </div>
    </div>
  );
}

export default function Stories() {
  const { onRegister } = useOutletContext();
  const [quickStory, setQuickStory] = useState("");
  const [visitorStories, setVisitorStories] = useState([]);
  const [tossing, setTossing] = useState(false);

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
          radius: 265 + (index % 2) * 44,
          speed: 58 + (index % 3) * 7,
        },
      ]);
      setQuickStory("");
      setTossing(false);
    }, 620);
  }

  return (
    <main className="stories-page">
      <section className="stories-gathering">
        <div className="stories-gathering__mist" aria-hidden="true" />
        <div className="stories-gathering__rings" aria-hidden="true" />
        <StoryFire warmth={visitorStories.length} />

        {ORBIT_STORIES.map((story, index) => (
          <div
            className="stories-orbit"
            key={story.slug}
            style={{
              "--angle": `${story.angle}deg`,
              "--radius": `${story.radius}px`,
              "--speed": `${story.speed}s`,
              "--arrival": `${0.72 + index * 0.1}s`,
            }}
          >
            <a
              className="stories-orbit__card"
              href={`#${story.slug}`}
              aria-label={`Read ${story.name}’s story: ${story.line}`}
            >
              <img src={story.photo} alt="" />
              <span>
                <strong>{story.name}</strong>
                <small>“{story.line}”</small>
              </span>
            </a>
          </div>
        ))}

        {visitorStories.map((story, index) => (
          <div
            className="stories-orbit stories-orbit--visitor"
            key={story.id}
            style={{
              "--angle": `${story.angle}deg`,
              "--radius": `${story.radius}px`,
              "--speed": `${story.speed}s`,
              "--arrival": `${index * 0.08}s`,
            }}
          >
            <div className="stories-orbit__card stories-orbit__card--visitor">
              <span className="stories-orbit__ember" aria-hidden="true" />
              <span>
                <strong>Your light</strong>
                <small>“{story.text}”</small>
              </span>
            </div>
          </div>
        ))}

        <div className="stories-gathering__copy">
          <p>Public success stories</p>
          <h1>Every voice adds light.</h1>
          <span>Real people. Different paths. Stories shared so someone else might find their way.</span>
        </div>
        <form className={`stories-log-form ${tossing ? "stories-log-form--tossing" : ""}`} onSubmit={tossLog}>
          <label htmlFor="quick-story">
            <span>Keep the fire going</span>
            Write a small milestone on the next log
          </label>
          <div>
            <span className="stories-log-form__cut" aria-hidden="true" />
            <input
              id="quick-story"
              type="text"
              value={quickStory}
              maxLength={48}
              placeholder="10 days sober"
              onChange={(event) => setQuickStory(event.target.value)}
            />
            <button type="submit" disabled={!quickStory.trim() || tossing}>
              Add this log <span aria-hidden="true">↑</span>
            </button>
          </div>
          <small>Visible only to you. Nothing is posted.</small>
        </form>
        <a className="stories-gathering__cue" href="#story-collection">Meet the people <span>↓</span></a>
      </section>

      <section className="stories-hero">
        <div className="stories-inner stories-hero__grid">
          <div>
            <p className="stories-eyebrow">Public success stories</p>
            <h1>There is more than one way through.</h1>
          </div>
          <p className="stories-intro">
            These stories were shared publicly and with purpose: so someone who is
            struggling might recognize a piece of themselves—and see that another life
            can be possible. The words below are the storytellers’ own.
          </p>
        </div>
      </section>

      <section className="stories-collection" id="story-collection" aria-label="Public recovery stories">
        <div className="stories-inner">
          {PUBLIC_STORIES.map((story, index) => (
            <article className="stories-story" id={story.slug} key={story.slug}>
              <div className="stories-story__portrait">
                <img src={story.photo} alt={`Portrait of ${story.name}`} />
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="stories-story__content">
                <p className="stories-story__path">{story.path}</p>
                <h2>“{story.line}”</h2>
                {story.contentNote && <p className="stories-content-note">Content note: {story.contentNote}</p>}
                <div className="stories-story__body">
                  {story.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
                <p className="stories-story__name">— {story.name}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="stories-memorial" id="shawn">
        <div className="stories-inner stories-memorial__inner">
          <img src={SHAWN_MEMORIAL.photo} alt={`Portrait of ${SHAWN_MEMORIAL.name}`} />
          <div>
            <p className="stories-eyebrow">In loving memory · {SHAWN_MEMORIAL.year}</p>
            <h2>{SHAWN_MEMORIAL.line}</h2>
            <div className="stories-memorial__body">
              {SHAWN_MEMORIAL.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            <strong>Shawn · A founding light</strong>
          </div>
        </div>
      </section>

      <section className="stories-private">
        <div className="stories-inner stories-private__inner">
          <div>
            <p className="stories-eyebrow">Some stories are not public</p>
            <h2>A safer place for what you only want to share with people who understand.</h2>
          </div>
          <div>
            <p>
              Inside the community, members can share more privately, ask for support,
              or simply read without having their experience displayed on the public site.
            </p>
            <button type="button" onClick={onRegister}>Join the community</button>
          </div>
        </div>
      </section>
    </main>
  );
}
