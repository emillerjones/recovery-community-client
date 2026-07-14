import { useEffect, useState } from "react";
import "./StoryReader.css";

export default function StoryReader({ story, returnLabel, onClose }) {
  const [leaving, setLeaving] = useState(false);

  function leave() {
    setLeaving(true);
    window.setTimeout(onClose, 420);
  }

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event) { if (event.key === "Escape") leave(); }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  });

  return (
    <section className={`sr-room ${leaving ? "is-leaving" : ""}`} role="dialog" aria-modal="true" aria-label={`${story.name}'s complete story`}>
      <div className="sr-room__image"><img src={story.photo} alt={`Portrait of ${story.name}`} /></div>
      <div className="sr-room__words">
        <p>{story.path}</p>
        <h1>{story.name}</h1>
        <blockquote>{story.line}</blockquote>
        {story.contentNote && <aside>Content note: {story.contentNote}</aside>}
        <div>{story.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        <strong>— {story.name}</strong>
      </div>
      <button type="button" className="sr-room__return" onClick={leave}><span aria-hidden="true">←</span> {returnLabel}</button>
    </section>
  );
}
