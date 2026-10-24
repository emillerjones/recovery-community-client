import { useEffect, useState } from "react";
import "./OurStory.css";

function OurStoryContent({ content }) {
  return (
    <main className="ourstory">
      <section className="ourstory__hero" data-nav-theme="light">
        <p className="ourstory__kicker">{content.hero.kicker}</p>
        <h1>{content.hero.title}</h1>
      </section>

      <section className="ourstory__section ourstory__section--a">
        <div className="ourstory__section-inner">
          <h2>{content.origins.title}</h2>
          <p>{content.origins.paragraph1}</p>
          <p>{content.origins.paragraph2}</p>
          <p>{content.origins.paragraph3}</p>
          <p>{content.origins.paragraph4}</p>
          <p>{content.origins.paragraph5}</p>
          <p>{content.origins.paragraph6}</p>
        </div>
      </section>

      <section className="ourstory__section ourstory__section--b">
        <div className="ourstory__section-inner">
          <h2>{content.beginning.title}</h2>
          <p>{content.beginning.paragraph1}</p>
          <p>{content.beginning.paragraph2}</p>
          <p>{content.beginning.paragraph3}</p>
        </div>
      </section>

      <section className="ourstory__section ourstory__section--a">
        <div className="ourstory__section-inner">
          <h2>{content.community.title}</h2>
          <p>{content.community.paragraph1}</p>
          <p>{content.community.paragraph2}</p>
          <p>{content.community.paragraph3}</p>
        </div>
      </section>

      <section className="ourstory__closing">
        <p className="ourstory__byline">{content.closing.byline}</p>
      </section>
    </main>
  );
}

export default function OurStory() {
  const [content, setContent] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch(import.meta.env.VITE_API + "/api/ourstory", { signal: controller.signal })
      .then(async response => { if (!response.ok) throw new Error("Our Story could not be loaded."); return response.json(); })
      .then(data => setContent(data.content))
      .catch(error => { if (error.name !== "AbortError") setError(error.message); });
    return () => controller.abort();
  }, []);
  if (!content) return <main className="ourstory"><section className="ourstory__hero"><p role={error ? "alert" : "status"}>{error || "Loading Our Story..."}</p>{error && <button type="button" onClick={() => window.location.reload()}>Try again</button>}</section></main>;
  return <OurStoryContent content={content} />;
}
