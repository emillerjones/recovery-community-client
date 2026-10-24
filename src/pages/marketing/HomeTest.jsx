import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  HeartHandshake,
  Leaf,
  MessagesSquare,
  Network,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { useAuth } from "../../auth/AuthContext";
import logo from "../../assets/icons/logo.png";
import cannabisLeaf from "../../assets/icons/cannabis-leaf-filled.png";
import supportIcon from "../../assets/icons/support.png";
import educationIcon from "../../assets/icons/education.png";
import communityIcon from "../../assets/icons/community.png";
import hopeIcon from "../../assets/icons/hope.png";
import "./Home.css";
import "./HomeTest.css";

const API = import.meta.env.VITE_API;

const PRINCIPLES = [
  {
    number: "01",
    icon: <ShieldCheck size={25} strokeWidth={1.5} />,
  },
  {
    number: "02",
    icon: <Network size={25} strokeWidth={1.5} />,
  },
  {
    number: "03",
    icon: <Stethoscope size={25} strokeWidth={1.5} />,
  },
  {
    number: "04",
    icon: <HeartHandshake size={25} strokeWidth={1.5} />,
  },
];

const PROVIDES = [
  {
    action: "Join Our Support Community Here",
    icon: <MessagesSquare size={28} strokeWidth={1.4} />,
    register: true,
  },
  {
    action: "Find Resources Here",
    icon: <BookOpen size={28} strokeWidth={1.4} />,
    to: "/resources",
  },
  {
    action: "Read Recovery Stories",
    icon: <Sparkles size={28} strokeWidth={1.4} />,
    to: "/stories",
  },
  {
    action: "Explore Our Community",
    icon: <Leaf size={28} strokeWidth={1.4} />,
    to: "/community",
  },
];

export default function HomeTest() {
  const [content, setContent] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots"; meta.content = "noindex, nofollow";
    document.head.append(meta);
    return () => meta.remove();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API}/api/home-test`, { signal: controller.signal })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Home - Test could not be loaded.");
        setContent(data.content);
      }).catch(error => { if (error.name !== "AbortError") setError(error.message); });
    return () => controller.abort();
  }, [attempt]);
  if (!content) return <main className="home-test-load" aria-live="polite"><h1>Home - Test</h1><p>{error || "Loading Home - Test..."}</p>{error && <button type="button" onClick={() => { setError(""); setAttempt(value => value + 1); }}>Try again</button>}</main>;
  return <HomeTestContent content={content} />;
}

function HomeTestContent({ content }) {
  const { onRegister, onLogin } = useOutletContext();
  const { token } = useAuth();

  return (
    <main className="home-page home-test-page">
      <section className="home-hero" data-nav-theme="light">
        <div className="home-hero__glow" aria-hidden="true" />
        <div className="home-shell home-hero__inner">
          <div className="home-hero__crest">
            <div className="home-hero__date" aria-label="Established"><span /><strong>{content.hero.established}</strong><span /></div>
            <div className="home-hero__logo">
              <img src={logo} alt="Recovery With The Exit Drug" />
            </div>
            <div className="home-hero__date" aria-label={content.hero.year}><span /><strong>{content.hero.year}</strong><span /></div>
          </div>

          <h1><span>{content.hero.titleFirst}</span><em>{content.hero.titleSecond}</em></h1>
          <p className="home-hero__former">{content.hero.former}</p>
          <div className="home-hero__divider" aria-hidden="true"><span /><img src={cannabisLeaf} alt="" /><span /></div>
          <p className="home-hero__description">{content.hero.description}</p>

          <div className="home-hero__actions">
            <button type="button" onClick={onRegister}>Join our community <ArrowRight size={20} /></button>
            {token ? (
              <Link to="/forum">Go to community <ArrowRight size={20} aria-hidden="true" /></Link>
            ) : (
              <a href="/login" onClick={event => { event.preventDefault(); onLogin(); }}>Log in <ArrowRight size={20} aria-hidden="true" /></a>
            )}
          </div>

          <nav className="home-hero__paths" aria-label="Explore recovery support">
            <div className="home-hero__path-rule" aria-hidden="true"><span /><img src={cannabisLeaf} alt="" /><span /></div>
            <div className="home-hero__path-links">
              <a href="#home-provides"><img src={supportIcon} alt="" /><span>Support</span></a>
              <Link to="/resources"><img src={educationIcon} alt="" /><span>Education</span></Link>
              <Link to="/community"><img src={communityIcon} alt="" /><span>Community</span></Link>
              <Link to="/stories"><img src={hopeIcon} alt="" /><span>Hope</span></Link>
            </div>
          </nav>
        </div>
      </section>

      <section className="home-purpose" id="home-purpose" data-nav-theme="light">
        <div className="home-shell home-purpose__inner">
          <p className="home-kicker">{content.purpose.kicker}</p>
          <blockquote>{content.purpose.mission}</blockquote>
          <section className="home-support" aria-label="Support our mission">
            <p>{content.purpose.supportText}</p>
            <nav className="home-support__links" aria-label="Ways to support our mission">
              <Link className="home-support__link" to="/donate">Monetary Gifts <ArrowRight size={17} aria-hidden="true" /></Link>
              <a className="home-support__link" href="https://www.etsy.com/shop/TheExitDrugRecovery" target="_blank" rel="noopener noreferrer">Shop Our Etsy Store <ArrowRight size={17} aria-hidden="true" /></a>
              <Link className="home-support__link" to="/discountlinks">Affiliate Discount Codes <ArrowRight size={17} aria-hidden="true" /></Link>
            </nav>
          </section>
        </div>
      </section>

      <section className="home-principles" id="home-principles" data-nav-theme="light">
        <div className="home-shell">
          <header className="home-section-head">
            <p>{content.principles.kicker}</p>
            <div><h2>{content.principles.title}</h2><p>{content.principles.intro}</p></div>
          </header>
          <div className="home-principles__grid">
            {PRINCIPLES.map(({ number, icon }, index) => (
              <article key={number}>
                <header><span>{number}</span>{icon}</header>
                <h3>{content.principles[`title${index + 1}`]}</h3>
                <p>{content.principles[`text${index + 1}`]}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-provides" id="home-provides">
        <div className="home-shell">
          <header className="home-section-head home-section-head--light">
            <p>{content.provides.kicker}</p>
            <div>
              <h2>{content.provides.title}</h2>
              <p>{content.provides.intro}</p>
            </div>
          </header>
          <div className="home-provides__grid">
            {PROVIDES.map(({ action, icon, to, register }, index) => (
              <article className="home-provide" key={index}>
                {icon}
                <div><h3>{content.provides[`title${index + 1}`]}</h3><p>{content.provides[`text${index + 1}`]}</p></div>
                {register ? (
                  <button type="button" onClick={onRegister}>{action} <ArrowRight size={16} /></button>
                ) : (
                  <Link to={to}>{action} <ArrowRight size={16} /></Link>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-social" aria-labelledby="home-social-title">
        <div className="home-shell">
          <header className="home-social__head">
            <p className="home-social__kicker">{content.social.kicker}</p>
            <h2 id="home-social-title">{content.social.title}</h2>
            <p>{content.social.intro}</p>
          </header>
          <div className="home-social__grid">
            <a className="home-social__card" href="https://www.facebook.com/share/19ko3Rafju" target="_blank" rel="noopener noreferrer">
              <span className="home-social__icon home-social__icon--facebook" aria-hidden="true"><FaFacebookF /></span>
              <div>
                <h3>{content.social.facebookTitle}</h3>
                <p>{content.social.facebookText}</p>
                <span className="home-social__action">Follow on Facebook <ArrowRight size={16} aria-hidden="true" /></span>
              </div>
            </a>
            <a className="home-social__card" href="https://www.instagram.com/recoverywiththeexitdrug" target="_blank" rel="noopener noreferrer">
              <span className="home-social__icon home-social__icon--instagram" aria-hidden="true"><FaInstagram /></span>
              <div>
                <h3>{content.social.instagramTitle}</h3>
                <p>{content.social.instagramText}</p>
                <span className="home-social__action">Follow on Instagram <ArrowRight size={16} aria-hidden="true" /></span>
              </div>
            </a>
          </div>
        </div>
      </section>

      <section className="home-disclaimer">
        <div className="home-shell home-disclaimer__inner">
          <p className="home-disclaimer__label"><span /> {content.disclaimer.label} <span /></p>
          <p><strong>{content.disclaimer.text}</strong></p>
        </div>
      </section>
    </main>
  );
}
