import { useState } from "react";
import { PUBLIC_STORIES, SHAWN_MEMORIAL } from "../data/publicStories";
import StoryReader from "./StoryReader";
import ShawnMemorial from "./ShawnMemorial";
import "./Stories4.css";
import "./Stories4b.css";

const DEE_STORY = PUBLIC_STORIES.find((story) => story.slug === "dee");
const SELECTED_STORIES = PUBLIC_STORIES.filter((story) => story.slug !== "dee");

function RootRelief() {
  return (
    <svg className="s4-root-relief" viewBox="0 0 560 380" aria-hidden="true">
      <path d="M280 26c-8 62-7 112 2 153 8 38 7 84-2 174" />
      <path d="M280 88c-49-23-91-53-128-87M279 125c57-21 106-53 147-96" />
      <path d="M281 174c-65-1-123-16-174-45M282 191c59 4 116-8 171-36" />
      <path d="M279 224c-29 39-72 75-129 108M281 228c32 44 78 79 137 106" />
      <path d="M278 256c-12 37-38 75-79 113M282 263c14 36 43 71 86 105" />
      <path d="M280 292c-3 25-15 52-36 81M282 297c5 23 19 48 42 75" />
    </svg>
  );
}

export default function Stories4b() {
  const [active, setActive] = useState(null);

  return (
    <main className="s4-page s4b-page">
      <section className="s4-chamber">
        <div className="s4-chamber__stone" aria-hidden="true" />
        <div className="s4-chamber__light" aria-hidden="true" />
        <RootRelief />

        <div className="s4-chamber__inscription">
          <p>Stories of recovery</p>
          <h1>There is more<br />than one way<br />through.</h1>
          <span>One public success story. Nine hand-picked examples of recovery. One founding member remembered.</span>
        </div>

        <div className="s4-exhibit" aria-label="Featured and selected recovery stories">
          <button className="s4-exhibit__featured s4b-story-button" type="button" onClick={() => setActive({ story: DEE_STORY, memorial: false })}>
            <div className="s4-exhibit__portrait"><img src={DEE_STORY.photo} alt="Dee" /><span>Public success story</span></div>
            <div><p>Dee</p><blockquote>“{DEE_STORY.line}”</blockquote><small>Read Dee&rsquo;s complete story <span aria-hidden="true">→</span></small></div>
          </button>

          <div className="s4-exhibit__register">
            <p>Hand-picked recovery stories</p>
            <div>{SELECTED_STORIES.map((story) => <button className="s4b-register-button" type="button" onClick={() => setActive({ story, memorial: false })} key={story.slug}><img src={story.photo} alt="" /><span>{story.name}</span></button>)}</div>
          </div>

          <a className="s4-exhibit__memorial" href="#stories4b-shawn"><span>In memoriam · 2017</span><strong>Shawn</strong><small>First member · Founding light</small></a>
        </div>

        <a className="s4-chamber__threshold" href="#stories4b-shawn">Shawn&rsquo;s memorial <span aria-hidden="true">↓</span></a>
      </section>

      <ShawnMemorial id="stories4b-shawn" />
      {active && <StoryReader {...active} returnLabel="Return to the chamber" onClose={() => setActive(null)} />}
    </main>
  );
}
