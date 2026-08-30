import { ArrowDown, ArrowRight, BookOpen, HeartHandshake, Leaf, MessagesSquare, Network, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";
import logo from "../../assets/icons/logo.png";
import "./About2.css";

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

export default function About2() {
  const { onRegister } = useOutletContext();

  return (
    <main className="about2-page">
      <section className="about2-hero" data-nav-theme="light">
        <div className="about2-hero__grain" aria-hidden="true" />
        <div className="about2-shell about2-hero__inner">
          <div className="about2-hero__copy">
            <h1>Recovery with<br /><em>The Exit-Drug</em></h1>

            <p className="about2-hero__former">Formerly known as Maintaining My Recovery with Cannabis / MMRC</p>
            <br></br>
            <p className="about2-eyebrow"><span /> Established 2013</p>
            <div className="about2-hero__actions">
              <button type="button" onClick={onRegister}>Join our community <ArrowRight size={17} /></button>
              <a href="#about2-purpose">Discover our purpose <ArrowDown size={17} /></a>
            </div>
          </div>
          <div className="about2-hero__mark" aria-label="Recovery With The Exit Drug logo">
            <span aria-hidden="true" />
            <img src={logo} alt="Recovery With The Exit Drug" />
          </div>
        </div>
        <nav className="about2-hero__statement" aria-label="About page sections">
          <div className="about2-shell">
            <a href="#about2-purpose"><span>01</span> Purpose</a><i />
            <a href="#about2-principles"><span>02</span> Principles</a><i />
            <a href="#about2-provides"><span>03</span> What we provide</a>
          </div>
        </nav>
      </section>

      <section className="about2-purpose" id="about2-purpose">
        <div className="about2-shell about2-purpose__inner">
          <p className="about2-kicker">Our founding purpose</p>
          <blockquote>The mission of Recovery with The Exit-Drug (formerly known as Maintaining My Recovery with Cannabis/MMRC) is to develop a recovery support community of people who use cannabis as a form of harm-reduction therapy from dangerous or addictive substances.</blockquote>
          <p>We provide support through personal experiences, educational resources, and peer support programs—while upholding a culture of inclusiveness and mutual respect.</p>
        </div>
      </section>

      <section className="about2-principles" id="about2-principles">
        <div className="about2-shell">
          <header className="about2-section-head">
            <div className="about2-section-label"><span>02</span><p>What we are rooted in</p></div>
            <div><h2>Principles We Uphold</h2><p>The following principles are what guide and shape our mission.</p></div>
          </header>
          <div className="about2-principles__grid">
            {PRINCIPLES.map(({ number, title, text, icon }) => (
              <article className="about2-principle" key={number}>
                <header>
                  <span>{number}</span>{icon}
                </header>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about2-provides" id="about2-provides">
        <div className="about2-shell">
          <header className="about2-section-head about2-section-head--light">
            <div className="about2-section-label"><span>03</span><p>What we provide</p></div>
            <div><p className="about2-kicker">Support you can reach</p><h2>A place to connect,<br />learn and be heard.</h2></div>
          </header>
          <div className="about2-provides__grid">
            {PROVIDES.map(({ title, text, action, icon, to, register }) => (
              <article className="about2-provide" key={title}>
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

      <section className="about2-boundary">
        <div className="about2-shell about2-boundary__inner">
          <p className="about2-eyebrow"><span /> Disclaimer</p>
          <p><strong>Recovery with The Exit Drug is a volunteer support group sharing practical information.</strong> This is not a professional or medical organization. The information provided is for informational and educational purposes only and is not a substitute for professional care.</p>
        </div>
      </section>
    </main>
  );
}
