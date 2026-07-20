import { Link } from "react-router-dom";
import {
  Ban,
  Heart,
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
    title: "Confidentiality",
    text: (
      <>
        All information shared in the group should remain confidential and is not
        to leave the group. Privacy is of the highest importance. (Familiarize
        yourself with the privacy settings of Facebook Groups. Please understand
        that there is always slight risk when sharing information online.)
      </>
    ),
  },
  {
    number: "02",
    icon: Ban,
    title: "No Illegal Activity",
    text: (
      <>
        You may not use our service for any unlawful purposes. We do not endorse
        going against your current local laws regarding substance use or
        possession. We are not here to tell you how to break or circumvent the
        law or advise you on how to pass a drug test. Posts asking about the
        chances of getting caught or likelihood of success in a criminal act are
        not allowed. Do not post information on how to smuggle, ship, hide,
        manufacture, or distribute illegal substances.
      </>
    ),
  },
  {
    number: "03",
    icon: Heart,
    title: "Acceptance",
    text: (
      <>
        The group accepts members just as they are and remains non-judgmental at
        all times. We remain open-minded and kind to all.
      </>
    ),
  },
  {
    number: "04",
    icon: MessageCircle,
    title: "Stay On Topic",
    text: (
      <>
        We discuss things related only to cannabis, substance
        dependence/addiction and recovery. We refrain from topics that are
        political or religious in nature.
      </>
    ),
  },
  {
    number: "05",
    icon: UsersRound,
    title: "Sharing",
    text: <>Focus on the person sharing and do not offer unsolicited advice.</>,
    callout: (
      <>
        <strong>Meme Sharing Rules:</strong> The definition of a meme is as
        follows: a humorous image, video, piece of text, etc. that is copied
        (often with slight variations). All memes must be within our guidelines
        and on topic.
      </>
    ),
  },
  {
    number: "06",
    icon: MegaphoneOff,
    title: "No Spamming, Advertisements, Trolling",
    text: (
      <>
        Spam, or the repetitive display of the same text again and again, is not
        allowed. Advertising for the purpose of selling, soliciting or promoting
        something is also prohibited. Trolling, defined as a deliberately
        offensive or provocative online posting with the aim of upsetting
        someone or eliciting an angry response, is forbidden.
      </>
    ),
  },
  {
    number: "07",
    icon: ShieldCheck,
    title: "Admins/Moderators",
    text: (
      <>
        The admins/moderators are here to lead the group and facilitate the
        discussion. They reserve the right to remove any post/comment at any
        time. They also reserve the right to deny/block membership due to
        noncompliance with these guidelines. Please respect that the
        admins/moderators are generous volunteers and are not paid
        professionals.
      </>
    ),
  },
];

export default function Guidelines() {
  return (
    <main className="guidelines-page">
      <section className="guidelines-hero">
        <div className="guidelines-inner guidelines-hero__inner">
          <div className="guidelines-hero__copy">
            <p className="guidelines-eyebrow">Our community culture</p>
            <h1 className="guidelines-title">Guidelines</h1>
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
              Trust.
              <br />
              Privacy.
              <br />
              Respect.
            </h2>
            <p>
              These guidelines protect our community and help everyone feel
              safe, supported, and able to be honest.
            </p>
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
                  <article className="guideline-card" key={item.number}>
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
              <span>Please contact our founder, <strong>Ruth</strong>, for any questions, concerns, or kudos.</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="guidelines-disclaimer-section">
        <div className="guidelines-inner">
          <div className="guidelines-disclaimer">
            <div className="guidelines-disclaimer__icon"><ShieldCheck /></div>
            <p>
              <strong>Disclaimer:</strong> Recovery With The Exit Drug is a
              volunteer support group sharing practical information. This is not
              a professional or medical organization. The information provided
              in this group is for informational and educational purposes only
              and is not a substitute for professional care.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
