import { SHAWN_MEMORIAL } from "../data/publicStories";
import "./ShawnMemorial.css";

export default function ShawnMemorial({ id, compact = false }) {
  const memorialParagraphs = SHAWN_MEMORIAL.paragraphs.filter(
    (paragraph) => !paragraph.toLowerCase().startsWith("rest in peace")
  );

  return (
    <section className={`smem ${compact ? "smem--compact" : ""}`} id={id}>
      <div className="smem__year" aria-hidden="true">2017</div>
      <svg className="smem__arch" viewBox="0 0 420 520" aria-hidden="true">
        <path d="M52 470V210C52 92 368 92 368 210V470" />
        <path d="M82 470V218C82 124 338 124 338 218V470" />
        <path d="M210 62v38M126 84l19 33M294 84l-19 33M76 143l33 19M344 143l-33 19" />
      </svg>
      <div className="smem__inner">
        <div className="smem__visual">
          <div className="smem__portrait">
            <img src={SHAWN_MEMORIAL.photo} alt="Shawn standing on the remains of his home after the Joplin tornado" />
            <span>In memoriam · 2017</span>
          </div>
        </div>
        <div className="smem__words">
          <p>First member · Founding light</p>
          <h2>Shawn</h2>
          <blockquote>{SHAWN_MEMORIAL.line}</blockquote>
          <div>{memorialParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          <strong>Rest in peace, Shawn.</strong>
          <div className="smem__dedication" aria-label="A life remembered, a light that remains"><i />A life remembered <span>◆</span> A light that remains<i /></div>
        </div>
        {/* <div className="smem__plaque">
          <p className="smem__plaque-line1">In memory</p>
          <p className="smem__plaque-line2">of</p>
          <p className="smem__plaque-body">Shawn — who fought a longer, harder road<br />than most will ever know,<br />and still left light behind<br />for those who came after.</p>
          <div className="smem__plaque-rule" aria-hidden="true" />
          <p className="smem__plaque-motto">One day at a time</p>
          <p className="smem__plaque-translation">(the road that brought eleven of us home)</p>
        </div> */}
      </div>
    </section>
  );
}
