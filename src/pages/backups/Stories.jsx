import "./Stories.css";

const stories = [
  {
    name: "Anonymous",
    text: "Recovery does not mean the damage never existed; it means the damage no longer controls our lives.",
  },
  // add more stories here — text only for now
];

export default function Stories() {
  return (
    <div className="stories">
      <h1 className="stories__title">Success Stories</h1>
      <p className="stories__intro">
        Real stories from our community, shared in their own words.
      </p>

      <div className="stories__list">
        {stories.map((s, i) => (
          <blockquote key={i} className="stories__card">
            <p className="stories__text">"{s.text}"</p>
            <footer className="stories__name">— {s.name}</footer>
          </blockquote>
        ))}
      </div>
    </div>
  );
}
