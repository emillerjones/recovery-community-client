import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Ban,
  Heart,
  Image,
  LockKeyhole,
  Mail,
  MegaphoneOff,
  MessageCircle,
  ScrollText,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import "./Guidelines.css";

const API = import.meta.env.VITE_API;
const ICONS = { LockKeyhole, Heart, UsersRound, MegaphoneOff, Ban, MessageCircle, Image, ShieldCheck };

function useActiveGuideline(ids) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!sections.length || !("IntersectionObserver" in window)) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}


export default function Guidelines() {
  const [content, setContent] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API}/api/guidelines`, { signal: controller.signal })
      .then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.message || "Guidelines could not be loaded."); setContent(data.content); })
      .catch(error => { if (error.name !== "AbortError") setError(error.message); });
    return () => controller.abort();
  }, [attempt]);
  if (!content) return <main className="guidelines-load-state"><h1>Guidelines</h1><p role="status">{error || "Loading guidelines..."}</p>{error && <button type="button" onClick={() => { setError(""); setAttempt(value => value + 1); }}>Try again</button>}</main>;
  return <GuidelinesContent content={content} />;
}

function GuidelinesContent({ content }) {
  const page = content.page;
  const guidelines = useMemo(() => content.items.map((item, index) => ({ ...item, number: String(index + 1).padStart(2, "0"), icon: ICONS[item.icon] || ShieldCheck })), [content.items]);
  const ids = useMemo(() => guidelines.map(item => `guideline-${item.id}`), [guidelines]);
  const activeGuideline = useActiveGuideline(ids);

  return (
    <main className="guidelines-page">
      <section className="guidelines-hero" data-nav-theme="light">
        <div className="guidelines-inner guidelines-hero__inner">
          <div className="guidelines-hero__copy">
            <p className="guidelines-eyebrow">{page.eyebrow}</p>
            <h1 className="guidelines-title">{page.title}</h1>
            <p className="guidelines-intro">{page.intro}</p>
          </div>
          <svg className="guidelines-hero__art" viewBox="0 0 460 360" aria-hidden="true">
            <path className="guidelines-hero__orbit" d="M38 180C38 85 117 28 232 28c118 0 190 58 190 153 0 97-76 151-193 151S38 276 38 180Z" />
            <path className="guidelines-hero__paper" d="M126 65h174l55 55v173H126Z" />
            <path className="guidelines-hero__fold" d="M300 65v55h55" />
            <path className="guidelines-hero__rule" d="M169 145h143M169 177h143M169 209h103M169 241h125" />
            <path className="guidelines-hero__shield" d="M112 221l43 17v37c0 33-20 57-43 69-23-12-43-36-43-69v-37Z" />
            <path className="guidelines-hero__check" d="m92 276 14 14 27-31" />
          </svg>
        </div>
      </section>

      <section className="guidelines-body">
        <div className="guidelines-inner guidelines-layout">
          <aside className="guidelines-side-card">
            <div className="guidelines-side-card__icon"><ShieldCheck /></div>
            <span className="guidelines-side-card__label">{page.sideLabel}</span>
            <h2>{page.sideTitle1}{" "}<br />{page.sideTitle2}{" "}<br />{page.sideTitle3}</h2>
            <p>{page.sideText}</p>
            <nav className="guidelines-index" aria-label="Guideline index">
              {guidelines.map((item) => {
                const id = `guideline-${item.id}`;
                return (
                  <a
                    href={`#${id}`}
                    key={item.id}
                    className={activeGuideline === id ? "is-active" : undefined}
                    aria-current={activeGuideline === id ? "true" : undefined}
                  >
                    <span>{item.number}</span>
                    <span className="guidelines-index__label">{item.title}</span>
                  </a>
                );
              })}
            </nav>
          </aside>

          <div className="guidelines-charter">
            <div className="guidelines-charter__heading">
              <ScrollText />
              <span>{page.charterLabel}</span>
            </div>
            <div className="guidelines-list">
              {guidelines.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <article className="guideline-card" id={`guideline-${item.id}`} key={item.id}>
                    <div className="guideline-card__meta">
                      <span className="guideline-card__number">{item.number}</span>
                      <span className="guideline-card__icon"><ItemIcon /></span>
                    </div>

                    <div className="guideline-card__content">
                      <h2>{item.title}</h2>
                      <p>{item.text}</p>

                      {item.callout && (
                        <div className="guideline-card__callout">
                          {item.callout}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            <Link className="guidelines-contact-card" to="/contact">
              <Mail />
              <span>{page.contactLead}{" "}<strong>{page.contactName}</strong>{", "}{page.contactTail}</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="guidelines-disclaimer-section">
        <div className="guidelines-inner">
          <div className="guidelines-disclaimer" data-nav-theme="light">
            <div className="guidelines-disclaimer__icon"><ShieldCheck /></div>
            <p><strong>{page.disclaimerLabel}</strong>{" "}{page.disclaimerText}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
