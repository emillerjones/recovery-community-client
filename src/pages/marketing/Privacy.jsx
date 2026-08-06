import { Link } from "react-router-dom";
import "./FAQ.css";
import "./Privacy.css";

const SECTIONS = [
  {
    id: "information-we-collect",
    title: "Information we collect",
    text: "We collect information you provide when you create or update an account, contact us, participate in the community, or make a donation. This may include your email address, username, profile details, posts, comments, reactions, private messages, Lounge messages, moderation reports, and support requests.",
  },
  {
    id: "how-we-use-information",
    title: "How we use information",
    text: "We use this information to operate accounts, provide community features, review membership requests, moderate content, send service and security emails, respond to questions, improve the website, prevent abuse, and protect members and the community.",
  },
  {
    id: "community-visibility",
    title: "Community visibility",
    text: "Information posted in community spaces can be seen by members who have access to those spaces. Direct messages are intended for their participants, but authorized staff may access information when reasonably necessary for safety, moderation, support, security, or legal compliance. Please avoid posting information you do not want stored on the service.",
  },
  {
    id: "analytics-and-devices",
    title: "Analytics and device data",
    text: "The website records limited technical and usage information, such as pages visited, session identifiers, timestamps, and basic request information. We use browser storage to keep you signed in and support features such as preferences and drafts.",
  },
  {
    id: "service-providers",
    title: "Service providers and payments",
    text: "We may use trusted providers for website hosting, databases, email delivery, analytics, security, and payments. They receive only the information needed to provide their services. PayPal processes donation payments under its own privacy practices; we do not receive your full card or bank details.",
  },
  {
    id: "retention-and-security",
    title: "Retention and security",
    text: "We keep information for as long as reasonably needed to operate the community, meet legal obligations, resolve disputes, enforce our rules, and maintain safety records. We use reasonable safeguards, but no online service can promise absolute security.",
  },
  {
    id: "choices-and-requests",
    title: "Your choices and requests",
    text: "You can update certain profile information from your account. To request access, correction, or deletion of other personal information, contact us. Some information may be retained when required for safety, legal compliance, fraud prevention, or legitimate recordkeeping.",
  },
  {
    id: "sensitive-information",
    title: "Sensitive information and medical privacy",
    text: "Recovery discussions may reveal sensitive health or substance-use information. This is a peer-support community, not a healthcare provider, and the service should not be treated as a confidential medical record or emergency service. Share only what you are comfortable sharing with the intended audience.",
  },
];

export default function Privacy() {
  return (
    <main className="faq privacy-page">
      <section className="faq-hero privacy-hero" data-nav-theme="light">
        <div className="faq-hero__glow" aria-hidden="true" />
        <div className="faq-container faq-hero__inner">
          <div className="faq-hero__copy">
            <p className="faq-kicker">Privacy and trust</p>
            <h1>Your story belongs to you.</h1>
            <p className="faq-hero__intro">
              This policy explains what information Recovery With The Exit Drug
              collects, why we use it, and the choices available to you.
            </p>
            <p className="privacy-effective">Effective August 6, 2026</p>
          </div>
          <svg className="privacy-hero__art" viewBox="0 0 420 420" aria-hidden="true">
            <circle cx="210" cy="210" r="174" />
            <circle cx="210" cy="210" r="135" />
            <path d="M210 91 304 130v79c0 65-40 111-94 137-54-26-94-72-94-137v-79Z" />
            <path className="privacy-hero__check" d="m166 214 31 31 62-75" />
          </svg>
        </div>
      </section>

      <section className="faq-body">
        <div className="faq-container faq-layout">
          <aside className="faq-index privacy-index">
            <p className="faq-index__label">On this page</p>
            <nav aria-label="Privacy policy contents">
              {SECTIONS.map((section, index) => (
                <a href={`#${section.id}`} key={section.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          <div className="privacy-content">
            <div className="privacy-intro">
              <p>
                We aim to collect only what helps us run a safer, useful community.
                We do not sell members' personal information.
              </p>
            </div>

            {SECTIONS.map((section, index) => (
              <section className="privacy-section" id={section.id} key={section.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h2>{section.title}</h2>
                  <p>{section.text}</p>
                  {section.id === "service-providers" && (
                    <a href="https://www.paypal.com/us/legalhub/paypal/privacy-full" target="_blank" rel="noreferrer">
                      Read PayPal's privacy statement →
                    </a>
                  )}
                  {section.id === "choices-and-requests" && (
                    <Link to="/contact">Contact us about your information →</Link>
                  )}
                </div>
              </section>
            ))}

            <section className="privacy-notice" id="changes-and-contact">
              <p className="faq-kicker">Changes and contact</p>
              <h2>Questions should have a clear destination.</h2>
              <p>
                We may update this policy as the community and its services change.
                The effective date above will be revised when that happens. Contact
                us if you have a privacy question or request.
              </p>
              <Link to="/contact">Go to the contact page <span>→</span></Link>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
