import "./Stories.css";
import storyPhoto from "../assets/images/hero-lake.jpg";

const featuredStory = {
  title: "I Thought I Needed It to Get Through the Day",
  tag: "Cannabis recovery",
  readTime: "5 min read",
  excerpt:
    "For a long time, I told myself cannabis was the thing keeping me together. I used it after work, before bed, on weekends, after arguments, and sometimes for no real reason at all except that being sober felt uncomfortable.",
};

const stories = [
  {
    title: "The First Honest Post",
    tag: "Starting over",
    readTime: "4 min read",
    text: "I typed and deleted my first post three times. I did not know what I was asking for...",
  },
  {
    title: "Six Months Felt Impossible",
    tag: "Milestones",
    readTime: "4 min read",
    text: "At the beginning, six months sounded fake. I was counting hours...",
  },
  {
    title: "I Had to Learn My Evenings Again",
    tag: "Daily life",
    readTime: "5 min read",
    text: "The hardest part was not quitting. It was figuring out what to do with the time...",
  },
  {
    title: "A Setback Was Not the End",
    tag: "Setbacks",
    readTime: "4 min read",
    text: "I thought one slip meant I had ruined everything. I came back the next day...",
  },
  {
    title: "I Wanted to Be Present Again",
    tag: "Family",
    readTime: "4 min read",
    text: "I missed too many conversations while pretending I was relaxed...",
  },
];

export default function Stories() {
  return (
    <main className="stories-page">
      <section className="stories-hero">
        <div className="stories-inner stories-hero__grid">
          <div>
            <p className="stories-eyebrow">Community stories</p>
            <h1>Stories of recovery, honesty, and starting again.</h1>
            <p className="stories-intro">
              Every journey is different. These placeholder stories show how
              this page will feel once real community stories are collected,
              approved, and shared with permission.
            </p>
          </div>

          <blockquote className="stories-hero-quote">
            <span>“</span>
              The fire will fade, but embers remain,
              Return to the bonfire, and rekindle the flame . . .
            <span>”</span>
          </blockquote>
        </div>
      </section>

      <section className="stories-featured-section">
        <div className="stories-inner">
          <article className="stories-featured">
            <div
              className="stories-featured__image"
              style={{ backgroundImage: `url(${storyPhoto})` }}
              aria-hidden="true"
            />

            <div className="stories-featured__content">
              <div className="stories-featured__meta">
                <span>{featuredStory.tag}</span>
                <span>{featuredStory.readTime}</span>
              </div>

              <h2>{featuredStory.title}</h2>

              <p>{featuredStory.excerpt}</p>

              <a href="/stories" className="stories-read-link">
                Read the full story →
              </a>
            </div>
          </article>
        </div>
      </section>

      <section className="stories-list-section">
        <div className="stories-inner">
          <div className="stories-section-head">
            <p className="stories-eyebrow">More stories from our community</p>
            <h2>Different people. Different paths. Same hope.</h2>
          </div>

          <div className="stories-grid">
            {stories.map((story) => (
              <article className="story-card" key={story.title}>
                <span className="story-card__icon">○</span>
                <span className="story-card__tag">{story.tag}</span>
                <h3>{story.title}</h3>
                <p>{story.text}</p>
                <footer>{story.readTime} →</footer>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="stories-note-section">
        <div className="stories-inner">
          <div className="stories-note">
            <h2>Your story may help someone feel less alone.</h2>
            <p>
              In the future, this page will be a home for real member stories,
              shared with permission and reviewed before publication.
            </p>
            <button type="button">Share Your Story</button>
          </div>
        </div>
      </section>
    </main>
  );
}