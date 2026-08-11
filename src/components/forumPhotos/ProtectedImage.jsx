import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API;

export default function ProtectedImage({ mediaId, token, thumbnail = false, alt = "", ...props }) {
  const requestKey = `${mediaId}:${thumbnail}`;
  const [imageState, setImageState] = useState({ key: "", source: "", failed: false });

  useEffect(() => {
    if (!mediaId || !token) return;
    const controller = new AbortController();
    let objectUrl = "";
    fetch(`${API}/api/media/images/${mediaId}/content${thumbnail ? "?variant=thumbnail" : ""}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Photo unavailable");
        return response.blob();
      })
      .then((blob) => {
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(blob);
        setImageState({ key: requestKey, source: objectUrl, failed: false });
      })
      .catch((error) => {
        if (error.name !== "AbortError") setImageState({ key: requestKey, source: "", failed: true });
      });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [mediaId, requestKey, thumbnail, token]);

  if (imageState.key === requestKey && imageState.failed) return <span className="protected-image-state">Photo unavailable</span>;
  if (imageState.key !== requestKey || !imageState.source) return <span className="protected-image-state is-loading" aria-label="Loading photo" />;
  return <img src={imageState.source} alt={alt} {...props} />;
}
