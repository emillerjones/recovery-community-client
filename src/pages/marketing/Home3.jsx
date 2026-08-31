import {
  ArrowDown,
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
import logo from "../../assets/icons/logo.png";
import cannabisLeaf from "../../assets/icons/cannabis-leaf-filled.png";
import supportIcon from "../../assets/icons/support.png";
import educationIcon from "../../assets/icons/education.png";
import communityIcon from "../../assets/icons/community.png";
import hopeIcon from "../../assets/icons/hope.png";
import "./Home3.css";

const PRINCIPLES = [
  {
    number: "01",
    title: "Harm-Reduction Saves Lives",
    text: "We promote harm-reduction that is an evidence-based approach to address substance use disorders through prevention, treatment, and recovery that ‘meets people where they are at’ with dignity, kindness and respect regardless of condition or circumstance.",
    icon: <ShieldCheck size={25} strokeWidth={1.5} />,
  },
  {
    number: "02",
    title: "Recovery has Many Pathways",
    text: "We recognize that recovery is deeply personal and what works for one person may not work for another. Approaching all recovery methods with openness and without judgment is far more effective than shaming someone because their path to recovery looks different from the traditional approach.",
    icon: <Network size={25} strokeWidth={1.5} />,
  },
  {
    number: "03",
    title: "Medication-Assisted-Treatment (MAT) & Plant-Medicine is Health Care",
    text: "These modalities are healthcare because they treat substance use disorders and mental health as real medical conditions. They use science, clinical evidence, and history to heal the brain and the body.",
    icon: <Stethoscope size={25} strokeWidth={1.5} />,
  },
  {
    number: "04",
    title: "Connection & Compassion Heal; Shame & Stigma Hurt",
    text: "By placing compassion and connection at the center of recovery, we can help foster healing while also contributing to a broader cultural shift from shame and stigma toward understanding and support.",
    icon: <HeartHandshake size={25} strokeWidth={1.5} />,
  },
];

const PROVIDES = [
  {
    title: "Peer support group",
    text: "A first of its kind moderated community support forum of like-minded individuals sharing personal experience about cannabis and recovery.",
    action: "Join Our Support Community Here",
    icon: <MessagesSquare size={28} strokeWidth={1.4} />,
    register: true,
  },
  {
    title: "Education",
    text: "A list of informational articles, scientific research, and other resources to learn about cannabis, recovery and more.",
    action: "Find Resources Here",
    icon: <BookOpen size={28} strokeWidth={1.4} />,
    to: "/resources",
  },
  {
    title: "Recovery stories",
    text: "Real voices publicly sharing their journeys of recovery with cannabis to help inspire others.",
    action: "Read Recovery Stories",
    icon: <Sparkles size={28} strokeWidth={1.4} />,
    to: "/stories",
  },
  {
    title: "Future projects",
    text: "We are always growing to add additional features that will benefit our community.",
    action: "Explore Our Community",
    icon: <Leaf size={28} strokeWidth={1.4} />,
    to: "/community",
  },
];

function LeafRule() {
  return (
    <div className="home3-leaf-rule" aria-hidden="true">
      <span />
      <img src={cannabisLeaf} alt="" />
      <span />
    </div>
  );
}

export default function Home3() {
  const { onRegister } = useOutletContext();

  return (
    <main className="home3-page">
      <section className="home3-hero" data-nav-theme="light">
        <div className="home3-shell home3-hero__inner">
          <p className="home3-hero__established"><span /> Established 2013 <span /></p>
          <img className="home3-hero__logo" src={logo} alt="Recovery With The Exit Drug" />

          <h1><span>Recovery with</span><em>The Exit-Drug</em></h1>
          <p className="home3-hero__former">Formerly known as Maintaining My Recovery with Cannabis (MMRC)</p>

          <LeafRule />

          <p className="home3-hero__description">A recovery support community for people using cannabis to reduce or replace dangerous and addictive substances. Find peer support, educational resources, recovery stories, and connection without judgment.</p>

          <div className="home3-hero__actions">
            <button type="button" onClick={onRegister}>Join our community <ArrowRight size={20} /></button>
            <a href="#home3-purpose">Discover our purpose <ArrowDown size={20} /></a>
          </div>

          <div className="home3-hero__explore">
            <LeafRule />
            <nav aria-label="Explore recovery support">
              <button type="button" onClick={onRegister}><img src={supportIcon} alt="" /><span>Support</span></button>
              <Link to="/resources"><img src={educationIcon} alt="" /><span>Education</span></Link>
              <Link to="/community"><img src={communityIcon} alt="" /><span>Community</span></Link>
              <Link to="/stories"><img src={hopeIcon} alt="" /><span>Hope</span></Link>
            </nav>
          </div>
        </div>
      </section>

      <section className="home3-purpose" id="home3-purpose">
        <div className="home3-shell home3-purpose__inner">
          <p className="home3-kicker">Our founding purpose</p>
          <blockquote>The mission of Recovery with The Exit-Drug (formerly known as Maintaining My Recovery with Cannabis/MMRC) is to develop a recovery support community of people who use cannabis as a form of harm-reduction therapy from dangerous or addictive substances. We provide support through personal experiences, educational resources, and peer support programs—while upholding a culture of inclusiveness and mutual respect.</blockquote>
        </div>
      </section>

      <section className="home3-principles" id="home3-principles">
        <div className="home3-shell">
          <header className="home3-section-head">
            <p>What we are rooted in</p>
            <div><h2>Principles We Uphold</h2><p>The following principles are what guide and shape our mission.</p></div>
          </header>
          <div className="home3-principles__grid">
            {PRINCIPLES.map(({ number, title, text, icon }) => (
              <article key={number}>
                <header><span>{number}</span>{icon}</header>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home3-provides" id="home3-provides">
        <div className="home3-shell">
          <header className="home3-section-head home3-section-head--light">
            <p>What we provide</p>
            <div><p className="home3-kicker">Support you can reach</p><h2>A place to connect,<br />learn and be heard.</h2></div>
          </header>
          <div className="home3-provides__grid">
            {PROVIDES.map(({ title, text, action, icon, to, register }) => (
              <article className="home3-provide" key={title}>
                {icon}
                <div><h3>{title}</h3><p>{text}</p></div>
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

      <section className="home3-disclaimer">
        <div className="home3-shell home3-disclaimer__inner">
          <p className="home3-disclaimer__label"><span /> Disclaimer <span /></p>
          <p><strong>Recovery with The Exit Drug is a volunteer support group sharing practical information. This is not a professional or medical organization. The information provided is for informational and educational purposes only and is not a substitute for professional care.</strong></p>
        </div>
      </section>
    </main>
  );
}
