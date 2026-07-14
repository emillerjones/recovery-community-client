import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { PUBLIC_STORIES, SHAWN_MEMORIAL } from "../data/publicStories";
import StoryReader from "./StoryReader";
import ShawnMemorial from "./ShawnMemorial";
import "./Stories10.css";

export default function Stories10() {
  const { onRegister } = useOutletContext();
  const [active, setActive] = useState(null);
  const dee = PUBLIC_STORIES[0];
  return (
    <main className="s10-archive">
      <section className="s10-archive__room">
        <div className="s10-archive__copy"><p>Stories of Recovery</p><h1>Stories preserved because they may help someone survive.</h1><span>Chosen from hundreds of accounts, each story is presented in the storyteller's own words.  They are not instructions or promises.  They are records of courage, offered openly and held here with care.</span></div>
        <div className="s10-archive__desk">
          <button className="s10-archive__dee" onClick={() => setActive({ story: dee, memorial: false })}><img src={dee.photo} alt="Dee"/><span>Public success story · Dee</span><blockquote>“{dee.line}”</blockquote></button>
          <div className="s10-archive__prints">{PUBLIC_STORIES.slice(1).map((story) => <button onClick={() => setActive({ story, memorial: false })} key={story.slug}><img src={story.photo} alt=""/><span>{story.name}</span></button>)}</div>
          <a className="s10-archive__shawn" href="#stories10-shawn"><img src={SHAWN_MEMORIAL.photo} alt="Shawn"/><span>In memoriam · 2017<strong>Shawn</strong></span></a>
        </div>
        <div className="s10-archive__join"><span>When you are ready, there is room inside the community.</span><button onClick={onRegister}>Join the community</button></div>
      </section>
      <ShawnMemorial id="stories10-shawn" />
      {active && <StoryReader {...active} returnLabel="Return to the archive" onClose={() => setActive(null)} />}
    </main>
  );
}
