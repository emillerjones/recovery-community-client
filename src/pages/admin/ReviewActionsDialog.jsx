import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Trash2 } from "lucide-react";
import "./ReviewActionsDialog.css";

export default function ReviewActionsDialog({ item, kind, canDelete, onClose, onKeep, onDelete }) {
  const dialogRef = useRef(null);
  const lock = useRef(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const scope = kind === "post" ? "the entire thread, including all comments and replies" : `this ${kind} and all replies beneath it`;

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  async function act(action) {
    if (lock.current) return;
    lock.current = true; setPending(true); setError("");
    try { await action(); onClose(); }
    catch (error) {
      setError(error.message || "This action could not be completed. Please try again.");
      lock.current = false; setPending(false);
    }
  }

  return <dialog ref={dialogRef} className="review-actions-dialog" aria-labelledby="review-actions-title"
    onCancel={event => { event.preventDefault(); if (!lock.current) onClose(); }}>
    <h2 id="review-actions-title">{confirmDelete ? "Confirm deletion" : "Review Actions"}</h2>
    {confirmDelete ? <>
      <p>Delete {scope} from the forum?</p>
      <blockquote><strong>{item.author_username}{item.title ? ` — ${item.title}` : ""}</strong><p>{(item.body || "").slice(0, 200)}{item.body?.length > 200 ? "…" : ""}</p></blockquote>
      <p>This removes the content from the forum and the active report queue.</p>
    </> : <>
      <p>Choose what happens to this reported {kind}.</p>
      <section className="review-actions-dialog__option">
        <ShieldCheck size={24} aria-hidden="true" />
        <div><h3>Keep content &amp; clear reports</h3><p>You reviewed this content and decided it can stay. Clears its reports from the review queue. The content remains visible.</p>
          <button type="button" disabled={pending} onClick={() => act(onKeep)}>{pending ? "Saving…" : "Keep content & clear reports"}</button>
        </div>
      </section>
      <section className="review-actions-dialog__option review-actions-dialog__option--delete">
        <Trash2 size={24} aria-hidden="true" />
        <div><h3>Delete content</h3><p>Removes {scope} from the forum. A separate confirmation explains what will be removed.</p>
          <small>Admins and Owners only</small>
          <button type="button" className="review-actions-dialog__delete" disabled={!canDelete || pending} onClick={() => { setError(""); setConfirmDelete(true); }}>Delete content</button>
        </div>
      </section>
    </>}
    {error && <p role="alert" className="review-actions-dialog__error">{error}</p>}
    <footer><small>No private messages are sent automatically.</small>
      <div><button type="button" className="review-actions-dialog__cancel" autoFocus disabled={pending} onClick={onClose}>Cancel</button>
        {confirmDelete && <><button type="button" className="review-actions-dialog__cancel" disabled={pending} onClick={() => { setConfirmDelete(false); setError(""); }}>Back</button>
          <button type="button" className="review-actions-dialog__delete" disabled={pending || !canDelete} onClick={() => act(onDelete)}>{pending ? "Deleting…" : "Confirm deletion"}</button></>}
      </div>
    </footer>
  </dialog>;
}
