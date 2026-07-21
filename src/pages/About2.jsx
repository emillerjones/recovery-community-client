import { useEffect, useRef, useState } from "react";
import "./About2.css";

/**
 * About2 — demonstrates count-up numbers: the stats row below animates
 * from 0 up to each real, derivable figure (years running, core
 * beliefs, ways we help) once it scrolls into view, using
 * requestAnimationFrame with an eased progress curve rather than a
 * hard jump to the final number.
 */

const BELIEFS = [
  { title: "Harm reduction matters", text: "We support people using cannabis as a way to reduce or replace the use of more dangerous and addictive substances." },
  { title: "Recovery has many paths", text: "MMRC does not require one specific program, label, or treatment model. People may combine cannabis substitution with AA, NA, SMART Recovery, HAMS, MAT, Refuge Recovery, or other positive recovery methods." },
  { title: "Peer support is powerful", text: "We are not a medical organization. We are people sharing personal experience, practical support, educational resources, and encouragement with others on similar journeys." },
  { title: "Shame does not heal", text: "Our community is built on inclusiveness, mutual respect, acceptance, and reducing stigma around cannabis use in recovery." },
];

const PROVIDES = [
  { title: "Peer support", text: "A moderated community shaped by lived experience." },
  { title: "Education", text: "Resources about cannabis, recovery, and harm reduction." },
  { title: "Personal experience", text: "Honest accounts from people maintaining recovery." },
  { title: "Recovery stories", text: "Public voices showing what change can look like." },
  { title: "Programs", text: "Future meetings, events, and community programs." },
];

const FOUNDED_YEAR = 2013;

function useCountUp(target, active, duration = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return undefined;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      const frame = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(frame);
    }

    let frame;
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target, duration]);

  return value;
}

function useInView(threshold = 0.4) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) {
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}

function StatBlock({ target, label, active, suffix = "" }) {
  const value = useCountUp(target, active);
  return (
    <div className="about2-stat">
      <strong>{value}{suffix}</strong>
      <span>{label}</span>
    </div>
  );
}

export default function About2() {
  const [statsRef, statsInView] = useInView(0.4);
  const yearsRunning = new Date().getFullYear() - FOUNDED_YEAR;

  return (
    <main className="about2">
      <section className="about2-hero">
        <p className="about2-eyebrow">Established {FOUNDED_YEAR}</p>
        <h1>Recovery with cannabis. Without shame.</h1>
        <p className="about2-lead">
          Maintaining My Recovery with Cannabis exists to support people
          who use cannabis as a form of harm-reduction therapy from
          dangerous or addictive substances.
        </p>

        <aside className="about2-note" aria-label="Design technique: count-up numbers">
          <p className="about2-note__label">Design technique</p>
          <h3>Count-up numbers</h3>
          <p>
            The stats row below doesn't just appear — each number climbs
            from zero to its real value once you scroll to it, using
            <code>requestAnimationFrame</code> with an eased curve rather
            than linear ticking, so it settles instead of just stopping.
          </p>
        </aside>

        <div className="about2-stats" ref={statsRef}>
          <StatBlock target={yearsRunning} suffix="+" label="Years supporting recovery" active={statsInView} />
          <StatBlock target={BELIEFS.length} label="Core beliefs we're rooted in" active={statsInView} />
          <StatBlock target={PROVIDES.length} label="Ways we try to help" active={statsInView} />
        </div>
      </section>

      <section className="about2-foundation">
        <p className="about2-eyebrow">Our founding purpose</p>
        <blockquote>
          The mission of Maintaining My Recovery with Cannabis is to
          develop a recovery support community of people who use cannabis
          as a form of harm-reduction therapy from dangerous or addictive
          substances.
        </blockquote>
        <p>
          We provide support through personal experiences, educational
          resources, and peer support programs — while upholding a
          culture of inclusiveness and mutual respect.
        </p>
      </section>

      <section className="about2-beliefs">
        <p className="about2-eyebrow">What we are rooted in</p>
        <h2>There is more than one way to recover.</h2>
        <div className="about2-belief-list">
          {BELIEFS.map((belief, index) => (
            <article className="about2-belief" key={belief.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{belief.title}</h3>
                <p>{belief.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="about2-provides">
        <p className="about2-eyebrow">What grows from those beliefs</p>
        <h2>Support made visible.</h2>
        <div className="about2-provides-list">
          {PROVIDES.map((item) => (
            <article className="about2-provides-item" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about2-boundary">
        <p className="about2-eyebrow">Our boundary</p>
        <p>
          <strong>Maintaining My Recovery with Cannabis is a volunteer
          support group sharing practical information.</strong> This is
          not a professional or medical organization. The information
          provided is for informational and educational purposes only and
          is not a substitute for professional care.
        </p>
      </section>
    </main>
  );
}
