import { useId, useState } from "react";
import { ImagePlus, Link, Trash2 } from "lucide-react";

const TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "image/avif"]);

export default function DiscountLogoInput({ value, selection, onFile, onLink, onRemove }) {
  const id = useId();
  const [showLink, setShowLink] = useState(false);
  const [error, setError] = useState("");
  const preview = selection?.previewUrl || value;

  function choose(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Choose a logo that is 5 MB or smaller."); return; }
    if (!TYPES.has(file.type) && !/\.(jpe?g|png|webp|heic|heif|avif)$/i.test(file.name)) {
      setError("Use a JPG, PNG, WebP, HEIC, or AVIF image."); return;
    }
    setError("");
    setShowLink(false);
    onFile(file);
  }

  return (
    <div className="discount-logo">
      <span className="discount-logo__label">Brand logo</span>
      <div className="discount-logo__row">
        <div className="discount-logo__preview">
          <span>Logo</span>
          {preview && <img key={preview} src={preview} alt="Logo preview" onError={event => { event.currentTarget.hidden = true; }} />}
        </div>
        <div className="discount-logo__choices">
          <label className="discount-logo__upload" htmlFor={`${id}-file`}><ImagePlus size={16} /> {preview ? "Replace logo" : "Upload logo"}</label>
          <input className="discount-logo__file" id={`${id}-file`} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/avif" onChange={choose} />
          {preview && <button type="button" className="discount-logo__remove" onClick={() => { setError(""); onRemove(); }}><Trash2 size={14} /> Remove logo</button>}
        </div>
      </div>
      <small>{selection ? `${selection.file.name} · Ready to upload when you save this brand.` : "Up to 5 MB. PNG works well for logos with transparent backgrounds."}</small>
      <button type="button" className="discount-logo__link-toggle" aria-expanded={showLink} aria-controls={`${id}-link`} onClick={() => setShowLink(current => !current)}><Link size={14} /> {showLink ? "Hide image link" : "Use an image link instead"}</button>
      {showLink && <label id={`${id}-link`}>Logo image URL<input type="url" value={selection ? "" : value || ""} maxLength={2000} placeholder="https://…" onChange={event => { setError(""); onLink(event.target.value || null); }} /></label>}
      {error && <p className="discount-logo__error" role="alert">{error}</p>}
    </div>
  );
}
