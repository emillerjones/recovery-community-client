import { useState } from "react";
import { PUBLIC_STORIES, SHAWN_MEMORIAL } from "../data/publicStories";
import { StoriesConceptBody } from "./StoriesConceptBody";
import "./Stories6.css";

export default function Stories6() {
  const [light, setLight] = useState({ x: 68, y: 48 });

  function moveLight(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    setLight({
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
    });
  }

  return (
    <main className="s6">
      <section
        className="s6-hall"
        onPointerMove={moveLight}
        style={{ "--light-x": `${light.x}%`, "--light-y": `${light.y}%` }}
      >
        <div className="s6-copy">
          <p>Portraits of recovery</p>
          <h1>Take the time to witness them.</h1>
          <span>Ten living stories selected with care. One founding member remembered.</span>
        </div>

        <div className="s6-windows" aria-label="A gallery of public recovery stories">
          {PUBLIC_STORIES.map((story, index) => (
            <a className={`s6-frame s6-frame--${(index % 4) + 1} ${index === 0 ? "featured" : ""}`} href={`#full-${story.slug}`} key={story.slug}>
              <img src={story.photo} alt={story.name} />
              <span><b>{story.name}</b><small>“{story.line}”</small></span>
            </a>
          ))}
          <a className="s6-frame memorial" href="#full-shawn">
            <img src={SHAWN_MEMORIAL.photo} alt="Shawn" />
            <span><b>Shawn</b><small>In memoriam · 2017</small></span>
          </a>
        </div>

        <div className="s6-lamp" aria-hidden="true" />
        <a href="#collection" className="s6-cue">Walk into the gallery ↓</a>
      </section>
      <StoriesConceptBody />
    </main>
  );
}
