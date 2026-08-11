import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API;

export default function ProtectedImage({ mediaId, token, thumbnail = false, variant, fallback, alt = "", ...props }) {
  const requestedVariant = variant || (thumbnail ? "thumbnail" : "full");
  const requestKey = `${mediaId}:${requestedVariant}`;
  const [imageState, setImageState] = useState({ key: "", source: "", failed: false });

  useEffect(() => {
    if (!mediaId || !token) return;
    const controller = new AbortController();
    let objectUrl = "";
    const variantQuery = requestedVariant === "full" ? "" : `?variant=${requestedVariant}`;
    fetch(`${API}/api/media/images/${mediaId}/content${variantQuery}`, {
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
  }, [mediaId, requestKey, requestedVariant, token]);

  if (imageState.key === requestKey && imageState.failed) return <span className="protected-image-state">{fallback || "Photo unavailable"}</span>;
  if (imageState.key !== requestKey || !imageState.source) return <span className="protected-image-state is-loading" aria-label="Loading photo" />;
  return <img src={imageState.source} alt={alt} {...props} />;
}
