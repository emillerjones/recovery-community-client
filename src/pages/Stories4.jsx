import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { PUBLIC_STORIES, SHAWN_MEMORIAL } from "../data/publicStories";
import "./Stories4.css";

const DEE_STORY = PUBLIC_STORIES.find((story) => story.slug === "dee");
const SELECTED_STORIES = PUBLIC_STORIES.filter((story) => story.slug !== "dee");

function useEntered() {
  const ref = useRef(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setEntered(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -8%" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, entered];
}

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

function GalleryStory({ story, index }) {
  const [ref, entered] = useEntered();

  return (
    <article
      className={`s4-gallery-story ${entered ? "is-entered" : ""}`}
      id={story.slug}
      ref={ref}
    >
      <div className="s4-gallery-story__architecture" aria-hidden="true">
        <span />
        <span />
      </div>
      <div className="s4-gallery-story__inner">
        <div className="s4-gallery-story__portrait">
          <span className="s4-gallery-story__index">{String(index + 1).padStart(2, "0")}</span>
          <img src={story.photo} alt={`Portrait of ${story.name}`} />
          <p>{story.name}</p>
        </div>
        <div className="s4-gallery-story__words">
          <p className="s4-kicker">{story.path}</p>
          <h2>“{story.line}”</h2>
          {story.contentNote && <p className="s4-content-note">Content note: {story.contentNote}</p>}
          <div className="s4-gallery-story__body">
            {story.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <p className="s4-gallery-story__signature">— {story.name}</p>
        </div>
      </div>
    </article>
  );
}

export default function Stories4() {
  const { onRegister } = useOutletContext();

  return (
    <main className="s4-page">
      <section className="s4-chamber">
        <div className="s4-chamber__stone" aria-hidden="true" />
        <div className="s4-chamber__light" aria-hidden="true" />
        <RootRelief />

        <div className="s4-chamber__inscription">
          <p>Stories of recovery</p>
          <h1>
            There is more<br />
            than one way<br />
            through.
          </h1>
          <span>
            One public success story. Nine hand-picked examples of recovery.
            One founding member remembered.
          </span>
        </div>

        <div className="s4-exhibit" aria-label="Featured and selected recovery stories">
          <a className="s4-exhibit__featured" href="#dee">
            <div className="s4-exhibit__portrait">
              <img src={DEE_STORY.photo} alt="Dee" />
              <span>Public success story</span>
            </div>
            <div>
              <p>Dee</p>
              <blockquote>“{DEE_STORY.line}”</blockquote>
              <small>Read Dee’s complete story <span aria-hidden="true">→</span></small>
            </div>
          </a>

          <div className="s4-exhibit__register">
            <p>Hand-picked recovery stories</p>
            <div>
              {SELECTED_STORIES.map((story) => (
                <a href={`#${story.slug}`} key={story.slug}>
                  <img src={story.photo} alt="" />
                  <span>{story.name}</span>
                </a>
              ))}
            </div>
          </div>

          <a className="s4-exhibit__memorial" href="#shawn">
            <span>In memoriam · 2017</span>
            <strong>Shawn</strong>
            <small>First member · Founding light</small>
          </a>
        </div>

        <a className="s4-chamber__threshold" href="#gallery">
          Enter the gallery <span aria-hidden="true">↓</span>
        </a>
      </section>

      <section className="s4-foreword" id="gallery">
        <div>
          <p className="s4-kicker">The public collection</p>
          <h2>These words were given so someone else might recognize a way forward.</h2>
        </div>
        <p>
          Chosen from hundreds of accounts, each story is presented in the storyteller’s
          own words. They are not instructions or promises. They are records of courage,
          offered openly and held here with care.
        </p>
      </section>

      <section className="s4-gallery" aria-label="Complete public success stories">
        {PUBLIC_STORIES.map((story, index) => (
          <GalleryStory story={story} index={index} key={story.slug} />
        ))}
      </section>

      <section className="s4-shawn" id="shawn">
        <div className="s4-shawn__light" aria-hidden="true" />
        <div className="s4-shawn__inner">
          <div className="s4-shawn__portrait">
            <img src={SHAWN_MEMORIAL.photo} alt="Shawn standing on the remains of his home after the Joplin tornado" />
            <span>2017</span>
          </div>
          <div className="s4-shawn__words">
            <p className="s4-kicker">In memoriam · First member · Founding light</p>
            <h2>Shawn</h2>
            <blockquote>{SHAWN_MEMORIAL.line}</blockquote>
            <div className="s4-shawn__body">
              {SHAWN_MEMORIAL.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            <p className="s4-shawn__rest">Rest in peace.</p>
          </div>
        </div>
      </section>

      <section className="s4-continuation">
        <RootRelief />
        <div>
          <p className="s4-kicker">The story continues</p>
          <h2>A light left for someone else does not end with the telling.</h2>
          <p>
            Inside the community, people can read, listen, ask for help, or share only
            what they are ready to share.
          </p>
          <button type="button" onClick={onRegister}>Join the community</button>
        </div>
      </section>
    </main>
  );
}
