import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import ProtectedImage from "./ProtectedImage";
import "./ForumPhotoGallery.css";

export default function ForumPhotoGallery({ images = [], token, compact = false, label = "Forum photo" }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const touchStart = useRef(null);

  useEffect(() => {
    if (activeIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event) {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft") setActiveIndex((current) => (current - 1 + images.length) % images.length);
      if (event.key === "ArrowRight") setActiveIndex((current) => (current + 1) % images.length);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, images.length]);

  if (!images.length) return null;
  const visibleImages = compact ? images.slice(0, 3) : images;

  function move(direction) {
    setActiveIndex((current) => (current + direction + images.length) % images.length);
  }

  return (
    <>
      <div className={`forum-photo-gallery count-${Math.min(images.length, 4)} ${compact ? "is-compact" : ""}`}>
        {visibleImages.map((image, index) => (
          <button
            type="button"
            key={image.media_id}
            onClick={compact ? undefined : () => setActiveIndex(index)}
            tabIndex={compact ? -1 : 0}
            aria-label={compact ? undefined : `Open ${label} ${index + 1} of ${images.length}`}
          >
            <ProtectedImage mediaId={image.media_id} token={token} thumbnail alt={`${label} ${index + 1}`} />
            {compact && index === 2 && images.length > 3 && <span>+{images.length - 3}</span>}
          </button>
        ))}
      </div>

      {activeIndex !== null && (
        <div
          className="forum-photo-viewer"
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveIndex(null); }}
          onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }}
          onTouchEnd={(event) => {
            const distance = event.changedTouches[0].clientX - touchStart.current;
            if (Math.abs(distance) > 45) move(distance > 0 ? -1 : 1);
          }}
        >
          <button className="forum-photo-viewer__close" onClick={() => setActiveIndex(null)} aria-label="Close photo viewer"><X /></button>
          {images.length > 1 && <button className="forum-photo-viewer__previous" onClick={() => move(-1)} aria-label="Previous photo"><ChevronLeft /></button>}
          <ProtectedImage mediaId={images[activeIndex].media_id} token={token} alt={`${label} ${activeIndex + 1}`} />
          {images.length > 1 && <button className="forum-photo-viewer__next" onClick={() => move(1)} aria-label="Next photo"><ChevronRight /></button>}
          <span className="forum-photo-viewer__count">{activeIndex + 1} / {images.length}</span>
        </div>
      )}
    </>
  );
}
