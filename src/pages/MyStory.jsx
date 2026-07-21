import { useEffect, useRef, useState } from "react";
import "./MyStory.css";
import heroPhoto from "../assets/images/mystory.jpg";

// PLACEHOLDER COPY — replace with Lainie's real story. Tone is intentionally
// silly/joking per request until real content is provided.

const AUTO_SCROLL_DELAY_MS = 1800;
const AUTO_SCROLL_SPEED = 12;
const SCROLL_KEYS = new Set(["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "]);

export default function MyStory() {
  const pageRef = useRef(null);
  const autoStartTimerRef = useRef(null);
  const [autoReading, setAutoReading] = useState(false);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return undefined;

    const marks = page.querySelectorAll(".mystory-chapter-mark");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      marks.forEach((mark) => mark.classList.add("is-in"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );

    marks.forEach((mark) => observer.observe(mark));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function cancelPendingStart() {
      window.clearTimeout(autoStartTimerRef.current);
      autoStartTimerRef.current = null;
    }

    function pauseForUserInput(event) {
      if (event.target?.closest?.(".mystory-auto-read")) return;
      if (event.type === "keydown" && !SCROLL_KEYS.has(event.key)) return;
      cancelPendingStart();
      setAutoReading(false);
    }

    if (!reducedMotion) {
      autoStartTimerRef.current = window.setTimeout(() => {
        setAutoReading(true);
        autoStartTimerRef.current = null;
      }, AUTO_SCROLL_DELAY_MS);
    }

    window.addEventListener("wheel", pauseForUserInput, { passive: true });
    window.addEventListener("touchstart", pauseForUserInput, { passive: true });
    window.addEventListener("pointerdown", pauseForUserInput);
    window.addEventListener("keydown", pauseForUserInput);

    return () => {
      cancelPendingStart();
      window.removeEventListener("wheel", pauseForUserInput);
      window.removeEventListener("touchstart", pauseForUserInput);
      window.removeEventListener("pointerdown", pauseForUserInput);
      window.removeEventListener("keydown", pauseForUserInput);
    };
  }, []);

  useEffect(() => {
    if (!autoReading) return undefined;

    let frameId;
    let previousTime;

    function advance(timestamp) {
      if (previousTime !== undefined) {
        const elapsedSeconds = Math.min((timestamp - previousTime) / 1000, 0.05);
        const scrollLimit = document.documentElement.scrollHeight - window.innerHeight;

        if (window.scrollY >= scrollLimit - 2) {
          setAutoReading(false);
          return;
        }

        window.scrollBy(0, AUTO_SCROLL_SPEED * elapsedSeconds);
      }

      previousTime = timestamp;
      frameId = window.requestAnimationFrame(advance);
    }

    frameId = window.requestAnimationFrame(advance);
    return () => window.cancelAnimationFrame(frameId);
  }, [autoReading]);

  function toggleAutoReading() {
    window.clearTimeout(autoStartTimerRef.current);
    autoStartTimerRef.current = null;
    setAutoReading((reading) => !reading);
  }

  return (
    <>
      <div className="mystory mystory-study" data-nav-theme="light" ref={pageRef}>
        <div
          className="mystory-hero__photo"
          style={{ backgroundImage: `url(${heroPhoto})` }}
        />

        <span className="mystory__eyebrow">The 100% real actual story, no ai</span>

        <h1 className="mystory__title">
          Listen
          <br />
          <span>to my story.</span>
        </h1>

        <div className="mystory-chapter-mark" aria-hidden="true"><span>I</span><i /></div>

        <p className="mystory__opening">
          This...
          <br />
          may be our last chance.
        </p>

        <p>
          If this story has a beginning... I suppose it starts around a bonfire.
        </p>

        <p>
          Not <em>this</em> bonfire. Another one. Or maybe they're the same.
          Memory has a funny way of changing places over time.
        </p>

        <p>
          Back then, I didn't know where the road would lead. I only knew there
          were people hurting, people searching for another way, and a world that
          kept insisting there was only one path forward.
        </p>

        <p className="mystory__quote">
          They called it impossible.
          <br />
          They called it dangerous.
          <br />
          They called it a gateway drug.
        </p>

        <p>
          Funny how names can become monsters if you hear them often enough.
        </p>

        <div className="mystory-chapter-mark" aria-hidden="true"><span>II</span><i /></div>

        <p>
          So I summoned up the courage, and protected by my loyal guardian, the pilgrimage began.
        </p>

        <p>
          Just a stubborn dream that maybe cannabis could help some people leave far
          more destructive substances behind... and maybe those people deserved a
          place where they weren't judged for it.
        </p>

        <p>
          Along the way I met incredible people.
        </p>

        <p>
          Some had already defeated their own version of Sin.
        </p>

        <p>
          Some were still standing at the beginning of their journey.
        </p>

        <p>
          Some had completely lost hope.
        </p>

        <p>
          Every one of them became part of my story.
        </p>

        <p>
          Together we crossed mountains, wandered through forests, survived random
          encounters, ignored unsolicited lectures from Maesters, defeated at least
          one suspiciously well-dressed villain, and somehow built Recovery With The
          Exit Drug along the way.
        </p>

        <p>
          Looking back...
        </p>

        <p>
          I don't remember every step, I remember the people and the shared community.
        </p>

        <p>
          Some may call it hope.

          Some call it community.

          I like to think we're just here, huddled around our bonfire
          quietly rekindling one another's spirits,
          one story at a time ...
        </p>

        <div className="mystory-chapter-mark" aria-hidden="true"><span>III</span><i /></div>

        <p className="mystory__ending">
          Until then...
          <br />
          thank you for listening to my story.
        </p>

        <p className="mystory__signoff">
          — Summoner Lainie (Protector of Spira)
        </p>
      </div>

      <button
        type="button"
        className={`mystory-auto-read ${autoReading ? "is-reading" : ""}`}
        aria-pressed={autoReading}
        onClick={toggleAutoReading}
      >
        <span aria-hidden="true" />
        {autoReading ? "Pause slow reading" : "Start slow reading"}
      </button>
    </>
  );
}
