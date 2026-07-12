import { useOutletContext } from "react-router-dom";
import { PUBLIC_STORIES, SHAWN_MEMORIAL } from "../data/publicStories";
import { STORY_VISUALS } from "./storyMotifs";
import "./StoriesConceptBody.css";

const ORBIT = PUBLIC_STORIES.map((story, index) => ({
  ...story,
  angle: index * 36,
}));

const SHAWN_VISUAL = {
  accent: "#d0a45f",
  motif: [
    "M120 18C103 52 96 76 104 99C111 119 127 125 120 154C145 139 159 119 154 95C151 77 139 61 145 39C126 51 124 70 120 82C113 62 116 39 120 18Z",
    "M120 154L120 218",
    "M120 175C92 185 70 202 53 226",
    "M120 184C146 192 169 207 190 229",
    "M120 197C103 207 92 220 83 235",
    "M120 201C137 211 150 224 158 238",
  ],
};

function FullStory({ story, index }) {
  const visual = STORY_VISUALS[story.slug];
  return (
    <details
      className="scb-story"
      id={`full-${story.slug}`}
      open={index === 0}
      style={{ "--story-accent": visual.accent }}
    >
      <summary>
        <div className="scb-story__art" aria-hidden="true">
          <svg viewBox="0 0 240 240">
            {visual.motif.map((path) => <path d={path} pathLength="1" key={path} />)}
          </svg>
        </div>
        <div className="scb-story__portrait"><img src={story.photo} alt={`Portrait of ${story.name}`} /></div>
        <div className="scb-story__summary">
          <small>{story.path}</small>
          <h3>{story.name}</h3>
          <p>“{story.line}”</p>
          <span>Read the complete story <b aria-hidden="true">+</b></span>
        </div>
      </summary>
      <div className="scb-story__full">
        {story.contentNote && <p className="scb-story__note">Content note: {story.contentNote}</p>}
        {story.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        <strong>— {story.name}</strong>
      </div>
    </details>
  );
}

export function StoriesConceptBody({ label = "The complete collection" }) {
  const { onRegister } = useOutletContext();

  return (
    <>
      <section className="scb-intro" id="collection">
        <p>{label}</p>
        <h2>Every person receives the space to speak in their own words.</h2>
        <span>Open any portrait to read the complete original story without leaving this page.</span>
      </section>

      <section className="scb-stories" aria-label="Complete public success stories">
        {PUBLIC_STORIES.map((story, index) => <FullStory story={story} index={index} key={story.slug} />)}

        <section
          className="scb-shawn"
          id="full-shawn"
          style={{ "--story-accent": SHAWN_VISUAL.accent }}
        >
          <div className="scb-shawn__art" aria-hidden="true">
            <svg viewBox="0 0 240 240">
              {SHAWN_VISUAL.motif.map((path) => <path d={path} key={path} />)}
            </svg>
          </div>
          <div className="scb-shawn__portrait">
            <img src={SHAWN_MEMORIAL.photo} alt="Shawn" />
            <span>In memoriam · 2017</span>
          </div>
          <div className="scb-shawn__words">
            <small>First member · Founding light</small>
            <h3>Shawn</h3>
            <blockquote>{SHAWN_MEMORIAL.line}</blockquote>
            {SHAWN_MEMORIAL.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <strong>Rest in peace, Shawn.</strong>
          </div>
        </section>
      </section>

      <section className="scb-bonfire">
        <div className="scb-bonfire__scene" aria-label="Recovery stories gathered around the community fire">
          <div className="scb-bonfire__rings" aria-hidden="true" />
          <div className="scb-fire" aria-hidden="true">
            <span className="scb-fire__glow" />
            <span className="scb-fire__shawn"><img src={SHAWN_MEMORIAL.photo} alt="" /></span>
            <span className="scb-fire__flame scb-fire__flame--outer" />
            <span className="scb-fire__flame scb-fire__flame--inner" />
            <span className="scb-fire__flame scb-fire__flame--core" />
            <span className="scb-fire__log scb-fire__log--one" />
            <span className="scb-fire__log scb-fire__log--two" />
            {[1,2,3,4,5,6].map((spark) => <span className={`scb-fire__spark scb-fire__spark--${spark}`} key={spark} />)}
          </div>
          {ORBIT.map((story) => (
            <span className="scb-orbit" style={{ "--angle": `${story.angle}deg` }} key={story.slug}>
              <span className="scb-orbit__card">
                <img src={story.photo} alt="" />
                <span>{story.name}</span>
                <em>“{story.line}”</em>
              </span>
            </span>
          ))}
        </div>
        <div className="scb-bonfire__copy">
          <p>The public stories are only the beginning</p>
          <h2>Come sit with people who understand.</h2>
          <span>
            Inside the community, stories can stay private, questions can be asked without
            judgment, and nobody has to find their way alone.
          </span>
          <button type="button" onClick={onRegister}>Join the community</button>
        </div>
      </section>
    </>
  );
}
