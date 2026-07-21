import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { useOutletContext } from "react-router-dom";
import TechniqueNote from "../components/TechniqueNote";
import { PUBLIC_STORIES } from "../data/publicStories";
import "./Stories3.css";

function StoryDeckReader({ story, onClose, onMove }) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onMove(1);
      if (event.key === "ArrowLeft") onMove(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onMove]);

  return (
    <section className="stories3-reader" role="dialog" aria-modal="true" aria-label={`${story.name}'s story`}>
      <div className="stories3-reader__portrait">
        <img
          src={story.photo}
          alt={`Portrait of ${story.name}`}
          style={{ viewTransitionName: `story3-${story.slug}` }}
        />
        <span>{story.path}</span>
      </div>
      <article>
        <p className="stories3-kicker">A complete recovery story</p>
        <h2>{story.name}</h2>
        <blockquote>“{story.line}”</blockquote>
        {story.contentNote && <aside>Content note: {story.contentNote}</aside>}
        <div className="stories3-reader__body">
          {story.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </article>
      <button className="stories3-reader__close" type="button" onClick={onClose}>← Return to the deck</button>
      <button className="stories3-reader__prev" type="button" onClick={() => onMove(-1)} aria-label="Previous story">‹</button>
      <button className="stories3-reader__next" type="button" onClick={() => onMove(1)} aria-label="Next story">›</button>
    </section>
  );
}

export default function Stories3() {
  const { onRegister } = useOutletContext();
  const [active, setActive] = useState(null);

  const transitionTo = (update) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => flushSync(update));
    } else {
      update();
    }
  };

  const openStory = (story) => transitionTo(() => setActive(story));
  const closeStory = () => transitionTo(() => setActive(null));
  const moveStory = (direction) => {
    const current = PUBLIC_STORIES.findIndex((story) => story.slug === active?.slug);
    const next = (current + direction + PUBLIC_STORIES.length) % PUBLIC_STORIES.length;
    transitionTo(() => setActive(PUBLIC_STORIES[next]));
  };

  return (
    <main className="stories3">
      <section className="stories3-hero">
        <div className="stories3-hero__rings" aria-hidden="true"><i /><i /><i /></div>
        <div className="stories3-inner">
          <p className="stories3-kicker">The living archive</p>
          <h1>Every card holds a life larger than the frame.</h1>
          <p>Move sideways through the archive. Open a card when a voice catches your attention.</p>
        </div>
      </section>

      <TechniqueNote
        number="02"
        title="Gesture-driven editorial deck + shared-element transition"
        how="The browser's native horizontal touch physics provide drag, momentum, and snap. When a story opens, its exact portrait is carried into the reader with the View Transitions API."
        watch="Swipe or drag the deck sideways and notice the next card peeking in. Tap a portrait: the same image should expand into the reading room instead of cutting to a separate screen."
      />

      <section className="stories3-archive" aria-label="Recovery story deck">
        <div className="stories3-archive__head stories3-inner">
          <div><span>01—{String(PUBLIC_STORIES.length).padStart(2, "0")}</span><h2>Drag the archive.</h2></div>
          <p>Horizontal movement changes the rhythm without interrupting the page's normal vertical scroll.</p>
        </div>
        <div className="stories3-deck">
          {PUBLIC_STORIES.map((story, index) => (
            <button
              type="button"
              className="stories3-card"
              style={{ "--card-index": index, "--tilt": `${(index % 3 - 1) * 1.4}deg` }}
              onClick={() => openStory(story)}
              key={story.slug}
            >
              <span className="stories3-card__number">{String(index + 1).padStart(2, "0")}</span>
              <img
                src={story.photo}
                alt=""
                style={{ viewTransitionName: active?.slug === story.slug ? "none" : `story3-${story.slug}` }}
              />
              <span className="stories3-card__copy"><strong>{story.name}</strong><small>{story.path}</small></span>
              <span className="stories3-card__line">“{story.line}”</span>
            </button>
          ))}
          <div className="stories3-deck__end" aria-hidden="true"><span>End of the rail</span><i /></div>
        </div>
      </section>

      <section className="stories3-invitation">
        <div className="stories3-inner"><p className="stories3-kicker">A place beyond the archive</p><h2>You do not have to carry your own story alone.</h2><button type="button" onClick={onRegister}>Join the community</button></div>
      </section>

      {active && <StoryDeckReader story={active} onClose={closeStory} onMove={moveStory} />}
    </main>
  );
}
