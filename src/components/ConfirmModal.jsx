import "./ConfirmModal.css";

/**
 * A small reusable "Are you sure?" popup.
 *
 * Instead of building a separate modal for "promote this user",
 * "deactivate this user", "delete this user", etc, every one of
 * those actions just passes different text into THIS one component.
 *
 * How to use it:
 *   <ConfirmModal
 *     open={someBooleanState}
 *     title="Promote to Moderator?"
 *     message="Jane Doe will be promoted from Member to Moderator."
 *     confirmLabel="Promote"
 *     onConfirm={() => { ...do the actual change... }}
 *     onCancel={() => setSomeBooleanState(false)}
 *   />
 */
export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  danger = false, // true = red confirm button, for delete-type actions
  onConfirm,
  onCancel,
}) {
  // If "open" is false, render nothing at all.
  if (!open) return null;

  return (
    // Clicking the dark background (outside the white box) cancels,
    // same as clicking the Cancel button.
    <div className="confirm-modal__backdrop" onClick={onCancel}>
      {/* stopPropagation keeps a click INSIDE the white box from
          bubbling up and triggering the backdrop's onClick above */}
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="confirm-modal__title">{title}</h2>
        <p className="confirm-modal__message">{message}</p>

        <div className="confirm-modal__actions">
          <button className="confirm-modal__cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={`confirm-modal__confirm ${danger ? "confirm-modal__confirm--danger" : ""}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
