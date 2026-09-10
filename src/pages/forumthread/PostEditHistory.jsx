import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API;

export default function PostEditHistory({ postId, token }) {
  const [open, setOpen] = useState(false);
  const [revisions, setRevisions] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    fetch(`${API}/api/forum/posts/${postId}/history`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
      cache: "no-store",
    }).then(async (response) => {
      if (!response.ok) throw new Error("Could not load edit history. Close and reopen to retry.");
      return response.json();
    }).then((result) => {
      setError("");
      setRevisions(result);
    }).catch((requestError) => {
      if (requestError.name !== "AbortError") setError(requestError.message);
    });
    return () => controller.abort();
  }, [open, postId, token]);

  return (
    <details className="forum-post-history" onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>Edited · View history</summary>
      {open && <div className="forum-post-history__versions">
        <p>The current version appears below. Earlier wording is shown newest first.</p>
        {error ? <p role="alert">{error}</p> : revisions === null ? <p role="status">Loading history…</p> : revisions.length === 0 ? <p>No earlier versions are available.</p> : revisions.map((revision) => (
          <section key={revision.revision_id}>
            <p>Before the edit by <strong>{revision.editor_username || "Deleted account"}</strong> on <time dateTime={revision.created_at}>{new Date(revision.created_at).toLocaleString()}</time></p>
            <h2>{revision.previous_title}</h2>
            <p className="forum-post-history__body">{revision.previous_body}</p>
          </section>
        ))}
      </div>}
    </details>
  );
}
