import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import emberBase from "../assets/images/bonfire1.png";
import "./Home6.css";

export default function Home6() {
  const { onRegister } = useOutletContext();
  const [ignited, setIgnited] = useState(false);
  const startY = useRef(0);

  const ignite = () => setIgnited(true);

  useEffect(() => {
    const onScroll = () => window.scrollY > 40 && ignite();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onTouchStart = (e) => (startY.current = e.touches[0].clientY);
  const onTouchMove = (e) => {
    if (startY.current - e.touches[0].clientY > 30) ignite();
  };

  return (
    <div className="h6">
      <section
        className={`h6-hero ${ignited ? "h6-ignited" : ""}`}
        onClick={ignite}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
      >
        <div className="h6-hero__bg" />

        <div className="h6-fire-stage">
          <img src={emberBase} alt="" className="h6-ember-img" />

          <div className="h6-glow" />

          <div className="h6-smoke">
            <span /><span /><span />
          </div>

          <div className="h6-sparks">
            <span /><span /><span /><span /><span />
          </div>

          <svg className="h6-flame" viewBox="0 0 100 140">
            <path className="h6-flame-outer" d="M50 10 C20 50 15 75 30 100 C22 90 28 75 35 70 C30 90 40 110 60 120 C50 105 55 90 65 82 C68 100 85 105 80 125 C100 110 95 75 75 55 C78 70 70 78 65 72 C72 55 60 30 50 10 Z" />
            <path className="h6-flame-inner" d="M50 40 C35 65 32 82 42 100 C38 90 42 80 48 76 C45 92 55 105 65 108 C58 98 60 88 66 84 C70 96 78 98 74 112 C86 100 82 75 68 62 C70 72 64 78 60 74 C64 62 58 48 50 40 Z" />
          </svg>
        </div>

        <div className={`h6-hero__content ${ignited ? "h6-fade-in" : ""}`}>
          <h1>{ignited ? "You don't have to do this alone." : "Every journey starts in the dark."}</h1>
          <p>
            A community of real people walking the path of recovery together.
            Share, support, and grow in a safe, judgment-free space.
          </p>
          <button onClick={onRegister} className="h6-cta">
            Join the Community
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {!ignited && (
          <div className="h6-swipe-cue">
            <span className="h6-arrow" />
            Swipe or scroll to ignite
          </div>
        )}
      </section>
    </div>
  );
}
