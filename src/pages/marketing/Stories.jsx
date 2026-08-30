import { useOutletContext, useSearchParams } from "react-router-dom";
import { PUBLIC_STORIES, SHAWN_MEMORIAL } from "../../data/publicStories";
import StoryReader from "./StoryReader";
import ShawnMemorial from "./ShawnMemorial";
import "./Stories.css";

export default function Stories() {
  const { onRegister } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeStory = PUBLIC_STORIES.find((story) => story.slug === searchParams.get("story"));
  const dee = PUBLIC_STORIES[0];

  function openStory(story) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("story", story.slug);
    setSearchParams(nextParams);
  }

  function closeStory() {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("story");
    setSearchParams(nextParams, { replace: true });
  }

  return (
    <main className="stories" data-nav-theme="light">
      <section className="stories__room">
        <div className="stories__copy"><p>Stories of Recovery</p><h1>Stories preserved because they may help someone survive.</h1><span>Chosen from hundreds of accounts, each story is presented in the storyteller's own words.  They are not instructions or promises.  They are records of courage, offered openly and held here with care.</span></div>
        <div className="stories__desk">
          <button className="stories__dee" onClick={() => openStory(dee)}><img src={dee.photo} alt="Dee"/><span>Public success story · Dee</span><blockquote>“{dee.line}”</blockquote></button>
          <div className="stories__prints" role="region" aria-label="More recovery stories">{PUBLIC_STORIES.slice(1).map((story) => <button onClick={() => openStory(story)} key={story.slug}><img src={story.photo} alt=""/><span>{story.name}</span></button>)}</div>
          <a className="stories__shawn" href="#stories-shawn"><img src={SHAWN_MEMORIAL.photo} alt="Shawn"/><span>In memoriam · 2017<strong>Shawn</strong></span></a>
        </div>
        <div className="stories__join"><span>When you are ready, there is room inside the community.</span><button onClick={onRegister}>Join the community</button></div>
      </section>
      <ShawnMemorial id="stories-shawn" />

      {/* The experimental CommunityBonfire section is intentionally hidden. */}

      {activeStory && <StoryReader story={activeStory} returnLabel="Return to the archive" onClose={closeStory} />}
    </main>
  );
}
