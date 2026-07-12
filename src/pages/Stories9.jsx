import { useRef, useState } from "react";
import { Flame } from "lucide-react";
import { PUBLIC_STORIES, SHAWN_MEMORIAL } from "../data/publicStories";
import StoryReader from "./StoryReader";
import ShawnMemorial from "./ShawnMemorial";
import "./Stories2.css";
import "./Stories9Redux.css";
import "./Stories9Minimal.css";

const ORBIT_STORIES = PUBLIC_STORIES.map((story, index) => ({
  ...story,
  angle: [8, 44, 80, 116, 152, 188, 224, 260, 296, 332][index],
  radius: [255, 305, 270, 315, 280, 310, 250, 313, 273, 300][index],
  speed: 76,
}));

function StoryFire({ warmth, flare, fireRef }) {
  return (
    <div className="s2-fire-anchor" ref={fireRef}>
    <div
      className={`s2-fire ${warmth ? "s2-fire--fed" : ""} ${flare ? "s2-fire--flare" : ""}`}
      style={{
        position: "relative",
        left: 0,
        top: 0,
        translate: "none",
        "--fire-growth": 1 + Math.min(warmth, 4) * 0.08,
        "--fire-brightness": 1 + Math.min(warmth, 4) * 0.08,
        "--outer-growth": `${Math.min(warmth, 4) * 7}px`,
        "--middle-growth": `${Math.min(warmth, 4) * 6}px`,
      }}
      aria-label="A community fire surrounded by real recovery stories"
    >
      <span className="s2-fire__aura" />
      <span className="s2-fire__ghost" aria-hidden="true"><img src={SHAWN_MEMORIAL.photo} alt="" /></span>
      <span className="s2-fire__flame s2-fire__flame--outer" />
      <span className="s2-fire__flame s2-fire__flame--middle" />
      <span className="s2-fire__flame s2-fire__flame--inner" />
      <span className="s2-fire__coal s2-fire__coal--one" />
      <span className="s2-fire__coal s2-fire__coal--two" />
      <span className="s2-fire__log s2-fire__log--one" />
      <span className="s2-fire__log s2-fire__log--two" />
      {[0, 1, 2, 3, 4].map((spark) => <span className={`s2-fire__spark s2-fire__spark--${spark + 1}`} key={spark} />)}
      {flare && <span className="s9-impact-sparks" aria-hidden="true">{[...Array(12)].map((_, index) => <i key={index} style={{ "--spark-number": index }} />)}</span>}
      <a className="s2-fire__memorial" href="#stories9-shawn">
        <span><small>In loving memory</small><strong>Shawn · Remembered {SHAWN_MEMORIAL.year}</strong></span>
      </a>
    </div>
    </div>
  );
}

export default function Stories9() {
  const [active, setActive] = useState(null);
  const [quickStory, setQuickStory] = useState("");
  const [visitorStories, setVisitorStories] = useState([]);
  const [tossing, setTossing] = useState(false);
  const [flare, setFlare] = useState(false);
  const [flyingLog, setFlyingLog] = useState(null);
  const fireRef = useRef(null);
  const tossButtonRef = useRef(null);

  function tossLog(event) {
    event.preventDefault();
    const text = quickStory.trim();
    if (!text || tossing) return;
    const index = visitorStories.length;
    const buttonBox = tossButtonRef.current?.getBoundingClientRect();
    const fireBox = fireRef.current?.getBoundingClientRect();
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const flightTime = reduceMotion ? 80 : 800;
    const impactTime = reduceMotion ? 80 : 300;

    if (buttonBox && fireBox) {
      const startX = buttonBox.left + buttonBox.width * 0.5;
      const startY = buttonBox.top + buttonBox.height * 0.5;
      const endX = fireBox.left + fireBox.width * 0.5;
      const endY = fireBox.top + fireBox.height * 0.57;
      setFlyingLog({
        startX,
        startY,
        endX: endX - startX,
        endY: endY - startY,
        midX: (endX - startX) * 0.52,
        midY: (endY - startY) * 0.42 - 105,
      });
    }
    setTossing(true);
    window.setTimeout(() => {
      setFlyingLog(null);
      setQuickStory("");
      setFlare(true);
      window.setTimeout(() => {
        setVisitorStories((stories) => [...stories, {
          id: `${Date.now()}-${index}`,
          text,
          angle: (22 + index * 67) % 360,
          radius: 260 + (index % 2) * 42,
          speed: 60 + (index % 3) * 7,
        }]);
        setTossing(false);
        window.setTimeout(() => setFlare(false), 700);
      }, impactTime);
    }, flightTime);
  }

  return (
    <main className="s2-page s9-redux">
      <section className="s2-gathering">
        <div className="s2-gathering__mist" aria-hidden="true" />
        <div className="s2-gathering__embers" aria-hidden="true">
          {[...Array(9)].map((_, index) => <span key={index} className={`s2-ember-drift s2-ember-drift--${index + 1}`} />)}
        </div>
        <div className="s2-gathering__rings" aria-hidden="true" />
        <StoryFire warmth={visitorStories.length} flare={flare} fireRef={fireRef} />

        <p className="s2-mobile-instruction"><i />Tap a portrait to read their story<i /></p>

        {flyingLog && (
          <span
            className="s9-flying-log"
            aria-hidden="true"
            style={{
              "--start-x": `${flyingLog.startX}px`,
              "--start-y": `${flyingLog.startY}px`,
              "--mid-x": `${flyingLog.midX}px`,
              "--mid-y": `${flyingLog.midY}px`,
              "--end-x": `${flyingLog.endX}px`,
              "--end-y": `${flyingLog.endY}px`,
            }}
          ><i /><i /><i /></span>
        )}

        {ORBIT_STORIES.map((story, index) => (
          <div className="s2-orbit" key={story.slug} style={{ "--angle": `${story.angle}deg`, "--radius": `${story.radius}px`, "--speed": `${story.speed}s`, "--arrival": `${0.72 + index * 0.1}s` }}>
            <button className="s2-orbit__card s9-redux__story-button" type="button" onClick={() => setActive({ story, memorial: false })} aria-label={`Open ${story.name}'s complete story`}>
              <img src={story.photo} alt="" />
              <span><strong>{story.name}</strong><small>“{story.line}”</small></span>
            </button>
          </div>
        ))}

        {visitorStories.map((story) => (
          <div className="s2-orbit s2-orbit--visitor s9-new-light" key={story.id} style={{ "--angle": `${story.angle}deg`, "--radius": `${story.radius}px`, "--speed": `${story.speed}s`, "--arrival": "0s" }}>
            <div className="s2-orbit__card s2-orbit__card--visitor"><span className="s2-orbit__ember" aria-hidden="true" /><span><strong>Your light</strong><small>“{story.text}”</small></span></div>
          </div>
        ))}

        <div className="s2-gathering__copy">
          <p>Public success stories</p>
          <h1>Every voice adds light.</h1>
          <span>Choose a person around the fire to enter their complete story.</span>
        </div>

        <div className={`s2-feed ${tossing ? "s2-feed--tossing" : ""}`}>
          <div className="s2-feed__header"><span className="s2-feed__icon" aria-hidden="true"><Flame size={15} strokeWidth={2} /></span><div><strong>Add a light</strong></div></div>
          <form className="s2-feed__form s9-offering" onSubmit={tossLog}>
            <label className="s9-offering__polaroid" htmlFor="quick-story-9">
              <span className="s9-offering__photo" aria-hidden="true"><i /><Flame size={15} strokeWidth={1.8} /></span>
              <input id="quick-story-9" type="text" value={quickStory} maxLength={48} placeholder="Something you’re proud of…" aria-label="Something you are proud of" onChange={(event) => setQuickStory(event.target.value)} />
            </label>
            <div className="s9-offering__kindling">
              <button ref={tossButtonRef} type="submit" disabled={!quickStory.trim() || tossing}>Add <Flame size={13} strokeWidth={2.2} aria-hidden="true" /></button>
            </div>
          </form>
        </div>
        <a className="s2-gathering__cue" href="#stories9-shawn">Shawn’s memorial <span>↓</span></a>
      </section>

      <ShawnMemorial id="stories9-shawn" compact />
      {active && <StoryReader {...active} returnLabel="Return to the bonfire" onClose={() => setActive(null)} />}
    </main>
  );
}
