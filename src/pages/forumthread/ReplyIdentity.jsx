import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, UserRoundPen } from "lucide-react";
import MemberAvatar from "../../components/MemberAvatar";

// The draft belongs to the composer, so changing identity never clears its text.
export default function ReplyIdentity({ user, identity, onChange, disabled }) {
  const id = useId();
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const nameRef = useRef(null);
  const pendingFocus = useRef(null);
  const [position, setPosition] = useState(null);
  const open = Boolean(position) && !disabled;
  const name = identity.importing ? identity.name.trim() || "Another name" : user.username;

  useLayoutEffect(() => {
    if (!pendingFocus.current) return;
    const target = pendingFocus.current === "name" ? nameRef.current : triggerRef.current;
    pendingFocus.current = null;
    target?.focus({ preventScroll: true });
  });

  function openMenu() {
    const rect = triggerRef.current.getBoundingClientRect();
    const width = Math.min(280, window.innerWidth - 24);
    setPosition({ width, left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)),
      ...(rect.top > 144 ? { bottom: window.innerHeight - rect.top + 8 } : { top: rect.bottom + 8 }) });
  }

  function choose(importing) {
    pendingFocus.current = importing ? "name" : "trigger";
    onChange({ ...identity, importing });
    setPosition(null);
  }

  useEffect(() => {
    if (!open) return;
    const items = menuRef.current.querySelectorAll('[role="menuitemradio"]');
    items[identity.importing ? 1 : 0]?.focus({ preventScroll: true });
    function dismiss(event) {
      if (!menuRef.current?.contains(event.target) && !triggerRef.current?.contains(event.target)) setPosition(null);
    }
    function reposition() { setPosition(null); }
    document.addEventListener("pointerdown", dismiss);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open, identity.importing]);

  function menuKeys(event) {
    const items = [...menuRef.current.querySelectorAll('[role="menuitemradio"]')];
    const index = items.indexOf(document.activeElement);
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
      items[next].focus({ preventScroll: true });
    } else if (event.key === "Escape") {
      event.preventDefault(); setPosition(null); triggerRef.current.focus({ preventScroll: true });
    } else if (event.key === "Tab") {
      // Return to the trigger before allowing the browser's normal tab order.
      setPosition(null); triggerRef.current.focus({ preventScroll: true });
    }
  }

  return (
    <div className="forum-reply-identity">
      <label htmlFor={`${id}-choice`}>Replying as</label>
      <button type="button" id={`${id}-choice`} ref={triggerRef} className="forum-reply-identity__select"
        aria-haspopup="menu" aria-expanded={open} aria-controls={open ? `${id}-menu` : undefined}
        disabled={disabled} onClick={() => open ? setPosition(null) : openMenu()}
        onKeyDown={event => { if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); openMenu(); } }}>
        <MemberAvatar username={name} avatarUrl={identity.importing ? null : user.avatar_url} size={26} />
        <span className="forum-reply-identity__current">{name}</span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>
      {open && createPortal(
        <div id={`${id}-menu`} className="forum-reply-identity-menu" role="menu" aria-label="Reply identity"
          ref={menuRef} style={position} onKeyDown={menuKeys}>
          <button type="button" role="menuitemradio" aria-checked={!identity.importing} onClick={() => choose(false)}>
            <MemberAvatar username={user.username} avatarUrl={user.avatar_url} size={30} />
            <span><strong>Myself</strong><small>{user.username}</small></span>
            {!identity.importing && <Check size={17} aria-hidden="true" />}
          </button>
          <button type="button" role="menuitemradio" aria-checked={identity.importing} onClick={() => choose(true)}>
            <span className="forum-reply-identity-menu__icon"><UserRoundPen size={18} aria-hidden="true" /></span>
            <span><strong>Another name</strong><small>Choose a display name</small></span>
            {identity.importing && <Check size={17} aria-hidden="true" />}
          </button>
        </div>, document.body
      )}
      {identity.importing && (
        <label className="forum-reply-identity__name" htmlFor={`${id}-name`}>
          <span>Display name</span>
          <input ref={nameRef} id={`${id}-name`} type="text" value={identity.name} required maxLength={80}
            autoComplete="off" placeholder="e.g. Participant A" disabled={disabled}
            onChange={event => onChange({ ...identity, name: event.target.value })} />
        </label>
      )}
    </div>
  );
}
