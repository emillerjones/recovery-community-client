import "./Guidelines.css";

const GUIDELINES = [
  {
    number: "01",
    icon: "🔒",
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
    icon: "🚫",
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
    icon: "♡",
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
    icon: "💬",
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
    icon: "👥",
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
    icon: "📣",
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
    icon: "🛡️",
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
        <div className="guidelines-inner">
          <p className="guidelines-eyebrow">Our community culture</p>
          <h1 className="guidelines-title">Guidelines</h1>
          <p className="guidelines-intro">
            All members must agree to follow these guidelines and acknowledge
            the disclaimer below:
          </p>
        </div>
      </section>

      <section className="guidelines-body">
        <div className="guidelines-inner guidelines-layout">
          <aside className="guidelines-side-card">
            <div className="guidelines-side-card__icon">🛡️</div>
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

          <div className="guidelines-list">
            {GUIDELINES.map((item) => (
              <article className="guideline-card" key={item.number}>
                <div className="guideline-card__meta">
                  <span className="guideline-card__number">{item.number}</span>
                  <span className="guideline-card__icon">{item.icon}</span>
                </div>

                <div className="guideline-card__content">
                  <p>
                    <strong>{item.title}:</strong> {item.text}
                  </p>

                  {item.callout && (
                    <div className="guideline-card__callout">
                      {item.callout}
                    </div>
                  )}
                </div>
              </article>
            ))}

            <div className="guidelines-contact-card">
              Please contact our founder, <strong>Ruth</strong>, for any
              questions, concerns, or kudos.
            </div>
          </div>
        </div>
      </section>

      <section className="guidelines-disclaimer-section">
        <div className="guidelines-inner">
          <div className="guidelines-disclaimer">
            <div className="guidelines-disclaimer__icon">🛡️</div>
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