import { ArrowDown, ArrowRight, BookOpen, HeartHandshake, Leaf, MessagesSquare, Quote, ShieldCheck, Sparkles } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";
import logo from "../../assets/icons/logo.png";
import { PUBLIC_STORIES } from "../../data/publicStories";
import "./Home2.css";

const FEATURED_STORIES = [PUBLIC_STORIES[0], PUBLIC_STORIES[2], PUBLIC_STORIES[4]];

const PRINCIPLES = [
  ["01", "Harm-Reduction Saves Lives", "We promote harm-reduction that is an evidence-based approach to address substance use disorders through prevention, treatment, and recovery that ‘meets people where they are at’ with dignity, kindness and respect regardless of condition or circumstance."],
  ["02", "Recovery has Many Pathways", "We recognize that recovery is deeply personal and what works for one person may not work for another. Approaching all recovery methods with openness and without judgment is far more effective than shaming someone because their path to recovery looks different from the traditional approach."],
  ["03", "Medication-Assisted-Treatment (MAT) & Plant-Medicine is Health Care", "These modalities are healthcare because they treat substance use disorders and mental health as real medical conditions. They use science, clinical evidence, and history to heal the brain and the body."],
  ["04", "Connection & Compassion Heal; Shame & Stigma Hurt", "By placing compassion and connection at the center of recovery, we can help foster healing while also contributing to a broader cultural shift from shame and stigma toward understanding and support."],
];

const SUPPORT_PATHS = [
  {
    eyebrow: "I need connection",
    title: "Peer support group",
    text: "A first of its kind moderated community support forum of like-minded individuals sharing personal experience about cannabis and recovery.",
    action: "Join Our Support Community Here",
    icon: <MessagesSquare size={24} />,
    register: true,
  },
  {
    eyebrow: "I want to understand",
    title: "Education",
    text: "A list of informational articles, scientific research, and other resources to learn about cannabis, recovery and more.",
    action: "Find Resources Here",
    icon: <BookOpen size={24} />,
    to: "/resources",
  },
  {
    eyebrow: "I need some hope",
    title: "Recovery stories",
    text: "Real voices publicly sharing their journeys of recovery with cannabis to help inspire others.",
    action: "Read Recovery Stories",
    icon: <Sparkles size={24} />,
    to: "/stories",
  },
];

export default function Home2() {
  const { onRegister } = useOutletContext();

  return (
    <main className="home2-page">
      <section className="home2-hero" data-nav-theme="light">
        <div className="home2-hero__grid" aria-hidden="true" />
        <div className="home2-shell home2-hero__inner">
          <div className="home2-hero__copy">
            <p className="home2-eyebrow"><span /> Established 2013</p>
            <h1>Recovery with<br /><em>The Exit-Drug</em></h1>
            <p className="home2-hero__lead">A recovery support community for people using cannabis to reduce or replace dangerous and addictive substances.</p>
            <p className="home2-hero__support">Find peer support, educational resources, recovery stories, and connection without judgment.</p>
            <div className="home2-hero__actions">
              <button type="button" onClick={onRegister}>Join the community <ArrowRight size={17} /></button>
              <a href="#home2-start">Find your starting point <ArrowDown size={17} /></a>
            </div>
            <p className="home2-hero__former">Formerly known as Maintaining My Recovery with Cannabis / MMRC</p>
          </div>

          <div className="home2-hero__people" aria-label="Members featured in public recovery stories">
            {FEATURED_STORIES.map((story, index) => (
              <figure className={`home2-portrait home2-portrait--${index + 1}`} key={story.slug}>
                <img src={story.photo} alt={story.name} />
                <figcaption>{story.name}</figcaption>
              </figure>
            ))}
            <div className="home2-hero__seal"><img src={logo} alt="Recovery With The Exit Drug" /></div>
            <p><Quote size={16} /> Real voices. Real pathways.</p>
          </div>
        </div>
      </section>

      <section className="home2-start" id="home2-start">
        <div className="home2-shell">
          <header className="home2-start__head"><p>Start here</p><h2>What brought you here today?</h2></header>
          <div className="home2-start__grid">
            {SUPPORT_PATHS.map(({ eyebrow, title, text, action, icon, register, to }) => (
              <article key={title}>
                <header>{icon}<span>{eyebrow}</span></header>
                <h3>{title}</h3>
                <p>{text}</p>
                {register ? (
                  <button type="button" onClick={onRegister}>{action}<ArrowRight size={16} /></button>
                ) : (
                  <Link to={to}>{action}<ArrowRight size={16} /></Link>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home2-stories">
        <div className="home2-shell home2-stories__inner">
          <header>
            <p className="home2-eyebrow"><span /> Stories of recovery</p>
            <h2>Real people.<br /><em>Real pathways.</em></h2>
            <p>Recovery does not look the same for everyone. These voices show what change can look like when people are allowed to find the support that works for them.</p>
            <Link to="/stories">Explore all recovery stories <ArrowRight size={17} /></Link>
          </header>
          <div className="home2-stories__cards">
            {FEATURED_STORIES.map((story) => (
              <Link to={`/stories?story=${encodeURIComponent(story.slug)}`} className="home2-story" key={story.slug}>
                <img src={story.photo} alt="" />
                <div><span>{story.path}</span><h3>{story.name}</h3><p>{story.preview}</p></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home2-purpose">
        <div className="home2-shell home2-purpose__inner">
          <p className="home2-eyebrow"><span /> Our founding purpose</p>
          <blockquote>The mission of Recovery with The Exit-Drug (formerly known as Maintaining My Recovery with Cannabis/MMRC) is to develop a recovery support community of people who use cannabis as a form of harm-reduction therapy from dangerous or addictive substances.</blockquote>
          <p>We provide support through personal experiences, educational resources, and peer support programs—while upholding a culture of inclusiveness and mutual respect.</p>
        </div>
      </section>

      <section className="home2-principles">
        <div className="home2-shell">
          <header className="home2-section-head"><div><span>Our roots</span><h2>Principles We Uphold</h2></div><p>The following principles are what guide and shape our mission.</p></header>
          <div className="home2-principles__grid">
            {PRINCIPLES.map(([number, title, text]) => (
              <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="home2-next">
        <div className="home2-shell home2-next__inner">
          <div><Leaf size={30} /><p>Your recovery does not have to look like anyone else’s.</p><h2>There is room for your path here.</h2></div>
          <button type="button" onClick={onRegister}>Join our support community <ArrowRight size={18} /></button>
        </div>
      </section>

      <section className="home2-disclaimer">
        <div className="home2-shell"><ShieldCheck size={20} /><p><strong>Recovery with The Exit Drug is a volunteer support group sharing practical information.</strong> This is not a professional or medical organization. The information provided is for informational and educational purposes only and is not a substitute for professional care.</p></div>
      </section>
    </main>
  );
}
