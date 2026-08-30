import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Candy,
  Cable,
  CircleCheck,
  ClipboardList,
  ExternalLink,
  Info,
  Leaf,
  Mail,
  PackageCheck,
  ShieldAlert,
  Shirt,
} from "lucide-react";
import "./DiscountLinks.css";

const API = import.meta.env.VITE_API;
const ICONS = { candy: Candy, cable: Cable, leaf: Leaf, package: PackageCheck, shirt: Shirt };
const categoryId = (category) => `discount-${category.id}`;

function useActiveCategory(ids) {
  const [active, setActive] = useState(null);
  useEffect(() => {
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!sections.length || !("IntersectionObserver" in window)) return undefined;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.id); }),
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

function CopyCodeButton({ code }) {
  const [copied, setCopied] = useState(false);
  function handleCopy(event) {
    event.preventDefault();
    event.stopPropagation();
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  }
  return <button type="button" className={`discount-copy ${copied ? "is-copied" : ""}`} onClick={handleCopy} aria-label={`Copy code ${code}`}>{copied ? "Copied" : "Copy"}</button>;
}

export default function DiscountLinks() {
  const [content, setContent] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API}/api/discount2`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || "Discount links could not be loaded.");
        return data;
      })
      .then((data) => setContent(data.content))
      .catch((fetchError) => { if (fetchError.name !== "AbortError") setError(fetchError.message); });
    return () => controller.abort();
  }, []);

  const categoryIds = useMemo(() => (content?.categories || []).map(categoryId), [content]);
  const activeCategory = useActiveCategory(categoryIds);

  if (!content) {
    return <main className="discount-page"><div className="discount-state"><h1>{error ? "Discount links are temporarily unavailable." : "Loading discount links…"}</h1>{error && <><p>{error}</p><Link to="/contact">Contact us</Link></>}</div></main>;
  }

  return (
    <main className="discount-page">
      <section className="discount-hero" data-nav-theme="light">
        <div className="discount-inner discount-hero__inner">
          <div className="discount-hero__copy">
            <p className="discount-eyebrow">{content.hero.eyebrow}</p>
            <h1>{content.hero.title}</h1>
            <p className="discount-intro">{content.hero.intro}</p>
            <nav className="discount-index" aria-label="Discount categories">
              {content.categories.map((category, index) => {
                const id = categoryId(category);
                return <a href={`#${id}`} key={category.id} className={activeCategory === id ? "is-active" : undefined} aria-current={activeCategory === id ? "true" : undefined}><span>0{index + 1}</span>{category.title}</a>;
              })}
            </nav>
          </div>
          <svg className="discount-hero__art" viewBox="0 0 500 380" aria-hidden="true">
            <path className="discount-hero__orbit" pathLength="1" d="M38 190C38 89 124 29 252 29c130 0 210 61 210 162 0 103-82 158-212 158S38 294 38 190Z" />
            <path className="discount-hero__tag" pathLength="1" d="M128 92h176l88 88-158 158-106-106Z" />
            <path className="discount-hero__fold" pathLength="1" d="m304 92-1 89 89-1" />
            <circle className="discount-hero__hole" cx="177" cy="141" r="13" />
            <path className="discount-hero__percent" pathLength="1" d="m220 234 78-78M226 166a15 15 0 1 0 0 .1M292 224a15 15 0 1 0 0 .1" />
            <path className="discount-hero__thread" pathLength="1" d="M177 128C133 83 86 91 69 125" />
          </svg>
        </div>
      </section>

      <section className="discount-section">
        <div className="discount-inner discount-category-list">
          {content.categories.map((category, categoryIndex) => {
            const CategoryIcon = ICONS[category.icon] || Leaf;
            const visibleBrands = category.brands.filter((brand) => brand.active);
            return (
              <section className="discount-category" id={categoryId(category)} key={category.id}>
                <div className="discount-category__head">
                  <span className="discount-category__number">0{categoryIndex + 1}</span>
                  <span className="discount-category__icon"><CategoryIcon /></span>
                  <h2>{category.title}</h2>
                  <p>{category.description}</p>
                </div>
                <div className="discount-grid">
                  {visibleBrands.map((brand) => (
                    <div key={brand.id} className="discount-card discount-feature-card">
                      <a href={brand.url} target="_blank" rel="noopener noreferrer" className="discount-card__link-overlay" aria-label={brand.name} />
                      {brand.logo && <img src={brand.logo} alt="" referrerPolicy="no-referrer" className="discount-card__logo" onError={(event) => { event.currentTarget.style.display = "none"; }} />}
                      <div className="discount-card__body">
                        <div><h3>{brand.name}</h3>{brand.note && <p>{brand.note}</p>}</div>
                        <div className="discount-card__bottom">
                          {brand.code ? <span className="discount-code discount-code-row">Code: <strong>{brand.code}</strong><CopyCodeButton code={brand.code} /></span> : <span className="discount-code discount-code--none">No code needed</span>}
                          <span className="discount-arrow"><ExternalLink /></span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!visibleBrands.length && <p className="discount-empty">No active discounts in this category right now.</p>}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <section className="discount-guide-section">
        <div className="discount-inner discount-guide">
          <header className="discount-guide__intro">
            <p className="discount-eyebrow">{content.guide.eyebrow}</p>
            <h2>{content.guide.title}</h2>
            <p>{content.guide.intro}</p>
            <div className="discount-guide__highlights">{content.guide.highlights.map((highlight) => <p key={highlight}><CircleCheck /> {highlight}</p>)}</div>
            <p className="discount-guide__updated">{content.guide.updated}</p>
          </header>
          <div className="discount-guide__columns">
            <article className="discount-guide__card">
              <div className="discount-guide__card-heading"><ClipboardList /><h3>Directions</h3></div>
              <ol>{content.guide.directions.map((direction) => <li key={direction}>{direction}</li>)}</ol>
            </article>
            <article className="discount-guide__card">
              <div className="discount-guide__card-heading"><Info /><h3>Notes</h3></div>
              <ul>{content.guide.notes.map((note) => <li key={note}>{note}</li>)}</ul>
              <a className="discount-guide__contact" href={`mailto:${content.guide.contactEmail}`}><Mail /><span>{content.guide.contactText} <strong>{content.guide.contactEmail}</strong>.</span></a>
            </article>
          </div>
        </div>
      </section>

      <section className="discount-disclaimer-section">
        <div className="discount-inner"><div className="discount-disclaimer" data-nav-theme="light"><span className="discount-disclaimer__icon"><ShieldAlert /></span><p><strong>Important:</strong> {content.disclaimer}</p></div></div>
      </section>
    </main>
  );
}
