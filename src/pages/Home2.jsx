import heroPhoto from "../assets/images/hero-lake.jpg";
// import MarketingNav from "../layout/MarketingNav";
import "./Home2.css";

/**
 * Home2 — a simpler splash page.
 *
 * This page is ONLY the hero section: background photo, headline,
 * subtext, and one button. No scrolling sections below it, no
 * "scroll to explore" hint.
 *
 * It reuses MarketingNav (the same nav bar as the main Home page)
 * but tells it to fade in on load via the `fadeIn` prop, so the
 * photo is visible for a moment before the nav and text appear.
 */
export default function Home2() {
  return (
    // "hero-page" wraps the whole screen so it can be exactly 100vh tall
    <div className="hero-page">
      {/* fadeIn=true makes the nav bar gently appear instead of being
          there instantly on page load */}
      {/* <MarketingNav fadeIn /> */}

      {/* The big background photo of the lake.
          We set it as a CSS background-image (not an <img> tag) so we
          can layer text and a color overlay on top of it easily. */}
      <div
        className="hero-page__photo"
        style={{ backgroundImage: `url(${heroPhoto})` }}
      />

      {/* A semi-transparent dark layer on top of the photo.
          This makes the white text easier to read against busy parts
          of the image (sky, water reflections, etc). */}
      <div className="hero-page__overlay" />

      {/* Everything the visitor actually reads/clicks goes here.
          This sits on top of the photo + overlay because of CSS
          z-index (see Home2.css). */}
      <div className="hero-page__content">
        <h1 className="hero-page__title">You're not alone.</h1>

        <p className="hero-page__subtitle">
          A safe, welcoming community for people exploring cannabis as a
          path to freedom from alcohol, opioids, and other harmful
          substances.
        </p>

        {/* This is a placeholder link for now (href="#").
            Later, swap this for a real route, e.g. to="/register"
            using a React Router <Link> instead of a plain <a>. */}
        <a href="#" className="hero-page__button">
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
        </a>
      </div>
    </div>
  );
}
