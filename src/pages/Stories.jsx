import { lazy, Suspense, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { PUBLIC_STORIES, SHAWN_MEMORIAL } from "../data/publicStories";
import StoryReader from "./StoryReader";
import ShawnMemorial from "./ShawnMemorial";
import "./Stories.css";

// Lazy-loaded: this pulls in three.js/R3F/postprocessing/three.quarks, which
// is a heavy stack we don't want in the app's main bundle. Splitting it into
// its own chunk means only people who reach /stories ever download it.
const CommunityBonfire = lazy(() => import("./CommunityBonfire"));

export default function Stories() {
  const { onRegister } = useOutletContext();
  const [active, setActive] = useState(null);
  const dee = PUBLIC_STORIES[0];
  return (
    <main className="stories">
      <section className="stories__room">
        <div className="stories__copy"><p>Stories of Recovery</p><h1>Stories preserved because they may help someone survive.</h1><span>Chosen from hundreds of accounts, each story is presented in the storyteller's own words.  They are not instructions or promises.  They are records of courage, offered openly and held here with care.</span></div>
        <div className="stories__desk">
          <button className="stories__dee" onClick={() => setActive({ story: dee })}><img src={dee.photo} alt="Dee"/><span>Public success story · Dee</span><blockquote>“{dee.line}”</blockquote></button>
          <div className="stories__prints" role="region" aria-label="More recovery stories">{PUBLIC_STORIES.slice(1).map((story) => <button onClick={() => setActive({ story })} key={story.slug}><img src={story.photo} alt=""/><span>{story.name}</span></button>)}</div>
          <a className="stories__shawn" href="#stories-shawn"><img src={SHAWN_MEMORIAL.photo} alt="Shawn"/><span>In memoriam · 2017<strong>Shawn</strong></span></a>
        </div>
        <div className="stories__join"><span>When you are ready, there is room inside the community.</span><button onClick={onRegister}>Join the community</button></div>
      </section>
      <ShawnMemorial id="stories-shawn" />

      {/* Experimental — comment out the line below to disable/remove the 3D bonfire section. */}
      <Suspense fallback={null}><CommunityBonfire onSelectStory={(story) => setActive({ story })} /></Suspense>

      {active && <StoryReader {...active} returnLabel="Return to the archive" onClose={() => setActive(null)} />}
    </main>
  );
}
