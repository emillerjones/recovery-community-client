import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import "./Resources2.css";

/**
 * Resources2 — demonstrates a bento-grid layout: the five topic areas
 * below are tiled at different sizes (one large "feature" tile, a wide
 * tile, and three regular tiles) using CSS Grid template areas, rather
 * than a uniform list or equal-size card grid. Tapping a tile expands
 * its reading list in place.
 */

const LEARN_GROUPS = [
  {
    title: "Substitution & Harm Reduction",
    area: "a",
    links: [
      { text: `Can We Unlock Marijuana's Potential as an "Exit Drug"?`, url: "http://www.substance.com/can-we-unlock-marijuanas-potential-as-an-exit-drug/8312/" },
      { text: "Considering Marijuana Maintenance: Cannabis as a Substitution Therapy for Alcoholism", url: "http://www.choosehelp.com/topics/harm-reduction/marijuana-cannabis-substitution-alcoholism" },
      { text: `"Marijuana Recovery": The newest option for recovering substance addicts?`, url: "https://www.psychologytoday.com/blog/addiction-beat/201307/marijuana-recovery" },
      { text: "The Likely Cause of Addiction Has Been Discovered, and It Is Not What You Think", url: "http://www.huffingtonpost.com/johann-hari/the-real-cause-of-addicti_b_6506936.html" },
      { text: "The real 'gateway drug' is 100% legal", url: "https://www.washingtonpost.com/news/wonk/wp/2016/01/06/the-real-gateway-drug-thats-everywhere-and-legal/" },
      { text: "What is harm reduction? (Harm Reduction International)", url: "http://www.ihra.net/what-is-harm-reduction" },
      { text: "A safer alternative: Cannabis substitution as harm reduction", url: "http://www.ncbi.nlm.nih.gov/pubmed/25919477?report=abstract" },
      { text: "Can Cannabis Be Considered a Substitute Medication for Alcohol?", url: "http://www.medscape.com/viewarticle/825298" },
      { text: "Cannabis Substitution: Harm Reduction Treatment for Alcoholism and Drug Dependence", url: "http://mikuriyamedical.com/about/cw_cansub.html" },
      { text: "Cannabis Substitution: Marijuana Maintenance as Addiction Treatment", url: "https://youtu.be/6Nt5ZXtX4Ts", tag: "Video" },
      { text: "Everything We Think We Know About Addiction Is Wrong", url: "https://youtu.be/ao8L-0nSYzg", tag: "Video" },
    ],
  },
  {
    title: "Research & Safety",
    area: "b",
    links: [
      { text: "Here's How Many People Fatally Overdosed on Marijuana Last Year (2015)", url: "http://www.huffingtonpost.com/entry/marijuana-deaths-2014_56814617e4b06fa68880a217" },
      { text: "Study: Patients Substitute Cannabis For Booze, Prescription Drugs", url: "http://norml.org/news/2015/10/08/study-patients-substitute-cannabis-for-booze-prescription-drugs" },
      { text: "Using Medical Marijuana Doesn't Increase Risk of Drug Abuse, Study Concludes", url: "http://www.healthline.com/health-news/using-medical-marijuana-doesnt-increase-risk-of-drug-abuse-051815" },
      { text: "Pregnenolone Can Protect the Brain from Cannabis Intoxication", url: "http://science.sciencemag.org/content/343/6166/94" },
      { text: "Use of prescription pain medications among medical cannabis patients", url: "http://www.ncbi.nlm.nih.gov/pubmed/25978826" },
      { text: "Dr. Oz & Dr. Devi Nampiaparampil on Using Marijuana for Pain", url: "http://www.doctoroz.com/episode/trading-opiates-marijuana-treat-pain", tag: "Video" },
    ],
  },
  {
    title: "Alcohol-Specific",
    area: "c",
    links: [
      { text: "Medical Marijuana and Alcoholism", url: "https://www.whaxy.com/learn/cannabis-treament-for-alcoholism" },
      { text: "Study Shows Marijuana Often Substituted for Alcohol and Other Drugs", url: "http://blog.mpp.org/research/study-shows-marijuana-often-substituted-for-alcohol-and-other-drugs/" },
      { text: "Cannabis as a Substitute for Alcohol: A Harm-Reduction Approach", url: "http://mikuriyamedical.com/about/cw_alcsub.pdf" },
      { text: "Marijuana Maintenance: Cannabis for Alcohol Dependence", url: "https://www.youtube.com/watch?v=bXM5YpR0Gf4", tag: "Video" },
    ],
  },
  {
    title: "Opioid-Specific",
    area: "d",
    links: [
      { text: "Can Medical Marijuana Curb Heroin Addiction?", url: "http://www.alternet.org/drugs/medical-marijuana-cure-heroin-epidemic" },
      { text: "Marijuana Use Helped Me Kick My Opiate Addiction", url: "http://reset.me/story/marijuana-use-increasingly-accepted-12-step-programs/" },
      { text: "Opioid Addiction Being Treated With Medical Marijuana in Massachusetts", url: "http://www.drugfree.org/join-together/opioid-addiction-treated-medical-marijuana-massachusetts/" },
    ],
  },
  {
    title: "Personal Accounts",
    area: "e",
    links: [
      { text: "How I Smoked My Way Sober", url: "http://www.buzzfeed.com/katieherzog/how-i-smoked-my-way-sober" },
      { text: `Secret "Sober" Pot Smokers`, url: "https://www.thefix.com/content/secret-%E2%80%9Csober%E2%80%9D-pot-users2030" },
    ],
  },
];

const ORGANIZATIONS = [
  { name: "HAMS: Harm Reduction for Alcohol", type: "Recovery Program", url: "http://hams.cc/mm/" },
  { name: "High Sobriety", type: "Treatment Center · Los Angeles, CA", url: "https://highsobrietytreatment.com/" },
  { name: "Blue Door Therapeutics", type: "Healthcare Clinic · Scottsdale, AZ", url: "https://bluedoor.org/" },
  { name: "Greener Pastures Holisticare", type: "Treatment Center · Portland, ME", url: "https://www.greenerpasturesholisticare.com/ourcenter" },
  { name: "Integr8Health", type: "Health Clinic · Manchester & Falmouth, ME", url: "https://integr8health.com/" },
];

export default function Resources2() {
  const { onRegister } = useOutletContext();
  const [openTile, setOpenTile] = useState(LEARN_GROUPS[0].title);

  return (
    <div className="resources2">
      <section className="resources2-hero">
        <p className="resources2-kicker">The recovery field guide</p>
        <h1>Information for finding your own way.</h1>
        <p>Research, lived experience, and outside support — collected carefully so the next useful direction is easier to find.</p>

        <aside className="resources2-note" aria-label="Design technique: bento grid">
          <p className="resources2-note__label">Design technique</p>
          <h3>Bento-grid layout</h3>
          <p>
            The five topics below aren't a uniform card grid — they're
            sized by how much is inside each one, one large "feature"
            tile and four smaller ones sharing the remaining space, using
            CSS Grid template areas. Tap a tile to open its reading list.
          </p>
        </aside>
      </section>

      <section className="resources2-bento-section">
        <div className="resources2-bento">
          {LEARN_GROUPS.map((group) => (
            <button
              type="button"
              key={group.title}
              className={`resources2-tile resources2-tile--${group.area} ${openTile === group.title ? "is-open" : ""}`}
              style={{ gridArea: group.area }}
              onClick={() => setOpenTile(group.title)}
            >
              <span className="resources2-tile__count">{group.links.length}</span>
              <h3>{group.title}</h3>
              <span className="resources2-tile__cue">{openTile === group.title ? "Showing below ↓" : "View list →"}</span>
            </button>
          ))}
        </div>

        {LEARN_GROUPS.filter((group) => group.title === openTile).map((group) => (
          <div className="resources2-list" key={group.title}>
            <h2>{group.title}</h2>
            <ul>
              {group.links.map((link) => (
                <li key={link.text}>
                  <a href={link.url} target="_blank" rel="noreferrer">{link.text}</a>
                  {link.tag && <span className="resources2-tag">{link.tag}</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="resources2-support">
        <p className="resources2-eyebrow">Find Support</p>
        <p className="resources2-intro">
          These are independent organizations, not part of Recovery With
          The Exit Drug — shared because members have found them useful,
          not as a guarantee or medical endorsement.
        </p>
        <div className="resources2-org-list">
          {ORGANIZATIONS.map((org) => (
            <a className="resources2-org" href={org.url} target="_blank" rel="noreferrer" key={org.name}>
              <h3>{org.name}</h3>
              <span>{org.type}</span>
              <strong>Visit site →</strong>
            </a>
          ))}
        </div>
      </section>

      <section className="resources2-cta">
        <p>Looking for more than information?</p>
        <button type="button" onClick={onRegister}>Enter the Community</button>
      </section>
    </div>
  );
}
