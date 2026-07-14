import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import "./Resources.css";

/**
 * Resources page.
 *
 * Merges the old site's two separate pages — "Educational Resources"
 * and "Cannabis Friendly Organizations" — into one page with two
 * sections: Learn (articles/studies/videos, regrouped by topic
 * instead of format) and Find Support (the organization directory).
 *
 * Every link from the original pages is preserved. Nothing cut.
 */

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M4 19.5V5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M4 19.5A2.5 2.5 0 006.5 22H20" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function CompassIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M15 9l-2 5-5 2 2-5 5-2z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---------- Learn section data ----------
// Grouped by topic rather than by media format, so it's easier to
// find what's actually relevant to someone, instead of a flat
// alphabetical link dump.

const LEARN_GROUPS = [
  {
    title: "Substitution & Harm Reduction",
    links: [
      { text: `Can We Unlock Marijuana's Potential as an "Exit Drug"?`, url: "http://www.substance.com/can-we-unlock-marijuanas-potential-as-an-exit-drug/8312/" },
      { text: "Considering Marijuana Maintenance: Cannabis as a Substitution Therapy for Alcoholism", url: "http://www.choosehelp.com/topics/harm-reduction/marijuana-cannabis-substitution-alcoholism" },
      { text: `"Marijuana Recovery": The newest option for recovering substance addicts?`, url: "https://www.psychologytoday.com/blog/addiction-beat/201307/marijuana-recovery" },
      { text: "The Likely Cause of Addiction Has Been Discovered, and It Is Not What You Think", url: "http://www.huffingtonpost.com/johann-hari/the-real-cause-of-addicti_b_6506936.html" },
      { text: "The real 'gateway drug' is 100% legal", url: "https://www.washingtonpost.com/news/wonk/wp/2016/01/06/the-real-gateway-drug-thats-everywhere-and-legal/?postshare=9281452192404656&tid=ss_fb-bottom" },
      { text: "What is harm reduction? (Harm Reduction International)", url: "http://www.ihra.net/what-is-harm-reduction" },
      { text: "A safer alternative: Cannabis substitution as harm reduction", url: "http://www.ncbi.nlm.nih.gov/pubmed/25919477?report=abstract" },
      { text: "Can Cannabis Be Considered a Substitute Medication for Alcohol?", url: "http://www.medscape.com/viewarticle/825298" },
      { text: "Cannabis Substitution: Harm Reduction Treatment for Alcoholism and Drug Dependence (Tod H. Mikuriya, MD & Jerry Mandel, PhD)", url: "http://mikuriyamedical.com/about/cw_cansub.html" },
      { text: "Cannabis Substitution: Marijuana Maintenance as Addiction Treatment (Featuring: Amanda Reiman, PhD and Kenneth Anderson, MA)", url: "https://youtu.be/6Nt5ZXtX4Ts", tag: "Video" },
      { text: "Everything We Think We Know About Addiction Is Wrong", url: "https://youtu.be/ao8L-0nSYzg", tag: "Video" },
    ],
  },
  {
    title: "Alcohol-Specific",
    links: [
      { text: "Medical Marijuana and Alcoholism", url: "https://www.whaxy.com/learn/cannabis-treament-for-alcoholism" },
      { text: "Study Shows Marijuana Often Substituted for Alcohol and Other Drugs", url: "http://blog.mpp.org/research/study-shows-marijuana-often-substituted-for-alcohol-and-other-drugs/" },
      { text: "Cannabis as a Substitute for Alcohol: A Harm-Reduction Approach (Tod H. Mikuriya, MD)", url: "http://mikuriyamedical.com/about/cw_alcsub.pdf" },
      { text: "Marijuana Maintenance: Cannabis for Alcohol Dependence (Featuring Kenneth Anderson of HAMS Network)", url: "https://www.youtube.com/watch?v=bXM5YpR0Gf4", tag: "Video" },
      { text: "smoking weed in AA", url: "http://www.bluelight.org/vb/threads/679991-smoking-weed-in-AA", tag: "Forum" },
      { text: `The Alcoholic Fights for His Herb by "Mr. W."`, url: "http://marijuana-uses.com/the-alcoholic-fights-for-his-herb/", tag: "Forum" },
    ],
  },
  {
    title: "Opioid-Specific",
    links: [
      { text: "Can Medical Marijuana Curb Heroin Addiction?", url: "http://www.alternet.org/drugs/medical-marijuana-cure-heroin-epidemic" },
      { text: "Marijuana Use Helped Me Kick My Opiate Addiction — It Could Help Others", url: "http://reset.me/story/marijuana-use-increasingly-accepted-12-step-programs/" },
      { text: "Opioid Addiction Being Treated With Medical Marijuana in Massachusetts", url: "http://www.drugfree.org/join-together/opioid-addiction-treated-medical-marijuana-massachusetts/" },
      { text: "Trading Opiates for Marijuana to Treat Pain", url: "http://www.doctoroz.com/episode/trading-opiates-marijuana-treat-pain", tag: "Video" },
    ],
  },
  {
    title: "Personal Accounts",
    links: [
      { text: "How I Smoked My Way Sober", url: "http://www.buzzfeed.com/katieherzog/how-i-smoked-my-way-sober?utm_term=.qtEr2l0nK#.muQkQ0doe" },
      { text: `Secret "Sober" Pot Smokers`, url: "https://www.thefix.com/content/secret-%E2%80%9Csober%E2%80%9D-pot-users2030" },
    ],
  },
  {
    title: "Research & Safety",
    links: [
      { text: "Here's How Many People Fatally Overdosed on Marijuana Last Year (2015)", url: "http://www.huffingtonpost.com/entry/marijuana-deaths-2014_56814617e4b06fa68880a217" },
      { text: "Study: Patients Substitute Cannabis For Booze, Prescription Drugs", url: "http://norml.org/news/2015/10/08/study-patients-substitute-cannabis-for-booze-prescription-drugs" },
      { text: "The science behind cannabinoids is clear: marijuana helps brain achieve breakthroughs in learning, consciousness and understanding", url: "http://www.naturalnews.com/051164_cannabinoids_mental_capacity_marijuana.html" },
      { text: "Using Medical Marijuana Doesn't Increase Risk of Drug Abuse, Study Concludes", url: "http://www.healthline.com/health-news/using-medical-marijuana-doesnt-increase-risk-of-drug-abuse-051815#1" },
      { text: "Pregnenolone Can Protect the Brain from Cannabis Intoxication", url: "http://science.sciencemag.org/content/343/6166/94" },
      { text: "Use of prescription pain medications among medical cannabis patients: comparisons of pain levels, functioning, and patterns of alcohol and other drug use.", url: "http://www.ncbi.nlm.nih.gov/pubmed/25978826" },
      { text: "Dr. Oz & Dr. Devi Nampiaparampil on Using Marijuana for Pain", url: "http://www.doctoroz.com/episode/trading-opiates-marijuana-treat-pain", tag: "Video" },
    ],
  },
];

// ---------- Find Support section data ----------
// Full verbatim descriptions, quoted and attributed — preserving
// the original framing that these are the organizations' own words,
// not adopted as site copy or an implied endorsement.

const ORGANIZATIONS = [
  {
    name: "HAMS: Harm Reduction for Alcohol",
    type: "Recovery Program",
    url: "http://hams.cc/mm/",
    quote:
      "HAMS is a peer-led and free-of-charge support and informational group for anyone who wants to change their drinking habits for the better. The acronym HAMS stands for Harm reduction, Abstinence, and Moderation Support. HAMS Harm Reduction strategies are defined in the 17 elements of HAMS. HAMS offers support via an online forum, a chat room, an email group, a facebook group, and live meetings. We also offer harm reduction information via the HAMS Book, the articles on this web site, and the HAMS podcast. HAMS supports every positive change. Choose your own goal – safe drinking, reduced drinking, or quitting alcohol altogether. It does not matter how much or how little you drink; if you want to make a change you are welcome here. All HAMS services are offered free-of-charge.",
  },
  {
    name: "High Sobriety",
    type: "Treatment Center in Los Angeles, California",
    url: "https://highsobrietytreatment.com/",
    quote:
      "High Sobriety provides comprehensive cannabis inclusive addiction treatment and harm reduction through an innovative medication assisted program. At High Sobriety, our first and foremost goal is to eliminate the risk of death from drug use. Cocaine, heroin, methamphetamine, pharmaceuticals, and other street drugs all have a lethal dose. Leading the death toll, killing more than all others combined, is alcohol. Cannabis has no known lethal dose. The simple truth is eliminating drugs with a lethal dose and using a drug with no lethal dose is a massive improvement, life improving, and life saving.",
  },
  {
    name: "Blue Door Therapeutics",
    type: "Healthcare Clinic in Scottsdale, Arizona",
    url: "https://bluedoor.org/",
    quote:
      "As a holistic healthcare clinic, we encourage patients to explore all kinds of therapy to help them reduce or eliminate opiates from their lives. These include traditional western medicine, naturopathy, and alternative therapies. Blue Door is the first treatment center in the world to combine the use of cannabis with traditional medicine as an exit strategy for opiate use disorder. Using cannabis to treat opiate withdrawal is not substituting one drug for another. To the contrary, our physicians successfully use cannabis as an exit strategy to treat opiate dependence. If during the initial consultation medical cannabis is identified as a potential treatment, Blue Door will assist the patient in receiving their medical marijuana card and provide a list of recommended dispensaries. Cannabis is not the right answer for all patients, but it shows incredible promise as a key option in treatment plans.",
  },
  {
    name: "Greener Pastures Holisticare",
    type: "Treatment Center & Recovery Program in Portland, Maine",
    url: "https://www.greenerpasturesholisticare.com/ourcenter",
    quote:
      "The Greener Pastures Recovery Program is specifically designed to promote an individualized path to recovery and to embrace and support that journey. We introduce clients to a mindfulness-based life and a plant-based harm-reduction approach to substance use disorder that is rich in health and opportunity, with the promise of self-discovery, love and support. Finding the right path to recovery engages our clients in the purposeful process of healing and rebuilding their lives according to their unique perspective and goals. We work with clients whose needs and vision align with our program philosophy, core beliefs, clinical experience and expertise to help them achieve their personal goals through their individual treatment plan.",
  },
  {
    name: "Integr8Health",
    type: "Health Clinic in Manchester & Falmouth, Maine",
    url: "https://integr8health.com/",
    quote:
      "Our compassionate doctors and nurse practitioners are experts in medical cannabis and are ready to help you get your life back, legally. If you are looking for a holistic approach to chronic pain, cancer, spasticity, nausea, or a variety of other conditions, you have made it to the right place! We provide in-depth visits that allow us to understand your healing journey and offer personalized treatments that get great results. If you are ready for a new way to care for your health, we are here to help. We offer a sliding scale for patients with low incomes. We also offer discounts on supplements and products, free legal advice with an attorney, and health workshops to all our patients.",
  },
];

const RESOURCE_TOPICS = [
  { label: "Harm reduction", target: "resource-substitution", x: 18, y: 25 },
  { label: "Alcohol", target: "resource-alcohol", x: 51, y: 14 },
  { label: "Opioids", target: "resource-opioid", x: 82, y: 30 },
  { label: "Personal accounts", target: "resource-personal", x: 75, y: 72 },
  { label: "Research & safety", target: "resource-research", x: 35, y: 82 },
  { label: "Find support", target: "find-support", x: 13, y: 62 },
];

const RESOURCE_PATHS = [
  "M18 25L51 14L82 30L75 72L35 82L13 62Z",
  "M18 25L35 82M51 14L75 72M13 62L75 72",
];

const GROUP_IDS = {
  "Substitution & Harm Reduction": "resource-substitution",
  "Alcohol-Specific": "resource-alcohol",
  "Opioid-Specific": "resource-opioid",
  "Personal Accounts": "resource-personal",
  "Research & Safety": "resource-research",
};

function TopicMark({ index }) {
  const paths = [
    "M8 63C30 58 34 28 58 20C50 43 64 55 88 58M57 20C57 47 44 67 25 84",
    "M25 12V45C25 62 39 76 57 76S89 62 89 45V12M16 33H98M45 76V91M31 91H71",
    "M9 54C24 22 46 22 58 50S83 79 98 45M20 73C39 54 55 55 75 75",
    "M12 68C24 25 44 16 59 36C72 54 62 73 44 80M59 36C77 22 91 36 86 55",
    "M12 80L31 57L47 66L68 28L96 41M20 19H85M20 27H65",
  ];
  return <svg className="resource-topic-mark" viewBox="0 0 110 100" aria-hidden="true"><path d={paths[index]} /></svg>;
}

export default function Resources() {
  const { onRegister } = useOutletContext();
  const [learnRef, learnVisible] = useReveal();
  const [supportRef, supportVisible] = useReveal();

  return (
    <div className="resources">
      <section className="resources-hero">
        <div className="resources-hero__light" aria-hidden="true" />
        <div className="resources-hero__inner">
          <div className="resources-hero__content">
            <p className="resources-kicker">The recovery field guide</p>
            <h1>Information for finding your own way.</h1>
            <p>Research, lived experience, and outside support—collected carefully so the next useful direction is easier to find.</p>
            <a href="#learn" className="resources-hero__start">Open the field guide <span>↓</span></a>
          </div>
          <div className="resources-map" aria-label="Browse the resource field guide by topic">
            <div className="resources-map__paper" aria-hidden="true" />
            <p className="resources-map__label">Index of paths</p>
            <svg viewBox="0 0 100 100" aria-hidden="true">
              {RESOURCE_PATHS.map((path) => <path d={path} key={path} />)}
            </svg>
            {RESOURCE_TOPICS.map((topic, index) => (
              <a href={`#${topic.target}`} className="resources-map__node" style={{ left: `${topic.x}%`, top: `${topic.y}%`, "--i": index }} key={topic.label}>
                <i aria-hidden="true" /><span>{topic.label}</span>
              </a>
            ))}
            <small>Choose a point to begin</small>
          </div>
        </div>
      </section>

      {/* LEARN */}
      <section className="resources-section" id="learn">
        <div
          className={`resources-section__inner reveal ${learnVisible ? "in" : ""}`}
          ref={learnRef}
        >
          <div className="eyebrow resources-eyebrow">
            <span className="eyebrow__icon eyebrow__icon--book"><BookIcon /></span>
            Learn
          </div>
          <p className="resources-intro">
            A starting point, not a substitute for medical advice. These
            are articles, studies, and videos members have found useful
            over the years.
          </p>

          <div className="resources-starting-points">
            <p>Three places to begin</p>
            {LEARN_GROUPS.slice(0, 3).map((group) => (
              <a href={group.links[0].url} target="_blank" rel="noreferrer" key={group.title}>
                <small>{group.title}</small><strong>{group.links[0].text}</strong><span>↗</span>
              </a>
            ))}
          </div>

          <div className="learn-groups">
            {LEARN_GROUPS.map((group, index) => (
              <article className="learn-group" id={GROUP_IDS[group.title]} key={group.title}>
                <TopicMark index={index} />
                <h3 className="learn-group__title">{group.title}</h3>
                <ul className="learn-group__list">
                  {group.links.map((link) => (
                    <li key={link.text} className="learn-link">
                      <a href={link.url} target="_blank" rel="noreferrer">
                        {link.text}
                      </a>
                      {link.tag && <span className="learn-link__tag">{link.tag}</span>}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FIND SUPPORT */}
      <section className="resources-section resources-section--support" id="find-support">
        <div
          className={`resources-section__inner reveal ${supportVisible ? "in" : ""}`}
          ref={supportRef}
        >
          <div className="eyebrow resources-eyebrow">
            <span className="eyebrow__icon eyebrow__icon--compass"><CompassIcon /></span>
            Find Support
          </div>
          <p className="resources-intro">
            These are independent organizations, not part of Recovery
            With The Exit Drug. We're sharing them because members have
            found them useful — not as a guarantee or medical
            endorsement. Always do your own research.
          </p>

          <div className="org-list">
            {ORGANIZATIONS.map((org) => (
              <div className="org-card" key={org.name}>
                <div className="org-card__header">
                  <h3 className="org-card__name">{org.name}</h3>
                  <span className="org-card__type">{org.type}</span>
                </div>
                <details className="org-card__details">
                  <summary>Read their description</summary>
                  <blockquote className="org-card__quote">“{org.quote}”</blockquote>
                </details>
                <a href={org.url} className="org-card__link" target="_blank" rel="noreferrer">
                  Visit site →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING — quiet, no stat block, matches About's restraint */}
      <section className="resources-cta">
        <p className="resources-cta__text">
          Looking for more than information?
        </p>
        <p className="resources-cta__script">The community is here too.</p>
        <button type="button" onClick={onRegister} className="resources-cta__button">
          Enter the Community
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </section>
    </div>
  );
}
