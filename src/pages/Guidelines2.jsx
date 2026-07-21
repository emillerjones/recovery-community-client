import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Ban,
  Heart,
  LockKeyhole,
  Mail,
  MegaphoneOff,
  MessageCircle,
  ScrollText,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import "./Guidelines2.css";

/**
 * Guidelines2 — demonstrates a progressive blur-to-focus reveal: each
 * rule below starts slightly blurred and scaled down, then sharpens
 * into full focus as it scrolls into view. It reads as "coming into
 * clarity" rather than just fading or sliding in, which suits a page
 * about rules becoming clear.
 */

const GUIDELINES = [
  {
    number: "01",
    icon: LockKeyhole,
    title: "Confidentiality",
    text: "All information shared in the group should remain confidential and is not to leave the group. Privacy is of the highest importance. Please understand that there is always slight risk when sharing information online.",
  },
  {
    number: "02",
    icon: Ban,
    title: "No Illegal Activity",
    text: "You may not use our service for any unlawful purposes. We do not endorse going against your current local laws regarding substance use or possession. We are not here to tell you how to break or circumvent the law.",
  },
  {
    number: "03",
    icon: Heart,
    title: "Acceptance",
    text: "The group accepts members just as they are and remains non-judgmental at all times. We remain open-minded and kind to all.",
  },
  {
    number: "04",
    icon: MessageCircle,
    title: "Stay On Topic",
    text: "We discuss things related only to cannabis, substance dependence/addiction and recovery. We refrain from topics that are political or religious in nature.",
  },
  {
    number: "05",
    icon: UsersRound,
    title: "Sharing",
    text: "Focus on the person sharing and do not offer unsolicited advice.",
  },
  {
    number: "06",
    icon: MegaphoneOff,
    title: "No Spamming, Advertisements, Trolling",
    text: "Spam, or the repetitive display of the same text again and again, is not allowed. Advertising for the purpose of selling, soliciting or promoting something is also prohibited.",
  },
  {
    number: "07",
    icon: ShieldCheck,
    title: "Admins/Moderators",
    text: "The admins/moderators are here to lead the group and facilitate the discussion. They reserve the right to remove any post/comment at any time. Please respect that they are generous volunteers.",
  },
];

export default function Guidelines2() {
  const listRef = useRef(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return undefined;

    const cards = list.querySelectorAll(".guideline2-card");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      cards.forEach((card) => card.classList.add("is-focused"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-focused");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.35 }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="guidelines2">
      <section className="guidelines2-hero">
        <p className="guidelines2-eyebrow">Our community culture</p>
        <h1>Guidelines</h1>
        <p>All members must agree to follow these guidelines and acknowledge the disclaimer below.</p>

        <aside className="guidelines2-note" aria-label="Design technique: progressive blur-to-focus reveal">
          <p className="guidelines2-note__label">Design technique</p>
          <h3>Progressive blur-to-focus reveal</h3>
          <p>
            Scroll down — each rule starts out-of-focus and sharpens as
            it reaches the center of the screen. It's a plain CSS
            <code>filter: blur()</code> transition toggled by an
            IntersectionObserver, so it costs nothing extra on mobile.
          </p>
        </aside>
      </section>

      <section className="guidelines2-body" ref={listRef}>
        {GUIDELINES.map((item) => {
          const ItemIcon = item.icon;
          return (
            <article className="guideline2-card" key={item.number}>
              <div className="guideline2-card__meta">
                <span className="guideline2-card__number">{item.number}</span>
                <span className="guideline2-card__icon"><ItemIcon /></span>
              </div>
              <div>
                <h2>{item.title}</h2>
                <p>{item.text}</p>
              </div>
            </article>
          );
        })}

        <Link className="guidelines2-contact" to="/contact">
          <Mail />
          <span>Please contact our founder, <strong>Ruth</strong>, for any questions, concerns, or kudos.</span>
        </Link>
      </section>

      <section className="guidelines2-disclaimer">
        <div className="guidelines2-disclaimer__icon"><ShieldCheck /></div>
        <p>
          <strong>Disclaimer:</strong> Recovery With The Exit Drug is a
          volunteer support group sharing practical information. This is
          not a professional or medical organization. The information
          provided in this group is for informational and educational
          purposes only and is not a substitute for professional care.
        </p>
      </section>
    </main>
  );
}
