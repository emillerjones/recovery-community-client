import { useEffect, useRef } from "react";
import TechniqueNote from "../components/TechniqueNote";
import About from "./About";
import "./About3.css";

export default function About3() {
  const studyRef = useRef(null);

  useEffect(() => {
    const study = studyRef.current;
    if (!study) return undefined;

    let frame = 0;
    const update = () => {
      const rect = study.getBoundingClientRect();
      const distance = Math.max(1, study.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / distance));
      study.style.setProperty("--about3-progress", progress.toFixed(4));
      frame = 0;
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="about3-study" ref={studyRef}>
      <TechniqueNote
        number="01"
        title="Continuous golden-thread scrollytelling"
        how="One uninterrupted SVG path is scrubbed by the page's exact scroll progress. It does not simply trigger once; scrolling backward rewinds it."
        watch="Follow the gold thread as it leaves the hero roots, travels through each chapter, loops around key ideas, and resolves near the final boundary."
      />
      <svg className="about3-thread" viewBox="0 0 100 1000" preserveAspectRatio="none" aria-hidden="true">
        <path className="about3-thread__ghost" d="M84 0C88 70 72 117 78 174S91 268 71 330 47 409 58 480 81 563 69 641 40 727 49 809 72 903 53 1000" />
        <path className="about3-thread__live" pathLength="1" d="M84 0C88 70 72 117 78 174S91 268 71 330 47 409 58 480 81 563 69 641 40 727 49 809 72 903 53 1000" />
        {[174, 330, 480, 641, 809].map((y) => <circle cx={y === 480 ? 58 : y === 809 ? 49 : y === 641 ? 69 : y === 330 ? 71 : 78} cy={y} r="1.8" key={y} />)}
      </svg>
      <About />
    </div>
  );
}
