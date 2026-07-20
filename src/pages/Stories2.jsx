import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { PUBLIC_STORIES } from "../data/publicStories";
import StoryReader from "./StoryReader";
import ShawnMemorial from "./ShawnMemorial";
import "./Stories2.css";

// Lazy-loaded: this pulls in three.js/R3F/postprocessing/three.quarks, which
// is a heavy stack we don't want in the app's main bundle. Splitting it into
// its own chunk means only people who reach /stories2 ever download it.
const CommunityBonfire = lazy(() => import("./CommunityBonfire"));

const CHAPTERS = [
  { id: "stories2-desk", numeral: "I", label: "The Desk" },
  { id: "stories2-memorial", numeral: "II", label: "In Memoriam" },
  { id: "stories2-fire", numeral: "III", label: "Around the Fire" },
  { id: "stories2-join", numeral: "IV", label: "Add Yours" },
];

function useActiveChapter(ids) {
  const [active, setActive] = useState(null);

  useEffect(() => {
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!sections.length || !("IntersectionObserver" in window)) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

const CHAPTER_IDS = CHAPTERS.map((chapter) => chapter.id);

export default function Stories2() {
  const { onRegister } = useOutletContext();
  const [activeIndex, setActiveIndex] = useState(null);
  const activeChapter = useActiveChapter(CHAPTER_IDS);
  const [deskRef, deskVisible] = useReveal(0.1);

  const dee = PUBLIC_STORIES[0];
  const prints = PUBLIC_STORIES.slice(1);

  function openStory(story) {
    const index = PUBLIC_STORIES.findIndex((candidate) => candidate.slug === story.slug);
    if (index !== -1) setActiveIndex(index);
  }

  const activeStory = activeIndex === null ? null : PUBLIC_STORIES[activeIndex];

  return (
    <main className="stories2">
      <nav className="stories2-rail" aria-label="Archive chapters">
        {CHAPTERS.map((chapter) => (
          <a
            href={`#${chapter.id}`}
            key={chapter.id}
            className={activeChapter === chapter.id ? "is-active" : undefined}
            aria-current={activeChapter === chapter.id ? "true" : undefined}
          >
            <span>{chapter.numeral}</span>
            <em>{chapter.label}</em>
          </a>
        ))}
      </nav>

      <section className="stories2-threshold">
        <div className="stories2-threshold__glow" aria-hidden="true" />
        <div className="stories2-threshold__inner">
          <p className="stories2-kicker">The public archive</p>
          <h1>Stories preserved because they may help someone survive.</h1>
          <p className="stories2-lead">
            Chosen from hundreds of accounts, each story is presented in the
            storyteller's own words. They are not instructions or promises.
            They are records of courage, offered openly and held here with
            care.
          </p>

          <div className="stories2-stats">
            <div>
              <strong>{PUBLIC_STORIES.length}</strong>
              <span>Public stories</span>
            </div>
            <div>
              <strong>01</strong>
              <span>Memorial held here</span>
            </div>
            <div>
              <strong>—</strong>
              <span>Shared with permission</span>
            </div>
          </div>

          <a className="stories2-threshold__cue" href="#stories2-desk">
            <span aria-hidden="true" />
            Enter the archive
          </a>
        </div>
      </section>

      <section className="stories2-chapter stories2-desk" id="stories2-desk">
        <header className="stories2-chapter__head">
          <span className="stories2-chapter__numeral">I</span>
          <div>
            <p>Chapter one</p>
            <h2>The desk.</h2>
            <p className="stories2-chapter__intro">
              Kept the way any real archive keeps its records — one account
              featured, the rest laid out and waiting to be found. Choose a
              photograph to read the whole story.
            </p>
          </div>
        </header>

        <div className={`stories2-board ${deskVisible ? "is-in" : ""}`} ref={deskRef}>
          <button type="button" className="stories2-feature" onClick={() => openStory(dee)}>
            <div className="stories2-feature__photo">
              <img src={dee.photo} alt="Portrait of Dee" />
            </div>
            <div className="stories2-feature__body">
              <span>Featured account</span>
              <blockquote>“{dee.line}”</blockquote>
              <strong>Read Dee's story →</strong>
            </div>
          </button>

          <div className="stories2-grid" aria-label="More stories from the archive">
            {prints.map((story) => (
              <button type="button" onClick={() => openStory(story)} key={story.slug}>
                <img src={story.photo} alt="" />
                <span>{story.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="stories2-chapter stories2-memorial" id="stories2-memorial">
        <header className="stories2-chapter__head stories2-chapter__head--dark">
          <span className="stories2-chapter__numeral">II</span>
          <div>
            <p>Chapter two</p>
            <h2>In memoriam.</h2>
            <p className="stories2-chapter__intro">
              Not every story in this archive is still being written. Some
              are kept exactly as they were left to us.
            </p>
          </div>
        </header>
        <ShawnMemorial id="stories-shawn" />
      </section>

      <section className="stories2-chapter stories2-fire" id="stories2-fire">
        <div className="stories2-fire__marker">
          <span className="stories2-chapter__numeral">III</span>
          <p>Chapter three</p>
        </div>
        <Suspense fallback={null}>
          <CommunityBonfire onSelectStory={openStory} />
        </Suspense>
      </section>

      <section className="stories2-join" id="stories2-join">
        <span className="stories2-chapter__numeral">IV</span>
        <p className="stories2-kicker">Chapter four</p>
        <h2>Your story could sit on this desk one day.</h2>
        <p>When you are ready, there is room inside the community.</p>
        <button type="button" onClick={onRegister}>
          Join the community
        </button>
      </section>

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
