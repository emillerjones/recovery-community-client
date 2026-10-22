import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

export default function UserRoleMenu({ username, value, options, onChange }) {
  const id = useId();
  const trigger = useRef(null);
  const menu = useRef(null);
  const [position, setPosition] = useState(null);
  const open = Boolean(position);

  function show() {
    const rect = trigger.current.getBoundingClientRect();
    const width = Math.min(240, window.innerWidth - 24);
    const height = options.length * 46 + 16;
    setPosition({ width, left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)),
      ...(window.innerHeight - rect.bottom < height + 16 && rect.top > height + 16
        ? { bottom: window.innerHeight - rect.top + 6 } : { top: rect.bottom + 6 }) });
  }

  function close(restoreFocus = false) {
    setPosition(null);
    if (restoreFocus) trigger.current?.focus({ preventScroll: true });
  }

  useEffect(() => {
    if (!open) return;
    const items = menu.current.querySelectorAll('[role="menuitemradio"]');
    items[Math.max(0, options.findIndex(option => option.role_id === value))]?.focus({ preventScroll: true });
    const dismiss = event => {
      if (!menu.current?.contains(event.target) && !trigger.current?.contains(event.target)) setPosition(null);
    };
    const hide = event => { if (!menu.current?.contains(event.target)) setPosition(null); };
    document.addEventListener("pointerdown", dismiss);
    window.addEventListener("resize", hide);
    window.addEventListener("scroll", hide, true);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("resize", hide);
      window.removeEventListener("scroll", hide, true);
    };
  }, [open, options, value]);

  function keys(event) {
    const items = [...menu.current.querySelectorAll('[role="menuitemradio"]')];
    const index = items.indexOf(document.activeElement);
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1
        : (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
      items[next]?.focus({ preventScroll: true });
    } else if (event.key === "Escape") { event.preventDefault(); close(true); }
    else if (event.key === "Tab") close(true);
  }

  return <>
    <button type="button" ref={trigger} className="role-select" aria-label={`Role for ${username}`}
      aria-haspopup="menu" aria-expanded={open} aria-controls={open ? id : undefined}
      onClick={() => open ? close() : show()}
      onKeyDown={event => { if (["ArrowDown", "ArrowUp"].includes(event.key)) { event.preventDefault(); show(); } }}>
      <span>{options.find(option => option.role_id === value)?.label || "Select role"}</span>
      <ChevronDown size={16} aria-hidden="true" />
    </button>
    {open && createPortal(<div id={id} ref={menu} className="user-role-menu" role="menu"
      aria-label={`Role for ${username}`} style={position} onKeyDown={keys}>
      {options.map(option => <button type="button" role="menuitemradio" key={option.role_id}
        aria-checked={option.role_id === value} tabIndex={-1}
        onClick={() => { close(true); if (option.role_id !== value) onChange(option.role_id); }}>
        <span>{option.label}</span>{option.role_id === value && <Check size={17} aria-hidden="true" />}
      </button>)}
    </div>, document.body)}
  </>;
}
