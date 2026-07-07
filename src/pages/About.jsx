import "./About.css";

const BELIEFS = [
  {
    title: "Harm reduction matters",
    text: "We support people using cannabis as a way to reduce or replace the use of more dangerous and addictive substances.",
  },
  {
    title: "Recovery has many paths",
    text: "MMRC does not require one specific program, label, or treatment model. People may combine cannabis substitution with AA, NA, SMART Recovery, HAMS, MAT, Refuge Recovery, personalized recovery, or other positive recovery methods.",
  },
  {
    title: "Peer support is powerful",
    text: "We are not a medical organization. We are people sharing personal experience, practical support, educational resources, and encouragement with others on similar journeys.",
  },
  {
    title: "Shame does not heal",
    text: "Our community is built on inclusiveness, mutual respect, acceptance, and reducing stigma around cannabis use in recovery.",
  },
];

const PROVIDES = [
  "A moderated peer support community",
  "Educational resources about cannabis and recovery",
  "Personal experiences from people maintaining recovery",
  "Recovery stories that show what change can look like",
  "Future meetings, events, and community programs",
];

export default function Mission() {
  return (
    <main className="philosophy-page">
      <section className="philosophy-hero">
        <div className="philosophy-inner">
          <p className="philosophy-eyebrow">Established 2013</p>
          <h1>Recovery with cannabis. Without shame.</h1>
          <p className="philosophy-lead">
            Maintaining My Recovery with Cannabis exists to support people who
            use cannabis as a form of harm-reduction therapy from dangerous or
            addictive substances.
          </p>
        </div>
      </section>

      <section className="philosophy-statement-section">
        <div className="philosophy-inner">
          <div className="philosophy-statement">
            <p className="philosophy-eyebrow">Mission statement</p>
            <p>
              The mission of Maintaining My Recovery with Cannabis is to develop
              a recovery support community of people who use cannabis as a form
              of harm-reduction therapy from dangerous/addictive substances. We
              provide support through personal experiences, educational
              resources and peer support programs, while upholding a culture of
              inclusiveness and mutual respect.
            </p>
          </div>
        </div>
      </section>

      <section className="philosophy-section">
        <div className="philosophy-inner">
          <div className="philosophy-section-head">
            <p className="philosophy-eyebrow">What we believe</p>
            <h2>There is more than one way to recover.</h2>
          </div>

          <div className="philosophy-grid">
            {BELIEFS.map((belief) => (
              <article className="philosophy-card" key={belief.title}>
                <h3>{belief.title}</h3>
                <p>{belief.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="philosophy-section philosophy-welcome">
        <div className="philosophy-inner philosophy-split">
          <div>
            <p className="philosophy-eyebrow">Welcome</p>
            <h2>A supportive community for cannabis substitution.</h2>
          </div>

          <div className="philosophy-copy">
            <p>
              MMRC is a supportive community of people using cannabis to replace
              or reduce their usage of dangerous and addictive substances. This
              method is commonly called “marijuana maintenance” or “cannabis
              substitution.”
            </p>
            <p>
              MMRC is not an official program and does not follow a specific
              treatment plan. We simply are people who use cannabis as an aid in
              our recovery journeys.
            </p>
          </div>
        </div>
      </section>

      <section className="philosophy-section">
        <div className="philosophy-inner philosophy-provides">
          <div>
            <p className="philosophy-eyebrow">MMRC provides</p>
            <h2>Support, education, and real experience.</h2>
          </div>

          <ul className="philosophy-provides-list">
            {PROVIDES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="philosophy-disclaimer-section">
        <div className="philosophy-inner">
          <div className="philosophy-disclaimer">
            <strong>Disclaimer:</strong> Maintaining My Recovery with Cannabis
            is a volunteer support group sharing practical information. This is
            not a professional or medical organization. The information provided
            in this group is for informational and educational purposes only and
            is not a substitute for professional care.
          </div>
        </div>
      </section>
    </main>
  );
}