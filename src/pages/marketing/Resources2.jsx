import {
  ArrowRight,
  BookOpen,
  ExternalLink,
  FlaskConical,
  HeartHandshake,
  ShieldCheck,
} from "lucide-react";
import { createElement } from "react";
import { useOutletContext } from "react-router-dom";
import cannabisLeaf from "../../assets/icons/cannabis-leaf-filled.png";
import { LEARN_GROUPS, ORGANIZATIONS } from "./resourceData";
import "./Resources2.css";

const CHAPTERS = [
  {
    id: "resources2-harm-reduction",
    label: "Harm Reduction",
    number: "01",
    description: "Foundational perspectives on cannabis substitution and meeting people where they are.",
    icon: ShieldCheck,
    groups: [0],
  },
  {
    id: "resources2-substances",
    label: "Alcohol & Opioids",
    number: "02",
    description: "Substance-specific information exploring safer alternatives and individual recovery paths.",
    icon: BookOpen,
    groups: [1, 2],
  },
  {
    id: "resources2-experience",
    label: "Lived Experience",
    number: "03",
    description: "Personal accounts from people whose recovery does not fit a single traditional model.",
    icon: HeartHandshake,
    groups: [3],
  },
  {
    id: "resources2-research",
    label: "Research & Safety",
    number: "04",
    description: "Studies, clinical perspectives, and safety information for making informed decisions.",
    icon: FlaskConical,
    groups: [4],
  },
];

function ResourceLinks({ links }) {
  return (
    <ul className="resources2-links">
      {links.map((link, index) => (
        <li key={link.text}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <a href={link.url} target="_blank" rel="noreferrer">
            {link.text}
            <ExternalLink size={14} aria-hidden="true" />
          </a>
          {link.tag && <small>{link.tag}</small>}
        </li>
      ))}
    </ul>
  );
}

export default function Resources2() {
  const { onRegister } = useOutletContext();

  return (
    <main className="resources2-page">
      <section className="resources2-hero" data-nav-theme="light">
        <div className="resources2-hero__glow" aria-hidden="true" />
        <div className="resources2-shell resources2-hero__inner">
          <p className="resources2-kicker">The recovery library</p>
          <h1>Knowledge for a safer path forward.</h1>
          <p className="resources2-hero__intro">
            Research, lived experience, and outside support—carefully organized so useful information is easier to find.
          </p>

          <nav className="resources2-index" aria-label="Resource library chapters">
            <div className="resources2-index__rule" aria-hidden="true">
              <span />
              <img src={cannabisLeaf} alt="" />
              <span />
            </div>
            <div className="resources2-index__links">
              {CHAPTERS.map(({ id, label, icon }) => (
                <a href={`#${id}`} key={id}>
                  {createElement(icon, { size: 30, strokeWidth: 1.35, "aria-hidden": true })}
                  <span>{label}</span>
                </a>
              ))}
            </div>
            <div className="resources2-index__finish" aria-hidden="true" />
          </nav>
        </div>
      </section>

      <section className="resources2-library">
        <div className="resources2-shell">
          <header className="resources2-library__header">
            <p>Education, not instruction</p>
            <div>
              <h2>A curated place to begin.</h2>
              <p>
                These articles, studies, videos, and personal accounts have been collected over the years as starting points for further learning. They are not medical advice.
              </p>
            </div>
          </header>

          <div className="resources2-chapters">
            {CHAPTERS.map(({ id, label, number, description, icon, groups }) => (
              <article className="resources2-chapter" id={id} key={id}>
                <header className="resources2-chapter__header">
                  <div className="resources2-chapter__meta">
                    <span>{number}</span>
                    {createElement(icon, { size: 25, strokeWidth: 1.35, "aria-hidden": true })}
                  </div>
                  <h2>{label}</h2>
                  <p>{description}</p>
                </header>

                <div className="resources2-chapter__groups">
                  {groups.map((groupIndex) => {
                    const group = LEARN_GROUPS[groupIndex];
                    return (
                      <section className="resources2-group" key={group.title}>
                        <div className="resources2-group__heading">
                          <h3>{group.title}</h3>
                          <span>{group.links.length} resources</span>
                        </div>
                        <ResourceLinks links={group.links} />
                      </section>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="resources2-support" id="resources2-support">
        <div className="resources2-shell">
          <header className="resources2-support__header">
            <p>Independent organizations</p>
            <div>
              <h2>Find additional support.</h2>
              <p>
                These organizations are not part of Recovery With The Exit Drug. They are shared as possible starting points, not guarantees or medical endorsements.
              </p>
            </div>
          </header>

          <div className="resources2-organizations">
            {ORGANIZATIONS.map((organization, index) => (
              <article key={organization.name}>
                <span className="resources2-organization__number">{String(index + 1).padStart(2, "0")}</span>
                <h3>{organization.name}</h3>
                <p className="resources2-organization__type">{organization.type}</p>
                <details>
                  <summary>Read their description</summary>
                  <blockquote>“{organization.quote}”</blockquote>
                </details>
                <a href={organization.url} target="_blank" rel="noreferrer">
                  Visit organization <ArrowRight size={16} aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="resources2-closing" data-nav-theme="light">
        <div className="resources2-closing__rule" aria-hidden="true">
          <span />
          <img src={cannabisLeaf} alt="" />
          <span />
        </div>
        <p>Looking for more than information?</p>
        <h2>The community is here too.</h2>
        <button type="button" onClick={onRegister}>
          Join our community <ArrowRight size={18} aria-hidden="true" />
        </button>
      </section>
    </main>
  );
}
