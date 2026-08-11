import { useEffect, useId, useRef, useState } from "react";
import { ImagePlus, Upload, X } from "lucide-react";
import "./AvatarPhotoModal.css";

const API = import.meta.env.VITE_API;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "image/avif"]);

function drawCrop(canvas, image, zoom, horizontal, vertical) {
  if (!canvas || !image) return;
  const size = Math.min(image.naturalWidth, image.naturalHeight) / zoom;
  const maxHorizontal = Math.max(0, (image.naturalWidth - size) / 2);
  const maxVertical = Math.max(0, (image.naturalHeight - size) / 2);
  const centerX = image.naturalWidth / 2 + (horizontal / 100) * maxHorizontal;
  const centerY = image.naturalHeight / 2 + (vertical / 100) * maxVertical;
  const sourceX = Math.max(0, Math.min(image.naturalWidth - size, centerX - size / 2));
  const sourceY = Math.max(0, Math.min(image.naturalHeight - size, centerY - size / 2));
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, sourceX, sourceY, size, size, 0, 0, canvas.width, canvas.height);
}

function canvasBlob(canvas) {
  return new Promise((resolve, reject) => canvas.toBlob(
    (blob) => blob ? resolve(blob) : reject(new Error("Could not prepare that photo.")),
    "image/webp",
    0.9
  ));
}

export default function AvatarPhotoModal({ token, onClose, onSaved }) {
  const inputId = useId();
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [zoom, setZoom] = useState(1);
  const [horizontal, setHorizontal] = useState(0);
  const [vertical, setVertical] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
  useEffect(() => { drawCrop(canvasRef.current, imageRef.current, zoom, horizontal, vertical); }, [zoom, horizontal, vertical, previewUrl]);
  useEffect(() => {
    function closeOnEscape(event) { if (event.key === "Escape" && !saving) onClose(); }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, saving]);

  function selectFile(file) {
    if (!file) return;
    const extensionLooksValid = /\.(jpe?g|png|webp|heic|heif|avif)$/i.test(file.name);
    if ((!ACCEPTED_TYPES.has(file.type) && !extensionLooksValid) || file.size > MAX_BYTES) {
      setError(file.size > MAX_BYTES ? "Choose a photo smaller than 5 MB." : "Choose a JPG, PNG, WebP, or phone photo.");
      return;
    }
    setError("");
    setZoom(1);
    setHorizontal(0);
    setVertical(0);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const nextUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      imageRef.current = image;
      setPreviewUrl(nextUrl);
      window.requestAnimationFrame(() => drawCrop(canvasRef.current, image, 1, 0, 0));
    };
    image.onerror = () => { URL.revokeObjectURL(nextUrl); setError("That photo could not be opened."); };
    image.src = nextUrl;
  }

  async function savePhoto() {
    if (!imageRef.current || !canvasRef.current) return;
    setSaving(true);
    setError("");
    let pendingMediaId = null;
    try {
      const blob = await canvasBlob(canvasRef.current);
      const form = new FormData();
      form.append("image", blob, "profile-photo.webp");
      const upload = await fetch(`${API}/api/media/images`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
      const uploaded = await upload.json();
      if (!upload.ok) throw new Error(uploaded.message || "Your photo could not be uploaded.");
      pendingMediaId = uploaded.media_id;
      const attach = await fetch(`${API}/api/media/images/${pendingMediaId}/profile-avatar`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
      const profile = await attach.json();
      if (!attach.ok) throw new Error(profile.message || "Your profile photo could not be saved.");
      onSaved(profile);
    } catch (requestError) {
      if (pendingMediaId) fetch(`${API}/api/media/images/${pendingMediaId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragActive(false);
    selectFile(event.dataTransfer.files?.[0]);
  }

  return (
    <div className="avatar-photo-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}>
      <section className="avatar-photo-modal" role="dialog" aria-modal="true" aria-labelledby="avatar-photo-title">
        <header><div><span>Profile photo</span><h2 id="avatar-photo-title">Make it feel like you.</h2><p>Your photo is visible only inside the member community.</p></div><button type="button" onClick={onClose} disabled={saving} aria-label="Close photo editor"><X /></button></header>
        {!previewUrl ? (
          <div className={`avatar-photo-dropzone ${dragActive ? "is-dragging" : ""}`} onDragEnter={(event) => { event.preventDefault(); setDragActive(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDragActive(false); }} onDrop={handleDrop}>
            <ImagePlus size={34} /><strong>Drop a photo here</strong><span>or choose one from your device</span>
            <label htmlFor={inputId}>Choose photo</label>
            <input id={inputId} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/avif" onChange={(event) => selectFile(event.target.files?.[0])} />
            <small>JPG, PNG, WebP or phone photo · 5 MB maximum</small>
          </div>
        ) : (
          <div className="avatar-photo-editor">
            <div className="avatar-photo-preview"><canvas ref={canvasRef} width="512" height="512" /></div>
            <div className="avatar-photo-controls">
              <label><span>Zoom</span><input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /></label>
              <label><span>Move left or right</span><input type="range" min="-100" max="100" value={horizontal} onChange={(event) => setHorizontal(Number(event.target.value))} /></label>
              <label><span>Move up or down</span><input type="range" min="-100" max="100" value={vertical} onChange={(event) => setVertical(Number(event.target.value))} /></label>
              <button type="button" className="avatar-photo-change" onClick={() => { setPreviewUrl(""); imageRef.current = null; }}>Choose a different photo</button>
            </div>
          </div>
        )}
        {error && <p className="avatar-photo-error" role="alert">{error}</p>}
        <footer><button type="button" onClick={onClose} disabled={saving}>Cancel</button><button type="button" className="avatar-photo-save" disabled={!previewUrl || saving} onClick={savePhoto}><Upload size={17} />{saving ? "Saving photo…" : "Save profile photo"}</button></footer>
      </section>
    </div>
  );
}
