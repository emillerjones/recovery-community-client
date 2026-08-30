import { ArrowDown, ArrowRight, BookOpen, HeartHandshake, Leaf, MessagesSquare, Quote, ShieldCheck, Sparkles } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";
import logo from "../../assets/icons/logo.png";
import { PUBLIC_STORIES } from "../../data/publicStories";
import "./Home2.css";

const FEATURED_STORIES = [PUBLIC_STORIES[0], PUBLIC_STORIES[2], PUBLIC_STORIES[4]];

const PRINCIPLES = [
  ["01", "Harm-Reduction Saves Lives", "We meet people where they are with dignity, kindness and respect."],
  ["02", "Recovery has Many Pathways", "No single program, label, or treatment model works for everyone."],
  ["03", "MAT & Plant-Medicine is Health Care", "Evidence-based care can help heal both the brain and the body."],
  ["04", "Connection & Compassion Heal", "Understanding and support move recovery beyond shame and stigma."],
];

const SUPPORT_PATHS = [
  {
    eyebrow: "I need connection",
    title: "Find peer support",
    text: "Join a moderated community shaped by lived experience, mutual respect, and encouragement.",
    action: "Join our support community",
    icon: <MessagesSquare size={24} />,
    register: true,
  },
  {
    eyebrow: "I want to understand",
    title: "Learn about harm reduction",
    text: "Explore educational articles, scientific research, and practical recovery resources.",
    action: "Find resources",
    icon: <BookOpen size={24} />,
    to: "/resources",
  },
  {
    eyebrow: "I need some hope",
    title: "Read real recovery stories",
    text: "Hear directly from people whose recovery includes cannabis as one part of their path.",
    action: "Read their stories",
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
            <h1>A recovery community with room for <em>your path.</em></h1>
            <p className="home2-hero__lead">Recovery with The Exit-Drug supports people who use cannabis to reduce or replace dangerous and addictive substances.</p>
            <p className="home2-hero__support">Find peer support, trusted information, honest recovery stories, and connection without judgment.</p>
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
              <Link to="/stories" className="home2-story" key={story.slug}>
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
          <blockquote>The mission of Recovery with The Exit-Drug is to develop a recovery support community for people who use cannabis as harm-reduction therapy from dangerous or addictive substances.</blockquote>
          <p>We provide support through personal experiences, educational resources, and peer support programs—while upholding a culture of inclusiveness and mutual respect.</p>
        </div>
      </section>

      <section className="home2-principles">
        <div className="home2-shell">
          <header className="home2-section-head"><div><span>Our roots</span><h2>Principles We Uphold</h2></div><p>The beliefs that guide how we welcome, educate, and support this community.</p></header>
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
        <div className="home2-shell"><ShieldCheck size={20} /><p><strong>Recovery with The Exit Drug is a volunteer support group sharing practical information.</strong> We are not a professional or medical organization, and our information is not a substitute for professional care.</p></div>
      </section>
    </main>
  );
}
