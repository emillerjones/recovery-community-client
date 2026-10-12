import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useStaffChat } from "../contexts/StaffChatContext";
import "./NotificationBell.css";

export default function StaffBell() {
  const { chatUnread, announcementsUnread, openStaffChat } = useStaffChat();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const totalUnread = chatUnread + announcementsUnread;

  useEffect(() => {
    if (!open) return;
    function onClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div className="notif-bell" ref={containerRef}>
      <button
        className="notif-bell__button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Staff activity"
      >
        <ShieldCheck size={19} />
        {totalUnread > 0 && <span className="notif-bell__badge">{totalUnread > 9 ? "9+" : totalUnread}</span>}
      </button>

      {open && (
        <div className="notif-bell__panel" role="menu">
          <div className="notif-bell__header">
            <p>Staff</p>
          </div>
          <ul>
            <li>
              <button
                className={chatUnread > 0 ? "is-unread" : ""}
                onClick={() => { setOpen(false); openStaffChat(); }}
              >
                <span>Staff Chat</span>
                <time>{chatUnread > 0 ? `${chatUnread} new` : "No new messages"}</time>
              </button>
            </li>
            <li>
              <button
                className={announcementsUnread > 0 ? "is-unread" : ""}
                onClick={() => { setOpen(false); navigate("/forum?view=staff"); }}
              >
                <span>Staff Announcements</span>
                <time>{announcementsUnread > 0 ? `${announcementsUnread} new` : "No new posts"}</time>
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
