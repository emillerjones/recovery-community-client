import { useEffect, useRef, useState } from "react";
import { Flame } from "lucide-react";
import { PUBLIC_STORIES, SHAWN_MEMORIAL } from "../data/publicStories";
import { STORY_VISUALS } from "./storyMotifs";
import StoryReader from "./StoryReader";
import ShawnMemorial from "./ShawnMemorial";
import "./Stories3.css";
import "./Stories3b.css";

const HONOR_ROLL = [...PUBLIC_STORIES, SHAWN_MEMORIAL];

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.15 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

function useScrollProgress(ref) {
  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    let frame = null;
    function update() {
      frame = null;
      const rect = node.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -rect.top / (rect.height * 0.7)));
      node.style.setProperty("--scroll-progress", progress.toFixed(3));
    }
    function onScroll() { if (frame === null) frame = requestAnimationFrame(update); }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [ref]);
}

export default function Stories3b() {
  const [active, setActive] = useState(null);
  const [honorRef, honorVisible] = useReveal();
  const heroSceneRef = useRef(null);
  useScrollProgress(heroSceneRef);

  return (
    <main className="s3-page s3b-page">
      <section className="s3-monument-hero">
        <div className="s3-monument-hero__stars" aria-hidden="true" />
        <div className="s3-monument-hero__glow" aria-hidden="true" />

        <p className="s3-monument-hero__eyebrow">In honor of public success stories</p>
        <h1 className="s3-monument-hero__plaque">Eleven who fought their way back —<br />and chose, in the open,<br />to light the way for others.</h1>
        <p className="s3-monument-hero__sub">Hand-chosen from hundreds of stories. Held here in a place of honor.</p>

        <div className="s3-hero-scene" ref={heroSceneRef}>
          <div className="s3-flame-monument">
            <span className="s3-flame-monument__glow" aria-hidden="true" />
            <span className="s3-flame-monument__ghost" aria-hidden="true"><img src={SHAWN_MEMORIAL.photo} alt="" /></span>
            <span className="s3-flame-monument__flame" aria-hidden="true">
              <span className="s3-flame-monument__outer" /><span className="s3-flame-monument__middle" /><span className="s3-flame-monument__inner" /><span className="s3-flame-monument__core" />
            </span>
            <span className="s3-flame-monument__embers" aria-hidden="true">{[1,2,3,4,5,6,7].map((ember) => <i className={`s3-flame-monument__ember s3-flame-monument__ember--${ember}`} key={ember} />)}</span>
            <span className="s3-flame-monument__plinth" aria-hidden="true"><span className="s3-flame-monument__plinth-top" /><span className="s3-flame-monument__inscription"><small>In loving memory</small><strong>Shawn · 2017</strong></span></span>
          </div>

          <ul ref={honorRef} className={`s3-honor-roll-list ${honorVisible ? "is-visible" : ""}`}>
            {HONOR_ROLL.map((person, index) => {
              const isMemorial = person.slug === "shawn";
              const visual = STORY_VISUALS[person.slug];
              return (
                <li key={person.slug} style={{ "--i": index }}>
                  {isMemorial ? (
                    <a className="s3-medallion s3-medallion--memorial" href="#stories3b-shawn">
                      <span className="s3-medallion__ring"><img src={person.photo} alt="" /></span><Flame className="s3-medallion__flame" size={12} aria-hidden="true" /><span>{person.name}</span>
                    </a>
                  ) : (
                    <button className="s3-medallion s3b-medallion-button" type="button" onClick={() => setActive({ story: person, memorial: false })} style={visual ? { "--accent": visual.accent } : undefined}>
                      <span className="s3-medallion__ring"><img src={person.photo} alt="" /></span><span>{person.name}</span>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        <a className="s3-monument-hero__cue" href="#stories3b-shawn">Shawn&rsquo;s memorial <span>↓</span></a>
      </section>

      <ShawnMemorial id="stories3b-shawn" />
      {active && <StoryReader {...active} returnLabel="Return to the monument" onClose={() => setActive(null)} />}
    </main>
  );
}
