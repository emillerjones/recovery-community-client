import "./TechniqueNote.css";

export default function TechniqueNote({ number, title, how, watch }) {
  return (
    <aside className="technique-note" data-nav-theme="light" aria-label={`Design technique: ${title}`}>
      <p className="technique-note__eyebrow">Design study {number}</p>
      <h2>{title}</h2>
      <dl>
        <div>
          <dt>How it works</dt>
          <dd>{how}</dd>
        </div>
        <div>
          <dt>What to watch for</dt>
          <dd>{watch}</dd>
        </div>
      </dl>
    </aside>
  );
}
