import { PUBLIC_STORIES, SHAWN_MEMORIAL } from "../data/publicStories";
import { StoriesConceptBody } from "./StoriesConceptBody";
import "./Stories5.css";
import "./Stories5Hover.css";
import "./Stories5Mobile.css";
export default function Stories5(){const dee=PUBLIC_STORIES[0];return <main className="s5"><section className="s5-archive"><div className="s5-light"/><div className="s5-copy"><p>The illuminated archive</p><h1>Stories preserved because they may help someone survive.</h1><span>Original voices. Carefully held. Open to anyone searching for another way.</span></div><div className="s5-table"><a href="#full-dee" className="s5-dee"><img src={dee.photo} alt="Dee"/><span>Public success story · Dee</span><blockquote>“{dee.line}”</blockquote></a><div className="s5-prints">{PUBLIC_STORIES.slice(1).map(s=><a href={`#full-${s.slug}`} key={s.slug}><img src={s.photo} alt=""/><span>{s.name}</span></a>)}</div><a href="#full-shawn" className="s5-shawn"><img src={SHAWN_MEMORIAL.photo} alt="Shawn"/><span>In memoriam · 2017 · Shawn</span></a></div></section><StoriesConceptBody label="Open the archive"/></main>}
