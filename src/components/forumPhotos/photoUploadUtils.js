const API = import.meta.env.VITE_API;

export async function discardPendingPhotos(photos, token) {
  await Promise.allSettled((photos || [])
    .filter((photo) => photo.media_id)
    .map((photo) => fetch(`${API}/api/media/images/${photo.media_id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })));
}

export function readyMediaIds(photos) {
  return (photos || []).filter((photo) => photo.status === "ready").map((photo) => photo.media_id);
}

export function photosReady(photos) {
  return (photos || []).every((photo) => photo.status === "ready");
}
