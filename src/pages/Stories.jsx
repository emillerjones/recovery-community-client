import "./Stories.css";

const featuredStory = {
  title: "I Thought I Needed It to Get Through the Day",
  name: "Anonymous member",
  tag: "Cannabis recovery",
  readTime: "5 minute read",
  quote:
    "I did not wake up one day magically fixed. I just got tired of needing something outside myself to feel okay.",
  paragraphs: [
    "For a long time, I told myself cannabis was the thing keeping me together. I used it after work, before bed, on weekends, after arguments, before hard conversations, and sometimes for no real reason at all except that being sober felt uncomfortable.",
    "The hard part was that it did help at first. That made it easier to ignore the parts of my life that were getting smaller. I stopped calling people back. I stopped making plans. I kept saying I was fine, but most nights I was just waiting until I could use again.",
    "Recovery started quietly for me. No big speech. No dramatic moment. I just posted that I was scared I could not do it. A few people answered like they understood exactly what I meant. That was the first time I felt less alone.",
    "I still have hard days. I still have nights where my brain tries to bargain with me. But now I have somewhere to say that before it turns into a decision I regret. That has made all the difference.",
  ],
};

const stories = [
  {
    title: "The First Honest Post",
    name: "Anonymous",
    tag: "Starting over",
    text: "I typed and deleted my first post three times. I did not know what I was asking for. I just knew I needed someone to know I was struggling.",
  },
  {
    title: "Six Months Felt Impossible",
    name: "Anonymous",
    tag: "Milestones",
    text: "At the beginning, six months sounded fake. I was counting hours. Then days. Then weeks. I still count sometimes, but now it feels like I am counting proof.",
  },
  {
    title: "I Had to Learn My Evenings Again",
    name: "Anonymous",
    tag: "Daily life",
    text: "The hardest part was not quitting. It was figuring out what to do with the time I used to disappear into. I had to rebuild boring little routines that slowly became my life again.",
  },
  {
    title: "A Setback Was Not the End",
    name: "Anonymous",
    tag: "Setbacks",
    text: "I thought one slip meant I had ruined everything. Someone reminded me that recovery is not a scoreboard. I came back the next day instead of staying gone.",
  },
  {
    title: "I Wanted to Be Present Again",
    name: "Anonymous",
    tag: "Family",
    text: "I missed too many conversations while pretending I was relaxed. I wanted to remember evenings with my family instead of drifting through them.",
  },
];

export default function Stories() {
  return (
    <main className="stories-page">
      <section className="stories-hero">
        <div className="stories-inner">
          <p className="stories-eyebrow">Community stories</p>
          <h1>Stories of recovery, honesty, and starting again.</h1>
          <p className="stories-intro">
            These are placeholder stories for now, written to show how this page
            will feel once real community stories are collected and approved.
          </p>
        </div>
      </section>

      <section className="stories-featured-section">
        <div className="stories-inner">
          <article className="stories-featured">
            <div className="stories-featured__meta">
              <span>{featuredStory.tag}</span>
              <span>{featuredStory.readTime}</span>
            </div>

            <h2>{featuredStory.title}</h2>

            <blockquote>“{featuredStory.quote}”</blockquote>

            <div className="stories-featured__body">
              {featuredStory.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <footer>— {featuredStory.name}</footer>
          </article>
        </div>
      </section>

      <section className="stories-list-section">
        <div className="stories-inner">
          <div className="stories-section-head">
            <p className="stories-eyebrow">More voices</p>
            <h2>Different people. Different paths. Same hope.</h2>
          </div>

          <div className="stories-grid">
            {stories.map((story) => (
              <article className="story-card" key={story.title}>
                <span className="story-card__tag">{story.tag}</span>
                <h3>{story.title}</h3>
                <p>“{story.text}”</p>
                <footer>— {story.name}</footer>
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
              In the future, this page can become a home for real member stories,
              shared with permission and reviewed before publication.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}