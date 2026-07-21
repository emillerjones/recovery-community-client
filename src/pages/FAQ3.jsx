import { useEffect, useRef, useState } from "react";
import TechniqueNote from "../components/TechniqueNote";
import FAQ from "./FAQ";
import "./FAQ3.css";

const CHAPTERS = ["faq-about-this-community", "faq-privacy-and-trust", "faq-joining"];
const SYMBOLS = [
  "M32 56c-1-17 0-30 4-43M35 34C20 33 11 25 9 12c14 0 24 7 28 20M34 42c13-1 21-8 25-20-13-1-22 5-25 18",
  "M32 7 51 15v16c0 13-8 22-19 27C21 53 13 44 13 31V15ZM23 31l6 6 13-15",
  "M15 56h36M20 56V10h29v46M28 55V18h14v37M38 37h.1M10 19c5-6 10-9 17-10",
];

export default function FAQ3() {
  const studyRef = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const study = studyRef.current;
    if (!study) return undefined;

    const sections = CHAPTERS.map((id) => document.getElementById(id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(CHAPTERS.indexOf(entry.target.id));
      }),
      { rootMargin: "-35% 0px -55%", threshold: 0 }
    );
    sections.forEach((section) => observer.observe(section));

    const animateDisclosure = (event) => {
      const summary = event.target.closest("summary");
      if (!summary || !study.contains(summary)) return;
      const details = summary.closest("details");
      if (!details) return;
      event.preventDefault();
      const toggle = () => { details.open = !details.open; };
      if (document.startViewTransition) document.startViewTransition(toggle);
      else toggle();
    };

    study.addEventListener("click", animateDisclosure);
    return () => {
      observer.disconnect();
      study.removeEventListener("click", animateDisclosure);
    };
  }, []);

  return (
    <div className="faq3-study" ref={studyRef}>
      <TechniqueNote
        number="03"
        title="Morphing symbol rail + animated reflow"
        how="A persistent line drawing redraws itself for each chapter. FAQ disclosures use an element-scoped View Transition so the surrounding questions recompose as one continuous layout."
        watch="The small symbol at the screen edge changes from leaf to shield to doorway. Open and close answers and watch neighboring questions retain their spatial context."
      />
      <div className="faq3-symbol" aria-hidden="true">
        <span>0{active + 1}</span>
        <svg viewBox="0 0 64 64" key={active}>
          <path d={SYMBOLS[active]} pathLength="1" />
        </svg>
      </div>
      <FAQ />
    </div>
  );
}
