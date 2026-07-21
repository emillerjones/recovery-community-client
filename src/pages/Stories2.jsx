import { lazy, Suspense, useState } from "react";
import { flushSync } from "react-dom";
import { useOutletContext } from "react-router-dom";
import { PUBLIC_STORIES, SHAWN_MEMORIAL } from "../data/publicStories";
import StoryReader from "./StoryReader";
import ShawnMemorial from "./ShawnMemorial";
import TechniqueNote from "../components/TechniqueNote";
import "./Stories2.css";

// Lazy-loaded: this pulls in three.js/R3F/postprocessing/three.quarks, which
// is a heavy stack we don't want in the app's main bundle. Splitting it into
// its own chunk means only people who reach /stories2 ever download it.
const CommunityBonfire = lazy(() => import("./CommunityBonfire"));

/**
 * Stories2 — an exact copy of Stories.jsx, with one addition: opening a
 * story wraps the state update in `document.startViewTransition()`, and
 * the clicked thumbnail shares a `view-transition-name` with the photo
 * inside the reader. The browser morphs the same photo from its small
 * thumbnail position into the reader's large portrait instead of the
 * reader just appearing on top. This is the same primitive that would
 * carry a photo across an actual page navigation (e.g. Home → Stories)
 * — demonstrated here first, on one page, with nothing else at risk.
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
  const [active, setActive] = useState(null);
  const dee = PUBLIC_STORIES[0];

  function openStory(story) {
    withViewTransition(() => setActive({ story }));
  }

  function closeStory() {
    withViewTransition(() => setActive(null));
  }

  return (
    <main className="stories" data-nav-theme="light">
      <TechniqueNote
        number="05"
        title="Shared-element view transition"
        how="Opening a story wraps the state update in document.startViewTransition(), and the clicked photo carries the same view-transition-name as the photo inside the reader. The browser morphs one into the other natively — no library, no manual position math."
        watch="Click any photo below (not the featured Dee polaroid — that one stays as a plain modal for comparison). Watch it grow smoothly into the reader's large portrait instead of the reader just appearing on top. Falls back to the normal modal on browsers without the API (Firefox, older Safari)."
      />

      <section className="stories__room">
        <div className="stories__copy"><p>Stories of Recovery</p><h1>Stories preserved because they may help someone survive.</h1><span>Chosen from hundreds of accounts, each story is presented in the storyteller's own words.  They are not instructions or promises.  They are records of courage, offered openly and held here with care.</span></div>
        <div className="stories__desk">
          <button className="stories__dee" onClick={() => openStory(dee)}><img src={dee.photo} alt="Dee"/><span>Public success story · Dee</span><blockquote>“{dee.line}”</blockquote></button>
          <div className="stories__prints" role="region" aria-label="More recovery stories">{PUBLIC_STORIES.slice(1).map((story) => <button onClick={() => openStory(story)} key={story.slug}><img src={story.photo} alt="" style={{ viewTransitionName: `story2-photo-${story.slug}` }} /><span>{story.name}</span></button>)}</div>
          <a className="stories__shawn" href="#stories2-shawn"><img src={SHAWN_MEMORIAL.photo} alt="Shawn"/><span>In memoriam · 2017<strong>Shawn</strong></span></a>
        </div>
        <div className="stories__join"><span>When you are ready, there is room inside the community.</span><button onClick={onRegister}>Join the community</button></div>
      </section>
      <ShawnMemorial id="stories2-shawn" />

      {/* Experimental — comment out the line below to disable/remove the 3D bonfire section. */}
      <Suspense fallback={null}><CommunityBonfire onSelectStory={openStory} /></Suspense>

      {active && (
        <StoryReader
          {...active}
          returnLabel="Return to the archive"
          onClose={closeStory}
          photoTransitionName={active.story.slug === dee.slug ? undefined : `story2-photo-${active.story.slug}`}
        />
      )}
    </main>
  );
}
