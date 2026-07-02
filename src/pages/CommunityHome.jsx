import "./CommunityHome.css";

const tabs = ["Forums", "Chat", "Events", "Members"];

const latestDiscussions = [
  "How do you handle cravings after work?",
  "Starting over after a hard weekend",
  "What helped you most in your first month?",
];

const chatRooms = [
  ["General Recovery", "42 online"],
  ["New Members", "15 online"],
  ["Late Night Support", "8 online"],
];

export default function CommunityHome() {
  return (
    <main className="community-home">
      <section className="community-hero">
        <div className="community-hero__overlay" />
        <div className="community-hero__content">
          <p className="community-eyebrow">Community</p>
          <h1>Welcome back.</h1>
          <p>Find support, join conversations, and stay connected today.</p>
        </div>
      </section>

      <nav className="community-tabs" aria-label="Community sections">
        {tabs.map((tab) => (
          <button key={tab} className="community-tab">
            {tab}
          </button>
        ))}
      </nav>

      <section className="community-grid">
        <article className="community-card community-card--large">
          <h2>Latest Discussions</h2>
          {latestDiscussions.map((item) => (
            <div className="discussion-row" key={item}>
              <h3>{item}</h3>
              <p>Recent replies from the community</p>
            </div>
          ))}
        </article>

        <article className="community-card">
          <h2>Active Chat Rooms</h2>
          {chatRooms.map(([room, count]) => (
            <div className="simple-row" key={room}>
              <span>{room}</span>
              <strong>{count}</strong>
            </div>
          ))}
        </article>

        <article className="community-card">
          <h2>People Who Need Support</h2>
          <p className="support-note">
            “Having a rough morning. Could use someone to talk to.”
          </p>
          <button className="support-button">Offer Support</button>
        </article>

        <article className="community-card">
          <h2>Upcoming Events</h2>
          <div className="simple-row">
            <span>Evening Support Meeting</span>
            <strong>7:00 PM</strong>
          </div>
          <div className="simple-row">
            <span>New Member Welcome</span>
            <strong>Tomorrow</strong>
          </div>
        </article>

        <article className="community-card">
          <h2>Recent Milestones</h2>
          <p>🎉 Sarah reached 30 days</p>
          <p>🎉 Mike reached 1 year</p>
          <p>🎉 Jessica reached 100 days</p>
        </article>
      </section>
    </main>
  );
}