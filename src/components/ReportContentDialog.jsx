import { useEffect, useRef, useState } from "react";
import "./ReportContentDialog.css";

export default function ReportContentDialog({ onClose, onSubmit }) {
  const dialogRef = useRef(null);
  const savingRef = useRef(false);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (savingRef.current || !reason.trim()) return;
    savingRef.current = true;
    setSaving(true);
    setError("");
    try {
      await onSubmit(reason.trim());
      onClose();
    } catch (error) {
      setError(error.message || "Your report could not be sent. Please try again.");
      savingRef.current = false;
      setSaving(false);
    }
  }

  return <dialog ref={dialogRef} className="report-content-dialog" aria-labelledby="report-content-title"
    onCancel={event => { event.preventDefault(); if (!savingRef.current) onClose(); }}>
    <form onSubmit={submit}>
      <h2 id="report-content-title">Report to Admin</h2>
      <p id="report-content-privacy">Your report is visible to staff, not other members. Reporting does not hide or remove this content.</p>
      <label htmlFor="report-content-reason">Why are you reporting this?</label>
      <textarea id="report-content-reason" autoFocus required maxLength={1000} rows={5}
        aria-describedby="report-content-privacy report-content-count" disabled={saving}
        value={reason} onChange={event => setReason(event.target.value)} />
      <small id="report-content-count">{reason.length}/1,000 characters</small>
      {error && <p role="alert">{error}</p>}
      <div className="report-content-dialog__actions">
        <button type="button" disabled={saving} onClick={onClose}>Cancel</button>
        <button type="submit" disabled={saving || !reason.trim()}>{saving ? "Sending…" : "Submit report"}</button>
      </div>
    </form>
  </dialog>;
}
