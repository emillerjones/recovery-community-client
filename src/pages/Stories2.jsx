import { lazy, Suspense, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { PUBLIC_STORIES, SHAWN_MEMORIAL } from "../data/publicStories";
import StoryReader from "./StoryReader";
import ShawnMemorial from "./ShawnMemorial";
import "./Stories2.css";

// Lazy-loaded: this pulls in three.js/R3F/postprocessing/three.quarks, which
// is a heavy stack we don't want in the app's main bundle. Splitting it into
// its own chunk means only people who reach /stories ever download it.
const CommunityBonfire = lazy(() => import("./CommunityBonfire"));

export default function Stories2() {
  const { onRegister } = useOutletContext();
  const [activeIndex, setActiveIndex] = useState(null);
  const dee = PUBLIC_STORIES[0];

  function openStory(story) {
    const index = PUBLIC_STORIES.findIndex((candidate) => candidate.slug === story.slug);
    if (index !== -1) setActiveIndex(index);
  }

  const activeStory = activeIndex === null ? null : PUBLIC_STORIES[activeIndex];

  return (
    <main className="stories stories2-study">
      <section className="stories__room">
        <div className="stories__copy"><p>Stories of Recovery</p><h1>Stories preserved because they may help someone survive.</h1><span>Chosen from hundreds of accounts, each story is presented in the storyteller's own words.  They are not instructions or promises.  They are records of courage, offered openly and held here with care.</span></div>
        <div className="stories2-catalog" aria-label="Archive contents">
          <span><strong>{PUBLIC_STORIES.length}</strong> public stories</span>
          <i aria-hidden="true" />
          <span><strong>01</strong> memorial held here</span>
          <i aria-hidden="true" />
          <span>Shared with permission</span>
        </div>
        <div className="stories__desk">
          <span className="stories2-desk-label" aria-hidden="true">The public archive</span>
          <button className="stories__dee" onClick={() => openStory(dee)}><img src={dee.photo} alt="Dee"/><span>Public success story · Dee</span><blockquote>“{dee.line}”</blockquote></button>
          <div className="stories__prints">{PUBLIC_STORIES.slice(1).map((story) => <button onClick={() => openStory(story)} key={story.slug}><img src={story.photo} alt=""/><span>{story.name}</span></button>)}</div>
          <a className="stories__shawn" href="#stories-shawn"><img src={SHAWN_MEMORIAL.photo} alt="Shawn"/><span>In memoriam · 2017<strong>Shawn</strong></span></a>
        </div>
        <div className="stories__join"><span>When you are ready, there is room inside the community.</span><button onClick={onRegister}>Join the community</button></div>
      </section>
      <ShawnMemorial id="stories-shawn" />

      {/* Experimental — comment out the line below to disable/remove the 3D bonfire section. */}
      <Suspense fallback={null}><CommunityBonfire onSelectStory={openStory} /></Suspense>

      {activeStory && (
        <StoryReader
          story={activeStory}
          returnLabel="Return to the archive"
          onClose={() => setActiveIndex(null)}
          onNext={() => setActiveIndex((index) => (index + 1) % PUBLIC_STORIES.length)}
          onPrev={() => setActiveIndex((index) => (index - 1 + PUBLIC_STORIES.length) % PUBLIC_STORIES.length)}
          position={{ index: activeIndex + 1, total: PUBLIC_STORIES.length }}
        />
      )}
    </main>
  );
}
