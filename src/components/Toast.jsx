import { useState, useCallback } from "react";
import "./Toast.css";

/**
 * A small "Success!" message that appears in the corner of the
 * screen and disappears on its own after a couple seconds.
 *
 * useToast() gives you back two things:
 *   - toast: the current toast data (or null if none is showing)
 *   - showToast(message): call this to display a new toast
 *
 * Usage in a page:
 *   const { toast, showToast } = useToast();
 *   ...
 *   showToast("User promoted to Moderator");
 *   ...
 *   return (
 *     <>
 *       ...your page...
 *       <Toast toast={toast} />
 *     </>
 *   );
 */
export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message) => {
    setToast({ message, id: Date.now() });

    // Auto-hide after 3 seconds
    setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  return { toast, showToast };
}

export function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div className="toast" key={toast.id}>
      {toast.message}
    </div>
  );
}
