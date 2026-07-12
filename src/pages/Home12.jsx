import { useRef } from "react";
import { Link, useOutletContext } from "react-router-dom";
import heroPhoto from "../assets/images/hero-lake.jpg";
import { PUBLIC_STORIES } from "../data/publicStories";
import "./Home12.css";

const FEATURED_STORIES = PUBLIC_STORIES.slice(0, 7);

export default function Home12() {
  const { onRegister } = useOutletContext();
  const reelRef = useRef(null);

  function moveStories(direction) {
    const reel = reelRef.current;
    if (!reel) return;
    const card = reel.querySelector(".home12-story-card");
    reel.scrollBy({
      left: direction * ((card?.offsetWidth || 340) + 18),
      behavior: "smooth",
    });
  }

  return (
    <main className="home12">
      <section className="home12-hero">
        <div className="home12-hero__photo" style={{ backgroundImage: `url(${heroPhoto})` }} />
        <div className="home12-hero__veil" />
        <div className="home12-hero__content">
          <p className="home12-eyebrow home12-eyebrow--light">Recovery With The Exit Drug</p>
          <h1>You are not alone in finding another way.</h1>
          <p className="home12-hero__intro">
            A peer-led community for people exploring cannabis as a path away from
            alcohol, opioids, and other harmful substances.
          </p>
          <div className="home12-hero__actions">
            <button type="button" onClick={onRegister}>Join the community</button>
            <Link to="/stories">Read real stories</Link>
          </div>
        </div>
        <a className="home12-hero__scroll" href="#stories">Real people. Real paths. <span>↓</span></a>
      </section>

      <section className="home12-belief">
        <p className="home12-eyebrow">Our philosophy</p>
        <h2>Recovery looks different for everyone—and that’s okay.</h2>
        <p>
          There is no single right way forward. This community makes room for honest
          questions, lived experience, practical support, and the choices that help
          each person build a healthier life.
        </p>
      </section>

      <section className="home12-stories" id="stories">
        <div className="home12-stories__head">
          <div>
            <p className="home12-eyebrow">Public success stories</p>
            <h2>People who found their way through.</h2>
            <p className="home12-stories__intro">
              These stories are shared publicly with permission. Every path is personal;
              every voice is its own.
            </p>
          </div>
          <div className="home12-reel-controls" aria-label="Story navigation">
            <button type="button" onClick={() => moveStories(-1)} aria-label="Previous story">←</button>
            <button type="button" onClick={() => moveStories(1)} aria-label="Next story">→</button>
          </div>
        </div>

        <div className="home12-story-reel" ref={reelRef}>
          {FEATURED_STORIES.map((story) => (
            <Link className="home12-story-card" to={`/stories#${story.slug}`} key={story.slug}>
              <div className="home12-story-card__photo-wrap">
                <img src={story.photo} alt={`Portrait of ${story.name}`} />
                <span>{story.path}</span>
              </div>
              <div className="home12-story-card__body">
                <p className="home12-story-card__quote">“{story.line}”</p>
                <p className="home12-story-card__preview">{story.preview}</p>
                <div><strong>{story.name}</strong><span>Read their story →</span></div>
              </div>
            </Link>
          ))}
          <Link className="home12-story-card home12-story-card--all" to="/stories">
            <span>More voices</span>
            <h3>Every story deserves the space to be heard.</h3>
            <p>Meet more people from the community and read their public stories.</p>
            <strong>View all stories →</strong>
          </Link>
        </div>
        <p className="home12-swipe-hint">Swipe to explore <span>→</span></p>
      </section>

      <section className="home12-community">
        <div className="home12-community__copy">
          <p className="home12-eyebrow home12-eyebrow--light">Beyond the public stories</p>
          <h2>A private place for the rest of the conversation.</h2>
          <p>
            Members can ask questions, share milestones, talk through difficult days,
            and tell stories they do not want posted publicly. The community is built
            for support—not performance.
          </p>
          <button type="button" onClick={onRegister}>Come inside</button>
        </div>
        <div className="home12-community__notes" aria-label="Community preview">
          <article><span>Milestone</span><p>“A month ago, today felt impossible.”</p></article>
          <article><span>Support</span><p>“You don’t have to explain everything here.”</p></article>
          <article><span>Private reflection</span><p>Some things can stay yours.</p></article>
        </div>
      </section>

      <section className="home12-final">
        <p className="home12-eyebrow">Whenever you’re ready</p>
        <h2>You do not need a perfect plan to begin.</h2>
        <p>Come as you are. Read for a while, or join the conversation.</p>
        <div>
          <button type="button" onClick={onRegister}>Join the community</button>
          <Link to="/stories">Start with a story</Link>
        </div>
      </section>
    </main>
  );
}
