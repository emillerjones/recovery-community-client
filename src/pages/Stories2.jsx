import { lazy, Suspense, useState } from "react";
import { flushSync } from "react-dom";
import { useOutletContext } from "react-router-dom";
import { PUBLIC_STORIES, SHAWN_MEMORIAL } from "../data/publicStories";
import StoryReader from "./StoryReader";
import ShawnMemorial from "./ShawnMemorial";
import "./Stories2.css";

// Lazy-loaded: this pulls in three.js/R3F/postprocessing/three.quarks.
const CommunityBonfire = lazy(() => import("./CommunityBonfire"));

/**
 * Stories2 — demonstrates the View Transitions API: opening a story,
 * closing it, and stepping to the next/previous one all happen inside
 * `document.startViewTransition()`, so the browser generates a smooth
 * native crossfade/morph between the two DOM states instead of a hard
 * cut. Falls back to a plain state update on browsers that don't
 * support it yet (Firefox, older Safari).
 */
function withViewTransition(update) {
  if (typeof document !== "undefined" && document.startViewTransition) {
    document.startViewTransition(() => flushSync(update));
  } else {
    update();
  }
}

export default function Stories2() {
  const { onRegister } = useOutletContext();
  const [activeIndex, setActiveIndex] = useState(null);
  const dee = PUBLIC_STORIES[0];

  function openStory(story) {
    const index = PUBLIC_STORIES.findIndex((candidate) => candidate.slug === story.slug);
    if (index === -1) return;
    withViewTransition(() => setActiveIndex(index));
  }

  function closeStory() {
    withViewTransition(() => setActiveIndex(null));
  }

  function stepStory(direction) {
    withViewTransition(() =>
      setActiveIndex((index) => (index + direction + PUBLIC_STORIES.length) % PUBLIC_STORIES.length)
    );
  }

  const activeStory = activeIndex === null ? null : PUBLIC_STORIES[activeIndex];

  return (
    <main className="stories2">
      <section className="stories2__room">
        <div className="stories2__copy">
          <p>Stories of Recovery</p>
          <h1>Stories preserved because they may help someone survive.</h1>
          <span>
            Chosen from hundreds of accounts, each story is presented in the
            storyteller's own words. They are not instructions or promises.
            They are records of courage, offered openly and held here with
            care.
          </span>

          <aside className="stories2-note" aria-label="Design technique: View Transitions API">
            <p className="stories2-note__label">Design technique</p>
            <h3>View Transitions API</h3>
            <p>
              Click any photo below. Opening it, closing it, and stepping
              between stories with the reader's prev/next controls are all
              wrapped in <code>document.startViewTransition()</code> — the
              browser handles the crossfade natively instead of the page
              just snapping between states. Where it isn't supported yet
              (Firefox), the reader still opens instantly — it just skips
              the transition.
            </p>
          </aside>
        </div>

        <div className="stories2__desk">
          <button className="stories2__dee" onClick={() => openStory(dee)}>
            <img src={dee.photo} alt="Dee" />
            <span>Public success story · Dee</span>
            <blockquote>“{dee.line}”</blockquote>
          </button>
          <div className="stories2__prints">
            {PUBLIC_STORIES.slice(1).map((story) => (
              <button onClick={() => openStory(story)} key={story.slug}>
                <img src={story.photo} alt="" />
                <span>{story.name}</span>
              </button>
            ))}
          </div>
          <a className="stories2__shawn" href="#stories2-shawn">
            <img src={SHAWN_MEMORIAL.photo} alt="Shawn" />
            <span>
              In memoriam · 2017<strong>Shawn</strong>
            </span>
          </a>
        </div>

        <div className="stories2__join">
          <span>When you are ready, there is room inside the community.</span>
          <button onClick={onRegister}>Join the community</button>
        </div>
      </section>

      <ShawnMemorial id="stories2-shawn" />

      <Suspense fallback={null}>
        <CommunityBonfire onSelectStory={openStory} />
      </Suspense>

      {activeStory && (
        <StoryReader
          story={activeStory}
          returnLabel="Return to the archive"
          onClose={closeStory}
          onNext={() => stepStory(1)}
          onPrev={() => stepStory(-1)}
          position={{ index: activeIndex + 1, total: PUBLIC_STORIES.length }}
        />
      )}
    </main>
  );
}
