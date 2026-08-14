import { useEffect, useState } from "react";
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

const GUIDELINES = [
  {
    number: "01",
    icon: LockKeyhole,
    title: "Respect Everyone’s Privacy — What’s Shared Stays in the Private Group Forum",
    text: (
      <>
        Protecting the privacy and trust of every member is essential to
        maintaining a safe environment. Please do not share, repeat, screenshot,
        copy, or distribute another member’s posts, comments, personal
        experiences, or identifying information outside of our group forum. What
        members share here should stay here. Please note that sharing information
        online may involve certain risks.
      </>
    ),
  },
  {
    number: "02",
    icon: Heart,
    title: "Be Kind and Considerate",
    text: (
      <>
        Treat everyone with kindness, consideration and compassion. Always be
        mindful of another member’s feelings and communicate respectfully.
        Differences in opinions and experiences are welcome, but personal attacks
        are not. We’re here to support one another, not judge or criticize.
      </>
    ),
  },
  {
    number: "03",
    icon: UsersRound,
    title: "We Are Non-Judgmental & All-Inclusive",
    text: (
      <>
        We remain non-judgmental and all-inclusive towards all members at all
        times. All member posts and comments should refrain from using profanity,
        jokes, sarcasm, disrespect and negativity that could incite offense to
        another member. We may not always see eye to eye, and that’s okay. Let’s
        agree to disagree with care and understanding.
      </>
    ),
  },
  {
    number: "04",
    icon: MegaphoneOff,
    title: "No Sales, Promotions, Spam or Unsolicited Advice",
    text: (
      <>
        We do not post spam, advertisements, promotional content, sales,
        irrelevant links or unsolicited advice. This includes, but is not limited
        to, promoting or selling products, businesses, or services of any kind.
      </>
    ),
  },
  {
    number: "05",
    icon: Ban,
    title: "No Illegal Activity",
    text: (
      <>
        Do not use our service for any unlawful purposes. We do not endorse going
        against your current local laws regarding substance use or possession. We
        are not here to advise on how to circumvent the law. Posts asking about
        how to pass a drug test or the likelihood of success in a criminal act
        are prohibited. Do not post information on how to smuggle, ship, hide,
        manufacture, or distribute illegal substances.
      </>
    ),
  },
  {
    number: "06",
    icon: MessageCircle,
    title: "Stay on Topic",
    text: (
      <>
        Our group forum is intended only to provide a supportive space for
        members to share their personal experiences, challenges, questions, and
        insights related to cannabis, substance use, addiction, and recovery. We
        do not allow discussions centered on religion, politics, or other
        unrelated subjects.
      </>
    ),
  },
  {
    number: "07",
    icon: Image,
    title: "Image & Meme Sharing",
    text: (
      <>
        Any sharing of an image or meme must be accompanied by original written
        text from the member posting. All images and memes posted alone, that go
        against guidelines or are off-topic will be declined.
      </>
    ),
  },
  {
    number: "08",
    icon: ShieldCheck,
    title: "Admin & Moderators",
    text: (
      <>
        The admin/moderators are here to closely facilitate activity and uphold
        group forum guidelines. They reserve the right to remove membership,
        posts, and comments due to noncompliance with the rules. Please note that
        moderators are generous volunteers and are not paid professionals. For
        any questions or concerns, all members may contact the Admin, Lainie Ruth,
        through private message or on the “Contact Us” page.
      </>
    ),
  },
];

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

const GUIDELINE_IDS = GUIDELINES.map((item) => `guideline-${item.number}`);

export default function Guidelines() {
  const activeGuideline = useActiveGuideline(GUIDELINE_IDS);

  return (
    <main className="guidelines-page">
      <section className="guidelines-hero" data-nav-theme="light">
        <div className="guidelines-inner guidelines-hero__inner">
          <div className="guidelines-hero__copy">
            <p className="guidelines-eyebrow">Our community culture</p>
            <h1 className="guidelines-title">GUIDELINES</h1>
            <p className="guidelines-intro">
              All members must agree to follow these guidelines and acknowledge
              the disclaimer below:
            </p>
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
            <span className="guidelines-side-card__label">What holds us together</span>
            <h2>
              Trust.{" "}
              <br />
              Privacy.{" "}
              <br />
              Respect.
            </h2>
            <p>
              These guidelines protect our community and help everyone feel
              safe, supported, and able to be honest.
            </p>
            <nav className="guidelines-index" aria-label="Guideline index">
              {GUIDELINES.map((item) => {
                const id = `guideline-${item.number}`;
                return (
                  <a
                    href={`#${id}`}
                    key={item.number}
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
              <span>Community charter</span>
            </div>
            <div className="guidelines-list">
              {GUIDELINES.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <article className="guideline-card" id={`guideline-${item.number}`} key={item.number}>
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
              <span>Please contact our Admin, <strong>Lainie Ruth</strong>, with any questions or concerns.</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="guidelines-disclaimer-section">
        <div className="guidelines-inner">
          <div className="guidelines-disclaimer" data-nav-theme="light">
            <div className="guidelines-disclaimer__icon"><ShieldCheck /></div>
            <p>
              <strong>Disclaimer:</strong> Recovery with The Exit Drug’s private
              forum is a free peer-to-peer support group. This is not a
              professional or medical organization. Anything provided in this
              group forum is for supportive and informational purposes only. We
              are not a substitute for professional or medical care.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
