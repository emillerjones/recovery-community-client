import { useEffect, useId, useRef, useState } from "react";
import { Camera, ImagePlus, RefreshCw, X } from "lucide-react";
import ProtectedImage from "./ProtectedImage";
import "./PhotoUploader.css";

const API = import.meta.env.VITE_API;
const MAX_PHOTOS = 4;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "image/avif",
]);

function clientId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
}

function uploadImage(file, token, onProgress) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", `${API}/api/media/images`);
    request.setRequestHeader("Authorization", `Bearer ${token}`);
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    });
    request.addEventListener("load", () => {
      let result;
      try { result = JSON.parse(request.responseText); } catch { result = {}; }
      if (request.status >= 200 && request.status < 300) resolve(result);
      else reject(new Error(result.message || "Could not upload that photo."));
    });
    request.addEventListener("error", () => reject(new Error("The upload was interrupted.")));
    const form = new FormData();
    form.append("image", file);
    request.send(form);
  });
}

export default function PhotoUploader({ photos, onChange, token, compact = false }) {
  const inputId = useId();
  const latestPhotos = useRef(photos);
  const previousPhotos = useRef(photos);
  const [selectionError, setSelectionError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    latestPhotos.current = photos;
    const currentIds = new Set(photos.map((photo) => photo.client_id || photo.media_id));
    previousPhotos.current.forEach((photo) => {
      if (!currentIds.has(photo.client_id || photo.media_id) && photo.previewUrl) {
        URL.revokeObjectURL(photo.previewUrl);
      }
    });
    previousPhotos.current = photos;
  }, [photos]);

  useEffect(() => () => {
    latestPhotos.current.forEach((photo) => {
      if (photo.previewUrl) URL.revokeObjectURL(photo.previewUrl);
    });
  }, []);

  function updatePhoto(id, changes) {
    onChange((current) => current.map((photo) => (
      photo.client_id === id ? { ...photo, ...changes } : photo
    )));
  }

  async function startUpload(photo) {
    updatePhoto(photo.client_id, { status: "uploading", progress: 0, error: "" });
    try {
      const result = await uploadImage(photo.file, token, (progress) => (
        updatePhoto(photo.client_id, { progress })
      ));
      updatePhoto(photo.client_id, { ...result, status: "ready", progress: 100 });
    } catch (error) {
      updatePhoto(photo.client_id, { status: "error", error: error.message });
    }
  }

  function addFiles(fileList) {
    const selected = [...fileList];
    setSelectionError("");
    const available = MAX_PHOTOS - photos.length;
    if (selected.length > available) {
      setSelectionError(`Choose up to ${MAX_PHOTOS} photos total.`);
    }

    selected.slice(0, available).forEach((file) => {
      const extensionLooksValid = /\.(jpe?g|png|webp|heic|heif|avif)$/i.test(file.name);
      if ((!ACCEPTED_TYPES.has(file.type) && !extensionLooksValid) || file.size > MAX_BYTES) {
        setSelectionError(file.size > MAX_BYTES
          ? `${file.name} is larger than 5 MB.`
          : `${file.name} is not a supported photo.`);
        return;
      }
      const photo = {
        client_id: clientId(),
        file,
        previewUrl: URL.createObjectURL(file),
        status: "uploading",
        progress: 0,
      };
      onChange((current) => [...current, photo]);
      startUpload(photo);
    });
  }

  function chooseFiles(event) {
    addFiles(event.target.files);
    event.target.value = "";
  }

  function handleDrag(event) {
    event.preventDefault();
    event.stopPropagation();
    if (photos.length < MAX_PHOTOS) setDragActive(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!event.currentTarget.contains(event.relatedTarget)) setDragActive(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    if (photos.length < MAX_PHOTOS) addFiles(event.dataTransfer.files);
  }

  async function removePhoto(photo) {
    updatePhoto(photo.client_id, { status: "removing" });
    if (photo.media_id) {
      const response = await fetch(`${API}/api/media/images/${photo.media_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        updatePhoto(photo.client_id, { status: "error", error: "Could not remove this photo yet." });
        return;
      }
    }
    if (photo.previewUrl) URL.revokeObjectURL(photo.previewUrl);
    onChange((current) => current.filter((item) => item.client_id !== photo.client_id));
  }

  return (
    <div
      className={`photo-uploader ${compact ? "is-compact" : ""} ${dragActive ? "is-dragging" : ""}`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="photo-uploader__toolbar">
        <label htmlFor={inputId} className={photos.length >= MAX_PHOTOS ? "is-disabled" : ""}>
          {compact ? <Camera size={18} /> : <ImagePlus size={18} />}
          <span>{compact ? "Photo" : photos.length ? "Add more photos" : "Add photos"}</span>
        </label>
        {!compact && <small>{photos.length}/{MAX_PHOTOS} · JPG, PNG, WebP or phone photo · 5 MB each · drag and drop</small>}
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/avif"
          multiple
          disabled={photos.length >= MAX_PHOTOS}
          onChange={chooseFiles}
        />
      </div>

      {dragActive && <div className="photo-uploader__drop-message">Drop photos here</div>}

      {selectionError && <p className="photo-uploader__error" role="alert">{selectionError}</p>}
      {photos.length > 0 && (
        <div className="photo-uploader__previews" aria-label="Selected photos">
          {photos.map((photo) => (
            <div className={`photo-uploader__preview is-${photo.status}`} key={photo.client_id || photo.media_id}>
              {photo.previewUrl ? (
                <img src={photo.previewUrl} alt="Selected upload preview" />
              ) : (
                <ProtectedImage mediaId={photo.media_id} token={token} thumbnail alt="Selected upload preview" />
              )}
              {photo.status === "uploading" && (
                <span className="photo-uploader__progress"><i style={{ width: `${photo.progress || 5}%` }} /></span>
              )}
              {photo.status === "error" && (
                <button type="button" className="photo-uploader__retry" onClick={() => startUpload(photo)}>
                  <RefreshCw size={14} /> Try again
                </button>
              )}
              <button
                type="button"
                className="photo-uploader__remove"
                onClick={() => removePhoto(photo)}
                disabled={photo.status === "removing"}
                aria-label="Remove photo"
              ><X size={15} /></button>
              {photo.error && <span className="photo-uploader__message">{photo.error}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
